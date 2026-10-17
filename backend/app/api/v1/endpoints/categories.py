from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.models import Category, Product, Subcategory, product_subcategories
from app.db.session import get_db
from app.schemas import schemas

router = APIRouter()


def _counts(db: Session, category_id: int | None = None) -> list[tuple[Subcategory, int]]:
    """Active subcategories with their number of active products; empty ones are hidden, not deleted."""
    n = func.count(Product.id)
    q = (db.query(Subcategory, n)
         .join(product_subcategories, product_subcategories.c.subcategory_id == Subcategory.id)
         .join(Product, (Product.id == product_subcategories.c.product_id) & Product.is_active.is_(True))
         .filter(Subcategory.is_active.is_(True))
         .group_by(Subcategory.id)
         .having(n > 0)
         .order_by(Subcategory.sort_order, Subcategory.id))
    if category_id is not None:
        q = q.filter(Subcategory.category_id == category_id)
    return q.all()


def _with_count(sub: Subcategory, count: int) -> schemas.SubcategoryWithCount:
    return schemas.SubcategoryWithCount(id=sub.id, name=sub.name, slug=sub.slug, category_id=sub.category_id,
                                        product_count=count)


@router.get("/", response_model=List[schemas.Category])
def read_categories(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    return (db.query(Category).filter(Category.is_active.is_(True))
            .order_by(Category.sort_order, Category.id).offset(skip).limit(limit).all())


@router.get("/overview", response_model=List[schemas.CategoryOverview])
def categories_overview(db: Session = Depends(get_db)):
    """Every active category with its subcategories and product counts, in one request (homepage, menus)."""
    by_cat: dict[int, list] = {}
    for sub, count in _counts(db):
        by_cat.setdefault(sub.category_id, []).append(_with_count(sub, count))
    # A product listed under two grades counts once per category.
    totals = dict(db.query(Product.category_id, func.count(Product.id))
                  .filter(Product.is_active.is_(True)).group_by(Product.category_id).all())
    cats = db.query(Category).filter(Category.is_active.is_(True)).order_by(Category.sort_order, Category.id).all()
    return [schemas.CategoryOverview(id=c.id, name=c.name, slug=c.slug, product_count=totals.get(c.id, 0),
                                     subcategories=by_cat.get(c.id, [])) for c in cats if by_cat.get(c.id)]


@router.get("/{category_slug}/subcategories", response_model=List[schemas.SubcategoryWithCount])
def read_subcategories_by_category(category_slug: str, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.slug == category_slug).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return [_with_count(sub, count) for sub, count in _counts(db, category.id)]
