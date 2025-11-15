import json
import os
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.db.models import Category, Subcategory, Product

# Create tables
Base.metadata.create_all(bind=engine)

db: Session = SessionLocal()

def seed_data():
    # Clear existing data
    db.query(Product).delete()
    db.query(Subcategory).delete()
    db.query(Category).delete()
    db.commit()

    print("Seeding data...")

    # --- Path Setup ---
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(backend_dir, '..', 'kewin-chem-connect-main', 'public', 'data')

    # --- Categories ---
    categories_to_seed = {
        "dyes-intermediates": "Dyes & Intermediates",
        "food-pharma-colors": "Food & Pharma Colors",
        "shades-pigments": "Shades & Pigments",
        "varieties-cosmetics": "Varieties & Cosmetics",
    }
    
    categories = {}
    for slug, name in categories_to_seed.items():
        category = Category(name=name, slug=slug)
        db.add(category)
        db.commit()
        categories[slug] = category

    # --- Helpers ---
    def normalize_record(item: dict, *, form: str | None, subcategory_slug: str) -> tuple[str | None, dict]:
        """Return (product_name, attributes) or (None, {}) if the row should be skipped.
        - Unifies common field names
        - Skips header/placeholder rows
        - Normalizes attribute keys
        """
        if not isinstance(item, dict):
            return None, {}

        # Raw name candidates
        name = (
            item.get('ProductName') or item.get('Product Name') or item.get('C.I Name') or item.get('Name')
        )
        if isinstance(name, str):
            stripped = name.strip()
            if not stripped or stripped.lower() in {"nan", "-", "n/a", "none", "no data available in table", "product name"}:
                name = None
            else:
                name = stripped
        else:
            name = None

        # Skip rows that are clearly placeholders even if name exists
        placeholder_values = {"-", "nan", "n/a", "none", "no data available in table"}
        all_vals = [str(v).strip().lower() for v in item.values() if v is not None]
        if all_vals and all(v in placeholder_values or v == "" for v in all_vals):
            return None, {}

        # Canonical key mapping for attributes
        canonical_map = {
            'id': None,
            'select': None,
            'productname': None,
            'product name': None,
            'c.i name': None,
            'name': None,
            'strength': 'strength',
            'presentation': 'presentation',
            'dosage form': 'dosage_form',
            'therapeutic segments': 'therapeutic_segments',
            'therapeutic segment': 'therapeutic_segments',
            'segments': 'therapeutic_segments',
            'shade': 'shade',
            'color index': 'color_index',
            'color index no': 'color_index',
            'c.i. no': 'color_index',
            'form': 'form',
        }

        attrs: dict = {}
        for k, v in item.items():
            if k is None:
                continue
            kl = str(k).strip().lower().replace('.', '')
            # keys stored also with spaces normalized
            if kl in canonical_map:
                target = canonical_map[kl]
                if target is None:
                    continue  # skip
            else:
                target = kl.replace(' ', '_')
            # Basic value cleaning
            if isinstance(v, str):
                vv = v.strip()
                if vv.lower() in placeholder_values or vv == "":
                    continue
                attrs[target] = vv
            elif v is not None:
                attrs[target] = v

        # Include form if provided and not already set
        if form and not attrs.get('form'):
            attrs['form'] = form

        return name, attrs

    # --- Generic Product Seeder ---
    def seed_products_from_dir(category_slug, subcategory_path):
        category = categories[category_slug]
        
        for item_name in os.listdir(subcategory_path):
            item_path = os.path.join(subcategory_path, item_name)
            
            if os.path.isdir(item_path):
                subcategory_name = item_name.replace('Table', '').replace('_', ' ').replace('-', ' ').title()
                subcategory_slug = item_name.lower().replace('table', '').replace('_', '-').replace(' ', '-')
                
                subcategory = Subcategory(name=subcategory_name, slug=subcategory_slug, category_id=category.id)
                db.add(subcategory)
                db.commit()

                for json_file in os.listdir(item_path):
                    if json_file.endswith('.json'):
                        form = json_file.replace('.json', '').replace('_', ' ').title()
                        with open(os.path.join(item_path, json_file), 'r', encoding='utf-8') as f:
                            data = json.load(f)
                            # Normalize JSON to a list of dict items only
                            if isinstance(data, dict):
                                # Try common keys if file contains an object with an items array
                                for key in ['data', 'items', 'rows', 'list']:
                                    if key in data and isinstance(data[key], list):
                                        data = data[key]
                                        break
                                else:
                                    data = []
                            elif isinstance(data, list):
                                # keep only dictionary records
                                data = [x for x in data if isinstance(x, dict)]
                            else:
                                data = []
                            for item in data:
                                pname, attrs = normalize_record(item, form=form, subcategory_slug=subcategory_slug)
                                if not pname:
                                    continue
                                product = Product(
                                    subcategory_id=subcategory.id,
                                    name=pname,
                                    form=form,
                                    attributes=attrs
                                )
                                db.add(product)
            
            elif os.path.isfile(item_path) and item_name.endswith('.json'):
                subcategory_name = item_name.replace('_list.json', '').replace('_', ' ').title()
                subcategory_slug = subcategory_name.lower().replace(' ', '-')
                
                subcategory = Subcategory(name=subcategory_name, slug=subcategory_slug, category_id=category.id)
                db.add(subcategory)
                db.commit()

                with open(item_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    # Normalize JSON to a list of dict items only
                    if isinstance(data, dict):
                        for key in ['data', 'items', 'rows', 'list']:
                            if key in data and isinstance(data[key], list):
                                data = data[key]
                                break
                        else:
                            data = []
                    elif isinstance(data, list):
                        data = [x for x in data if isinstance(x, dict)]
                    else:
                        data = []
                    for item in data:
                        pname, attrs = normalize_record(item, form=None, subcategory_slug=subcategory_slug)
                        if not pname:
                            continue
                        product = Product(
                            subcategory_id=subcategory.id,
                            name=pname,
                            form=None,
                            attributes=attrs
                        )
                        db.add(product)

    # --- Seed Subcategories and Products ---
    seed_products_from_dir("dyes-intermediates", os.path.join(data_path, 'dyes-intermediates'))
    seed_products_from_dir("food-pharma-colors", os.path.join(data_path, 'food-pharmacolors'))
    seed_products_from_dir("shades-pigments", os.path.join(data_path, 'shades-Pigments'))
    seed_products_from_dir("varieties-cosmetics", os.path.join(data_path, 'varieties-cosmetics'))

    db.commit()
    print("Data seeding complete.")

if __name__ == "__main__":
    seed_data()