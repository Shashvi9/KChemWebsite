from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.core.auth import get_current_admin
from app.db.models import Inquiry
from app.db.session import get_db

router = APIRouter(dependencies=[Depends(get_current_admin)])


class InquiryListItem(BaseModel):
    id: int
    name: str
    email: str
    subject: str
    message: str
    status: str
    delivery_error: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    delivered_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class InquiryListResponse(BaseModel):
    items: List[InquiryListItem]
    total: int
    page: int
    page_size: int


@router.get("/", response_model=InquiryListResponse)
def list_inquiries(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    qs = db.query(Inquiry)
    total = qs.count()
    items = (
        qs.order_by(desc(Inquiry.created_at), desc(Inquiry.id))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return InquiryListResponse(items=items, total=total, page=page, page_size=page_size)
