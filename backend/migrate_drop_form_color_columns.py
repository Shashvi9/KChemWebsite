"""
Drop form and color columns from database tables.

Usage:
    cd backend
    source venv/bin/activate
    python migrate_drop_form_color_columns.py
"""
import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text

load_dotenv(Path(__file__).parent / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable not set")

TABLES = [
    "products",
    "sample_requests",
    "categories",
    "subcategories",
]

COLUMNS_TO_DROP = ["form", "color"]


def migrate():
    engine = create_engine(DATABASE_URL)
    inspector = inspect(engine)

    with engine.begin() as conn:
        for table in TABLES:
            if table not in inspector.get_table_names():
                print(f"Skipped missing table: {table}")
                continue

            existing = {col["name"] for col in inspector.get_columns(table)}
            for column in COLUMNS_TO_DROP:
                if column not in existing:
                    print(f"  {table}.{column}: not present, skipped")
                    continue

                conn.execute(text(f'ALTER TABLE "{table}" DROP COLUMN "{column}"'))
                print(f"  Dropped {table}.{column}")

    engine.dispose()
    print("\nDone.")


if __name__ == "__main__":
    migrate()
