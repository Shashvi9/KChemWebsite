from concurrent.futures import ThreadPoolExecutor

import pytest
from starlette.requests import Request

from app.core.admin_login_throttle import (
    AdminLoginThrottlePolicy,
    extract_admin_login_client_ip,
    normalize_admin_login_username,
)


def test_fresh_bucket_is_allowed() -> None:
    policy = AdminLoginThrottlePolicy(1, 300, 900)

    decision = policy.check_allowed("203.0.113.10", "Admin", now_monotonic=10.0)

    assert decision.allowed is True
    assert decision.retry_after_seconds == 0
    assert decision.failure_count == 0


def test_first_failure_uses_base_delay() -> None:
    policy = AdminLoginThrottlePolicy(1, 300, 900)

    decision = policy.record_failure("203.0.113.10", "Admin", now_monotonic=10.0)

    assert decision.allowed is False
    assert decision.retry_after_seconds == 1
    assert decision.failure_count == 1


def test_repeated_failures_double_until_capped() -> None:
    policy = AdminLoginThrottlePolicy(2, 5, 900)
    retry_delays = []

    for offset in range(4):
        decision = policy.record_failure("203.0.113.10", "Admin", now_monotonic=10.0 + offset)
        retry_delays.append(decision.retry_after_seconds)

    assert retry_delays == [2, 4, 5, 5]


def test_retention_expiry_resets_bucket() -> None:
    policy = AdminLoginThrottlePolicy(1, 300, 5)
    policy.record_failure("203.0.113.10", "Admin", now_monotonic=10.0)

    decision = policy.check_allowed("203.0.113.10", "Admin", now_monotonic=15.0)

    assert decision.allowed is True
    assert decision.retry_after_seconds == 0
    assert decision.failure_count == 0


def test_record_success_clears_bucket() -> None:
    policy = AdminLoginThrottlePolicy(1, 300, 900)
    policy.record_failure("203.0.113.10", "Admin", now_monotonic=10.0)

    policy.record_success("203.0.113.10", "Admin")

    decision = policy.check_allowed("203.0.113.10", "Admin", now_monotonic=10.5)
    assert decision.allowed is True
    assert decision.failure_count == 0


def test_independent_keys_do_not_interfere() -> None:
    policy = AdminLoginThrottlePolicy(1, 300, 900)
    policy.record_failure("203.0.113.10", "Admin", now_monotonic=10.0)
    other_ip_decision = policy.check_allowed("203.0.113.11", "Admin", now_monotonic=10.0)
    other_username_decision = policy.check_allowed("203.0.113.10", "Other", now_monotonic=10.0)

    assert other_ip_decision.allowed is True
    assert other_ip_decision.failure_count == 0
    assert other_username_decision.allowed is True
    assert other_username_decision.failure_count == 0


def test_username_normalization_shares_bucket() -> None:
    policy = AdminLoginThrottlePolicy(1, 300, 900)
    policy.record_failure("203.0.113.10", " Admin ", now_monotonic=10.0)

    decision = policy.check_allowed("203.0.113.10", "admin", now_monotonic=10.0)

    assert normalize_admin_login_username(" Admin ") == "admin"
    assert decision.allowed is False
    assert decision.failure_count == 1


def test_concurrent_failure_recording_keeps_all_increments() -> None:
    policy = AdminLoginThrottlePolicy(1, 300, 900)

    def record_attempt(offset: int) -> None:
        policy.record_failure("203.0.113.10", "Admin", now_monotonic=10.0 + offset)

    with ThreadPoolExecutor(max_workers=8) as executor:
        list(executor.map(record_attempt, range(8)))

    decision = policy.check_allowed("203.0.113.10", "Admin", now_monotonic=18.0)

    assert decision.failure_count == 8
    assert decision.retry_after_seconds >= 0


def test_max_bucket_limit_evicts_oldest_inactive_bucket() -> None:
    policy = AdminLoginThrottlePolicy(1, 300, 900, max_buckets=2)
    policy.record_failure("203.0.113.10", "Admin", now_monotonic=10.0)
    policy.record_failure("203.0.113.11", "Admin", now_monotonic=11.0)

    refreshed = policy.check_allowed("203.0.113.10", "Admin", now_monotonic=11.5)
    new_bucket = policy.record_failure("203.0.113.12", "Admin", now_monotonic=12.0)
    evicted = policy.check_allowed("203.0.113.11", "Admin", now_monotonic=12.0)

    assert refreshed.failure_count == 1
    assert new_bucket.failure_count == 1
    assert evicted.allowed is True
    assert evicted.failure_count == 0


def test_invalid_delay_configuration_is_rejected() -> None:
    with pytest.raises(ValueError, match="max_delay_seconds"):
        AdminLoginThrottlePolicy(5, 4, 900)


def test_client_ip_falls_back_to_unknown() -> None:
    request = Request({"type": "http", "headers": [], "client": None})

    assert extract_admin_login_client_ip(request) == "unknown"


def test_client_ip_uses_socket_peer_address() -> None:
    request = Request(
        {
            "type": "http",
            "headers": [(b"x-forwarded-for", b"198.51.100.8")],
            "client": ("203.0.113.10", 443),
        }
    )

    assert extract_admin_login_client_ip(request) == "203.0.113.10"
