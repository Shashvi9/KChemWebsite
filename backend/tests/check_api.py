"""Self-check for the API against a throwaway Postgres DB (needs ARRAY/JSONB, so not SQLite).

Builds the schema with `alembic upgrade head` (also exercises the baseline on an empty DB),
loads a tiny fixture, and checks forms + catalog behaviour. Never point it at Neon: it drops tables.

  TEST_DATABASE_URL=postgresql+psycopg2://postgres@/kchem_test?host=/tmp&port=54329 python tests/check_api.py
"""
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
url = os.environ.get("TEST_DATABASE_URL") or sys.exit("TEST_DATABASE_URL is not set")
assert "neon.tech" not in url, "refusing to run destructive checks against Neon"
os.environ["DATABASE_URL"] = url
os.environ.pop("RESEND_API_KEY", None)  # email "fails": leads must still be saved
os.environ.pop("JWT_SECRET", None)
sys.path.insert(0, str(ROOT))

from sqlalchemy import create_engine, text  # noqa: E402

eng = create_engine(url)
with eng.begin() as c:
    c.execute(text("DROP SCHEMA public CASCADE; CREATE SCHEMA public"))
subprocess.run([sys.executable, "-m", "alembic", "upgrade", "head"], cwd=ROOT, check=True, capture_output=True)

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402

with eng.begin() as c:
    c.execute(text("INSERT INTO categories (id, name, slug) VALUES (1, 'Dyes & Intermediates', 'dyes-intermediates')"))
    c.execute(text("INSERT INTO subcategories (id, category_id, name, slug) VALUES "
                   "(10, 1, 'Acid Dyes', 'acid-dyes'), (11, 1, 'Levelling Dyes', 'levelling-dyes'), (12, 1, 'Empty', 'empty')"))
    c.execute(text("INSERT INTO products (id, name, subcategory_id, category_id) "
                   "SELECT g, 'Acid Test ' || g, 10, 1 FROM generate_series(1, 150) g"))
    c.execute(text("UPDATE products SET name = 'Acid Red 18', cas_number = '2611-82-7', cas_numbers = '{2611-82-7}', "
                   "ci_name = 'Acid Red 18', synonyms = '{Ponceau 4R}', specs = '{\"strength\": [\"100%\", \"150%\"]}' "
                   "WHERE id = 1"))
    c.execute(text("UPDATE products SET is_active = false WHERE id = 2"))
    c.execute(text("INSERT INTO product_subcategories (product_id, subcategory_id) SELECT id, 10 FROM products"))
    c.execute(text("INSERT INTO product_subcategories (product_id, subcategory_id) VALUES (1, 11)"))

cl = TestClient(app)
api = "/api/v1"

# Catalog
assert cl.get("/health").json() == {"status": "ok"}
subs = [s["slug"] for s in cl.get(f"{api}/categories/dyes-intermediates/subcategories").json()]
assert subs == ["acid-dyes", "levelling-dyes"], subs  # empty subcategory hidden, not deleted
acid = cl.get(f"{api}/products/?category_slug=dyes-intermediates&subcategory_slug=acid-dyes").json()
assert len(acid) == 149, len(acid)  # no 100 cap; inactive product hidden
lev = cl.get(f"{api}/products/?category_slug=dyes-intermediates&subcategory_slug=levelling-dyes").json()
assert [p["name"] for p in lev] == ["Acid Red 18"]  # same product listed under a second grade
assert lev[0]["attributes"] == {"cas": "2611-82-7", "also_known_as": "Ponceau 4R", "strength": "100%, 150%"}, lev[0]
for q in ["ponceau", "2611-82-7", "acid red 18", "red 18"]:
    assert [p["id"] for p in cl.get(f"{api}/products/search", params={"q": q}).json()] == [1], q
assert cl.get(f"{api}/products/search", params={"q": "%_"}).json() == []  # LIKE wildcards are escaped

# Forms
H = {"x-forwarded-for": "1.1.1.1"}
inq = {"name": "Ana", "email": "ana@example.com", "subject": "Price", "message": "Need 500 kg Acid Red 18", "country": "Brazil"}
r = cl.post(f"{api}/inquiries/", json=inq, headers=H)
assert r.status_code == 200 and r.json()["id"], r.text
with eng.connect() as c:
    assert tuple(c.execute(text("SELECT country, email_sent FROM inquiries")).one()) == ("Brazil", False)  # saved though email failed
assert cl.post(f"{api}/inquiries/", json={**inq, "website": "spam"}, headers=H).json()["status"] == "ok"
with eng.connect() as c:
    assert c.execute(text("SELECT count(*) FROM inquiries")).scalar() == 1  # honeypot not saved
for _ in range(4):
    cl.post(f"{api}/inquiries/", json=inq, headers=H)
assert cl.post(f"{api}/inquiries/", json=inq, headers=H).status_code == 429  # 6th in 10 min
assert cl.post(f"{api}/inquiries/", json=inq, headers={"x-forwarded-for": "2.2.2.2"}).status_code == 200
assert cl.post(f"{api}/inquiries/", json={**inq, "message": "x" * 6000}, headers={"x-forwarded-for": "3.3.3.3"}).status_code == 422

sr = {"product_name": "Acid Red 18", "name": "Bo", "company": "Dhaka Dye Co", "email": "bo@example.com", "country": "Bangladesh"}
assert cl.post(f"{api}/sample-requests/", json=sr, headers=H).status_code == 200  # search page: no category
with eng.connect() as c:
    assert c.execute(text("SELECT category_slug FROM sample_requests")).scalar() == "search"

assert cl.post(f"{api}/admin/auth/login", json={"username": "a", "password": "b"}).status_code in (401, 500)
print("ok")
