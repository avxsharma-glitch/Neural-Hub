const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const auth = require('../middleware/auth');

router.get('/:subjectId', auth, apiController.getPYQ);

module.exports = router;
