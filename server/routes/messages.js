const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

router.get('/:conversationId', authenticateToken, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({ conversationId })
            .populate('senderId', 'displayName avatarUrl')
            .sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', authenticateToken, async (req, res) => {
    try {
        const { conversationId, content, type, attachments } = req.body;
        const message = await Message.create({
            conversationId,
            senderId: req.user.id,
            content,
            type,
            attachments
        });

        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: message._id,
            updatedAt: new Date()
        });

        const populatedMessage = await Message.findById(message._id).populate('senderId', 'displayName avatarUrl');

        // Emit socket event (access io instance somehow, or rely on client to emit)
        // Ideally we import io or use req.app.get('io')
        const io = req.app.get('io'); // Need to set this in index.js
        if (io) {
            io.to(conversationId).emit('message:new', populatedMessage);
        }

        res.json(populatedMessage);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
