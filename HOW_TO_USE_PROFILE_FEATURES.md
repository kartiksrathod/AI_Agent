# 📸 How to Upload Profile Photo & Change Password

## 🔐 Login Credentials

### Admin Account
- **Email:** admin@example.com
- **Password:** admin123

### Regular User Account (for testing)
- **Email:** student@example.com
- **Password:** password123

---

## 📸 Upload Profile Photo

### Step-by-Step:

1. **Login** to your account (admin or regular user)

2. **Navigate to Profile**
   - Click on your avatar/name in the top-right corner
   - OR go to the Profile section from navigation

3. **Go to Settings Tab**
   - Click on the "Settings" tab
   - You'll see two cards: "Profile Information" and "Change Password"

4. **Upload Photo**
   - In the "Profile Information" card, you'll see:
     - Your current avatar (or initials if no photo)
     - An "Upload Photo" button (or "Change Photo" if you already have one)
   
   - Click the **"Upload Photo"** button
   - Select an image file from your computer
     - Supported formats: JPG, JPEG, PNG, WebP
   - The photo will upload automatically
   - Page will reload and show your new profile photo

5. **Remove Photo (Optional)**
   - If you want to remove your photo, click the "Remove Photo" button
   - Confirm the action
   - Your avatar will revert to showing your initial

---

## 🔑 Change Password

### Step-by-Step:

1. **Login** to your account

2. **Navigate to Profile → Settings** (same as above)

3. **Find the "Change Password" Card**
   - It's in the right column on desktop
   - Below profile info on mobile

4. **For Admin Users - Important Note**
   - You'll see a blue info box showing your default password
   - Default admin password is: `admin123`

5. **Fill in the Form**
   - **Current Password:** Enter your current password
     - For admin: `admin123` (if you haven't changed it yet)
     - For student: `password123` (if testing with demo account)
   
   - **New Password:** Enter your desired new password
     - Must be at least 6 characters
     - Must be different from current password
   
   - **Confirm New Password:** Re-enter the new password
     - Must match the "New Password" field exactly

6. **Click "Update Password"**
   - If successful, you'll see a green success message
   - Form will clear automatically
   - Use your new password for next login

7. **Test New Password**
   - Logout
   - Login with your email and NEW password
   - Should work perfectly!

---

## ⚠️ Common Issues & Solutions

### Profile Photo Upload

**Problem:** Button doesn't work
- **Solution:** This has been fixed! Just click the button and it will open the file selector.

**Problem:** Photo doesn't appear after upload
- **Solution:** Page should reload automatically. If not, manually refresh the page.

**Problem:** "Failed to upload photo" error
- **Solution:** 
  - Make sure file is an image (JPG, PNG, WebP)
  - Check file size (keep under 10MB)
  - Try a different image

### Password Change

**Problem:** "Current password is incorrect"
- **Solution:**
  - For admin account, try: `admin123`
  - For student account, try: `password123`
  - Make sure there are no extra spaces
  - Check if CAPS LOCK is on

**Problem:** "New passwords don't match"
- **Solution:** Make sure the "New Password" and "Confirm New Password" fields are identical

**Problem:** "New password must be different from current password"
- **Solution:** Choose a different password than your current one

**Problem:** "New password must be at least 6 characters"
- **Solution:** Use a longer password (minimum 6 characters)

---

## 🎯 Quick Test Checklist

### Test Profile Photo Upload:
- [ ] Login as admin (admin@example.com / admin123)
- [ ] Go to Profile → Settings
- [ ] Click "Upload Photo" button
- [ ] Select an image file
- [ ] Photo should upload and display
- [ ] ✅ Success!

### Test Password Change:
- [ ] Login as admin (admin@example.com / admin123)
- [ ] Go to Profile → Settings
- [ ] Enter current password: `admin123`
- [ ] Enter new password: `mynewpassword123`
- [ ] Confirm new password: `mynewpassword123`
- [ ] Click "Update Password"
- [ ] See success message
- [ ] Logout
- [ ] Login with new password
- [ ] ✅ Success!

### Test as Regular User:
- [ ] Login as student (student@example.com / password123)
- [ ] Upload profile photo (same process)
- [ ] Change password (same process)
- [ ] ✅ Both should work!

---

## 💡 Pro Tips

1. **Profile Photos**
   - Use a square image for best results
   - Recommended size: 400x400 pixels or larger
   - Keep file size reasonable (under 5MB)

2. **Passwords**
   - Choose strong passwords (mix of letters, numbers, symbols)
   - Don't reuse passwords from other sites
   - Write down your new password in a safe place

3. **Admin Users**
   - Remember to change the default password after first login
   - Your profile photo will appear in the navbar

4. **Both Features Work for:**
   - ✅ Admin users
   - ✅ Regular users
   - ✅ All user roles

---

## 📞 Still Having Issues?

If you're still experiencing problems:

1. **Check Browser Console**
   - Press F12 (Windows) or Cmd+Option+I (Mac)
   - Look for any error messages
   - Share them for debugging

2. **Try Different Browser**
   - Test in Chrome, Firefox, or Safari
   - Clear cache and cookies

3. **Verify Services are Running**
   - Backend should be running on port 8001
   - Frontend should be running on port 3000

---

## ✅ Confirmation

Both features are now **fully functional** and tested:
- ✅ Profile photo upload works
- ✅ Profile photo display works
- ✅ Profile photo removal works
- ✅ Password change works
- ✅ Password validation works
- ✅ Works for both Admin and Regular users

Enjoy your fully functional profile management system! 🎉
