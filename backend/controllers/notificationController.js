const Notification = require('../models/Notification');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Client = require('../models/client/Client');

// @desc    Get all notifications for logged in user (Client, Employee, Partner, Admin)
// @route   GET /api/notifications
// @access  Private
const getEmployeeNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    // --- Dynamic Generation of Due Date / Overdue Notifications (for employees) ---
    if (req.user.role === 'employee') {
      const activeTickets = await Ticket.find({
        assignedTo: userId,
        status: { $in: ['active', 'in_process'] },
        dueDate: { $exists: true, $ne: null },
      }).lean();

      const now = new Date();
      for (const ticket of activeTickets) {
        const due = new Date(ticket.dueDate);
        const diffHours = (due - now) / (1000 * 60 * 60);

        if (diffHours < 0) {
          const exists = await Notification.exists({
            $or: [{ user: userId }, { userId }],
            type: 'task_overdue',
            link: `?tab=ticket-detail&id=${ticket._id}`,
          });
          if (!exists) {
            await Notification.create({
              user: userId,
              userId: userId,
              type: 'task_overdue',
              title: 'Task Overdue',
              message: `Ticket #${ticket.ticketId || ticket.ticketNo || ticket._id} is overdue. Please address it immediately.`,
              link: `?tab=ticket-detail&id=${ticket._id}`,
            });
          }
        } else if (diffHours > 0 && diffHours <= 48) {
          const exists = await Notification.exists({
            $or: [{ user: userId }, { userId }],
            type: 'due_approaching',
            link: `?tab=ticket-detail&id=${ticket._id}`,
          });
          if (!exists) {
            await Notification.create({
              user: userId,
              userId: userId,
              type: 'due_approaching',
              title: 'Due Date Approaching',
              message: `Ticket #${ticket.ticketId || ticket.ticketNo || ticket._id} is due within 48 hours.`,
              link: `?tab=ticket-detail&id=${ticket._id}`,
            });
          }
        }
      }
    }
    // -------------------------------------------------------------

    // Fetch notifications for this user/client
    const notifications = await Notification.find({
      $or: [
        { user: userId },
        { userId: userId },
        { clientId: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.json({
      success: true,
      data: notifications,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('[getNotifications]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [
          { user: userId },
          { userId: userId },
          { clientId: userId },
        ],
      },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.updateMany(
      {
        $or: [
          { user: userId },
          { userId: userId },
          { clientId: userId },
        ],
        isRead: false,
      },
      { isRead: true }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Notify a specific client (Superadmin, Super Partner, Partner, or Employee)
// @route   POST /api/notifications/notify-client
// @access  Private
const notifyClient = async (req, res) => {
  try {
    const { clientId, title, message, type = 'general', link = '' } = req.body;

    if (!clientId || !title || !message) {
      return res.status(400).json({ success: false, message: 'clientId, title, and message are required.' });
    }

    const notif = await Notification.create({
      user: clientId,
      userId: clientId,
      clientId: clientId,
      sender: req.user._id,
      senderRole: req.user.role || 'admin',
      type,
      title,
      message,
      link,
      isRead: false,
    });

    // Real-time broadcast via Socket.io
    const io = global.io || req.app.get('io');
    if (io) {
      io.emit('notification', {
        ...notif.toObject(),
        targetUserId: clientId.toString(),
      });
      io.emit('notification_created', notif);
    }

    res.status(201).json({
      success: true,
      message: 'Notification sent to client successfully.',
      data: notif,
    });
  } catch (error) {
    console.error('[notifyClient]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEmployeeNotifications,
  markAsRead,
  markAllAsRead,
  notifyClient,
};
