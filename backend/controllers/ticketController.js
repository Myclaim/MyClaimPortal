const Ticket = require('../models/Ticket');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');

const getTickets = async (req, res) => {
  try {
    let query = {};
    if (req.query.client_id) {
      query.client = req.query.client_id;
    }

    const { role, _id } = req.user;

    if (role === 'partner') {
      const Client = require('../models/client/Client');
      const myClients = await Client.find({ parent_id: _id }, '_id');
      const myClientIds = myClients.map(c => c._id);
      if (query.client) {
        if (!myClientIds.some(id => id.toString() === query.client.toString())) {
          return res.status(403).json({ message: 'Unauthorized access to this client' });
        }
      } else {
        query.client = { $in: myClientIds };
      }
    } else if (role === 'client') {
      query.client = _id;
    } else if (role === 'employee') {
      query.assignedTo = _id;
    } else if (role === 'super_partner') {
      const Partner = require('../models/partner/Partner');
      const Client = require('../models/client/Client');
      const networkPartners = await Partner.find({ parent_id: _id }, '_id');
      const networkPartnerIds = [ _id, ...networkPartners.map(p => p._id) ];
      const networkClients = await Client.find({ parent_id: { $in: networkPartnerIds } }, '_id');
      const networkClientIds = networkClients.map(c => c._id);
      
      if (query.client) {
        if (!networkClientIds.some(id => id.toString() === query.client.toString())) {
          return res.status(403).json({ message: 'Unauthorized access to this client' });
        }
      } else {
        query.client = { $in: networkClientIds };
      }
    }

    const tickets = await Ticket.find(query)
      .populate({ path: 'client', select: 'name email phone companyName role', model: 'Client' })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate({ path: 'client', select: 'name email phone companyName role', model: 'Client' })
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name email role');
      
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (req.user.role === 'client') {
      if (!ticket.client || String(ticket.client._id) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to view this ticket' });
      }
    }
    
    const Document = require('../models/Document');
    const documents = ticket.client ? await Document.find({ user: ticket.client._id }) : [];

    const activities = await Activity.find({ ticket: ticket._id })
      .populate('user', 'name role')
      .sort({ createdAt: 1 });

    res.json({ ticket, documents, activities });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTicket = async (req, res) => {
  const { clientId, hubType, subject, companyName, service, priority, assignedTo, notes, mappedStore, shares, folio, isin, estValue } = req.body;
  if (!clientId || !service) {
    return res.status(400).json({ message: 'clientId and service are required' });
  }
  let calculatedDueDate = new Date();
  if (priority === 'urgent') calculatedDueDate.setDate(calculatedDueDate.getDate() + 1);
  else if (priority === 'high') calculatedDueDate.setDate(calculatedDueDate.getDate() + 3);
  else if (priority === 'medium') calculatedDueDate.setDate(calculatedDueDate.getDate() + 7);
  else calculatedDueDate.setDate(calculatedDueDate.getDate() + 14);

  let finalAssignedTo = assignedTo;
  if (!finalAssignedTo) {
    const User = require('../models/User');
    const Employee = require('../models/employee/Employee');
    const Admin = require('../models/admin/Admin');
    
    const employees = await Employee.find({}, '_id');
    const admins = await Admin.find({ role: { $in: ['admin', 'super_admin'] } }, '_id');
    const candidateIds = [...employees.map(e => e._id), ...admins.map(a => a._id)];
    
    if (candidateIds.length > 0) {
      const ticketCounts = await Ticket.aggregate([
        { $match: { status: { $in: ['active', 'in_process'] }, assignedTo: { $in: candidateIds } } },
        { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
        { $sort: { count: 1 } }
      ]);
      
      if (ticketCounts.length > 0 && ticketCounts.length === candidateIds.length) {
        finalAssignedTo = ticketCounts[0]._id;
      } else {
        const busyIds = ticketCounts.map(tc => tc._id.toString());
        const freeCandidate = candidateIds.find(id => !busyIds.includes(id.toString()));
        finalAssignedTo = freeCandidate || ticketCounts[0]._id;
      }
    }
  }

  // ─── Generate unique ticketNo: MCT-YYYYMMDD-NNNNN ──────────────────
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // "20260729"
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay   = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const countToday = await Ticket.countDocuments({ createdAt: { $gte: startOfDay, $lt: endOfDay } });
  const seq = String(countToday + 1).padStart(5, '0');        // "00042"
  const ticketNo = `MCT-${dateStr}-${seq}`;                   // "MCT-20260729-00042"

  const ticket = await Ticket.create({
    ticketNo,
    client: clientId,

    hubType: hubType || 'Service Hub',
    subject: subject || '',
    companyName: companyName || '',
    service,
    priority: priority || 'medium',
    assignedTo: finalAssignedTo || undefined,
    createdBy: req.user._id,
    creatorRole: req.user.role,
    notes: notes || '',
    dueDate: calculatedDueDate,
    mappedStore: mappedStore || 'All Stores',
    shares: shares || 0,
    folio: folio || 'N/A',
    isin: isin || 'N/A',
    estValue: estValue || 'N/A',
  });

  await ticket.populate({ path: 'client', select: 'name email phone companyName role', model: 'Client' });
  await ticket.populate('assignedTo', 'name email');

  const Client = require('../models/client/Client');
  const User = require('../models/User');
  let clientUser = await Client.findById(clientId).lean();
  if (!clientUser) {
    clientUser = await User.findById(clientId).lean();
  }
  const clientName = clientUser ? clientUser.name : 'Unknown';
  const creatorName = req.user.name || 'System';

  await Activity.create({
    action: `Ticket created for ${clientName} in ${ticket.hubType || 'Service Hub'} (${service}) by ${creatorName}`,
    user: req.user._id,
    ticket: ticket._id
  });

  const io = req.app.get('io');
  if (io) {
    io.emit('ticket_created', ticket);
  }

  res.status(201).json(ticket);
};

const updateTicketStatus = async (req, res) => {
  const { status, progress } = req.body;
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

  const oldStatus = ticket.status;
  ticket.status = status || ticket.status;
  if (progress !== undefined) {
    ticket.progress = progress;
  }
  if (ticket.status === 'completed' || ticket.status === 'closed') {
    ticket.progress = 100;
  } else if ((oldStatus === 'completed' || oldStatus === 'closed') && progress === undefined) {
    ticket.progress = 0;
  }
  const updated = await ticket.save();

  const Client = require('../models/client/Client');
  const User = require('../models/User');
  let clientUser = await Client.findById(ticket.client).lean();
  if (!clientUser) {
    clientUser = await User.findById(ticket.client).lean();
  }
  const clientName = clientUser ? clientUser.name : 'Unknown';
  const updaterName = req.user.name || 'System';

  await Activity.create({
    action: `Ticket for ${clientName} in ${ticket.hubType || 'Service Hub'} (${ticket.service}) updated to ${updated.status} by ${updaterName}`,
    user: req.user._id,
    ticket: updated._id,
  });

  if (req.user._id.toString() !== ticket.client.toString()) {
    await Notification.create({
      user: ticket.client,
      type: 'ticket_updated',
      title: 'Ticket Status Updated',
      message: `Your ticket for ${ticket.service} was updated to ${updated.status}`,
      link: `?tab=services`
    });
  }

  const io = req.app.get('io');
  if (io) {
    io.emit('ticket_updated', updated);
  }

  res.json(updated);
};

const updateEmployeeTicketStatus = async (req, res) => {
  const { status, progress } = req.body;
  if (req.user.role !== 'employee') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
  
  if (ticket.assignedTo?.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to update this ticket' });
  }

  const oldStatus = ticket.status;
  ticket.status = status || ticket.status;
  if (progress !== undefined) {
    ticket.progress = progress;
  }
  if (ticket.status === 'completed' || ticket.status === 'closed') {
    ticket.progress = 100;
  } else if ((oldStatus === 'completed' || oldStatus === 'closed') && progress === undefined) {
    ticket.progress = 0;
  }
  const updated = await ticket.save();

  const Client = require('../models/client/Client');
  const User = require('../models/User');
  let clientUser = await Client.findById(ticket.client).lean();
  if (!clientUser) {
    clientUser = await User.findById(ticket.client).lean();
  }
  const clientName = clientUser ? clientUser.name : 'Unknown';
  const updaterName = req.user.name || 'System';

  await Activity.create({
    action: `Task for ${clientName} (${ticket.service}) marked as ${updated.status} by ${updaterName}`,
    user: req.user._id,
    ticket: updated._id,
  });

  if (status === 'completed') {
    await Notification.create({
      user: req.user._id,
      type: 'task_completed',
      title: 'Task Completed',
      message: `You successfully marked Ticket #${ticket.ticketId} as completed.`,
      link: `?tab=ticket-detail&id=${ticket._id}`
    });
  }

  const io = req.app.get('io');
  if (io) {
    io.emit('ticket_updated', updated);
  }

  res.json(updated);
};


const assignTicket = async (req, res) => {
  const { userId } = req.body;
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
  const previousAssignee = ticket.assignedTo ? ticket.assignedTo.toString() : null;
  ticket.assignedTo = userId;
  const updated = await ticket.save();

  const Client = require('../models/client/Client');
  const User = require('../models/User');
  let clientUser = await Client.findById(ticket.client).lean();
  if (!clientUser) {
    clientUser = await User.findById(ticket.client).lean();
  }
  const clientName = clientUser ? clientUser.name : 'Unknown';

  let assignedUser = await User.findById(userId).lean();
  if (!assignedUser) {
    const Employee = require('../models/employee/Employee');
    assignedUser = await Employee.findById(userId).lean();
  }
  const assigneeName = assignedUser ? assignedUser.name : 'Unknown';
  const assignerName = req.user.name || 'System';

  await Activity.create({
    action: `Ticket for ${clientName} in ${ticket.hubType || 'Service Hub'} (${ticket.service}) assigned to ${assigneeName} by ${assignerName}`,
    user: req.user._id,
    ticket: ticket._id
  });
  
  if (assignedUser && assignedUser.role === 'employee') {
    const isReassigned = previousAssignee && previousAssignee !== userId;
    await Notification.create({
      user: userId,
      type: isReassigned ? 'ticket_reassigned' : 'ticket_assigned',
      title: isReassigned ? 'Ticket Reassigned' : 'New Ticket Assigned',
      message: `Ticket #${ticket.ticketId} (${ticket.service}) has been assigned to you.`,
      link: `?tab=ticket-detail&id=${ticket._id}`
    });
  }
  
  res.json(updated);
};

const addTicketComment = async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: 'Comment text is required' });

  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

  ticket.comments.push({
    user: req.user._id,
    text
  });
  
  await ticket.save();
  await ticket.populate({ path: 'comments.user', select: 'name role' });
  
  await Activity.create({
    action: `Comment added to Ticket in ${ticket.hubType || 'Service Hub'} (${ticket.service}) by ${req.user.name || 'User'}`,
    user: req.user._id,
    ticket: ticket._id
  });
  
  if (ticket.assignedTo && req.user._id.toString() !== ticket.assignedTo.toString() && ['admin', 'super_admin'].includes(req.user.role)) {
    await Notification.create({
      user: ticket.assignedTo,
      type: 'comment_added',
      title: 'Admin Comment Added',
      message: `Admin added a comment on Ticket #${ticket.ticketId}.`,
      link: `?tab=ticket-detail&id=${ticket._id}`
    });
  }

  if (req.user._id.toString() !== ticket.client.toString()) {
    await Notification.create({
      user: ticket.client,
      type: 'comment_added',
      title: 'New Comment on Ticket',
      message: `A new comment was added to your ticket for ${ticket.service}.`,
      link: `?tab=services`
    });
  }
  
  const io = req.app.get('io');
  if (io) {
    io.emit('ticket_comment', { ticketId: ticket._id, comment: ticket.comments[ticket.comments.length - 1], clientId: ticket.client });
  }

  res.json(ticket);
};

