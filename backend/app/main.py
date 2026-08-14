import os
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router

DEFAULT_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://kchemicalwebsite-git-main-shashvishah99-gmailcoms-projects.vercel.app",
    "https://www.kewinchem.com",
    "https://kewinchem.com",
]


def build_cors_origins(frontend_url: Optional[str] = None) -> list[str]:
    origins = list(DEFAULT_CORS_ORIGINS)
    if frontend_url:
        origins.extend(origin.strip() for origin in frontend_url.split(",") if origin.strip())
    return origins


app = FastAPI(
    title="Kewin Chem Connect API",
    description="API for Kewin Chem Connect, providing data on chemical and pharmaceutical products.",
    version="1.0.0",
)

# Set up CORS
origins = build_cors_origins(os.getenv("FRONTEND_URL"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to the Kewin Chem Connect API!"}

app.include_router(api_router, prefix="/api/v1")
