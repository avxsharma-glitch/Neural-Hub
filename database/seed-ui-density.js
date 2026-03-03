const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function seedDensityData() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });

    try {
        await client.connect();

        // 1. Ensure user exists
        const userRes = await client.query('SELECT id FROM users LIMIT 1');
        let userId;
        if (userRes.rows.length === 0) {
            console.log('No user found, creating dummy user...');
            const insertUser = await client.query(`INSERT INTO users (name, email, password_hash) VALUES ('Admin Student', 'admin@neuralhub.ktu', 'hashedpass123') RETURNING id`);
            userId = insertUser.rows[0].id;
        } else {
            userId = userRes.rows[0].id;
        }

        console.log('Clearing existing data to prevent duplicates...');
        await client.query('DELETE FROM study_sessions');
        await client.query('DELETE FROM pyq');
        await client.query('DELETE FROM topics');
        await client.query('DELETE FROM subjects');

        console.log('Inserting 6 AKTU Subjects...');
        const subjects = [
            ['KAS101', 'Engineering Physics', 4],
            ['KAS102', 'Engineering Chemistry', 4],
            ['KAS103', 'Engineering Mathematics-I', 5],
            ['KEE101', 'Basic Electrical Engineering', 4],
            ['KCS101', 'Programming for Problem Solving', 3],
            ['KME101', 'Fundamentals of Mechanical Engineering', 3]
        ];

        const subIds = [];
        for (const s of subjects) {
            const res = await client.query('INSERT INTO subjects (code, name, difficulty_level) VALUES ($1, $2, $3) RETURNING id', s);
            subIds.push(res.rows[0].id);
        }

        console.log('Inserting Topics & Mocking Pre-Generated AI...');
        const topics = [
            [subIds[0], 'Quantum Mechanics: Wave Functions', 1.5, 1.2, true],
            [subIds[0], 'Interference of Light', 1.2, 1.0, false],
            [subIds[1], 'Molecular Orbital Theory', 1.8, 1.5, true],
            [subIds[1], 'Spectroscopic Techniques', 1.1, 1.1, false],
            [subIds[2], 'Matrices & Determinants', 2.0, 1.8, false],
            [subIds[2], 'Differential Calculus: Leibnitz Theorem', 2.5, 2.0, true],
            [subIds[3], 'DC Circuits & Network Theorems', 1.6, 1.4, false],
            [subIds[3], 'AC Fundamentals: Phasors', 1.9, 1.7, true],
            [subIds[4], 'Pointers and Memory Allocation', 2.2, 1.9, true],
            [subIds[4], 'File Handling in C', 1.4, 1.3, false],
            [subIds[5], 'First Law of Thermodynamics', 1.7, 1.5, true],
            [subIds[5], 'Force Systems & Equilibrium', 1.5, 1.4, false]
        ];

        const topicIds = [];
        for (const t of topics) {
            const res = await client.query(`
                INSERT INTO topics (subject_id, name, importance_weight, difficulty_score, weak_flag, ai_generated, ai_explanation, ai_strategy_notes, ai_common_traps) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id
            `, [
                t[0], t[1], t[2], t[3], t[4], t[4] ? true : false,
                t[4] ? `[AI GENERATED] Comprehensive explanation of ${t[1]}.` : null,
                t[4] ? `Key formulas and strategic approaches for ${t[1]}.` : null,
                t[4] ? `Common traps students fall into regarding ${t[1]}.` : null
            ]);
            topicIds.push(res.rows[0].id);
        }

        console.log('Inserting PYQs...');
        const pyqs = [
            [subIds[0], topicIds[0], 2023, 'Derive the Schrödinger wave equation for a free particle.', 4],
            [subIds[2], topicIds[4], 2022, 'Find the inverse of the given 3x3 matrix using Cayley-Hamilton theorem.', 3],
            [subIds[4], topicIds[8], 2023, 'Explain pointer to a pointer with a suitable C program.', 5]
        ];

        for (const p of pyqs) {
            await client.query('INSERT INTO pyq (subject_id, topic_id, year, question_text, difficulty, ai_generated) VALUES ($1, $2, $3, $4, $5, true)', p);
        }

        console.log('Simulating Study Sessions for History & Radar...');
        const sessions = [
            [userId, topicIds[0], 45, 80, 7],
            [userId, topicIds[4], 60, 65, 8],
            [userId, topicIds[8], 30, 90, 6],
            [userId, topicIds[2], 120, 50, 9],
            [userId, topicIds[6], 40, 85, 5]
        ];

        for (let i = 0; i < sessions.length; i++) {
            const s = sessions[i];
            // Stagger timestamps backwards by days
            await client.query(`
                INSERT INTO study_sessions (user_id, topic_id, duration, accuracy, cognitive_intensity, created_at) 
                VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '${i} DAYS')
            `, s);
        }

        console.log('Simulating Neural Metrics...');
        await client.query('DELETE FROM neural_metrics');
        for (let i = 6; i >= 0; i--) {
            await client.query(`
                INSERT INTO neural_metrics (user_id, neural_index, focus_score, delta, cognitive_load, timestamp) 
                VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '${i} DAYS')
            `, [userId, 81.5 + (Math.random() * 5), 75 + (Math.random() * 10), (Math.random() * 2) - 1, 60 + (Math.random() * 20)]);
        }

        console.log('UI Density Seed Completed!');
    } catch (e) {
        console.error('Error seeding UI density:', e);
    } finally {
        await client.end();
    }
}

seedDensityData();
