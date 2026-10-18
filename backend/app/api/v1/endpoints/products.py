import re

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import exists, func, or_
from sqlalchemy.orm import selectinload
from typing import List, Optional

from app.db.session import get_db
from app.core import cas
from app.db.models import CasAlias, Product, Category, Subcategory, product_subcategories
from app.schemas import schemas

router = APIRouter()
_LOAD = (selectinload(Product.cas_aliases), selectinload(Product.applications))  # avoid N+1 per product row


def _same(a: str, b: str) -> bool:
    norm = lambda x: re.sub(r"[\s-]+", " ", x).strip().lower()
    return norm(a) == norm(b)


def _product_to_api(product: Product) -> schemas.Product:
    """Flatten a product into the attribute columns the product table shows."""
    attributes: dict = {}
    cas_all = [product.cas_number.strip()] if product.cas_number and product.cas_number.strip() else []
    cas_all += [a.cas_number for a in product.cas_aliases if a.cas_number not in cas_all]
    if cas_all:
        attributes["cas"] = " / ".join(cas_all)
    if product.ci_name and not _same(product.ci_name, product.name):
        attributes["ci_name"] = product.ci_name
    if product.ci_number:
        attributes["ci_number"] = product.ci_number
    if product.e_number:
        attributes["e_number"] = product.e_number
    if product.synonyms:
        attributes["also_known_as"] = ", ".join(product.synonyms)
    if product.applications:
        attributes["applications"] = ", ".join(a.name for a in product.applications)
    for k, v in (product.specs or {}).items():
        if k.startswith("_"):  # internal bookkeeping such as _sources
            continue
        attributes[k] = ", ".join(map(str, v)) if isinstance(v, list) else v
    for col in ["molecular_formula", "molecular_weight", "appearance", "description"]:
        if getattr(product, col) is not None and getattr(product, col) != "":
            attributes[col] = str(getattr(product, col))

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
        .options(*_LOAD)
        .filter(Product.is_active.is_(True))
        .filter(
            or_(
                Product.name.ilike(like),
                Product.ci_name.ilike(like),
                Product.cas_number.ilike(like),
                exists().where(CasAlias.product_id == Product.id, CasAlias.cas_number == term),
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
    query = db.query(Product).options(*_LOAD).filter(Product.is_active.is_(True))
    query = _apply_category_filters(query, category_slug, subcategory_slug)
    if category_slug or subcategory_slug:
        # Source-sheet order (ids follow it: e.g. acid dyes grouped by shade), unless sort_order is set.
        query = query.order_by(product_subcategories.c.sort_order, Product.id)
    else:
        query = query.order_by(Product.id)

    products = query.offset(skip).limit(limit).all()
    return [_product_to_api(p) for p in products]


# ---- Product pages (one URL per product) -------------------------------------------------------

_JUNK_NAMES = re.compile(r"^(product name|name|each ml contain)", re.I)


def is_indexable(p: Product) -> bool:
    """Search engines only see rows we trust: no header/notes rows, no CAS that fails its check digit.
    The rows stay on the site and in the DB; they are just marked noindex until reviewed."""
    if _JUNK_NAMES.match(p.name.strip()):
        return False
    raw = (p.cas_number or "").strip().strip("-")
    return not raw or bool(cas.normalize(p.cas_number))


def _detail(p: Product, ranges: list[schemas.RangeRef], related: list[Product]) -> schemas.ProductDetail:
    base = _product_to_api(p)
    return schemas.ProductDetail(
        **base.model_dump(),
        product_type=p.product_type,
        ranges=ranges,
        related=[schemas.ProductRef(name=r.name, slug=r.slug, cas=r.cas_number) for r in related],
        documents=[schemas.ProductDocumentOut(type=d.document_type, url=d.file_url) for d in p.documents],
        indexable=is_indexable(p),
        updated_at=p.updated_at.isoformat() if p.updated_at else None,
    )


def _ranges_by_product(db: Session, product_ids: list[int] | None = None) -> dict[int, list[schemas.RangeRef]]:
    q = (db.query(product_subcategories.c.product_id, Subcategory, Category)
         .join(Subcategory, Subcategory.id == product_subcategories.c.subcategory_id)
         .join(Category, Category.id == Subcategory.category_id)
         .filter(Subcategory.is_active.is_(True)))
    if product_ids is not None:
        q = q.filter(product_subcategories.c.product_id.in_(product_ids))
    out: dict[int, list[schemas.RangeRef]] = {}
    for pid, sub, cat in q.order_by(Subcategory.sort_order, Subcategory.id).all():
        out.setdefault(pid, []).append(schemas.RangeRef(name=sub.name, slug=sub.slug, category_slug=cat.slug,
                                                        category_name=cat.name))
    return out


def _with_primary_first(ranges: list[schemas.RangeRef], primary_sub: Subcategory | None):
    if primary_sub is None:
        return ranges
    return sorted(ranges, key=lambda r: r.slug != primary_sub.slug)


def _related(siblings: list[Product], p: Product, n: int = 12) -> list[Product]:
    """Neighbours in the same range by catalogue order (source sheets group shades together)."""
    others = [s for s in siblings if s.id != p.id]
    return sorted(others, key=lambda s: abs(s.id - p.id))[:n]


_DETAIL_LOAD = _LOAD + (selectinload(Product.documents), selectinload(Product.subcategory))


@router.get("/by-slug/{slug}", response_model=schemas.ProductDetail)
def product_by_slug(slug: str, db: Session = Depends(get_db)):
    p = db.query(Product).options(*_DETAIL_LOAD).filter(Product.slug == slug, Product.is_active.is_(True)).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    siblings = (db.query(Product).filter(Product.subcategory_id == p.subcategory_id, Product.is_active.is_(True))
                .all() if p.subcategory_id else [])
    ranges = _with_primary_first(_ranges_by_product(db, [p.id]).get(p.id, []), p.subcategory)
    return _detail(p, ranges, _related(siblings, p))


@router.get("/static-export", response_model=List[schemas.ProductDetail])
def static_export(db: Session = Depends(get_db)):
    """All active products with page data, in one response, for pre-rendering and the sitemap."""
    products = db.query(Product).options(*_DETAIL_LOAD).filter(Product.is_active.is_(True)).order_by(Product.id).all()
    by_sub: dict[int, list[Product]] = {}
    for p in products:
        if p.subcategory_id:
            by_sub.setdefault(p.subcategory_id, []).append(p)
    ranges = _ranges_by_product(db)
    return [_detail(p, _with_primary_first(ranges.get(p.id, []), p.subcategory), _related(by_sub.get(p.subcategory_id, []), p))
            for p in products]