const bulkUpdateTickets = async (req, res) => {
  const { ticketIds, action, payload } = req.body;
  if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
    return res.status(400).json({ message: 'No tickets selected' });
  }

  if (action === 'status') {
    await Ticket.updateMany({ _id: { $in: ticketIds } }, { status: payload.status });
  } else if (action === 'assign') {
    await Ticket.updateMany({ _id: { $in: ticketIds } }, { assignedTo: payload.userId });
  } else {
    return res.status(400).json({ message: 'Invalid bulk action' });
  }

  await Activity.create({
    action: `Bulk updated ${ticketIds.length} tickets (${action}) by ${req.user.name || 'Admin'}`,
    user: req.user._id,
  });

  res.json({ message: 'Bulk update successful' });
};

const escalateTicket = async (req, res) => {
  const { userId } = req.body;
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
  
  ticket.isEscalated = true;
  if (userId) {
    ticket.escalatedTo = userId;
  }
  const updated = await ticket.save();

  const Client = require('../models/client/Client');
  const User = require('../models/User');
  let clientUser = await Client.findById(ticket.client).lean();
  if (!clientUser) {
    clientUser = await User.findById(ticket.client).lean();
  }
  const clientName = clientUser ? clientUser.name : 'Unknown';
  
  await Activity.create({
    action: `Ticket for ${clientName} escalated by ${req.user.name || 'System'}`,
    user: req.user._id,
    ticket: ticket._id
  });
  
  const io = req.app.get('io');
  if (io) {
    io.emit('ticket_updated', updated);
  }

  res.json(updated);
};

