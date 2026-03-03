const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');

router.post('/analyze-topic', auth, aiController.analyzeTopic);
router.post('/solve-question', auth, aiController.solveQuestion);
router.post('/audio-brief', auth, aiController.audioBrief);

module.exports = router;
