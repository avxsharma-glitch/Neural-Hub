const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001'] }));
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'NEURAL HUB Backend is live 🚀', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/topics', require('./routes/topics'));
app.use('/api/pyq', require('./routes/pyq'));
app.use('/api/concepts', require('./routes/concepts'));
app.use('/api/practice', require('./routes/practice'));
app.use('/api/analytics', require('./routes/analytics'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Internal Server Error', message: err.message });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: `Route ${req.path} not found` });
});

app.listen(PORT, () => {
    console.log(`\n⚡ NEURAL HUB Backend running on http://localhost:${PORT}`);
    console.log(`📡 API Endpoints:
  GET  /api/health
  POST /api/auth/register
  POST /api/auth/login
  GET  /api/subjects
  GET  /api/subjects/:id/units
  GET  /api/topics?unitId=
  GET  /api/topics/:id
  GET  /api/pyq?topicId=&year=&difficulty=
  GET  /api/practice/random?count=&difficulty=
  GET  /api/concepts
  GET  /api/analytics/user/:id
  POST /api/analytics/progress
    `);
});
