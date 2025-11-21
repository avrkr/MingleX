const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    type: { type: String, enum: ['dm', 'group'], default: 'dm' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    name: { type: String }, // For group chats
    avatarUrl: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);
