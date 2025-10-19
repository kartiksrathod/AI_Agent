# Security Guide

## 🔐 Credential Management

This project uses environment variables to manage sensitive credentials. **NEVER commit actual .env files to version control.**

### Setup Instructions

1. **Copy the example files to create your environment files:**
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

2. **Fill in your actual credentials in the .env files**

3. **Generate a secure SECRET_KEY:**
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

### Required Credentials

#### Backend (.env)
- `MONGO_URL` - Your MongoDB connection string
- `DATABASE_NAME` - Your database name
- `SECRET_KEY` - JWT secret key (generate securely!)
- `EMERGENT_LLM_KEY` - Your Emergent LLM API key (if using AI features)

#### Frontend (.env)
- `REACT_APP_BACKEND_URL` - Your backend API URL

## 🛡️ Security Best Practices

### For Developers

1. **Never commit .env files** - They're already in `.gitignore`
2. **Never hardcode credentials** - Always use environment variables
3. **Rotate keys regularly** - Especially after team member changes
4. **Use strong secrets** - Generate cryptographically secure keys
5. **Review commits** - Double-check before pushing to GitHub

### Pre-Commit Checklist

Before every commit, verify:
- [ ] No .env files are staged
- [ ] No API keys or passwords in code
- [ ] No commented-out credentials
- [ ] .env.example is up to date (without real values)

### If Credentials Are Exposed

If you accidentally commit credentials:

1. **Immediately rotate all exposed credentials**
2. **Remove from git history:**
   ```bash
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch .env backend/.env frontend/.env' \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. **Clean up:**
   ```bash
   rm -rf .git/refs/original/
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```
4. **Force push:**
   ```bash
   git push origin --force --all
   ```

## 📋 Environment Variable Reference

### Development
```env
# Backend
MONGO_URL=mongodb://localhost:27017
SECRET_KEY=dev-secret-key-change-in-production

# Frontend
REACT_APP_BACKEND_URL=http://localhost:8001
```

### Production
```env
# Backend
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/dbname
SECRET_KEY=<cryptographically-secure-key>

# Frontend
REACT_APP_BACKEND_URL=https://api.yourdomain.com
```

## 🔍 Security Audit

### Check for exposed credentials:
```bash
# Search for potential secrets in code
git grep -i "api_key\|secret\|password\|token" -- '*.py' '*.js' '*.jsx'

# Check git history for .env files
git log --all --full-history -- "*.env"
```

### Tools for Secret Scanning
- [git-secrets](https://github.com/awslabs/git-secrets) - Prevents committing secrets
- [truffleHog](https://github.com/trufflesecurity/truffleHog) - Scans for secrets in git history
- [detect-secrets](https://github.com/Yelp/detect-secrets) - Finds secrets in code

## 🆘 Support

If you discover a security vulnerability, please:
1. **DO NOT** open a public issue
2. Rotate any exposed credentials immediately
3. Contact the repository maintainer directly

## 📚 Additional Resources

- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [GitHub's guide on removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
