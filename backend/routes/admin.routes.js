const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { runIntelligenceComputation } = require('../services/intelligence.service');

// AI Generation Routes (admin only)
router.post('/generate/topic/:topicId', [auth, adminAuth], adminController.generateTopic);
router.post('/generate/pyq/:pyqId', [auth, adminAuth], adminController.generatePyq);
router.post('/generate/audio/:topicId', [auth, adminAuth], adminController.generateAudio);
router.post('/generate/all', [auth, adminAuth], adminController.generateAll);

// @route   POST /api/admin/run-intelligence-update
// @desc    Recompute all topic metrics deterministically (no AI)
// @access  Admin only
router.post('/run-intelligence-update', [auth, adminAuth], async (req, res) => {
    try {
        const subjectId = req.body.subject_id ? parseInt(req.body.subject_id) : null;
        const report = await runIntelligenceComputation(subjectId);
        res.json({
            status: 'success',
            message: 'Intelligence computation complete',
            report
        });
    } catch (err) {
        console.error('Intelligence update error:', err.message);
        res.status(500).json({ error: 'Intelligence computation failed', details: err.message });
    }
});

module.exports = router;
