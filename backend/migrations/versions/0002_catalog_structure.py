"""Organize the catalog. Additive only: no existing row or column is changed or removed.

- products: typed columns (product_type, cas_numbers, ci_name, e_number, applications, specs, ...)
- product_subcategories: many-to-many, backfilled from products.subcategory_id
- product_files: images and MSDS/TDS/COA
- categories/subcategories: description, sort_order, is_active, SEO fields
- backfills derived values only: product_type, cas_numbers (from cas_number), slug where NULL
- indexes on FKs, CAS (GIN) and name (trigram); unique (category_id, slug) on subcategories

Revision ID: 0002
"""
import re
import unicodedata

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ARRAY, JSONB

from app.core import cas

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def _listing_cols(table):
    op.add_column(table, sa.Column("description", sa.Text))
    op.add_column(table, sa.Column("sort_order", sa.Integer, nullable=False, server_default="0"))
    op.add_column(table, sa.Column("is_active", sa.Boolean, nullable=False, server_default=sa.true()))
    op.add_column(table, sa.Column("seo_title", sa.String(255)))
    op.add_column(table, sa.Column("seo_description", sa.String(500)))


def _slugify(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:200] or "product"


def upgrade():
    bind = op.get_bind()
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    _listing_cols("categories")
    _listing_cols("subcategories")

    dupes = bind.execute(sa.text(
        "SELECT category_id, slug FROM subcategories GROUP BY 1, 2 HAVING count(*) > 1")).fetchall()
    if dupes:
        raise RuntimeError(f"Duplicate subcategory slugs, fix before migrating: {dupes}")
    op.create_unique_constraint("uq_subcategories_category_slug", "subcategories", ["category_id", "slug"])
    op.create_index("ix_subcategories_category_id", "subcategories", ["category_id"])

    for col in [
        sa.Column("cas_numbers", ARRAY(sa.String(32)), nullable=False, server_default="{}"),
        sa.Column("product_type", sa.String(32)),
        sa.Column("ci_name", sa.String(255)),
        sa.Column("ci_number", sa.String(64)),
        sa.Column("e_number", sa.String(32)),
        sa.Column("synonyms", ARRAY(sa.String(255)), nullable=False, server_default="{}"),
        sa.Column("applications", ARRAY(sa.String(64)), nullable=False, server_default="{}"),
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
    op.execute("INSERT INTO product_subcategories (product_id, subcategory_id) SELECT id, subcategory_id FROM products")

    op.create_table(
        "product_files",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("product_id", sa.Integer, sa.ForeignKey("products.id", ondelete="CASCADE"), nullable=False),
        sa.Column("kind", sa.String(16), nullable=False),
        sa.Column("url", sa.String(1000), nullable=False),
        sa.Column("alt", sa.String(255)),
        sa.Column("sort_order", sa.Integer, nullable=False, server_default="0"),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
        sa.CheckConstraint("kind IN ('image', 'msds', 'tds', 'coa')", name="ck_product_files_kind"),
    )
    op.create_index("ix_product_files_product_id", "product_files", ["product_id"])

    # Derived backfills.
    op.execute("""
        UPDATE products p SET product_type = CASE
            WHEN c.slug = 'dyes-intermediates' AND s.slug = 'dye-intermediates' THEN 'intermediate'
            WHEN c.slug = 'dyes-intermediates' THEN 'dye'
            WHEN c.slug = 'food-pharma-colors' THEN 'food_color'
            WHEN c.slug = 'pigments' THEN 'pigment'
            WHEN c.slug = 'pharmaceutical-products' THEN 'pharma'
        END
        FROM subcategories s JOIN categories c ON c.id = s.category_id
        WHERE s.id = p.subcategory_id
    """)

    rows = bind.execute(sa.text("SELECT id, name, slug, cas_number FROM products ORDER BY id")).fetchall()
    taken = {r.slug for r in rows if r.slug}
    for r in rows:
        values = {}
        normalized = cas.normalize(r.cas_number)
        if normalized:
            values["cas_numbers"] = normalized
        if not r.slug:
            slug = _slugify(r.name)
            if slug in taken:
                slug = f"{slug}-{r.id}"
            taken.add(slug)
            values["slug"] = slug
        if values:
            sets = ", ".join(f"{k} = :{k}" for k in values)
            bind.execute(sa.text(f"UPDATE products SET {sets} WHERE id = :id"), {**values, "id": r.id})

    op.create_unique_constraint("uq_products_slug", "products", ["slug"])
    op.create_index("ix_products_subcategory_id", "products", ["subcategory_id"])
    op.create_index("ix_products_category_id", "products", ["category_id"])
    op.create_index("ix_products_product_type", "products", ["product_type"])
    op.create_index("ix_products_cas_numbers", "products", ["cas_numbers"], postgresql_using="gin")
    op.create_index("ix_products_name_trgm", "products", ["name"], postgresql_using="gin",
                    postgresql_ops={"name": "gin_trgm_ops"})


def downgrade():
    for ix in ["ix_products_name_trgm", "ix_products_cas_numbers", "ix_products_product_type",
               "ix_products_category_id", "ix_products_subcategory_id"]:
        op.drop_index(ix, table_name="products")
    op.drop_constraint("uq_products_slug", "products")
    op.drop_table("product_files")
    op.drop_table("product_subcategories")
    for col in ["cas_numbers", "product_type", "ci_name", "ci_number", "e_number", "synonyms", "applications",
                "hs_code", "specs", "moq", "packaging", "is_active", "seo_title", "seo_description"]:
        op.drop_column("products", col)
    op.drop_index("ix_subcategories_category_id", table_name="subcategories")
    op.drop_constraint("uq_subcategories_category_slug", "subcategories")
    for t in ["categories", "subcategories"]:
        for col in ["description", "sort_order", "is_active", "seo_title", "seo_description"]:
            op.drop_column(t, col)
    # Note: slugs filled in by upgrade() are kept (harmless, and they may already be in use in URLs).
