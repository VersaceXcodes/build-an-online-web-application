import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testUserUpdate() {
  try {
    // Login as admin to get auth token
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'Admin123!@#'
      })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.token) {
      console.error('Login failed:', loginData);
      return;
    }
    
    const token = loginData.token;
    console.log('✓ Logged in as admin');
    
    // Get list of users to find a test user
    const usersResponse = await fetch(`${BASE_URL}/api/users?limit=5`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const usersData = await usersResponse.json();
    console.log('✓ Fetched users list');
    
    if (usersData.data && usersData.data.length > 0) {
      // Find a staff user or use the first user
      const testUser = usersData.data.find(u => u.user_type === 'staff') || usersData.data[0];
      console.log(`\nTesting with user: ${testUser.email} (${testUser.user_type})`);
      console.log(`User ID: ${testUser.user_id}`);
      
      // Try to update the user's role
      const updateResponse = await fetch(`${BASE_URL}/api/users/${testUser.user_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_type: testUser.user_type === 'staff' ? 'manager' : 'staff',
          first_name: testUser.first_name,
          last_name: testUser.last_name,
          phone_number: testUser.phone_number,
          email: testUser.email,
          account_status: testUser.account_status,
          marketing_opt_in: testUser.marketing_opt_in
        })
      });
      
      console.log(`\nUpdate Response Status: ${updateResponse.status}`);
      
      const updateData = await updateResponse.json();
      console.log('Update Response:', JSON.stringify(updateData, null, 2));
      
      if (updateResponse.ok) {
        console.log('\n✓ SUCCESS: User update endpoint is working!');
        console.log(`✓ User role changed from ${testUser.user_type} to ${updateData.user_type}`);
      } else {
        console.log('\n✗ FAILED: User update returned error');
      }
    }
  } catch (error) {
    console.error('Test error:', error);
  }
}

testUserUpdate();
