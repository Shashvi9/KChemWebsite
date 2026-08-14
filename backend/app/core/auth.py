import os
import time
from typing import Optional

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt, JWTError

APP_ENV = os.getenv("APP_ENV", "development").strip().lower()
DEVELOPMENT_JWT_SECRET = "dev-secret-change-me"
JWT_ALG = os.getenv("JWT_ALG", "HS256")
JWT_EXPIRES_MIN = int(os.getenv("JWT_EXPIRES_MIN", "60"))

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

security = HTTPBearer(auto_error=True)


def validate_jwt_configuration(
    app_env: str = APP_ENV,
    jwt_secret: Optional[str] = os.getenv("JWT_SECRET"),
) -> str:
    """Return the configured signing secret or fail before the app serves requests."""
    if app_env == "production":
        if not jwt_secret:
            raise RuntimeError("JWT_SECRET must be set when APP_ENV=production")
        if jwt_secret == DEVELOPMENT_JWT_SECRET:
            raise RuntimeError(
                "JWT_SECRET must not use the development secret when APP_ENV=production"
            )
        return jwt_secret

    if app_env == "development":
        return jwt_secret or DEVELOPMENT_JWT_SECRET

    raise RuntimeError("APP_ENV must be either 'development' or 'production'")


JWT_SECRET = validate_jwt_configuration()


def create_access_token(sub: str, role: str = "admin") -> str:
    now = int(time.time())
    payload = {
        "sub": sub,
        "role": role,
        "iat": now,
        "exp": now + JWT_EXPIRES_MIN * 60,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def verify_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")


def get_current_admin(creds: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = creds.credentials
    payload = verify_token(token)
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    return payload


def verify_admin_credentials(username: str, password: str) -> bool:
    if not ADMIN_USERNAME or not ADMIN_PASSWORD:
        raise HTTPException(status_code=500, detail="Admin credentials not configured")
    return username == ADMIN_USERNAME and password == ADMIN_PASSWORD
