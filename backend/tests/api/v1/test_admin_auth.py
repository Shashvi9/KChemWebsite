import pytest
from fastapi import HTTPException
from starlette.requests import Request

from app.api.v1.endpoints import admin_auth
from app.core import auth
from app.core.admin_login_throttle import AdminLoginThrottlePolicy


def _make_request(client_host: str | None) -> Request:
    scope = {"type": "http", "headers": []}
    if client_host is None:
        scope["client"] = None
    else:
        scope["client"] = (client_host, 12345)
    return Request(scope)


@pytest.fixture
def isolated_admin_login(monkeypatch: pytest.MonkeyPatch) -> AdminLoginThrottlePolicy:
    policy = AdminLoginThrottlePolicy(1, 8, 900)
    monkeypatch.setattr(admin_auth, "get_admin_login_throttle_policy", lambda: policy)
    monkeypatch.setattr(auth, "ADMIN_USERNAME", "admin")
    monkeypatch.setattr(auth, "ADMIN_PASSWORD", "correct-password")
    return policy


def test_invalid_username_and_password_return_same_401(
    isolated_admin_login: AdminLoginThrottlePolicy,
) -> None:
    request = _make_request("203.0.113.10")

    with pytest.raises(HTTPException) as wrong_username:
        admin_auth.login(request, admin_auth.LoginRequest(username="wrong", password="correct-password"))
    with pytest.raises(HTTPException) as wrong_password:
        admin_auth.login(request, admin_auth.LoginRequest(username="admin", password="wrong-password"))

    assert wrong_username.value.status_code == 401
    assert wrong_password.value.status_code == 401
    assert wrong_username.value.detail == "Invalid credentials"
    assert wrong_password.value.detail == "Invalid credentials"
    assert isolated_admin_login.check_allowed("203.0.113.10", "admin").failure_count == 1
    assert isolated_admin_login.check_allowed("203.0.113.10", "wrong").failure_count == 1


def test_repeated_failures_eventually_return_429_with_retry_after(
    isolated_admin_login: AdminLoginThrottlePolicy,
) -> None:
    request = _make_request("203.0.113.10")
    body = admin_auth.LoginRequest(username="admin", password="wrong-password")

    with pytest.raises(HTTPException) as first_failure:
        admin_auth.login(request, body)
    with pytest.raises(HTTPException) as throttled:
        admin_auth.login(request, body)

    assert first_failure.value.status_code == 401
    assert throttled.value.status_code == 429
    assert throttled.value.headers == {"Retry-After": "1"}
    assert throttled.value.detail == "Too many login attempts. Try again later."


def test_repeated_failures_cap_and_then_recover_after_backoff(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    policy = AdminLoginThrottlePolicy(1, 4, 900)
    monkeypatch.setattr(admin_auth, "get_admin_login_throttle_policy", lambda: policy)
    monkeypatch.setattr(auth, "ADMIN_USERNAME", "admin")
    monkeypatch.setattr(auth, "ADMIN_PASSWORD", "correct-password")
    request = _make_request("203.0.113.10")
    body = admin_auth.LoginRequest(username="admin", password="wrong-password")

    monotonic_values = iter([100.0, 101.0, 103.0, 107.0, 110.5, 111.0])
    monkeypatch.setattr(admin_auth.time, "monotonic", lambda: next(monotonic_values))

    with pytest.raises(HTTPException) as first_failure:
        admin_auth.login(request, body)
    with pytest.raises(HTTPException) as second_failure:
        admin_auth.login(request, body)
    with pytest.raises(HTTPException) as third_failure:
        admin_auth.login(request, body)
    with pytest.raises(HTTPException) as blocked:
        admin_auth.login(request, body)

    assert first_failure.value.status_code == 401
    assert second_failure.value.status_code == 401
    assert third_failure.value.status_code == 401
    assert blocked.value.status_code == 429
    assert blocked.value.headers == {"Retry-After": "1"}

    response = admin_auth.login(
        request,
        admin_auth.LoginRequest(username="admin", password="correct-password"),
    )

    assert response.token_type == "bearer"
    assert policy.check_allowed("203.0.113.10", "admin", now_monotonic=111.0).failure_count == 0


def test_valid_login_after_backoff_succeeds_and_clears_state(
    monkeypatch: pytest.MonkeyPatch,
    isolated_admin_login: AdminLoginThrottlePolicy,
) -> None:
    request = _make_request("203.0.113.10")
    time_values = iter([100.0, 100.0, 100.5, 101.0])
    monkeypatch.setattr(admin_auth.time, "monotonic", lambda: next(time_values))

    with pytest.raises(HTTPException) as first_failure:
        admin_auth.login(request, admin_auth.LoginRequest(username="admin", password="wrong-password"))
    with pytest.raises(HTTPException) as throttled:
        admin_auth.login(request, admin_auth.LoginRequest(username="admin", password="correct-password"))

    response = admin_auth.login(
        request,
        admin_auth.LoginRequest(username="admin", password="correct-password"),
    )

    assert first_failure.value.status_code == 401
    assert throttled.value.status_code == 429
    assert response.token_type == "bearer"
    assert response.access_token
    assert isolated_admin_login.check_allowed("203.0.113.10", "admin", now_monotonic=101.0).failure_count == 0


def test_failures_from_one_client_do_not_block_another(
    isolated_admin_login: AdminLoginThrottlePolicy,
) -> None:
    first_client_request = _make_request("203.0.113.10")
    second_client_request = _make_request("203.0.113.11")
    body = admin_auth.LoginRequest(username="admin", password="wrong-password")

    with pytest.raises(HTTPException):
        admin_auth.login(first_client_request, body)
    with pytest.raises(HTTPException) as second_client_failure:
        admin_auth.login(second_client_request, body)

    assert second_client_failure.value.status_code == 401
    second_client_state = isolated_admin_login.check_allowed("203.0.113.11", "admin")
    assert second_client_state.allowed is False
    assert second_client_state.failure_count == 1


def test_successful_login_preserves_jwt_shape(
    monkeypatch: pytest.MonkeyPatch,
    isolated_admin_login: AdminLoginThrottlePolicy,
) -> None:
    request = _make_request("203.0.113.10")
    monkeypatch.setattr(auth.time, "time", lambda: 1_700_000_000)

    response = admin_auth.login(
        request,
        admin_auth.LoginRequest(username="admin", password="correct-password"),
    )
    payload = auth.verify_token(response.access_token)

    assert response.token_type == "bearer"
    assert response.expires_in == auth.JWT_EXPIRES_MIN * 60
    assert payload["sub"] == "admin"
    assert payload["role"] == "admin"
    assert payload["iat"] == 1_700_000_000
    assert payload["exp"] == 1_700_000_000 + auth.JWT_EXPIRES_MIN * 60
