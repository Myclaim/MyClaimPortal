const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const Admin = require('../models/admin/Admin');
const User = require('../models/User');
const Partner = require('../models/partner/Partner');
const Client = require('../models/client/Client');

/**
 * Resolves recipient user IDs based on strict rights hierarchy:
 * Hierarchy (highest to lowest): SuperAdmin -> Admin -> SuperPartner -> Partner -> Client
 * 
 * Rules:
 * 1. SuperAdmins & Admins ALWAYS get notified of all lower-level actions.
 * 2. If action performed by Client (or on behalf of Client):
 *    - Notify Associated Partner (client.parent_id)
 *    - Notify Associated SuperPartner (partner.parent_id)
 * 3. If action performed by Partner:
 *    - Notify Associated SuperPartner (partner.parent_id)
 * 4. Real-time sockets are broadcast globally to keep all portals synchronized instantly.
 */
const resolveHierarchyRecipients = async (actingUser) => {
  const recipientIds = new Set();

  try {
    // 1. Fetch all SuperAdmins & Admins across Admin and User models
    const adminRoles = ['super_admin', 'superadmin', 'admin', 'claim_admin', 'service_admin', 'store_admin'];
    const [adminsFromAdminCol, adminsFromUserCol] = await Promise.all([
      Admin.find({ role: { $in: adminRoles } }, '_id').lean(),
      User.find({ role: { $in: adminRoles } }, '_id').lean()
    ]);

    adminsFromAdminCol.forEach(a => recipientIds.add(a._id.toString()));
    adminsFromUserCol.forEach(u => recipientIds.add(u._id.toString()));

    if (!actingUser) return Array.from(recipientIds);

    const userId = actingUser._id || actingUser.id || (typeof actingUser === 'string' ? actingUser : null);
    let userRole = actingUser.role;
    let parentId = actingUser.parent_id || actingUser.partner;

    // Look up in database if role or parentId missing
    if (userId && (!userRole || !parentId)) {
      const userDoc = await Client.findById(userId).lean()
                   || await Partner.findById(userId).lean()
                   || await Admin.findById(userId).lean()
                   || await User.findById(userId).lean();
      if (userDoc) {
        if (!userRole) userRole = userDoc.role;
        if (!parentId) parentId = userDoc.parent_id || userDoc.partner;
      }
    }

    // 2. Client Action: Notify Partner and SuperPartner
    if (userRole === 'client' && parentId) {
      recipientIds.add(parentId.toString()); // Associated Partner

      // Look up partner's parent (Super Partner)
      const partnerDoc = await Partner.findById(parentId).lean()
                      || await User.findById(parentId).lean();
      if (partnerDoc && partnerDoc.parent_id) {
        recipientIds.add(partnerDoc.parent_id.toString()); // Associated Super Partner
      }
    }

    // 3. Partner Action: Notify SuperPartner
    if (userRole === 'partner' && parentId) {
      recipientIds.add(parentId.toString()); // Associated Super Partner
    }
  } catch (err) {
    console.error('Error resolving hierarchy notification recipients:', err.message);
  }

  return Array.from(recipientIds);
};

const createActivityAndNotify = async ({ action, user, ticket = null, proposal = null, claim = null, type = 'general' }) => {
  try {
    const userId = user?._id || user || null;
    
    // 1. Save Activity
    const activityDoc = await Activity.create({
      action,
      user: userId,
      ticket: ticket?._id || ticket || undefined,
      createdAt: new Date()
    });

    // 2. Bust activity cache if available
    try {
      const activityRoutes = require('../routes/activityRoutes');
      if (activityRoutes.bustCache) activityRoutes.bustCache();
    } catch (e) {
      // cache buster fallback
    }

    // 3. Resolve all recipients across hierarchy
    const recipientIds = await resolveHierarchyRecipients(user);

    const title = getTitleForType(type, action);
    const link = getLinkForType(type, ticket, proposal, claim);

    const notifPromises = recipientIds.map(recId => {
      return Notification.create({
        user: recId,
        type: type,
        title: title,
        message: action,
        link: link,
        isRead: false
      });
    });

    await Promise.allSettled(notifPromises);

    // 4. Broadcast Real-Time Socket.io Events for 100% synchronized portals
    const io = global.io;
    if (io) {
      const payload = {
        _id: activityDoc._id,
        action,
        user: user?.name ? { _id: user._id, name: user.name, role: user.role } : { _id: userId },
        createdAt: activityDoc.createdAt,
        type,
        ticket,
        proposal,
        claim
      };

      // Broadcast to ALL connected portals (SuperAdmin, SuperPartner, Partner, Client)
      io.emit('activity_created', payload);
      io.emit('notification_created', payload);
      io.emit('notification', payload);
      io.emit('activity_logged', payload);

      if (type.includes('credential') || type.includes('profile')) {
        io.emit('user_updated', payload);
        io.emit('credential_updated', payload);
      }
      if (ticket) {
        io.emit('ticket_created', ticket);
        io.emit('ticket_updated', ticket);
      }
      if (proposal) {
        io.emit('proposal_created', proposal);
        io.emit('proposal_updated', proposal);
      }
      if (claim) {
        io.emit('claim_created', claim);
        io.emit('claim_updated', claim);
      }
    }

    return activityDoc;
  } catch (error) {
    console.error('Error in createActivityAndNotify:', error);
  }
};

const getTitleForType = (type, action) => {
  if (type === 'ticket_created') return '🎫 Ticket Requested';
  if (type === 'ticket_updated') return '🔄 Ticket Updated';
  if (type === 'credential_updated') return '🔐 Credential Updated';
  if (type === 'profile_updated') return '👤 Profile Updated';
  if (type === 'family_updated') return '👨‍👩‍👧 Family Member Updated';
  if (type === 'proposal_created') return '📄 Proposal Created';
  if (type === 'claim_created') return '📋 Claim Requested';
  if (type === 'doc_uploaded') return '📁 Document Uploaded';
  return '⚡ System Activity';
};

const getLinkForType = (type, ticket, proposal, claim) => {
  if (ticket) return `?tab=tickets&id=${ticket._id || ticket}`;
  if (proposal) return `?tab=proposals`;
  if (claim) return `?tab=claims`;
  if (type.includes('credential') || type.includes('profile')) return `?tab=users`;
  return `?tab=activity`;
};

module.exports = { createActivityAndNotify, resolveHierarchyRecipients };
