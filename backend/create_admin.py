#!/usr/bin/env python3
"""
Admin User Creation Script for EduResources

This script creates an admin user in the MongoDB database.
It can be run multiple times safely - won't create duplicates.

Usage:
    python create_admin.py
    
    Or with environment variables:
    ADMIN_EMAIL=kartiksrathod07@gmail.com ADMIN_PASSWORD=Sheshi@1234 python create_admin.py
"""

import os
import sys
from pymongo import MongoClient
from passlib.context import CryptContext
import uuid
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_admin_user():
    """Create an admin user in the database"""
    
    # Get configuration from environment
    mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.getenv("DATABASE_NAME", "academic_resources")
    
    # Get admin credentials
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")
    admin_name = os.getenv("ADMIN_NAME", "Admin User")
    
    if not admin_email or not admin_password:
        print("\n⚠️  Please set ADMIN_EMAIL and ADMIN_PASSWORD environment variables")
        print("\nYou can either:")
        print("1. Add them to backend/.env file")
        print("2. Run with: ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=pass python create_admin.py")
        sys.exit(1)
    
    try:
        # Connect to MongoDB
        print(f"\n🔄 Connecting to MongoDB at {mongo_url}...")
        client = MongoClient(mongo_url)
        db = client[db_name]
        users_collection = db.users
        
        # Test connection
        client.admin.command('ping')
        print("✅ MongoDB connected successfully")
        
        # Check if admin already exists
        existing_admin = users_collection.find_one({"email": admin_email})
        
        if existing_admin:
            print(f"\n⚠️  User with email {admin_email} already exists")
            
            # Update to admin if not already
            if not existing_admin.get("is_admin"):
                users_collection.update_one(
                    {"_id": existing_admin["_id"]},
                    {"$set": {"is_admin": True}}
                )
                print("✅ Updated existing user to admin")
            else:
                print("✅ User is already an admin")
            
            return
        
        # Create new admin user
        user_id = str(uuid.uuid4())
        hashed_password = pwd_context.hash(admin_password)
        
        admin_doc = {
            "_id": user_id,
            "name": admin_name,
            "email": admin_email,
            "password": hashed_password,
            "usn": "ADMIN",
            "course": "Administration",
            "semester": "N/A",
            "is_admin": True,
            "created_at": datetime.utcnow()
        }
        
        users_collection.insert_one(admin_doc)
        
        print(f"\n✅ Admin user created successfully!")
        print(f"\n📧 Email: {admin_email}")
        print(f"👤 Name: {admin_name}")
        print(f"\n⚠️  Please keep your credentials secure!")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        sys.exit(1)
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    print("\n" + "="*60)
    print("     EduResources - Admin User Creation Script")
    print("="*60)
    create_admin_user()
    print("\n" + "="*60 + "\n")
