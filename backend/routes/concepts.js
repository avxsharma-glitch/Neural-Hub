const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');

// GET /api/concepts — Return full knowledge graph as { nodes, links }
router.get('/', async (req, res) => {
    try {
        const [topics, relations] = await prisma.$transaction([
            prisma.topic.findMany({
                include: {
                    unit: { include: { subject: true } },
                    conceptTags: true,
                },
            }),
            prisma.conceptRelation.findMany(),
        ]);

        const nodes = topics.map((t) => ({
            id: t.id,
            name: t.name,
            subject: t.unit.subject.name,
            subjectCode: t.unit.subject.code,
            unit: t.unit.name,
            difficulty: t.difficulty,
            importance: t.importance,
            tags: t.conceptTags.map((tag) => tag.name),
        }));

        const links = relations.map((r) => ({
            id: r.id,
            source: r.sourceTopicId,
            target: r.targetTopicId,
            type: r.relationshipType,
        }));

        res.json({ success: true, data: { nodes, links } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
