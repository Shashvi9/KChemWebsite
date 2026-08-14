# Story 32 - Bounded Admin Login Throttle Policy and Configuration - Technical Spec

## Summary
- Add a process-local, reusable throttling module for admin login attempts keyed by `(client_ip, normalized_username)`.
- Use bounded exponential backoff with automatic bucket expiry and success-path reset so the public admin login cannot be guessed at unlimited volume while preserving the existing single shared credential model.
- Fit the current backend style by using a standalone `app.core` module with module-level environment configuration, rather than introducing a broader settings system or persistent storage.

## Current State
- `backend/app/api/v1/endpoints/admin_auth.py` exposes `POST /api/v1/admin/auth/login` and immediately checks credentials, returning `401` on failure and a JWT on success.
- `backend/app/core/auth.py` loads one `ADMIN_USERNAME` and one `ADMIN_PASSWORD` from environment variables and performs direct equality checks. There is no multi-user admin identity model.
- The backend has no existing rate-limit, throttle, cache, or settings abstraction. Configuration is read directly with `os.getenv(...)`.
- The deployment descriptor `backend/render.yaml` starts a plain `uvicorn` process. There is no existing trusted-proxy middleware or documented proxy-header contract in the repo.
- There is no backend test suite in the repository today, so this spec must define a clean unit-test seam even though story `#32` does not add tests.

## Implementation Approach
- Introduce a new in-memory throttle policy module in `app.core` instead of folding the behavior into `admin_auth.py` or `auth.py`. This keeps story `#32` reusable and leaves HTTP wiring for story `#33`.
- Model throttling as two explicit operations:
  - pre-check whether a login attempt is currently allowed for a `(client_ip, username)` bucket
  - record the outcome after credential verification so failure growth and success reset are deterministic
- Normalize usernames before keying state by trimming surrounding whitespace and applying `.casefold()`. Do not hash, persist, log, or otherwise store raw passwords.
- Use a bounded exponential schedule where failure `n` sets the delay for the next attempt to `min(base_delay_seconds * 2^(n-1), max_delay_seconds)`. This makes the first failed attempt allowed, then backs off progressively without permanent lockout.
- Store throttle state in a process-local dictionary guarded by a `threading.Lock`. This is sufficient for the current single-process / per-process constraint, and explicitly does not provide cross-worker consistency.
- Use `time.monotonic()` for all delay and expiry calculations so system clock changes cannot shorten or lengthen penalties incorrectly.
- Treat a bucket as fresh once its retention window expires or after a successful login. Expired buckets are removed lazily during reads/writes; no background cleanup loop is needed.
- For client address safety, define the reusable contract now as "use the socket peer address by default; do not trust `X-Forwarded-For` or `Forwarded` headers unless a future deployment explicitly adds trusted-proxy configuration." Story `#32` should ship a helper that reflects this assumption so story `#33` can call it directly.

### Alternatives Rejected
- Persistent or distributed storage: rejected because the story explicitly forbids adding distributed state and because the current app has no Redis/cache dependency.
- Multi-user account-aware throttling: rejected because the credential model must remain one shared environment-configured account.
- Trusting proxy headers by default: rejected because the repo does not define trusted proxies, and blindly trusting forwarded headers would let attackers spoof buckets.

## File Changes

### `backend/app/core/admin_login_throttle.py` [NEW]
- Purpose: own throttle configuration, state, safe client-address resolution, and the public API that story `#33` will call from the admin login endpoint.
- Functions/classes:
  - New `normalize_admin_login_username(username: str) -> str`
    - Current behavior: none
    - Change: trim surrounding whitespace, apply `.casefold()`, and return the normalized key component
    - Stays stable: does not mutate request payloads or alter credential comparison rules
  - New `AdminLoginThrottleDecision`
    - Shape: lightweight dataclass or named tuple with `allowed: bool`, `retry_after_seconds: int`, `failure_count: int`
    - Responsibility: give the future endpoint enough information to decide whether to continue or return a throttled response
  - New internal `ThrottleBucket`
    - Shape: dataclass with `failure_count: int`, `next_allowed_at_monotonic: float`, `last_failure_at_monotonic: float`
    - Responsibility: hold per-key process-local state only
  - New `AdminLoginThrottlePolicy`
    - Constructor signature:
      - `__init__(self, base_delay_seconds: int, max_delay_seconds: int, retention_seconds: int, trusted_proxy_headers: bool = False)`
    - Public methods:
      - `check_allowed(self, client_ip: str, username: str, now_monotonic: float | None = None) -> AdminLoginThrottleDecision`
      - `record_failure(self, client_ip: str, username: str, now_monotonic: float | None = None) -> AdminLoginThrottleDecision`
      - `record_success(self, client_ip: str, username: str) -> None`
      - `reset_bucket(self, client_ip: str, username: str) -> None`
    - Current behavior: none
    - What changes: introduces the in-memory bucket map and all concurrency-safe mutations
    - What stays: no password storage, no logging, no HTTP dependencies
  - New `get_admin_login_throttle_policy() -> AdminLoginThrottlePolicy`
    - Responsibility: expose a module-level singleton configured from environment variables so the future endpoint can import a stable access point
  - New `extract_admin_login_client_ip(request: Request) -> str`
    - Responsibility: return a stable bucket IP string for the login endpoint
    - Rule for story `#32`: use `request.client.host` when present; ignore forwarded headers unless the module is later extended with explicit trusted-proxy support
    - Fallback: return `"unknown"` if the ASGI client address is absent so throttling still has a deterministic bucket
