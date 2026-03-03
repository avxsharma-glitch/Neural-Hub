const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const auth = require('../middleware/auth');

router.get('/', auth, apiController.getSubjects);

module.exports = router;
