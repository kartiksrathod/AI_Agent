# 🚀 Production Deployment Checklist

## Pre-Deployment Testing (Local)

### ✅ Completed Setup
- [x] SMTP credentials configured (Gmail)
- [x] Email verification enabled
- [x] Password reset enabled
- [x] Backend .env created
- [x] Frontend .env created
- [x] Services restarted

### 📋 Local Testing Requirements

Before deploying to production, complete these tests:

#### Email Verification Tests
- [ ] Register new user with valid email
- [ ] Receive welcome email within 2 minutes
- [ ] Email renders properly (check on mobile & desktop)
- [ ] Verification link works
- [ ] Can't login before verification
- [ ] Can login after verification
- [ ] Resend verification works
- [ ] Expired token handling works

#### Password Reset Tests
- [ ] Request password reset
- [ ] Receive reset email within 2 minutes
- [ ] Reset link works
- [ ] Can set new password
- [ ] Can login with new password
- [ ] Old password no longer works
- [ ] Token expiry works (1 hour)

#### Security Tests
- [ ] Used tokens can't be reused
- [ ] Invalid tokens show proper errors
- [ ] Password reset doesn't reveal if email exists
- [ ] Email verification blocks login properly
- [ ] Tokens are cryptographically secure

---

## 🔧 Production Environment Setup

### Step 1: Environment Variables

#### Backend (.env) - Update for Production:

```bash
# Database - Use production MongoDB
MONGO_URL=mongodb://your-production-mongo:27017
DATABASE_NAME=academic_resources_production

# Security - CRITICAL: Change these!
SECRET_KEY=<generate-using: python -c "import secrets; print(secrets.token_urlsafe(64))">
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Email - RECOMMENDED: Use professional SMTP service
# Option 1: SendGrid (Recommended)
SMTP_SERVER=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=<your-sendgrid-api-key>
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME=YourAppName

# Option 2: AWS SES
# SMTP_SERVER=email-smtp.us-east-1.amazonaws.com
# SMTP_PORT=587
# SMTP_USERNAME=<your-aws-smtp-username>
# SMTP_PASSWORD=<your-aws-smtp-password>
# SMTP_FROM_EMAIL=noreply@yourdomain.com

# Option 3: Keep Gmail (Not recommended for production)
# SMTP_SERVER=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USERNAME=your-email@gmail.com
# SMTP_PASSWORD=your-app-password
# SMTP_FROM_EMAIL=your-email@gmail.com

# Frontend URL - CRITICAL: Update to production domain
FRONTEND_URL=https://yourdomain.com

# AI Features
EMERGENT_LLM_KEY=<your-production-key>
```

#### Frontend (.env) - Update for Production:

```bash
REACT_APP_BACKEND_URL=https://api.yourdomain.com
```

### Step 2: DNS & SSL Configuration

