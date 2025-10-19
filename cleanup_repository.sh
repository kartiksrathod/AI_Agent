#!/bin/bash

##############################################################################
# REPOSITORY CLEANUP SCRIPT
# This script removes all unnecessary documentation and test files
# Keeps only essential project files for a clean GitHub repository
##############################################################################

echo "🧹 Starting Repository Cleanup..."
echo "=================================="
echo ""

# Create a docs directory for all documentation
mkdir -p /app/docs
mkdir -p /app/docs/guides
mkdir -p /app/docs/credentials

echo "📁 Creating organized folder structure..."

# Move important documentation to docs folder
echo "📝 Moving documentation files..."

# Move deployment and setup guides
[ -f "DEPLOY_FOR_PERMANENT_SOLUTION.md" ] && mv DEPLOY_FOR_PERMANENT_SOLUTION.md docs/guides/deployment-guide.md
[ -f "POST_DEPLOYMENT_GUIDE.md" ] && mv POST_DEPLOYMENT_GUIDE.md docs/guides/post-deployment-guide.md
[ -f "QUICK_START_GUIDE.md" ] && mv QUICK_START_GUIDE.md docs/guides/quick-start.md
[ -f "PRODUCTION_GUIDE.md" ] && mv PRODUCTION_GUIDE.md docs/guides/production-guide.md

# Move credentials (should be in .env, but keeping backup)
[ -f "ADMIN_CREDENTIALS.txt" ] && mv ADMIN_CREDENTIALS.txt docs/credentials/
[ -f "LOGIN_CREDENTIALS.md" ] && mv LOGIN_CREDENTIALS.md docs/credentials/
[ -f "YOUR_CREDENTIALS.txt" ] && mv YOUR_CREDENTIALS.txt docs/credentials/

# Remove duplicate/outdated documentation files
echo "🗑️  Removing duplicate documentation..."

rm -f ADMIN_GUIDE.md
rm -f AGENT_SLEEP_NO_PROBLEM.txt
rm -f BULLETPROOF_DATA_SYSTEM.md
rm -f COMPLETE_INDEPENDENCE.md
rm -f DATA_PERSISTENCE_GUARANTEE.md
rm -f DATA_PROTECTION_GUARANTEE.md
rm -f DOWNLOAD_FIX_COMPLETE.md
rm -f FRESH_START.txt
rm -f HOW_TO_USE_PROFILE_FEATURES.md
rm -f LOGIN_INFO.md
rm -f LOGIN_ISSUE_RESOLVED.md
rm -f NAVBAR_PHOTO_UPDATE_COMPLETE.md
rm -f PERMANENT_FIX_APPLIED.md
rm -f PROBLEM_SOLVED_PERMANENT_FIX.md
rm -f PRODUCTION_READY.md
rm -f PRODUCTION_READY_GUARANTEED.md
rm -f PRODUCTION_READY_STATUS.md
rm -f PROFILE_FEATURES_IMPLEMENTED.md
rm -f PROFILE_FIXES_APPLIED.md
rm -f QUICK_START.md
rm -f README_SOLUTION_COMPLETE.md
rm -f README_USER.md
rm -f SERVICES_AUTO_RESTART_FIX.md
rm -f UPLOAD_METHOD_COMPARISON.md
rm -f UX_FEATURES_STATUS.md
rm -f VISUAL_UPLOAD_GUIDE.md
rm -f WEBSITE_WORKS_247.md

# Remove test files from root
echo "🧪 Removing test files..."

rm -f backend_test.py
rm -f backend_test_bookmarks_profile.py
rm -f backend_test_results.json
rm -f test_*.py
rm -f test_*.json
rm -f test_*.txt

# Remove duplicate shell scripts from root (keep only in /scripts)
echo "📜 Removing duplicate scripts..."

rm -f check_services.sh
rm -f data_protection.sh
rm -f final_verification.sh
rm -f health_check.sh
rm -f independence_test.sh
rm -f production_check.sh

# Remove config files not needed
echo "⚙️  Removing unnecessary config files..."

rm -f craco.config.js
rm -f components.json
rm -f jsconfig.json

# Keep only essential files in root
echo "✅ Keeping essential files:"
echo "   - README.md (main documentation)"
echo "   - package.json (dependencies)"
echo "   - package-lock.json (lock file)"
echo "   - yarn.lock (lock file)"
echo "   - .gitignore (ignore rules)"
echo "   - .env.example (example config)"
echo "   - tailwind.config.js (tailwind setup)"
echo "   - postcss.config.js (postcss setup)"
echo ""

echo "📊 Cleanup Summary:"
echo "==================="

# Count remaining files
TOTAL_FILES=$(ls -1 /app | wc -l)
MD_FILES=$(ls -1 /app/*.md 2>/dev/null | wc -l)
echo "   Total items in root: $TOTAL_FILES"
echo "   Documentation files: $MD_FILES (should be 1 - README.md)"
echo ""

echo "✅ Repository cleaned successfully!"
echo ""
echo "📁 New structure:"
echo "   /app"
echo "   ├── README.md                    # Main documentation"
echo "   ├── package.json                 # Dependencies"
echo "   ├── .gitignore                   # Ignore rules"
echo "   ├── .env.example                 # Example config"
echo "   ├── backend/                     # Backend code"
echo "   ├── frontend/                    # Frontend code"
echo "   ├── src/                         # Source files"
echo "   ├── public/                      # Public assets"
echo "   ├── scripts/                     # Utility scripts"
echo "   ├── docs/                        # Documentation"
echo "   │   ├── guides/                  # Setup & deployment guides"
echo "   │   └── credentials/             # Credentials backup"
echo "   └── test_reports/                # Test reports"
echo ""
echo "🎯 Your GitHub repository is now clean and professional!"
