const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

// SQLite adapter (db lives at backend/dev.db)
const dbFile = path.join(__dirname, '..', 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: `file:${dbFile}` });
const prisma = new PrismaClient({ adapter });

const DATA_FILE = path.join(__dirname, '..', '..', 'data', 'maths1.json');

// Map textual difficulty to numeric bucket (1–5)
function normalizeDifficulty(value) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return Math.min(5, Math.max(1, Math.round(value)));
    }
    const label = String(value || '').toLowerCase();
    if (label.includes('easy')) return 2;
    if (label.includes('hard')) return 4;
    if (label.includes('med')) return 3;
    return 3; // default medium
}

function safeYear(value) {
    const year = Number.parseInt(value, 10);
    return Number.isFinite(year) ? year : null;
}

async function main() {
    console.log('Seeding from JSON:', DATA_FILE);

    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(raw);

    const subjectName = data.subject || 'Imported Subject';
    const subjectCode = (subjectName || 'SUBJECT').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12) || 'SUBJECT';

    const subject = await prisma.subject.upsert({
        where: { code: subjectCode },
        update: { name: subjectName },
        create: {
            name: subjectName,
            code: subjectCode,
            category: 'Imported',
            semester: 1,
        },
    });

    let unitCount = 0;
    let topicCount = 0;
    let tagCount = 0;
    let pyqCount = 0;

    for (const [uIndex, unit] of (data.units || []).entries()) {
        const createdUnit = await prisma.unit.create({
            data: {
                subjectId: subject.id,
                name: unit.unit_name || `Unit ${uIndex + 1}`,
                number: uIndex + 1,
            },
        });
        unitCount += 1;

        for (const topic of unit.topics || []) {
            const normalizedDifficulty = normalizeDifficulty(topic.difficulty);
            const importance = 0.6; // default importance weight

            const conceptTags = (topic.concept_tags || topic.conceptTags || []).filter(Boolean).map((name) => ({ name }));
            const pyqs = (topic.pyqs || []).map((q) => {
                const year = safeYear(q.year);
                return year
                    ? {
                            year,
                            questionText: q.question || q.questionText || 'PYQ not provided',
                            difficulty: normalizeDifficulty(q.difficulty || topic.difficulty),
                        }
                    : null;
            }).filter(Boolean);

            const createdTopic = await prisma.topic.create({
                data: {
                    unitId: createdUnit.id,
                    name: topic.topic_name || 'Untitled Topic',
                    difficulty: normalizedDifficulty,
                    importance,
                    conceptTags: conceptTags.length ? { create: conceptTags } : undefined,
                    pyqs: pyqs.length ? { create: pyqs } : undefined,
                },
            });

            topicCount += 1;
            tagCount += conceptTags.length;
            pyqCount += pyqs.length;
        }
    }

    console.log(`Seeded Subject: ${subject.name}`);
    console.log(`Units: ${unitCount}, Topics: ${topicCount}, Concept Tags: ${tagCount}, PYQs: ${pyqCount}`);
}

main()
    .catch((err) => {
        console.error('Seed failed:', err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
