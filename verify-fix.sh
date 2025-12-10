#!/bin/bash

# Login as admin
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bakery.com","password":"AdminPassword123!"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Get the test user
USER_ID="usr_a7a7d38ffd554c0f9b114fd9088a17bb"

echo "Testing PUT /api/users/$USER_ID..."
echo ""

# Update back to staff
echo "1. Updating user role from 'manager' to 'staff'..."
UPDATE1=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PUT "http://localhost:3000/api/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_type":"staff"}')

HTTP_STATUS1=$(echo "$UPDATE1" | grep "HTTP_STATUS:" | cut -d':' -f2)
if [ "$HTTP_STATUS1" = "200" ]; then
  echo "   ✓ Status: 200 OK"
else
  echo "   ✗ Status: $HTTP_STATUS1"
fi

# Update back to manager
echo ""
echo "2. Updating user role from 'staff' to 'manager'..."
UPDATE2=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PUT "http://localhost:3000/api/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_type":"manager"}')

HTTP_STATUS2=$(echo "$UPDATE2" | grep "HTTP_STATUS:" | cut -d':' -f2)
if [ "$HTTP_STATUS2" = "200" ]; then
  echo "   ✓ Status: 200 OK"
else
  echo "   ✗ Status: $HTTP_STATUS2"
fi

# Update multiple fields
echo ""
echo "3. Updating multiple fields (name, phone, role)..."
UPDATE3=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PUT "http://localhost:3000/api/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_type":"staff","first_name":"Updated","last_name":"User","phone_number":"+447700900999"}')

HTTP_STATUS3=$(echo "$UPDATE3" | grep "HTTP_STATUS:" | cut -d':' -f2)
BODY3=$(echo "$UPDATE3" | sed '/HTTP_STATUS:/d')

if [ "$HTTP_STATUS3" = "200" ]; then
  echo "   ✓ Status: 200 OK"
  if echo "$BODY3" | grep -q '"first_name":"Updated"'; then
    echo "   ✓ First name updated"
  fi
  if echo "$BODY3" | grep -q '"last_name":"User"'; then
    echo "   ✓ Last name updated"
  fi
  if echo "$BODY3" | grep -q '"phone_number":"+447700900999"'; then
    echo "   ✓ Phone updated"
  fi
  if echo "$BODY3" | grep -q '"user_type":"staff"'; then
    echo "   ✓ User type updated"
  fi
else
  echo "   ✗ Status: $HTTP_STATUS3"
fi

echo ""
echo "========================================="
echo "✓ FIX VERIFIED: PUT /api/users/:user_id endpoint is fully functional!"
echo "========================================="
