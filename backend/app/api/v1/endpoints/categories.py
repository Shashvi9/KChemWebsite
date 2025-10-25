from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.db.models import Category, Subcategory
from app.schemas import schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.Category])
def read_categories(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    categories = db.query(Category).offset(skip).limit(limit).all()
    return categories

@router.get("/{category_slug}/subcategories", response_model=List[schemas.Subcategory])
def read_subcategories_by_category(
    category_slug: str, db: Session = Depends(get_db)
):
    category = db.query(Category).filter(Category.slug == category_slug).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category.subcategories
