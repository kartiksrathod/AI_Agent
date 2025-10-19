# Manual Git Control Guide

## 🎮 Taking Full Control of Your Git Workflow

Instead of using Emergent's "Save to GitHub" button, you can manually control all Git operations with full customization.

---

## 📋 Basic Git Workflow

### Step 1: Check What Changed
```bash
# See which files were modified
git status

# See actual changes in files
git diff

# See changes in a specific file
git diff path/to/file.py
```

### Step 2: Stage Your Changes
```bash
# Stage all changes
git add .

# Stage specific files only
git add backend/server.py
git add frontend/src/App.js

# Stage by pattern
git add *.py          # All Python files
git add backend/*     # Everything in backend
```

### Step 3: Commit with Custom Message
```bash
# Commit with inline message
git commit -m "Add user authentication feature"

# Commit with detailed message (opens editor)
git commit

# Commit with title and description
git commit -m "Add user authentication" -m "Implemented JWT-based auth with login/register endpoints"
```

### Step 4: Push to GitHub
```bash
# Push to current branch
git push

# Push to specific branch
git push origin main
git push origin feature/authentication

# Force push (use carefully!)
git push --force origin main
```

---

## ✍️ Writing Good Commit Messages

### Format: Conventional Commits
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code formatting (no logic change)
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance tasks
- `perf:` - Performance improvements
- `security:` - Security improvements

### Examples

**Simple commit:**
```bash
git commit -m "feat: add profile photo upload"
```

**Detailed commit:**
```bash
git commit -m "fix: resolve authentication token expiration issue" \
           -m "Users were being logged out prematurely due to incorrect token expiration time. Changed from 30 seconds to 30 minutes."
```

**With scope:**
```bash
git commit -m "feat(auth): implement password reset functionality"
git commit -m "fix(api): correct response format for user endpoints"
git commit -m "docs(readme): update setup instructions"
```

**Multi-line commit (interactive):**
```bash
git commit
# Opens editor where you type:
```
```
feat: add real-time chat functionality

- Implemented WebSocket connections
- Added chat room creation
- Added message persistence to MongoDB
- Updated UI with chat interface

Closes #123
```

---

## 🌿 Branch Management

### Create and Switch Branches
```bash
# Create new branch
git branch feature/new-feature

# Switch to branch
git checkout feature/new-feature

# Create and switch in one command
git checkout -b feature/new-feature

# Modern way (Git 2.23+)
git switch -c feature/new-feature
```

### List Branches
```bash
# List local branches
git branch

# List all branches (including remote)
git branch -a

# List with last commit info
git branch -v
```

### Delete Branches
```bash
# Delete local branch
git branch -d feature/old-feature

# Force delete (if not merged)
git branch -D feature/old-feature

# Delete remote branch
git push origin --delete feature/old-feature
```

---

## 🔄 Complete Workflow Examples

### Example 1: Simple Feature Addition
```bash
# 1. Check current status
git status

# 2. Create feature branch
git checkout -b feat/user-dashboard

# 3. Make your changes in code editor
# ... edit files ...

# 4. Check what changed
git status
git diff

# 5. Stage changes
git add .

# 6. Commit with message
git commit -m "feat: add user dashboard with stats and activity"

# 7. Push to GitHub
git push origin feat/user-dashboard

# 8. Create Pull Request on GitHub (optional)
# Or merge directly:
git checkout main
git merge feat/user-dashboard
git push origin main
```

### Example 2: Bug Fix
```bash
# 1. Create fix branch
git checkout -b fix/login-error

# 2. Fix the bug
# ... edit files ...

# 3. Stage and commit
git add backend/server.py
git commit -m "fix(auth): resolve login token validation error" \
           -m "Fixed issue where expired tokens were not properly rejected"

# 4. Push
git push origin fix/login-error

# 5. Merge to main
git checkout main
git merge fix/login-error
git push origin main

# 6. Delete the fix branch
git branch -d fix/login-error
```

