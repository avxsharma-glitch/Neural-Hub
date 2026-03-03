/**
 * NEURAL HUB // AVX
 * Chemistry Curriculum Seed Script
 * Ingests: database/seeds/chem_kas102.json → PostgreSQL
 *
 * Run from project root:
 *   node database/seed-chem.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const SEED_FILE = path.join(__dirname, 'seeds', 'chem_kas102.json');

async function seedChemistry() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });

    try {
        await client.connect();
        console.log('✔ Connected to database');

        const raw = fs.readFileSync(SEED_FILE, 'utf8');
        const data = JSON.parse(raw);

        // ---------- 1. Upsert Subject ----------
        let subjectDbId;
        const existingSubject = await client.query(
            'SELECT id FROM subjects WHERE code = $1',
            [data.Code]
        );

        if (existingSubject.rows.length > 0) {
            subjectDbId = existingSubject.rows[0].id;
            console.log(`⟳ Subject "${data.Code}" already exists (id=${subjectDbId}), skipping insert.`);
        } else {
            const res = await client.query(
                `INSERT INTO subjects (code, name, difficulty_level)
                 VALUES ($1, $2, $3) RETURNING id`,
                [data.Code, 'Engineering Chemistry', 4]
            );
            subjectDbId = res.rows[0].id;
            console.log(`✔ Inserted subject "${data.Code}" → id=${subjectDbId}`);
        }

        // ---------- 2. Iterate Units & Topics ----------
        let topicsInserted = 0;
        let topicsSkipped = 0;

        for (const unit of data.Units) {
            for (const topic of unit.Topics) {

                // Check if topic already exists by name under this subject
                const exists = await client.query(
                    'SELECT id FROM topics WHERE subject_id = $1 AND name = $2',
                    [subjectDbId, topic.Topic]
                );

                if (exists.rows.length > 0) {
                    topicsSkipped++;
                    continue;
                }

                await client.query(
                    `INSERT INTO topics
                        (subject_id, name, importance_weight, difficulty_score, weak_flag,
                         ai_generated, ai_explanation, ai_strategy_notes, ai_common_traps)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                    [
                        subjectDbId,
                        topic.Topic,
                        topic.Importance_Weight,
                        topic.Difficulty_Score,
                        topic.Weak_Flag,
                        false,
                        null,
                        topic.Core_Formulas && topic.Core_Formulas.length > 0
                            ? topic.Core_Formulas.join('\n')
                            : null,
                        null
                    ]
                );
                topicsInserted++;
            }
        }

        // ---------- 3. Seed PYQs (stub rows) ----------
        // PYQs are empty stubs in the JSON — skip actual insertion for now.
        // When PYQ Year / Marks are populated, re-run with a separate pyq seeder.
        console.log(`\n📊 Import Summary`);
        console.log(`   Subject       : ${data.Code} (${data.Subject.substring(0, 50)}...)`);
        console.log(`   Topics Added  : ${topicsInserted}`);
        console.log(`   Topics Skipped: ${topicsSkipped} (already existed)`);
        console.log(`\n✅ Chemistry curriculum seeded successfully!`);

    } catch (err) {
        console.error('❌ Seed Error:', err.message || err);
    } finally {
        await client.end();
    }
}

seedChemistry();
