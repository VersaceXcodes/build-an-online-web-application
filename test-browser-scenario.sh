#!/bin/bash
echo "========================================="
echo "Testing Browser Scenario:"
echo "Admin editing user role Staff → Manager"
echo "========================================="
echo ""

# Login as admin
echo "Step 1: Admin login..."
LOGIN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bakery.com","password":"AdminPassword123!"}')

TOKEN=$(echo $LOGIN | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi
echo "   ✓ Admin logged in successfully"

# Search for user
echo ""
echo "Step 2: Search for user 'new.staff@example.com'..."
SEARCH=$(curl -s "http://localhost:3000/api/users?query=new.staff@example.com&account_status=active&sort_by=created_at&sort_order=desc&limit=20&offset=0" \
  -H "Authorization: Bearer $TOKEN")

USER_ID=$(echo $SEARCH | grep -o '"user_id":"usr_[a-f0-9]*"' | head -1 | cut -d'"' -f4)
CURRENT_ROLE=$(echo $SEARCH | grep -o '"user_type":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$USER_ID" ]; then
  echo "❌ User not found"
  exit 1
fi
echo "   ✓ Found user: $USER_ID"
echo "   ✓ Current role: $CURRENT_ROLE"

# Click edit and change role
echo ""
echo "Step 3: Admin clicks Edit and changes role to 'Manager'..."

# This simulates the exact request the browser makes
UPDATE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PUT "http://localhost:3000/api/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id":"'$USER_ID'",
    "email":"new.staff@example.com",
    "first_name":"Test",
    "last_name":"Staff",
    "phone_number":"+447700900138",
    "user_type":"manager",
    "account_status":"active",
    "marketing_opt_in":false
  }')

HTTP_STATUS=$(echo "$UPDATE" | grep "HTTP_STATUS:" | cut -d':' -f2)
BODY=$(echo "$UPDATE" | sed '/HTTP_STATUS:/d')

echo "   Request sent to: PUT /api/users/$USER_ID"
echo "   Response status: $HTTP_STATUS"

if [ "$HTTP_STATUS" = "200" ]; then
  echo "   ✓ HTTP 200 OK received"
  
  NEW_ROLE=$(echo "$BODY" | grep -o '"user_type":"[^"]*"' | cut -d'"' -f4)
  if [ "$NEW_ROLE" = "manager" ]; then
    echo "   ✓ Role successfully changed to: $NEW_ROLE"
  else
    echo "   ❌ Role not updated correctly: $NEW_ROLE"
    exit 1
  fi
else
  echo "   ❌ Request failed with status: $HTTP_STATUS"
  echo "   Response: $BODY"
  exit 1
fi

echo ""
echo "Step 4: Verify the change persisted..."
VERIFY=$(curl -s "http://localhost:3000/api/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN")

VERIFIED_ROLE=$(echo "$VERIFY" | grep -o '"user_type":"[^"]*"' | cut -d'"' -f4)
if [ "$VERIFIED_ROLE" = "manager" ]; then
  echo "   ✓ Verified: User role is now 'manager'"
else
  echo "   ❌ Verification failed: Role is $VERIFIED_ROLE"
  exit 1
fi

echo ""
echo "========================================="
echo "✅ SUCCESS: Browser scenario test passed!"
echo "========================================="
echo ""
echo "The admin can now successfully:"
echo "  • Search for users"
echo "  • Click edit on a user"
echo "  • Change their role"  
echo "  • Save the changes"
echo "  • See the updated role"
echo ""
echo "Fix is ready for browser testing!"
