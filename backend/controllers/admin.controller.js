const db = require('../config/db');
const aiService = require('../services/aiGeneration.service');
const audioGen = require('../utils/pcmToWav');

// @route   POST /api/admin/generate/topic/:topicId
// @desc    Pre-generate Intelligence for a topic
// @access  Private/Admin
exports.generateTopic = async (req, res) => {
    const { topicId } = req.params;

    try {
        const topicResult = await db.query(
            'SELECT t.name as topic_name, s.name as subject_name, t.ai_generated FROM topics t JOIN subjects s ON t.subject_id = s.id WHERE t.id = $1',
            [topicId]
        );

        if (topicResult.rows.length === 0) return res.status(404).json({ msg: 'Topic not found' });

        const { topic_name, subject_name, ai_generated } = topicResult.rows[0];

        if (ai_generated) {
            return res.status(400).json({ msg: 'Intelligence already generated for this topic.' });
        }

        // Generate Text Intelligence
        const { content, tokensUsed } = await aiService.generateTopicIntelligence(topic_name, subject_name);

        // Update Database
        await db.query(`
            UPDATE topics 
            SET ai_explanation = $1, ai_common_traps = $2, ai_strategy_notes = $3, ai_generated = true, ai_generated_at = NOW()
            WHERE id = $4
        `, [content.ai_explanation, content.ai_common_traps, content.ai_strategy_notes, topicId]);

        // Log Usage
        await aiService.logUsage(db, 'topic', topicId, tokensUsed);

        res.json({ msg: 'Topic intelligence generated successfully', tokensUsed });
    } catch (error) {
        console.error('Admin Generate Topic Error:', error);
        res.status(500).json({ msg: 'Failed to generate topic intelligence', error: error.message });
    }
};

// @route   POST /api/admin/generate/pyq/:pyqId
// @desc    Pre-generate solution vector for PYQ
// @access  Private/Admin
exports.generatePyq = async (req, res) => {
    const { pyqId } = req.params;

    try {
        const pyqResult = await db.query('SELECT question_text, ai_generated FROM pyq WHERE id = $1', [pyqId]);
        if (pyqResult.rows.length === 0) return res.status(404).json({ msg: 'PYQ not found' });

        if (pyqResult.rows[0].ai_generated) {
            return res.status(400).json({ msg: 'Solution already generated for this PYQ.' });
        }

        const { content, tokensUsed } = await aiService.generatePyqSolution(pyqResult.rows[0].question_text);

        await db.query(`
            UPDATE pyq SET ai_solution = $1, ai_generated = true, ai_generated_at = NOW() WHERE id = $2
        `, [content, pyqId]);

        await aiService.logUsage(db, 'pyq', pyqId, tokensUsed);

        res.json({ msg: 'PYQ solution generated successfully', tokensUsed });
    } catch (error) {
        console.error('Admin Generate PYQ Error:', error);
        res.status(500).json({ msg: 'Failed to generate pyq solution', error: error.message });
    }
};

// @route   POST /api/admin/generate/audio/:topicId
// @desc    Pre-generate TTS audio briefing 
// @access  Private/Admin
exports.generateAudio = async (req, res) => {
    const { topicId } = req.params;

    try {
        const topicResult = await db.query('SELECT ai_explanation, audio_path FROM topics WHERE id = $1', [topicId]);
        if (topicResult.rows.length === 0) return res.status(404).json({ msg: 'Topic not found' });

        if (!topicResult.rows[0].ai_explanation) {
            return res.status(400).json({ msg: 'Generate topic text intelligence before generating audio.' });
        }

        if (topicResult.rows[0].audio_path) {
            return res.status(400).json({ msg: 'Audio already generated for this topic.' });
        }

        const audioPath = await audioGen.generateAndSaveAudio(topicResult.rows[0].ai_explanation, topicId);

        await db.query('UPDATE topics SET audio_path = $1 WHERE id = $2', [audioPath, topicId]);

        // Simulating character token usage for TTS logging
        await aiService.logUsage(db, 'audio', topicId, topicResult.rows[0].ai_explanation.length);

        res.json({ msg: 'Audio briefing generated successfully', audioPath });
    } catch (error) {
        console.error('Admin Generate Audio Error:', error);
        res.status(500).json({ msg: 'Failed to generate audio', error: error.message });
    }
};

// @route   POST /api/admin/generate/all
// @desc    Batch generate all pending intelligence where ai_generated = false
// @access  Private/Admin
exports.generateAll = async (req, res) => {
    // In a robust production environment, this would span a background worker.
    // For this MVP, we return a success receipt and process simple queue asynchronously.
    res.json({ msg: 'Batch generation initiated. Check logs for completion.' });

    try {
        // 1. Topics
        const topics = await db.query('SELECT id, name FROM topics WHERE ai_generated = false');
        for (let row of topics.rows) {
            try {
                // To keep this MVP simple, fetching subjects individually or joining in the upper query
                const joined = await db.query('SELECT s.name as subject_name FROM topics t JOIN subjects s ON t.subject_id = s.id WHERE t.id = $1', [row.id]);
                const { content, tokensUsed } = await aiService.generateTopicIntelligence(row.name, joined.rows[0].subject_name);
                await db.query(`UPDATE topics SET ai_explanation = $1, ai_common_traps = $2, ai_strategy_notes = $3, ai_generated = true, ai_generated_at = NOW() WHERE id = $4`, [content.ai_explanation, content.ai_common_traps, content.ai_strategy_notes, row.id]);
                await aiService.logUsage(db, 'topic', row.id, tokensUsed);
            } catch (e) {
                console.error(`Batch Topic Gen Error ID ${row.id}:`, e.message);
            }
        }

        // 2. PYQs
        const pyqs = await db.query('SELECT id, question_text FROM pyq WHERE ai_generated = false');
        for (let row of pyqs.rows) {
            try {
                const { content, tokensUsed } = await aiService.generatePyqSolution(row.question_text);
                await db.query(`UPDATE pyq SET ai_solution = $1, ai_generated = true, ai_generated_at = NOW() WHERE id = $2`, [content, row.id]);
                await aiService.logUsage(db, 'pyq', row.id, tokensUsed);
            } catch (e) {
                console.error(`Batch PYQ Gen Error ID ${row.id}:`, e.message);
            }
        }
    } catch (error) {
        console.error('Batch generation orchestrator failed:', error);
    }
};
