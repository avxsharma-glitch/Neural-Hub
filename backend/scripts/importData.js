const fs = require('fs');
const path = require('path');
const prisma = require('../config/prisma');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Subject metadata mapping for codes/category/semester
const SUBJECT_META = {
  'Engineering Physics': { code: 'BAS101', category: 'Basic Science', semester: 1 },
  'Engineering Chemistry': { code: 'BAS102', category: 'Basic Science', semester: 1 },
  'Engineering Mathematics I': { code: 'BAS103', category: 'Basic Science', semester: 1 },
  'Engineering Mathematics II': { code: 'BAS203', category: 'Basic Science', semester: 2 },
  'Fundamentals of Electrical Engineering': { code: 'BEE101', category: 'Engineering Science', semester: 1 },
  'Fundamentals of Electronics Engineering': { code: 'BEC101', category: 'Engineering Science', semester: 1 },
  'Programming for Problem Solving': { code: 'BCS101', category: 'Engineering Science', semester: 1 },
  'Fundamentals of Mechanical Engineering': { code: 'BME101', category: 'Engineering Science', semester: 1 },
  'Environment and Ecology': { code: 'BAS104', category: 'Basic Science', semester: 1 },
  'Soft Skills': { code: 'BAS105', category: 'Humanities', semester: 1 },
};

function normalizeDifficulty(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.min(5, Math.max(1, Math.round(value)));
  const txt = String(value || '').toLowerCase();
  if (txt.includes('easy')) return 2;
  if (txt.includes('hard')) return 4;
  if (txt.includes('med')) return 3;
  return 3;
}

function safeYear(value) {
  const y = Number.parseInt(value, 10);
  return Number.isFinite(y) ? y : null;
}

async function upsertSubject(nameFromData) {
  const meta = SUBJECT_META[nameFromData] || {};
  const code = meta.code || nameFromData.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12) || 'SUBJECT';
  const category = meta.category || 'Imported';
  const semester = meta.semester || 1;

  return prisma.subject.upsert({
    where: { code },
    update: { name: nameFromData, category, semester },
    create: { name: nameFromData, code, category, semester },
  });
}

async function findOrCreateUnit(subjectId, name, number) {
  const existing = await prisma.unit.findFirst({ where: { subjectId, name } });
  if (existing) return existing;
  return prisma.unit.create({ data: { subjectId, name, number } });
}

async function findOrCreateTopic(unitId, name, difficulty, importance) {
  const existing = await prisma.topic.findFirst({ where: { unitId, name } });
  if (existing) return existing;
  return prisma.topic.create({ data: { unitId, name, difficulty, importance } });
}

async function findOrCreateTag(topicId, name) {
  const existing = await prisma.conceptTag.findFirst({ where: { topicId, name } });
  if (existing) return existing;
  return prisma.conceptTag.create({ data: { topicId, name } });
}

async function findOrCreatePyq(topicId, questionText, year, difficulty) {
  if (!year || !questionText) return null;
  const existing = await prisma.pYQ.findFirst({ where: { topicId, questionText } });
  if (existing) return existing;
  return prisma.pYQ.create({ data: { topicId, year, questionText, difficulty } });
}

async function importFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(raw);

  const subjectName = json.Subject || json.subject || path.basename(filePath, '.json');
  const subject = await upsertSubject(subjectName);

  let unitCount = 0;
  let topicCount = 0;
  let tagCount = 0;
  let pyqCount = 0;

  for (const [uIndex, unit] of (json.Units || json.units || []).entries()) {
    const unitName = unit.Unit || unit.unit_name || unit.unit || `Unit ${uIndex + 1}`;
    const createdUnit = await findOrCreateUnit(subject.id, unitName, uIndex + 1);
    unitCount++;

    for (const topic of unit.Topics || unit.topics || []) {
      const topicName = topic.Topic || topic.topic_name || topic.topic || 'Untitled Topic';
      const difficulty = normalizeDifficulty(topic.difficulty);
      const importance = Number.isFinite(topic.importance) ? topic.importance : 0.6;
      const createdTopic = await findOrCreateTopic(createdUnit.id, topicName, difficulty, importance);
      topicCount++;

      const tags = topic.Concept_Tags || topic.concept_tags || topic.conceptTags || [];
      for (const tag of tags) {
        await findOrCreateTag(createdTopic.id, tag);
        tagCount++;
      }

      const pyqs = topic.PYQs || topic.pyqs || [];
      for (const q of pyqs) {
        const year = safeYear(q.year);
        const questionText = q.question || q.question_text || q.questionText || q.text;
        const pyqDifficulty = normalizeDifficulty(q.difficulty || topic.difficulty);
        const created = await findOrCreatePyq(createdTopic.id, questionText, year, pyqDifficulty);
        if (created) pyqCount++;
      }
    }
  }

  return { subjectName, unitCount, topicCount, tagCount, pyqCount };
}

async function main() {
  console.log('Importing syllabus JSON files from', DATA_DIR);
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'));
  if (!files.length) {
    console.warn('No JSON files found in data directory.');
    return;
  }

  const summary = [];
  for (const file of files) {
    const info = await importFile(path.join(DATA_DIR, file));
    summary.push({ file, ...info });
    console.log(`✔ Imported ${file} → ${info.subjectName}: ${info.unitCount} units, ${info.topicCount} topics, ${info.tagCount} tags, ${info.pyqCount} PYQs`);
  }

  console.log('\nImport completed. Summary:');
  console.table(summary);
}

main()
  .catch((err) => {
    console.error('Import failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
