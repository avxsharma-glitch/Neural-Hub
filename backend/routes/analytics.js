const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

// ── Existing Routes ──────────────────────────────────────────────────────────
router.get('/overview', auth, analyticsController.getOverview);
router.get('/radar', auth, analyticsController.getRadar);
router.get('/stability', auth, analyticsController.getStability);
router.get('/mastery-grid', auth, analyticsController.getMasteryGrid);
router.get('/recent-activity', auth, analyticsController.getRecentActivity);
router.get('/resume-learning', auth, analyticsController.getResumeLearning);
router.get('/last-topic', auth, analyticsController.getLastTopic);

// ── New Intelligence Routes ──────────────────────────────────────────────────
router.get('/overview/:subjectId', auth, analyticsController.getSubjectOverview);
router.get('/recommendation/:subjectId', auth, analyticsController.getRecommendation);
router.get('/weak-clusters/:subjectId', auth, analyticsController.getWeakClusters);

module.exports = router;
