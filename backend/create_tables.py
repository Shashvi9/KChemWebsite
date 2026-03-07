"""
Database migration script to create tables in Neon PostgreSQL
Run this once to set up the schema in your Neon database
"""
import os
from sqlalchemy import create_engine
from app.db.base import Base
from app.db.models import Category, Subcategory, Product, SampleRequest

# Your Neon database URL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://neondb_owner:npg_G2nC4JzgSHOE@ep-red-flower-a4n86t9b-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require")

def create_tables():
    """Create all tables in the database"""
    print("Connecting to Neon database...")
    engine = create_engine(DATABASE_URL)
    
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    print("✅ Tables created successfully!")
    print("\nCreated tables:")
    print("  - categories")
    print("  - subcategories")
    print("  - products")
    print("  - sample_requests")
    
    engine.dispose()

if __name__ == "__main__":
    create_tables()
