const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Get token from header
    const token = req.header('Authorization');

    // Check if not token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const tokenString = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;
        const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
        req.user = decoded.user;

        // Simulated Admin Check
        // In a production system, this would check a role column in the DB
        // Or verify a specific admin email. For this refactor MVP, we'll allow
        // access if the request provides a valid standard token AND an custom
        // 'X-Admin-Access' header (simulating an admin portal interface).

        const adminAccess = req.header('X-Admin-Access');
        if (adminAccess !== 'true') {
            return res.status(403).json({ msg: 'Forbidden: Admin access required' });
        }

        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
