const db = require('../config/db');

// @route   POST /api/ai/analyze-topic
// @desc    Retrieve pre-generated intelligence for a topic
// @access  Private
exports.analyzeTopic = async (req, res) => {
    const { topicId } = req.body;

    try {
        const topicResult = await db.query(
            'SELECT ai_explanation, ai_common_traps, ai_strategy_notes, ai_generated FROM topics WHERE id = $1',
            [topicId]
        );

        if (topicResult.rows.length === 0) {
            return res.status(404).json({ msg: 'Topic not found' });
        }

        const { ai_explanation, ai_common_traps, ai_strategy_notes, ai_generated } = topicResult.rows[0];

        // HYBRID LOGIC: If not generated, do not call Gemini; inform the frontend.
        if (!ai_generated) {
            return res.json({
                generated: false,
                coreConcept: "AI Intelligence not generated. Contact Admin.",
                keyFormulas: "AI Intelligence not generated. Contact Admin.",
                commonPitfalls: "AI Intelligence not generated. Contact Admin."
            });
        }

        // Map DB columns back to frontend expected structure
        res.json({
            generated: true,
            coreConcept: ai_explanation,
            keyFormulas: ai_strategy_notes,
            commonPitfalls: ai_common_traps
        });

    } catch (error) {
        console.error('Topic Intelligence Retrieval Error:', error);
        res.status(500).json({ error: 'Failed to retrieve topic intelligence.' });
    }
};

// @route   POST /api/ai/solve-question
// @desc    Retrieve pre-generated solution vector for a PYQ
// @access  Private
exports.solveQuestion = async (req, res) => {
    const { pyqId } = req.body;

    try {
        const pyqResult = await db.query('SELECT ai_solution, ai_generated FROM pyq WHERE id = $1', [pyqId]);

        if (pyqResult.rows.length === 0) {
            return res.status(404).json({ msg: 'Question not found' });
        }

        const { ai_solution, ai_generated } = pyqResult.rows[0];

        // HYBRID LOGIC
        if (!ai_generated) {
            return res.json({
                generated: false,
                solution: {
                    steps: ["AI Solution Vector not generated."],
                    finalAnswer: "Contact Admin for analysis."
                }
            });
        }

        // Try parsing the text back into JSON for the frontend
        let parsedSolution = ai_solution;
        try {
            if (typeof ai_solution === 'string') {
                parsedSolution = JSON.parse(ai_solution);
            }
        } catch (e) { }

        res.json({
            generated: true,
            solution: parsedSolution,
            cached: true
        });

    } catch (error) {
        console.error('PYQ Solution Retrieval Error:', error);
        res.status(500).json({ error: 'Failed to retrieve solution.' });
    }
};

// @route   POST /api/ai/audio-brief
// @desc    Retrieve static audio briefing file path
// @access  Private
exports.audioBrief = async (req, res) => {
    const { topicId } = req.body;

    try {
        const topicResult = await db.query('SELECT audio_path, ai_generated FROM topics WHERE id = $1', [topicId]);

        if (topicResult.rows.length === 0) return res.status(404).json({ msg: 'Topic not found' });

        const { audio_path, ai_generated } = topicResult.rows[0];

        if (!ai_generated || !audio_path) {
            return res.json({
                generated: false,
                msg: 'Audio not available. Intelligence layer pending generation.',
                audioUrl: null
            });
        }

        res.json({
            generated: true,
            msg: 'Audio briefing retrieved successfully',
            audioUrl: audio_path
        });

    } catch (error) {
        console.error('Audio Retrieval Error:', error);
        res.status(500).json({ error: 'Failed to retrieve audio briefing.' });
    }
};
