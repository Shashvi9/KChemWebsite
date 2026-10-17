from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from app.core.auth import create_access_token, verify_admin_credentials
from app.core.ratelimit import limit

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest, request: Request):
    limit(request, "admin-login", max_hits=10, window_s=900)
    if not verify_admin_credentials(body.username, body.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(sub=body.username)
    from app.core.auth import JWT_EXPIRES_MIN
    return LoginResponse(access_token=token, expires_in=JWT_EXPIRES_MIN * 60)
