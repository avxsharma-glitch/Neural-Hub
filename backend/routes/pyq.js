const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');

// GET /api/pyq — PYQ archive, optionally filtered by topicId, year
router.get('/', async (req, res) => {
    try {
        const { topicId, year, difficulty, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (topicId) where.topicId = topicId;
        if (year) where.year = parseInt(year);
        if (difficulty) where.difficulty = parseInt(difficulty);

        const [pyqs, total] = await prisma.$transaction([
            prisma.pYQ.findMany({
                where,
                include: { topic: { include: { unit: { include: { subject: true } } } } },
                orderBy: { year: 'desc' },
                take: parseInt(limit),
                skip,
            }),
            prisma.pYQ.count({ where }),
        ]);

        res.json({
            success: true,
            data: pyqs,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
