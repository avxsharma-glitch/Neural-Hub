const db = require('../config/db');

// @route   GET /api/subjects
// @desc    Get all subjects
// @access  Private
exports.getSubjects = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM subjects ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/topics/:subjectId
// @desc    Get topics by subject ID
// @access  Private
exports.getTopics = async (req, res) => {
    try {
        const subjectId = req.params.subjectId;
        const result = await db.query('SELECT * FROM topics WHERE subject_id = $1 ORDER BY importance_weight DESC', [subjectId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/pyq/:subjectId
// @desc    Get previous year questions by subject ID
// @access  Private
exports.getPYQ = async (req, res) => {
    try {
        const subjectId = req.params.subjectId;
        const result = await db.query('SELECT * FROM pyq WHERE subject_id = $1 ORDER BY year DESC', [subjectId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
