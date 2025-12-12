#!/usr/bin/env node

/**
 * Repair Loyalty Points Script
 * This script recalculates and fixes loyalty points balances for all users
 * by summing up all their loyalty_points_transactions.
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function repairLoyaltyPoints() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get all users who have loyalty points transactions
    const usersResult = await client.query(`
      SELECT DISTINCT user_id 
      FROM loyalty_points_transactions
      ORDER BY user_id
    `);

    console.log(`Found ${usersResult.rows.length} users with loyalty points transactions`);

    for (const row of usersResult.rows) {
      const userId = row.user_id;
      
      // Get all transactions for this user in chronological order
      const transactionsResult = await client.query(`
        SELECT transaction_id, transaction_type, points_change, balance_after, created_at, description
        FROM loyalty_points_transactions
        WHERE user_id = $1
        ORDER BY created_at ASC
      `, [userId]);

      if (transactionsResult.rows.length === 0) {
        continue;
      }

      // Calculate the correct current balance by summing all points_change
      let correctBalance = 0;
      for (const txn of transactionsResult.rows) {
        correctBalance += parseFloat(txn.points_change);
      }

      // Get the user's current balance
      const userResult = await client.query(`
        SELECT user_id, email, loyalty_points_balance
        FROM users
        WHERE user_id = $1
      `, [userId]);

      if (userResult.rows.length === 0) {
        console.warn(`Warning: User ${userId} not found in users table`);
        continue;
      }

      const user = userResult.rows[0];
      const currentBalance = parseFloat(user.loyalty_points_balance);

      if (Math.abs(currentBalance - correctBalance) > 0.01) {
        console.log(`\nUser ${userId} (${user.email}):`);
        console.log(`  Current balance: ${currentBalance}`);
        console.log(`  Calculated balance: ${correctBalance}`);
        console.log(`  Difference: ${currentBalance - correctBalance}`);
        console.log(`  Transactions count: ${transactionsResult.rows.length}`);
        
        // Update the user's balance
        await client.query(`
          UPDATE users
          SET loyalty_points_balance = $1, updated_at = $2
          WHERE user_id = $3
        `, [correctBalance, new Date().toISOString(), userId]);
        
        console.log(`  ✓ Balance updated to ${correctBalance}`);
      } else {
        console.log(`User ${userId} (${user.email}): Balance correct (${correctBalance})`);
      }
    }

    await client.query('COMMIT');
    console.log('\n✓ All loyalty points balances have been repaired');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error repairing loyalty points:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the repair
repairLoyaltyPoints()
  .then(() => {
    console.log('\n✓ Repair completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n✗ Repair failed:', error);
    process.exit(1);
  });
