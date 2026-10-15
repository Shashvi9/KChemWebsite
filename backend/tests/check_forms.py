"""Self-check for the public form endpoints. Uses a throwaway SQLite DB; never touches Neon.

Run from backend/:  python tests/check_forms.py
"""
import os
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
db_file = os.path.join(tempfile.mkdtemp(), "t.db")
os.environ["DATABASE_URL"] = f"sqlite:///{db_file}"
os.environ.pop("RESEND_API_KEY", None)  # email "fails": leads must still be saved
os.environ.pop("JWT_SECRET", None)

from fastapi.testclient import TestClient  # noqa: E402

from app.db.base import Base  # noqa: E402
from app.db.models import Inquiry, SampleRequest  # noqa: E402
from app.db.session import SessionLocal, engine  # noqa: E402
from app.main import app  # noqa: E402

Base.metadata.create_all(bind=engine)
c = TestClient(app)
H = {"x-forwarded-for": "1.1.1.1"}

assert c.get("/health").json() == {"status": "ok"}

inq = {"name": "Ana", "email": "ana@example.com", "subject": "Price", "message": "Need 500 kg Acid Red 18", "country": "Brazil"}
r = c.post("/api/v1/inquiries/", json=inq, headers=H)
assert r.status_code == 200 and r.json()["id"], r.text
with SessionLocal() as db:
    saved = db.query(Inquiry).one()
    assert saved.country == "Brazil" and saved.email_sent is False  # saved even though email failed

assert c.post("/api/v1/inquiries/", json={**inq, "website": "spam"}, headers=H).json()["status"] == "ok"
with SessionLocal() as db:
    assert db.query(Inquiry).count() == 1  # honeypot not saved

for _ in range(4):
    c.post("/api/v1/inquiries/", json=inq, headers=H)
assert c.post("/api/v1/inquiries/", json=inq, headers=H).status_code == 429  # 6th in 10 min
assert c.post("/api/v1/inquiries/", json=inq, headers={"x-forwarded-for": "2.2.2.2"}).status_code == 200

assert c.post("/api/v1/inquiries/", json={**inq, "message": "x" * 6000}, headers={"x-forwarded-for": "3.3.3.3"}).status_code == 422

# Sample request from the search page (no category) used to be rejected with 422.
sr = {"product_name": "Tartrazine", "name": "Bo", "company": "Dhaka Dye Co", "email": "bo@example.com", "country": "Bangladesh"}
r = c.post("/api/v1/sample-requests/", json=sr, headers=H)
assert r.status_code == 200, r.text
with SessionLocal() as db:
    assert db.query(SampleRequest).one().category_slug == "search"

# Admin login must refuse when JWT_SECRET is unset instead of signing with a known default.
assert c.post("/api/v1/admin/auth/login", json={"username": "a", "password": "b"}).status_code in (401, 500)

print("ok")
