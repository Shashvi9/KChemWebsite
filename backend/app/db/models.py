"""ORM models matching the production Neon schema.

The base tables were created outside this repo (Drizzle-style names: *_fk, *_idx); migration 0001
records them as they are. 0002 and 0003 only add to them. Keep names here identical to production
so `alembic check` / autogenerate stay clean.
"""
from sqlalchemy import (Boolean, CheckConstraint, Column, Date, ForeignKey, Index, Integer, JSON, Numeric, String,
                        Table, Text, TIMESTAMP, text)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .base import Base

# Many-to-many: a dye can sit in Acid Dyes AND Levelling Dyes. products.subcategory_id stays the
# product's original subcategory; listing pages read this table. (Added in 0002.)
product_subcategories = Table(
    "product_subcategories",
    Base.metadata,
    Column("product_id", Integer, ForeignKey("products.id", ondelete="CASCADE"), primary_key=True),
    Column("subcategory_id", Integer, ForeignKey("subcategories.id", ondelete="CASCADE"), primary_key=True),
    Column("sort_order", Integer, nullable=False, server_default="0"),
    Index("ix_product_subcategories_subcategory_id", "subcategory_id"),
)

product_tags = Table(
    "product_tags",
    Base.metadata,
    Column("product_id", Integer, ForeignKey("products.id", ondelete="CASCADE", name="product_tags_product_id_products_id_fk"),
           primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE", name="product_tags_tag_id_tags_id_fk"),
           primary_key=True),
)


def _ts(**kw):
    return Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), **kw)


class _Listing:
    """Display fields added to categories and subcategories in 0002."""
    sort_order = Column(Integer, nullable=False, server_default="0")
    is_active = Column(Boolean, nullable=False, server_default=text("true"))
    seo_title = Column(String(255))
    seo_description = Column(String(500))


class Category(_Listing, Base):
    __tablename__ = "categories"
    __table_args__ = (Index("categories_slug_idx", "slug", unique=True),)

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False)
    description = Column(Text)
    created_at = _ts()
    updated_at = _ts()

    subcategories = relationship("Subcategory", back_populates="category")


class Subcategory(_Listing, Base):
    __tablename__ = "subcategories"
    __table_args__ = (
        Index("subcategories_slug_idx", "slug", unique=True),  # unique site-wide, not just per category
        Index("subcategories_category_id_idx", "category_id"),
    )

    id = Column(Integer, primary_key=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE",
                                             name="subcategories_category_id_categories_id_fk"), nullable=False)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False)
    description = Column(Text)
    created_at = _ts()
    updated_at = _ts()

    category = relationship("Category", back_populates="subcategories")


class Product(Base):
    __tablename__ = "products"
    __table_args__ = (
        Index("products_slug_idx", "slug", unique=True),
        Index("products_cas_number_idx", "cas_number"),
        Index("products_name_idx", "name"),
        Index("products_category_id_idx", "category_id"),
        Index("products_subcategory_id_idx", "subcategory_id"),
        Index("ix_products_product_type", "product_type"),
        Index("ix_products_name_trgm", "name", postgresql_using="gin", postgresql_ops={"name": "gin_trgm_ops"}),
    )

    id = Column(Integer, primary_key=True)
    name = Column(String(500), nullable=False)
    slug = Column(String(500), nullable=False)
    cas_number = Column(String(50))  # raw value as imported; never rewritten (repairs go to cas_aliases)
    molecular_formula = Column(String(255))
    molecular_weight = Column(Numeric)
    appearance = Column(String(500))
    description = Column(Text)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="RESTRICT",
                                             name="products_category_id_categories_id_fk"), nullable=False)
    subcategory_id = Column(Integer, ForeignKey("subcategories.id", ondelete="SET NULL",
                                                name="products_subcategory_id_subcategories_id_fk"))
    created_at = _ts()
    updated_at = _ts(onupdate=func.now())
    # Added in 0002
    product_type = Column(String(32))  # dye | intermediate | food_color | pigment | pharma
    ci_name = Column(String(255))      # e.g. "Acid Red 18"
    ci_number = Column(String(64))     # e.g. "16255"
    e_number = Column(String(32))      # e.g. "E-124"
    synonyms = Column(ARRAY(String(255)), nullable=False, server_default="{}")
    hs_code = Column(String(16))
    specs = Column(JSONB, nullable=False, server_default="{}")  # strength, shade, dosage... varies by type
    moq = Column(String(255))
    packaging = Column(String(255))
    is_active = Column(Boolean, nullable=False, server_default=text("true"))
    seo_title = Column(String(255))
    seo_description = Column(String(500))

    subcategory = relationship("Subcategory")
    subcategories = relationship("Subcategory", secondary=product_subcategories, viewonly=True)
    cas_aliases = relationship("CasAlias", order_by="CasAlias.id", viewonly=True)
    applications = relationship("Application", secondary="product_applications", order_by="Application.id",
                                viewonly=True)
    documents = relationship("ProductDocument", viewonly=True)


class Application(Base):
    """End uses (Wool Dyeing, Leather Dyeing...), linked through product_applications."""
    __tablename__ = "applications"
    __table_args__ = (Index("applications_slug_idx", "slug", unique=True),)

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False)
    description = Column(Text)


