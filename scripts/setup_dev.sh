#!/bin/bash

# Setup Script for New Developers
# This script helps set up the development environment securely

echo "🚀 EduResources - Development Environment Setup"
echo "================================================"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Check for required tools
echo -e "${BLUE}Step 1: Checking prerequisites...${NC}"
command -v python3 >/dev/null 2>&1 || { echo "❌ Python 3 is required but not installed."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed."; exit 1; }
command -v yarn >/dev/null 2>&1 || { echo "❌ Yarn is required but not installed."; exit 1; }
echo -e "${GREEN}✅ All prerequisites found${NC}"
echo ""

# Step 2: Setup environment files
echo -e "${BLUE}Step 2: Setting up environment files...${NC}"

# Root .env
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Created .env"
else
    echo "⚠️  .env already exists, skipping"
fi

# Backend .env
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env"
else
    echo "⚠️  backend/.env already exists, skipping"
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.example frontend/.env
    echo "✅ Created frontend/.env"
else
    echo "⚠️  frontend/.env already exists, skipping"
fi

echo ""

# Step 3: Generate SECRET_KEY
echo -e "${BLUE}Step 3: Generating secure SECRET_KEY...${NC}"
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
echo "Generated SECRET_KEY: $SECRET_KEY"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Update backend/.env with this SECRET_KEY${NC}"
echo ""

# Optionally update the file automatically
read -p "Would you like to automatically update backend/.env with this key? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" backend/.env
    else
        # Linux
        sed -i "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" backend/.env
    fi
    echo -e "${GREEN}✅ Updated backend/.env with new SECRET_KEY${NC}"
fi

echo ""

# Step 4: Install dependencies
echo -e "${BLUE}Step 4: Installing dependencies...${NC}"

echo "Installing backend dependencies..."
cd backend
pip install -r requirements.txt > /dev/null 2>&1
cd ..
echo "✅ Backend dependencies installed"

echo "Installing frontend dependencies..."
yarn install > /dev/null 2>&1
echo "✅ Frontend dependencies installed"

echo ""

# Step 5: Setup pre-commit hook
echo -e "${BLUE}Step 5: Installing security pre-commit hook...${NC}"
if [ -f ".git/hooks/pre-commit" ]; then
    chmod +x .git/hooks/pre-commit
    echo "✅ Pre-commit hook installed"
else
    echo "⚠️  Pre-commit hook not found"
fi

echo ""

# Step 6: Final instructions
echo "================================================"
echo -e "${GREEN}✅ Setup complete!${NC}"
echo "================================================"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Update your environment variables:"
echo "   - Edit backend/.env with your credentials"
echo "   - Add your MONGO_URL"
echo "   - Add your EMERGENT_LLM_KEY (if using AI features)"
echo ""
echo "2. Start the development servers:"
echo "   Backend:  cd backend && python server.py"
echo "   Frontend: yarn start"
echo ""
echo "3. Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8001"
echo "   API Docs: http://localhost:8001/docs"
echo ""
echo "📖 Important files to read:"
echo "   - README.md - Project overview and documentation"
echo "   - SECURITY.md - Security best practices"
echo ""
echo "🔍 Run security check:"
echo "   ./scripts/check_credentials.sh"
echo ""
echo "================================================"
echo -e "${YELLOW}⚠️  Remember: NEVER commit .env files to git!${NC}"
echo "================================================"
