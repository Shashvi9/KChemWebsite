"""Baseline: the production schema as it existed before Alembic (created outside this repo).

Every statement is IF NOT EXISTS: on the production Neon DB nothing changes; on an empty DB
(tests, a fresh environment) it recreates the same schema, names included.

Revision ID: 0001
"""
from alembic import op

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None

SCHEMA = """
CREATE TABLE IF NOT EXISTS categories (
    id serial PRIMARY KEY,
    name varchar(255) NOT NULL,
    slug varchar(255) NOT NULL,
    description text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_idx ON categories (slug);

CREATE TABLE IF NOT EXISTS subcategories (
    id serial PRIMARY KEY,
    category_id integer NOT NULL
        CONSTRAINT subcategories_category_id_categories_id_fk REFERENCES categories (id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    slug varchar(255) NOT NULL,
    description text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS subcategories_slug_idx ON subcategories (slug);
CREATE INDEX IF NOT EXISTS subcategories_category_id_idx ON subcategories (category_id);

CREATE TABLE IF NOT EXISTS products (
    id serial PRIMARY KEY,
    name varchar(500) NOT NULL,
    slug varchar(500) NOT NULL,
    cas_number varchar(50),
    molecular_formula varchar(255),
    molecular_weight numeric,
    appearance varchar(500),
    description text,
    category_id integer NOT NULL
        CONSTRAINT products_category_id_categories_id_fk REFERENCES categories (id) ON DELETE RESTRICT,
    subcategory_id integer
        CONSTRAINT products_subcategory_id_subcategories_id_fk REFERENCES subcategories (id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_idx ON products (slug);
CREATE INDEX IF NOT EXISTS products_cas_number_idx ON products (cas_number);
CREATE INDEX IF NOT EXISTS products_name_idx ON products (name);
CREATE INDEX IF NOT EXISTS products_category_id_idx ON products (category_id);
CREATE INDEX IF NOT EXISTS products_subcategory_id_idx ON products (subcategory_id);

CREATE TABLE IF NOT EXISTS applications (
    id serial PRIMARY KEY,
    name varchar(255) NOT NULL,
    slug varchar(255) NOT NULL,
    description text
);
CREATE UNIQUE INDEX IF NOT EXISTS applications_slug_idx ON applications (slug);

CREATE TABLE IF NOT EXISTS product_applications (
    id serial PRIMARY KEY,
    product_id integer NOT NULL
        CONSTRAINT product_applications_product_id_products_id_fk REFERENCES products (id) ON DELETE CASCADE,
    application_id integer NOT NULL
        CONSTRAINT product_applications_application_id_applications_id_fk REFERENCES applications (id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS product_applications_unique_idx ON product_applications (product_id, application_id);

CREATE TABLE IF NOT EXISTS cas_aliases (
    id serial PRIMARY KEY,
    product_id integer NOT NULL
        CONSTRAINT cas_aliases_product_id_products_id_fk REFERENCES products (id) ON DELETE CASCADE,
    cas_number varchar(50) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS cas_aliases_product_cas_idx ON cas_aliases (product_id, cas_number);
CREATE INDEX IF NOT EXISTS cas_aliases_cas_number_idx ON cas_aliases (cas_number);

CREATE TABLE IF NOT EXISTS product_documents (
    id serial PRIMARY KEY,
    product_id integer NOT NULL
        CONSTRAINT product_documents_product_id_products_id_fk REFERENCES products (id) ON DELETE CASCADE,
    document_type varchar(20) NOT NULL,
    file_url varchar(1000) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS product_documents_product_id_idx ON product_documents (product_id);
CREATE INDEX IF NOT EXISTS product_documents_type_idx ON product_documents (document_type);

CREATE TABLE IF NOT EXISTS tags (
    id serial PRIMARY KEY,
    name varchar(100) NOT NULL,
    slug varchar(100) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS tags_slug_idx ON tags (slug);

CREATE TABLE IF NOT EXISTS product_tags (
    product_id integer NOT NULL
        CONSTRAINT product_tags_product_id_products_id_fk REFERENCES products (id) ON DELETE CASCADE,
    tag_id integer NOT NULL
        CONSTRAINT product_tags_tag_id_tags_id_fk REFERENCES tags (id) ON DELETE CASCADE,
    CONSTRAINT product_tags_product_id_tag_id_pk PRIMARY KEY (product_id, tag_id)
);

CREATE TABLE IF NOT EXISTS inquiries (
    id serial PRIMARY KEY,
    product_id integer
        CONSTRAINT inquiries_product_id_products_id_fk REFERENCES products (id) ON DELETE SET NULL,
    name varchar(255) NOT NULL,
    email varchar(320) NOT NULL,
    company varchar(255),
    country varchar(100),
    phone varchar(50),
    quantity varchar(100),
    message text,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS inquiries_product_id_idx ON inquiries (product_id);
CREATE INDEX IF NOT EXISTS inquiries_created_at_idx ON inquiries (created_at);
CREATE INDEX IF NOT EXISTS inquiries_email_idx ON inquiries (email);

CREATE TABLE IF NOT EXISTS sample_requests (
    id serial PRIMARY KEY,
    category_slug varchar(255) NOT NULL,
    subcategory_slug varchar(255) NOT NULL,
    product_id integer,
    product_name varchar(255),
    attributes json,
    quantity varchar(255),
    use_case varchar(2000),
    name varchar(255) NOT NULL,
    company varchar(255) NOT NULL,
    email varchar(255) NOT NULL,
    phone varchar(255),
    country varchar(255),
    send_copy_to_requester boolean,
    status varchar(32) NOT NULL,
    assigned_to varchar(255),
    internal_notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz
);
CREATE INDEX IF NOT EXISTS ix_sample_requests_id ON sample_requests (id);
"""


def upgrade():
    op.execute(SCHEMA)


def downgrade():
    raise RuntimeError("Refusing to drop the baseline schema (it holds production data).")
