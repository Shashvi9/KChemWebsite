from sqlalchemy import (Column, Integer, String, ForeignKey, JSON, TIMESTAMP, Boolean, Text, Table,
                        UniqueConstraint, Index, text)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

# Many-to-many: a dye can sit in Acid Dyes AND Levelling Dyes. products.subcategory_id is kept
# as the product's primary/original subcategory; listing pages read this table.
product_subcategories = Table(
    "product_subcategories",
    Base.metadata,
    Column("product_id", Integer, ForeignKey("products.id", ondelete="CASCADE"), primary_key=True),
    Column("subcategory_id", Integer, ForeignKey("subcategories.id", ondelete="CASCADE"), primary_key=True, index=True),
    Column("sort_order", Integer, nullable=False, server_default="0"),
)


class _Listing:
    """Shared display fields for categories and subcategories."""
    description = Column(Text)
    sort_order = Column(Integer, nullable=False, server_default="0")
    is_active = Column(Boolean, nullable=False, server_default=text("true"))
    seo_title = Column(String(255))
    seo_description = Column(String(500))


class Category(_Listing, Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)
    slug = Column(String(255), unique=True, nullable=False)

    subcategories = relationship("Subcategory", back_populates="category")

class Subcategory(_Listing, Base):
    __tablename__ = "subcategories"
    __table_args__ = (UniqueConstraint("category_id", "slug", name="uq_subcategories_category_slug"),)

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False)

    category = relationship("Category", back_populates="subcategories")
    products = relationship("Product", back_populates="subcategory")

class Product(Base):
    __tablename__ = "products"
    __table_args__ = (
        Index("ix_products_cas_numbers", "cas_numbers", postgresql_using="gin"),
        Index("ix_products_name_trgm", "name", postgresql_using="gin", postgresql_ops={"name": "gin_trgm_ops"}),
    )

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True)
    cas_number = Column(String(255))  # raw value as imported; never rewritten
    cas_numbers = Column(ARRAY(String(32)), nullable=False, server_default="{}")  # checksum-valid, normalized
    product_type = Column(String(32), index=True)  # dye | intermediate | food_color | pigment | pharma
    ci_name = Column(String(255))       # e.g. "Acid Red 18"
    ci_number = Column(String(64))      # e.g. "16255"
    e_number = Column(String(32))       # e.g. "E-124"
    synonyms = Column(ARRAY(String(255)), nullable=False, server_default="{}")
    applications = Column(ARRAY(String(64)), nullable=False, server_default="{}")
    hs_code = Column(String(16))
    specs = Column(JSONB, nullable=False, server_default="{}")  # strength, shade, dosage... varies by type
    moq = Column(String(255))
    packaging = Column(String(255))
    is_active = Column(Boolean, nullable=False, server_default=text("true"))
    seo_title = Column(String(255))
    seo_description = Column(String(500))
    molecular_formula = Column(String(255))
    molecular_weight = Column(String(255))
    appearance = Column(String(255))
    description = Column(Text)
    category_id = Column(Integer, ForeignKey("categories.id"), index=True)
    subcategory_id = Column(Integer, ForeignKey("subcategories.id"), nullable=False, index=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), onupdate=func.now())

    subcategory = relationship("Subcategory", back_populates="products")
    subcategories = relationship("Subcategory", secondary=product_subcategories)
    files = relationship("ProductFile", back_populates="product", order_by="ProductFile.sort_order")


class ProductFile(Base):
    """Images and documents (MSDS/TDS/COA) per product."""
    __tablename__ = "product_files"

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    kind = Column(String(16), nullable=False)  # image | msds | tds | coa
    url = Column(String(1000), nullable=False)
    alt = Column(String(255))
    sort_order = Column(Integer, nullable=False, server_default="0")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    product = relationship("Product", back_populates="files")


class SampleRequest(Base):
    __tablename__ = "sample_requests"

    id = Column(Integer, primary_key=True, index=True)
    category_slug = Column(String(255), nullable=False)
    subcategory_slug = Column(String(255), nullable=False)
    product_id = Column(Integer, nullable=True)
    product_name = Column(String(255), nullable=True)
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


class Inquiry(Base):
    """Contact-form inquiries. Saved before emailing so a failed email never loses a lead."""
    __tablename__ = "inquiries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    company = Column(String(255), nullable=True)
    country = Column(String(255), nullable=True)
    phone = Column(String(64), nullable=True)
    subject = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    email_sent = Column(Boolean, nullable=False, default=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
