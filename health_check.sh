#!/bin/bash
# System Health Check Script - Check if everything is running properly

echo "=================================="
echo "🏥 SYSTEM HEALTH CHECK"
echo "=================================="
echo ""

# Check Supervisor Services
echo "📋 Service Status:"
sudo supervisorctl status
echo ""

# Check MongoDB
echo "🗄️  MongoDB Status:"
if mongosh --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "✓ MongoDB is RUNNING"
    
    # Check database
    USER_COUNT=$(mongosh academic_resources --quiet --eval "db.users.countDocuments({})")
    PAPER_COUNT=$(mongosh academic_resources --quiet --eval "db.papers.countDocuments({})")
    NOTE_COUNT=$(mongosh academic_resources --quiet --eval "db.notes.countDocuments({})")
    
    echo "  - Users: $USER_COUNT"
    echo "  - Papers: $PAPER_COUNT"
    echo "  - Notes: $NOTE_COUNT"
else
    echo "✗ MongoDB is NOT RUNNING"
fi
echo ""

# Check Backend API
echo "🔌 Backend API Status:"
if curl -s http://localhost:8001/health > /dev/null 2>&1; then
    echo "✓ Backend API is RESPONSIVE"
    HEALTH=$(curl -s http://localhost:8001/health | jq -r '.status')
    echo "  - Health: $HEALTH"
else
    echo "✗ Backend API is NOT RESPONSIVE"
fi
echo ""

# Check Frontend
echo "🌐 Frontend Status:"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✓ Frontend is RESPONSIVE"
else
    echo "✗ Frontend is NOT RESPONSIVE"
fi
echo ""

# Check Admin User
echo "👤 Admin User Status:"
ADMIN_EXISTS=$(mongosh academic_resources --quiet --eval "db.users.findOne({email: 'admin@academic.com'}) != null")
if [ "$ADMIN_EXISTS" = "true" ]; then
    echo "✓ Admin user exists (admin@academic.com / admin123)"
else
    echo "✗ Admin user NOT FOUND"
fi
echo ""

# Check File Storage
echo "📁 File Storage:"
echo "  - Upload directory: /app/backend/uploads/"
echo "  - Papers: $(ls -1 /app/backend/uploads/papers/ 2>/dev/null | wc -l) files"
echo "  - Notes: $(ls -1 /app/backend/uploads/notes/ 2>/dev/null | wc -l) files"
echo "  - Syllabus: $(ls -1 /app/backend/uploads/syllabus/ 2>/dev/null | wc -l) files"
echo ""

echo "=================================="
echo "✅ Health Check Complete"
echo "=================================="
