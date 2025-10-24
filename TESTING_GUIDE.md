# 🧪 Email Verification & Password Reset - Testing Guide

## ✅ Setup Status: COMPLETE & READY

Your email system is **fully configured** and **ready to test**!

---

## 🎯 Quick Test Plan

### Test 1: New User Registration with Email Verification

**Steps:**
1. Open your browser and go to: **http://localhost:3000/register**
2. Fill in the registration form:
   - Name: Test User
   - Email: **Use a different email address** (not kartiksrathod07@gmail.com) for testing
   - Password: testpass123
   - USN: TEST001
   - Course: Computer Science
   - Semester: 1

3. Click **"Register"**

**Expected Result:**
- ✅ Success message: "Please check your email to verify your account"
- ✅ Check your email inbox for "Welcome to EduResources - Verify Your Email 📚"
- ✅ Email should have beautiful HTML design with purple/blue gradient
- ✅ Click "Verify Email Address" button in the email

4. After clicking the verification link:
   - ✅ Should see success page with countdown
   - ✅ Auto-redirect to login page after 5 seconds
   - ✅ Message: "Email verified successfully!"

5. Try to login **BEFORE** email verification:
   - ✅ Should show error: "Please verify your email address before logging in"

6. After email verification, login should work ✅

---

### Test 2: Resend Verification Email

**Steps:**
1. Go to: **http://localhost:3000/resend-verification**
2. Enter your email address
3. Click "Send Verification Email"

**Expected Result:**
- ✅ Success message displayed
- ✅ New verification email received
- ✅ Can verify using new link

---

### Test 3: Forgot Password Flow

**Steps:**
1. Go to: **http://localhost:3000/forgot-password**
2. Enter registered email address
3. Click "Send Reset Link"

**Expected Result:**
- ✅ Success message: "Check your email for password reset instructions"
- ✅ Email received: "Password Reset Request - Academic Resources"
- ✅ Email has professional design with security warnings
- ✅ Click "Reset Password" button in email

4. On the reset password page:
   - Enter new password (minimum 6 characters)
   - Confirm password
   - Click "Reset Password"

**Expected Result:**
- ✅ Success message displayed
- ✅ Auto-redirect to login page
- ✅ Can login with new password
- ✅ Old password no longer works

---

### Test 4: Edge Cases

#### Test 4a: Expired Token
**Steps:**
1. Request verification/reset email
2. Don't click the link for 24+ hours (or modify expiry in code for testing)
3. Try to use the link

**Expected Result:**
- ✅ Error: "Verification link has expired"
- ✅ Option to request new link

#### Test 4b: Used Token
**Steps:**
1. Use a verification/reset link successfully
2. Try to use the same link again

**Expected Result:**
- ✅ Error: "Invalid or expired verification link"

#### Test 4c: Invalid Email
**Steps:**
1. Go to forgot password
2. Enter non-existent email

**Expected Result:**
- ✅ Generic message (doesn't reveal if email exists) for security

---

## 📧 Email Template Preview

### Welcome Email Features:
- 🎨 Beautiful gradient header (purple/blue)
- 📱 Mobile responsive
- ✨ Professional styling
- ⏰ Expiry warning (24 hours)
- 🎓 Feature highlights
- 🔗 Clickable button + backup link

### Password Reset Email Features:
- 🔐 Security-focused design
- ⏰ 1-hour expiry notice
- 🛡️ Security tips
- 📱 Mobile responsive
- 🔗 One-click reset button

---

## 🐛 Common Issues & Solutions

### Issue: Email not received
**Solutions:**
1. ✅ Check spam/junk folder
2. ✅ Wait 1-2 minutes (Gmail can delay)
3. ✅ Check backend logs: `tail -f /var/log/supervisor/backend*.log`
4. ✅ Try different email provider (not Gmail)

### Issue: "SMTP Authentication failed"
**Solutions:**
1. ✅ Verify App Password is correct (16 chars, no spaces)
2. ✅ Check 2FA is enabled on Gmail
3. ✅ Regenerate App Password

### Issue: Link shows "expired" immediately
**Solutions:**
1. ✅ Check server time is correct: `date`
2. ✅ Verify token expiry settings in server.py

---

## 📊 Backend Logs

Monitor email sending in real-time:

```bash
# Watch all backend activity
tail -f /var/log/supervisor/backend*.log

# Filter for email-related logs only
tail -f /var/log/supervisor/backend*.log | grep -i "email\|smtp"
```

**What to look for:**
- ✅ `Email sent successfully to [email]`
- ✅ `Welcome email sent to [email]`
- ❌ `SMTP Authentication failed`
- ❌ `Email send error`

---

## 🔍 API Endpoints Testing (Using curl)

### Test Registration API:
```bash
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "usn": "TEST001"
  }'
```

### Test Forgot Password API:
```bash
curl -X POST http://localhost:8001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

### Test Verification API (replace TOKEN):
```bash
curl http://localhost:8001/api/auth/verify-email/YOUR_TOKEN_HERE
```

---

## ✅ Testing Checklist

- [ ] Registration sends verification email
- [ ] Verification email has correct design
- [ ] Verification link works
- [ ] Can't login before verification
- [ ] Can login after verification
- [ ] Resend verification works
- [ ] Forgot password sends email
- [ ] Password reset link works
- [ ] Can login with new password
- [ ] Old password doesn't work after reset
- [ ] Expired tokens show error
- [ ] Used tokens show error
- [ ] Emails arrive in inbox (not spam)
- [ ] Mobile view looks good
- [ ] Dark mode emails render properly

---

## 🚀 Next Steps After Testing

Once all tests pass:

1. **For Local Development:**
   - ✅ System is ready to use
   - ✅ Continue building other features

2. **For Production Deployment:**
   - Update `FRONTEND_URL` in `/app/backend/.env`
   - Consider using SendGrid/AWS SES instead of Gmail
   - Set strong `SECRET_KEY`
   - Monitor email delivery rates
   - Set up proper logging

---

## 📞 Need Help?

If you encounter issues:
1. Check `EMAIL_SETUP_GUIDE.md` for detailed setup instructions
2. Review backend logs for error messages
3. Test SMTP connection: `python3 /app/test_email_config.py`
4. Verify environment variables are loaded correctly

---

## 🎉 Success Criteria

Your system is working when:
- ✅ Users receive emails within 1-2 minutes
- ✅ Email templates render beautifully
- ✅ Links work and redirect properly
- ✅ Tokens expire correctly
- ✅ Security measures are in place
- ✅ No errors in backend logs

**You're now ready to test!** 🚀

Start with Test 1 (Registration) and work through each test sequentially.
