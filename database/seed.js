const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function seed() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });

    try {
        await client.connect();
        const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        await client.query(sql);
        console.log('Schema seeded successfully!');
    } catch (e) {
        console.error('Error seeding schema:', e);
    } finally {
        await client.end();
    }
}

seed();
