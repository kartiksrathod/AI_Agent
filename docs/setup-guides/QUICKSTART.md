# Quick Start Guide

## Prerequisites
- Node.js 16+ and Yarn
- Python 3.11+
- MongoDB 7.0+
- Git

## Quick Setup (5 minutes)

### Option 1: Docker Compose (Recommended)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd EduResources

# 2. Create environment file
cp backend/.env.example backend/.env

# 3. Generate secret key and update .env
python -c "import secrets; print(secrets.token_urlsafe(32))"
# Copy this key to backend/.env as SECRET_KEY

# 4. Start all services
docker-compose up

# 5. Create admin user (in another terminal)
docker-compose exec backend python create_admin.py
```

Access the app at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- API Docs: http://localhost:8001/docs

### Option 2: Manual Setup

```bash
# 1. Clone and setup
git clone <your-repo-url>
cd EduResources

# 2. Run setup script
./scripts/setup_dev.sh

# 3. Update backend/.env with:
#    - MongoDB URL
#    - SECRET_KEY (generate with command above)
#    - EMERGENT_LLM_KEY (optional, for AI features)

# 4. Start MongoDB
mongod

# 5. Start backend (terminal 1)
cd backend
python server.py

# 6. Start frontend (terminal 2)
yarn start

# 7. Create admin user (terminal 3)
cd backend
python create_admin.py
```

## Creating Admin User

Set admin credentials in `backend/.env`:
```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-password
ADMIN_NAME=Admin User
```

Then run:
```bash
cd backend
python create_admin.py
```

## Common Issues

### MongoDB connection failed
- Ensure MongoDB is running: `mongod`
- Check MONGO_URL in backend/.env

### Port already in use
- Frontend (3000): `lsof -ti:3000 | xargs kill`
- Backend (8001): `lsof -ti:8001 | xargs kill`

### Module not found
- Backend: `cd backend && pip install -r requirements.txt`
- Frontend: `yarn install`

## Development Workflow

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Make changes
3. Run security check: `./scripts/check_credentials.sh`
4. Commit: `git commit -m "feat: add amazing feature"`
5. Push: `git push origin feature/amazing-feature`
6. Create Pull Request

## Available Scripts

### Frontend
```bash
yarn start       # Start development server
yarn build       # Build for production
yarn test        # Run tests
```

### Backend
```bash
python server.py          # Start server
python create_admin.py    # Create admin user
pytest tests/             # Run tests
```

### Utilities
```bash
./scripts/setup_dev.sh              # Setup development environment
./scripts/check_credentials.sh      # Check for exposed secrets
```

## Next Steps

- Read the [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
- Check [SECURITY.md](SECURITY.md) for security best practices
- Review [API documentation](http://localhost:8001/docs) after starting backend
- Join discussions in the Issues tab

## Need Help?

- 📧 Email: kartiksrathod07@gmail.com
- 🐛 Bug Reports: [GitHub Issues](https://github.com/kartiksrathod/eduresources/issues)
- 💡 Feature Requests: [GitHub Discussions](https://github.com/kartiksrathod/eduresources/discussions)