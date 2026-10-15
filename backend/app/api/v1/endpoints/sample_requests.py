from fastapi import APIRouter, BackgroundTasks, HTTPException, Depends, Request
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
import logging
import os
from sqlalchemy.orm import Session

from app.core import email
from app.core.ratelimit import limit

from app.db.session import get_db
from app.db.models import SampleRequest as SampleRequestModel

router = APIRouter()
log = logging.getLogger("kewin.sample_requests")

class SampleRequest(BaseModel):
    category_slug: str = Field("search", max_length=255)
    subcategory_slug: str = Field("search", max_length=255)
    product_id: Optional[int] = None
    product_name: Optional[str] = Field(None, max_length=255)
    attributes: Optional[Dict[str, Any]] = None

    quantity: Optional[str] = Field(None, max_length=255)
    use_case: Optional[str] = Field(None, max_length=2000)

    name: str = Field(..., min_length=2, max_length=255)
    company: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=64)
    country: Optional[str] = Field(None, max_length=255)

    send_copy_to_requester: bool = False
    website: Optional[str] = None  # honeypot: hidden field, bots fill it


def _send_sample_email(req: SampleRequest):
    to_email = os.environ.get("SAMPLE_REQUEST_TO", email.DEFAULT_TO)
    subject = f"[Sample Request] {req.product_name or req.subcategory_slug} – {req.company} ({req.country or '-'})"

    esc = email.esc

    def row(label: str, value: str) -> str:
        return f'<tr><td style="padding:6px 10px;color:#555;white-space:nowrap;"><strong>{esc(label)}</strong></td><td style="padding:6px 10px;color:#111;">{esc(value)}</td></tr>'

    attrs_html = ""
    if req.attributes:
        pairs = [f'<code style="background:#f6f8fa;padding:2px 4px;border-radius:4px;">{esc(str(k))}={esc(str(v))}</code>' for k, v in req.attributes.items()]
        attrs_html = " ".join(pairs)

    html = f"""
    <div style="font-family:ui-sans-serif,system-ui,sans-serif;">
      <div style="max-width:720px;margin:0 auto;border:1px solid #eee;border-radius:10px;overflow:hidden">
        <div style="background:#0e7490;color:white;padding:14px 18px;font-weight:600;">Kewin Chemicals · Sample Request</div>
        <div style="padding:16px">
          <table style="border-collapse:collapse;width:100%">
            {row('Product', req.product_name) if req.product_name else ''}
            {row('Category', req.category_slug)}
            {row('Subcategory', req.subcategory_slug)}
            {'<tr><td style="padding:6px 10px;color:#555;white-space:nowrap;"><strong>Attributes</strong></td><td style="padding:6px 10px;">' + attrs_html + '</td></tr>' if attrs_html else ''}
            {row('Quantity', req.quantity or '-')}
            {row('Use case', req.use_case or '-')}
          </table>
          <hr style="border:none;border-top:1px solid #eee;margin:16px 0"/>
          <div style="font-weight:600;margin-bottom:6px">Requester</div>
          <table style="border-collapse:collapse;width:100%">
            {row('Name', req.name)}
            {row('Company', req.company)}
            {row('Email', str(req.email))}
            {row('Phone', req.phone or '-')}
            {row('Country', req.country or '-')}
          </table>
          <div style="margin-top:16px;color:#666;font-size:12px">Reply to this email to contact the requester directly.</div>
        </div>
      </div>
    </div>
    """

    if not email.send(to_email, subject, html, reply_to=str(req.email)):
        return
    # Separate message so the requester never sees the internal inbox address.
    if req.send_copy_to_requester and email.can_email_outsiders():
        email.send(str(req.email), f"Your sample request: {req.product_name or req.subcategory_slug}", html)


@router.post("/", status_code=200)
def create_sample_request(req: SampleRequest, request: Request, tasks: BackgroundTasks, db: Session = Depends(get_db)):
    if req.website:  # bot; pretend success
        return {"status": "ok", "id": None}
    limit(request, "sample")

    # Persist to DB
    try:
        record = SampleRequestModel(
            category_slug=req.category_slug,
            subcategory_slug=req.subcategory_slug,
            product_id=req.product_id,
            product_name=req.product_name,
            attributes=req.attributes,
            quantity=req.quantity,
            use_case=req.use_case,
            name=req.name,
            company=req.company,
            email=str(req.email),
            phone=req.phone,
            country=req.country,
            send_copy_to_requester=req.send_copy_to_requester,
        )
        db.add(record)
        db.commit()
        record_id = record.id
    except Exception:
        db.rollback()
        log.exception("Failed to save sample request")
        raise HTTPException(status_code=500, detail="Could not submit right now. Please email or WhatsApp us.")

    # send in background
    tasks.add_task(_send_sample_email, req)
    return {"status": "ok", "id": record_id}
