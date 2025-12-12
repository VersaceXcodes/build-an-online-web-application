# Quick Test Reference Guide

## Critical Staff Credentials (VERIFIED WORKING)

### London Flagship Staff

**Staff Account:**
- Email: `staff.london@bakery.com`
- Password: `StaffPassword123!`
- User: James Anderson
- Type: `staff`
- Location: London Flagship
- Status: ✅ UNLOCKED & VERIFIED

**Manager Account:**
- Email: `manager.london@bakery.com`
- Password: `ManagerPassword123!`
- User: Laura Martinez
- Type: `manager`
- Location: London Flagship
- Status: ✅ UNLOCKED & VERIFIED

### Other Test Accounts

**Admin Account:**
- Email: `admin@bakery.com`
- Password: `AdminPassword123!`

**Customer Account:**
- Email: `john.smith@example.com`
- Password: `TestPassword123!`
- User: John Smith

## Quick Account Unlock

If accounts get locked during testing:

```bash
cd /app/backend

# Unlock single account
node unlock-account.js staff.london@bakery.com

# Unlock and reset both London staff accounts
node fix-london-staff-accounts.js

# Verify login works
node test-staff-login.mjs
```

## Staff Order Fulfillment Test Flow

### Step 1: Customer Places Order
- Login as `john.smith@example.com`
- Add products to cart
- Select "London Flagship" location
- Choose "Collection" fulfillment
- Complete payment
- Note the order number (e.g., KK-42517)

### Step 2: Staff Login & View Order
- Login as `staff.london@bakery.com` / `StaffPassword123!`
- Navigate to Staff Dashboard
- View order list filtered by "London Flagship"
- Find the customer's order

### Step 3: Staff Updates Order Status
- Select order
- Update status: `payment_confirmed` → `accepted_in_preparation`
- Update status: `accepted_in_preparation` → `ready_for_collection`
- Customer receives collection code
- Update status: `ready_for_collection` → `collected`

## Common Issues & Solutions

### 🔒 Issue: "Account locked. Please try again in X minutes"

**Root Cause:** 5+ failed login attempts

**Solution:**
```bash
cd /app/backend
node fix-london-staff-accounts.js
```

**Expected Output:**
```
✅ staff.london@bakery.com - UNLOCKED
✅ manager.london@bakery.com - UNLOCKED
```

### ❌ Issue: "Invalid credentials"

**Checklist:**
- ✅ Email: `staff.london@bakery.com` (exact match, case-sensitive)
- ✅ Password: `StaffPassword123!` (includes exclamation mark)
- ✅ No extra spaces or characters
- ✅ Account not locked

**Verify Password:**
```bash
# Test login via API
curl -X POST https://123build-an-online-web-application.launchpulse.ai/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"staff.london@bakery.com","password":"StaffPassword123!","remember_me":false}'
```

## Browser Testing URLs

- **Frontend:** https://123build-an-online-web-application.launchpulse.ai
- **Login:** https://123build-an-online-web-application.launchpulse.ai/login
- **Staff Dashboard:** https://123build-an-online-web-application.launchpulse.ai/staff-dashboard
- **Customer Dashboard:** https://123build-an-online-web-application.launchpulse.ai/dashboard

## Account Security Limits

- **Failed Login Attempts:** 5 attempts before lockout
- **Lockout Duration:** 30 minutes
- **Auto-Unlock:** After lockout period expires
- **Token Expiry:** 7 days (24 hours without remember_me)

## Test Data Reference

**Locations:**
- London Flagship
- Manchester Store
- Birmingham Store

**Order Number Format:**
- Standard: `KK-XXXXX`
- Corporate: `CE-XXXXX`

**Collection Code Format:**
- `COL-XXXX` (4 digits)

## Status Check Commands

```bash
# Check account status in database
cd /app/backend
node -e "import('pg').then(m => { const p = new m.default.Pool({connectionString: process.env.DATABASE_URL, ssl: {rejectUnauthorized: false}}); p.query('SELECT email, user_type, failed_login_attempts, locked_until FROM users WHERE email LIKE \\'%london@bakery.com\\'', (e,r) => {console.table(r.rows); p.end();}); });"

# Test login endpoint
node test-staff-login.mjs

# Expected output:
# ✅ Login successful for staff.london@bakery.com
# ✅ Login successful for manager.london@bakery.com
```

## Fixed Issues Log

### ✅ Staff Account Lockout Fix (Dec 10, 2025)
- **Issue:** Both London staff accounts locked after failed login attempts
- **Solution:** Created fix script to unlock accounts and reset passwords
- **Status:** RESOLVED - Both accounts operational
- **Files:** `fix-london-staff-accounts.js`, `STAFF_ACCOUNT_LOCKOUT_FIX.md`

### ✅ User Role Update Fix (Previous)
- **Issue:** Admins could not update user roles (404 error)
- **Solution:** Added PUT /api/users/:user_id endpoint
- **Status:** RESOLVED
- **File:** `/app/backend/server.ts` line ~2009

