#!/bin/bash

# Credential Security Checker
# Run this script to verify no credentials are exposed in your repository

echo "🔍 Running security audit..."
echo "================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ISSUES_FOUND=0

# Check 1: Verify .env files are in .gitignore
echo "1️⃣  Checking .gitignore configuration..."
if grep -q "^\.env$" .gitignore; then
    echo -e "${GREEN}✅ .env is in .gitignore${NC}"
else
    echo -e "${RED}❌ .env is NOT in .gitignore${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND+1))
fi

# Check 2: Ensure no .env files are tracked
echo ""
echo "2️⃣  Checking for tracked .env files..."
TRACKED_ENV=$(git ls-files | grep "\.env$" | grep -v "\.env\.example")
if [ -z "$TRACKED_ENV" ]; then
    echo -e "${GREEN}✅ No .env files are tracked${NC}"
else
    echo -e "${RED}❌ Found tracked .env files:${NC}"
    echo "$TRACKED_ENV"
    ISSUES_FOUND=$((ISSUES_FOUND+1))
fi

# Check 3: Search for potential secrets in tracked files
echo ""
echo "3️⃣  Scanning for potential secrets in code..."
SECRET_MATCHES=$(git grep -i -E "(api[_-]?key|secret[_-]?key|password|token)\s*=\s*['\"][^'\"]*['\"]" -- '*.py' '*.js' '*.jsx' '*.ts' '*.tsx' | grep -v "\.env\.example" | grep -v "your-secret" | grep -v "change-in-production" | grep -v "example" || true)

if [ -z "$SECRET_MATCHES" ]; then
    echo -e "${GREEN}✅ No obvious secrets found in code${NC}"
else
    echo -e "${YELLOW}⚠️  Potential secrets found (please review):${NC}"
    echo "$SECRET_MATCHES"
    ISSUES_FOUND=$((ISSUES_FOUND+1))
fi

# Check 4: Verify .env files exist locally but are not staged
echo ""
echo "4️⃣  Checking local .env files..."
if [ -f ".env" ] || [ -f "backend/.env" ] || [ -f "frontend/.env" ]; then
    echo -e "${GREEN}✅ Local .env files exist${NC}"
    
    # Check if any are staged
    STAGED_ENV=$(git diff --cached --name-only | grep "\.env$" | grep -v "\.env\.example" || true)
    if [ -z "$STAGED_ENV" ]; then
        echo -e "${GREEN}✅ No .env files are staged for commit${NC}"
    else
        echo -e "${RED}❌ .env files are staged:${NC}"
        echo "$STAGED_ENV"
        echo -e "${YELLOW}Run: git reset HEAD *.env${NC}"
        ISSUES_FOUND=$((ISSUES_FOUND+1))
    fi
else
    echo -e "${YELLOW}⚠️  No local .env files found. Run setup first.${NC}"
fi

# Check 5: Verify .env.example files exist
echo ""
echo "5️⃣  Checking for .env.example templates..."
if [ -f ".env.example" ] && [ -f "backend/.env.example" ] && [ -f "frontend/.env.example" ]; then
    echo -e "${GREEN}✅ All .env.example files exist${NC}"
else
    echo -e "${RED}❌ Missing .env.example files${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND+1))
fi

# Check 6: Verify pre-commit hook is installed
echo ""
echo "6️⃣  Checking pre-commit hook..."
if [ -x ".git/hooks/pre-commit" ]; then
    echo -e "${GREEN}✅ Pre-commit hook is installed and executable${NC}"
else
    echo -e "${YELLOW}⚠️  Pre-commit hook not found or not executable${NC}"
    echo "   Installing now..."
    chmod +x .git/hooks/pre-commit 2>/dev/null && echo -e "${GREEN}✅ Fixed!${NC}" || echo -e "${RED}❌ Failed to install${NC}"
fi

# Check 7: Look for hardcoded URLs
echo ""
echo "7️⃣  Checking for hardcoded URLs..."
HARDCODED_URLS=$(git grep -E "(http://localhost:|https://.*\.com)" -- '*.py' '*.js' '*.jsx' | grep -v "\.env" | grep -v "REACT_APP_BACKEND_URL" | grep -v "process\.env" | grep -v "import\.meta\.env" | grep -v "README" | grep -v "\.md" || true)
if [ -z "$HARDCODED_URLS" ]; then
    echo -e "${GREEN}✅ No hardcoded URLs found${NC}"
else
    echo -e "${YELLOW}⚠️  Potential hardcoded URLs found:${NC}"
    echo "$HARDCODED_URLS" | head -5
    echo "   (Use environment variables instead)"
fi

# Summary
echo ""
echo "================================"
if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✅ Security audit passed! No critical issues found.${NC}"
    exit 0
else
    echo -e "${RED}❌ Found $ISSUES_FOUND critical issue(s)${NC}"
    echo ""
    echo "📖 Please review SECURITY.md for remediation steps"
    exit 1
fi
