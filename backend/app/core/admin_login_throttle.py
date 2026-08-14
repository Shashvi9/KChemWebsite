import math
import os
import threading
import time
from collections import OrderedDict
from dataclasses import dataclass

from fastapi import Request

DEFAULT_BASE_DELAY_SECONDS = 1
DEFAULT_MAX_DELAY_SECONDS = 300
DEFAULT_RETENTION_SECONDS = 900
DEFAULT_MAX_BUCKETS = 10000

_UNKNOWN_CLIENT_IP = "unknown"
_POLICY_ENV_VARS = {
    "base_delay_seconds": "ADMIN_LOGIN_THROTTLE_BASE_DELAY_SECONDS",
    "max_delay_seconds": "ADMIN_LOGIN_THROTTLE_MAX_DELAY_SECONDS",
    "retention_seconds": "ADMIN_LOGIN_THROTTLE_RETENTION_SECONDS",
    "max_buckets": "ADMIN_LOGIN_THROTTLE_MAX_BUCKETS",
}
_policy_singleton_lock = threading.Lock()
_policy_singleton = None


def normalize_admin_login_username(username: str) -> str:
    return username.strip().casefold()


@dataclass(frozen=True)
class AdminLoginThrottleDecision:
    allowed: bool
    retry_after_seconds: int
    failure_count: int


@dataclass
class ThrottleBucket:
    failure_count: int
    next_allowed_at_monotonic: float
    last_failure_at_monotonic: float


class AdminLoginThrottlePolicy:
    def __init__(
        self,
        base_delay_seconds: int,
        max_delay_seconds: int,
        retention_seconds: int,
        max_buckets: int = DEFAULT_MAX_BUCKETS,
        trusted_proxy_headers: bool = False,
    ) -> None:
        self.base_delay_seconds = _validate_positive_int(base_delay_seconds, "base_delay_seconds")
        self.max_delay_seconds = _validate_positive_int(max_delay_seconds, "max_delay_seconds")
        self.retention_seconds = _validate_positive_int(retention_seconds, "retention_seconds")
        self.max_buckets = _validate_positive_int(max_buckets, "max_buckets")
        if self.max_delay_seconds < self.base_delay_seconds:
            raise ValueError("max_delay_seconds must be greater than or equal to base_delay_seconds")
        self.trusted_proxy_headers = trusted_proxy_headers
        self._lock = threading.Lock()
        self._buckets: OrderedDict[tuple[str, str], ThrottleBucket] = OrderedDict()

    def check_allowed(
        self,
        client_ip: str,
        username: str,
        now_monotonic: float | None = None,
    ) -> AdminLoginThrottleDecision:
        now = time.monotonic() if now_monotonic is None else now_monotonic
        key = self._make_key(client_ip, username)

        with self._lock:
            bucket = self._get_bucket_locked(key, now)
            if bucket is None:
                return AdminLoginThrottleDecision(True, 0, 0)

            if now < bucket.next_allowed_at_monotonic:
                retry_after_seconds = math.ceil(bucket.next_allowed_at_monotonic - now)
                return AdminLoginThrottleDecision(False, retry_after_seconds, bucket.failure_count)

            return AdminLoginThrottleDecision(True, 0, bucket.failure_count)

    def record_failure(
        self,
        client_ip: str,
        username: str,
        now_monotonic: float | None = None,
    ) -> AdminLoginThrottleDecision:
        now = time.monotonic() if now_monotonic is None else now_monotonic
        key = self._make_key(client_ip, username)

        with self._lock:
            bucket = self._get_bucket_locked(key, now)
            failure_count = 1 if bucket is None else bucket.failure_count + 1
            delay_seconds = min(
                self.base_delay_seconds * (2 ** (failure_count - 1)),
                self.max_delay_seconds,
            )
            self._evict_if_needed_locked(now, key)
            self._buckets[key] = ThrottleBucket(
                failure_count=failure_count,
                next_allowed_at_monotonic=now + delay_seconds,
                last_failure_at_monotonic=now,
            )
            self._buckets.move_to_end(key)
            return AdminLoginThrottleDecision(False, delay_seconds, failure_count)

    def record_success(self, client_ip: str, username: str) -> None:
        self.reset_bucket(client_ip, username)

    def reset_bucket(self, client_ip: str, username: str) -> None:
        key = self._make_key(client_ip, username)
        with self._lock:
            self._buckets.pop(key, None)

    def _make_key(self, client_ip: str, username: str) -> tuple[str, str]:
        return client_ip, normalize_admin_login_username(username)

    def _get_bucket_locked(
        self,
        key: tuple[str, str],
        now_monotonic: float,
    ) -> ThrottleBucket | None:
        self._prune_expired_buckets_locked(now_monotonic)
        bucket = self._buckets.get(key)
        if bucket is None:
            return None

        self._buckets.move_to_end(key)
        return bucket

    def _prune_expired_buckets_locked(self, now_monotonic: float) -> None:
        expired_keys = [
            key
            for key, bucket in self._buckets.items()
            if now_monotonic - bucket.last_failure_at_monotonic >= self.retention_seconds
        ]
        for key in expired_keys:
            self._buckets.pop(key, None)

    def _evict_if_needed_locked(
        self,
        now_monotonic: float,
        incoming_key: tuple[str, str],
    ) -> None:
        self._prune_expired_buckets_locked(now_monotonic)
        if incoming_key in self._buckets:
            return
        while len(self._buckets) >= self.max_buckets:
            self._buckets.popitem(last=False)


def get_admin_login_throttle_policy() -> AdminLoginThrottlePolicy:
    global _policy_singleton

    if _policy_singleton is None:
        with _policy_singleton_lock:
            if _policy_singleton is None:
                _policy_singleton = AdminLoginThrottlePolicy(
                    base_delay_seconds=_read_policy_env_int(
                        "base_delay_seconds",
                        DEFAULT_BASE_DELAY_SECONDS,
                    ),
                    max_delay_seconds=_read_policy_env_int(
                        "max_delay_seconds",
                        DEFAULT_MAX_DELAY_SECONDS,
                    ),
                    retention_seconds=_read_policy_env_int(
                        "retention_seconds",
                        DEFAULT_RETENTION_SECONDS,
                    ),
                    max_buckets=_read_policy_env_int(
                        "max_buckets",
                        DEFAULT_MAX_BUCKETS,
                    ),
                )

    return _policy_singleton


def extract_admin_login_client_ip(request: Request) -> str:
    if request.client and request.client.host:
        return request.client.host
    return _UNKNOWN_CLIENT_IP


def _read_policy_env_int(name: str, default: int) -> int:
    env_name = _POLICY_ENV_VARS[name]
    value = os.getenv(env_name, str(default))
    try:
        return _validate_positive_int(int(value), env_name)
    except ValueError as exc:
        raise ValueError(f"{env_name} must be a positive integer") from exc


def _validate_positive_int(value: int, field_name: str) -> int:
    if value <= 0:
        raise ValueError(f"{field_name} must be positive")
    return value
