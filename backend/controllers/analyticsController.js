const db = require('../config/db');
const intelligenceService = require('../services/intelligence.service');

// ── Existing Routes ──────────────────────────────────────────────────────────

// @route   GET /api/analytics/overview
exports.getOverview = async (req, res) => {
    try {
        const userId = req.user.id;
        const metricResult = await db.query(
            'SELECT * FROM neural_metrics WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 1',
            [userId]
        );
        if (metricResult.rows.length === 0) {
            return res.json({ neural_index: 0, focus_score: 0, delta: 0, cognitive_load: 0, msg: 'No data' });
        }
        res.json(metricResult.rows[0]);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/analytics/radar
exports.getRadar = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.query(
            `SELECT s.name, COALESCE(AVG(ss.accuracy), 0) as mastery
             FROM subjects s
             LEFT JOIN topics t ON s.id = t.subject_id
             LEFT JOIN study_sessions ss ON t.id = ss.topic_id AND ss.user_id = $1
             GROUP BY s.name`, [userId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/analytics/stability
exports.getStability = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.query(
            'SELECT delta, timestamp as date FROM neural_metrics WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 7',
            [userId]
        );
        res.json(result.rows.reverse());
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/analytics/mastery-grid
exports.getMasteryGrid = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.query(
            `SELECT
                s.id as subject_id, s.name, s.code,
                COALESCE(AVG(ss.accuracy), 0) as progress,
                COUNT(CASE WHEN t.weak_flag = true THEN 1 END) as weak_topics,
                MAX(ss.created_at) as last_revision
            FROM subjects s
            LEFT JOIN topics t ON s.id = t.subject_id
            LEFT JOIN study_sessions ss ON t.id = ss.topic_id AND ss.user_id = $1
            GROUP BY s.id, s.name, s.code
            ORDER BY s.id ASC`, [userId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/analytics/recent-activity
exports.getRecentActivity = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.query(
            `SELECT ss.id, ss.duration, ss.accuracy, ss.created_at, t.name as topic_name, s.code as subject_code
             FROM study_sessions ss
             JOIN topics t ON ss.topic_id = t.id
             JOIN subjects s ON t.subject_id = s.id
             WHERE ss.user_id = $1
             ORDER BY ss.created_at DESC
             LIMIT 5`, [userId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/analytics/resume-learning
exports.getResumeLearning = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.query(
            `SELECT t.id, t.name, t.subject_id, s.name as subject_name
             FROM topics t
             JOIN subjects s ON t.subject_id = s.id
             LEFT JOIN study_sessions ss ON t.id = ss.topic_id AND ss.user_id = $1
             ORDER BY (t.importance_weight * (1.0 - t.mastery_score)) DESC
             LIMIT 1`, [userId]
        );
        res.json(result.rows[0] || null);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/analytics/last-topic
exports.getLastTopic = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.query(
            `SELECT topic_id FROM study_sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`, [userId]
        );
        res.json(result.rows[0] || null);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};


// ── New Intelligence Routes ──────────────────────────────────────────────────

// @route   GET /api/analytics/overview/:subjectId
// @desc    Computed intelligence overview for a specific subject
exports.getSubjectOverview = async (req, res) => {
    try {
        const subjectId = parseInt(req.params.subjectId);
        if (isNaN(subjectId)) return res.status(400).json({ error: 'Invalid subject ID' });

        const overview = await intelligenceService.getSubjectOverview(subjectId, req.user.id);
        res.json(overview);
    } catch (err) {
        console.error('getSubjectOverview error:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @route   GET /api/analytics/recommendation/:subjectId
// @desc    Get highest-priority recommended topic for a subject
exports.getRecommendation = async (req, res) => {
    try {
        const subjectId = parseInt(req.params.subjectId);
        if (isNaN(subjectId)) return res.status(400).json({ error: 'Invalid subject ID' });

        const topic = await intelligenceService.getRecommendation(subjectId);
        if (!topic) return res.status(404).json({ msg: 'No topics available' });
        res.json(topic);
    } catch (err) {
        console.error('getRecommendation error:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @route   GET /api/analytics/weak-clusters/:subjectId
// @desc    Get all weak-flagged topics for a subject
exports.getWeakClusters = async (req, res) => {
    try {
        const subjectId = parseInt(req.params.subjectId);
        if (isNaN(subjectId)) return res.status(400).json({ error: 'Invalid subject ID' });

        const clusters = await intelligenceService.getWeakClusters(subjectId);
        res.json({ subject_id: subjectId, weak_count: clusters.length, topics: clusters });
    } catch (err) {
        console.error('getWeakClusters error:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};
