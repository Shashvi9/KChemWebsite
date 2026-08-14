from datetime import datetime, time
from io import StringIO
import csv
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, cast, String

from app.core.auth import get_current_admin
from app.db.session import get_db
from app.db.models import SampleRequest

router = APIRouter(dependencies=[Depends(get_current_admin)])

SORT_COLUMNS = {
    "created_at": SampleRequest.created_at,
    "status": SampleRequest.status,
    "name": SampleRequest.name,
    "company": SampleRequest.company,
    "email": SampleRequest.email,
    "product_name": SampleRequest.product_name,
    "category_slug": SampleRequest.category_slug,
    "subcategory_slug": SampleRequest.subcategory_slug,
    "quantity": SampleRequest.quantity,
    "country": SampleRequest.country,
    "id": SampleRequest.id,
}


class SampleRequestItem(BaseModel):
    id: int
    created_at: Optional[datetime]
    status: str
    name: str
    company: str
    email: str
    phone: Optional[str] = None
    country: Optional[str] = None
    category_slug: str
    subcategory_slug: str
    product_name: Optional[str] = None
    quantity: Optional[str] = None
    assigned_to: Optional[str] = None

    class Config:
        from_attributes = True


class SampleRequestDetail(SampleRequestItem):
    attributes: Optional[dict] = None
    use_case: Optional[str] = None
    internal_notes: Optional[str] = None


class SampleRequestListResponse(BaseModel):
    items: List[SampleRequestItem]
    total: int
    page: int
    page_size: int


def _apply_filters(qs, q: Optional[str], status: Optional[str], date_from: Optional[str], date_to: Optional[str]):
    if q:
        q = q.strip()
        if q:
            like = f"%{q}%"
            qs = qs.filter(
                (SampleRequest.name.ilike(like)) |
                (SampleRequest.company.ilike(like)) |
                (SampleRequest.email.ilike(like)) |
                (SampleRequest.product_name.ilike(like)) |
                (SampleRequest.phone.ilike(like)) |
                (SampleRequest.country.ilike(like)) |
                (SampleRequest.category_slug.ilike(like)) |
                (SampleRequest.subcategory_slug.ilike(like)) |
                (SampleRequest.quantity.ilike(like)) |
                (cast(SampleRequest.product_id, String).ilike(like))
            )
    if status:
        qs = qs.filter(SampleRequest.status == status)
    if date_from:
        try:
            dt_from = datetime.strptime(date_from, "%Y-%m-%d")
            qs = qs.filter(SampleRequest.created_at >= dt_from)
        except ValueError:
            raise HTTPException(status_code=422, detail="date_from must be YYYY-MM-DD")
    if date_to:
        try:
            dt_to = datetime.combine(datetime.strptime(date_to, "%Y-%m-%d").date(), time.max)
            qs = qs.filter(SampleRequest.created_at <= dt_to)
        except ValueError:
            raise HTTPException(status_code=422, detail="date_to must be YYYY-MM-DD")
    return qs


def _apply_sort(qs, sort: Optional[str]):
    sort_value = sort or "-created_at"
    descending = sort_value.startswith("-")
    sort_key = sort_value[1:] if descending else sort_value
    order = desc if descending else asc

    order_col = SORT_COLUMNS.get(sort_key)
    if order_col is None:
        raise HTTPException(status_code=422, detail="Unsupported sort field")

    id_order = desc if descending else asc
    if sort_key == "id":
        return qs.order_by(order(order_col))
    return qs.order_by(order(order_col), id_order(SampleRequest.id))


@router.get("/", response_model=SampleRequestListResponse)
def list_sample_requests(
    db: Session = Depends(get_db),
    q: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    sort: Optional[str] = Query("-created_at"),
):
    qs = db.query(SampleRequest)
    qs = _apply_filters(qs, q, status, date_from, date_to)

    total = qs.count()

    qs = _apply_sort(qs, sort)

    # Pagination
    items = qs.offset((page - 1) * page_size).limit(page_size).all()
    return SampleRequestListResponse(
        items=items, total=total, page=page, page_size=page_size
    )


@router.get("/{req_id}", response_model=SampleRequestDetail)
def get_sample_request(req_id: int, db: Session = Depends(get_db)):
    obj = db.query(SampleRequest).get(req_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return obj


class UpdateRequest(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    internal_notes: Optional[str] = None


@router.patch("/{req_id}", response_model=SampleRequestDetail)
def update_sample_request(req_id: int, body: UpdateRequest, db: Session = Depends(get_db)):
    obj = db.query(SampleRequest).get(req_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    if body.status is not None:
        obj.status = body.status
    if body.assigned_to is not None:
        obj.assigned_to = body.assigned_to
    if body.internal_notes is not None:
        obj.internal_notes = body.internal_notes
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.post("/export")
def export_sample_requests(
    db: Session = Depends(get_db),
    q: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    sort: Optional[str] = Query("-created_at"),
):
    qs = db.query(SampleRequest)
    qs = _apply_filters(qs, q, status, date_from, date_to)
    qs = _apply_sort(qs, sort)

    # CSV build
    sio = StringIO()
    writer = csv.writer(sio)
    headers = [
        "id","created_at","status","name","company","email","phone","country",
        "category_slug","subcategory_slug","product_name","quantity","assigned_to"
    ]
    writer.writerow(headers)
    for r in qs.all():
        writer.writerow([
            r.id or '', r.created_at or '', r.status or '', r.name or '', r.company or '', r.email or '',
            r.phone or '', r.country or '', r.category_slug or '', r.subcategory_slug or '', r.product_name or '',
            r.quantity or '', r.assigned_to or ''
        ])

    sio.seek(0)
    return StreamingResponse(sio, media_type="text/csv", headers={
        "Content-Disposition": "attachment; filename=sample_requests.csv"
    })
