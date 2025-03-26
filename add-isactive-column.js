/**
 * Script to add is_active column to conversation_participants table
 */
import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';

// Create a new pool using the DATABASE_URL environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function addIsActiveColumn() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if the column already exists
    const checkColumnResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'conversation_participants' 
      AND column_name = 'is_active'
    `);
    
    if (checkColumnResult.rows.length === 0) {
      // Add the is_active column with a default value of true
      await client.query(`
        ALTER TABLE conversation_participants 
        ADD COLUMN is_active BOOLEAN DEFAULT TRUE
      `);
      console.log("Successfully added is_active column to conversation_participants table");
    } else {
      console.log("Column is_active already exists in conversation_participants table");
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding is_active column:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the function
addIsActiveColumn()
  .then(() => {
    console.log('Migration complete');
    process.exit(0);
  })
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });