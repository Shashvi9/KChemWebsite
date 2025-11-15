from fastapi import APIRouter, BackgroundTasks, HTTPException, Depends
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
import os
import smtplib
from email.message import EmailMessage
from email.utils import formataddr
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import SampleRequest as SampleRequestModel

router = APIRouter()

class SampleRequest(BaseModel):
    category_slug: str = Field(..., min_length=1)
    subcategory_slug: str = Field(..., min_length=1)
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    form: Optional[str] = None
    attributes: Optional[Dict[str, Any]] = None

    quantity: Optional[str] = None
    use_case: Optional[str] = None

    name: str = Field(..., min_length=2)
    company: str = Field(..., min_length=2)
    email: EmailStr
    phone: Optional[str] = None
    country: Optional[str] = None

    send_copy_to_requester: bool = False


def _build_email(req: SampleRequest) -> EmailMessage:
    to_email = os.environ.get("SAMPLE_REQUEST_TO", "kctl96@gmail.com")
    subject = f"[Sample Request] {req.product_name or req.subcategory_slug} – {req.company} ({req.country or '-'})"

    lines = []
    lines.append(f"Category slug: {req.category_slug}")
    lines.append(f"Subcategory slug: {req.subcategory_slug}")
    if req.product_id is not None:
        lines.append(f"Product ID: {req.product_id}")
    if req.product_name:
        lines.append(f"Product: {req.product_name}")
    if req.form:
        lines.append(f"Form: {req.form}")
    if req.attributes:
        attr_str = "; ".join(f"{k}={v}" for k, v in req.attributes.items())
        lines.append(f"Attributes: {attr_str}")
    if req.quantity:
        lines.append(f"Requested quantity: {req.quantity}")
    if req.use_case:
        lines.append(f"Use case: {req.use_case}")

    lines.append("")
    lines.append("Requester:")
    lines.append(f"Name: {req.name}")
    lines.append(f"Company: {req.company}")
    lines.append(f"Email: {req.email}")
    if req.phone:
        lines.append(f"Phone: {req.phone}")
    if req.country:
        lines.append(f"Country: {req.country}")

    body = "\n".join(lines)

    # Build simple branded HTML
    def esc(s: str) -> str:
        return (s
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
        )

    def row(label: str, value: str) -> str:
        return f"""
        <tr>
          <td style=\"padding:6px 10px;color:#555;vertical-align:top;white-space:nowrap;\"><strong>{esc(label)}</strong></td>
          <td style=\"padding:6px 10px;color:#111;\">{esc(value)}</td>
        </tr>
        """

    attrs_html = ""
    if req.attributes:
        pairs = []
        for k, v in req.attributes.items():
            pairs.append(f"<code style=\"background:#f6f8fa;padding:2px 4px;border-radius:4px;\">{esc(str(k))}={esc(str(v))}</code>")
        attrs_html = " ".join(pairs)

    # Precompute attributes block to avoid nested f-string with backslashes in expression
    attrs_block = f'<div style="padding:6px 10px">{attrs_html}</div>' if attrs_html else ''

    html = f"""
    <div style=\"font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;\">
      <div style=\"max-width:720px;margin:0 auto;border:1px solid #eee;border-radius:10px;overflow:hidden\">
        <div style=\"background:#0e7490;color:white;padding:14px 18px;font-weight:600;\">Kewin Chemicals · Sample Request</div>
        <div style=\"padding:16px\">
          <table style=\"border-collapse:collapse;width:100%\">
            {row('Category slug', req.category_slug)}
            {row('Subcategory slug', req.subcategory_slug)}
            {row('Product ID', str(req.product_id)) if req.product_id is not None else ''}
            {row('Product', req.product_name) if req.product_name else ''}
            {row('Form', req.form) if req.form else ''}
            {row('Attributes', ' ') if attrs_html else ''}
          </table>
          {attrs_block}

          <hr style=\"border:none;border-top:1px solid #eee;margin:16px 0\" />

          <table style=\"border-collapse:collapse;width:100%\">
            {row('Requested quantity', req.quantity or '-')}
            {row('Use case', req.use_case or '-')}
          </table>

          <hr style=\"border:none;border-top:1px solid #eee;margin:16px 0\" />

          <div style=\"font-weight:600;margin-bottom:6px\">Requester</div>
          <table style=\"border-collapse:collapse;width:100%\">
            {row('Name', req.name)}
            {row('Company', req.company)}
            {row('Email', req.email)}
            {row('Phone', req.phone or '-')} 
            {row('Country', req.country or '-')} 
          </table>

          <div style=\"margin-top:16px;color:#666;font-size:12px\">You can reply directly to this email; replies go to the requester.</div>
        </div>
      </div>
    </div>
    """

    msg = EmailMessage()
    msg["Subject"] = subject
    # Use authenticated sender as From, but include a display name
    sender_email = os.environ.get("SAMPLE_REQUEST_FROM", os.environ.get("SMTP_USER", "no-reply@example.com"))
    sender_name = os.environ.get("SMTP_FROM_NAME") or os.environ.get("EMAIL_FROM_NAME") or "Kewin Chemicals"
    msg["From"] = formataddr((sender_name, sender_email))
    msg["To"] = to_email
    if req.send_copy_to_requester:
        msg["Cc"] = req.email
    # Ensure replies go to the requester without spoofing the From address
    msg["Reply-To"] = req.email
    msg.set_content(body)
    msg.add_alternative(html, subtype="html")
    return msg


def _send_email(msg: EmailMessage):
    host = os.environ.get("SMTP_HOST")
    port = int(os.environ.get("SMTP_PORT", "587"))
    user = os.environ.get("SMTP_USER")
    password = os.environ.get("SMTP_PASS")
    use_tls = os.environ.get("SMTP_TLS", "true").lower() == "true"

    if not host:
        raise RuntimeError("SMTP_HOST is not configured")

    if use_tls:
        with smtplib.SMTP(host, port) as server:
            server.starttls()
            if user and password:
                server.login(user, password)
            server.send_message(msg)
    else:
        with smtplib.SMTP(host, port) as server:
            if user and password:
                server.login(user, password)
            server.send_message(msg)


@router.post("/", status_code=200)
async def create_sample_request(req: SampleRequest, tasks: BackgroundTasks, db: Session = Depends(get_db)):
    try:
        msg = _build_email(req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid request: {e}")

    # Persist to DB
    record = SampleRequestModel(
        category_slug=req.category_slug,
        subcategory_slug=req.subcategory_slug,
        product_id=req.product_id,
        product_name=req.product_name,
        form=req.form,
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

    # send in background
    tasks.add_task(_send_email, msg)
    return {"status": "ok", "id": record.id}