### Example 3: Security Update
```bash
# Working on your security improvements

# 1. Stage security-related files only
git add SECURITY.md
git add CONTRIBUTING.md
git add scripts/check_credentials.sh
git add backend/.env.example

# 2. Commit security changes
git commit -m "security: implement comprehensive credential protection" \
           -m "- Remove .env from git history
- Add pre-commit hooks
- Create security documentation
- Add automated security checks"

# 3. Push
git push origin main
```

---

## 🔍 Advanced Git Commands

### View History
```bash
# Simple log
git log

# One line per commit
git log --oneline

# With graph
git log --oneline --graph --all

# Last 5 commits
git log -5

# Commits by author
git log --author="Your Name"

# Commits in date range
git log --since="2 weeks ago"
```

### Undo Changes
```bash
# Discard changes in working directory
git checkout -- filename.py

# Unstage file (keep changes)
git reset HEAD filename.py

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Amend last commit message
git commit --amend -m "New commit message"

# Amend last commit with new changes
git add forgotten-file.py
git commit --amend --no-edit
```

### Stash Changes
```bash
# Save work in progress
git stash

# List stashes
git stash list

# Apply last stash
git stash pop

# Apply specific stash
git stash apply stash@{0}

# Stash with message
git stash save "WIP: working on user profile"
```

---

## 🚀 Your Current Repository

### Pushing Security Changes
```bash
# You've made security improvements - here's how to push them:

cd /app

# 1. Check status
git status

# 2. See what changed
git log --oneline -5

# 3. Force push cleaned history to GitHub
git push origin --force --all

# This will:
# - Remove .env from history on GitHub
# - Update with all security improvements
# - Clean up the remote repository
```

---

## ⚠️ Important Notes

### Working with Emergent

**Remember:**
- Emergent creates auto-commits when you use "Save to GitHub"
- Manual Git commands work alongside Emergent
- If you use manual Git, avoid clicking "Save to GitHub" for same changes
- Both methods can coexist, just be consistent

### Before Force Pushing

**Use with caution:**
```bash
# This rewrites history - only do if:
# - Working alone
# - No one else has pulled the repo
# - You know what you're doing

git push --force origin main
```

### Security Checks

**Before any commit:**
```bash
# Run security check
./scripts/check_credentials.sh

# Verify no .env files staged
git status | grep "\.env"

# Review all changes
git diff --cached
```

---

## 📚 Quick Reference

```bash
# COMMON COMMANDS
git status              # Check status
git diff               # See changes
git add .              # Stage all
git commit -m "msg"    # Commit
git push               # Push to remote
git pull               # Pull from remote

# BRANCH COMMANDS
git branch             # List branches
git checkout -b NAME   # Create & switch
git merge NAME         # Merge branch
git branch -d NAME     # Delete branch

# HISTORY COMMANDS
git log                # View history
git log --oneline      # Compact history
git reflog             # All actions

# UNDO COMMANDS
git reset HEAD file    # Unstage
git checkout -- file   # Discard changes
git reset --soft HEAD~1 # Undo commit

# REMOTE COMMANDS
git remote -v          # List remotes
git push origin BRANCH # Push to branch
git pull origin BRANCH # Pull from branch
```

---

## 🎯 Workflow Recommendation

For your security improvements, here's what I recommend:

```bash
# 1. Check current state
git status

# 2. Review all the security changes made
git diff HEAD~5  # See last 5 commits of changes

# 3. Force push cleaned history (removes .env from GitHub history)
git push origin --force --all

# 4. Verify on GitHub
# Visit your repository and check:
# - .env files are not visible
# - .env.example files ARE visible
# - SECURITY.md is there
# - Git history is clean
```

From now on, whenever you make changes:
```bash
git add .
git commit -m "feat: add awesome feature"
git push origin main
```

**No auto-commits, full control!** 🎮

---

## 💡 Pro Tips

1. **Commit Often:** Small, focused commits are better than large ones
2. **Write Clear Messages:** Future you will thank present you
3. **Use Branches:** Keep main stable, experiment in branches
4. **Review Before Committing:** Always `git diff` before `git commit`
5. **Don't Commit Secrets:** Run security check first!

---

**Now you have full Git superpowers! 🚀**
