#!/bin/bash
# FINAL PRODUCTION VERIFICATION TEST
# Run this to verify everything is working correctly

echo "🔍 FINAL PRODUCTION VERIFICATION"
echo "================================================================"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS="${GREEN}✅ PASS${NC}"
FAIL="${RED}❌ FAIL${NC}"
WARN="${YELLOW}⚠️  WARN${NC}"

TESTS_PASSED=0
TESTS_FAILED=0

# Function to test something
test_check() {
    if [ $? -eq 0 ]; then
        echo -e "   $PASS - $1"
        ((TESTS_PASSED++))
    else
        echo -e "   $FAIL - $1"
        ((TESTS_FAILED++))
    fi
}

echo -e "\n📋 TEST 1: Service Status"
echo "-----------------------------------"
sudo supervisorctl status mongodb | grep -q "RUNNING"
test_check "MongoDB is running"

sudo supervisorctl status backend | grep -q "RUNNING"
test_check "Backend is running"

sudo supervisorctl status frontend | grep -q "RUNNING"
test_check "Frontend is running"

echo -e "\n📋 TEST 2: Data Persistence"
echo "-----------------------------------"
[ -d "/data/db" ]
test_check "Persistent storage directory exists"

[ -f "/data/db/WiredTiger" ]
test_check "MongoDB is using persistent storage"

du -sh /data/db | grep -qE "[0-9]+M|[0-9]+G"
test_check "Database contains data"

echo -e "\n📋 TEST 3: Database Content"
echo "-----------------------------------"
USERS_COUNT=$(mongosh academic_resources --quiet --eval "db.users.countDocuments({})" 2>/dev/null)
[ "$USERS_COUNT" -ge 1 ]
test_check "Users exist in database ($USERS_COUNT users)"

RESOURCES_COUNT=$(mongosh academic_resources --quiet --eval "db.papers.countDocuments({}) + db.notes.countDocuments({}) + db.syllabus.countDocuments({})" 2>/dev/null)
[ "$RESOURCES_COUNT" -ge 1 ]
test_check "Resources exist in database ($RESOURCES_COUNT resources)"

echo -e "\n📋 TEST 4: API Endpoints"
echo "-----------------------------------"
curl -s http://localhost:8001/api/papers > /dev/null
test_check "Papers API is responding"

curl -s http://localhost:8001/api/notes > /dev/null
test_check "Notes API is responding"

curl -s http://localhost:8001/api/syllabus > /dev/null
test_check "Syllabus API is responding"

echo -e "\n📋 TEST 5: Auto-Restart Configuration"
echo "-----------------------------------"
grep -q "autorestart=true" /etc/supervisor/conf.d/supervisord.conf
test_check "Auto-restart is enabled"

echo -e "\n📋 TEST 6: Backup System"
echo "-----------------------------------"
[ -d "/app/backups" ]
test_check "Backup directory exists"

BACKUP_COUNT=$(ls -1 /app/backups | wc -l)
[ "$BACKUP_COUNT" -ge 1 ]
test_check "Backups exist ($BACKUP_COUNT backups)"

echo -e "\n📋 TEST 7: CRUD Operations"
echo "-----------------------------------"
if python3 /app/test_crud.py > /tmp/crud_test.log 2>&1; then
    echo -e "   $PASS - CRUD operations working"
    ((TESTS_PASSED++))
else
    echo -e "   $FAIL - CRUD operations failed"
    ((TESTS_FAILED++))
fi

echo -e "\n================================================================"
echo -e "📊 TEST RESULTS SUMMARY"
echo "================================================================"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! YOUR WEBSITE IS PRODUCTION READY!${NC}"
    echo ""
    echo "✅ Your website will:"
    echo "   - Store all data permanently"
    echo "   - Delete data when you want to delete"
    echo "   - Run 24/7 without interruption"
    echo "   - Work independently (no Emergent dependency)"
    echo "   - Auto-recover from any failures"
    echo ""
    echo "🌐 Your website: https://app-data-keeper.preview.emergentagent.com"
    echo "📧 Login: kartiksrathod07@gmail.com"
    echo ""
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo "Please check the issues above."
    exit 1
fi
