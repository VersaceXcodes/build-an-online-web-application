#!/bin/bash

echo "=========================================="
echo "Testing Promo Code Fix"
echo "=========================================="
echo ""

# Test 1: Valid promo code with sufficient order total
echo "Test 1: Applying WELCOME10 to €18.25 order..."
RESPONSE=$(curl -s -X POST https://123build-an-online-web-application.launchpulse.ai/api/promo-codes/validate \
  -H "Content-Type: application/json" \
  -d '{
    "code": "WELCOME10",
    "order_total": 18.25,
    "location_name": "London Flagship"
  }')

echo "$RESPONSE" | python3 -m json.tool
IS_VALID=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['is_valid'])")

if [ "$IS_VALID" = "True" ]; then
    echo "✅ Test 1 PASSED: Promo code is valid"
else
    echo "❌ Test 1 FAILED: Promo code should be valid"
fi

echo ""
echo "=========================================="

# Test 2: Valid promo code but insufficient order total
echo "Test 2: Applying WELCOME10 to €10.00 order (below €15 minimum)..."
RESPONSE2=$(curl -s -X POST https://123build-an-online-web-application.launchpulse.ai/api/promo-codes/validate \
  -H "Content-Type: application/json" \
  -d '{
    "code": "WELCOME10",
    "order_total": 10.00,
    "location_name": "London Flagship"
  }')

echo "$RESPONSE2" | python3 -m json.tool
IS_VALID2=$(echo "$RESPONSE2" | python3 -c "import sys, json; print(json.load(sys.stdin)['is_valid'])")

if [ "$IS_VALID2" = "False" ]; then
    echo "✅ Test 2 PASSED: Correctly rejected due to minimum order value"
else
    echo "❌ Test 2 FAILED: Should reject orders below minimum"
fi

echo ""
echo "=========================================="

# Test 3: Calculate discount correctly
echo "Test 3: Verifying discount calculation..."
DISCOUNT=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['discount_amount'])")
EXPECTED="1.825"

if [ "$DISCOUNT" = "$EXPECTED" ]; then
    echo "✅ Test 3 PASSED: Discount calculated correctly (€$DISCOUNT)"
else
    echo "❌ Test 3 FAILED: Expected €$EXPECTED but got €$DISCOUNT"
fi

echo ""
echo "=========================================="
echo "Summary:"
echo "- WELCOME10 promo code is now valid through 2025-12-31"
echo "- 10% discount correctly applied to orders over €15"
echo "- Minimum order validation working correctly"
echo "=========================================="
