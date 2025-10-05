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
    # Check if admin already exists
    existing_admin = users_collection.find_one({"email": "admin@example.com"})
    
    if existing_admin:
        print("Admin user already exists!")
        return
    
    # Create admin user
    admin_id = str(uuid.uuid4())
    hashed_password = pwd_context.hash("admin123")
    
    admin_doc = {
        "_id": admin_id,
        "name": "Administrator",
        "email": "admin@example.com",
        "password": hashed_password,
        "is_admin": True,
        "created_at": datetime.utcnow()
    }
    
    users_collection.insert_one(admin_doc)
    print("✅ Admin user created successfully!")
    print("📧 Email: admin@example.com")
    print("🔑 Password: admin123")

if __name__ == "__main__":
    create_admin_user()