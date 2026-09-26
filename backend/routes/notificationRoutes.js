const express = require('express');
const router = express.Router();
const {
  getEmployeeNotifications,
  markAsRead,
  markAllAsRead,
  notifyClient,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getEmployeeNotifications);
router.patch('/read-all', protect, markAllAsRead);
router.patch('/:id/read', protect, markAsRead);
router.post('/notify-client', protect, notifyClient);

module.exports = router;
