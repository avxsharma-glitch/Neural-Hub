const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');

// GET /api/units/:id/topics — topics for a unit (with tags and minimal subject info)
router.get('/:id/topics', async (req, res) => {
  try {
    const unitId = req.params.id;
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      include: {
        subject: { select: { id: true, name: true, code: true, semester: true } },
        topics: {
          include: { conceptTags: true, pyqs: { orderBy: { year: 'desc' }, take: 5 } },
          orderBy: { importance: 'desc' },
        },
      },
    });
    if (!unit) return res.status(404).json({ success: false, error: 'Unit not found' });
    res.json({ success: true, data: unit });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
