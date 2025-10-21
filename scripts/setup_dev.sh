#!/bin/bash

# Setup Development Environment for EduResources
# This script sets up the complete development environment

set -e  # Exit on error

echo "================================="
echo "EduResources - Development Setup"
echo "================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if MongoDB is running
echo "${YELLOW}[1/6]${NC} Checking MongoDB..."
if ! command -v mongosh &> /dev/null && ! command -v mongo &> /dev/null; then
    echo "${RED}❌ MongoDB client not found. Please install MongoDB.${NC}"
    exit 1
fi
echo "${GREEN}✓${NC} MongoDB client found"

# Check Python
echo "${YELLOW}[2/6]${NC} Checking Python..."
if ! command -v python3 &> /dev/null; then
    echo "${RED}❌ Python 3 not found. Please install Python 3.11+${NC}"
    exit 1
fi
PYTHON_VERSION=$(python3 --version | awk '{print $2}')
echo "${GREEN}✓${NC} Python $PYTHON_VERSION found"

# Check Node.js
echo "${YELLOW}[3/6]${NC} Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "${RED}❌ Node.js not found. Please install Node.js 16+${NC}"
    exit 1
fi
NODE_VERSION=$(node --version)
echo "${GREEN}✓${NC} Node.js $NODE_VERSION found"

# Check Yarn
if ! command -v yarn &> /dev/null; then
    echo "${YELLOW}Installing Yarn...${NC}"
    npm install -g yarn
fi
echo "${GREEN}✓${NC} Yarn found"

# Setup environment files
echo "${YELLOW}[4/6]${NC} Setting up environment files..."

if [ ! -f backend/.env ]; then
    echo "Creating backend/.env from template..."
    cp backend/.env.example backend/.env
    echo "${YELLOW}⚠️  Please edit backend/.env and add your credentials${NC}"
else
    echo "${GREEN}✓${NC} backend/.env already exists"
fi

if [ ! -f frontend/.env ]; then
    echo "Creating frontend/.env from template..."
    cp frontend/.env.example frontend/.env
else
    echo "${GREEN}✓${NC} frontend/.env already exists"
fi

# Install backend dependencies
echo "${YELLOW}[5/6]${NC} Installing backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..
echo "${GREEN}✓${NC} Backend dependencies installed"

# Install frontend dependencies
echo "${YELLOW}[6/6]${NC} Installing frontend dependencies..."
yarn install
echo "${GREEN}✓${NC} Frontend dependencies installed"

echo ""
echo "${GREEN}=================================${NC}"
echo "${GREEN}✓ Setup Complete!${NC}"
echo "${GREEN}=================================${NC}"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your MongoDB URL and secret key"
echo "2. Generate SECRET_KEY: python -c 'import secrets; print(secrets.token_urlsafe(32))'"
echo "3. Start MongoDB: mongod (or use Docker)"
echo "4. Start backend: cd backend && python server.py"
echo "5. Start frontend: yarn start"
echo ""
echo "Or use Docker Compose:"
echo "  docker-compose up"
echo ""