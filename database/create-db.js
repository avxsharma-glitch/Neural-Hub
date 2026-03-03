const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function init() {
    const defaultUrl = process.env.DATABASE_URL.replace('/neural_avx', '/postgres');
    const client = new Client({ connectionString: defaultUrl });

    try {
        await client.connect();
        await client.query('CREATE DATABASE neural_avx');
        console.log('Database neural_avx created successfully!');
    } catch (e) {
        if (e.code === '42P04') {
            console.log('Database already exists.');
        } else {
            console.error('Error creating database:', e);
        }
    } finally {
        await client.end();
    }
}

init();
