/**
 * NEURAL HUB // AVX
 * Intelligence Migration — adds computed metric columns to topics table
 * Run: node database/migrate-intelligence.js
 */

const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function runMigration() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    try {
        console.log('Running intelligence migration...');
        await client.query('BEGIN');

        await client.query(`
            ALTER TABLE topics
            ADD COLUMN IF NOT EXISTS mastery_score     DECIMAL(5,4) DEFAULT 0.0,
            ADD COLUMN IF NOT EXISTS frequency_score   DECIMAL(5,4) DEFAULT 0.0,
            ADD COLUMN IF NOT EXISTS exam_priority_score DECIMAL(5,4) DEFAULT 0.0,
            ADD COLUMN IF NOT EXISTS revision_count    INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS last_revision_date TIMESTAMP WITH TIME ZONE;
        `);

        // Add ai_generated column to pyq if missing
        await client.query(`
            ALTER TABLE pyq
            ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false;
        `);

        // Index for intelligence queries
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_topics_priority ON topics(exam_priority_score DESC);
            CREATE INDEX IF NOT EXISTS idx_topics_weak ON topics(weak_flag) WHERE weak_flag = true;
        `);

        await client.query('COMMIT');
        console.log('✔ Intelligence columns added to topics table');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err.message);
    } finally {
        await client.end();
    }
}

runMigration();