class ProductApplication(Base):
    __tablename__ = "product_applications"
    __table_args__ = (Index("product_applications_unique_idx", "product_id", "application_id", unique=True),)

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE",
                                            name="product_applications_product_id_products_id_fk"), nullable=False)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE",
                                                name="product_applications_application_id_applications_id_fk"),
                            nullable=False)


class CasAlias(Base):
    """Extra CAS numbers per product (multi-CAS dyes, and checksum-repaired values from 0002)."""
    __tablename__ = "cas_aliases"
    __table_args__ = (
        Index("cas_aliases_product_cas_idx", "product_id", "cas_number", unique=True),
        Index("cas_aliases_cas_number_idx", "cas_number"),
    )

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE",
                                            name="cas_aliases_product_id_products_id_fk"), nullable=False)
    cas_number = Column(String(50), nullable=False)


class ProductDocument(Base):
    """MSDS / TDS / COA / images per product."""
    __tablename__ = "product_documents"
    __table_args__ = (
        Index("product_documents_product_id_idx", "product_id"),
        Index("product_documents_type_idx", "document_type"),
    )

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE",
                                            name="product_documents_product_id_products_id_fk"), nullable=False)
    document_type = Column(String(20), nullable=False)
    file_url = Column(String(1000), nullable=False)
    created_at = _ts()


class Tag(Base):
    __tablename__ = "tags"
    __table_args__ = (Index("tags_slug_idx", "slug", unique=True),)

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), nullable=False)


class SampleRequest(Base):
    """Legacy: no longer written (see Lead). Kept with its data intact."""
    __tablename__ = "sample_requests"
    __table_args__ = (Index("ix_sample_requests_id", "id"),)

    id = Column(Integer, primary_key=True)
    category_slug = Column(String(255), nullable=False)
    subcategory_slug = Column(String(255), nullable=False)
    product_id = Column(Integer)
    product_name = Column(String(255))
    attributes = Column(JSON)
    quantity = Column(String(255))
    use_case = Column(String(2000))
    name = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(255))
    country = Column(String(255))
    send_copy_to_requester = Column(Boolean)
    status = Column(String(32), nullable=False)
    assigned_to = Column(String(255))
    internal_notes = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True))


class Inquiry(Base):
    """Legacy: no longer written (see Lead). Kept with its data intact."""
    __tablename__ = "inquiries"
    __table_args__ = (
        Index("inquiries_product_id_idx", "product_id"),
        Index("inquiries_created_at_idx", "created_at"),
        Index("inquiries_email_idx", "email"),
    )

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL",
                                            name="inquiries_product_id_products_id_fk"))
    name = Column(String(255), nullable=False)
    email = Column(String(320), nullable=False)
    company = Column(String(255))
    country = Column(String(100))
    phone = Column(String(50))
    quantity = Column(String(100))
    message = Column(Text)
    created_at = _ts()


LEAD_TYPES = ("sample", "inquiry", "whatsapp", "email", "phone", "marketplace", "trade_fair", "other")
LEAD_SOURCES = ("website", "whatsapp", "email", "phone", "alibaba", "indiamart", "tradeindia", "echemi",
                "trade_fair", "referral", "other")
LEAD_STATUSES = ("new", "contacted", "quoted", "sample_sent", "negotiating", "won", "lost", "spam")


def _in(col, values):
    return f"{col} IN ({', '.join(repr(v) for v in values)})"


class Lead(Base):
    """Every enquiry in one place. Website forms write here; WhatsApp/marketplace leads are added in admin.
    sample_requests and inquiries are the old tables, kept as-is; their rows were copied in by 0003."""
    __tablename__ = "leads"
    __table_args__ = (
        CheckConstraint(_in("type", LEAD_TYPES), name="ck_leads_type"),
        CheckConstraint(_in("source", LEAD_SOURCES), name="ck_leads_source"),
        CheckConstraint(_in("status", LEAD_STATUSES), name="ck_leads_status"),
        CheckConstraint("email IS NOT NULL OR phone IS NOT NULL", name="ck_leads_contact"),
        Index("uq_leads_legacy", "legacy_table", "legacy_id", unique=True),
        Index("ix_leads_status_created", "status", "created_at"),
        Index("ix_leads_created_at", "created_at"),
        Index("ix_leads_follow_up_on", "follow_up_on"),
        Index("ix_leads_product_id", "product_id"),
    )

    id = Column(Integer, primary_key=True)
    type = Column(String(16), nullable=False)
    source = Column(String(16), nullable=False, server_default="website")
    status = Column(String(16), nullable=False, server_default="new")
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"))
    product_name = Column(String(500))
    category_slug = Column(String(255))
    subcategory_slug = Column(String(255))
    product_attributes = Column(JSONB)
    name = Column(String(255), nullable=False)
    company = Column(String(255))
    email = Column(String(320))
    phone = Column(String(64))
    country = Column(String(255))
    quantity = Column(String(255))
    subject = Column(String(255))
    message = Column(Text)
    assigned_to = Column(String(255))
    notes = Column(Text)
    follow_up_on = Column(Date)
    send_copy_to_requester = Column(Boolean, nullable=False, server_default=text("false"))
    email_sent = Column(Boolean, server_default=text("false"))  # NULL = unknown (older rows)
    legacy_table = Column(String(32))
    legacy_id = Column(Integer)
    created_at = _ts()
    updated_at = _ts(onupdate=func.now())
