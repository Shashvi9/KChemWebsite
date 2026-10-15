"""Baseline: the schema as it exists in production before Alembic.

Idempotent: on the existing Neon DB every table already exists and nothing is touched;
on an empty DB it creates them. So production just runs `alembic upgrade head`.

Revision ID: 0001
"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def _missing(name):
    return name not in sa.inspect(op.get_bind()).get_table_names()


def upgrade():
    if _missing("categories"):
        op.create_table(
            "categories",
            sa.Column("id", sa.Integer, primary_key=True, index=True),
            sa.Column("name", sa.String(255), unique=True, nullable=False),
            sa.Column("slug", sa.String(255), unique=True, nullable=False),
        )
    if _missing("subcategories"):
        op.create_table(
            "subcategories",
            sa.Column("id", sa.Integer, primary_key=True, index=True),
            sa.Column("category_id", sa.Integer, sa.ForeignKey("categories.id"), nullable=False),
            sa.Column("name", sa.String(255), nullable=False),
            sa.Column("slug", sa.String(255), nullable=False),
        )
    if _missing("products"):
        op.create_table(
            "products",
            sa.Column("id", sa.Integer, primary_key=True, index=True),
            sa.Column("name", sa.String(255), nullable=False),
            sa.Column("slug", sa.String(255)),
            sa.Column("cas_number", sa.String(255)),
            sa.Column("molecular_formula", sa.String(255)),
            sa.Column("molecular_weight", sa.String(255)),
            sa.Column("appearance", sa.String(255)),
            sa.Column("description", sa.Text),
            sa.Column("category_id", sa.Integer, sa.ForeignKey("categories.id")),
            sa.Column("subcategory_id", sa.Integer, sa.ForeignKey("subcategories.id"), nullable=False),
            sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.TIMESTAMP(timezone=True)),
        )
    if _missing("sample_requests"):
        op.create_table(
            "sample_requests",
            sa.Column("id", sa.Integer, primary_key=True, index=True),
            sa.Column("category_slug", sa.String(255), nullable=False),
            sa.Column("subcategory_slug", sa.String(255), nullable=False),
            sa.Column("product_id", sa.Integer),
            sa.Column("product_name", sa.String(255)),
            sa.Column("attributes", sa.JSON),
            sa.Column("quantity", sa.String(255)),
            sa.Column("use_case", sa.String(2000)),
            sa.Column("name", sa.String(255), nullable=False),
            sa.Column("company", sa.String(255), nullable=False),
            sa.Column("email", sa.String(255), nullable=False),
            sa.Column("phone", sa.String(255)),
            sa.Column("country", sa.String(255)),
            sa.Column("send_copy_to_requester", sa.Boolean, server_default=sa.false()),
            sa.Column("status", sa.String(32), nullable=False, server_default="pending"),
            sa.Column("assigned_to", sa.String(255)),
            sa.Column("internal_notes", sa.Text),
            sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.TIMESTAMP(timezone=True)),
        )
    if _missing("inquiries"):
        op.create_table(
            "inquiries",
            sa.Column("id", sa.Integer, primary_key=True, index=True),
            sa.Column("name", sa.String(255), nullable=False),
            sa.Column("email", sa.String(255), nullable=False),
            sa.Column("company", sa.String(255)),
            sa.Column("country", sa.String(255)),
            sa.Column("phone", sa.String(64)),
            sa.Column("subject", sa.String(255), nullable=False),
            sa.Column("message", sa.Text, nullable=False),
            sa.Column("email_sent", sa.Boolean, nullable=False, server_default=sa.false()),
            sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
        )


def downgrade():
    raise RuntimeError("Refusing to drop the baseline schema (it holds production data).")
