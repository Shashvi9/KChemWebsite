"""
One-time migration: move Food & Lake Color subcategories from
dyes-intermediates into a dedicated food-pharma-colors category.

Usage:
    cd backend
    source venv/bin/activate
    python migrate_food_pharma_colors.py
"""
import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

load_dotenv(Path(__file__).parent / ".env")

from app.db.models import Category, Subcategory, Product

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable not set")

FOOD_LAKE_SUBCATEGORY_SLUGS = [
    "dc-colors",
    "fdc-colors",
    "food-colors",
    "blended-colors",
    "lake-colors",
]

CATEGORY_NAME = "Food & Pharma Colors"
CATEGORY_SLUG = "food-pharma-colors"


def migrate():
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    db = Session()

    try:
        category = db.query(Category).filter(Category.slug == CATEGORY_SLUG).first()
        if not category:
            category = Category(name=CATEGORY_NAME, slug=CATEGORY_SLUG)
            db.add(category)
            db.flush()
            print(f"Created category: {CATEGORY_NAME} (id={category.id})")
        else:
            print(f"Using existing category: {CATEGORY_NAME} (id={category.id})")

        moved_subcategories = 0
        moved_products = 0

        for slug in FOOD_LAKE_SUBCATEGORY_SLUGS:
            subcategory = db.query(Subcategory).filter(Subcategory.slug == slug).first()
            if not subcategory:
                print(f"  Skipped missing subcategory: {slug}")
                continue

            old_category_id = subcategory.category_id
            subcategory.category_id = category.id
            moved_subcategories += 1

            product_count = (
                db.query(Product)
                .filter(Product.subcategory_id == subcategory.id)
                .update({Product.category_id: category.id}, synchronize_session=False)
            )
            moved_products += product_count

            print(
                f"  Moved {subcategory.name} ({slug}): "
                f"{product_count} products, category {old_category_id} -> {category.id}"
            )

        db.commit()
        print(
            f"\nDone. Moved {moved_subcategories} subcategories "
            f"and updated {moved_products} products."
        )
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
        engine.dispose()


if __name__ == "__main__":
    migrate()
