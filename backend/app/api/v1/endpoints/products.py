from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.db.models import Product, Category, Subcategory
from app.schemas import schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.Product])
def read_products(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    category_slug: Optional[str] = None,
    subcategory_slug: Optional[str] = None,
    form: Optional[str] = None,
):
    query = db.query(Product)

    if category_slug:
        query = query.join(Subcategory).join(Category)
        query = query.filter(Category.slug == category_slug)

    if subcategory_slug:
        if not category_slug:
            query = query.join(Subcategory)
        query = query.filter(Subcategory.slug == subcategory_slug)

    if form:
        query = query.filter(Product.form == form)

    products = query.offset(skip).limit(limit).all()
    return products
