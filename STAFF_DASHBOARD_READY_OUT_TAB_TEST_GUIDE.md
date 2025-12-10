# Staff Dashboard "Ready/Out" Tab - Test Guide

## Quick Test Steps

### Prerequisites
- Use staff login credentials: `staff.london@bakery.com` / `StaffPassword123!`
- Ensure there are orders in "Ready for Collection" status (dashboard should show "Ready 4" or similar)

### Test Case 1: Tab Switching
1. Log in as staff user
2. Click "Ready/Out" tab (should be index 17 or the 3rd tab)
3. **Expected:** Order list updates to show orders with status "Ready for Pickup" or "Out for Delivery"
4. **Expected:** Tab is visually highlighted (blue underline and text)
5. **Expected:** URL shows `?status=ready_out`

### Test Case 2: Page Refresh Persistence
1. While on "Ready/Out" tab, refresh the page (F5 or Ctrl+R)
2. **Expected:** After reload, "Ready/Out" tab remains selected
3. **Expected:** Order list still shows ready/out orders
4. **Expected:** URL still contains `?status=ready_out`

### Test Case 3: Order Workflow
1. Go to "Awaiting Confirmation" tab
2. Click "Accept" on an order
3. **Expected:** Order disappears from this list
4. Go to "In Preparation" tab
5. **Expected:** Order appears in this list
6. Click "Mark Ready" (for collection orders)
7. **Expected:** Order disappears from this list
8. Go to "Ready/Out" tab
9. **Expected:** Order appears in this list with "Ready for Pickup" status
10. Click "Complete" on the order
11. **Expected:** Order disappears from this list
12. Go to "Completed Today" tab
13. **Expected:** Order appears in this list

### Test Case 4: Mixed Status Display
1. Navigate to "Ready/Out" tab
2. **Expected:** Tab shows BOTH orders with status:
   - "ready_for_collection" (displayed as "Ready for Pickup")
   - "out_for_delivery" (displayed as "Out for Delivery")
3. Verify count badge on tab matches total of both statuses

### Test Case 5: Direct URL Access
1. Copy URL when on "Ready/Out" tab: `...?status=ready_out`
2. Open new browser tab/window
3. Paste URL and navigate
4. **Expected:** Page loads with "Ready/Out" tab selected
5. **Expected:** Shows correct ready/out orders

## Success Criteria

✅ **PASS** if all 5 test cases work as expected  
❌ **FAIL** if clicking "Ready/Out" tab shows "Awaiting Confirmation" orders  
❌ **FAIL** if page refresh loses tab selection  
❌ **FAIL** if URL doesn't update to `?status=ready_out`

## Known Behavior

- The "Ready/Out" tab shows combined count from both "Ready for Collection" (ShoppingBag icon) and "Out for Delivery" (Truck icon)
- Auto-refresh occurs every 30 seconds to update order counts
- Late orders show with red border and "LATE" badge

## Files Modified
- `/app/vitereact/src/components/views/UV_StaffDashboard.tsx`

## Build Status
✅ Frontend built successfully and deployed to `/app/backend/public/`

## Date
December 10, 2025
