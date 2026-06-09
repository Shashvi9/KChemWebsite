from fastapi import APIRouter, BackgroundTasks, HTTPException, Depends
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
import os
import resend
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import SampleRequest as SampleRequestModel

router = APIRouter()

class SampleRequest(BaseModel):
    category_slug: str = Field(..., min_length=1)
    subcategory_slug: str = Field(..., min_length=1)
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    attributes: Optional[Dict[str, Any]] = None

    quantity: Optional[str] = None
    use_case: Optional[str] = None

    name: str = Field(..., min_length=2)
    company: str = Field(..., min_length=2)
    email: EmailStr
    phone: Optional[str] = None
    country: Optional[str] = None

    send_copy_to_requester: bool = False


def _send_sample_email(req: SampleRequest):
    api_key = os.environ.get("RESEND_API_KEY")
    if not api_key:
        raise RuntimeError("RESEND_API_KEY is not configured")

    resend.api_key = api_key
    to_email = os.environ.get("SAMPLE_REQUEST_TO", "kctl96@gmail.com")
    from_email = os.environ.get("RESEND_FROM", "Kewin Chemicals <onboarding@resend.dev>")
    subject = f"[Sample Request] {req.product_name or req.subcategory_slug} – {req.company} ({req.country or '-'})"

    def esc(s: str) -> str:
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

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

    to_list = [to_email]
    if req.send_copy_to_requester:
        to_list.append(str(req.email))

    resend.Emails.send({
        "from": from_email,
        "to": to_list,
        "reply_to": str(req.email),
        "subject": subject,
        "html": html,
    })


@router.post("/", status_code=200)
async def create_sample_request(req: SampleRequest, tasks: BackgroundTasks, db: Session = Depends(get_db)):

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
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

    # send in background
    tasks.add_task(_send_sample_email, req)
    return {"status": "ok", "id": record_id}
