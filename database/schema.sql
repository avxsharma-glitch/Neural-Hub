-- NEURAL HUB // AVX Database Schema

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5)
);

CREATE TABLE IF NOT EXISTS topics (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    importance_weight DECIMAL(3, 2) DEFAULT 1.00,
    difficulty_score DECIMAL(3, 2) DEFAULT 1.00,
    weak_flag BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS pyq (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
    ai_solution_cache TEXT
);

CREATE TABLE IF NOT EXISTS study_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
    duration INTEGER NOT NULL, -- in minutes
    accuracy INTEGER CHECK (accuracy BETWEEN 0 AND 100),
    cognitive_intensity INTEGER CHECK (cognitive_intensity BETWEEN 1 AND 10),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS neural_metrics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    neural_index DECIMAL(5, 2) NOT NULL,
    focus_score DECIMAL(5, 2) NOT NULL,
    delta DECIMAL(5, 2) NOT NULL,
    cognitive_load DECIMAL(5, 2) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_topics_subject ON topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_pyq_subject ON pyq(subject_id);
CREATE INDEX IF NOT EXISTS idx_pyq_topic ON pyq(topic_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_neural_metrics_user ON neural_metrics(user_id);
