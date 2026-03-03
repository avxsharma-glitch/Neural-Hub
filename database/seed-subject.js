/**
 * NEURAL HUB // AVX — Generic Subject Seed Script
 * Ingests any enriched curriculum JSON into PostgreSQL.
 *
 * Usage from project root:
 *   node database/seed-subject.js database/seeds/math1_kas103.json
 *   node database/seed-subject.js database/seeds/math2_kas203.json
 *   node database/seed-subject.js database/seeds/chem_kas102.json
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const SEED_FILE = process.argv[2];

if (!SEED_FILE) {
    console.error('Usage: node database/seed-subject.js <path/to/seed.json>');
    process.exit(1);
}

async function seed() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });

    try {
        await client.connect();
        console.log('✔ Connected to database');

        const raw = fs.readFileSync(path.resolve(SEED_FILE), 'utf8');
        const data = JSON.parse(raw);

        // ---------- 1. Upsert Subject ----------
        let subjectDbId;
        const existing = await client.query('SELECT id FROM subjects WHERE code = $1', [data.Code]);

        if (existing.rows.length > 0) {
            subjectDbId = existing.rows[0].id;
            console.log(`⟳ Subject "${data.Code}" already exists (id=${subjectDbId}).`);
        } else {
            const diffLevel = data._meta?.Difficulty_Level || 4;
            const res = await client.query(
                'INSERT INTO subjects (code, name, difficulty_level) VALUES ($1, $2, $3) RETURNING id',
                [data.Code, data.Subject.split('(')[0].trim(), diffLevel]
            );
            subjectDbId = res.rows[0].id;
            console.log(`✔ Inserted subject "${data.Code}" → id=${subjectDbId}`);
        }

        // ---------- 2. Topics ----------
        let topicsInserted = 0;
        let topicsSkipped = 0;
        let pyqsInserted = 0;

        for (const unit of data.Units) {
            for (const topic of unit.Topics) {
                const existingTopic = await client.query(
                    'SELECT id FROM topics WHERE subject_id = $1 AND name = $2',
                    [subjectDbId, topic.Topic]
                );

                let topicDbId;

                if (existingTopic.rows.length > 0) {
                    topicDbId = existingTopic.rows[0].id;
                    topicsSkipped++;
                } else {
                    const formulaText = topic.Core_Formulas && topic.Core_Formulas.length > 0
                        ? topic.Core_Formulas.join('\n')
                        : null;

                    const topicRes = await client.query(
                        `INSERT INTO topics
                            (subject_id, name, importance_weight, difficulty_score, weak_flag,
                             ai_generated, ai_explanation, ai_strategy_notes, ai_common_traps)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
                        [
                            subjectDbId,
                            topic.Topic,
                            topic.Importance_Weight,
                            topic.Difficulty_Score,
                            topic.Weak_Flag,
                            false,
                            null,
                            formulaText,
                            null
                        ]
                    );
                    topicDbId = topicRes.rows[0].id;
                    topicsInserted++;
                }

                // ---------- 3. PYQs (real ones only — skip blank stubs) ----------
                if (topic.PYQs && Array.isArray(topic.PYQs)) {
                    for (const pyq of topic.PYQs) {
                        if (!pyq.Year || !pyq.Question) continue; // skip blank stubs

                        const existingPyq = await client.query(
                            'SELECT id FROM pyq WHERE topic_id = $1 AND year = $2 AND question_text = $3',
                            [topicDbId, parseInt(pyq.Year), pyq.Question]
                        );
                        if (existingPyq.rows.length > 0) continue;

                        await client.query(
                            `INSERT INTO pyq (subject_id, topic_id, year, question_text, difficulty, ai_generated)
                             VALUES ($1, $2, $3, $4, $5, false)`,
                            [
                                subjectDbId,
                                topicDbId,
                                parseInt(pyq.Year),
                                pyq.Question,
                                pyq.Difficulty || 3
                            ]
                        );
                        pyqsInserted++;
                    }
                }
            }
        }

        console.log(`\n📊 Import Summary`);
        console.log(`   Subject       : ${data.Code}`);
        console.log(`   Topics Added  : ${topicsInserted}`);
        console.log(`   Topics Skipped: ${topicsSkipped}`);
        console.log(`   PYQs Inserted : ${pyqsInserted}`);
        console.log(`\n✅ Done!`);

    } catch (err) {
        console.error('❌ Seed Error:', err.message || err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

seed();
