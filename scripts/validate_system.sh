#!/bin/bash

# System Validation Script
# Checks if all components are properly configured for 24/7 operation

echo "=================================================="
echo "🔍 EduResources System Validation"
echo "=================================================="
echo ""

ERRORS=0
WARNINGS=0

# 1. Check .env files
echo "📋 Checking Environment Files..."
if [ -f "/app/backend/.env" ]; then
    echo "  ✅ Backend .env exists"
    
    # Check critical variables
    if grep -q "SECRET_KEY=" /app/backend/.env && ! grep -q "SECRET_KEY=$" /app/backend/.env; then
        echo "  ✅ SECRET_KEY configured"
    else
        echo "  ❌ SECRET_KEY missing or empty"
        ((ERRORS++))
    fi
    
    if grep -q "MONGO_URL=" /app/backend/.env; then
        echo "  ✅ MONGO_URL configured"
    else
        echo "  ❌ MONGO_URL missing"
        ((ERRORS++))
    fi
    
    if grep -q "ACCESS_TOKEN_EXPIRE_MINUTES=" /app/backend/.env; then
        TOKEN_EXPIRY=$(grep "ACCESS_TOKEN_EXPIRE_MINUTES=" /app/backend/.env | cut -d'=' -f2)
        echo "  ✅ Token expiry: $TOKEN_EXPIRY minutes ($(($TOKEN_EXPIRY / 60 / 24)) days)"
        if [ "$TOKEN_EXPIRY" -lt 1440 ]; then
            echo "  ⚠️  Warning: Token expiry is less than 24 hours"
            ((WARNINGS++))
        fi
    fi
    
    if grep -q "SMTP_USERNAME=" /app/backend/.env && ! grep -q "SMTP_USERNAME=$" /app/backend/.env; then
        echo "  ✅ Email system configured"
    else
        echo "  ⚠️  Email system not configured (non-critical)"
        ((WARNINGS++))
    fi
else
    echo "  ❌ Backend .env missing!"
    ((ERRORS++))
fi

if [ -f "/app/.env" ]; then
    echo "  ✅ Frontend .env exists"
    if grep -q "REACT_APP_BACKEND_URL=" /app/.env; then
        BACKEND_URL=$(grep "REACT_APP_BACKEND_URL=" /app/.env | cut -d'=' -f2)
        echo "  ✅ Backend URL: $BACKEND_URL"
    fi
else
    echo "  ⚠️  Frontend .env missing (non-critical for production)"
    ((WARNINGS++))
fi

echo ""

# 2. Check MongoDB
echo "📊 Checking MongoDB..."
if pgrep -x mongod > /dev/null; then
    echo "  ✅ MongoDB process running"
    
    # Check if we can connect
    if mongosh --quiet --eval "db.adminCommand('ping')" &> /dev/null; then
        echo "  ✅ MongoDB accepting connections"
        
        # Check data directory
        if [ -d "/var/lib/mongodb" ]; then
            DB_SIZE=$(du -sh /var/lib/mongodb 2>/dev/null | cut -f1)
            echo "  ✅ Data directory exists (size: $DB_SIZE)"
        fi
    else
        echo "  ❌ MongoDB not accepting connections"
        ((ERRORS++))
    fi
else
    echo "  ❌ MongoDB not running"
    ((ERRORS++))
fi

echo ""

# 3. Check Supervisor Services
echo "🔧 Checking Services..."
if command -v supervisorctl &> /dev/null; then
    BACKEND_STATUS=$(sudo supervisorctl status backend 2>/dev/null | awk '{print $2}')
    FRONTEND_STATUS=$(sudo supervisorctl status frontend 2>/dev/null | awk '{print $2}')
    MONGODB_STATUS=$(sudo supervisorctl status mongodb 2>/dev/null | awk '{print $2}')
    
    if [ "$BACKEND_STATUS" = "RUNNING" ]; then
        echo "  ✅ Backend service running"
    else
        echo "  ❌ Backend service not running (status: $BACKEND_STATUS)"
        ((ERRORS++))
    fi
    
    if [ "$FRONTEND_STATUS" = "RUNNING" ]; then
        echo "  ✅ Frontend service running"
    else
        echo "  ❌ Frontend service not running (status: $FRONTEND_STATUS)"
        ((ERRORS++))
    fi
    
    if [ "$MONGODB_STATUS" = "RUNNING" ]; then
        echo "  ✅ MongoDB service running"
    else
        echo "  ❌ MongoDB service not running (status: $MONGODB_STATUS)"
        ((ERRORS++))
    fi
    
    # Check auto-restart configuration
    if grep -q "autorestart=true" /etc/supervisor/conf.d/supervisord.conf; then
        echo "  ✅ Auto-restart enabled for all services"
    else
        echo "  ⚠️  Auto-restart may not be configured"
        ((WARNINGS++))
    fi
