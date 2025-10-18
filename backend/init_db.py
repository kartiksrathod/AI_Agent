#!/usr/bin/env python3
"""
Database initialization script - creates admin user automatically
Run this on startup to ensure admin exists
"""
import os
import sys
from pymongo import MongoClient
from passlib.context import CryptContext
import uuid
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# MongoDB config
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "academic_resources")

# Admin credentials - YOUR CREDENTIALS
ADMIN_EMAIL = "kartiksrathod07@gmail.com"
ADMIN_PASSWORD = "Sheshi@1234"
ADMIN_NAME = "Kartik S Rathod"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def init_database():
    """Initialize database with admin user if doesn't exist"""
    try:
        client = MongoClient(MONGO_URL)
        db = client[DATABASE_NAME]
        users_collection = db.users
        
        # Check if admin already exists
        admin = users_collection.find_one({"email": ADMIN_EMAIL})
        
        if admin:
            print(f"✓ Admin user already exists: {ADMIN_EMAIL}")
            # Ensure admin flag is set
            if not admin.get("is_admin"):
                users_collection.update_one(
                    {"_id": admin["_id"]},
                    {"$set": {"is_admin": True}}
                )
                print("✓ Updated admin privileges")
            return True
        
        # Create admin user
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
        print(f"✓ Admin user created successfully!")
        print(f"  Email: {ADMIN_EMAIL}")
        print(f"  Password: {ADMIN_PASSWORD}")
        
        # Create indexes for better performance
        users_collection.create_index("email", unique=True)
        db.papers.create_index([("created_at", -1)])
        db.notes.create_index([("created_at", -1)])
        db.syllabus.create_index([("created_at", -1)])
        db.forum_posts.create_index([("last_activity", -1)])
        
        print("✓ Database indexes created")
        return True
        
    except Exception as e:
        print(f"✗ Database initialization error: {e}")
        return False

if __name__ == "__main__":
    success = init_database()
    sys.exit(0 if success else 1)
