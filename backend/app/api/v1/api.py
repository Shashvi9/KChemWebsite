from fastapi import APIRouter

from app.api.v1.endpoints import products, categories, sample_requests, admin_auth, admin_sample_requests

api_router = APIRouter()
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(sample_requests.router, prefix="/sample-requests", tags=["sample-requests"])
api_router.include_router(admin_auth.router, prefix="/admin/auth", tags=["admin-auth"])
api_router.include_router(admin_sample_requests.router, prefix="/admin/sample-requests", tags=["admin-sample-requests"])
