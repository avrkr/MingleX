const User = require('../models/User');
const Conversation = require('../models/Conversation');

exports.sendFriendRequest = async (req, res) => {
    try {
        const { toUserId } = req.body;
        const fromUserId = req.user.id;

        if (fromUserId === toUserId) return res.status(400).json({ message: "Cannot send request to yourself" });

        const targetUser = await User.findById(toUserId);
        if (!targetUser) return res.status(404).json({ message: "User not found" });

        if (targetUser.friends.includes(fromUserId)) {
            return res.status(400).json({ message: "Already friends" });
        }

        const existingRequest = targetUser.friendRequests.find(req => req.from.toString() === fromUserId && req.status === 'pending');
        if (existingRequest) {
            return res.status(400).json({ message: "Friend request already sent" });
        }

        targetUser.friendRequests.push({ from: fromUserId });
        await targetUser.save();

        // Emit socket event for real-time notification
        const io = req.app.get('io');
        const fromUser = await User.findById(fromUserId).select('displayName email avatarUrl');
        if (io) {
            io.emit('friend:request', {
                toUserId,
                from: fromUser,
                requestId: targetUser.friendRequests[targetUser.friendRequests.length - 1]._id
            });
        }

        res.json({ message: "Friend request sent" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.acceptFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        const request = user.friendRequests.id(requestId);

        if (!request) return res.status(404).json({ message: "Request not found" });
        if (request.status !== 'pending') return res.status(400).json({ message: "Request already handled" });

        const requesterId = request.from;
        const requester = await User.findById(requesterId);

        if (!requester) return res.status(404).json({ message: "Requester not found" });

        // Add to friends list
        user.friends.push(requesterId);
        requester.friends.push(userId);

        // Update request status
        request.status = 'accepted';

        // Create a conversation for them
        let conversation = await Conversation.findOne({
            members: { $all: [userId, requesterId] },
            type: 'dm'
        });

        if (!conversation) {
            conversation = await Conversation.create({
                members: [userId, requesterId],
                type: 'dm'
            });
        }

        await user.save();
        await requester.save();

        // Emit socket events for real-time updates
        const io = req.app.get('io');
        if (io) {
            // Notify the requester that their request was accepted
            io.emit('friend:accepted', {
                userId: requesterId,
                newFriend: { _id: userId, displayName: user.displayName, email: user.email, avatarUrl: user.avatarUrl, isOnline: user.isOnline },
                conversationId: conversation._id
            });
            // Notify the accepter with updated friend list
            io.emit('friend:accepted', {
                userId: userId,
                newFriend: { _id: requesterId, displayName: requester.displayName, email: requester.email, avatarUrl: requester.avatarUrl, isOnline: requester.isOnline },
                conversationId: conversation._id
            });
        }

        res.json({ message: "Friend request accepted", conversationId: conversation._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.rejectFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        const request = user.friendRequests.id(requestId);

        if (!request) return res.status(404).json({ message: "Request not found" });

        request.status = 'rejected';
        // Optionally remove it
        user.friendRequests.pull(requestId);

        await user.save();

        res.json({ message: "Friend request rejected" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getFriends = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('friends', 'displayName email avatarUrl isOnline lastSeen');
        res.json(user.friends);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getFriendRequests = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('friendRequests.from', 'displayName email avatarUrl');
        const pendingRequests = user.friendRequests.filter(r => r.status === 'pending');
        res.json(pendingRequests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
