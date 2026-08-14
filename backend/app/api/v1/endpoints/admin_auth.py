import logging
import time

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from app.core.auth import create_access_token, verify_admin_credentials
from app.core.admin_login_throttle import (
    extract_admin_login_client_ip,
    get_admin_login_throttle_policy,
)

router = APIRouter()
logger = logging.getLogger(__name__)

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

@router.post("/login", response_model=LoginResponse)
def login(request: Request, body: LoginRequest):
    client_ip = extract_admin_login_client_ip(request)
    throttle_policy = get_admin_login_throttle_policy()
    now_monotonic = time.monotonic()
    decision = throttle_policy.check_allowed(
        client_ip,
        body.username,
        now_monotonic=now_monotonic,
    )

    if not decision.allowed:
        logger.warning(
            "admin_login_throttled",
            extra={
                "event": "admin_login_throttled",
                "client_ip": client_ip,
                "failure_count": decision.failure_count,
                "retry_after_seconds": decision.retry_after_seconds,
            },
        )
        raise HTTPException(
            status_code=429,
            detail="Too many login attempts. Try again later.",
            headers={"Retry-After": str(decision.retry_after_seconds)},
        )

    if not verify_admin_credentials(body.username, body.password):
        failure_decision = throttle_policy.record_failure(
            client_ip,
            body.username,
            now_monotonic=now_monotonic,
        )
        logger.warning(
            "admin_login_failed",
            extra={
                "event": "admin_login_failed",
                "client_ip": client_ip,
                "failure_count": failure_decision.failure_count,
                "retry_after_seconds": failure_decision.retry_after_seconds,
            },
        )
        raise HTTPException(status_code=401, detail="Invalid credentials")

    throttle_policy.record_success(client_ip, body.username)
    token = create_access_token(sub=body.username)
    from app.core.auth import JWT_EXPIRES_MIN
    return LoginResponse(access_token=token, expires_in=JWT_EXPIRES_MIN * 60)
