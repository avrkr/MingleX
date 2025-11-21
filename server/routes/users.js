const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const User = require('../models/User');

router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/', authenticateToken, async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user.id } }).select('displayName avatarUrl email');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
