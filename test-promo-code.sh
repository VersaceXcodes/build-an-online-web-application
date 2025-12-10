#!/bin/bash

# Test script to verify promo code discount functionality

API_BASE="https://123build-an-online-web-application.launchpulse.ai"

echo "Testing WELCOME10 promo code validation..."
echo "=========================================="

# Test with €3.50 order (Classic Croissant)
echo ""
echo "Test 1: Validating WELCOME10 for €3.50 order"
curl -X POST "${API_BASE}/api/promo-codes/validate" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "WELCOME10",
    "order_total": 3.50,
    "location_name": "London Flagship"
  }' \
  | jq '.'

echo ""
echo "Expected: is_valid=true, discount_amount=0.35"
echo ""
echo "=========================================="

# Test with €20 order  
echo ""
echo "Test 2: Validating WELCOME10 for €20 order"
curl -X POST "${API_BASE}/api/promo-codes/validate" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "WELCOME10",
    "order_total": 20.00,
    "location_name": "London Flagship"
  }' \
  | jq '.'

echo ""
echo "Expected: is_valid=true, discount_amount=2.00"
echo ""
echo "=========================================="

# Test with invalid code
echo ""
echo "Test 3: Validating invalid code"
curl -X POST "${API_BASE}/api/promo-codes/validate" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "INVALID",
    "order_total": 20.00,
    "location_name": "London Flagship"
  }' \
  | jq '.'

echo ""
echo "Expected: is_valid=false"
echo ""
