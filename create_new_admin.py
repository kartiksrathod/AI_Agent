#!/usr/bin/env python3
"""Create the new admin user"""

from pymongo import MongoClient
from passlib.context import CryptContext
import uuid
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv('/app/backend/.env')

# Setup password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME")

client = MongoClient(MONGO_URL)
db = client[DATABASE_NAME]
users_collection = db.users

# Admin credentials
admin_email = "kartiksrathod07@gmail.com"
admin_password = "Sheshi@1234"
admin_name = "Kartik S Rathod"

# Check if admin already exists
existing_admin = users_collection.find_one({"email": admin_email})

if existing_admin:
    print(f"✓ Admin user already exists: {admin_email}")
    # Make sure they have admin privileges
    users_collection.update_one(
        {"email": admin_email},
        {"$set": {"is_admin": True}}
    )
    print(f"✓ Ensured admin privileges for: {admin_email}")
else:
    # Create new admin user
    user_id = str(uuid.uuid4())
    hashed_pw = pwd_context.hash(admin_password)
    
    user_doc = {
        "_id": user_id,
        "name": admin_name,
        "email": admin_email,
        "password": hashed_pw,
        "is_admin": True,
        "created_at": datetime.utcnow()
    }
    
    users_collection.insert_one(user_doc)
    print(f"✓ Admin user created successfully!")
    print(f"  Email: {admin_email}")
    print(f"  Password: {admin_password}")
    print(f"  Name: {admin_name}")

print("\n✅ Admin setup complete!")
