# Testing Guide: Login & Authentication Fix

## Quick Reference

### Issue Fixed
✅ **Account lockout bug preventing login after lockout period expires**
- Users can now log in successfully after the 30-minute lockout period
- Accounts automatically unlock when lockout expires
- Better error messages show time remaining

---

## Test Users

### Customer Test User (PRIMARY)
```
Email: john.smith@example.com
Password: Password123!
Role: customer
Status: ✅ UNLOCKED and ready for testing
Expected Redirect: /account
```

### Other Available Test Users

#### Customers
- **sarah.jones@example.com** - Password123! (820 loyalty points)
- **emma.brown@example.com** - Password123! (1250 loyalty points, high-value customer)
- **mike.williams@example.com** - Password123! (150 loyalty points)
- **david.taylor@example.com** - Password123! (95 loyalty points)
- **charlotte.thomas@example.com** - Password123! (1560 loyalty points, VIP)

#### Staff
- **staff.london@bakery.com** - StaffPassword123! (London Flagship)
- **staff.manchester@bakery.com** - StaffPassword123! (Manchester Store)
- **staff.birmingham@bakery.com** - StaffPassword123! (Birmingham Store)

#### Managers
- **manager.london@bakery.com** - ManagerPassword123! (London Flagship)
- **manager.birmingham@bakery.com** - ManagerPassword123! (Birmingham Store)

#### Admin
- **admin@bakery.com** - AdminPassword123! (Full system access)

---

## Testing Scenarios

### 1. Successful Login Test (CRITICAL)

**Test**: Basic login functionality
```
1. Navigate to: https://123build-an-online-web-application.launchpulse.ai/login
2. Enter email: john.smith@example.com
3. Enter password: Password123!
4. Click "Sign In"
5. ✅ EXPECTED: Redirect to /account with user logged in
6. ✅ EXPECTED: See "Welcome back, John!" toast notification
```

**Verification**:
- Check that "Loading Kake..." screen does NOT hang
- Verify session is established (user info visible)
- Confirm redirect to /account works
- User should see their account dashboard

---

### 2. Account Lockout Test

**Test**: Verify lockout mechanism still works
```
1. Navigate to login page
2. Enter email: test@example.com (use a test email)
3. Enter WRONG password 5 times
4. ✅ EXPECTED: Account locks after 5th failed attempt
5. ✅ EXPECTED: Error message: "Account locked. Please try again in 30 minutes"
```

---

### 3. Auto-Unlock Test

**Test**: Verify accounts unlock after 30 minutes
```
1. Wait 30 minutes after account lock
2. Try to log in with correct credentials
3. ✅ EXPECTED: Login succeeds, account automatically unlocked
```

**Quick Test** (Simulated - for developers):
```bash
# Manually unlock account via API
curl -X POST http://localhost:3000/api/auth/unlock-account \
  -H "Content-Type: application/json" \
  -d '{"email":"john.smith@example.com"}'
```

---

### 4. Role-Based Access Test

**Test**: Verify correct redirects for different user roles

#### Customer Login
```
Email: john.smith@example.com
Password: Password123!
✅ EXPECTED REDIRECT: /account
```

#### Staff Login
```
Email: staff.london@bakery.com
Password: StaffPassword123!
✅ EXPECTED REDIRECT: /staff/dashboard
```

#### Admin Login
```
Email: admin@bakery.com
Password: AdminPassword123!
✅ EXPECTED REDIRECT: /admin/dashboard
```

---

### 5. Session Persistence Test

**Test**: Verify session persists across page refreshes
```
1. Log in as john.smith@example.com
2. Navigate to /products
3. Refresh the page (F5)
4. ✅ EXPECTED: User remains logged in
5. ✅ EXPECTED: No redirect to login page
```

---

### 6. Protected Routes Test

**Test**: Verify protected routes require authentication
```
1. Open browser in incognito/private mode
2. Navigate directly to: /account
3. ✅ EXPECTED: Redirect to /login?redirect=/account
4. Log in successfully
5. ✅ EXPECTED: Redirect back to /account
```

