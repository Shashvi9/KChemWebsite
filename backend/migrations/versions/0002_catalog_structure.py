"""Organize the catalog. Additive only: no existing row or column is changed or removed.

Reuses what production already has (applications, cas_aliases, product_documents) and adds only:
- product_subcategories: many-to-many, backfilled from products.subcategory_id
- products: product_type, ci_name, ci_number, e_number, synonyms, hs_code, specs, moq, packaging,
  is_active, SEO fields
- categories/subcategories: sort_order, is_active, SEO fields
- derived backfills: product_type; checksum-repaired CAS numbers (e.g. Excel turned "3351-05-1" into
  "01-05-3351") added to cas_aliases, leaving products.cas_number as it was
- trigram index on products.name for search

Revision ID: 0002
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ARRAY, JSONB

from app.core import cas

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None

LISTING_COLS = ["sort_order", "is_active", "seo_title", "seo_description"]
PRODUCT_COLS = ["product_type", "ci_name", "ci_number", "e_number", "synonyms", "hs_code", "specs", "moq",
                "packaging", "is_active", "seo_title", "seo_description"]


def _listing_cols(table):
    op.add_column(table, sa.Column("sort_order", sa.Integer, nullable=False, server_default="0"))
    op.add_column(table, sa.Column("is_active", sa.Boolean, nullable=False, server_default=sa.true()))
    op.add_column(table, sa.Column("seo_title", sa.String(255)))
    op.add_column(table, sa.Column("seo_description", sa.String(500)))


def upgrade():
    bind = op.get_bind()
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    _listing_cols("categories")
    _listing_cols("subcategories")

    for col in [
        sa.Column("product_type", sa.String(32)),
        sa.Column("ci_name", sa.String(255)),
        sa.Column("ci_number", sa.String(64)),
        sa.Column("e_number", sa.String(32)),
        sa.Column("synonyms", ARRAY(sa.String(255)), nullable=False, server_default="{}"),
        sa.Column("hs_code", sa.String(16)),
        sa.Column("specs", JSONB, nullable=False, server_default="{}"),
        sa.Column("moq", sa.String(255)),
        sa.Column("packaging", sa.String(255)),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default=sa.true()),
        sa.Column("seo_title", sa.String(255)),
        sa.Column("seo_description", sa.String(500)),
    ]:
        op.add_column("products", col)

    op.create_table(
        "product_subcategories",
        sa.Column("product_id", sa.Integer, sa.ForeignKey("products.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("subcategory_id", sa.Integer, sa.ForeignKey("subcategories.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("sort_order", sa.Integer, nullable=False, server_default="0"),
    )
    op.create_index("ix_product_subcategories_subcategory_id", "product_subcategories", ["subcategory_id"])
    op.execute("""INSERT INTO product_subcategories (product_id, subcategory_id)
                  SELECT id, subcategory_id FROM products WHERE subcategory_id IS NOT NULL""")

    op.execute("""
        UPDATE products p SET product_type = CASE
            WHEN c.slug = 'dyes-intermediates'
                 AND (SELECT s.slug FROM subcategories s WHERE s.id = p.subcategory_id) = 'dye-intermediates'
                THEN 'intermediate'
            WHEN c.slug = 'dyes-intermediates' THEN 'dye'
            WHEN c.slug = 'food-pharma-colors' THEN 'food_color'
            WHEN c.slug = 'pigments' THEN 'pigment'
            WHEN c.slug = 'pharmaceutical-products' THEN 'pharma'
        END
        FROM categories c
        WHERE c.id = p.category_id
    """)

    # Repaired / split CAS numbers become aliases, so search finds them; products.cas_number is untouched.
    rows = bind.execute(sa.text("SELECT id, cas_number FROM products WHERE cas_number IS NOT NULL")).fetchall()
    for r in rows:
        for c in cas.normalize(r.cas_number):
            if c != r.cas_number.strip():
                bind.execute(sa.text(
                    "INSERT INTO cas_aliases (product_id, cas_number) VALUES (:p, :c) "
                    "ON CONFLICT (product_id, cas_number) DO NOTHING"), {"p": r.id, "c": c})

    op.create_index("ix_products_product_type", "products", ["product_type"])
    op.create_index("ix_products_name_trgm", "products", ["name"], postgresql_using="gin",
                    postgresql_ops={"name": "gin_trgm_ops"})


def downgrade():
    op.drop_index("ix_products_name_trgm", table_name="products")
    op.drop_index("ix_products_product_type", table_name="products")
    op.drop_table("product_subcategories")
    for col in PRODUCT_COLS:
        op.drop_column("products", col)
    for t in ["categories", "subcategories"]:
        for col in LISTING_COLS:
            op.drop_column(t, col)
    # cas_aliases rows added by upgrade() are kept: they are correct CAS numbers and harmless.
