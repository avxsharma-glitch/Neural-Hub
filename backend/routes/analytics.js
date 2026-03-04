const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');

// GET /api/analytics/user/:id — Return aggregated learning telemetry for a user
router.get('/user/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        const progress = await prisma.studyProgress.findMany({
            where: { userId },
            include: { topic: { include: { unit: { include: { subject: true } } } } },
            orderBy: { lastAccessed: 'desc' },
        });

        const totalTopics = await prisma.topic.count();
        const attemptedTopics = progress.length;
        const masteredTopics = progress.filter(p => p.completionPercentage >= 80).length;
        const avgCompletion = progress.length
            ? progress.reduce((sum, p) => sum + p.completionPercentage, 0) / progress.length
            : 0;

        // Group progress by subject
        const subjectBreakdown = {};
        for (const p of progress) {
            const subjectName = p.topic.unit.subject.name;
            if (!subjectBreakdown[subjectName]) {
                subjectBreakdown[subjectName] = { attempted: 0, mastered: 0, avgCompletion: 0, total: 0 };
            }
            subjectBreakdown[subjectName].attempted++;
            subjectBreakdown[subjectName].total += p.completionPercentage;
            if (p.completionPercentage >= 80) subjectBreakdown[subjectName].mastered++;
        }
        for (const key of Object.keys(subjectBreakdown)) {
            subjectBreakdown[key].avgCompletion = subjectBreakdown[key].total / subjectBreakdown[key].attempted;
        }

        res.json({
            success: true,
            data: {
                userId,
                overview: { totalTopics, attemptedTopics, masteredTopics, avgCompletion: parseFloat(avgCompletion.toFixed(1)) },
                subjectBreakdown,
                recentActivity: progress.slice(0, 10),
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/analytics/progress — Upsert study progress for a topic
router.post('/progress', async (req, res) => {
    try {
        const { userId, topicId, completionPercentage } = req.body;
        if (!userId || !topicId) return res.status(400).json({ success: false, error: 'userId and topicId are required' });

        const progress = await prisma.studyProgress.upsert({
            where: { userId_topicId: { userId, topicId } },
            update: { completionPercentage: parseFloat(completionPercentage) || 0, lastAccessed: new Date() },
            create: { userId, topicId, completionPercentage: parseFloat(completionPercentage) || 0 },
        });
        res.json({ success: true, data: progress });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
