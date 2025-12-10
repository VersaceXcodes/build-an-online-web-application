# Database Seed Data Integrity Fix

## Issue Summary
Browser testing revealed database count mismatches:
- **Users**: Expected 15, Found 19 (4 extra users)
- **Orders**: Expected 12, Found 30 (18 extra orders)  
- **Products**: Expected 20, Found 20 ✓

## Root Cause
The application database accumulates data from:
1. **Seed data** (static): 15 users, 12 orders, 20 products
2. **Live data** (dynamic): User registrations and orders created during runtime

Browser tests validate against seed data expectations, but the live database continues to grow, causing test failures.

## Solution
Created a database reset mechanism to restore the database to its clean seed state.

### New Files Created

#### `/app/backend/reset-db.js`
A script that:
- Connects to the PostgreSQL database
- Drops all existing tables
- Recreates schema from `db.sql`
- Reseeds all data
- Verifies final counts

### Updated Files

#### `/app/backend/package.json`
Added new npm scripts:
```json
"db:init": "node initdb.js",
"db:reset": "node reset-db.js"
```

## Usage

### Reset Database to Clean State
```bash
cd backend
npm run db:reset
```

This will:
1. Drop all tables
2. Recreate schema
3. Reseed data
4. Verify counts:
   - Users: 15
   - Orders: 12
   - Products: 20

### Initialize Fresh Database
```bash
cd backend
npm run db:init
```

## When to Reset the Database

**Before running browser tests** - Always reset the database to ensure consistent test data:
```bash
cd backend && npm run db:reset && cd ..
# Then run your browser tests
```

**After development/testing** - Reset to clean state:
```bash
cd backend && npm run db:reset
```

## Expected Seed Data

### Users (15 total)
- **Customers (10)**: user_001 to user_005, user_010 to user_012, user_015
- **Staff (3)**: user_008, user_009, user_014
- **Managers (2)**: user_007, user_013  
- **Admins (1)**: user_006

### Orders (12 total)
- **Order IDs**: order_001 to order_012
- **Order Numbers**: ORD-2024-0001 to ORD-2024-0012
- **Statuses**: Mix of completed, in_progress, ready_for_collection, pending_payment

### Products (20 total)
- **Product IDs**: prod_001 to prod_020
- **Categories**: pastries, breads, cakes, corporate
- **Featured**: 6 products marked as featured

## Verification

After reset, verify counts:
```bash
# From psql or database client
SELECT COUNT(*) FROM users;    -- Should be 15
SELECT COUNT(*) FROM orders;   -- Should be 12  
SELECT COUNT(*) FROM products; -- Should be 20
```

## Technical Details

### Database Connection
- Uses environment variables from `.env`
- Falls back to hardcoded credentials if needed
- SSL enabled for Neon/cloud databases

### Transaction Safety
- All operations wrapped in BEGIN/COMMIT
- Automatic ROLLBACK on errors
- Progress logging for large operations

### Error Handling
- Ignores "does not exist" errors during DROP operations
- Logs warnings for other issues
- Exits with error code 1 on failure

## Testing Impact

This fix ensures:
✓ Consistent test data across runs
✓ No false positives from accumulated data
✓ Reliable browser test validation
✓ Easy database state management

## Related Files
- `/app/backend/db.sql` - Seed data definition
- `/app/backend/initdb.js` - Initial database setup
- `/app/backend/reset-db.js` - Reset script (new)
- `/app/backend/package.json` - Updated with new scripts
- `/app/test_users.json` - Reference for seed user accounts

## Maintenance Notes

When updating seed data:
1. Modify `/app/backend/db.sql`
2. Update expected counts in browser tests
3. Update `/app/test_users.json` if user structure changes
4. Run `npm run db:reset` to apply changes