- Data flow:
  - Inputs: client IP string, submitted username string, optional injected monotonic timestamp for tests
  - Transformations:
    - normalize username
    - compose key `(client_ip, normalized_username)`
    - lazily delete expired bucket if `now - last_failure_at_monotonic >= retention_seconds`
    - on `check_allowed`, return blocked if `now < next_allowed_at_monotonic`, else allowed
    - on `record_failure`, increment `failure_count`, compute bounded delay, set `next_allowed_at_monotonic = now + delay`, update `last_failure_at_monotonic`
    - on `record_success`, delete the bucket entirely
  - Outputs:
    - `check_allowed`: current allow/block decision and remaining retry delay
    - `record_failure`: the post-failure delay decision that the caller can turn into a response
    - `record_success` / `reset_bucket`: no return payload
- Imports/connections:
  - New imports: `threading`, `time`, `dataclasses`, `typing`, `fastapi.Request`
  - No database, cache, or JWT dependencies
- Pseudocode:
  - `check_allowed(...)`
    - compute `now = now_monotonic or time.monotonic()`
    - normalize username and form key
    - acquire lock
    - load bucket
    - if bucket missing: return `allowed=True, retry_after_seconds=0, failure_count=0`
    - if bucket expired by retention window: delete it and return allowed fresh decision
    - if `now < bucket.next_allowed_at_monotonic`: return `allowed=False` with ceiling of remaining seconds
    - return `allowed=True` with existing failure count
  - `record_failure(...)`
    - compute `now`
    - normalize username and form key
    - acquire lock
    - load bucket; if expired, discard and start from fresh state
    - increment failure count
    - compute `delay = min(base_delay_seconds * 2 ** (failure_count - 1), max_delay_seconds)`
    - store updated bucket with new `next_allowed_at_monotonic` and `last_failure_at_monotonic`
    - return `allowed=False`, `retry_after_seconds=delay`, updated `failure_count`
  - `record_success(...)`
    - normalize username and form key
    - acquire lock
    - delete bucket if present
  - `extract_admin_login_client_ip(request)`
    - if `request.client` and `request.client.host` exist: return that host
    - otherwise return `"unknown"`

### `backend/.env.example` [MODIFIED]
- Purpose: document the new throttle-related environment variables in the same style as the rest of the backend configuration.
- Variables to add:
  - `ADMIN_LOGIN_THROTTLE_BASE_DELAY_SECONDS=1`
  - `ADMIN_LOGIN_THROTTLE_MAX_DELAY_SECONDS=300`
  - `ADMIN_LOGIN_THROTTLE_RETENTION_SECONDS=900`
- Validation behavior:
  - The policy module should coerce these values with `int(...)`
  - Invalid, zero, or negative values should raise a startup-time `ValueError` when the singleton is first created rather than silently disabling throttling
- Notes:
  - No env var should exist for raw credential data beyond the already-present `ADMIN_USERNAME` / `ADMIN_PASSWORD`
  - Do not add settings for distributed cache backends or per-user admin identities

## Contract Changes
- New internal backend contract:
  - callers can ask whether an attempt is currently allowed for a `(client_ip, normalized_username)` bucket
  - callers can record failures and successes without knowing the bucket storage details
- No external API shape changes in story `#32`
  - `POST /api/v1/admin/auth/login` request/response bodies stay unchanged in this story
  - JWT issuance and credential comparison semantics stay unchanged in this story
- New configuration contract:
  - three optional env vars define backoff base delay, cap, and retention
  - if omitted, defaults are `1s`, `300s`, and `900s`
- New safe-address contract:
  - until trusted proxy configuration exists, the throttle key must be based on the ASGI socket peer address only

