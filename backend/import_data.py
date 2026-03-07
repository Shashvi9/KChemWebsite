"""
Bulk data import script for KChem database
Supports importing categories, subcategories, and products from CSV files
"""
import os
import csv
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.models import Category, Subcategory, Product

# Your Neon database URL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://neondb_owner:npg_G2nC4JzgSHOE@ep-red-flower-a4n86t9b-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require")

def get_session():
    """Create database session"""
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal()

def slugify(text):
    """Convert text to URL-friendly slug"""
    return text.lower().replace(" ", "-").replace("&", "and").replace("/", "-")

def import_from_csv(categories_csv=None, subcategories_csv=None, products_csv=None):
    """
    Import data from CSV files
    
    Categories CSV format: name
    Subcategories CSV format: category_name,name
    Products CSV format: category_name,subcategory_name,name,form,attributes_json
    """
    db = get_session()
    
    try:
        # Import Categories
        if categories_csv and os.path.exists(categories_csv):
            print(f"Importing categories from {categories_csv}...")
            with open(categories_csv, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    category = Category(
                        name=row['name'],
                        slug=slugify(row['name'])
                    )
                    db.add(category)
            db.commit()
            print(f"✅ Categories imported")
        
        # Import Subcategories
        if subcategories_csv and os.path.exists(subcategories_csv):
            print(f"Importing subcategories from {subcategories_csv}...")
            with open(subcategories_csv, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    category = db.query(Category).filter(Category.name == row['category_name']).first()
                    if category:
                        subcategory = Subcategory(
                            category_id=category.id,
                            name=row['name'],
                            slug=slugify(row['name'])
                        )
                        db.add(subcategory)
            db.commit()
            print(f"✅ Subcategories imported")
        
        # Import Products
        if products_csv and os.path.exists(products_csv):
            print(f"Importing products from {products_csv}...")
            with open(products_csv, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    category = db.query(Category).filter(Category.name == row['category_name']).first()
                    if category:
                        subcategory = db.query(Subcategory).filter(
                            Subcategory.category_id == category.id,
                            Subcategory.name == row['subcategory_name']
                        ).first()
                        if subcategory:
                            # Parse attributes JSON if provided
                            attributes = None
                            if 'attributes' in row and row['attributes']:
                                try:
                                    attributes = json.loads(row['attributes'])
                                except:
                                    attributes = None
                            
                            product = Product(
                                subcategory_id=subcategory.id,
                                name=row['name'],
                                form=row.get('form', None),
                                attributes=attributes
                            )
                            db.add(product)
            db.commit()
            print(f"✅ Products imported")
        
        print("\n✅ All data imported successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

def import_sample_data():
    """Import sample data for testing"""
    db = get_session()
    
    try:
        print("Creating sample data...")
        
        # Create categories
        categories_data = [
            {"name": "Dyes & Intermediates", "slug": "dyes-intermediates"},
            {"name": "Shades & Pigments", "slug": "shades-pigments"},
            {"name": "Pharma Intermediates", "slug": "pharma-intermediates"},
        ]
        
        categories = {}
        for cat_data in categories_data:
            cat = Category(**cat_data)
            db.add(cat)
            db.flush()
            categories[cat_data['name']] = cat
        
        # Create subcategories
        subcategories_data = [
            {"category": "Dyes & Intermediates", "name": "Acid Dyes", "slug": "acid-dyes"},
            {"category": "Dyes & Intermediates", "name": "Direct Dyes", "slug": "direct-dyes"},
            {"category": "Shades & Pigments", "name": "Organic Pigments", "slug": "organic-pigments"},
            {"category": "Pharma Intermediates", "name": "API Intermediates", "slug": "api-intermediates"},
        ]
        
        subcategories = {}
        for subcat_data in subcategories_data:
            cat = categories[subcat_data['category']]
            subcat = Subcategory(
                category_id=cat.id,
                name=subcat_data['name'],
                slug=subcat_data['slug']
            )
            db.add(subcat)
            db.flush()
            subcategories[subcat_data['name']] = subcat
        
        # Create sample products
        products_data = [
            {
                "subcategory": "Acid Dyes",
                "name": "Acid Red 88",
                "form": "Powder",
                "attributes": {"cas": "1658-56-6", "color": "Red", "purity": "95%"}
            },
            {
                "subcategory": "Acid Dyes",
                "name": "Acid Blue 113",
                "form": "Liquid",
                "attributes": {"cas": "3351-05-1", "color": "Blue", "purity": "98%"}
            },
            {
                "subcategory": "Organic Pigments",
                "name": "Pigment Yellow 12",
                "form": "Powder",
                "attributes": {"cas": "6358-85-6", "color": "Yellow"}
            },
        ]
        
        for prod_data in products_data:
            subcat = subcategories[prod_data['subcategory']]
            product = Product(
                subcategory_id=subcat.id,
                name=prod_data['name'],
                form=prod_data['form'],
                attributes=prod_data['attributes']
            )
            db.add(product)
        
        db.commit()
        print("✅ Sample data created successfully!")
        print("\nCreated:")
        print(f"  - {len(categories_data)} categories")
        print(f"  - {len(subcategories_data)} subcategories")
        print(f"  - {len(products_data)} products")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "sample":
        # Import sample data
        import_sample_data()
    elif len(sys.argv) >= 4:
        # Import from CSV files
        import_from_csv(
            categories_csv=sys.argv[1] if sys.argv[1] != "none" else None,
            subcategories_csv=sys.argv[2] if sys.argv[2] != "none" else None,
            products_csv=sys.argv[3] if sys.argv[3] != "none" else None
        )
    else:
        print("Usage:")
        print("  python import_data.py sample                                    # Import sample data")
        print("  python import_data.py categories.csv subcategories.csv products.csv  # Import from CSV")
        print("\nCSV Format:")
        print("  categories.csv: name")
        print("  subcategories.csv: category_name,name")
        print("  products.csv: category_name,subcategory_name,name,form,attributes")
