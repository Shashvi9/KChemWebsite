import os
import sys
from datetime import datetime
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker

os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ["ADMIN_USERNAME"] = "admin@example.com"
os.environ["ADMIN_PASSWORD"] = "correct-password"
os.environ["JWT_SECRET"] = "test-secret"
os.environ["JWT_EXPIRES_MIN"] = "60"
os.environ.pop("RESEND_API_KEY", None)

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.core.auth import create_access_token
from app.db.base import Base
from app.db.models import Inquiry, SampleRequest
from app.db.session import get_db
from app.main import app


SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def create_test_tables():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db_session():
    db = TestingSessionLocal()
    try:
        db.query(Inquiry).delete()
        db.query(SampleRequest).delete()
        db.commit()
        yield db
    finally:
        db.rollback()
        db.close()


@pytest.fixture()
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def admin_headers():
    token = create_access_token(sub="admin@example.com", role="admin")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def sample_request_payload():
    return {
        "category_slug": "pharma",
        "subcategory_slug": "api",
        "product_id": 101,
        "product_name": "Ascorbic Acid",
        "attributes": {"grade": "USP"},
        "quantity": "500 g",
        "use_case": "Pilot batch validation",
        "name": "Avery Shah",
        "company": "Northstar Labs",
        "email": "avery@example.com",
        "phone": "+1 555 0100",
        "country": "United States",
        "send_copy_to_requester": True,
    }


@pytest.fixture()
def inquiry_payload():
    return {
        "name": "Morgan Lee",
        "email": "morgan@example.com",
        "subject": "Bulk supply",
        "message": "Please share pricing for bulk supply.",
    }


@pytest.fixture()
def seed_sample_request(db_session):
    def _seed(**overrides):
        values = {
            "category_slug": "pharma",
            "subcategory_slug": "api",
            "product_id": 100,
            "product_name": "Default Product",
            "attributes": None,
            "quantity": "1 kg",
            "use_case": "Testing",
            "name": "Default Buyer",
            "company": "Default Co",
            "email": "buyer@example.com",
            "phone": "+1 555 0000",
            "country": "United States",
            "send_copy_to_requester": False,
            "status": "pending",
            "assigned_to": None,
            "internal_notes": None,
            "created_at": datetime(2026, 8, 1, 12, 0, 0),
        }
        values.update(overrides)
        record = SampleRequest(**values)
        db_session.add(record)
        db_session.commit()
        db_session.refresh(record)
        return record

    return _seed
