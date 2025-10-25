# How to Access Your Credentials

## 📍 Where Are Your Credentials?

Your credentials are stored in **local .env files** that exist on your machine but are **NOT tracked by git**.

### Location of .env Files

```
/app/.env                  ← Root configuration
/app/backend/.env          ← Backend credentials (main one)
/app/frontend/.env         ← Frontend configuration
```

---

## 👀 How to View Your Credentials

### Method 1: Using cat command
```bash
# View backend credentials (main credentials file)
cat /app/backend/.env

# View frontend config
cat /app/frontend/.env

# View root config
cat /app/.env
```

### Method 2: Using a text editor
```bash
# Open in nano
nano /app/backend/.env

# Open in vim
vim /app/backend/.env

# Open in any editor
code /app/backend/.env  # VS Code
```

### Method 3: View all at once
```bash
echo "=== Backend .env ===" && cat /app/backend/.env && \
echo -e "\n=== Frontend .env ===" && cat /app/frontend/.env && \
echo -e "\n=== Root .env ===" && cat /app/.env
```

---

## 🔑 Your Current Credentials

### Backend (.env location: `/app/backend/.env`)
```env
MONGO_URL=mongodb://localhost:27017
DATABASE_NAME=academic_resources
SECRET_KEY=UAU4hXAziFMgoIbdLmBVg3UAcmQVhPJxe-rIZ9D4IHs
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
UPLOAD_DIR=uploads
ADMIN_EMAIL=kartiksrathod07@gmail.com
ADMIN_PASSWORD=changeme123
ADMIN_NAME=Kartik S Rathod
EMERGENT_LLM_KEY=sk-emergent-38c10A41e0d3a3d19F
```

### Frontend (.env location: `/app/frontend/.env`)
```env
REACT_APP_BACKEND_URL=https://safety-first-55.preview.emergentagent.com
```

---

## 🔐 Understanding the Security Model

### What's in GitHub (Public) ✅
- `.env.example` - Templates without real credentials
- `SECURITY.md` - Security documentation
- All your code
- Configuration files

### What's NOT in GitHub (Private) 🔒
- `.env` - Your actual credentials
- `backend/.env` - Your actual secrets
- `frontend/.env` - Your actual config
- Any file with real passwords/keys

### How It Works
```
┌─────────────────────────────────────────┐
│  YOUR COMPUTER (Local)                  │
│  ✅ .env files exist here               │
│  ✅ You can read/edit them              │
│  ✅ Apps can use them                   │
└─────────────────────────────────────────┘
                  │
                  │ .gitignore blocks them
                  ↓
┌─────────────────────────────────────────┐
│  GITHUB (Public Repository)             │
│  ❌ .env files NOT uploaded             │
│  ✅ .env.example uploaded (safe)        │
│  ✅ Code uploaded                       │
└─────────────────────────────────────────┘
```

---

## 📝 How to Edit Your Credentials

### Update a Single Value
```bash
# Edit the file
nano /app/backend/.env

# Or use sed to replace a value
sed -i 's/ADMIN_PASSWORD=.*/ADMIN_PASSWORD=MyNewPassword123/' /app/backend/.env
```

### Add New Credentials
```bash
# Add to end of file
echo "NEW_API_KEY=your-key-here" >> /app/backend/.env
```

### Regenerate SECRET_KEY
```bash
# Generate new secure key
NEW_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")

# Update in .env
sed -i "s/SECRET_KEY=.*/SECRET_KEY=$NEW_KEY/" /app/backend/.env

# View the new key
echo "New SECRET_KEY: $NEW_KEY"
```

---

## 🚀 Using Credentials in Your App

### Backend (Python/FastAPI)
```python
import os
from dotenv import load_dotenv

load_dotenv()  # Loads from .env file

# Access credentials
mongo_url = os.getenv("MONGO_URL")
secret_key = os.getenv("SECRET_KEY")
llm_key = os.getenv("EMERGENT_LLM_KEY")
```

### Frontend (React)
```javascript
// Access environment variables
const backendUrl = process.env.REACT_APP_BACKEND_URL;
// or
const backendUrl = import.meta.env.REACT_APP_BACKEND_URL;
```

---

## 🔄 What Happens When You Clone on Another Machine?

### Scenario: You clone your repo on a new computer

**Step 1:** Clone the repo
```bash
git clone https://github.com/yourusername/your-repo.git
cd your-repo
```

**Step 2:** .env files are NOT there (that's the point!)
```bash
ls -la backend/.env  # ❌ File not found
```

**Step 3:** Create .env files from templates
```bash
./scripts/setup_dev.sh
# OR manually:
cp backend/.env.example backend/.env
```

**Step 4:** Fill in your credentials
```bash
nano backend/.env  # Add your actual credentials
```

---

## 📋 Quick Commands Reference

```bash
# View all credentials
cat /app/backend/.env

# Edit credentials
nano /app/backend/.env

# Check if .env exists
ls -la /app/backend/.env

# Verify .env is NOT in git
git ls-files | grep "\.env$"  # Should return nothing

# Copy .env to another location (backup)
cp /app/backend/.env ~/my-credentials-backup.env

# View specific credential
grep "EMERGENT_LLM_KEY" /app/backend/.env
```

---

## 🎯 Summary

✅ **Your credentials exist locally** at `/app/backend/.env`  
✅ **You can view them anytime** with `cat /app/backend/.env`  
✅ **You can edit them anytime** with any text editor  
✅ **Your apps can use them** via environment variables  
✅ **They won't be uploaded to GitHub** (protected by .gitignore)  
✅ **Only you have access** - not public on GitHub  

---

**The security improvement means:**
- ✅ You still have full access to your credentials
- ✅ Your apps still work normally
- ❌ Random people on GitHub can't see them
- ❌ They're not in git history anymore

**Nothing changed in how YOU access them - only in what gets uploaded to GitHub!** 🔒
