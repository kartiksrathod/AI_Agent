#!/usr/bin/env python3

import os
import uuid
from datetime import datetime
from passlib.context import CryptContext
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv('/app/backend/.env')

# Configuration
MONGO_URL = os.getenv("MONGO_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME")

# MongoDB setup
client = MongoClient(MONGO_URL)
db = client[DATABASE_NAME]
users_collection = db.users

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_demo_users():
    demo_users = [
        {
            "name": "Demo Student",
            "email": "student@example.com",
            "password": "password123",
            "is_admin": False
        },
        {
            "name": "Test User", 
            "email": "test@example.com",
            "password": "test123",
            "is_admin": False
        },
        {
            "name": "Admin User",
            "email": "admin@example.com", 
            "password": "admin123",
            "is_admin": True
        }
    ]
    
    for user_data in demo_users:
        # Check if user already exists
        existing_user = users_collection.find_one({"email": user_data["email"]})
        
        if existing_user:
            print(f"✅ User already exists: {user_data['email']}")
            continue
        
        # Create user
        user_id = str(uuid.uuid4())
        hashed_password = pwd_context.hash(user_data["password"])
        
        user_doc = {
            "_id": user_id,
            "name": user_data["name"],
            "email": user_data["email"],
            "password": hashed_password,
            "is_admin": user_data["is_admin"],
            "created_at": datetime.utcnow()
        }
        
        users_collection.insert_one(user_doc)
        role = "ADMIN" if user_data["is_admin"] else "USER"
        print(f"✅ Created {role}: {user_data['email']} ({user_data['name']})")

if __name__ == "__main__":
    create_demo_users()
    print("\n🎉 Demo users setup complete!")