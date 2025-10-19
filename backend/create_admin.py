#!/usr/bin/env python3

import os
import uuid
from datetime import datetime
from passlib.context import CryptContext
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# Configuration
MONGO_URL = os.getenv("MONGO_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME")

# MongoDB setup
client = MongoClient(MONGO_URL)
db = client[DATABASE_NAME]
users_collection = db.users

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_admin_user():
    # Admin credentials - Read from environment or use defaults
    admin_email = os.getenv("ADMIN_EMAIL", "admin@example.com")
    admin_name = os.getenv("ADMIN_NAME", "Admin User")
    admin_password = os.getenv("ADMIN_PASSWORD", "changeme123")
    
    # Check if admin already exists
    existing_admin = users_collection.find_one({"email": admin_email})
    
    if existing_admin:
        print(f"❌ Admin user already exists: {admin_email}")
        return
    
    # Check if any admin exists
    existing_any_admin = users_collection.find_one({"is_admin": True})
    if existing_any_admin:
        print(f"❌ An admin user already exists: {existing_any_admin['email']}")
        return
    
    # Create admin user
    admin_id = str(uuid.uuid4())
    hashed_password = pwd_context.hash(admin_password)
    
    admin_doc = {
        "_id": admin_id,
        "name": admin_name,
        "email": admin_email,
        "password": hashed_password,
        "is_admin": True,
        "created_at": datetime.utcnow()
    }
    
    users_collection.insert_one(admin_doc)
    print("✅ Admin user created successfully!")
    print(f"📧 Email: {admin_email}")
    print(f"👤 Name: {admin_name}")
    print(f"🔑 Password: {admin_password}")
    print("\n⚠️  IMPORTANT: Change the password after first login!")

if __name__ == "__main__":
    create_admin_user()