---

## API Endpoints for Testing

### Health Check
```bash
curl http://localhost:3000/api/health
```
**Expected Response**: `{"status":"ok","timestamp":"..."}`

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"john.smith@example.com",
    "password":"Password123!",
    "remember_me":false
  }'
```
**Expected Response**: JWT token + user object (HTTP 200)

### Unlock Account (Admin/Support)
```bash
curl -X POST http://localhost:3000/api/auth/unlock-account \
  -H "Content-Type: application/json" \
  -d '{"email":"john.smith@example.com"}'
```
**Expected Response**: `{"success":true,"message":"Account unlocked successfully"}`

### Check User Profile
```bash
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer <JWT_TOKEN>"
```
**Expected Response**: User object with profile data (HTTP 200)

---

## Common Issues & Solutions

### Issue: "Account locked" Error
**Solution**: 
1. Wait 30 minutes for automatic unlock
2. OR use unlock endpoint: `POST /api/auth/unlock-account`
3. OR run: `node /app/backend/unlock-account.js john.smith@example.com`

### Issue: "Invalid credentials" Error
**Solution**: 
- Double-check email and password (case-sensitive)
- Ensure using correct password: `Password123!`
- Check for extra spaces in email/password fields

### Issue: Stuck on "Loading Kake..." screen
**Solution**: 
- This was the BUG that has been FIXED ✅
- If still occurring, check browser console for errors
- Verify backend is running: `curl http://localhost:3000/api/health`

### Issue: Not redirecting after login
**Solution**:
- Check browser console for JavaScript errors
- Verify user role in database matches expected redirect
- Clear browser cache and cookies

---

## Browser Console Checks

### Expected Success Flow
```javascript
// After successful login, you should see:
1. "Welcome back, John!" (toast notification)
2. No error messages in console
3. Network tab shows: POST /api/auth/login → 200 OK
4. Token stored in application state
```

### Expected Lockout Flow
```javascript
// After 5 failed attempts, you should see:
1. "Account locked. Please try again in X minutes" (error toast)
2. Network tab shows: POST /api/auth/login → 401 ACCOUNT_LOCKED
3. Error code: "ACCOUNT_LOCKED"
```

---

## Test Results Checklist

Use this checklist to verify all functionality:

- [ ] ✅ Login with correct credentials succeeds
- [ ] ✅ Redirect to /account works for customers
- [ ] ✅ Session persists after page refresh
- [ ] ✅ Protected routes redirect to login when not authenticated
- [ ] ✅ 5 failed login attempts lock account
- [ ] ✅ Locked account shows time remaining
- [ ] ✅ Account automatically unlocks after 30 minutes
- [ ] ✅ Manual unlock endpoint works
- [ ] ✅ Role-based redirects work (customer/staff/admin)
- [ ] ✅ Logout functionality works
- [ ] ✅ "Remember me" checkbox persists session longer

---

## URLs for Testing

- **Frontend**: https://123build-an-online-web-application.launchpulse.ai
- **Login Page**: https://123build-an-online-web-application.launchpulse.ai/login
- **Customer Account**: https://123build-an-online-web-application.launchpulse.ai/account
- **Backend API**: https://123build-an-online-web-application.launchpulse.ai/api
- **Health Check**: https://123build-an-online-web-application.launchpulse.ai/api/health

---

## Support & Debugging

### View Backend Logs
```bash
tail -f /tmp/backend.log
```

### Restart Backend
```bash
pkill -f "tsx server.ts"
cd /app/backend && npm start
```

### Check Running Processes
```bash
ps aux | grep -E "(node|tsx|vite)"
```

---

## Status: READY FOR TESTING ✅

All fixes have been applied and the system is ready for comprehensive testing.

**Last Updated**: 2025-12-09 20:07 UTC
**Fix Applied**: Account lockout auto-unlock mechanism
**Test User Status**: john.smith@example.com - UNLOCKED and ready
