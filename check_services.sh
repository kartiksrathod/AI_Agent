#!/bin/bash
# Service Health Check Script
# Run this anytime to check if everything is working

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 SYSTEM HEALTH CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check supervisor services
echo "📊 SERVICE STATUS:"
sudo supervisorctl status
echo ""

# Check if backend is responding
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 TESTING LOGIN API:"
response=$(curl -s -X POST https://urgent-help-1.preview.emergentagent.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "student@example.com", "password": "password123"}')

if echo "$response" | grep -q "access_token"; then
    echo "✅ Login API: WORKING"
    echo "✅ Backend: OPERATIONAL"
else
    echo "❌ Login API: FAILED"
    echo "Response: $response"
fi
echo ""

# Check database
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💾 DATABASE STATUS:"
python3 -c "
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv('/app/backend/.env')
MONGO_URL = os.getenv('MONGO_URL')
DATABASE_NAME = os.getenv('DATABASE_NAME')

try:
    client = MongoClient(MONGO_URL)
    client.admin.command('ping')
    db = client[DATABASE_NAME]
    user_count = db.users.count_documents({})
    print(f'✅ MongoDB: CONNECTED')
    print(f'✅ Users in database: {user_count}')
except Exception as e:
    print(f'❌ MongoDB: ERROR - {e}')
" 2>/dev/null || echo "❌ Cannot connect to database"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Health Check Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
