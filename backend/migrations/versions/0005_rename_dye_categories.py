"""Rename "Dyes & Intermediates" to "Dyes" and "Dye Intermediates" to "Intermediates". Slugs stay the same.

Revision ID: 0005
"""
from alembic import op
import sqlalchemy as sa

revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None

NAMES = [("dyes-intermediates", "Dyes & Intermediates", "Dyes"), ("dye-intermediates", "Dye Intermediates", "Intermediates")]


def _rename(pairs):
    for slug, name in pairs:
        op.get_bind().execute(sa.text("UPDATE categories SET name = :n WHERE slug = :s"), {"n": name, "s": slug})


def upgrade():
    _rename([(slug, new) for slug, _, new in NAMES])


def downgrade():
    _rename([(slug, old) for slug, old, _ in NAMES])
