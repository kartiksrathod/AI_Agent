#!/bin/bash
# Startup Initialization Script
# Ensures all systems are properly initialized on restart

echo "🚀 Initializing Application..."
echo "================================"

# 1. Check and create directories
echo "📁 Checking directories..."
mkdir -p /app/backend/uploads/{papers,notes,syllabus,profile_photos}
mkdir -p /app/backups
mkdir -p /data/db
echo "   ✅ Directories verified"

# 2. Check environment files
echo "🔧 Checking environment files..."
if [ ! -f "/app/backend/.env" ]; then
    echo "   ⚠️  Backend .env missing! Creating from example..."
    if [ -f "/app/backend/.env.example" ]; then
        cp /app/backend/.env.example /app/backend/.env
        echo "   ⚠️  Please configure /app/backend/.env"
    fi
else
    echo "   ✅ Backend .env exists"
fi

if [ ! -f "/app/frontend/.env" ]; then
    echo "   ⚠️  Frontend .env missing! Creating..."
    echo "REACT_APP_BACKEND_URL=https://vulnsweeper.preview.emergentagent.com/api" > /app/frontend/.env
fi
echo "   ✅ Frontend .env exists"

# 3. Wait for MongoDB to be ready
echo "🗄️  Waiting for MongoDB..."
max_attempts=30
attempt=0
until mongosh --quiet --eval "db.adminCommand('ping')" >/dev/null 2>&1 || [ $attempt -eq $max_attempts ]; do
    attempt=$((attempt + 1))
    echo "   ⏳ Waiting for MongoDB... ($attempt/$max_attempts)"
    sleep 1
done

if [ $attempt -eq $max_attempts ]; then
    echo "   ❌ MongoDB failed to start"
    exit 1
fi
echo "   ✅ MongoDB is ready"

# 4. Initialize admin user if needed
echo "👤 Checking admin user..."
cd /app/backend
python3 << 'EOF'
from pymongo import MongoClient
from passlib.context import CryptContext
import uuid

try:
    client = MongoClient('mongodb://localhost:27017', serverSelectionTimeoutMS=5000)
    db = client['academic_resources_db']
    
    admin_user = db.users.find_one({"email": "kartiksrathod07@gmail.com"})
    
    if not admin_user:
        print("   ⚠️  Creating admin user...")
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        
        admin_id = str(uuid.uuid4())
        admin_data = {
            "_id": admin_id,
            "name": "Kartik S Rathod",
            "email": "kartiksrathod07@gmail.com",
            "password": pwd_context.hash("Sheshi@1234"),
            "usn": "ADMIN001",
            "course": "Administrator",
            "semester": "N/A",
            "is_admin": True,
            "email_verified": True,
            "profile_photo": None
        }
        
        db.users.insert_one(admin_data)
        print("   ✅ Admin user created")
    else:
        print("   ✅ Admin user exists")
except Exception as e:
    print(f"   ⚠️  Could not check admin user: {e}")
EOF

echo ""
echo "================================"
echo "✅ Initialization Complete"
echo "================================"
