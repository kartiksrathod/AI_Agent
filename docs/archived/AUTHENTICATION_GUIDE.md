# Authentication Configuration Guide

## Overview
This guide explains how the login and register functionality is configured to work in both localhost and Preview environments.

## Configuration Files

### 1. Frontend Environment (`/app/frontend/.env` or `/app/.env`)

**For Localhost Development:**
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

**For Preview/Production (Kubernetes with Ingress):**
```env
REACT_APP_BACKEND_URL=
```
(Empty string makes requests go to the same domain, and Kubernetes ingress routes `/api/*` to the backend service)

### 2. Backend Environment (`/app/backend/.env`)

```env
# Database Configuration
MONGO_URL=mongodb://localhost:27017
DATABASE_NAME=eduresources_db

# Security Configuration  
SECRET_KEY=supersecretkey123456789changeinproduction
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# File Upload Configuration
UPLOAD_DIR=uploads

# Admin Configuration
ADMIN_EMAIL=admin@eduresources.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Admin User
```

## How It Works

### API Configuration (`/app/src/api/api.js`)
```javascript
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL !== undefined 
  ? process.env.REACT_APP_BACKEND_URL 
  : 'http://localhost:8001';
```

This configuration:
- Uses `REACT_APP_BACKEND_URL` from environment if defined
- Falls back to `http://localhost:8001` if not defined
- When `REACT_APP_BACKEND_URL` is empty string, axios makes requests to the same domain with `/api` prefix

### Kubernetes Ingress Routing
In Preview/Production:
- Frontend runs on port 3000
- Backend runs on port 8001
- All requests to `/api/*` are routed to backend:8001 by Kubernetes ingress
- This allows using relative URLs (empty REACT_APP_BACKEND_URL)

## Testing

### Login Test
```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

### Register Test
```bash
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "testpass123",
    "usn": "1AB21CS001",
    "course": "Computer Science Engineering",
    "semester": "5th"
  }'
```

## Switching Between Environments

### To use Localhost:
1. Edit `/app/frontend/.env`:
   ```env
   REACT_APP_BACKEND_URL=http://localhost:8001
   ```

2. Restart frontend:
   ```bash
   sudo supervisorctl restart frontend
   ```

### To use Preview (same-domain):
1. Edit `/app/frontend/.env`:
   ```env
   REACT_APP_BACKEND_URL=
   ```

2. Restart frontend:
   ```bash
   sudo supervisorctl restart frontend
   ```

## Verified Working Features

✅ **Login Page**
- Sign In button
- Forgot Password link
- Sign Up link (navigation)
- Error handling and validation

✅ **Register Page**
- Create Account button
- Sign In link (navigation)
- All form fields (name, email, USN, course, semester, passwords)
- Password confirmation validation
- USN validation
- Success toast and auto-redirect

✅ **Authentication Flow**
- JWT token generation
- Token storage in localStorage
- Token validation
- Protected routes
- User context management

## Buttons and Links Status

### Login Page (`/login`)
| Button/Link | Status | Function |
|------------|--------|----------|
| Sign In button | ✅ Working | Authenticates user and redirects to home |
| Forgot Password link | ✅ Working | Navigates to password reset page |
| Sign Up link | ✅ Working | Navigates to register page |

### Register Page (`/register`)
| Button/Link | Status | Function |
|------------|--------|----------|
| Create Account button | ✅ Working | Registers user and redirects to home |
| Sign In link | ✅ Working | Navigates to login page |
| Course dropdown | ✅ Working | Selects engineering branch |
| Semester dropdown | ✅ Working | Selects current semester |

## Notes

- The frontend must be restarted after changing environment variables
- Backend .env file must exist with all required variables
- MongoDB must be running for authentication to work
- All routes use `/api` prefix for proper Kubernetes routing
