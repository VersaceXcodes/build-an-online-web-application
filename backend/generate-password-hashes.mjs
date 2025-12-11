import bcrypt from 'bcryptjs';

async function generateHashes() {
  const passwords = [
    { user: 'staff.london@bakery.com', password: 'StaffPassword123!' },
    { user: 'manager.london@bakery.com', password: 'ManagerPassword123!' },
    { user: 'staff.manchester@bakery.com', password: 'StaffPassword123!' },
    { user: 'staff.birmingham@bakery.com', password: 'StaffPassword123!' }
  ];

  console.log('\n🔐 Generating Password Hashes\n');
  console.log('='.repeat(70));

  for (const { user, password } of passwords) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`\n${user}:`);
    console.log(`  Password: ${password}`);
    console.log(`  Hash: ${hash}`);
  }

  console.log('\n' + '='.repeat(70));
}

generateHashes();
