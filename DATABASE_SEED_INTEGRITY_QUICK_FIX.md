# Database Seed Integrity - Quick Fix Guide

## TL;DR

### Issue
Browser test failed with:
- **Products**: Expected 20, got 34 ❌
- **Orders**: Expected 12, got 21 ❌

### Resolution
1. ✅ Products: Test expectation was outdated - should expect **34** (not 20)
2. ✅ Orders: Database was reset - now has correct **12** orders
3. ✅ Database is now in correct state for testing

## Quick Commands

### Reset Database Before Tests
```bash
cd /app
./reset-test-db.sh
```

This automatically:
- Resets to seed data
- Applies current 34-product menu
- Verifies counts (15 users, 34 products, 12 orders)

### Verify Database State
```bash
cd /app/backend
node verify-counts.mjs
```

Expected output:
```
✓ Users: 15
✓ Products (active): 34
✓ Orders: 12
```

## Updated Test Expectations

### OLD (Incorrect)
```json
{
  "users": 15,
  "products": 20,
  "orders": 12
}
```

### NEW (Correct)
```json
{
  "users": 15,
  "products": 34,
  "orders": 12
}
```

## Why 34 Products?

The menu was officially updated from 20 to 34 products in December 2024. The test was checking against outdated seed data.

**Current Menu**: 34 products
- 6 Desserts, 3 Acai Bowls, 2 Strawberry Items
- 6 Hot Drinks, 5 Hot Chocolates
- 4 Lemonades, 4 Vithit, 2 Snapple
- 2 Other (Water, Crookie)

See `KAKE_MENU_UPDATE_SUMMARY.md` for details.

## Test Checklist

Before running seed integrity tests:
- [ ] Run `./reset-test-db.sh`
- [ ] Verify database counts match: 15 / 34 / 12
- [ ] Update test expectations to expect 34 products
- [ ] Run tests

## Files
- `/app/reset-test-db.sh` - Reset script
- `/app/DATABASE_SEED_INTEGRITY_TEST_RESOLUTION.md` - Full details
- `/app/KAKE_MENU_UPDATE_SUMMARY.md` - Menu update info
