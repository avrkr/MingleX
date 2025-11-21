const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

router.post('/request', friendController.sendFriendRequest);
router.post('/accept', friendController.acceptFriendRequest);
router.post('/reject', friendController.rejectFriendRequest);
router.get('/', friendController.getFriends);
router.get('/requests', friendController.getFriendRequests);

module.exports = router;
