const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes placeholders
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/topics', require('./routes/topics'));
app.use('/api/pyq', require('./routes/pyq'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/analytics', require('./routes/analytics'));

// Serve frontend for all other routes (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, () => {
    console.log(`Neural Hub Backend initialized on port ${PORT}`);
});
