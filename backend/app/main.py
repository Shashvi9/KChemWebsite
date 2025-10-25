from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router

app = FastAPI(
    title="Kewin Chem Connect API",
    description="API for Kewin Chem Connect, providing data on chemical and pharmaceutical products.",
    version="1.0.0",
)

# Set up CORS
origins = [
    "http://localhost:5173",  # Adjust this to your frontend's URL
    "http://127.0.0.1:5173",
]

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

