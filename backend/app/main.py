import logging
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.v1.api import api_router
from app.db.session import engine

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

app = FastAPI(
    title="Kewin Chem Connect API",
    description="API for Kewin Chem Connect, providing data on chemical and pharmaceutical products.",
    version="1.0.0",
)

# Set up CORS
import os
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://kchemicalwebsite-git-main-shashvishah99-gmailcoms-projects.vercel.app",
    "https://www.kewinchem.com",
    "https://kewinchem.com",
]

# Add production frontend URL if set
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://kchemicalwebsite-[a-z0-9-]+\.vercel\.app",  # this project's preview deployments only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to the Kewin Chem Connect API!"}

@app.on_event("startup")
def run_migrations():
    """Bring the schema up to date before serving. Render's start command (set in the dashboard)
    only runs uvicorn, so migrations can't rely on render.yaml. Migrations are additive and
    idempotent; a Postgres advisory lock keeps two starting instances from running them at once."""
    from alembic import command
    from alembic.config import Config

    cfg = Config(str(Path(__file__).resolve().parent.parent / "alembic.ini"))
    cfg.set_main_option("script_location", str(Path(__file__).resolve().parent.parent / "migrations"))
    with engine.connect() as conn:
        conn.execute(text("SELECT pg_advisory_lock(727001)"))
        try:
            command.upgrade(cfg, "head")
        finally:
            conn.execute(text("SELECT pg_advisory_unlock(727001)"))


@app.get("/health", tags=["Root"])
def health():
    """Touches the DB so uptime pings keep both Render and Neon awake."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception:
        raise HTTPException(status_code=503, detail="database unavailable")
    return {"status": "ok"}


app.include_router(api_router, prefix="/api/v1")

