/**
 * NEURAL HUB // AVX
 * Intelligence Service Layer
 * Deterministic, rule-based, zero-AI computation.
 *
 * Computes:
 *   - frequency_score     = pyq_count / distinct_years
 *   - exam_priority_score = (freq×0.5) + (difficulty×0.3) + (importance×0.2)
 *   - weak_flag           = mastery_score < 0.6 AND importance_weight >= 4
 *   - NeuralIndex         = (mastery×0.4) + (consistency×0.2) + (priority×0.3) + (revision_freq×0.1)
 */

const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const db = require('../config/db');

// Separate pool for transactions (db.js only exposes query helper)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Compute and persist intelligence metrics for all topics (or a specific subject).
 * @param {number|null} subjectId - if null, runs for ALL subjects
 * @returns summary report object
 */
async function runIntelligenceComputation(subjectId = null) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // ── 1. Fetch topics with their PYQ data ──────────────────────────────
        const topicQuery = subjectId
            ? `SELECT t.id, t.subject_id, t.importance_weight, t.difficulty_score, t.mastery_score, t.revision_count
               FROM topics t WHERE t.subject_id = $1`
            : `SELECT t.id, t.subject_id, t.importance_weight, t.difficulty_score, t.mastery_score, t.revision_count
               FROM topics t`;

        const topicResult = await client.query(topicQuery, subjectId ? [subjectId] : []);
        const topics = topicResult.rows;

        let topicsUpdated = 0;
        let weakClustersDetected = 0;

        for (const topic of topics) {
            // ── 2. Frequency Score ────────────────────────────────────────────
            // frequency = PYQ count / distinct years span
            const pyqResult = await client.query(
                `SELECT COUNT(*) as total, COUNT(DISTINCT year) as distinct_years
                 FROM pyq WHERE topic_id = $1`,
                [topic.id]
            );
            const pyqTotal = parseInt(pyqResult.rows[0].total) || 0;
            const distinctYears = parseInt(pyqResult.rows[0].distinct_years) || 1;

            // Normalise to 0–1 scale (cap at 5 PYQs = max frequency)
            const rawFrequency = pyqTotal / distinctYears;
            const frequencyScore = Math.min(rawFrequency / 5, 1.0);

            // ── 3. Exam Priority Score ────────────────────────────────────────
            const importance = parseFloat(topic.importance_weight) / 5; // normalise 1–5 → 0–1
            const difficulty = parseFloat(topic.difficulty_score) / 5;
            const examPriority = (frequencyScore * 0.5) + (difficulty * 0.3) + (importance * 0.2);

            // ── 4. Weak Flag ──────────────────────────────────────────────────
            const mastery = parseFloat(topic.mastery_score) || 0.0;
            const impWeight = parseFloat(topic.importance_weight);
            const weakFlag = mastery < 0.6 && impWeight >= 4;

            if (weakFlag) weakClustersDetected++;

            // ── 5. Persist ────────────────────────────────────────────────────
            await client.query(
                `UPDATE topics
                 SET frequency_score     = $1,
                     exam_priority_score = $2,
                     weak_flag           = $3
                 WHERE id = $4`,
                [
                    parseFloat(frequencyScore.toFixed(4)),
                    parseFloat(examPriority.toFixed(4)),
                    weakFlag,
                    topic.id
                ]
            );

            topicsUpdated++;
        }

        await client.query('COMMIT');

        // ── 6. Count subjects processed ───────────────────────────────────────
        const subjectCountResult = await client.query(
            subjectId
                ? 'SELECT COUNT(DISTINCT subject_id) as cnt FROM topics WHERE subject_id = $1'
                : 'SELECT COUNT(DISTINCT subject_id) as cnt FROM topics',
            subjectId ? [subjectId] : []
        );
        const subjectsProcessed = parseInt(subjectCountResult.rows[0].cnt) || 0;

        return { subjects_processed: subjectsProcessed, topics_updated: topicsUpdated, weak_clusters_detected: weakClustersDetected };

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

/**
 * Get computed overview for a subject.
 * @param {number} subjectId
 * @param {number|null} userId - for user-specific mastery from study_sessions
 */
