const client = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        // Check if user exists
        const userExists = await client.execute({
            sql: 'SELECT * FROM users WHERE email = ?',
            args: [email]
        });

        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await client.execute({
            sql: 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            args: [name, email, hashedPassword, role || 'STUDENT']
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await client.execute({
            sql: 'SELECT * FROM users WHERE email = ?',
            args: [email]
        });

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                profile_photo: user.profile_photo
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateProfile = async (req, res) => {
    const { name } = req.body;
    const userId = req.user.id;

    try {
        await client.execute({
            sql: 'UPDATE users SET name = ? WHERE id = ?',
            args: [name, userId]
        });

        // Fetch updated user to return
        const result = await client.execute({
            sql: 'SELECT id, name, email, role, profile_photo FROM users WHERE id = ?',
            args: [userId]
        });

        res.json({ message: 'Profile updated successfully', user: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
        const result = await client.execute({
            sql: 'SELECT password FROM users WHERE id = ?',
            args: [userId]
        });

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await client.execute({
            sql: 'UPDATE users SET password = ? WHERE id = ?',
            args: [hashedPassword, userId]
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { register, login, updateProfile, changePassword };
