const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

// PrismaBetterSqlite3 is a factory that takes { url: 'file:...' }
// dev.db is at backend/dev.db (created by prisma migrate from the backend root)
const dbFile = path.join(__dirname, '..', 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: `file:${dbFile}` });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Seeding the Database...');

    // 1. Create Subjects
    const subjectsToCreate = [
        { name: 'Engineering Physics', code: 'BAS101', category: 'Basic Science', semester: 1 },
        { name: 'Engineering Chemistry', code: 'BAS102', category: 'Basic Science', semester: 1 },
        { name: 'Engineering Mathematics I', code: 'BAS103', category: 'Basic Science', semester: 1 },
        { name: 'Engineering Mathematics II', code: 'BAS203', category: 'Basic Science', semester: 2 },
        { name: 'Fundamentals of Electrical Engineering', code: 'BEE101', category: 'Engineering Science', semester: 1 },
        { name: 'Fundamentals of Electronics Engineering', code: 'BEC101', category: 'Engineering Science', semester: 1 },
        { name: 'Programming for Problem Solving', code: 'BCS101', category: 'Engineering Science', semester: 1 },
        { name: 'Fundamentals of Mechanical Engineering', code: 'BME101', category: 'Engineering Science', semester: 1 },
        { name: 'Environment and Ecology', code: 'BAS104', category: 'Basic Science', semester: 1 },
        { name: 'Soft Skills', code: 'BAS105', category: 'Humanities', semester: 1 },
    ];

    const subjects = {};
    for (const sub of subjectsToCreate) {
        subjects[sub.code] = await prisma.subject.upsert({
            where: { code: sub.code },
            update: {},
            create: sub
        });
    }

    // 2. Create Units for 'Engineering Mathematics I' and 'Engineering Physics'
    const mathUnit1 = await prisma.unit.create({
        data: { subjectId: subjects['BAS103'].id, name: 'Matrices', number: 1 }
    });

    const mathUnit2 = await prisma.unit.create({
        data: { subjectId: subjects['BAS103'].id, name: 'Differential Calculus I', number: 2 }
    });

    const physUnit1 = await prisma.unit.create({
        data: { subjectId: subjects['BAS101'].id, name: 'Relativistic Mechanics', number: 1 }
    });

    // 3. Create Topics & Concept Tags
    const topicMath1 = await prisma.topic.create({
        data: {
            unitId: mathUnit1.id, name: 'Types of Matrices and Properties', difficulty: 2, importance: 0.8,
            conceptTags: { create: [{ name: 'Symmetric' }, { name: 'Orthogonal' }] }
        }
    });

    const topicMath2 = await prisma.topic.create({
        data: {
            unitId: mathUnit1.id, name: 'Eigenvalues and Eigenvectors', difficulty: 4, importance: 0.95,
            conceptTags: { create: [{ name: 'Characteristic Equation' }] }
        }
    });

    const topicMath3 = await prisma.topic.create({
        data: {
            unitId: mathUnit1.id, name: 'Cayley-Hamilton Theorem', difficulty: 3, importance: 0.85,
            conceptTags: { create: [{ name: 'Inverse Matrix' }] }
        }
    });

    const topicMath4 = await prisma.topic.create({
        data: {
            unitId: mathUnit2.id, name: 'Partial Differentiation', difficulty: 3, importance: 0.8,
            conceptTags: { create: [{ name: 'Euler\'s Theorem' }] }
        }
    });

    const topicPhys1 = await prisma.topic.create({
        data: {
            unitId: physUnit1.id, name: 'Lorentz Transformation', difficulty: 5, importance: 0.9,
            conceptTags: { create: [{ name: 'Time Dilation' }, { name: 'Length Contraction' }] }
        }
    });

    // 4. Create Inter-topic Concept Relations (The Knowledge Graph)
    // Matrices -> Cayley-Hamilton
    await prisma.conceptRelation.create({
        data: { sourceTopicId: topicMath1.id, targetTopicId: topicMath3.id, relationshipType: 'prerequisite' }
    });

    // Matrices -> Eigenvalues
    await prisma.conceptRelation.create({
        data: { sourceTopicId: topicMath1.id, targetTopicId: topicMath2.id, relationshipType: 'prerequisite' }
    });

    // Eigenvalues -> Cayley Hamilton
    await prisma.conceptRelation.create({
        data: { sourceTopicId: topicMath2.id, targetTopicId: topicMath3.id, relationshipType: 'related' }
    });

    // 5. Create PYQs
    await prisma.pYQ.create({
        data: { topicId: topicMath2.id, year: 2022, questionText: 'Find the eigenvalues and eigenvectors of the matrix [3 -1; -1 3].', difficulty: 3 }
    });

    await prisma.pYQ.create({
        data: { topicId: topicMath3.id, year: 2021, questionText: 'Verify Cayley-Hamilton theorem for matrix A and hence find A^-1.', difficulty: 4 }
    });

    console.log('Database Seeding Completed Successfully! 🌱');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
