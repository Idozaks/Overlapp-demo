/**
 * Script to create the chat-related database tables
 */
import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';

// Create a new pool using the DATABASE_URL environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function createChatTables() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create conversations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        name TEXT,
        type TEXT NOT NULL,
        created_by INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        metadata JSONB
      )
    `);

    // Create conversation_participants table
    await client.query(`
      CREATE TABLE IF NOT EXISTS conversation_participants (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        role TEXT NOT NULL,
        joined_at TIMESTAMPTZ DEFAULT NOW(),
        last_seen_at TIMESTAMPTZ,
        last_read_message_id INTEGER,
        settings JSONB,
        FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
      )
    `);

    // Create messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER NOT NULL,
        sender_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        content_type TEXT DEFAULT 'text',
        media_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        is_deleted BOOLEAN DEFAULT FALSE,
        metadata JSONB,
        FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
      )
    `);

    // Create message_status table
    await client.query(`
      CREATE TABLE IF NOT EXISTS message_status (
        id SERIAL PRIMARY KEY,
        message_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (message_id) REFERENCES messages (id) ON DELETE CASCADE
      )
    `);

    // Create ai_companions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_companions (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        avatar_url TEXT,
        created_by INTEGER NOT NULL,
        personality TEXT NOT NULL,
        system_prompt TEXT NOT NULL,
        is_public BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        settings JSONB
      )
    `);

    // Create ai_conversation_context table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_conversation_context (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER NOT NULL,
        context JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
      )
    `);

    await client.query('COMMIT');
    console.log('Successfully created chat tables');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating chat tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the function
createChatTables()
  .then(() => {
    console.log('Chat tables setup complete');
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed to create chat tables:', err);
    process.exit(1);
  });