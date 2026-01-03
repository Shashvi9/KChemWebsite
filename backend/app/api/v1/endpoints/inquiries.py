from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel, EmailStr, Field
import os
import smtplib
from email.message import EmailMessage
from email.utils import formataddr

router = APIRouter()

class InquiryRequest(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    subject: str = Field(..., min_length=2)
    message: str = Field(..., min_length=10)


def _build_inquiry_email(req: InquiryRequest) -> EmailMessage:
    to_email = os.environ.get("INQUIRY_TO", os.environ.get("SAMPLE_REQUEST_TO", "kctl96@gmail.com"))
    subject = f"[Website Inquiry] {req.subject} – from {req.name}"

    # Plain text body
    lines = [
        f"Name: {req.name}",
        f"Email: {req.email}",
        f"Subject: {req.subject}",
        "",
        "Message:",
        req.message,
    ]
    body = "\n".join(lines)

    # HTML escape helper
    def esc(s: str) -> str:
        return (s
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\n", "<br>")
        )

    # Build branded HTML email
    html = f"""
    <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
      <div style="max-width:720px;margin:0 auto;border:1px solid #eee;border-radius:10px;overflow:hidden">
        <div style="background:#1e40af;color:white;padding:14px 18px;font-weight:600;">Kewin Chemicals · Website Inquiry</div>
        <div style="padding:16px">
          <table style="border-collapse:collapse;width:100%">
            <tr>
              <td style="padding:6px 10px;color:#555;vertical-align:top;white-space:nowrap;"><strong>From</strong></td>
              <td style="padding:6px 10px;color:#111;">{esc(req.name)}</td>
            </tr>
            <tr>
              <td style="padding:6px 10px;color:#555;vertical-align:top;white-space:nowrap;"><strong>Email</strong></td>
              <td style="padding:6px 10px;color:#111;"><a href="mailto:{esc(req.email)}">{esc(req.email)}</a></td>
            </tr>
            <tr>
              <td style="padding:6px 10px;color:#555;vertical-align:top;white-space:nowrap;"><strong>Subject</strong></td>
              <td style="padding:6px 10px;color:#111;">{esc(req.subject)}</td>
            </tr>
          </table>

          <hr style="border:none;border-top:1px solid #eee;margin:16px 0" />

          <div style="font-weight:600;margin-bottom:6px">Message</div>
          <div style="padding:12px;background:#f9fafb;border-radius:6px;color:#333;line-height:1.6">
            {esc(req.message)}
          </div>

          <div style="margin-top:16px;color:#666;font-size:12px">You can reply directly to this email; replies go to the sender.</div>
        </div>
      </div>
    </div>
    """

    msg = EmailMessage()
    msg["Subject"] = subject
    sender_email = os.environ.get("SAMPLE_REQUEST_FROM", os.environ.get("SMTP_USER", "no-reply@example.com"))
    sender_name = os.environ.get("SMTP_FROM_NAME") or os.environ.get("EMAIL_FROM_NAME") or "Kewin Chemicals"
    msg["From"] = formataddr((sender_name, sender_email))
    msg["To"] = to_email
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
async def create_inquiry(req: InquiryRequest, tasks: BackgroundTasks):
    try:
        msg = _build_inquiry_email(req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid request: {e}")

    # Send email in background
    tasks.add_task(_send_email, msg)
    return {"status": "ok", "message": "Inquiry submitted successfully"}
