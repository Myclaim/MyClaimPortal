const User = require('../models/User');
const Lead = require('../models/Lead');
const Claim = require('../models/Claim');
const Proposal = require('../models/Proposal');
const Activity = require('../models/Activity');
const Ticket = require('../models/Ticket');
const Document = require('../models/Document');
const Employee = require('../models/employee/Employee');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  const { _id, role } = req.user;
  
  try {
    let query = {};
    let ticketQuery = {};
    
    // Scoping for non-admins
    if (role === 'partner' || role === 'super_partner') {
      query = { sourceUserId: _id };
      
      // For tickets, we need to find clients owned by this partner
      const myClients = await User.find({ role: 'client', parent_id: _id }).select('_id');
      const myClientIds = myClients.map(c => c._id);
      ticketQuery = { client: { $in: myClientIds } };
    }

    // 1. User counts by role
    const userRoles = ['super_admin', 'admin', 'employee', 'super_partner', 'partner', 'client'];
    const userStats = {};
    for (const r of userRoles) {
      if (role === 'admin' || role === 'super_admin') {
        userStats[r] = await User.countDocuments({ role: r });
      } else if (role === 'partner' || role === 'super_partner') {
        if (r === 'client') {
          userStats[r] = await User.countDocuments({ role: 'client', parent_id: _id });
        } else {
          userStats[r] = 0;
        }
      }
    }

    // 2. Leads stats
    const totalLeads = await Lead.countDocuments(query);
    const newLeads = await Lead.countDocuments({ ...query, status: 'new' });

    // 3. Claims stats
    const totalClaims = await Claim.countDocuments();
    const pendingClaims = await Claim.countDocuments({ status: 'pending' });
    const completedClaims = await Claim.countDocuments({ status: 'completed' });
    const successRate = totalClaims > 0 ? Math.round((completedClaims / totalClaims) * 100) + '%' : '0%';

    // 4. Proposals stats
    const totalProposals = await Proposal.countDocuments(query);
    const activeProposals = await Proposal.countDocuments({ ...query, status: 'Active' });

    // 5. Ticket stats
    const totalTickets = await Ticket.countDocuments(ticketQuery);
    const activeTickets = await Ticket.countDocuments({ ...ticketQuery, status: 'active' });

    // 6. Recent Activity
    let activityQuery = {};
    if (!(role === 'admin' || role === 'super_admin')) {
      activityQuery = { user: _id };
    }

    const recentActivity = await Activity.find(activityQuery)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name');

    res.json({
      users: userStats,
      leads: { total: totalLeads, new: newLeads },
      claims: { total: totalClaims, pending: pendingClaims, successRate },
      proposals: { total: totalProposals, active: activeProposals },
      tickets: { total: totalTickets, active: activeTickets },
      activity: recentActivity,
      revenue: (totalProposals * 1.5).toFixed(1) + 'Cr',
      productivity: [
        { label: 'Claim Verification', val: Math.floor(Math.random() * 40) + 60, color: '#22c55e' },
        { label: 'Document Review', val: Math.floor(Math.random() * 40) + 50, color: '#3b82f6' },
        { label: 'Client Communication', val: Math.floor(Math.random() * 40) + 40, color: '#f59e0b' }
      ]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// Admin-specific operational dashboard stats
// GET /api/dashboard/admin
// Returns only admin-accessible operational metrics
// ──────────────────────────────────────────────

const getAdminDashboardStats = async (req, res) => {
  try {
    const { _id, role, department } = req.user;

    // Only allow admin role
    if (role !== 'admin' && role !== 'super_admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Scope tickets to admin's department/vertical if set
    let ticketFilter = {};
    let employeeFilter = { role: { $in: ['employee', 'team', 'staff'] } };

    if (role === 'admin' && department) {
      // Map admin department to hub types for ticket scoping
      const deptToHub = {
        claim: 'Claim Hub',
        service: 'Service Hub',
        store: 'Store Hub',
        support: 'Support Hub',
      };
      const hubType = deptToHub[department.toLowerCase()];
      if (hubType) {
        ticketFilter.hubType = hubType;
      }
      employeeFilter.department = department;
    }

    const [activeTickets, inProcessTickets, completedTickets, pendingDocs, assignedEmployees, overdueTickets, activity] = await Promise.all([
      Ticket.countDocuments({ ...ticketFilter, status: 'active' }),
      Ticket.countDocuments({ ...ticketFilter, status: 'in_process' }),
      Ticket.countDocuments({ ...ticketFilter, status: 'completed' }),
      Document.countDocuments({ doc_category: 'primary', verification_status: { $ne: 'verified' } }), // We'll assume pending means not verified
      Employee.countDocuments(employeeFilter),
      Ticket.countDocuments({ ...ticketFilter, status: { $ne: 'completed' }, dueDate: { $lt: new Date() } }),
      Activity.find({}).sort({ createdAt: -1 }).limit(6).populate('user', 'name') // Simplified activity fetch for admin
    ]);

    res.json({
      activeTickets,
      inProcessTickets,
      completedTickets,
      pendingDocs,
      assignedEmployees,
      overdueTickets,
      activity
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// Employee-specific operational dashboard stats
// GET /api/dashboard/employee
// Returns only employee-accessible operational metrics
// ──────────────────────────────────────────────

const getEmployeeDashboardStats = async (req, res) => {
  try {
    const { _id, role } = req.user;

    if (role !== 'employee') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date();
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);

    const [
      assignedTickets,
      pendingTasks,
      completedTasks,
      overdueTasks,
      recentAssignedTickets,
      pendingTasksList,
      recentActivity,
      completedToday,
      completedThisWeek
    ] = await Promise.all([
      Ticket.countDocuments({ assignedTo: _id }),
      Ticket.countDocuments({ assignedTo: _id, status: { $in: ['active', 'in_process'] } }),
      Ticket.countDocuments({ assignedTo: _id, status: 'completed' }),
      Ticket.countDocuments({ assignedTo: _id, status: { $ne: 'completed' }, dueDate: { $lt: new Date() } }),
      Ticket.find({ assignedTo: _id }).sort({ createdAt: -1 }).limit(5).populate('client', 'name companyName').lean(),
      Ticket.find({ assignedTo: _id, status: { $in: ['active', 'in_process'] } }).sort({ createdAt: -1 }).limit(5).populate('client', 'name companyName').lean(),
      Activity.find({ user: _id }).sort({ createdAt: -1 }).limit(10).lean(),
      Ticket.countDocuments({ assignedTo: _id, status: 'completed', updatedAt: { $gte: todayStart } }),
      Ticket.countDocuments({ assignedTo: _id, status: 'completed', updatedAt: { $gte: weekStart } })
    ]);

    res.json({
      assignedTickets,
      pendingTasks,
      completedTasks,
      overdueTasks,
      recentAssignedTickets,
      pendingTasksList,
      recentActivity,
      completedToday,
      completedThisWeek
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// Client-specific dashboard stats
// GET /api/dashboard/client
// Returns only client-accessible metrics
// ──────────────────────────────────────────────

const getClientDashboardStats = async (req, res) => {
  try {
    const { _id, role } = req.user;

    if (role !== 'client') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const Ticket = require('../models/Ticket');
    const Document = require('../models/Document');
    const Activity = require('../models/Activity');
    const Notification = require('../models/Notification'); // Ensure we fetch their notifications

    const [
      activeServices,
      activeTickets,
      completedServices,
      pendingDocuments,
      recentTickets,
      recentActivity,
      recentNotifications
    ] = await Promise.all([
      Ticket.countDocuments({ client: _id, hubType: 'Service Hub', status: { $in: ['active', 'in_process'] } }),
      Ticket.countDocuments({ client: _id, hubType: 'Claim Hub', status: { $in: ['active', 'in_process'] } }),
      Ticket.countDocuments({ client: _id, status: 'completed' }),
      Document.countDocuments({ uploaded_by: _id, verification_status: { $ne: 'verified' } }),
      Ticket.find({ client: _id }).sort({ createdAt: -1 }).limit(5).lean(),
      Activity.find({ user: _id }).sort({ createdAt: -1 }).limit(5).lean(),
      Notification.find({ user: _id }).sort({ createdAt: -1 }).limit(5).lean()
    ]);

    res.json({
      activeServices,
      activeTickets,
      completedServices,
      pendingDocuments,
      recentTickets,
      recentActivity,
      recentNotifications
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAdminDashboardStats,
  getEmployeeDashboardStats,
  getClientDashboardStats,
};