async function getSubjectOverview(subjectId, userId = null) {
    // Total topics and PYQs
    const countsResult = await db.query(
        `SELECT
            COUNT(DISTINCT t.id)          AS total_topics,
            COUNT(p.id)                   AS total_pyqs,
            AVG(t.mastery_score)          AS average_mastery,
            COUNT(CASE WHEN t.weak_flag = true THEN 1 END) AS weak_cluster_count,
            AVG(t.exam_priority_score)    AS weighted_priority_score
         FROM topics t
         LEFT JOIN pyq p ON p.topic_id = t.id
         WHERE t.subject_id = $1`,
        [subjectId]
    );
    const counts = countsResult.rows[0];

    // Highest priority topic
    const topicResult = await db.query(
        `SELECT id, name, exam_priority_score
         FROM topics WHERE subject_id = $1
         ORDER BY exam_priority_score DESC LIMIT 1`,
        [subjectId]
    );

    // Revision frequency: average revision_count across topics (0–1 normalised, cap 10)
    const revResult = await db.query(
        'SELECT COALESCE(AVG(revision_count), 0) as avg_rev FROM topics WHERE subject_id = $1',
        [subjectId]
    );
    const revisionFrequency = Math.min(parseFloat(revResult.rows[0].avg_rev) / 10, 1.0);

    // Consistency score: from study_sessions (if user provided), else 0
    let consistencyScore = 0;
    if (userId) {
        const sessResult = await db.query(
            `SELECT COALESCE(AVG(accuracy), 0) / 100.0 AS consistency
             FROM study_sessions ss
             JOIN topics t ON ss.topic_id = t.id
             WHERE t.subject_id = $1 AND ss.user_id = $2`,
            [subjectId, userId]
        );
        consistencyScore = parseFloat(sessResult.rows[0].consistency) || 0;
    }

    const averageMastery = parseFloat(counts.average_mastery) || 0;
    const weightedPriorityScore = parseFloat(counts.weighted_priority_score) || 0;

    // NeuralIndex = (mastery×0.4) + (consistency×0.2) + (priority×0.3) + (revision_freq×0.1)
    const neuralIndex = (
        (averageMastery * 0.4) +
        (consistencyScore * 0.2) +
        (weightedPriorityScore * 0.3) +
        (revisionFrequency * 0.1)
    );

    return {
        subject_id: parseInt(subjectId),
        total_topics: parseInt(counts.total_topics) || 0,
        total_pyqs: parseInt(counts.total_pyqs) || 0,
        average_mastery: parseFloat(averageMastery.toFixed(4)),
        weak_cluster_count: parseInt(counts.weak_cluster_count) || 0,
        highest_priority_topic: topicResult.rows[0] || null,
        neural_index: parseFloat(neuralIndex.toFixed(4)),
        revision_frequency: parseFloat(revisionFrequency.toFixed(4)),
        consistency_score: parseFloat(consistencyScore.toFixed(4)),
        weighted_priority_score: parseFloat(weightedPriorityScore.toFixed(4))
    };
}

/**
 * Get recommendation: topic with highest importance × (1 - mastery) for a subject.
 */
async function getRecommendation(subjectId) {
    const result = await db.query(
        `SELECT
            t.id   AS topic_id,
            t.name AS topic_name,
            t.exam_priority_score AS priority_score,
            t.importance_weight,
            t.mastery_score,
            t.weak_flag,
            s.name AS subject_name
         FROM topics t
         JOIN subjects s ON t.subject_id = s.id
         WHERE t.subject_id = $1
         ORDER BY (t.importance_weight * (1.0 - t.mastery_score)) DESC
         LIMIT 1`,
        [subjectId]
    );
    return result.rows[0] || null;
}

/**
 * Get all weak cluster topics for a subject.
 */
async function getWeakClusters(subjectId) {
    const result = await db.query(
        `SELECT
            t.id, t.name, t.importance_weight, t.difficulty_score,
            t.mastery_score, t.exam_priority_score, t.frequency_score
         FROM topics t
         WHERE t.subject_id = $1 AND t.weak_flag = true
         ORDER BY t.exam_priority_score DESC`,
        [subjectId]
    );
    return result.rows;
}

module.exports = {
    runIntelligenceComputation,
    getSubjectOverview,
    getRecommendation,
    getWeakClusters
};
