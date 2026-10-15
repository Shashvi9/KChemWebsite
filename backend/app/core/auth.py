import hmac
import os
import time
from typing import Optional

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt, JWTError

JWT_SECRET = os.getenv("JWT_SECRET")  # no default: a guessable secret lets anyone forge admin tokens
JWT_ALG = os.getenv("JWT_ALG", "HS256")
JWT_EXPIRES_MIN = int(os.getenv("JWT_EXPIRES_MIN", "60"))

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

security = HTTPBearer(auto_error=True)


def _secret() -> str:
    if not JWT_SECRET:
        raise HTTPException(status_code=500, detail="Admin auth not configured")
    return JWT_SECRET


def create_access_token(sub: str, role: str = "admin") -> str:
    now = int(time.time())
    payload = {
        "sub": sub,
        "role": role,
        "iat": now,
        "exp": now + JWT_EXPIRES_MIN * 60,
    }
    return jwt.encode(payload, _secret(), algorithm=JWT_ALG)


def verify_token(token: str) -> dict:
    try:
        return jwt.decode(token, _secret(), algorithms=[JWT_ALG])
    except JWTError as e:
        raise HTTPException(status_code=401, detail="Invalid token")


def get_current_admin(creds: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = creds.credentials
    payload = verify_token(token)
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    return payload


def verify_admin_credentials(username: str, password: str) -> bool:
    if not ADMIN_USERNAME or not ADMIN_PASSWORD:
        raise HTTPException(status_code=500, detail="Admin credentials not configured")
    return hmac.compare_digest(username.encode(), ADMIN_USERNAME.encode()) & hmac.compare_digest(
        password.encode(), ADMIN_PASSWORD.encode()
    )
