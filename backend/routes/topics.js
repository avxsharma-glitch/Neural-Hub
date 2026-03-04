const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');

// GET /api/topics/:id — Get a single topic with all related data (lesson workspace)
router.get('/:id', async (req, res) => {
    try {
        const topic = await prisma.topic.findUnique({
            where: { id: req.params.id },
            include: {
                conceptTags: true,
                pyqs: { take: 5, orderBy: { year: 'desc' } },
                unit: { include: { subject: true } },
                outboundLinks: { include: { targetTopic: { select: { id: true, name: true } } } },
                inboundLinks: { include: { sourceTopic: { select: { id: true, name: true } } } },
            },
        });
        if (!topic) return res.status(404).json({ success: false, error: 'Topic not found' });
        res.json({ success: true, data: topic });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/topics (with ?unitId=) — List topics for a unit
router.get('/', async (req, res) => {
    try {
        const { unitId, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const topics = await prisma.topic.findMany({
            where: unitId ? { unitId } : undefined,
            include: { conceptTags: true },
            take: parseInt(limit),
            skip,
            orderBy: { importance: 'desc' },
        });
        res.json({ success: true, data: topics });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
