"""Dye intermediates become their own category with nine ranges, grouped by chemical family.

Products move from the single "Dye Intermediates" range under Dyes & Intermediates; each product's
range follows its specs.chemical_family. The old range is deactivated, not deleted. The duplicate
2,7-dihydroxynaphthalene listing is merged into one: the other row is deactivated and its name kept
as a synonym.

Revision ID: 0004
"""
from alembic import op
import sqlalchemy as sa

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None

CATEGORY = ("Dye Intermediates", "dye-intermediates")
OLD_RANGE = "dye-intermediates"
RANGES = [
    ("Naphthalene Compounds", "naphthalene-compounds", ["Naphthalene"]),
    ("Aniline & Phenylene Compounds", "aniline-phenylene-compounds", ["Aniline", "Phenylene"]),
    ("Phenol, Cresol, Salicylic & Resorcinol Compounds", "phenol-cresol-salicylic-resorcinol-compounds",
     ["Phenol", "Cresol", "Salicylic", "Resorcinol"]),
    ("Benzene, Toluene, Anisidine & Toluidine Compounds", "benzene-toluene-anisidine-toluidine-compounds",
     ["Benzene", "Toluene", "Anisidine", "Toluidine"]),
    ("Pyrazolone Compounds", "pyrazolone-compounds", ["Pyrazolone"]),
    ("Vinyl Sulphone, Ether, Stilbene, Pyridone & Phthalic Compounds",
     "vinyl-sulphone-ether-stilbene-pyridone-phthalic-compounds",
     ["Vinyl Sulphone", "Ether Compounds", "Stilbene", "Pyridone", "Phthalic"]),
    ("Naphthols, Fast Bases & Phthalocyanines", "naphthols-fast-bases-phthalocyanines",
     ["Naphthols", "Fast Bases", "Phthalocyanines"]),
    ("Benzoic, Anthranilic & Cresidine Compounds", "benzoic-anthranilic-cresidine-compounds",
     ["Benzoic", "Anthranilic", "Cresidine"]),
    ("Iodines & Indoles", "iodines-indoles", ["Iodines", "Indoles"]),
]
DUPLICATE = ("27-di-hydroxy-naphthalene", "27-dihydroxy-naphthalene")

FAMILY = """CASE WHEN jsonb_typeof(p.specs->'chemical_family') = 'array'
               THEN (CASE WHEN p.specs->'chemical_family' ? 'Naphthols' THEN 'Naphthols'
                          ELSE p.specs->'chemical_family'->>0 END)
               ELSE p.specs->>'chemical_family' END"""


def upgrade():
    db = op.get_bind()
    q = lambda sql, **kw: db.execute(sa.text(sql), kw)

    old = q("SELECT id, category_id FROM subcategories WHERE slug = :s", s=OLD_RANGE).first()
    if old is None:
        return
    sort = q("SELECT sort_order FROM categories WHERE id = :c", c=old.category_id).scalar() or 0
    cat_id = q("""INSERT INTO categories (name, slug, sort_order) VALUES (:n, :s, :o)
                  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id""",
               n=CATEGORY[0], s=CATEGORY[1], o=sort).scalar()

    for i, (name, slug, families) in enumerate(RANGES):
        sub_id = q("""INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (:c, :n, :s, :o)
                      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, category_id = EXCLUDED.category_id
                      RETURNING id""", c=cat_id, n=name, s=slug, o=i).scalar()
        ids = [r.id for r in q(f"""
            SELECT p.id FROM products p
            JOIN product_subcategories ps ON ps.product_id = p.id AND ps.subcategory_id = :old
            WHERE ({FAMILY}) = ANY(:f)""", old=old.id, f=families)]
        if not ids:
            continue
        q(f"""INSERT INTO product_subcategories (product_id, subcategory_id, sort_order)
              SELECT p.id, :sub, array_position(CAST(:f AS text[]), {FAMILY}) FROM products p WHERE p.id = ANY(:ids)
              ON CONFLICT (product_id, subcategory_id) DO NOTHING""", sub=sub_id, f=families, ids=ids)
        q("UPDATE products SET category_id = :c, subcategory_id = :s WHERE id = ANY(:ids)", c=cat_id, s=sub_id, ids=ids)
        q("DELETE FROM product_subcategories WHERE subcategory_id = :old AND product_id = ANY(:ids)", old=old.id, ids=ids)

    left = q("SELECT count(*) FROM product_subcategories WHERE subcategory_id = :old", old=old.id).scalar()
    if left == 0:
        q("UPDATE subcategories SET is_active = false WHERE id = :old", old=old.id)

    drop = q("SELECT id, name FROM products WHERE slug = :s AND is_active", s=DUPLICATE[0]).first()
    keep = q("SELECT id FROM products WHERE slug = :s", s=DUPLICATE[1]).scalar()
    if drop and keep:
        q("""UPDATE products SET synonyms = array_append(synonyms, CAST(:n AS varchar))
             WHERE id = :k AND NOT (CAST(:n AS varchar) = ANY(synonyms))""", n=drop.name, k=keep)
        q("""INSERT INTO cas_aliases (product_id, cas_number) SELECT :k, cas_number FROM cas_aliases
             WHERE product_id = :d ON CONFLICT (product_id, cas_number) DO NOTHING""", k=keep, d=drop.id)
        q("""INSERT INTO product_applications (product_id, application_id) SELECT :k, application_id
             FROM product_applications WHERE product_id = :d
             ON CONFLICT (product_id, application_id) DO NOTHING""", k=keep, d=drop.id)
        q("UPDATE products SET is_active = false WHERE id = :d", d=drop.id)


def downgrade():
    db = op.get_bind()
    q = lambda sql, **kw: db.execute(sa.text(sql), kw)
    old = q("SELECT id, category_id FROM subcategories WHERE slug = :s", s=OLD_RANGE).first()
    cat = q("SELECT id FROM categories WHERE slug = :s", s=CATEGORY[1]).scalar()
    if old is None or cat is None:
        return
    q("""INSERT INTO product_subcategories (product_id, subcategory_id, sort_order)
         SELECT ps.product_id, :old, 0 FROM product_subcategories ps
         JOIN subcategories s ON s.id = ps.subcategory_id WHERE s.category_id = :cat
         ON CONFLICT (product_id, subcategory_id) DO NOTHING""", old=old.id, cat=cat)
    q("UPDATE products SET category_id = :oc, subcategory_id = :old WHERE category_id = :cat",
      oc=old.category_id, old=old.id, cat=cat)
    q("UPDATE subcategories SET is_active = true WHERE id = :old", old=old.id)
    q("DELETE FROM subcategories WHERE category_id = :cat", cat=cat)
    q("DELETE FROM categories WHERE id = :cat", cat=cat)
    q("UPDATE products SET is_active = true WHERE slug = :s", s=DUPLICATE[0])
