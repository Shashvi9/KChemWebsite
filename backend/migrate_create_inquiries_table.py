"""
Create the inquiries table if it does not already exist.

Usage:
    cd backend
    python migrate_create_inquiries_table.py
"""
import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text

load_dotenv(Path(__file__).parent / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable not set")


def migrate():
    engine = create_engine(DATABASE_URL)
    inspector = inspect(engine)

    if "inquiries" in inspector.get_table_names():
        print("Table inquiries already exists, skipping.")
        engine.dispose()
        return

    with engine.begin() as conn:
        conn.execute(
            text(
                """
                CREATE TABLE inquiries (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    subject VARCHAR(255) NOT NULL,
                    message TEXT NOT NULL,
                    status VARCHAR(32) NOT NULL DEFAULT 'pending',
                    delivery_error TEXT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    delivered_at TIMESTAMPTZ NULL
                )
                """
            )
        )

    engine.dispose()
    print("Created inquiries table.")


if __name__ == "__main__":
    migrate()
