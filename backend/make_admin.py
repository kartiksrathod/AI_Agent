#!/usr/bin/env python3
"""
Script to make a user an admin
Usage: python make_admin.py <email>
"""
import sys
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME")

def make_admin(email):
    try:
        client = MongoClient(MONGO_URL)
        db = client[DATABASE_NAME]
        users_collection = db.users
        
        # Find user
        user = users_collection.find_one({"email": email})
        
        if not user:
            print(f"❌ User with email '{email}' not found")
            return False
        
        # Update to admin
        users_collection.update_one(
            {"email": email},
            {"$set": {"is_admin": True}}
        )
        
        print(f"✅ User '{user['name']}' ({email}) is now an admin!")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python make_admin.py <email>")
        print("\nAvailable users:")
        try:
            client = MongoClient(MONGO_URL)
            db = client[DATABASE_NAME]
            users = db.users.find({})
            for user in users:
                admin_status = "ADMIN" if user.get("is_admin") else "USER"
                print(f"  - {user['email']} ({user['name']}) [{admin_status}]")
        except Exception as e:
            print(f"Error listing users: {e}")
        sys.exit(1)
    
    email = sys.argv[1]
    success = make_admin(email)
    sys.exit(0 if success else 1)
