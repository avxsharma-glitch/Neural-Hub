const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function resetPassword() {
    const hash = await bcrypt.hash('admin123', 10);
    const result = await pool.query(
        'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email',
        [hash, 'admin@neuralhub.ktu']
    );
    if (result.rows.length === 0) {
        console.log('❌ No user found with that email.');
    } else {
        console.log('✔ Password reset to "admin123" for:', result.rows[0].email);
    }
    await pool.end();
}

resetPassword().catch(e => { console.error(e.message); pool.end(); });
