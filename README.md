# 📚 EduResources - Academic Resources Platform

> A comprehensive academic platform for engineering students to access question papers, study notes, syllabus, and AI-powered study assistance.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/cloud/atlas)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.120.0-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.x-61dafb.svg)](https://reactjs.org/)

## 🌟 Features

### For Students
- 📄 **Question Papers** - Access thousands of previous year question papers
- 📝 **Study Notes** - Download comprehensive study notes for all subjects
- 📋 **Syllabus** - View and download course syllabus
- 🤖 **AI Study Assistant** - Get help from GPT-4o powered study assistant
- 🔖 **Bookmarks** - Save your favorite resources for quick access
- 🎯 **Learning Goals** - Set and track your learning objectives
- 🏆 **Achievements** - Earn badges for your contributions
- 💬 **Community Forum** - Discuss topics with peers

### For Admins
- 📊 **Content Management** - Manage announcements, news, and updates
- 👥 **User Management** - Monitor and manage user accounts
- 📈 **Analytics Dashboard** - Track platform usage and engagement
- 🔐 **Security Controls** - Enhanced security features and monitoring

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  • Modern UI with Tailwind CSS & shadcn/ui components       │
│  • Client-side routing with React Router                    │
│  • State management with Context API                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ REST API
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend (FastAPI)                       │
│  • RESTful API endpoints                                     │
│  • JWT authentication with httpOnly cookies                 │
│  • Email verification system                                 │
│  • AI integration with Emergent LLM                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ PyMongo
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database (MongoDB Atlas)                   │
│  • Cloud-hosted permanent storage                            │
│  • Automated backups                                         │
│  • Collections: users, papers, notes, syllabus, etc.        │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
/app
├── backend/                 # FastAPI backend application
│   ├── server.py           # Main application file
│   ├── requirements.txt    # Python dependencies
│   ├── app_logging/        # Logging configuration
│   ├── middleware/         # Custom middleware
│   └── .env               # Environment variables
│
├── frontend/               # React frontend application
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── api/           # API integration
│   │   └── lib/           # Utility functions
│   ├── public/            # Static assets
│   └── package.json       # Node dependencies
│
├── scripts/               # Utility scripts
│   ├── auto_backup.sh    # Automated backup
│   ├── health_check.sh   # System health monitoring
│   └── setup_dev.sh      # Development setup
│
├── docs/                  # Documentation
│   ├── setup-guides/     # Setup and installation guides
│   ├── security/         # Security documentation
│   ├── deployment/       # Deployment guides
│   └── development/      # Development guidelines
│
├── config/               # Configuration files
│   ├── .eslintrc.js     # ESLint configuration
│   ├── .prettierrc      # Prettier configuration
│   └── tailwind.config.js # Tailwind CSS config
│
├── docker/               # Docker configuration
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
│
├── backups/              # Database backups
├── test_reports/         # Test execution reports
└── README.md            # This file
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+ and Yarn
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd app
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   yarn install
   cp .env.example .env
   # Edit .env with your backend URL
   ```

4. **Start the application**
   ```bash
   # Using supervisor (recommended)
   sudo supervisorctl restart all
   
   # Or manually
   # Terminal 1 - Backend
   cd backend && uvicorn server:app --host 0.0.0.0 --port 8001
   
   # Terminal 2 - Frontend
   cd frontend && yarn start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001
   - API Docs: http://localhost:8001/docs

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/
DATABASE_NAME=academic_resources_db

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15

# Email (optional)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# AI Assistant (optional)
EMERGENT_LLM_KEY=your-emergent-llm-key
```

#### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

## 📚 Documentation

- [Quick Start Guide](./docs/setup-guides/QUICKSTART.md)
- [Database Setup](./docs/setup-guides/DATABASE_GUIDE.md)
- [Email Configuration](./docs/setup-guides/EMAIL_SETUP_GUIDE.md)
- [Testing Guide](./docs/setup-guides/TESTING_GUIDE.md)
- [Security Documentation](./docs/security/SECURITY.md)
- [Deployment Guide](./docs/deployment/DEPLOYMENT_CHECKLIST.md)
- [Contributing Guidelines](./docs/development/CONTRIBUTING.md)

## 🔒 Security Features

- ✅ JWT authentication with httpOnly cookies
- ✅ Email verification for new users
- ✅ Password reset functionality
- ✅ Rate limiting on sensitive endpoints
- ✅ CORS protection
- ✅ Security headers (HSTS, CSP, X-Frame-Options)
- ✅ File upload validation (size and type)
- ✅ Request logging and audit trails

## 🧪 Testing

```bash
# Run backend tests
cd backend
pytest

# Run frontend tests
cd frontend
yarn test

# View test reports
cat test_reports/iteration_*.json
```

## 📊 Database

The application uses **MongoDB Atlas** for permanent cloud storage:

- **Users**: Student and admin accounts
- **Papers**: Question paper documents
- **Notes**: Study notes and materials
- **Syllabus**: Course syllabus documents
- **Forum**: Community discussions
- **Bookmarks**: Saved resources
- **Achievements**: User badges and rewards

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./docs/development/CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- AI powered by [Emergent LLM](https://emergentagent.com/)

## 📞 Support

For issues and questions:
- 📧 Email: kartiksrathod07@gmail.com
- 🐛 Issues: [GitHub Issues](./issues)
- 📖 Docs: [Documentation](./docs/)

---

**Made with ❤️ for engineering students**
