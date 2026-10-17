from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from sqlalchemy import exists

from app.db.models import Category, Product, Subcategory, product_subcategories
from app.schemas import schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.Category])
def read_categories(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    categories = (db.query(Category).filter(Category.is_active.is_(True))
                  .order_by(Category.sort_order, Category.id).offset(skip).limit(limit).all())
    return categories

@router.get("/{category_slug}/subcategories", response_model=List[schemas.Subcategory])
def read_subcategories_by_category(
    category_slug: str, db: Session = Depends(get_db)
):
    category = db.query(Category).filter(Category.slug == category_slug).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    has_products = exists().where(
        product_subcategories.c.subcategory_id == Subcategory.id,
        product_subcategories.c.product_id == Product.id,
        Product.is_active.is_(True),
    )
    # Empty subcategories are hidden, not deleted.
    return (db.query(Subcategory)
            .filter(Subcategory.category_id == category.id, Subcategory.is_active.is_(True), has_products)
            .order_by(Subcategory.sort_order, Subcategory.id).all())
