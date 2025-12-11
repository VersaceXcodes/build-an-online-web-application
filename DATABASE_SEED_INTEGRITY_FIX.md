# Database Seed Data Integrity Fix

## Issue Summary
Browser testing (December 11, 2025) revealed database count mismatches:
- **Users**: Expected 15, Observed 15 ✓ (MATCH)
- **Products**: Expected 20, Observed 34 (MISMATCH - but intentional, see below)
- **Orders**: Expected 12, Observed 21 (MISMATCH - 9 extra orders from testing)

## Root Cause Analysis

### Products (34 vs 20) - INTENTIONAL
The product count mismatch is **correct and expected**:
- Original seed data (`db.sql`) contains 20 products
- On December 11, 2024, the menu was officially updated to 34 products via `update-kake-menu.mjs`
- The update script archives old products (`is_archived = true`) and creates 34 new products
- Frontend displays only non-archived products: 34 products
- See `KAKE_MENU_UPDATE_SUMMARY.md` for complete details
- **Action**: Test expectations should be updated to expect 34 products (not 20)

### Orders (21 vs 12) - DATA POLLUTION
The order count mismatch indicates **database pollution**:
- Seed data contains 12 orders
- Current database has 21 orders (9 extra)
- Extra orders were created during previous testing/development sessions
- **Action**: Database needs to be reset to clean seed state before running integrity tests

### Users (15 vs 15) - CORRECT
User count matches seed data expectations.

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
1. Drop all tables (CASCADE)
2. Recreate schema from `db.sql`
3. Reseed all data
4. Verify counts:
   - Users: 15
   - Products: 20 (from seed, or 34 if menu update was run)
   - Orders: 12

**Note**: After reset, if you need the updated 34-product menu, run:
```bash
cd backend
node update-kake-menu.mjs
```

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

### Products
- **Seed Data**: 20 products (prod_001 to prod_020)
- **Current Menu**: 34 products (if `update-kake-menu.mjs` has been run)
  - 6 Desserts, 3 Acai Bowls, 2 Strawberry Items
  - 6 Hot Drinks, 5 Hot Chocolates
  - 4 Lemonades, 4 Vithit Drinks, 2 Snapple Drinks
  - 2 Other (Water, Crookie)
- **Categories**: pastries, cakes
- **Important**: Use `is_archived = false` filter to count active products

## Verification

After reset, verify counts:
```bash
# From psql or database client
SELECT COUNT(*) FROM users;    -- Should be 15
SELECT COUNT(*) FROM orders;   -- Should be 12  
SELECT COUNT(*) FROM products WHERE is_archived = false; -- Should be 20 (or 34 after menu update)
```

Or use the verification script:
```bash
cd backend
node -e "
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const client = await pool.connect();
const users = await client.query('SELECT COUNT(*) FROM users');
const products = await client.query('SELECT COUNT(*) FROM products WHERE is_archived = false');
const orders = await client.query('SELECT COUNT(*) FROM orders');
console.log('✓ Users:', users.rows[0].count);
console.log('✓ Products (active):', products.rows[0].count);
console.log('✓ Orders:', orders.rows[0].count);
client.release();
await pool.end();
"
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

## Current Database State (December 2025)

### Correct Expected Counts for Tests
```json
{
  "users": 15,
  "products": 34,
  "orders": 12
}
```

### Why Products = 34 (not 20)
The menu was officially updated in December 2024 via `update-kake-menu.mjs`. This is the production menu and tests should expect 34 products, not the original seed data count of 20.

### Resetting for Tests
**Before running browser seed integrity tests:**
```bash
cd /app/backend
npm run db:reset
node update-kake-menu.mjs  # Apply current menu (34 products)
```

## Resolution Summary

✅ **Products (34 observed)**: CORRECT - Menu was updated, test expectations need updating
✅ **Orders (21 observed)**: FIXED - Reset database to clean seed state (12 orders)
✅ **Users (15 observed)**: CORRECT - Matches seed data

## Maintenance Notes

When updating seed data:
1. Modify `/app/backend/db.sql` for base seed data
2. Update expected counts in browser tests to match CURRENT state (not just seed)
3. Update `/app/test_users.json` if user structure changes
4. Run `npm run db:reset` to apply changes
5. Run menu update script if needed: `node update-kake-menu.mjs`

## Related Documentation
- `/app/KAKE_MENU_UPDATE_SUMMARY.md` - Details on the 34-product menu
- `/app/backend/update-kake-menu.mjs` - Menu update script
- `/app/backend/db.sql` - Original seed data (20 products)
