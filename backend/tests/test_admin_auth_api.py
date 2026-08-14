import time

from jose import jwt

from app.core import auth
from app.core.auth import create_access_token


def test_valid_admin_credentials_return_token_accepted_by_queue(client, admin_headers):
    login = client.post(
        "/api/v1/admin/auth/login",
        json={"username": "admin@example.com", "password": "correct-password"},
    )

    assert login.status_code == 200
    body = login.json()
    assert body["token_type"] == "bearer"
    assert body["expires_in"] > 0
    assert body["access_token"]

    response = client.get(
        "/api/v1/admin/sample-requests/",
        headers={"Authorization": f"Bearer {body['access_token']}"},
    )
    assert response.status_code == 200


def test_invalid_admin_credentials_return_401(client):
    response = client.post(
        "/api/v1/admin/auth/login",
        json={"username": "admin@example.com", "password": "wrong-password"},
    )

    assert response.status_code == 401


def test_missing_bearer_credentials_return_current_fastapi_status(client):
    response = client.get("/api/v1/admin/sample-requests/")

    assert response.status_code == 403


def test_malformed_token_returns_401(client):
    response = client.get(
        "/api/v1/admin/sample-requests/",
        headers={"Authorization": "Bearer not-a-jwt"},
    )

    assert response.status_code == 401


def test_wrong_secret_token_returns_401(client):
    token = jwt.encode(
        {"sub": "admin@example.com", "role": "admin", "iat": int(time.time()), "exp": int(time.time()) + 3600},
        "wrong-secret",
        algorithm=auth.JWT_ALG,
    )

    response = client.get(
        "/api/v1/admin/sample-requests/",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 401


def test_expired_token_returns_401(client):
    now = int(time.time())
    token = jwt.encode(
        {"sub": "admin@example.com", "role": "admin", "iat": now - 7200, "exp": now - 3600},
        auth.JWT_SECRET,
        algorithm=auth.JWT_ALG,
    )

    response = client.get(
        "/api/v1/admin/sample-requests/",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 401


def test_wrong_role_token_returns_403(client):
    token = create_access_token(sub="viewer@example.com", role="viewer")

    response = client.get(
        "/api/v1/admin/sample-requests/",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 403
