const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const Conversation = require('../models/Conversation');

router.get('/', authenticateToken, async (req, res) => {
    try {
        const conversations = await Conversation.find({ members: req.user.id })
            .populate('members', 'displayName avatarUrl isOnline')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });
        res.json(conversations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', authenticateToken, async (req, res) => {
    try {
        const { receiverId } = req.body;
        // Check if DM exists
        let conversation = await Conversation.findOne({
            type: 'dm',
            members: { $all: [req.user.id, receiverId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                type: 'dm',
                members: [req.user.id, receiverId],
                createdBy: req.user.id
            });
        }

        const populated = await Conversation.findById(conversation._id).populate('members', 'displayName avatarUrl');
        res.json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
