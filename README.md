# 📚 EduResources - Academic Resources Platform

A comprehensive full-stack web application for engineering students to share and access academic resources including papers, notes, syllabus, and more. Built with React, FastAPI, and MongoDB.

---

## ✨ Features

### 🎓 Core Features
- **Papers Repository** - Upload and download academic papers
- **Notes Sharing** - Share class notes with fellow students
- **Syllabus Library** - Access syllabus for different courses and years
- **Community Forum** - Discuss topics and help each other
- **AI Study Assistant** - Get help with engineering topics using AI

### 👤 User Features
- **User Authentication** - Secure login and registration
- **User Profiles** - Customize your profile with photo and information
- **Bookmarks** - Save your favorite resources
- **Learning Goals** - Track your academic goals and progress
- **Achievements** - Earn badges for contributions and activities
- **Download Tracking** - Monitor your resource usage

### 🎨 UI/UX Features
- **Dark/Light Mode** - Toggle between themes
- **Responsive Design** - Works on all devices
- **Interactive Animations** - Smooth transitions and effects
- **Keyboard Shortcuts** - Quick navigation
- **Advanced Search** - Filter by branch, tags, etc.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - API calls
- **Framer Motion** - Animations

### Backend
- **FastAPI** - Python web framework
- **MongoDB** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Emergent LLM** - AI integration

### DevOps
- **Supervisor** - Process management
- **Nginx** - Reverse proxy
- **Git** - Version control

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- Python 3.11+
- MongoDB
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd EduResources
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
   # From root directory
   yarn install
   cp .env.example .env
   # Edit .env with your backend URL
   ```

4. **Start the Application**
   ```bash
   # Backend (in /backend directory)
   python server.py

   # Frontend (in root directory)
   yarn start
   ```

5. **Access the App**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8001`
   - API Docs: `http://localhost:8001/docs`

---

## 📁 Project Structure

```
EduResources/
├── backend/                 # FastAPI backend
│   ├── server.py           # Main application file
│   ├── requirements.txt    # Python dependencies
│   └── uploads/            # Uploaded files
├── src/                    # React source code
│   ├── components/         # React components
│   ├── contexts/           # Context providers
│   ├── hooks/              # Custom hooks
│   └── api/                # API integration
├── public/                 # Static files
├── scripts/                # Utility scripts
├── docs/                   # Documentation
│   └── guides/             # Setup & deployment guides
├── package.json            # Node.js dependencies
├── tailwind.config.js      # Tailwind configuration
└── README.md              # This file
```

---

## 🔐 Environment Variables

### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017
DATABASE_NAME=academic_resources
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
EMERGENT_LLM_KEY=your-llm-key
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## 📖 API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8001/docs`
- ReDoc: `http://localhost:8001/redoc`

### Key Endpoints

**Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

**Resources**
- `GET /api/papers` - Get all papers
- `POST /api/papers` - Upload paper (auth required)
- `GET /api/notes` - Get all notes
- `GET /api/syllabus` - Get all syllabus

**Profile**
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `POST /api/profile/photo` - Upload profile photo

**Forum**
- `GET /api/forum/posts` - Get all posts
- `POST /api/forum/posts` - Create post
- `GET /api/forum/posts/{id}/replies` - Get replies

---

## 🧪 Testing

```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
yarn test

# Health check
curl http://localhost:8001/health
```

---

## 📦 Deployment

### Using Emergent Platform

1. **Ensure all services work in Preview mode**
2. **Click Deploy button in Emergent interface**
3. **Wait ~10 minutes for deployment**
4. **Access your production URL**

**Cost:** 50 credits/month for 24/7 uptime

### Manual Deployment

See detailed deployment guide in `/docs/guides/deployment-guide.md`

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author

**Kartik S Rathod**
- GitHub: [@kartiksrathod](https://github.com/kartiksrathod)
- LinkedIn: [Kartik S Rathod](https://www.linkedin.com/in/kartik-s-rathod-a98364389)
- Email: kartiksrathod07@gmail.com

---

## 🙏 Acknowledgments

- Built with [Emergent Agent](https://emergentagent.com)
- AI powered by Emergent LLM
- UI inspiration from modern education platforms
- Community feedback and contributions

---

## 📞 Support

For support, email kartiksrathod07@gmail.com or open an issue in the repository.

---

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Video tutorials section
- [ ] Real-time collaborative study rooms
- [ ] Advanced analytics dashboard
- [ ] Integration with university systems
- [ ] Payment gateway for premium features

---

**Made with ❤️ by engineering students, for engineering students**
