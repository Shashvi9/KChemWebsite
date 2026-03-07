"""
Import existing data from public/data folder to Neon database
This script reads all JSON files from the frontend data folder and imports them
"""
import os
import json
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.models import Category, Subcategory, Product

# Your Neon database URL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://neondb_owner:npg_G2nC4JzgSHOE@ep-red-flower-a4n86t9b-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require")

# Path to data folder
DATA_FOLDER = Path(__file__).parent.parent / "kewin-chem-connect-main" / "public" / "data"

def get_session():
    """Create database session"""
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal()

def slugify(text):
    """Convert text to URL-friendly slug"""
    return text.lower().replace(" ", "-").replace("&", "and").replace("/", "-")

def import_all_data():
    """Import all data from JSON files"""
    db = get_session()
    
    try:
        # Clear existing sample data
        print("Clearing existing data...")
        db.query(Product).delete()
        db.query(Subcategory).delete()
        db.query(Category).delete()
        db.commit()
        
        # Define category structure based on folder structure
        category_mapping = {
            "dyes-intermediates": {
                "name": "Dyes & Intermediates",
                "slug": "dyes-intermediates",
                "subcategories": {
                    "AcidDyesTable": {
                        "name": "Acid Dyes",
                        "slug": "acid-dyes",
                        "files": [
                            "acid_dyes.json",
                            "levelling_dyes.json",
                            "metal_complex_1_1_dyes.json",
                            "metal_complex_1_2_dyes.json",
                            "mill_dyes.json"
                        ]
                    },
                    "BasicDyesTable": {
                        "name": "Basic Dyes",
                        "slug": "basic-dyes",
                        "files": ["basic_dyes_liquid.json", "basic_dyes_powder.json"]
                    },
                    "ReactiveDyesTable": {
                        "name": "Reactive Dyes",
                        "slug": "reactive-dyes",
                        "files": [
                            "HE_dyes.json",
                            "Hot_dyes.json",
                            "ME_dyes.json",
                            "printing_dyes_1.json",
                            "printing_dyes_2.json",
                            "vinyl_sulphone_base_dye.json"
                        ]
                    },
                    "FoodAndLakeColor": {
                        "name": "Food & Lake Colors",
                        "slug": "food-lake-colors",
                        "files": [
                            "D_C_color.json",
                            "FD_C_color.json",
                            "Food_color.json",
                            "blended_color.json",
                            "lake_color.json"
                        ]
                    },
                    "direct_dyes": {
                        "name": "Direct Dyes",
                        "slug": "direct-dyes",
                        "files": ["direct_dyes_list.json"]
                    },
                    "solvent_dyes": {
                        "name": "Solvent Dyes",
                        "slug": "solvent-dyes",
                        "files": ["solvent_dyes_list.json"]
                    },
                    "intermediates": {
                        "name": "Intermediates",
                        "slug": "intermediates",
                        "files": ["intermediates_list.json"]
                    }
                }
            },
            "shades-Pigments": {
                "name": "Shades & Pigments",
                "slug": "shades-pigments",
                "subcategories": {
                    "organic-Pigments": {
                        "name": "Organic Pigments",
                        "slug": "organic-pigments",
                        "files": ["toner_fanal_pigment.json"]
                    }
                }
            },
            "food-pharmacolors": {
                "name": "Food & Pharma Colors",
                "slug": "food-pharmacolors",
                "subcategories": {
                    "injectable-OintmentsTable": {
                        "name": "Injectable & Ointments",
                        "slug": "injectable-ointments",
                        "files": ["injectables.json", "ointments.json"]
                    },
                    "nasalDrops-OralSuspensionsTable": {
                        "name": "Nasal Drops & Oral Suspensions",
                        "slug": "nasal-drops-oral-suspensions",
                        "files": ["nasal_drop.json", "oral_suspensions.json"]
                    },
                    "nutraceuticalsTable": {
                        "name": "Nutraceuticals",
                        "slug": "nutraceuticals",
                        "files": ["Minerals.json", "Specialities.json", "Stabilized_vitamins.json", "amino_acid.json"]
                    },
                    "tablets-CapsulesTable": {
                        "name": "Tablets & Capsules",
                        "slug": "tablets-capsules",
                        "files": ["combination_formulations.json", "tablet_and_capsules.json"]
                    },
                    "veterinaryFormulationTable": {
                        "name": "Veterinary Formulations",
                        "slug": "veterinary-formulations",
                        "files": ["companion_animal_products.json", "livestock_product.json", "other_product.json", "poultry_product.json"]
                    }
                }
            }
        }
        
        total_products = 0
        
        # Process each category
        for cat_folder, cat_data in category_mapping.items():
            print(f"\n📦 Processing category: {cat_data['name']}")
            
            # Create category
            category = Category(
                name=cat_data['name'],
                slug=cat_data['slug']
            )
            db.add(category)
            db.flush()
            
            # Process subcategories
            for subcat_folder, subcat_data in cat_data['subcategories'].items():
                print(f"  📁 Processing subcategory: {subcat_data['name']}")
                
                # Create subcategory
                subcategory = Subcategory(
                    category_id=category.id,
                    name=subcat_data['name'],
                    slug=subcat_data['slug']
                )
                db.add(subcategory)
                db.flush()
                
                # Process JSON files
                for json_file in subcat_data['files']:
                    # Try different possible paths
                    possible_paths = [
                        DATA_FOLDER / cat_folder / subcat_folder / json_file,
                        DATA_FOLDER / cat_folder / json_file,
                    ]
                    
                    file_path = None
                    for path in possible_paths:
                        if path.exists():
                            file_path = path
                            break
                    
                    if not file_path:
                        print(f"    ⚠️  File not found: {json_file}")
                        continue
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            data = json.load(f)
                        
                        if not isinstance(data, list):
                            print(f"    ⚠️  Skipping {json_file}: not a list")
                            continue
                        
                        # Determine form from filename
                        form = json_file.replace('.json', '').replace('_', ' ').title()
                        
                        # Import products
                        count = 0
                        for item in data:
                            # Extract product name - try different field names
                            name = item.get('ProductName') or item.get('C.I Name') or item.get('name') or item.get('Name')
                            
                            if not name:
                                continue
                            
                            # Create attributes dict from all other fields
                            attributes = {}
                            for key, value in item.items():
                                if key not in ['Id', 'id', 'Select', 'ProductName', 'C.I Name', 'name', 'Name'] and value and value != '-':
                                    attributes[key] = value
                            
                            # Create product
                            product = Product(
                                subcategory_id=subcategory.id,
                                name=name,
                                form=form if form != json_file else None,
                                attributes=attributes if attributes else None
                            )
                            db.add(product)
                            count += 1
                        
                        total_products += count
                        print(f"    ✅ Imported {count} products from {json_file}")
                        
                    except Exception as e:
                        print(f"    ❌ Error processing {json_file}: {e}")
                        continue
        
        db.commit()
        print(f"\n🎉 Import complete!")
        print(f"   Total products imported: {total_products}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    import_all_data()
