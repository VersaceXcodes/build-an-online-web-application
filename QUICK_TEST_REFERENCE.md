# Quick Test Reference - User Role Update Fix

## Issue Fixed
❌ **Before:** Admins could not update user roles - returned 404 error  
✅ **After:** Admins can successfully update user roles and information

## Test Credentials
- **Admin:** admin@bakery.com / AdminPassword123!
- **Test User:** new.staff@example.com (already exists in database)
- **Test User ID:** usr_a7a7d38ffd554c0f9b114fd9088a17bb

## Quick API Test
```bash
# 1. Login as admin
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bakery.com","password":"AdminPassword123!"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 2. Update user role
curl -X PUT "http://localhost:3000/api/users/usr_a7a7d38ffd554c0f9b114fd9088a17bb" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_type":"manager"}'
```

## Expected Behavior
1. Navigate to: https://123build-an-online-web-application.launchpulse.ai/admin/users
2. Login as admin
3. Search for "new.staff@example.com"
4. Click edit button
5. Change role from "Staff" to "Manager"
6. Click Save
7. ✅ Should see success message
8. ✅ Role should update to "Manager"

## Network Request Details
- **Endpoint:** PUT /api/users/{user_id}
- **Status:** 200 OK (was 404 before fix)
- **Response:** Returns updated user object with new role

## Verification
Run: `./verify-fix.sh` to test all update scenarios

## Modified Files
- `/app/backend/server.ts` - Added PUT /api/users/:user_id endpoint (line ~2009)

