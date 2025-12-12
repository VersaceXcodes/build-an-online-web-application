# Order History Display Fix

## Problem
Newly placed orders were not appearing in the "My Orders" tab on the Customer Dashboard (My Account page), even though the API was correctly returning them.

## Root Cause
The order status filter dropdown in the Orders tab only included a limited set of status options:
- `completed`
- `preparing` (labeled as "In Progress")
- `cancelled`

However, newly created orders have the status `payment_confirmed` (after payment is completed), which was not included in the filter options. Additionally, the status badge mapping function was missing several order statuses used in the order workflow.

## Solution
Updated `/app/vitereact/src/components/views/UV_CustomerDashboard.tsx`:

### 1. Expanded Status Filter Dropdown (lines 1000-1012)
Added all possible order statuses to the filter dropdown:
- `payment_confirmed` → "Confirmed"
- `paid_awaiting_confirmation` → "Awaiting Confirmation"
- `accepted_in_preparation` → "In Preparation"
- `ready_for_collection` → "Ready"
- `out_for_delivery` → "Out for Delivery"
- `collected` → "Collected"
- `delivered` → "Delivered"
- `completed` → "Completed"
- `cancelled` → "Cancelled"

### 2. Updated Status Badge Function (lines 554-564)
Added missing status mappings to the `getOrderStatusBadge` function:
- `paid_awaiting_confirmation` → Blue badge: "Awaiting Confirmation"
- `accepted_in_preparation` → Yellow badge: "In Preparation"
- `collected` → Green badge: "Collected"
- `delivered` → Green badge: "Delivered"

## Testing
The fix ensures that:
1. Orders with `payment_confirmed` status (newly placed orders) appear in the order history
2. All order statuses throughout the order lifecycle are properly displayed with appropriate labels and colors
3. Customers can filter orders by any status in the workflow

## Files Modified
- `/app/vitereact/src/components/views/UV_CustomerDashboard.tsx`

## Order Status Workflow
The complete order status flow is now properly supported:
1. `pending_payment` → Order created, awaiting payment
2. `paid_awaiting_confirmation` → Payment received, order needs confirmation
3. `payment_confirmed` → Payment confirmed, order accepted
4. `accepted_in_preparation` → Order is being prepared
5. `ready_for_collection` / `out_for_delivery` → Order ready
6. `collected` / `delivered` → Order fulfilled
7. `completed` → Order completed
8. `cancelled` → Order cancelled