const addTicketAttachment = async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  const newAttachments = req.files.map(file => ({
    name: file.originalname,
    url: `/uploads/documents/tickets/${ticket._id}/${file.filename}`,
  }));

  ticket.attachments.push(...newAttachments);
  await ticket.save();

  const Client = require('../models/client/Client');
  const User = require('../models/User');
  let clientUser = await Client.findById(ticket.client).lean();
  if (!clientUser) {
    clientUser = await User.findById(ticket.client).lean();
  }
  const clientName = clientUser ? clientUser.name : 'Unknown';

  await Activity.create({
    action: `Attachment(s) added to Ticket for ${clientName} by ${req.user.name || 'User'}`,
    user: req.user._id,
    ticket: ticket._id
  });

  const io = req.app.get('io');
  if (io) {
    io.emit('ticket_updated', ticket);
  }

  res.json(ticket);
};

const updateTicketStages = async (req, res) => {
  const { stages, progress, status } = req.body;
  
  const updateData = {};
  if (stages !== undefined) updateData.stages = stages;
  if (progress !== undefined) updateData.progress = progress;
  if (status !== undefined) updateData.status = status;

  const updated = await Ticket.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    { new: true, runValidators: true }
  );
  
  if (!updated) {
    return res.status(404).json({ message: 'Ticket not found' });
  }

  const Client = require('../models/client/Client');
  const User = require('../models/User');
  let clientUser = await Client.findById(updated.client).lean();
  if (!clientUser) clientUser = await User.findById(updated.client).lean();
  const clientName = clientUser ? clientUser.name : 'Unknown';

  if (updated.assignedTo) {
    await Notification.create({
      user: updated.assignedTo,
      title: `Ticket "${updated.service}" stages updated`,
      message: `Client ${clientName}'s ticket stages were updated. Progress: ${updated.progress}%`,
      type: 'ticket'
    });
  }

  if (req.user._id.toString() !== updated.client.toString()) {
    await Notification.create({
      user: updated.client,
      title: `Ticket "${updated.service}" stages updated`,
      message: `Your ticket stages were updated. Progress: ${updated.progress}%`,
      type: 'ticket',
      link: `?tab=services`
    });
  }

  await Activity.create({
    action: `Claim stages updated for ticket ${updated.service} (${clientName}) by ${req.user.name || 'System'}`,
    user: req.user._id,
    ticket: updated._id,
  });

  const io = req.app.get('io');
  if (io) io.emit('ticket_updated', updated);

  res.json(updated);
};


module.exports = {
  getTickets,
  getTicketById,
  createTicket,
  updateTicketStatus,
  updateEmployeeTicketStatus,
  assignTicket,
  addTicketComment,
  bulkUpdateTickets,
  escalateTicket,
  addTicketAttachment,
  updateTicketStages,
};
