#!/usr/bin/env node

/**
 * Reset user_001 loyalty points to correct state
 * This deletes incorrect transactions and rebuilds from seed data
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function resetUser001Points() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Resetting user_001 loyalty points...\n');

    // Get current state
    const userBefore = await client.query(`
      SELECT user_id, email, loyalty_points_balance
      FROM users
      WHERE user_id = 'user_001'
    `);
    console.log('Current balance:', userBefore.rows[0].loyalty_points_balance);

    // Delete all transactions that happened after the seed data (2025 timestamps)
    const deleteResult = await client.query(`
      DELETE FROM loyalty_points_transactions
      WHERE user_id = 'user_001'
      AND created_at >= '2025-01-01T00:00:00Z'
      RETURNING transaction_id, points_change, created_at, description
    `);
    console.log(`\nDeleted ${deleteResult.rows.length} incorrect transactions from 2025:`);
    deleteResult.rows.forEach(txn => {
      console.log(`  - ${txn.transaction_id}: ${txn.points_change} points (${txn.description})`);
    });

    // Recalculate correct balance from remaining transactions
    const correctTransactions = await client.query(`
      SELECT transaction_id, points_change, balance_after, created_at, description
      FROM loyalty_points_transactions
      WHERE user_id = 'user_001'
      ORDER BY created_at ASC
    `);

    console.log(`\n${correctTransactions.rows.length} valid transactions remaining:`);
    let calculatedBalance = 0;
    correctTransactions.rows.forEach(txn => {
      calculatedBalance += parseFloat(txn.points_change);
      console.log(`  - ${txn.points_change.toString().padStart(4)} pts: ${txn.description} (balance: ${calculatedBalance})`);
    });

    // Update user's balance
    await client.query(`
      UPDATE users
      SET loyalty_points_balance = $1, updated_at = $2
      WHERE user_id = 'user_001'
    `, [calculatedBalance, new Date().toISOString()]);

    console.log(`\n✓ User balance updated to: ${calculatedBalance} points`);

    await client.query('COMMIT');
    console.log('✓ Reset completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error resetting points:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the reset
resetUser001Points()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n✗ Reset failed:', error);
    process.exit(1);
  });
