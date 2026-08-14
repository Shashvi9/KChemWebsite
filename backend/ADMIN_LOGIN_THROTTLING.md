# Admin Login Throttling Operations

This backend uses a process-local throttle for `POST /api/v1/admin/auth/login`. It is keyed by:

- The socket peer IP address from `request.client.host`
- The normalized submitted username (`strip()` plus `casefold()`)

Administrator identity remains a single shared `ADMIN_USERNAME` and `ADMIN_PASSWORD`. This throttle does not add a multi-user admin system.

## Configuration

Set these backend environment variables to tune the throttle:

- `ADMIN_LOGIN_THROTTLE_BASE_DELAY_SECONDS`
  Default: `1`
  Meaning: delay applied after the first failed login for one `(client_ip, username)` bucket.
- `ADMIN_LOGIN_THROTTLE_MAX_DELAY_SECONDS`
  Default: `300`
  Meaning: maximum bounded backoff for one bucket.
- `ADMIN_LOGIN_THROTTLE_RETENTION_SECONDS`
  Default: `900`
  Meaning: how long failure state is retained since the last failed attempt before the bucket expires back to a fresh state.
- `ADMIN_LOGIN_THROTTLE_MAX_BUCKETS`
  Default: `10000`
  Meaning: maximum number of in-memory buckets retained in one process before the least-recently-used bucket is evicted.

All four values must be positive integers. `ADMIN_LOGIN_THROTTLE_MAX_DELAY_SECONDS` must be greater than or equal to `ADMIN_LOGIN_THROTTLE_BASE_DELAY_SECONDS`.

## Default Behavior

- First failed attempt: credentials are checked and the endpoint returns the normal generic `401 Invalid credentials`.
- Repeated failures: the next allowed attempt is delayed with bounded exponential backoff.
- Blocked attempts during backoff: the endpoint returns `429 Too many login attempts. Try again later.` and sets `Retry-After` to the remaining whole seconds.
- Successful login: the bucket is cleared and the existing bearer-token response is returned unchanged.
- Expired or manually reset bucket: the next attempt behaves like a fresh bucket again.
- Separate IP or username buckets: failures do not interfere across different `(client_ip, normalized_username)` keys.

The backoff schedule is:

`delay = min(base_delay_seconds * 2^(failure_count - 1), max_delay_seconds)`

With defaults, the delays are `1s`, `2s`, `4s`, `8s`, and so on until they cap at `300s`.

## Proxy And IP Assumptions

- Bucket IPs come from the ASGI socket peer address only.
- `X-Forwarded-For` and `Forwarded` headers are intentionally ignored.
- If `request.client` is unavailable, the backend uses the fallback bucket IP `"unknown"`.

This means operators must only place the backend behind proxies that preserve the real client address at the socket layer or deliberately accept per-proxy throttling.

## Structured Log Fields

Failed and throttled login events are emitted as warning logs from `backend/app/api/v1/endpoints/admin_auth.py`.

- Event `admin_login_failed`
  Fields: `event`, `client_ip`, `failure_count`, `retry_after_seconds`
- Event `admin_login_throttled`
  Fields: `event`, `client_ip`, `failure_count`, `retry_after_seconds`

The logs do not include submitted usernames or passwords. The throttle state also does not store passwords.

## Reset Procedures

Use one of these procedures when operators need to clear throttle state.

### Reset One Bucket

Use the application environment and run:

```bash
cd backend
python - <<'PY'
from app.core.auth import ADMIN_USERNAME
from app.core.admin_login_throttle import get_admin_login_throttle_policy

client_ip = "203.0.113.10"
username = ADMIN_USERNAME or "admin"
get_admin_login_throttle_policy().reset_bucket(client_ip, username)
print(f"Reset throttle bucket for {client_ip} / {username!r}")
PY
```

Replace `client_ip` with the client address being reset. Because admin identity is still single-account, `ADMIN_USERNAME` remains the correct username input for the shared admin login.

### Reset All Buckets

Restart the backend process. The throttle map is in-memory and process-local, so a restart clears all retained buckets for that process.

If the service is later run with multiple workers or replicas, each process holds independent throttle state and must be restarted independently for a full reset.
