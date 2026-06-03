from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional

from app.db.session import get_db
from app.db.models import Product, Category, Subcategory
from app.schemas import schemas

router = APIRouter()


def _product_to_api(product: Product) -> schemas.Product:
    """Map production DB columns to the API shape the frontend expects."""
    attributes: dict = {}
    if product.cas_number:
        attributes["cas"] = product.cas_number
    if product.molecular_formula:
        attributes["molecular_formula"] = product.molecular_formula
    if product.molecular_weight:
        attributes["molecular_weight"] = product.molecular_weight
    if product.appearance:
        attributes["appearance"] = product.appearance
    if product.color:
        attributes["color"] = product.color
    if product.description:
        attributes["description"] = product.description

    return schemas.Product(
        id=product.id,
        name=product.name,
        form=None,
        attributes=attributes or None,
        subcategory_id=product.subcategory_id,
    )


def _apply_category_filters(query, category_slug: Optional[str], subcategory_slug: Optional[str]):
    if category_slug:
        query = query.join(Subcategory).join(Category)
        query = query.filter(Category.slug == category_slug)

    if subcategory_slug:
        if not category_slug:
            query = query.join(Subcategory)
        query = query.filter(Subcategory.slug == subcategory_slug)

    return query


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
    products = (
        db.query(Product)
        .filter(
            or_(
                Product.name.ilike(search_term),
                Product.cas_number.ilike(search_term),
            )
        )
        .limit(limit)
        .all()
    )
    return [_product_to_api(p) for p in products]


@router.get("/forms/", response_model=List[str])
def get_forms(
    db: Session = Depends(get_db),
    category_slug: Optional[str] = None,
    subcategory_slug: Optional[str] = None,
):
    """Get unique form values for products in a category/subcategory."""
    # Production DB stores product specs in dedicated columns, not a form field.
    return []


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
    query = _apply_category_filters(query, category_slug, subcategory_slug)

    products = query.offset(skip).limit(limit).all()
    return [_product_to_api(p) for p in products]
