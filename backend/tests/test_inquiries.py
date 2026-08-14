import os
import sys
import types
import unittest
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

TEST_DB_PATH = BACKEND_ROOT / "tests" / "test_inquiries.sqlite3"
os.environ.setdefault("DATABASE_URL", f"sqlite:///{TEST_DB_PATH}")

if "resend" not in sys.modules:
    sys.modules["resend"] = types.SimpleNamespace(
        api_key=None,
        Emails=types.SimpleNamespace(send=lambda payload: None),
    )

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.api.v1.endpoints import inquiries as inquiries_endpoint
from app.db.base import Base
from app.db.models import Inquiry
from app.db.session import get_db
from app.main import app


engine = create_engine(
    os.environ["DATABASE_URL"],
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


class BrokenSession:
    def __init__(self):
        self.rollback_called = False

    def add(self, _record):
        return None

    def commit(self):
        raise RuntimeError("boom")

    def rollback(self):
        self.rollback_called = True


class InquiryPersistenceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def setUp(self):
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        app.dependency_overrides[get_db] = override_get_db

    def tearDown(self):
        app.dependency_overrides.clear()

    def test_inquiry_model_persists_default_state(self):
        db = TestingSessionLocal()
        try:
            record = Inquiry(
                name="Ada Lovelace",
                email="ada@example.com",
                subject="Catalyst inquiry",
                message="Please share the current product specifications.",
            )
            db.add(record)
            db.commit()
            db.refresh(record)
        finally:
            db.close()

        self.assertIsNotNone(record.id)
        self.assertEqual(record.status, "pending")
        self.assertIsNotNone(record.created_at)
        self.assertIsNotNone(record.updated_at)
        self.assertIsNone(record.delivered_at)
        self.assertEqual(record.name, "Ada Lovelace")
        self.assertEqual(record.email, "ada@example.com")
        self.assertEqual(record.subject, "Catalyst inquiry")
        self.assertEqual(
            record.message,
            "Please share the current product specifications.",
        )

    def test_create_inquiry_persists_record_and_keeps_response_shape(self):
        sent_subjects = []
        original_sender = inquiries_endpoint._send_inquiry_email
        inquiries_endpoint._send_inquiry_email = lambda req: sent_subjects.append(req.subject)

        try:
            response = self.client.post(
                "/api/v1/inquiries/",
                json={
                    "name": "Grace Hopper",
                    "email": "grace@example.com",
                    "subject": "Bulk order",
                    "message": "Need pricing and lead time for a recurring bulk order.",
                },
            )
        finally:
            inquiries_endpoint._send_inquiry_email = original_sender

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {"status": "ok", "message": "Inquiry submitted successfully"},
        )
        self.assertEqual(sent_subjects, ["Bulk order"])

        db = TestingSessionLocal()
        try:
            records = db.query(Inquiry).all()
        finally:
            db.close()

        self.assertEqual(len(records), 1)
        self.assertEqual(records[0].name, "Grace Hopper")
        self.assertEqual(records[0].email, "grace@example.com")
        self.assertEqual(records[0].status, "pending")

    def test_create_inquiry_returns_500_and_skips_background_task_on_db_failure(self):
        broken_session = BrokenSession()
        sent_subjects = []
        original_sender = inquiries_endpoint._send_inquiry_email

        def broken_get_db():
            yield broken_session

        app.dependency_overrides[get_db] = broken_get_db
        inquiries_endpoint._send_inquiry_email = lambda req: sent_subjects.append(req.subject)

        try:
            response = self.client.post(
                "/api/v1/inquiries/",
                json={
                    "name": "Linus Pauling",
                    "email": "linus@example.com",
                    "subject": "Support",
                    "message": "Need a safety data sheet for a product inquiry.",
                },
            )
        finally:
            inquiries_endpoint._send_inquiry_email = original_sender

        self.assertEqual(response.status_code, 500)
        self.assertIn("Database error", response.json()["detail"])
        self.assertTrue(broken_session.rollback_called)
        self.assertEqual(sent_subjects, [])


if __name__ == "__main__":
    unittest.main()
