const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');

// GET /api/practice/random — Return a random batch of PYQs for practice
router.get('/random', async (req, res) => {
    try {
        const { count = 10, difficulty } = req.query;
        const where = difficulty ? { difficulty: parseInt(difficulty) } : {};

        const allPyqs = await prisma.pYQ.findMany({
            where,
            include: { topic: { include: { unit: { include: { subject: true } } } } },
        });

        // Fisher-Yates shuffle
        const shuffled = allPyqs.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, parseInt(count));

        res.json({ success: true, data: selected, count: selected.length });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
