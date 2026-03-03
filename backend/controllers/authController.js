const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user exists
        let userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length > 0) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Create user
        const newUserResult = await db.query(
            'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
            [name, email, password_hash]
        );

        const user = newUserResult.rows[0];

        // Return jsonwebtoken
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5 days' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        let userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const user = userResult.rows[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Return jsonwebtoken
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5 days' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
