const Notification = require('../models/Notification');
const Ticket = require('../models/Ticket');

// @desc    Get all notifications for logged in employee
// @route   GET /api/notifications
// @access  Private (Employee)
const getEmployeeNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    // --- Dynamic Generation of Due Date / Overdue Notifications ---
    // Find active tickets assigned to this employee
    const activeTickets = await Ticket.find({
      assignedTo: userId,
      status: { $in: ['active', 'in_process'] },
      dueDate: { $exists: true, $ne: null }
    }).lean();

    const now = new Date();
    
    for (const ticket of activeTickets) {
      const due = new Date(ticket.dueDate);
      const diffHours = (due - now) / (1000 * 60 * 60);

      if (diffHours < 0) {
        // OVERDUE
        const exists = await Notification.exists({
          user: userId,
          type: 'task_overdue',
          link: `?tab=ticket-detail&id=${ticket._id}`
        });
        if (!exists) {
          await Notification.create({
            user: userId,
            type: 'task_overdue',
            title: 'Task Overdue',
            message: `Ticket #${ticket.ticketId} is overdue. Please address it immediately.`,
            link: `?tab=ticket-detail&id=${ticket._id}`
          });
        }
      } else if (diffHours > 0 && diffHours <= 48) {
        // DUE SOON (Approaching)
        const exists = await Notification.exists({
          user: userId,
          type: 'due_approaching',
          link: `?tab=ticket-detail&id=${ticket._id}`
        });
        if (!exists) {
          await Notification.create({
            user: userId,
            type: 'due_approaching',
            title: 'Due Date Approaching',
            message: `Ticket #${ticket.ticketId} is due within 48 hours.`,
            link: `?tab=ticket-detail&id=${ticket._id}`
          });
        }
      }
    }
    // -------------------------------------------------------------

    // Fetch notifications
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private (Employee)
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private (Employee)
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEmployeeNotifications,
  markAsRead,
  markAllAsRead
};
