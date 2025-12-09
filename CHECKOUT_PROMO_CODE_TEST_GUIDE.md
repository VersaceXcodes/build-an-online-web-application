# Checkout Promo Code Test Guide

## Test Case: checkout-004 - Checkout Step 2 - Apply Promo Code

### Issue Resolution Summary
✅ **FIXED** - The promo code input field and Apply button have been added to the Checkout Step 2 (Payment) page.

### Available Test Promo Codes

The following promo codes are available in the database for testing:

1. **WELCOME10**
   - Type: Percentage discount
   - Value: 10% off
   - Minimum order: €15.00
   - Valid: Jan 1, 2024 - Dec 31, 2024
   - Status: Active
   - Usage: 45 times used (no limit)

2. **CORPORATE10**
   - Type: Percentage discount
   - Value: 10% off
   - Minimum order: €50.00
   - Applicable to: Corporate products only (prod_017, prod_018)
   - Valid: Jan 1, 2024 - Dec 31, 2024
   - Status: Active

3. **SAVE10**
   - Type: Fixed amount
   - Value: €10.00 off
   - Minimum order: €20.00
   - Valid: Jan 1, 2024 - Jan 31, 2024
   - Usage limit: 100 (1 used)
   - Status: Active

4. **FREEDELIV**
   - Type: Free delivery
   - Value: Waives delivery fee
   - Minimum order: €15.00
   - Valid: Jan 10, 2024 - Jan 20, 2024
   - Usage limit: 200 (67 used)
   - Status: Active

### Test Steps for WELCOME10

#### Prerequisites
1. Have at least €15.00 worth of items in cart (to meet minimum order requirement)
2. Be logged in as a test user (e.g., john.smith@example.com)
3. Have selected a location (e.g., London Flagship)

#### Test Flow
1. **Navigate to Cart**
   - Add items totaling at least €15.00
   - Example: Add 5x Classic Croissant (€3.50 each = €17.50)

2. **Proceed to Checkout Step 1**
   - Fill in customer details:
     - Name: John Smith
     - Email: john.smith@example.com
     - Phone: +447700900123
   - Select fulfillment method: Collection or Delivery
   - Click "Continue to Payment"

3. **Checkout Step 2 - Apply Promo Code**
   - Scroll to "Order Summary" section on the right
   - Locate "Have a promo code?" section
   - Enter promo code: `WELCOME10`
   - Click "Apply" button
   - ✅ Verify success message appears
   - ✅ Verify discount is applied (10% off subtotal)
   - ✅ Verify total is recalculated
   - ✅ Verify promo code appears in summary with green checkmark

4. **Complete Order**
   - Fill in payment details (test card)
   - Click "Place Order"
   - ✅ Verify order confirmation includes applied discount

### UI Elements Added

#### Promo Code Input Section
Located in the Order Summary (right column), after cart items and before price breakdown:

```
┌─────────────────────────────────────┐
│ Have a promo code?                  │
│                                     │
│ ┌──────────────────┐  ┌─────────┐ │
│ │ Enter code       │  │ Apply   │ │
│ └──────────────────┘  └─────────┘ │
└─────────────────────────────────────┘
```

#### Applied Promo Code Display
When a promo code is applied:

```
┌─────────────────────────────────────┐
│ Have a promo code?                  │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ✓ WELCOME10            Remove  │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### API Integration

The promo code validation uses the following endpoint:

**Endpoint**: `POST /api/promo-codes/validate`

**Request Body**:
```json
{
  "code": "WELCOME10",
  "order_total": 17.50,
  "location_name": "London Flagship"
}
```

**Success Response**:
```json
{
  "is_valid": true,
  "discount_amount": 1.75,
  "message": "Promo code applied successfully"
}
```

**Error Response** (Invalid code):
```json
{
  "is_valid": false,
  "discount_amount": 0,
  "message": "Invalid promo code"
}
```

**Error Response** (Minimum not met):
```json
{
  "is_valid": false,
  "discount_amount": 0,
  "message": "Minimum order €15.00 required"
}
```

### Test Validation Checklist

- [x] Promo code input field is visible on Step 2
- [x] Input field converts text to uppercase
- [x] Apply button is present and functional
- [x] Apply button is disabled when input is empty
- [x] Loading state shown during validation
- [x] Success message displayed when valid
- [x] Error message displayed when invalid
- [x] Discount reflected in order totals
- [x] Applied code shown with green checkmark
- [x] Remove button removes the promo code
- [x] Promo code persists in Zustand store
- [x] Promo code included in order creation

### Example Calculations

**Cart with €17.50 subtotal + WELCOME10 (10% off)**:
```
Subtotal:        €17.50
Discount (10%):  -€1.75
----------------
New Total:       €15.75
```

**Cart with €17.50 subtotal + Delivery €3.99 + WELCOME10**:
```
Subtotal:        €17.50
Delivery Fee:    €3.99
Discount (10%):  -€1.75
----------------
Total:           €19.74
```

### Browser Test Automation

The fix addresses the automated browser test requirements:

1. ✅ Element can be located by test selectors
2. ✅ Input field accepts text input
3. ✅ Apply button can be clicked
4. ✅ Success/error feedback is visible
5. ✅ Discount updates are reflected in DOM
6. ✅ No console errors during interaction

### Additional Notes

- The promo code functionality was already working in Cart Panel and Checkout Step 1
- This fix brings consistency to Step 2 (Payment page)
- The same Zustand store actions are used across all components
- Promo codes are validated server-side for security
- The discount calculation happens on the backend during order creation
- Applied promo codes persist through the checkout flow via Zustand persistence

### Related Files

- Frontend: `/app/vitereact/src/components/views/UV_Checkout_Step2.tsx`
- Store: `/app/vitereact/src/store/main.tsx`
- Backend: `/app/backend/server.ts` (line 1399 - promo validation endpoint)
- Database: `/app/backend/db.sql` (promo_codes table and seed data)
