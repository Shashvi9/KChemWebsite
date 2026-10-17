"""One leads table for every enquiry: website forms plus leads logged by hand
(WhatsApp, email, phone, marketplaces, trade fairs).

Additive: sample_requests and inquiries are left exactly as they are; their rows are
copied into leads (legacy_table/legacy_id record where each came from, and make the
copy idempotent).

Revision ID: 0003
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None

TYPES = ("sample", "inquiry", "whatsapp", "email", "phone", "marketplace", "trade_fair", "other")
SOURCES = ("website", "whatsapp", "email", "phone", "alibaba", "indiamart", "tradeindia", "echemi",
           "trade_fair", "referral", "other")
STATUSES = ("new", "contacted", "quoted", "sample_sent", "negotiating", "won", "lost", "spam")


def _in(col, values):
    return f"{col} IN ({', '.join(repr(v) for v in values)})"


def upgrade():
    op.create_table(
        "leads",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("type", sa.String(16), nullable=False),
        sa.Column("source", sa.String(16), nullable=False, server_default="website"),
        sa.Column("status", sa.String(16), nullable=False, server_default="new"),
        sa.Column("product_id", sa.Integer, sa.ForeignKey("products.id", ondelete="SET NULL")),
        sa.Column("product_name", sa.String(500)),
        sa.Column("category_slug", sa.String(255)),
        sa.Column("subcategory_slug", sa.String(255)),
        sa.Column("product_attributes", JSONB),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("company", sa.String(255)),
        sa.Column("email", sa.String(320)),
        sa.Column("phone", sa.String(64)),
        sa.Column("country", sa.String(255)),
        sa.Column("quantity", sa.String(255)),
        sa.Column("subject", sa.String(255)),
        sa.Column("message", sa.Text),
        sa.Column("assigned_to", sa.String(255)),
        sa.Column("notes", sa.Text),
        sa.Column("follow_up_on", sa.Date),
        sa.Column("send_copy_to_requester", sa.Boolean, nullable=False, server_default=sa.false()),
        sa.Column("email_sent", sa.Boolean, server_default=sa.false()),  # NULL = unknown (older rows)
        sa.Column("legacy_table", sa.String(32)),
        sa.Column("legacy_id", sa.Integer),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint(_in("type", TYPES), name="ck_leads_type"),
        sa.CheckConstraint(_in("source", SOURCES), name="ck_leads_source"),
        sa.CheckConstraint(_in("status", STATUSES), name="ck_leads_status"),
        sa.CheckConstraint("email IS NOT NULL OR phone IS NOT NULL", name="ck_leads_contact"),
    )
    op.create_index("uq_leads_legacy", "leads", ["legacy_table", "legacy_id"], unique=True)
    op.create_index("ix_leads_status_created", "leads", ["status", "created_at"])
    op.create_index("ix_leads_created_at", "leads", ["created_at"])
    op.create_index("ix_leads_follow_up_on", "leads", ["follow_up_on"])
    op.create_index("ix_leads_product_id", "leads", ["product_id"])

    op.execute("""
        INSERT INTO leads (type, source, status, product_id, product_name, category_slug, subcategory_slug,
                           product_attributes, name, company, email, phone, country, quantity, message,
                           assigned_to, notes, send_copy_to_requester, email_sent,
                           legacy_table, legacy_id, created_at, updated_at)
        SELECT 'sample', 'website',
               CASE status WHEN 'in_progress' THEN 'contacted' WHEN 'completed' THEN 'sample_sent'
                           WHEN 'rejected' THEN 'lost' ELSE 'new' END,
               (SELECT p.id FROM products p WHERE p.id = s.product_id),  -- no FK on the old table
               product_name, category_slug, subcategory_slug, attributes::jsonb,
               name, company, email, LEFT(phone, 64), country, quantity, use_case,
               assigned_to, internal_notes, COALESCE(send_copy_to_requester, false), NULL,
               'sample_requests', id, COALESCE(created_at, now()), COALESCE(updated_at, created_at, now())
        FROM sample_requests s
        ON CONFLICT (legacy_table, legacy_id) DO NOTHING
    """)
    op.execute("""
        INSERT INTO leads (type, source, product_id, product_name, name, company, email, phone, country,
                           quantity, message, email_sent, legacy_table, legacy_id, created_at, updated_at)
        SELECT 'inquiry', 'website', i.product_id, p.name, i.name, i.company, i.email, i.phone, i.country,
               i.quantity, i.message, NULL, 'inquiries', i.id, i.created_at, i.created_at
        FROM inquiries i LEFT JOIN products p ON p.id = i.product_id
        ON CONFLICT (legacy_table, legacy_id) DO NOTHING
    """)


def downgrade():
    # Rows created after this migration exist only in leads; dropping would lose them.
    count = op.get_bind().execute(sa.text("SELECT count(*) FROM leads WHERE legacy_table IS NULL")).scalar()
    if count:
        raise RuntimeError(f"{count} leads exist only in the leads table; export them before downgrading.")
    op.drop_table("leads")
