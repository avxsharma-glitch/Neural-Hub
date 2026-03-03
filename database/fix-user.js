const { Client } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function fixUser() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    try {
        await client.connect();
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('hashedpass123', salt);
        await client.query('DELETE FROM users');
        await client.query(
            "INSERT INTO users (name, email, password_hash) VALUES ('Admin Student', 'admin@neuralhub.ktu', $1)",
            [hash]
        );
        console.log('Fixed user pass');
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
fixUser();
