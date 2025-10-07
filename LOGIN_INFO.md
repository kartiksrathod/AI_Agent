# 🔐 Login Information for Academic Resources Platform

## Available Demo Accounts

### 1. Demo Student Account
- **Email:** `student@example.com`
- **Password:** `password123`
- **Role:** Student (Regular User)
- **Access:** Can view, download resources, use AI Assistant, and participate in forums

### 2. Test User Account
- **Email:** `test@example.com`  
- **Password:** `test123`
- **Role:** Student (Regular User)
- **Access:** Can view, download resources, use AI Assistant, and participate in forums

### 3. Admin Account (if created)
- **Email:** `admin@example.com`
- **Password:** `admin123`
- **Role:** Admin
- **Access:** Full access + ability to upload/delete resources

## How to Login

### Method 1: Using the Website
1. Go to the login page
2. Enter email and password
3. Click "Sign In"
4. You'll be redirected to the home page

### Method 2: Register New Account
1. Click on "Sign up" link on the login page
2. Fill in:
   - Name
   - Email
   - Password
3. Click "Sign Up"
4. You'll be automatically logged in

## Troubleshooting Login Issues

### Issue 1: "Login Failed" or "Invalid credentials"
**Solution:**
- Make sure you're using the correct email and password
- Try one of the demo accounts above
- Password is case-sensitive

### Issue 2: Page doesn't redirect after login
**Solution:**
- Check browser console for errors (F12 > Console tab)
- Clear browser cache and try again
- Make sure cookies and localStorage are enabled

### Issue 3: "Network Error" or "Failed to fetch"
**Solution:**
- Check if backend is running: Backend should be accessible
- Wait a few seconds and try again
- Refresh the page

### Issue 4: Blank page or loading forever
**Solution:**
- Clear browser cache
- Close and reopen the browser
- Try in incognito/private mode

## API Endpoints

If you want to test login programmatically:

### Login Endpoint
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123"
}
```

### Register Endpoint
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "Your Name",
  "email": "your@email.com",
  "password": "yourpassword"
}
```

## Quick Test

You can test if login is working using curl:

```bash
curl -X POST https://mode-inspector.preview.emergentagent.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "student@example.com", "password": "password123"}'
```

Expected response:
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": "...",
    "name": "Demo Student",
    "email": "student@example.com",
    "is_admin": false
  }
}
```

## Need Help?

If you're still having issues:
1. Check the browser console for detailed error messages
2. Verify backend and frontend services are running
3. Try creating a new account with the register form
4. Clear all browser data and try again

## Features After Login

Once logged in, you can:
- ✅ Browse and download question papers
- ✅ Access study notes
- ✅ View syllabus documents
- ✅ Use AI Study Assistant (ask engineering questions)
- ✅ Participate in community forums
- ✅ Search and filter resources

Admins can additionally:
- ✅ Upload new papers, notes, and syllabus
- ✅ Delete resources
- ✅ Manage content

---

**Last Updated:** Auto-generated on startup
**Platform:** Academic Resources Platform
**Tech Stack:** React + FastAPI + MongoDB
