const TicketTask = require('../models/TicketTask');
const { resolveUserMap } = require('../utils/userResolver');

// @desc    Get all ticket tasks
// @route   GET /api/ticket-tasks
// @access  Private (Super Admin)
const getTicketTasks = async (req, res) => {
  try {
    const query = {};
    if (req.query.ticket) query.ticket = req.query.ticket;
    if (req.query.client) query.client = req.query.client;

    const tasks = await TicketTask.find(query)
      .populate({ path: 'ticket', select: 'ticketNo subject service status' })
      .lean();

    const userIds = [];
    tasks.forEach(t => {
      if (t.client) userIds.push(t.client);
      if (t.assignedTo) userIds.push(t.assignedTo);
    });

    const userMap = await resolveUserMap(userIds);

    const populatedTasks = tasks.map(t => ({
      ...t,
      client: t.client ? (userMap[t.client.toString()] || t.client) : null,
      assignedTo: t.assignedTo ? (userMap[t.assignedTo.toString()] || t.assignedTo) : null
    }));

    res.status(200).json(populatedTasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new ticket task
// @route   POST /api/ticket-tasks
// @access  Private (Super Admin)
const createTicketTask = async (req, res) => {
  try {
    const task = new TicketTask(req.body);
    const createdTask = await task.save();
    
    const raw = await TicketTask.findById(createdTask._id)
      .populate({ path: 'ticket', select: 'ticketNo subject service status' })
      .lean();

    const userMap = await resolveUserMap([raw.client, raw.assignedTo]);
    const populatedTask = {
      ...raw,
      client: raw.client ? (userMap[raw.client.toString()] || raw.client) : null,
      assignedTo: raw.assignedTo ? (userMap[raw.assignedTo.toString()] || raw.assignedTo) : null
    };
      
    if (global.io) {
      global.io.emit('ticket_task_created', populatedTask);
    }

    if (raw.assignedTo) {
      const Notification = require('../models/Notification');
      const assignerId = req.user ? req.user._id.toString() : null;
      if (assignerId !== raw.assignedTo.toString()) {
        const title = raw.mainHeading || 'Untitled Task';
        await Notification.create({
          user: raw.assignedTo,
          type: 'task_assigned',
          title: 'New Task Assigned',
          message: `You have been assigned a new task: ${title}`,
          link: `/tasks`
        });
        if (global.io) {
          global.io.emit('notification_created', { user: raw.assignedTo });
        }
      }
    }

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a ticket task
// @route   PUT /api/ticket-tasks/:id
// @access  Private (Super Admin)
const updateTicketTask = async (req, res) => {
  try {
    const task = await TicketTask.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update fields
    await TicketTask.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    const raw = await TicketTask.findById(req.params.id)
      .populate({ path: 'ticket', select: 'ticketNo subject service status' })
      .lean();

    const userMap = await resolveUserMap([raw.client, raw.assignedTo]);
    const updatedTask = {
      ...raw,
      client: raw.client ? (userMap[raw.client.toString()] || raw.client) : null,
      assignedTo: raw.assignedTo ? (userMap[raw.assignedTo.toString()] || raw.assignedTo) : null
    };

    if (global.io) {
      global.io.emit('ticket_task_updated', updatedTask);
    }

    if (raw.assignedTo) {
      const Notification = require('../models/Notification');
      const updaterId = req.user ? req.user._id.toString() : null;
      if (updaterId !== raw.assignedTo.toString()) {
        const title = raw.mainHeading || 'Untitled Task';
        if (task.assignedTo?.toString() !== raw.assignedTo.toString()) {
          await Notification.create({
            user: raw.assignedTo,
            type: 'task_reassigned',
            title: 'Task Reassigned',
            message: `A task has been reassigned to you: ${title}`,
            link: `/tasks`
          });
        } else {
          await Notification.create({
            user: raw.assignedTo,
            type: 'task_updated',
            title: 'Task Updated',
            message: `A task assigned to you has been updated: ${title}`,
            link: `/tasks`
          });
        }
        if (global.io) {
          global.io.emit('notification_created', { user: raw.assignedTo });
        }
      }
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a ticket task
// @route   DELETE /api/ticket-tasks/:id
// @access  Private (Super Admin)
const deleteTicketTask = async (req, res) => {
  try {
    const task = await TicketTask.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.deleteOne();

    if (global.io) {
      global.io.emit('ticket_task_deleted', req.params.id);
    }

    res.status(200).json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTicketTasks,
  createTicketTask,
  updateTicketTask,
  deleteTicketTask
};
