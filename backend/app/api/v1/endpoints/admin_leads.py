import csv
from datetime import date, datetime, timedelta
from io import StringIO
from typing import List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr, Field, model_validator
from sqlalchemy import asc, desc, func, or_
from sqlalchemy.orm import Session

from app.core.auth import get_current_admin
from app.db.models import LEAD_SOURCES, LEAD_STATUSES, LEAD_TYPES, Lead
from app.db.session import get_db

router = APIRouter(dependencies=[Depends(get_current_admin)])

LeadType = Literal[LEAD_TYPES]
LeadSource = Literal[LEAD_SOURCES]
LeadStatus = Literal[LEAD_STATUSES]
SORTS = {"created_at": Lead.created_at, "status": Lead.status, "country": Lead.country,
         "follow_up_on": Lead.follow_up_on, "name": Lead.name}


class LeadOut(BaseModel):
    id: int
    type: str
    source: str
    status: str
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    category_slug: Optional[str] = None
    subcategory_slug: Optional[str] = None
    product_attributes: Optional[dict] = None
    name: str
    company: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    country: Optional[str] = None
    quantity: Optional[str] = None
    subject: Optional[str] = None
    message: Optional[str] = None
    assigned_to: Optional[str] = None
    notes: Optional[str] = None
    follow_up_on: Optional[date] = None
    email_sent: Optional[bool] = None
    legacy_table: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class LeadList(BaseModel):
    items: List[LeadOut]
    total: int
    page: int
    page_size: int
    status_counts: dict[str, int]
    follow_ups_due: int


class _Editable(BaseModel):
    product_name: Optional[str] = Field(None, max_length=255)
    company: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=64)
    country: Optional[str] = Field(None, max_length=255)
    quantity: Optional[str] = Field(None, max_length=255)
    subject: Optional[str] = Field(None, max_length=255)
    message: Optional[str] = Field(None, max_length=10000)
    assigned_to: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = Field(None, max_length=20000)
    follow_up_on: Optional[date] = None


class LeadCreate(_Editable):
    """A lead logged by hand: WhatsApp chat, marketplace enquiry, trade-fair card..."""
    type: LeadType
    source: LeadSource
    status: LeadStatus = "new"
    name: str = Field(..., min_length=1, max_length=255)
    email: Optional[EmailStr] = None

    @model_validator(mode="after")
    def _contact(self):
        if not self.email and not self.phone:
            raise ValueError("Give an email or a phone number")
        return self


class LeadUpdate(_Editable):
    status: Optional[LeadStatus] = None
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None


def _filtered(db: Session, q, type, source, status, country, assigned_to, date_from, date_to, due):
    qs = db.query(Lead)
    if q and q.strip():
        like = "%" + q.strip().replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%"
        qs = qs.filter(or_(*[c.ilike(like) for c in (
            Lead.name, Lead.company, Lead.email, Lead.phone, Lead.country, Lead.product_name,
            Lead.subject, Lead.message, Lead.notes)]))
    for col, val in ((Lead.type, type), (Lead.source, source), (Lead.status, status), (Lead.assigned_to, assigned_to)):
        if val:
            qs = qs.filter(col == val)
    if country:
        qs = qs.filter(Lead.country.ilike(country))
    if date_from:
        qs = qs.filter(Lead.created_at >= date_from)
    if date_to:
        qs = qs.filter(Lead.created_at < date_to + timedelta(days=1))  # inclusive of the whole day
    if due:
        qs = qs.filter(Lead.follow_up_on <= date.today(), Lead.status.notin_(("won", "lost", "spam")))
    return qs


def _ordered(qs, sort: str):
    key = sort.lstrip("-")
    if key not in SORTS:
        raise HTTPException(400, f"sort must be one of {sorted(SORTS)} (prefix - for descending)")
    order = desc if sort.startswith("-") else asc
    return qs.order_by(order(SORTS[key]).nulls_last(), desc(Lead.id))


class _Filters:
    def __init__(self, q: Optional[str] = None, type: Optional[LeadType] = None, source: Optional[LeadSource] = None,
                 status: Optional[LeadStatus] = None, country: Optional[str] = None,
                 assigned_to: Optional[str] = None, date_from: Optional[date] = None,
                 date_to: Optional[date] = None, due: bool = False, sort: str = "-created_at"):
        self.args = (q, type, source, status, country, assigned_to, date_from, date_to, due)
        self.sort = sort


@router.get("/", response_model=LeadList)
def list_leads(f: _Filters = Depends(), page: int = Query(1, ge=1), page_size: int = Query(25, ge=1, le=200),
               db: Session = Depends(get_db)):
    qs = _filtered(db, *f.args)
    total = qs.count()
    items = _ordered(qs, f.sort).offset((page - 1) * page_size).limit(page_size).all()
    # Counts ignore the status filter so the tabs always show every bucket.
    q, type, source, _status, *rest = f.args
    counts = dict(_filtered(db, q, type, source, None, *rest).with_entities(Lead.status, func.count())
                  .group_by(Lead.status).all())
    due = _filtered(db, None, None, None, None, None, None, None, None, True).count()
    return LeadList(items=items, total=total, page=page, page_size=page_size,
                    status_counts={s: counts.get(s, 0) for s in LEAD_STATUSES}, follow_ups_due=due)


@router.post("/", response_model=LeadOut, status_code=201)
def create_lead(body: LeadCreate, db: Session = Depends(get_db)):
    lead = Lead(**{k: v for k, v in body.model_dump(mode="json").items() if v not in (None, "")},
                email_sent=None)
    if body.follow_up_on:
        lead.follow_up_on = body.follow_up_on
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead


@router.get("/{lead_id}", response_model=LeadOut)
def get_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = db.get(Lead, lead_id)
    if not lead:
        raise HTTPException(404, "Not found")
    return lead


@router.patch("/{lead_id}", response_model=LeadOut)
def update_lead(lead_id: int, body: LeadUpdate, db: Session = Depends(get_db)):
    lead = db.get(Lead, lead_id)
    if not lead:
        raise HTTPException(404, "Not found")
    changes = body.model_dump(exclude_unset=True)
    for k, v in changes.items():
        setattr(lead, k, None if v == "" else (str(v) if k == "email" and v else v))
    if not lead.email and not lead.phone:
        raise HTTPException(422, "A lead needs an email or a phone number")
    db.commit()
    db.refresh(lead)
    return lead


def _cell(v) -> str:
    """Neutralise spreadsheet formulas in user-supplied text (=, +, -, @ run as formulas in Excel)."""
    s = "" if v is None else str(v)
    return "'" + s if s[:1] in ("=", "+", "-", "@", "\t", "\r") else s


EXPORT_COLS = ["id", "created_at", "type", "source", "status", "name", "company", "email", "phone", "country",
               "product_name", "quantity", "subject", "message", "assigned_to", "follow_up_on", "notes"]


@router.get("/export/csv")
def export_leads(f: _Filters = Depends(), db: Session = Depends(get_db)):
    sio = StringIO()
    w = csv.writer(sio)
    w.writerow(EXPORT_COLS)
    for lead in _ordered(_filtered(db, *f.args), f.sort).all():
        w.writerow([_cell(getattr(lead, c)) for c in EXPORT_COLS])
    sio.seek(0)
    return StreamingResponse(iter([sio.getvalue()]), media_type="text/csv",
                             headers={"Content-Disposition": f"attachment; filename=leads-{date.today()}.csv"})