## Test Impact
- Story `#32` itself does not add the test suite, but the implementation must be structured so the following unit tests can be added without refactoring:
  - fresh bucket: `check_allowed(...)` returns allowed with `retry_after_seconds=0`
  - first failure: `record_failure(...)` returns a delay of `1` second with `failure_count=1`
  - repeated failures: returned delays double until capped at `300` seconds
  - retention expiry: an expired bucket is treated as new and removed from state
  - success reset: `record_success(...)` clears the bucket so the next attempt is fresh
  - independent keys: same username on different IPs and same IP on different normalized usernames do not interfere
  - normalization: usernames differing only by case or surrounding spaces share one bucket
  - concurrency smoke test: concurrent failure recordings do not lose increments or produce negative retry values
  - client IP fallback: missing `request.client` maps to the `"unknown"` bucket
- Recommended future test locations:
  - `backend/tests/core/test_admin_login_throttle.py` for policy unit coverage
  - `backend/tests/api/v1/test_admin_auth.py` for the later endpoint wiring in story `#33`

## Blast Radius
- Low-to-moderate backend-only blast radius.
- Primary regression surfaces:
  - future login endpoint behavior when story `#33` wires the policy in
  - startup/runtime failures if env var parsing is implemented inconsistently
  - deployment behavior when multiple worker processes are introduced later, because buckets are process-local
- No impact on product/category/public inquiry APIs.

## Shared Code Impact
- Adds one reusable `app.core` module that can be consumed by the admin auth endpoint and, if needed later, by operator tooling for manual bucket resets.
- Does not alter JWT helpers or shared auth token verification paths.
- Keeps compatibility with the current "module-level env config" style used elsewhere in the backend.

## Risks And Edge Cases
- Process-local limitation: if the service later runs multiple workers/replicas, throttling state will not be shared. This must be documented as an accepted limitation of story `#32`, not treated as a bug in the module.
- Header spoofing risk: trusting `X-Forwarded-For` without trusted-proxy config would let attackers choose arbitrary throttle buckets. Default behavior must not trust it.
- Monotonic vs wall clock: use monotonic time internally so NTP or manual clock changes do not reset penalties unexpectedly.
- Username normalization boundary: only normalize for bucketing. The actual credential comparison must continue to use the existing credential function unless a separate story intentionally changes auth semantics.
- `"unknown"` client bucket: environments that omit `request.client` will group such attempts together. This is acceptable and safer than bypassing throttling.

## Assumptions And Open Questions
- Assumption: the current deployment model is effectively a single process or accepts per-process throttling as sufficient for this stage. No repo artifact defines a distributed cache or shared limiter.
- Assumption: the "stated proxy assumption" should be implemented conservatively because no trusted-proxy rule exists in repo docs or config as of August 14, 2026.
- Open question for story `#33`, not a blocker for `#32`: whether throttled login attempts should map to HTTP `429` with `Retry-After` or a generic auth-shaped response. This story only provides the decision data.

## References
- Source files (existing code to read before editing)
  - `backend/app/api/v1/endpoints/admin_auth.py`
    - reason: future consumer of the throttle policy; focus on `LoginRequest`, `login(...)`, and current `401` flow
  - `backend/app/core/auth.py`
    - reason: current single-account credential contract and JWT behavior that must remain stable; focus on `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `verify_admin_credentials`, and `create_access_token`
  - `backend/app/api/v1/api.py`
    - reason: confirms the route is publicly reachable under `/api/v1/admin/auth`
  - `backend/app/main.py`
    - reason: confirms no existing proxy/trust middleware or settings system
  - `backend/render.yaml`
    - reason: current deployment entrypoint and absence of explicit trusted-proxy configuration
- Files being changed
  - `backend/app/core/admin_login_throttle.py`
  - `backend/.env.example`
- Core/architecture docs
  - none present in MindLap as of August 14, 2026; `lap file.list --mime collection` returned only the `Workflows` collection, not a `core` collection
- Skills
  - `Tech Spec` (`P846rl`)
    - reason: governs the required spec structure and completion steps for this story
- Linked story/spec artifacts
  - Story `#32` description
    - reason: defines exact in-scope behavior, acceptance requirements, and explicit out-of-scope boundaries
  - Lap `#15` description
    - reason: states the security problem and preserves the current single shared admin credential model
  - MindLap file `RENasn` (`admin-login-rate-limit-spec`)
    - reason: upstream feature intent for bounded throttling, unchanged JWT flow, and operational reset expectations
- External references
  - none required for implementation of this story within the current repo constraints
