"""PubChem reference data per product: identity and experimental properties.

One row per product, refreshed by review/chem-db/load_pubchem.py, which also merges PubChem synonyms
into products.synonyms. Kept apart from products so the catalogue's own fields stay the source of truth.

Revision ID: 0006
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "chemical_properties",
        sa.Column("product_id", sa.Integer, sa.ForeignKey("products.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("cas_number", sa.String(64), nullable=False),
        sa.Column("pubchem_cid", sa.Integer, nullable=False),
        sa.Column("cas_confirmed", sa.Boolean, nullable=False),
        sa.Column("pubchem_title", sa.Text),
        sa.Column("iupac_name", sa.Text),
        sa.Column("molecular_formula", sa.String(128)),
        sa.Column("molecular_weight", sa.Numeric(12, 4)),
        sa.Column("exact_mass", sa.Numeric(14, 6)),
        sa.Column("xlogp", sa.Numeric(6, 2)),
        sa.Column("properties", postgresql.JSONB, nullable=False, server_default="{}"),
        sa.Column("fetched_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )


def downgrade():
    op.drop_table("chemical_properties")
