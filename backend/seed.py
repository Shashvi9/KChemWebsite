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

    # Dyes & Intermediates
    dyes_category = Category(name="Dyes & Intermediates", slug="dyes-intermediates")
    db.add(dyes_category)
    db.commit()

    # Food & Pharmacolors
    food_pharma_category = Category(name="Food & Pharma Colors", slug="food-pharma-colors")
    db.add(food_pharma_category)
    db.commit()

    # --- Dyes & Intermediates ---
    # Construct the path to the data directory dynamically
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(backend_dir, '..', 'kewin-chem-connect-main', 'public', 'data')

    dyes_path = os.path.join(data_path, 'dyes-intermediates')
    for subcategory_dir in os.listdir(dyes_path):
        if os.path.isdir(os.path.join(dyes_path, subcategory_dir)):
            subcategory_name = subcategory_dir.replace('Table', '').replace('_', ' ').title()
            subcategory_slug = subcategory_dir.lower().replace('table', '')
            subcategory = Subcategory(name=subcategory_name, slug=subcategory_slug, category_id=dyes_category.id)
            db.add(subcategory)
            db.commit()

            for json_file in os.listdir(os.path.join(dyes_path, subcategory_dir)):
                if json_file.endswith('.json'):
                    form = json_file.replace('.json', '').title()
                    with open(os.path.join(dyes_path, subcategory_dir, json_file), 'r') as f:
                        data = json.load(f)
                        for item in data:
                            if 'Name' in item and 'CAS no' in item and 'Compound' in item:
                                product = Product(
                                    subcategory_id=subcategory.id,
                                    name=item['Name'],
                                    form=form,
                                    attributes={'cas_no': item['CAS no'], 'compound': item['Compound']}
                                )
                                db.add(product)

    # --- Food & Pharmacolors ---
    food_pharma_path = os.path.join(data_path, 'food-pharmacolors')
    for subcategory_dir in os.listdir(food_pharma_path):
        if os.path.isdir(os.path.join(food_pharma_path, subcategory_dir)):
            subcategory_name = subcategory_dir.replace('Table', '').replace('-', ' ').title()
            subcategory_slug = subcategory_dir.lower().replace('table', '')
            subcategory = Subcategory(name=subcategory_name, slug=subcategory_slug, category_id=food_pharma_category.id)
            db.add(subcategory)
            db.commit()

            for json_file in os.listdir(os.path.join(food_pharma_path, subcategory_dir)):
                if json_file.endswith('.json'):
                    form = json_file.replace('.json', '').title()
                    with open(os.path.join(food_pharma_path, subcategory_dir, json_file), 'r') as f:
                        data = json.load(f)
                        for item in data:
                            if 'Product Name' in item and 'Strength' in item:
                                product = Product(
                                    subcategory_id=subcategory.id,
                                    name=item['Product Name'],
                                    form=form,
                                    attributes={'strength': item['Strength']}
                                )
                                db.add(product)

    db.commit()

    print("Data seeding complete.")

if __name__ == "__main__":
    seed_data()
