import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request

# ponytail: in-memory, per-process; resets on restart and isn't shared across instances.
# Fine for one Render instance. Move to Redis/Upstash if you scale out.
_hits: dict[str, deque] = defaultdict(deque)


def client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for")
    return fwd.split(",")[0].strip() if fwd else (request.client.host if request.client else "unknown")


def limit(request: Request, bucket: str, max_hits: int = 5, window_s: int = 600) -> None:
    key = f"{bucket}:{client_ip(request)}"
    now = time.monotonic()
    q = _hits[key]
    while q and now - q[0] > window_s:
        q.popleft()
    if len(q) >= max_hits:
        raise HTTPException(status_code=429, detail="Too many requests. Please try again later or contact us on WhatsApp.")
    q.append(now)
