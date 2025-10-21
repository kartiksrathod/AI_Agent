# EduResources Architecture

## System Overview

EduResources is a full-stack web application built with a modern three-tier architecture.

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│                    React 18 + Tailwind                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Papers  │  │  Notes   │  │  Forum   │  │   AI     │  │
│  │  Module  │  │  Module  │  │  Module  │  │ Assistant│  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API (HTTPS)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                         Backend                             │
│                    FastAPI + Python                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   Auth   │  │ Resource │  │  Forum   │  │   CMS    │  │
│  │   API    │  │   API    │  │   API    │  │   API    │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                        Database                             │
│                       MongoDB 7.0                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Users   │  │ Resources│  │  Forum   │  │   CMS    │  │
│  │Collection│  │Collection│  │Collection│  │Collection│  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **React 18**: UI framework with hooks and context
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Framer Motion**: Animation library
- **React Router v7**: Client-side routing
- **Axios**: HTTP client for API calls

### Backend
- **FastAPI**: Modern Python web framework
- **Motor**: Async MongoDB driver
- **PyMongo**: MongoDB Python driver
- **Pydantic**: Data validation using Python type hints
- **python-jose**: JWT token implementation
- **passlib**: Password hashing
- **Emergent Integrations**: LLM integration

### Database
- **MongoDB 7.0**: Document-based NoSQL database

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **GitHub Actions**: CI/CD pipeline
- **Nginx**: Reverse proxy (production)

## Data Models

### User
```javascript
{
  _id: UUID,
  name: String,
  email: String (unique),
  password: String (hashed),
  usn: String,
  course: String,
  semester: String,
  is_admin: Boolean,
  profile_photo: String (file path),
  created_at: DateTime
}
```

### Resource (Papers/Notes/Syllabus)
```javascript
{
  _id: UUID,
  title: String,
  branch: String,
  description: String,
  tags: [String],
  file_path: String,
  uploaded_by: UUID (User),
  created_at: DateTime
}
```

### Forum Post
```javascript
{
  _id: UUID,
  title: String,
  content: String,
  category: String,
  tags: [String],
  author_id: UUID (User),
  views: Number,
  created_at: DateTime,
  updated_at: DateTime,
  last_activity: DateTime
}
```

## API Architecture

### Authentication Flow
```
1. User submits credentials → POST /api/auth/login
2. Backend validates → Hash comparison
3. Generate JWT token → 30min expiry
4. Return token + user data → Store in frontend
5. Subsequent requests → Include token in Authorization header
6. Backend validates token → Extract user from JWT
7. Check permissions → Allow/Deny access
```

### File Upload Flow
```
1. User selects file → Frontend validation (size, type)
2. Submit with metadata → POST /api/papers (multipart/form-data)
3. Backend validation → File type, size limits
4. Save to disk → /uploads/{type}/{uuid}-{filename}
5. Store metadata → MongoDB document
6. Return success → Frontend updates UI
```

## Security Features

### Authentication
- **JWT Tokens**: Stateless authentication
- **Bcrypt Hashing**: Password security (cost factor: 12)
- **Token Expiry**: 30-minute sessions
- **Secure Headers**: CORS, HTTPS enforcement

### Data Protection
- **Input Validation**: Pydantic models
- **SQL Injection Prevention**: Using MongoDB (NoSQL)
- **File Upload Security**: Type and size validation
- **Environment Variables**: Sensitive config in .env

### Access Control
- **Role-Based**: Admin vs Regular User
- **Resource Ownership**: Users can only delete own content
- **API Protection**: All sensitive endpoints require authentication

## Performance Optimizations

### Frontend
- **Code Splitting**: React.lazy() for route-based splits
- **Memoization**: useMemo/useCallback for expensive computations
- **Lazy Loading**: Images and components
- **Caching**: Browser caching for static assets

### Backend
- **Async Operations**: FastAPI async/await
- **Connection Pooling**: MongoDB connection reuse
- **Indexing**: Database indexes on frequently queried fields
- **File Streaming**: Large file handling

### Database
- **Indexes**: email (unique), created_at, author_id
- **Document Size**: Optimized for 16MB BSON limit
- **Aggregation**: Efficient data queries

## Deployment Architecture

### Development
```
Localhost:3000 (React Dev Server)
      ↓
Localhost:8001 (FastAPI)
      ↓
Localhost:27017 (MongoDB)
```

### Production (Docker)
```
Nginx:80/443 (Reverse Proxy)
      ↓
  ┌───┴────┐
  ↓        ↓
Frontend Backend:8001
:3000      ↓
      MongoDB:27017
```

## Future Enhancements

1. **Caching Layer**: Redis for session management
2. **Message Queue**: Celery for async tasks
3. **CDN Integration**: CloudFlare for static assets
4. **Elasticsearch**: Advanced search capabilities
5. **Microservices**: Split into smaller services
6. **Load Balancing**: Multiple backend instances
7. **WebSockets**: Real-time features (chat, notifications)

## Development Guidelines

### Code Organization
- **Frontend**: Component-based architecture
- **Backend**: Modular route handlers
- **Database**: Collection per entity type

### Naming Conventions
- **Files**: kebab-case (user-profile.js)
- **Components**: PascalCase (UserProfile)
- **Functions**: camelCase (getUserProfile)
- **Constants**: UPPER_SNAKE_CASE (API_URL)

### Git Workflow
- **Main**: Production-ready code
- **Develop**: Integration branch
- **Feature branches**: feature/feature-name
- **Hotfixes**: hotfix/issue-description

## Monitoring & Logging

### Application Logs
- Backend: Console + File logs
- Frontend: Browser console + Error boundaries

### Health Checks
- `/health`: Basic health endpoint
- `/api/stats`: System statistics
- Database connectivity checks

## Testing Strategy

### Unit Tests
- Backend: pytest for API endpoints
- Frontend: Jest + React Testing Library

### Integration Tests
- End-to-end flows
- Database operations
- API contract testing

### Manual Testing
- Browser compatibility
- Responsive design
- Performance testing