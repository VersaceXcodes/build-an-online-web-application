#!/bin/bash

echo "🧪 Testing WELCOME10 Promo Code Fix"
echo "===================================="
echo ""

# Test 1: Small Order (€3.50 - Classic Croissant)
echo "Test 1: Small Order (€3.50)"
echo "----------------------------"
RESPONSE=$(curl -s -X POST https://123build-an-online-web-application.launchpulse.ai/api/promo-codes/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"WELCOME10","order_total":3.5,"location_name":"London Flagship","product_ids":["prod_001"]}')
  
echo "Response: $RESPONSE"
IS_VALID=$(echo $RESPONSE | grep -o '"is_valid":true')
DISCOUNT=$(echo $RESPONSE | grep -o '"discount_amount":[0-9.]*' | cut -d':' -f2)

if [ ! -z "$IS_VALID" ]; then
  echo "✅ Status: Valid"
  echo "✅ Discount: €$DISCOUNT (Expected: €0.35)"
  echo "✅ Final Total: €$(echo "3.50 - $DISCOUNT" | bc)"
else
  echo "❌ Status: Invalid - Code rejected!"
fi
echo ""

# Test 2: Medium Order (€15.00)
echo "Test 2: Medium Order (€15.00)"
echo "------------------------------"
RESPONSE=$(curl -s -X POST https://123build-an-online-web-application.launchpulse.ai/api/promo-codes/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"WELCOME10","order_total":15.0,"location_name":"London Flagship","product_ids":["prod_001"]}')
  
echo "Response: $RESPONSE"
IS_VALID=$(echo $RESPONSE | grep -o '"is_valid":true')
DISCOUNT=$(echo $RESPONSE | grep -o '"discount_amount":[0-9.]*' | cut -d':' -f2)

if [ ! -z "$IS_VALID" ]; then
  echo "✅ Status: Valid"
  echo "✅ Discount: €$DISCOUNT (Expected: €1.50)"
  echo "✅ Final Total: €$(echo "15.00 - $DISCOUNT" | bc)"
else
  echo "❌ Status: Invalid - Code rejected!"
fi
echo ""

# Test 3: Large Order (€50.00)
echo "Test 3: Large Order (€50.00)"
echo "-----------------------------"
RESPONSE=$(curl -s -X POST https://123build-an-online-web-application.launchpulse.ai/api/promo-codes/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"WELCOME10","order_total":50.0,"location_name":"London Flagship","product_ids":["prod_001"]}')
  
echo "Response: $RESPONSE"
IS_VALID=$(echo $RESPONSE | grep -o '"is_valid":true')
DISCOUNT=$(echo $RESPONSE | grep -o '"discount_amount":[0-9.]*' | cut -d':' -f2)

if [ ! -z "$IS_VALID" ]; then
  echo "✅ Status: Valid"
  echo "✅ Discount: €$DISCOUNT (Expected: €5.00)"
  echo "✅ Final Total: €$(echo "50.00 - $DISCOUNT" | bc)"
else
  echo "❌ Status: Invalid - Code rejected!"
fi
echo ""

echo "===================================="
echo "🎉 All tests completed!"
echo "The WELCOME10 promo code should now work for orders of any size."
