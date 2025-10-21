#!/bin/bash
#
# PERMANENT ADMIN PASSWORD RESTORATION SCRIPT
# This script restores the permanent admin password if it gets changed
#
# Usage: bash /app/scripts/restore_admin_password.sh
#

echo "================================================================"
echo "        🔐 RESTORING PERMANENT ADMIN PASSWORD"
echo "================================================================"
echo ""

cd /app/backend

python3 << 'EOF'
from pymongo import MongoClient
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Connect to database
client = MongoClient('mongodb://localhost:27017')
db = client['academic_resources']

# Restore permanent password
PERMANENT_PASSWORD = "Sheshi@1234"
ADMIN_EMAIL = "kartiksrathod07@gmail.com"

hashed_pw = pwd_context.hash(PERMANENT_PASSWORD)

result = db.users.update_one(
    {"email": ADMIN_EMAIL},
    {"$set": {"password": hashed_pw}}
)

if result.matched_count > 0:
    print("✅ Admin password restored successfully!")
    print(f"\n📧 Email: {ADMIN_EMAIL}")
    print(f"🔐 Password: {PERMANENT_PASSWORD}")
    print("\n✅ You can now login with the permanent credentials")
else:
    print("❌ Admin user not found in database!")
    print("Please check if the admin user exists")
EOF

echo ""
echo "================================================================"
echo "        Script completed"
echo "================================================================"
