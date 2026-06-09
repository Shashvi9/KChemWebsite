from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel, EmailStr, Field
import os
import resend

router = APIRouter()

class InquiryRequest(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    subject: str = Field(..., min_length=2)
    message: str = Field(..., min_length=10)


def _send_inquiry_email(req: InquiryRequest):
    api_key = os.environ.get("RESEND_API_KEY")
    if not api_key:
        raise RuntimeError("RESEND_API_KEY is not configured")

    resend.api_key = api_key
    to_email = os.environ.get("INQUIRY_TO", os.environ.get("SAMPLE_REQUEST_TO", "kctl96@gmail.com"))
    from_email = os.environ.get("RESEND_FROM", "Kewin Chemicals <onboarding@resend.dev>")

    def esc(s: str) -> str:
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br>")

    html = f"""
    <div style="font-family:ui-sans-serif,system-ui,sans-serif;">
      <div style="max-width:720px;margin:0 auto;border:1px solid #eee;border-radius:10px;overflow:hidden">
        <div style="background:#1e40af;color:white;padding:14px 18px;font-weight:600;">Kewin Chemicals · Website Inquiry</div>
        <div style="padding:16px">
          <table style="border-collapse:collapse;width:100%">
            <tr><td style="padding:6px 10px;color:#555;white-space:nowrap;"><strong>From</strong></td><td style="padding:6px 10px;">{esc(req.name)}</td></tr>
            <tr><td style="padding:6px 10px;color:#555;white-space:nowrap;"><strong>Email</strong></td><td style="padding:6px 10px;"><a href="mailto:{esc(str(req.email))}">{esc(str(req.email))}</a></td></tr>
            <tr><td style="padding:6px 10px;color:#555;white-space:nowrap;"><strong>Subject</strong></td><td style="padding:6px 10px;">{esc(req.subject)}</td></tr>
          </table>
          <hr style="border:none;border-top:1px solid #eee;margin:16px 0"/>
          <div style="font-weight:600;margin-bottom:6px">Message</div>
          <div style="padding:12px;background:#f9fafb;border-radius:6px;color:#333;line-height:1.6">{esc(req.message)}</div>
          <div style="margin-top:16px;color:#666;font-size:12px">Reply to this email to contact the sender directly.</div>
        </div>
      </div>
    </div>
    """

    resend.Emails.send({
        "from": from_email,
        "to": [to_email],
        "reply_to": str(req.email),
        "subject": f"[Website Inquiry] {req.subject} – from {req.name}",
        "html": html,
    })


@router.post("/", status_code=200)
async def create_inquiry(req: InquiryRequest, tasks: BackgroundTasks):
    try:
        pass  # validate only
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid request: {e}")

    tasks.add_task(_send_inquiry_email, req)
    return {"status": "ok", "message": "Inquiry submitted successfully"}
