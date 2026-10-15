import re

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional

from app.db.session import get_db
from app.db.models import Product, Category, Subcategory, product_subcategories
from app.schemas import schemas

router = APIRouter()


def _same(a: str, b: str) -> bool:
    norm = lambda x: re.sub(r"[\s-]+", " ", x).strip().lower()
    return norm(a) == norm(b)


def _product_to_api(product: Product) -> schemas.Product:
    """Flatten a product into the attribute columns the product table shows."""
    attributes: dict = {}
    cas_display = " / ".join(product.cas_numbers) or product.cas_number
    if cas_display:
        attributes["cas"] = cas_display
    if product.ci_name and not _same(product.ci_name, product.name):
        attributes["ci_name"] = product.ci_name
    if product.ci_number:
        attributes["ci_number"] = product.ci_number
    if product.e_number:
        attributes["e_number"] = product.e_number
    if product.synonyms:
        attributes["also_known_as"] = ", ".join(product.synonyms)
    if product.applications:
        attributes["applications"] = ", ".join(product.applications)
    for k, v in (product.specs or {}).items():
        attributes[k] = ", ".join(map(str, v)) if isinstance(v, list) else v
    for col in ["molecular_formula", "molecular_weight", "appearance", "description"]:
        if getattr(product, col):
            attributes[col] = getattr(product, col)

    return schemas.Product(
        id=product.id,
        name=product.name,
        slug=product.slug,
        attributes=attributes or None,
        subcategory_id=product.subcategory_id,
    )


def _apply_category_filters(query, category_slug: Optional[str], subcategory_slug: Optional[str]):
    # Listings go through product_subcategories so one product can appear under several grades.
    if category_slug or subcategory_slug:
        query = query.join(product_subcategories, product_subcategories.c.product_id == Product.id).join(
            Subcategory, Subcategory.id == product_subcategories.c.subcategory_id)
    if category_slug:
        query = query.join(Category, Category.id == Subcategory.category_id).filter(Category.slug == category_slug)
    if subcategory_slug:
        query = query.filter(Subcategory.slug == subcategory_slug)
    return query


@router.get("/search", response_model=List[schemas.Product])
def search_products(
    q: str,
    db: Session = Depends(get_db),
    limit: int = Query(50, ge=1, le=200),
):
    """Search products by name or CAS number."""
    if not q or len(q.strip()) < 2:
        return []

    term = q.strip()
    like = "%" + term.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%"
    products = (
        db.query(Product)
        .filter(Product.is_active.is_(True))
        .filter(
            or_(
                Product.name.ilike(like),
                Product.ci_name.ilike(like),
                Product.cas_number.ilike(like),
                Product.cas_numbers.any(term),
                func.array_to_string(Product.synonyms, " ").ilike(like),
            )
        )
        .order_by(Product.name)
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
    skip: int = Query(0, ge=0),
    limit: int = Query(1000, ge=1, le=2000),  # was 100: pages over 100 products were silently cut off
    category_slug: Optional[str] = None,
    subcategory_slug: Optional[str] = None,
):
    query = db.query(Product).filter(Product.is_active.is_(True))
    query = _apply_category_filters(query, category_slug, subcategory_slug)
    if category_slug or subcategory_slug:
        query = query.order_by(product_subcategories.c.sort_order, Product.name, Product.id)
    else:
        query = query.order_by(Product.id)

    products = query.offset(skip).limit(limit).all()
    return [_product_to_api(p) for p in products]
