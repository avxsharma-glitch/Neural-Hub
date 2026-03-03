const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('Starting Hybrid AI Database Migration...');
    await client.query('BEGIN');

    // 1. Update topics table
    console.log('Adding AI columns to topics table...');
    await client.query(`
      ALTER TABLE topics 
      ADD COLUMN IF NOT EXISTS ai_explanation TEXT,
      ADD COLUMN IF NOT EXISTS ai_common_traps TEXT,
      ADD COLUMN IF NOT EXISTS ai_strategy_notes TEXT,
      ADD COLUMN IF NOT EXISTS audio_path VARCHAR(255),
      ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS ai_generated_at TIMESTAMP WITH TIME ZONE;
    `);

    // 2. Update pyq table
    console.log('Adding AI columns to pyq table...');
    await client.query(`
      ALTER TABLE pyq 
      ADD COLUMN IF NOT EXISTS ai_solution TEXT,
      ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS ai_generated_at TIMESTAMP WITH TIME ZONE;
    `);

    // 3. Create AI Usage Logs table
    console.log('Creating ai_usage_logs table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_usage_logs (
          id SERIAL PRIMARY KEY,
          reference_type VARCHAR(50) NOT NULL CHECK (reference_type IN ('topic', 'pyq', 'audio')),
          reference_id INTEGER NOT NULL,
          tokens_used INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index for logs
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_ref ON ai_usage_logs(reference_type, reference_id);
    `);

    await client.query('COMMIT');
    console.log('Migration completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
  } finally {
    client.release();
    pool.end();
  }
}

runMigration();
