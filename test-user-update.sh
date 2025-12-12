#!/bin/bash

# Login as admin
echo "Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bakery.com","password":"AdminPassword123!"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Login failed!"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

echo "✓ Logged in successfully"

# Get users list
echo ""
echo "Fetching users..."
USERS_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/users?query=new.staff" \
  -H "Authorization: Bearer $TOKEN")

# Extract the new.staff user
USER_ID=$(echo $USERS_RESPONSE | grep -o '"user_id":"usr_[a-f0-9]*"' | head -1 | cut -d'"' -f4)

if [ -z "$USER_ID" ]; then
  echo "User not found! Creating test user first..."
  
  # Create a test user
  CREATE_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/users" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"email":"new.staff@example.com","password":"TestPassword123!","first_name":"Test","last_name":"Staff","phone_number":"+447700900138","user_type":"staff","marketing_opt_in":false}')
  
  echo "Create response: $CREATE_RESPONSE"
  USER_ID=$(echo $CREATE_RESPONSE | grep -o '"user_id":"usr_[a-f0-9]*"' | cut -d'"' -f4)
  
  if [ -z "$USER_ID" ]; then
    echo "Failed to create user!"
    exit 1
  fi
fi

echo ""
echo "Testing with user: $USER_ID"

# Try to update user role from staff to manager
echo ""
echo "Updating user role from 'staff' to 'manager'..."
UPDATE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PUT "http://localhost:3000/api/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_type":"manager"}')

HTTP_STATUS=$(echo "$UPDATE_RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)
BODY=$(echo "$UPDATE_RESPONSE" | sed '/HTTP_STATUS:/d')

echo ""
echo "HTTP Status: $HTTP_STATUS"
echo "Response Body:"
echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"

# Check if successful
if [ "$HTTP_STATUS" = "200" ] && echo "$BODY" | grep -q '"user_type":"manager"'; then
  echo ""
  echo "✓ SUCCESS: User update endpoint is working!"
  echo "✓ User role successfully updated from 'staff' to 'manager'"
else
  echo ""
  echo "✗ Update failed or returned unexpected response"
  exit 1
fi
