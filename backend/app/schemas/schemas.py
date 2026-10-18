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


class SubcategoryWithCount(Subcategory):
    product_count: int = 0


class CategoryOverview(Category):
    product_count: int = 0
    subcategories: List[SubcategoryWithCount] = []

class ProductBase(BaseModel):
    name: str
    attributes: Optional[Dict[str, Any]] = None

class ProductCreate(ProductBase):
    subcategory_id: int

class Product(ProductBase):
    id: int
    slug: Optional[str] = None
    subcategory_id: int

    class Config:
        orm_mode = True


class RangeRef(BaseModel):
    name: str
    slug: str
    category_slug: str
    category_name: str


class ProductRef(BaseModel):
    name: str
    slug: str
    cas: Optional[str] = None


class ProductDocumentOut(BaseModel):
    type: str
    url: str


class ProductDetail(Product):
    """Everything a product page needs in one response."""
    product_type: Optional[str] = None
    ranges: List[RangeRef] = []        # primary range first
    related: List[ProductRef] = []
    documents: List[ProductDocumentOut] = []
    indexable: bool = True             # False: kept on the site but out of search until reviewed
    updated_at: Optional[str] = None
