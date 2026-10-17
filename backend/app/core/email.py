import logging
import os

import resend

log = logging.getLogger("kewin.email")

DEFAULT_TO = "kctl96@gmail.com"


def esc(s: str) -> str:
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br>")


def one_line(s: str) -> str:
    """For subjects: user text must not carry newlines."""
    return " ".join(str(s).split())[:150]


def send(to: str, subject: str, html: str, reply_to: str | None = None) -> bool:
    """Send via Resend. Never raises: returns False and logs, so callers can record the failure."""
    api_key = os.environ.get("RESEND_API_KEY")
    if not api_key:
        log.error("RESEND_API_KEY not set; email '%s' not sent", subject)
        return False
    resend.api_key = api_key
    payload = {
        "from": os.environ.get("RESEND_FROM", "Kewin Chemicals <onboarding@resend.dev>"),
        "to": [to],
        "subject": one_line(subject),
        "html": html,
    }
    if reply_to:
        payload["reply_to"] = reply_to
    try:
        resend.Emails.send(payload)
        return True
    except Exception:
        log.exception("Resend failed for '%s' to %s", subject, to)
        return False


def can_email_outsiders() -> bool:
    # Resend's shared onboarding@resend.dev sender only delivers to the account owner.
    return bool(os.environ.get("RESEND_FROM"))
