#!/usr/bin/env python3
"""
Credential Rotation Script
Rotates all sensitive credentials following security best practices
"""

import os
import sys
import secrets
import string
from pathlib import Path
from datetime import datetime
from pymongo import MongoClient
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def generate_secret_key(length=32):
    """Generate a cryptographically secure secret key"""
    return secrets.token_urlsafe(length)

def generate_strong_password(length=20):
    """Generate a strong password with mixed characters"""
    # Ensure at least one of each type
    password = [
        secrets.choice(string.ascii_uppercase),
        secrets.choice(string.ascii_lowercase),
        secrets.choice(string.digits),
        secrets.choice("!@#$%^&*")
    ]
    
    # Fill the rest
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    password.extend(secrets.choice(alphabet) for _ in range(length - 4))
    
    # Shuffle
    secrets.SystemRandom().shuffle(password)
    return ''.join(password)

def rotate_credentials():
    """
    Rotate all application credentials
    """
    print("🔄 Credential Rotation Script")
    print("=" * 70)
    print("⚠️  This will rotate ALL sensitive credentials")
    print()
    
    # Read current .env if exists
    env_file = Path("/app/backend/.env")
    env_vars = {}
    
    if env_file.exists():
        with open(env_file, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    env_vars[key] = value
    
    print("🔑 Generating new credentials...\n")
    
    # 1. Generate new SECRET_KEY
    old_secret = env_vars.get("SECRET_KEY", "[not set]")
    new_secret_key = generate_secret_key()
    print("1. SECRET_KEY (JWT signing)")
    print(f"   Old: {old_secret[:20]}...")
    print(f"   New: {new_secret_key[:20]}...")
    print()
    
    # 2. Generate new admin password
    old_admin_password = env_vars.get("ADMIN_PASSWORD", "[not set]")
    new_admin_password = generate_strong_password()
    print("2. ADMIN_PASSWORD")
    print(f"   Old: {old_admin_password[:5]}...")
    print(f"   New: {new_admin_password[:5]}...")
    print()
    
    # 3. Keep ADMIN_EMAIL
    admin_email = env_vars.get("ADMIN_EMAIL", "admin@example.com")
    print(f"3. ADMIN_EMAIL: {admin_email} (unchanged)")
    print()
    
    # Update .env file with new credentials
    new_env_vars = {
        **env_vars,
        "SECRET_KEY": new_secret_key,
        "ADMIN_PASSWORD": new_admin_password,
        "ADMIN_EMAIL": admin_email,
    }
    
    # Write new .env file
    print("💾 Updating .env file...")
    backup_file = f"/app/backend/.env.backup.{int(datetime.utcnow().timestamp())}"
    
    # Backup old .env
    if env_file.exists():
        import shutil
        shutil.copy(env_file, backup_file)
        print(f"   Backup created: {backup_file}")
    
    # Write new .env
    with open(env_file, "w") as f:
        f.write("# Environment Configuration\n")
        f.write(f"# Last updated: {datetime.utcnow().isoformat()}\n")
        f.write(f"# Credentials rotated: YES\n\n")
        
        # Security section
        f.write("# Security\n")
        f.write(f"SECRET_KEY={new_env_vars.get('SECRET_KEY')}\n")
        f.write(f"ALGORITHM={new_env_vars.get('ALGORITHM', 'HS256')}\n")
        f.write(f"ACCESS_TOKEN_EXPIRE_MINUTES={new_env_vars.get('ACCESS_TOKEN_EXPIRE_MINUTES', '15')}\n")
        f.write(f"ENVIRONMENT={new_env_vars.get('ENVIRONMENT', 'production')}\n\n")
        
        # Database section
        f.write("# Database\n")
        f.write(f"MONGO_URL={new_env_vars.get('MONGO_URL', 'mongodb://localhost:27017')}\n")
        f.write(f"DATABASE_NAME={new_env_vars.get('DATABASE_NAME', 'academic_resources_db')}\n\n")
        
        # Admin credentials
        f.write("# Admin Credentials\n")
        f.write(f"ADMIN_EMAIL={admin_email}\n")
        f.write(f"ADMIN_PASSWORD={new_admin_password}\n\n")
        
        # CORS
        f.write("# CORS Configuration\n")
        f.write(f"ALLOWED_ORIGINS={new_env_vars.get('ALLOWED_ORIGINS', 'http://localhost:3000')}\n\n")
        
        # Email (if configured)
        if "SMTP_USERNAME" in new_env_vars:
            f.write("# Email Configuration\n")
            f.write(f"SMTP_SERVER={new_env_vars.get('SMTP_SERVER', 'smtp.gmail.com')}\n")
            f.write(f"SMTP_PORT={new_env_vars.get('SMTP_PORT', '587')}\n")
            f.write(f"SMTP_USERNAME={new_env_vars.get('SMTP_USERNAME')}\n")
            f.write(f"SMTP_PASSWORD={new_env_vars.get('SMTP_PASSWORD')}\n")
            f.write(f"SMTP_FROM_EMAIL={new_env_vars.get('SMTP_FROM_EMAIL')}\n")
            f.write(f"SMTP_FROM_NAME={new_env_vars.get('SMTP_FROM_NAME', 'EduResources')}\n")
            f.write(f"FRONTEND_URL={new_env_vars.get('FRONTEND_URL', 'http://localhost:3000')}\n\n")
        
        # Other configurations
        if "EMERGENT_LLM_KEY" in new_env_vars:
            f.write("# AI Configuration\n")
            f.write(f"EMERGENT_LLM_KEY={new_env_vars.get('EMERGENT_LLM_KEY')}\n\n")
        
        f.write("# Upload Configuration\n")
        f.write(f"UPLOAD_DIR={new_env_vars.get('UPLOAD_DIR', 'uploads')}\n")
    
    os.chmod(env_file, 0o600)  # Secure file permissions
    print(f"   ✅ .env file updated: {env_file}")
    print()
    
    # Update admin password in database
    print("📋 Updating admin password in database...")
    try:
        mongo_url = new_env_vars.get("MONGO_URL", "mongodb://localhost:27017")
        db_name = new_env_vars.get("DATABASE_NAME", "academic_resources_db")
        
        client = MongoClient(mongo_url)
        db = client[db_name]
        
        # Hash new password
        hashed_password = pwd_context.hash(new_admin_password)
        
        # Update admin user
        result = db.users.update_one(
            {"email": admin_email},
            {"$set": {"password": hashed_password}}
        )
        
        if result.modified_count > 0:
            print(f"   ✅ Admin password updated in database for {admin_email}")
        else:
            print(f"   ⚠️  Admin user not found in database. Password will be set on first login.")
        
        client.close()
    except Exception as e:
        print(f"   ⚠️  Warning: Could not update database: {e}")
    
    print()
    
    # Create credentials summary file
    summary_file = "/app/backend/ROTATED_CREDENTIALS.txt"
    with open(summary_file, "w") as f:
        f.write("=" * 70 + "\n")
        f.write("ROTATED CREDENTIALS SUMMARY\n")
        f.write("=" * 70 + "\n\n")
        f.write(f"Rotation Date: {datetime.utcnow().isoformat()}\n\n")
        f.write("CRITICAL: These credentials have been rotated for security.\n")
        f.write("All users will need to re-authenticate.\n\n")
        f.write("=" * 70 + "\n")
        f.write("ADMIN LOGIN CREDENTIALS\n")
        f.write("=" * 70 + "\n\n")
        f.write(f"Email:    {admin_email}\n")
        f.write(f"Password: {new_admin_password}\n\n")
        f.write("SAVE THESE CREDENTIALS IN A SECURE LOCATION!\n")
        f.write("=" * 70 + "\n")
    
    os.chmod(summary_file, 0o600)
    
    print("✅ Credential rotation completed successfully!")
    print()
    print("=" * 70)
    print("📝 NEW ADMIN CREDENTIALS")
    print("=" * 70)
    print(f"Email:    {admin_email}")
    print(f"Password: {new_admin_password}")
    print("=" * 70)
    print()
    print(f"💾 Credentials summary saved to: {summary_file}")
    print(f"💾 Backup of old .env saved to: {backup_file}")
    print()
    print("⚠️  IMPORTANT NEXT STEPS:")
    print("   1. Save the new admin credentials in a secure location")
    print("   2. Restart the backend service: sudo supervisorctl restart backend")
    print("   3. All users will need to log in again with new sessions")
    print("   4. Update ADMIN_CREDENTIALS.txt or delete it for security")
    print()
    
    return True

if __name__ == "__main__":
    success = rotate_credentials()
    sys.exit(0 if success else 1)