- [ ] Domain purchased and configured
- [ ] SSL certificate installed (Let's Encrypt/Cloudflare)
- [ ] DNS records pointing to server
- [ ] HTTPS enabled and working
- [ ] HTTP to HTTPS redirect configured

### Step 3: Email Service Setup

#### Recommended: SendGrid (Easiest)

1. Sign up at: https://sendgrid.com (Free: 100 emails/day)
2. Create API Key
3. Verify sender identity
4. Update SMTP credentials in .env
5. Test email sending

#### Alternative: AWS SES (Best for Scale)

1. Sign up for AWS account
2. Set up SES in preferred region
3. Verify domain/email
4. Create SMTP credentials
5. Request production access (initially in sandbox)
6. Update .env with SES credentials

#### Stay with Gmail (Not Recommended)

**Limitations:**
- 500 emails/day limit
- May be marked as spam
- Account can be suspended
- Not professional for business use

**Only use Gmail for:**
- Personal projects
- Low-traffic apps
- Testing environments

---

## 🔒 Security Hardening

### Before Going Live:

- [ ] Change SECRET_KEY to strong random value (64+ characters)
- [ ] Use HTTPS only (no HTTP)
- [ ] Enable CORS only for your domain (remove wildcard "*")
- [ ] Set secure cookie flags
- [ ] Enable rate limiting on auth endpoints
- [ ] Set up logging and monitoring
- [ ] Configure firewall rules
- [ ] Use environment variables (never hardcode)
- [ ] Keep .env out of git (.gitignore)
- [ ] Use strong database passwords

### CORS Configuration (server.py):

```python
# Change from:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ❌ Insecure
    ...
)

# To:
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://yourdomain.com",
        "https://www.yourdomain.com"
    ],  # ✅ Secure
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📊 Monitoring & Logging

### Set up monitoring for:

- [ ] Email delivery success rate
- [ ] SMTP connection errors
- [ ] Failed verification attempts
- [ ] Password reset requests
- [ ] Token expiration errors
- [ ] Server uptime
- [ ] API response times

### Recommended Tools:

- **Logging:** Sentry, LogRocket
- **Uptime:** UptimeRobot, Pingdom
- **Email:** SendGrid Analytics, AWS SES Console
- **Server:** DataDog, New Relic

---

## 🧪 Production Testing

After deployment, test in production:

- [ ] Register with real email
- [ ] Verify email works
- [ ] Password reset works
- [ ] Links point to correct domain
- [ ] SSL certificate valid
- [ ] No mixed content warnings
- [ ] Mobile responsive
- [ ] Cross-browser compatible
- [ ] Performance is good
- [ ] No console errors

---

## 📧 Email Deliverability Best Practices

### To avoid spam folder:

1. **SPF Records:** Add to DNS
   ```
   v=spf1 include:sendgrid.net ~all
   ```

2. **DKIM:** Enable in email service settings

3. **DMARC:** Add to DNS
   ```
   v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
   ```

4. **Custom Domain:** Use noreply@yourdomain.com (not gmail)

5. **Warm-up:** Start with low volume, gradually increase

6. **Content:** Avoid spam trigger words, use proper HTML

7. **Testing:** Send to multiple providers (Gmail, Outlook, Yahoo)

---

## 📦 Backup & Recovery

Before going live:

- [ ] Database backup strategy in place
- [ ] Regular automated backups
- [ ] Test backup restoration
- [ ] Document recovery procedures
- [ ] Keep backup of .env files (securely!)

---

## 🎯 Launch Day Checklist

### Final Checks:

- [ ] All environment variables updated
- [ ] SSL certificate valid and auto-renewing
- [ ] Email sending working
- [ ] All features tested in production
- [ ] Monitoring alerts configured
- [ ] Backup system working
- [ ] Documentation up to date
- [ ] Support email address set up
- [ ] Privacy policy updated
- [ ] Terms of service updated

### After Launch:

- [ ] Monitor logs for 24 hours
- [ ] Check email delivery rates
- [ ] Verify no error spikes
- [ ] Test user registration flow
- [ ] Ask beta users to test
- [ ] Keep .env backup secure
- [ ] Document any issues found

---

## 🆘 Emergency Contacts

**If emails stop working:**

1. Check SMTP credentials
2. Check service status (SendGrid/AWS)
3. Check email quota limits
4. Review error logs
5. Test SMTP connection manually
6. Contact email service support

**Backend Issues:**

1. Check server logs: `tail -f /var/log/supervisor/backend*.log`
2. Verify .env variables loaded
3. Check MongoDB connection
4. Restart backend: `sudo supervisorctl restart backend`

---

## 📈 Post-Launch Metrics to Track

- Email delivery rate (target: >95%)
- Verification completion rate
- Time to verify (average)
- Password reset usage
- Bounce rate
- Spam complaint rate
- User registration trends

---

## 🔄 Maintenance Schedule

### Daily:
- Monitor email delivery
- Check error logs
- Review user feedback

### Weekly:
- Analyze email metrics
- Review security logs
- Update documentation

### Monthly:
- Review SMTP service costs
- Analyze user growth
- Update dependencies
- Security audit

---

## 🎉 You're Ready!

**Current Status:**
- ✅ Email verification: ENABLED
- ✅ Password reset: ENABLED
- ✅ SMTP: CONFIGURED (Gmail)
- ✅ Templates: PROFESSIONAL
- ✅ Security: IMPLEMENTED

**Next Steps:**
1. Complete local testing (use TESTING_GUIDE.md)
2. Update production environment variables
3. Set up professional SMTP service
4. Deploy to production
5. Test in production
6. Monitor and iterate

**Resources:**
- Setup Guide: `/app/EMAIL_SETUP_GUIDE.md`
- Testing Guide: `/app/TESTING_GUIDE.md`
- Test Script: `/app/test_email_config.py`

---

**Good luck with your launch! 🚀**

Remember: Start with thorough local testing before deploying to production.
