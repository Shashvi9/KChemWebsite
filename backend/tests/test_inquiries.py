import asyncio
import os
import sys
import types
import unittest
from pathlib import Path
from unittest import mock

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
import migrate_create_inquiries_table as migrate_module


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


class FakeBackgroundTasks:
    def __init__(self):
        self.calls = []

    def add_task(self, func, *args, **kwargs):
        self.calls.append((func, args, kwargs))


class FakeMigrationConnection:
    def __init__(self):
        self.executed = []

    def execute(self, statement):
        self.executed.append(statement)


class FakeMigrationBegin:
    def __init__(self, connection):
        self.connection = connection

    def __enter__(self):
        return self.connection

    def __exit__(self, exc_type, exc, tb):
        return False


class FakeMigrationEngine:
    def __init__(self):
        self.connection = FakeMigrationConnection()
        self.begin_calls = 0
        self.disposed = False

    def begin(self):
        self.begin_calls += 1
        return FakeMigrationBegin(self.connection)

    def dispose(self):
        self.disposed = True


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
        sent_ids = []
        original_sender = inquiries_endpoint._send_inquiry_email
        inquiries_endpoint._send_inquiry_email = lambda inquiry_id: sent_ids.append(inquiry_id)

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
        self.assertEqual(sent_ids, [1])

        db = TestingSessionLocal()
        try:
            records = db.query(Inquiry).all()
        finally:
            db.close()

        self.assertEqual(len(records), 1)
        self.assertEqual(records[0].name, "Grace Hopper")
        self.assertEqual(records[0].email, "grace@example.com")
        self.assertEqual(records[0].subject, "Bulk order")
        self.assertEqual(
            records[0].message,
            "Need pricing and lead time for a recurring bulk order.",
        )
        self.assertEqual(records[0].status, "pending")
        self.assertIsNone(records[0].delivery_error)
        self.assertIsNone(records[0].delivered_at)
        self.assertIsNotNone(records[0].created_at)
        self.assertIsNotNone(records[0].updated_at)

    def test_create_inquiry_persists_pending_record_before_background_delivery_runs(self):
        db = TestingSessionLocal()
        tasks = FakeBackgroundTasks()

        try:
            response = asyncio.run(
                inquiries_endpoint.create_inquiry(
                    inquiries_endpoint.InquiryRequest(
                        name="Grace Hopper",
                        email="grace@example.com",
                        subject="Bulk order",
                        message="Need pricing and lead time for a recurring bulk order.",
                    ),
                    tasks=tasks,
                    db=db,
                )
            )

            records = db.query(Inquiry).all()
        finally:
            db.close()

        self.assertEqual(
            response,
            {"status": "ok", "message": "Inquiry submitted successfully"},
        )
        self.assertEqual(len(records), 1)
        self.assertEqual(records[0].status, "pending")
        self.assertIsNone(records[0].delivery_error)
        self.assertIsNone(records[0].delivered_at)
        self.assertEqual(len(tasks.calls), 1)
        self.assertIs(tasks.calls[0][0], inquiries_endpoint._send_inquiry_email)
        self.assertEqual(tasks.calls[0][1], (records[0].id,))
        self.assertEqual(tasks.calls[0][2], {})

    def test_send_inquiry_email_marks_record_sent(self):
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
            inquiry_id = record.id
        finally:
            db.close()

        with mock.patch.object(inquiries_endpoint, "SessionLocal", TestingSessionLocal), mock.patch.dict(
            os.environ,
            {"RESEND_API_KEY": "test-key"},
            clear=False,
        ), mock.patch.object(inquiries_endpoint.resend.Emails, "send", return_value=None):
            inquiries_endpoint._send_inquiry_email(inquiry_id)

        db = TestingSessionLocal()
        try:
            record = db.get(Inquiry, inquiry_id)
        finally:
            db.close()

        self.assertIsNotNone(record)
        self.assertEqual(record.status, "sent")
        self.assertIsNone(record.delivery_error)
        self.assertIsNotNone(record.delivered_at)

    def test_send_inquiry_email_marks_record_failed_and_keeps_it_queryable(self):
        db = TestingSessionLocal()
        try:
            record = Inquiry(
                name="Linus Pauling",
                email="linus@example.com",
                subject="Support",
                message="Need a safety data sheet for a product inquiry.",
            )
            db.add(record)
            db.commit()
            inquiry_id = record.id
        finally:
            db.close()

        with self.assertRaisesRegex(RuntimeError, "delivery failed"), mock.patch.object(
            inquiries_endpoint, "SessionLocal", TestingSessionLocal
        ), mock.patch.dict(
            os.environ,
            {"RESEND_API_KEY": "test-key"},
            clear=False,
        ), mock.patch.object(
            inquiries_endpoint.resend.Emails,
            "send",
            side_effect=RuntimeError("delivery failed"),
        ):
            inquiries_endpoint._send_inquiry_email(inquiry_id)

        db = TestingSessionLocal()
        try:
            record = db.get(Inquiry, inquiry_id)
        finally:
            db.close()

        self.assertIsNotNone(record)
        self.assertEqual(record.status, "failed")
        self.assertEqual(record.delivery_error, "delivery failed")
        self.assertIsNone(record.delivered_at)

    def test_create_inquiry_returns_500_and_skips_background_task_on_db_failure(self):
        broken_session = BrokenSession()
        sent_ids = []
        original_sender = inquiries_endpoint._send_inquiry_email

        def broken_get_db():
            yield broken_session

        app.dependency_overrides[get_db] = broken_get_db
        inquiries_endpoint._send_inquiry_email = lambda inquiry_id: sent_ids.append(inquiry_id)

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
        self.assertEqual(sent_ids, [])

        db = TestingSessionLocal()
        try:
            self.assertEqual(db.query(Inquiry).count(), 0)
        finally:
            db.close()

    def test_migration_creates_inquiries_table_when_missing(self):
        fake_engine = FakeMigrationEngine()
        fake_inspector = mock.Mock()
        fake_inspector.get_table_names.return_value = ["categories", "products"]

        with mock.patch.object(migrate_module, "create_engine", return_value=fake_engine), mock.patch.object(
            migrate_module, "inspect", return_value=fake_inspector
        ), mock.patch.object(migrate_module, "text", side_effect=lambda sql: sql):
            migrate_module.migrate()

        self.assertEqual(fake_engine.begin_calls, 1)
        self.assertTrue(fake_engine.disposed)
        self.assertEqual(len(fake_engine.connection.executed), 1)

        executed_sql = fake_engine.connection.executed[0]
        self.assertIn("CREATE TABLE inquiries", executed_sql)
        self.assertIn("status VARCHAR(32) NOT NULL DEFAULT 'pending'", executed_sql)
        self.assertIn("created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()", executed_sql)
        self.assertIn("updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()", executed_sql)
        self.assertIn("delivered_at TIMESTAMPTZ NULL", executed_sql)

    def test_migration_skips_when_inquiries_table_exists(self):
        fake_engine = FakeMigrationEngine()
        fake_inspector = mock.Mock()
        fake_inspector.get_table_names.return_value = ["inquiries"]

        with mock.patch.object(migrate_module, "create_engine", return_value=fake_engine), mock.patch.object(
            migrate_module, "inspect", return_value=fake_inspector
        ):
            migrate_module.migrate()

        self.assertEqual(fake_engine.begin_calls, 0)
        self.assertTrue(fake_engine.disposed)
        self.assertEqual(fake_engine.connection.executed, [])


if __name__ == "__main__":
    unittest.main()
