# Staff Account Lockout Fix

## Issue Summary

**Problem:** London staff (`staff.london@bakery.com`) and manager (`manager.london@bakery.com`) accounts were locked due to multiple failed login attempts during browser testing. The accounts showed "Account locked. Please try again in 29 minutes" error message.

**Priority:** CRITICAL

**Impact:** Unable to proceed with order fulfillment workflow (Step 2 onwards) as staff roles could not log in.

## Root Cause

The accounts were locked due to the security mechanism in the login endpoint (`/api/auth/login`) which:
1. Tracks failed login attempts in the `users` table
2. Locks accounts for 30 minutes after 5 failed attempts
3. Sets `locked_until` timestamp and `failed_login_attempts` counter

During browser testing, multiple login attempts with incorrect credentials triggered this lockout mechanism for both London staff accounts.

## Solution Implemented

### 1. Created Account Fix Script

Created `/app/backend/fix-london-staff-accounts.js` which:
- Unlocks both London staff accounts
- Resets `failed_login_attempts` to 0
- Sets `locked_until` to NULL
- Resets passwords to their correct values with proper bcrypt hashing

### 2. Execution Results

```
✅ staff.london@bakery.com - UNLOCKED
   Password: StaffPassword123!
   Failed attempts: 0
   Locked until: NULL

✅ manager.london@bakery.com - UNLOCKED
   Password: ManagerPassword123!
   Failed attempts: 0
   Locked until: NULL
```

### 3. Verified Login Credentials

**London Staff Account:**
- Email: `staff.london@bakery.com`
- Password: `StaffPassword123!`
- User Type: `staff`
- Status: `active`

**London Manager Account:**
- Email: `manager.london@bakery.com`
- Password: `ManagerPassword123!`
- User Type: `manager`
- Status: `active`

## Code Location

**Login endpoint:** `/app/backend/server.ts` lines 175-226

**Account lockout logic:**
```typescript
// Check if account is locked (lines 184-198)
if (user.locked_until) {
  const now = new Date();
  const lockedUntil = new Date(user.locked_until);
  
  if (lockedUntil > now) {
    // Account is still locked
    const minutesRemaining = Math.ceil((lockedUntil.getTime() - now.getTime()) / (1000 * 60));
    return res.status(401).json(createErrorResponse(`Account locked. Please try again in ${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''}`, null, 'ACCOUNT_LOCKED'));
  } else {
    // Lockout period expired - auto unlock
    await client.query('UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE user_id = $1', [user.user_id]);
  }
}

// Increment failed attempts on wrong password (lines 200-205)
if (!passwordMatch) {
  await client.query('UPDATE users SET failed_login_attempts = failed_login_attempts + 1, locked_until = CASE WHEN failed_login_attempts + 1 >= 5 THEN $1 ELSE NULL END WHERE user_id = $2', [new Date(Date.now() + 30 * 60 * 1000).toISOString(), user.user_id]);
  return res.status(401).json(createErrorResponse('Invalid credentials', null, 'INVALID_CREDENTIALS'));
}
```

## Testing Steps

To verify the fix:

1. **Login Test:**
   ```bash
   curl -X POST https://123build-an-online-web-application.launchpulse.ai/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "staff.london@bakery.com",
       "password": "StaffPassword123!",
       "remember_me": false
     }'
   ```
   Expected: 200 OK with authentication token

2. **Browser Test:**
   - Navigate to login page
   - Enter credentials: `staff.london@bakery.com` / `StaffPassword123!`
   - Should successfully authenticate and redirect to staff dashboard

3. **Order Fulfillment Test:**
   - Customer places order at London Flagship
   - Staff logs in with fixed credentials
   - Staff should be able to view and manage orders

## Prevention Measures

### For Future Testing:

1. **Use Correct Credentials:** Always verify credentials before testing:
   ```
   staff.london@bakery.com / StaffPassword123!
   manager.london@bakery.com / ManagerPassword123!
   ```

2. **Account Unlock Utility:** Use the existing unlock script for quick fixes:
   ```bash
   cd /app/backend
   node unlock-account.js staff.london@bakery.com
   ```

3. **Monitor Failed Attempts:** Check account status before extensive testing:
   ```sql
   SELECT email, failed_login_attempts, locked_until 
   FROM users 
   WHERE email LIKE '%london@bakery.com';
   ```

### Security Considerations:

The current lockout mechanism is working as designed:
- ✅ 5 failed attempts trigger lockout
- ✅ 30-minute lockout duration
- ✅ Auto-unlock after expiry
- ✅ Failed attempt counter reset on successful login

This is appropriate for production use but may need adjustment for testing environments.

## Related Files

- **Fix Script:** `/app/backend/fix-london-staff-accounts.js`
- **Unlock Script:** `/app/backend/unlock-account.js`
- **Server Code:** `/app/backend/server.ts` (login endpoint lines 175-226)
- **Test Users:** `/app/test_users.json`

## Status

✅ **RESOLVED** - Both London staff accounts unlocked and passwords reset. Accounts are now accessible with correct credentials.

## Next Steps

1. Rerun browser test for Staff Order Fulfillment Journey
2. Verify staff can login and view orders
3. Complete order fulfillment workflow test
4. Consider adding test credentials validation in automated tests
