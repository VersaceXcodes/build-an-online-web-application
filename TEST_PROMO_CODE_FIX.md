# Test Plan: Promo Code Discount Fix

## Test Case: Checkout Step 2 - Apply Promo Code

### Prerequisites
- Backend server is running
- Database has WELCOME10 promo code (10% discount)
- User is logged in
- Cart has items totaling €17.25

### Test Steps

1. **Navigate to Checkout**
   - Add products to cart (e.g., 2x Classic Croissant @ €3.50 = €7.00 + other items)
   - Ensure cart total is €17.25
   - Click "Proceed to Checkout"

2. **Complete Step 1 (Order Details)**
   - Enter customer information
   - Select fulfillment method (Collection or Delivery)
   - Click "Continue to Payment"

3. **Apply Promo Code (Step 2)**
   - Locate the "Have a promo code?" section
   - Enter: `WELCOME10`
   - Click "Apply"

### Expected Results

✅ **UI Feedback:**
- Success toast appears: "Promo code applied successfully"
- Green checkmark icon appears next to promo code
- Promo code displays: "WELCOME10"

✅ **Price Breakdown:**
- Subtotal: €17.25
- Promo Code (WELCOME10): **-€1.73** (shown in green)
- Total: **€15.52**

✅ **Cart Totals Object:**
```javascript
{
  subtotal: 17.25,
  delivery_fee: 0,
  discount: 1.73,
  total: 15.52
}
```

✅ **Applied Discounts Object:**
```javascript
{
  loyalty_points_used: 0,
  promo_code: "WELCOME10",
  promo_code_discount: 1.73
}
```

### Actual Results (Before Fix)
❌ Subtotal: €17.25
❌ Promo Code (WELCOME10): "Applied" (no amount shown)
❌ Total: **€17.25** (discount not deducted)
❌ `promo_code_discount` was undefined or 0

### Actual Results (After Fix)
✅ Subtotal: €17.25
✅ Promo Code (WELCOME10): **-€1.73**
✅ Total: **€15.52**
✅ `promo_code_discount: 1.73`

## Additional Test Cases

### Test Case 2: Remove Promo Code
1. Apply promo code "WELCOME10"
2. Verify discount is applied (€1.73)
3. Click "Remove" button
4. **Expected:** 
   - Promo code removed
   - Discount reset to 0
   - Total returns to €17.25
   - Toast: "Promo code removed"

### Test Case 3: Invalid Promo Code
1. Enter invalid code: "INVALID123"
2. Click "Apply"
3. **Expected:**
   - Error message: "Invalid promo code"
   - No discount applied
   - Total remains €17.25

### Test Case 4: Expired Promo Code
1. Enter expired code (if available in database)
2. Click "Apply"
3. **Expected:**
   - Error message: "Promo code expired"
   - No discount applied

### Test Case 5: Minimum Order Not Met
1. Clear cart
2. Add single item (€3.50)
3. Try to apply "WELCOME10" (if minimum order > €3.50)
4. **Expected:**
   - Error message: "Minimum order €X.XX required"
   - No discount applied

### Test Case 6: Cart Panel Promo Code
1. Open cart slide panel
2. Enter "WELCOME10" in promo code field
3. Click "Apply"
4. **Expected:**
   - Success toast: "Promo code applied! €1.73 discount"
   - Green badge shows "WELCOME10"
   - Discount: -€1.73
   - Total updated: €15.52

### Test Case 7: Order Placement with Promo Code
1. Apply promo code "WELCOME10"
2. Complete payment details
3. Click "Place Order & Pay €15.52"
4. **Expected:**
   - Order created with:
     - `promo_code: "WELCOME10"`
     - `discount_amount: 1.73`
     - `total_amount: 15.52`
   - Order confirmation shows correct total

## API Validation

### Test Backend Endpoint
```bash
curl -X POST http://localhost:3000/api/promo-codes/validate \
  -H "Content-Type: application/json" \
  -d '{
    "code": "WELCOME10",
    "order_total": 17.25,
    "location_name": "London Flagship"
  }'
```

**Expected Response:**
```json
{
  "is_valid": true,
  "discount_amount": 1.725,
  "message": "Promo code applied successfully"
}
```

## Verification Checklist

- [x] Frontend stores promo code AND discount amount
- [x] `calculate_cart_totals()` includes promo discount
- [x] Order summary displays discount amount (not just "Applied")
- [x] Total is correctly reduced by discount
- [x] Remove promo code resets discount to 0
- [x] Cart panel also applies discount correctly
- [x] TypeScript types updated for new field
- [x] Persist configuration includes new field
- [x] Build succeeds without errors

## Known Promo Codes in Database

| Code | Type | Value | Min Order | Status |
|------|------|-------|-----------|--------|
| WELCOME10 | percentage | 10% | €10 | Active |
| SUMMER20 | percentage | 20% | €25 | Active |
| FREESHIP | delivery | Free | €15 | Active |

## Fix Verification

To verify the fix is working:

1. Check browser console for cart state:
```javascript
// In browser console:
JSON.parse(localStorage.getItem('kake-app-storage')).state.cart_state.applied_discounts
// Should show: { loyalty_points_used: 0, promo_code: "WELCOME10", promo_code_discount: 1.73 }
```

2. Check network response:
   - Open DevTools → Network tab
   - Apply promo code
   - Look for POST to `/api/promo-codes/validate`
   - Response should include `discount_amount: 1.725`

3. Check Zustand store:
   - Install React DevTools
   - Find Zustand store state
   - Verify `cart_state.applied_discounts.promo_code_discount` has value

## Regression Tests

Ensure these still work:
- [ ] Loyalty points discount still applies correctly
- [ ] Delivery fee calculation unaffected
- [ ] Multiple discounts (loyalty + promo) work together
- [ ] Cart persistence across page refresh
- [ ] Checkout flow completes successfully
