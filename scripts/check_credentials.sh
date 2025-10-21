#!/bin/bash

# Security Credentials Check Script
# Prevents committing sensitive information to version control

set -e

echo "🔍 Checking for exposed credentials..."

# Check if .env files are staged
if git diff --cached --name-only | grep -E '\.env$'; then
    echo "❌ ERROR: .env files are staged for commit!"
    echo "Please unstage them: git reset HEAD *.env"
    exit 1
fi

# Check for common secret patterns in staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(py|js|jsx|ts|tsx|json)$' || true)

if [ -n "$STAGED_FILES" ]; then
    # Patterns to check for
    PATTERNS=(
        "SECRET_KEY.*=.*['\"][^'\"]+['\"]" 
        "MONGO_URL.*=.*mongodb://[^'\"]+"
        "password.*=.*['\"][^'\"]{8,}['\"]" 
        "api[_-]?key.*=.*['\"][^'\"]+['\"]" 
        "EMERGENT_LLM_KEY.*=.*['\"][^'\"]+['\"]" 
    )
    
    for PATTERN in "${PATTERNS[@]}"; do
        if echo "$STAGED_FILES" | xargs grep -nHE "$PATTERN" 2>/dev/null; then
            echo "❌ ERROR: Potential secret found in staged files!"
            echo "Pattern: $PATTERN"
            echo "Please remove hardcoded credentials and use environment variables."
            exit 1
        fi
    done
fi

echo "✅ No exposed credentials found"
exit 0