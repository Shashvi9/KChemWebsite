from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, cast, String
from typing import List, Optional

from app.db.session import get_db
from app.db.models import Product, Category, Subcategory
from app.schemas import schemas

router = APIRouter()

@router.get("/search", response_model=List[schemas.Product])
def search_products(
    q: str,
    db: Session = Depends(get_db),
    limit: int = 50,
):
    """Search products by name or CAS number."""
    if not q or len(q.strip()) < 2:
        return []
    
    search_term = f"%{q.strip()}%"
    
    # Search in product name or in attributes JSON (for CAS number)
    query = db.query(Product).filter(
        or_(
            Product.name.ilike(search_term),
            cast(Product.attributes, String).ilike(search_term)
        )
    )
    
    products = query.limit(limit).all()
    return products

@router.get("/forms/", response_model=List[str])
def get_forms(
    db: Session = Depends(get_db),
    category_slug: Optional[str] = None,
    subcategory_slug: Optional[str] = None,
):
    """Get unique form values for products in a category/subcategory."""
    query = db.query(Product.form).distinct()

    if category_slug:
        query = query.join(Subcategory).join(Category)
        query = query.filter(Category.slug == category_slug)

    if subcategory_slug:
        if not category_slug:
            query = query.join(Subcategory)
        query = query.filter(Subcategory.slug == subcategory_slug)

    forms = [f[0] for f in query.all() if f[0] is not None]
    return sorted(forms)


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
