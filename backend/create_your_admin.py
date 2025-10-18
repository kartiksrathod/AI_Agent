#!/usr/bin/env python3
"""
Create YOUR admin account with YOUR credentials
"""
import os
import sys
from pymongo import MongoClient
from passlib.context import CryptContext
import uuid
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "academic_resources")

# YOUR CREDENTIALS
ADMIN_EMAIL = "kartiksrathod07@gmail.com"
ADMIN_PASSWORD = "Sheshi@1234"
ADMIN_NAME = "Kartik S Rathod"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_your_admin():
    """Create your admin account"""
    try:
        client = MongoClient(MONGO_URL)
        db = client[DATABASE_NAME]
        users_collection = db.users
        
        # Check if your admin already exists
        admin = users_collection.find_one({"email": ADMIN_EMAIL})
        
        if admin:
            print(f"✓ Your admin account already exists: {ADMIN_EMAIL}")
            # Ensure admin flag is set
            if not admin.get("is_admin"):
                users_collection.update_one(
                    {"_id": admin["_id"]},
                    {"$set": {"is_admin": True}}
                )
                print("✓ Updated admin privileges")
            return True
        
        # Create YOUR admin user
        admin_id = str(uuid.uuid4())
        hashed_password = pwd_context.hash(ADMIN_PASSWORD)
        
        admin_doc = {
            "_id": admin_id,
            "name": ADMIN_NAME,
            "email": ADMIN_EMAIL,
            "password": hashed_password,
            "is_admin": True,
            "created_at": datetime.utcnow()
        }
        
        users_collection.insert_one(admin_doc)
        print(f"✓ YOUR admin account created!")
        print(f"  Email: {ADMIN_EMAIL}")
        print(f"  Name: {ADMIN_NAME}")
        
        return True
        
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

if __name__ == "__main__":
    success = create_your_admin()
    sys.exit(0 if success else 1)