else
    echo "  ⚠️  Supervisor not found"
    ((WARNINGS++))
fi

echo ""

# 4. Check Backend API
echo "🌐 Checking Backend API..."
if curl -s -f http://localhost:8001/health > /dev/null 2>&1; then
    echo "  ✅ Backend API responding"
    
    HEALTH=$(curl -s http://localhost:8001/health)
    if echo "$HEALTH" | grep -q '"status":"healthy"'; then
        echo "  ✅ Health status: healthy"
    fi
    
    if echo "$HEALTH" | grep -q '"database":"connected"'; then
        echo "  ✅ Database: connected"
    fi
    
    if echo "$HEALTH" | grep -q '"email_system":"configured"'; then
        echo "  ✅ Email system: configured"
    fi
else
    echo "  ❌ Backend API not responding"
    ((ERRORS++))
fi

echo ""

# 5. Check Frontend
echo "🎨 Checking Frontend..."
if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
    echo "  ✅ Frontend responding"
else
    echo "  ⚠️  Frontend not responding (may be starting up)"
    ((WARNINGS++))
fi

echo ""

# 6. Check Admin User
echo "👤 Checking Admin User..."
if mongosh --quiet --eval "use academic_resources; db.users.findOne({email: 'kartiksrathod07@gmail.com'})" 2>/dev/null | grep -q "kartiksrathod07@gmail.com"; then
    echo "  ✅ Admin user exists"
else
    echo "  ⚠️  Admin user not found (run: cd /app/backend && python3 create_admin.py)"
    ((WARNINGS++))
fi

echo ""

# 7. Check CI/CD Configuration
echo "🔄 Checking CI/CD..."
if [ -f "/app/.github/workflows/ci.yml" ]; then
    echo "  ✅ GitHub Actions workflow exists"
    
    if grep -q "Create test environment file" /app/.github/workflows/ci.yml; then
        echo "  ✅ CI environment file generation configured"
    fi
    
    if grep -q "mongodb:" /app/.github/workflows/ci.yml; then
        echo "  ✅ MongoDB service configured for tests"
    fi
else
    echo "  ⚠️  CI/CD workflow not found"
    ((WARNINGS++))
fi

echo ""
echo "=================================================="
echo "📊 Validation Summary"
echo "=================================================="
echo ""

if [ $ERRORS -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo "✅ ALL CHECKS PASSED!"
        echo "🎉 System is fully configured for 24/7 operation"
    else
        echo "⚠️  System OK with $WARNINGS warning(s)"
        echo "💡 Warnings are non-critical but should be reviewed"
    fi
    EXIT_CODE=0
else
    echo "❌ Found $ERRORS critical error(s) and $WARNINGS warning(s)"
    echo "🔧 Please fix the errors before deploying"
    EXIT_CODE=1
fi

echo ""
echo "=================================================="
echo ""

# Print helpful commands
if [ $ERRORS -gt 0 ] || [ $WARNINGS -gt 0 ]; then
    echo "🛠️  Helpful Commands:"
    echo ""
    if [ $ERRORS -gt 0 ]; then
        echo "  Check logs:"
        echo "    tail -f /var/log/supervisor/backend.err.log"
        echo "    tail -f /var/log/supervisor/frontend.err.log"
        echo ""
        echo "  Restart services:"
        echo "    sudo supervisorctl restart all"
        echo ""
    fi
    if ! mongosh --quiet --eval "use academic_resources; db.users.findOne({email: 'kartiksrathod07@gmail.com'})" 2>/dev/null | grep -q "kartiksrathod07@gmail.com"; then
        echo "  Create admin user:"
        echo "    cd /app/backend && python3 create_admin.py"
        echo ""
    fi
fi

exit $EXIT_CODE
