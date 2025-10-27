#!/usr/bin/env python3
"""
Admin User Creation Script for EduResources
"""

import os
import sys
import uuid
from datetime import datetime
from dotenv import load_dotenv
from pymongo import MongoClient
from passlib.context import CryptContext

# -------------------------------
# Load .env
# -------------------------------
load_dotenv()

# -------------------------------
# Password hashing
# -------------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# -------------------------------
# Config from .env
# -------------------------------
MONGO_URL = os.getenv("MONGO_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "academic_resources_db")

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
ADMIN_NAME = os.getenv("ADMIN_NAME", "Admin User")

if not ADMIN_EMAIL or not ADMIN_PASSWORD:
    print("\n⚠️  ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env")
    sys.exit(1)

# -------------------------------
# Connect to MongoDB
# -------------------------------
try:
    print(f"\n🔄 Connecting to MongoDB at {MONGO_URL}...")
    client = MongoClient(MONGO_URL)
    db = client[DATABASE_NAME]
    users_collection = db.users
    client.admin.command("ping")
    print("✅ MongoDB connected successfully")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")
    sys.exit(1)

# -------------------------------
# Check if admin exists
# -------------------------------
existing_admin = users_collection.find_one({"email": ADMIN_EMAIL})

if existing_admin:
    print(f"\n⚠️  User with email {ADMIN_EMAIL} already exists")
    if not existing_admin.get("is_admin"):
        users_collection.update_one(
            {"_id": existing_admin["_id"]},
            {"$set": {"is_admin": True}}
        )
        print("✅ Updated existing user to admin")
    else:
        print("✅ User is already an admin")
    sys.exit(0)

# -------------------------------
# Create new admin
# -------------------------------
user_id = str(uuid.uuid4())
hashed_password = pwd_context.hash(ADMIN_PASSWORD)

admin_doc = {
    "_id": user_id,
    "name": ADMIN_NAME,
    "email": ADMIN_EMAIL,
    "password": hashed_password,
    "usn": "ADMIN",
    "course": "Administration",
    "semester": "N/A",
    "is_admin": True,
    "created_at": datetime.utcnow()
}

users_collection.insert_one(admin_doc)

print(f"\n✅ Admin user created successfully!")
print(f"📧 Email: {ADMIN_EMAIL}")
print(f"👤 Name: {ADMIN_NAME}")
print("⚠️  Keep credentials secure!")

# -------------------------------
# Close MongoDB
# -------------------------------
client.close()
