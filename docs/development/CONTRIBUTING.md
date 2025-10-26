# Contributing to EduResources

Thank you for your interest in contributing to EduResources! This document provides guidelines and best practices for contributing.

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and Yarn
- Python 3.11+
- MongoDB
- Git

### Initial Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/yourusername/eduresources.git
   cd eduresources
   ```

2. **Run the setup script:**
   ```bash
   ./scripts/setup_dev.sh
   ```

3. **Configure your environment:**
   - Update `backend/.env` with your credentials
   - Never commit `.env` files (they're in `.gitignore`)

## 🔐 Security First

### Before Every Commit

1. **Run the security checker:**
   ```bash
   ./scripts/check_credentials.sh
   ```

2. **Pre-commit hook will automatically:**
   - Block `.env` files from being committed
   - Scan for hardcoded secrets
   - Prevent credential leaks

### Security Rules
- ❌ NEVER commit `.env` files
- ❌ NEVER hardcode API keys, passwords, or secrets
- ✅ ALWAYS use environment variables
- ✅ ALWAYS use `.env.example` for templates
- ✅ ALWAYS generate strong `SECRET_KEY` values

## 📝 Development Workflow

### Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `fix/*` - Bug fixes
- `hotfix/*` - Critical production fixes

### Making Changes

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

3. **Test your changes:**
   ```bash
   # Backend tests
   cd backend && python -m pytest
   
   # Frontend tests
   yarn test
   
   # Run the app locally
   python backend/server.py
   yarn start
   ```

4. **Security check before committing:**
   ```bash
   ./scripts/check_credentials.sh
   ```

5. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples:**
```bash
git commit -m "feat: add user profile photo upload"
git commit -m "fix: resolve login authentication issue"
git commit -m "docs: update API documentation"
```

## 🎨 Code Style

### Python (Backend)
- Follow [PEP 8](https://pep8.org/)
- Use type hints where appropriate
- Document functions with docstrings
- Keep functions focused and small

### JavaScript/React (Frontend)
- Use functional components and hooks
- Follow React best practices
- Use descriptive variable names
- Keep components modular and reusable

### Tailwind CSS
- Use utility classes
- Follow mobile-first approach
- Maintain consistent spacing and colors

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest
```

### Frontend Tests
```bash
yarn test
```

### Manual Testing Checklist
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Test with real data
- [ ] Test error scenarios
- [ ] Test authentication flows

## 📚 Documentation

### When to Update Documentation
- Adding new features
- Changing API endpoints
- Modifying environment variables
- Updating setup process

### Documentation Files
- `README.md` - Project overview and setup
- `SECURITY.md` - Security guidelines
- `CONTRIBUTING.md` - This file
- API documentation in code comments

## 🔍 Pull Request Process

1. **Ensure your code passes all checks:**
   - Security scan passes
   - Tests pass
   - No console errors
   - Code is well-documented

2. **Update documentation** if needed

3. **Create a Pull Request:**
   - Use a descriptive title
   - Reference any related issues
   - Provide a clear description of changes
   - Include screenshots for UI changes

4. **PR Template:**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   - [ ] Tests pass locally
   - [ ] Security check passes
   - [ ] Manual testing completed
   
   ## Screenshots (if applicable)
   
   ## Related Issues
   Fixes #123
   ```

5. **Code Review:**
   - Respond to feedback promptly
   - Make requested changes
   - Re-request review after updates

## 🚨 Reporting Issues

### Bug Reports

Include:
- Clear description of the bug
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots or error messages
- Environment details (OS, browser, versions)

### Feature Requests

Include:
- Clear description of the feature
- Use case and benefits
- Possible implementation approach
- Alternative solutions considered

## 🤝 Community Guidelines

### Be Respectful
- Use welcoming and inclusive language
- Respect differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community

### Be Collaborative
- Help other contributors
- Share knowledge
- Participate in discussions
- Review pull requests

### Be Patient
- Remember maintainers are volunteers
- Give time for reviews and responses
- Understand not all features may be accepted

## 📞 Getting Help

- **GitHub Issues** - For bugs and feature requests
- **Discussions** - For questions and general discussion
- **Email** - kartiksrathod07@gmail.com

## ⚖️ License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

## 🎯 Quick Reference

### Setup
```bash
./scripts/setup_dev.sh
```

### Security Check
```bash
./scripts/check_credentials.sh
```

### Run Tests
```bash
python backend/server.py  # Backend
yarn start                 # Frontend
```

### Before Committing
1. Run security check
2. Run tests
3. Update documentation
4. Write clear commit message

---

**Thank you for contributing to EduResources! 🎓**
