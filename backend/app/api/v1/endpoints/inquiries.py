import logging
import os
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.core import email
from app.core.ratelimit import limit
from app.db.models import Inquiry
from app.db.session import SessionLocal, get_db

router = APIRouter()
log = logging.getLogger("kewin.inquiries")


class InquiryRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    company: Optional[str] = Field(None, max_length=255)
    country: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=64)
    subject: str = Field(..., min_length=2, max_length=255)
    message: str = Field(..., min_length=10, max_length=5000)
    website: Optional[str] = None  # honeypot: hidden field, bots fill it


def _row(label: str, value: Optional[str]) -> str:
    return (f'<tr><td style="padding:6px 10px;color:#555;white-space:nowrap;"><strong>{label}</strong></td>'
            f'<td style="padding:6px 10px;">{email.esc(value or "-")}</td></tr>')


def _notify(inquiry_id: int, req: InquiryRequest):
    html = f"""
    <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:720px;margin:0 auto;border:1px solid #eee;border-radius:10px;overflow:hidden">
      <div style="background:#1e40af;color:white;padding:14px 18px;font-weight:600;">Kewin Chemicals · Website Inquiry #{inquiry_id}</div>
      <div style="padding:16px">
        <table style="border-collapse:collapse;width:100%">
          {_row('From', req.name)}{_row('Email', str(req.email))}{_row('Company', req.company)}
          {_row('Country', req.country)}{_row('Phone', req.phone)}{_row('Subject', req.subject)}
        </table>
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0"/>
        <div style="padding:12px;background:#f9fafb;border-radius:6px;color:#333;line-height:1.6">{email.esc(req.message)}</div>
        <div style="margin-top:16px;color:#666;font-size:12px">Reply to this email to contact the sender directly.</div>
      </div>
    </div>"""
    to = os.environ.get("INQUIRY_TO", os.environ.get("SAMPLE_REQUEST_TO", email.DEFAULT_TO))
    sent = email.send(to, f"[Website Inquiry] {req.subject} – from {req.name} ({req.country or '-'})", html, str(req.email))
    if sent:
        with SessionLocal() as db:
            db.query(Inquiry).filter(Inquiry.id == inquiry_id).update({"email_sent": True})
            db.commit()


@router.post("/", status_code=200)
def create_inquiry(req: InquiryRequest, request: Request, tasks: BackgroundTasks, db: Session = Depends(get_db)):
    if req.website:  # bot; pretend success
        return {"status": "ok", "message": "Inquiry submitted successfully"}
    limit(request, "inquiry")
    try:
        record = Inquiry(**req.model_dump(exclude={"website"}, mode="json"))
        db.add(record)
        db.commit()
    except Exception:
        db.rollback()
        log.exception("Failed to save inquiry")
        raise HTTPException(status_code=500, detail="Could not submit right now. Please email or WhatsApp us.")
    tasks.add_task(_notify, record.id, req)
    return {"status": "ok", "id": record.id, "message": "Inquiry submitted successfully"}
