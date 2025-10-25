from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class CategoryBase(BaseModel):
    name: str
    slug: str

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int

    class Config:
        orm_mode = True

class SubcategoryBase(BaseModel):
    name: str
    slug: str

class SubcategoryCreate(SubcategoryBase):
    category_id: int

class Subcategory(SubcategoryBase):
    id: int
    category_id: int

    class Config:
        orm_mode = True

class ProductBase(BaseModel):
    name: str
    form: Optional[str] = None
    attributes: Optional[Dict[str, Any]] = None

class ProductCreate(ProductBase):
    subcategory_id: int

class Product(ProductBase):
    id: int
    subcategory_id: int

    class Config:
        orm_mode = True
