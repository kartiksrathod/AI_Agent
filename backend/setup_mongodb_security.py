#!/usr/bin/env python3
"""
MongoDB Security Setup
Creates a restricted user with minimal privileges for the application
"""

import os
import sys
from pymongo import MongoClient
import secrets
import string

def generate_strong_password(length=24):
    """Generate a cryptographically strong password"""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*()-_=+"
    password = ''.join(secrets.choice(alphabet) for _ in range(length))
    return password

def create_restricted_user():
    """
    Create a restricted MongoDB user with minimal privileges
    """
    print("🔒 MongoDB Security Setup")
    print("=" * 50)
    
    # Connect as admin
    admin_mongo_url = "mongodb://localhost:27017"
    
    try:
        client = MongoClient(admin_mongo_url)
        
        # Test connection
        client.admin.command('ping')
        print("✅ Connected to MongoDB")
        
        # Database name
        db_name = os.getenv("DATABASE_NAME", "academic_resources_db")
        db = client[db_name]
        
        # Generate secure credentials
        app_username = "app_user"
        app_password = generate_strong_password()
        
        print(f"🔑 Creating restricted user: {app_username}")
        
        # Check if user already exists
        existing_users = db.command("usersInfo")["users"]
        user_exists = any(u["user"] == app_username for u in existing_users)
        
        if user_exists:
            print(f"⚠️  User '{app_username}' already exists. Updating password...")
            db.command(
                "updateUser",
                app_username,
                pwd=app_password
            )
        else:
            # Create user with restricted privileges
            db.command(
                "createUser",
                app_username,
                pwd=app_password,
                roles=[
                    {
                        "role": "readWrite",
                        "db": db_name
                    }
                ]
            )
        
        print("✅ Restricted user created/updated successfully")
        print()
        print("🔐 User Privileges:")
        print(f"   - Database: {db_name}")
        print("   - Role: readWrite (no admin privileges)")
        print("   - Can: Read, Write, Create Collections")
        print("   - Cannot: Drop Database, Create Users, Admin Operations")
        print()
        print("📝 Connection String:")
        connection_string = f"mongodb://{app_username}:{app_password}@localhost:27017/{db_name}"
        print(f"   {connection_string}")
        print()
        print("⚠️  IMPORTANT: Save these credentials to .env file:")
        print("=" * 50)
        print(f"MONGO_USERNAME={app_username}")
        print(f"MONGO_PASSWORD={app_password}")
        print(f"MONGO_URL={connection_string}")
        print("=" * 50)
        print()
        
        # Save to a secure file
        credentials_file = "/app/backend/.mongodb_credentials"
        with open(credentials_file, "w") as f:
            f.write(f"# MongoDB Restricted User Credentials\n")
            f.write(f"# Generated: {__import__('datetime').datetime.utcnow().isoformat()}\n\n")
            f.write(f"MONGO_USERNAME={app_username}\n")
            f.write(f"MONGO_PASSWORD={app_password}\n")
            f.write(f"MONGO_URL={connection_string}\n")
        
        os.chmod(credentials_file, 0o600)  # Read/write for owner only
        print(f"✅ Credentials saved to: {credentials_file}")
        print("⚠️  This file contains sensitive data. Keep it secure!")
        print()
        
        # Test the new user
        print("🧪 Testing new user connection...")
        test_client = MongoClient(connection_string)
        test_client.admin.command('ping')
        print("✅ New user connection successful!")
        
        test_client.close()
        client.close()
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = create_restricted_user()
    sys.exit(0 if success else 1)
