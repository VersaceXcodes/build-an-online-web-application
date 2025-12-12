#!/usr/bin/env node

/**
 * Test script to verify London staff account logins
 */

async function testLogin(email, password) {
  try {
    const response = await fetch('https://123build-an-online-web-application.launchpulse.ai/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, remember_me: false })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Login successful for ${email}`);
      console.log(`   User: ${data.user.first_name} ${data.user.last_name}`);
      console.log(`   User Type: ${data.user.user_type}`);
      console.log(`   Assigned Locations: ${data.user.assigned_locations?.join(', ') || 'None'}`);
      console.log(`   Token: ${data.token.substring(0, 20)}...`);
      return true;
    } else {
      console.log(`❌ Login failed for ${email}`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${data.message}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error testing ${email}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('\n🔐 Testing London Staff Account Logins\n');
  console.log('='.repeat(50));
  
  const staff = await testLogin('staff.london@bakery.com', 'StaffPassword123!');
  console.log('');
  const manager = await testLogin('manager.london@bakery.com', 'ManagerPassword123!');
  
  console.log('\n' + '='.repeat(50));
  if (staff && manager) {
    console.log('\n✅ All accounts working correctly!');
    console.log('\nBoth accounts can now be used for:');
    console.log('  - Staff Order Fulfillment workflow');
    console.log('  - Order management at London Flagship');
    console.log('  - Customer order processing');
  } else {
    console.log('\n❌ Some accounts still have issues.');
    process.exit(1);
  }
}

main();
