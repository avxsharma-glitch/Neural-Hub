// API Module for backend communication

const API_BASE = 'http://localhost:3000/api';

class ApiService {
    static async request(endpoint, method = 'GET', body = null) {
        const token = localStorage.getItem('nh_token');
        const headers = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            method,
            headers
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || data.error || 'API Request Failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth
    static login(email, password) {
        return this.request('/auth/login', 'POST', { email, password });
    }

    static register(name, email, password) {
        return this.request('/auth/register', 'POST', { name, email, password });
    }

    // Data
    static getSubjects() {
        return this.request('/subjects');
    }

    static getTopics(subjectId) {
        return this.request(`/topics/${subjectId}`);
    }

    static getPYQ(subjectId) {
        return this.request(`/pyq/${subjectId}`);
    }

    // AI
    static analyzeTopic(topicId) {
        return this.request('/ai/analyze-topic', 'POST', { topicId });
    }

    static solveQuestion(pyqId) {
        return this.request('/ai/solve-question', 'POST', { pyqId });
    }

    static getAudioBrief(topicId) {
        return this.request('/ai/audio-brief', 'POST', { topicId });
    }

    // Analytics
    static getOverview() {
        return this.request('/analytics/overview');
    }

    static getRadarData() {
        return this.request('/analytics/radar');
    }

    static getStabilityHistory() {
        return this.request('/analytics/stability');
    }

    static getMasteryGrid() {
        return this.request('/analytics/mastery-grid');
    }

    static getRecentActivity() {
        return this.request('/analytics/recent-activity');
    }

    static getResumeLearning() {
        return this.request('/analytics/resume-learning');
    }

    static getLastTopic() {
        return this.request('/analytics/last-topic');
    }

    // ── Intelligence Engine Methods ──────────────────────────────────────────

    /** Computed intelligence overview for a specific subject (neural index, weak count, etc.) */
    static getSubjectOverview(subjectId) {
        return this.request(`/analytics/overview/${subjectId}`);
    }

    /** Get top recommended topic for a subject (highest importance × (1-mastery)) */
    static getRecommendation(subjectId) {
        return this.request(`/analytics/recommendation/${subjectId}`);
    }

    /** Get all weak-cluster topics for a subject (mastery < 0.6 AND importance >= 4) */
    static getWeakClusters(subjectId) {
        return this.request(`/analytics/weak-clusters/${subjectId}`);
    }

    /** Log a study session (lesson completion or PYQ self-eval) */
    static logSession(topicId, duration, accuracy, cognitiveIntensity = 5) {
        return this.request('/sessions', 'POST', {
            topic_id: topicId,
            duration,
            accuracy,
            cognitive_intensity: cognitiveIntensity
        });
    }
}
