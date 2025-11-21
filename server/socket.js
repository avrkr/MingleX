const User = require('./models/User');
const Message = require('./models/Message');

module.exports = (io) => {
    io.on('connection', async (socket) => {
        const userId = socket.handshake.query.userId;

        if (userId) {
            console.log(`User connected: ${userId}`);
            await User.findByIdAndUpdate(userId, { isOnline: true });
            socket.broadcast.emit('user:online', userId);
        }

        socket.on('join', (conversationId) => {
            socket.join(conversationId);
            console.log(`User ${userId} joined room ${conversationId}`);
        });

        socket.on('leave', (conversationId) => {
            socket.leave(conversationId);
        });

        socket.on('typing:start', ({ conversationId, user }) => {
            socket.to(conversationId).emit('typing:start', { conversationId, user });
        });

        socket.on('typing:stop', ({ conversationId, user }) => {
            socket.to(conversationId).emit('typing:stop', { conversationId, user });
        });

        socket.on('message:delivered', async ({ messageId, conversationId }) => {
            try {
                await Message.findByIdAndUpdate(messageId, {
                    status: 'delivered',
                    deliveredAt: new Date()
                });
                socket.to(conversationId).emit('message:status_update', { messageId, status: 'delivered', userId });
            } catch (error) {
                console.error('Error updating message status:', error);
            }
        });

        socket.on('message:seen', async ({ messageId, conversationId }) => {
            try {
                await Message.findByIdAndUpdate(messageId, {
                    status: 'seen',
                    seenAt: new Date(),
                    $addToSet: { readBy: userId }
                });
                socket.to(conversationId).emit('message:status_update', { messageId, status: 'seen', userId });
            } catch (error) {
                console.error('Error updating message status:', error);
            }
        });

        // WebRTC Signaling
        socket.on('call:signal', (data) => {
            const { to, signal, from, type } = data;
            // 'to' is the conversationId (room)
            socket.to(to).emit('call:signal', { signal, from, type });
        });

        socket.on('call:start', ({ conversationId, callerId }) => {
            socket.to(conversationId).emit('call:incoming', { conversationId, callerId });
        });

        socket.on('disconnect', async () => {
            if (userId) {
                console.log(`User disconnected: ${userId}`);
                await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
                socket.broadcast.emit('user:offline', userId);
            }
        });
    });
};
