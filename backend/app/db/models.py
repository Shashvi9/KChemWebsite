from sqlalchemy import Column, Integer, String, ForeignKey, JSON, TIMESTAMP, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)
    slug = Column(String(255), unique=True, nullable=False)

    subcategories = relationship("Subcategory", back_populates="category")

class Subcategory(Base):
    __tablename__ = "subcategories"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False)

    category = relationship("Category", back_populates="subcategories")
    products = relationship("Product", back_populates="subcategory")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    subcategory_id = Column(Integer, ForeignKey("subcategories.id"), nullable=False)
    name = Column(String(255), nullable=False)
    form = Column(String(100))
    attributes = Column(JSON)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), onupdate=func.now())

    subcategory = relationship("Subcategory", back_populates="products")


class SampleRequest(Base):
    __tablename__ = "sample_requests"

    id = Column(Integer, primary_key=True, index=True)
    category_slug = Column(String(255), nullable=False)
    subcategory_slug = Column(String(255), nullable=False)
    product_id = Column(Integer, nullable=True)
    product_name = Column(String(255), nullable=True)
    form = Column(String(100), nullable=True)
    attributes = Column(JSON, nullable=True)

    quantity = Column(String(255), nullable=True)
    use_case = Column(String(2000), nullable=True)

    name = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(255), nullable=True)
    country = Column(String(255), nullable=True)

    send_copy_to_requester = Column(Boolean, default=False)

    # Admin management fields
    status = Column(String(32), nullable=False, default="pending")
    assigned_to = Column(String(255), nullable=True)
    internal_notes = Column(Text, nullable=True)

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), onupdate=func.now())
