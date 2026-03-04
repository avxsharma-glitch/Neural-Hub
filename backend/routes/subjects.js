const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');

// GET /api/subjects — List all subjects, optionally filtered by semester
router.get('/', async (req, res) => {
    try {
        const { semester } = req.query;
        const subjects = await prisma.subject.findMany({
            where: semester ? { semester: parseInt(semester) } : undefined,
            orderBy: [{ semester: 'asc' }, { name: 'asc' }],
        });
        res.json({ success: true, data: subjects });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/subjects/:id — Get a single subject with units
router.get('/:id', async (req, res) => {
    try {
        const subject = await prisma.subject.findUnique({
            where: { id: req.params.id },
            include: { units: { orderBy: { number: 'asc' } } },
        });
        if (!subject) return res.status(404).json({ success: false, error: 'Subject not found' });
        res.json({ success: true, data: subject });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/subjects/:id/units — Get all units for a subject
router.get('/:id/units', async (req, res) => {
    try {
        const units = await prisma.unit.findMany({
            where: { subjectId: req.params.id },
            orderBy: { number: 'asc' },
        });
        res.json({ success: true, data: units });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
