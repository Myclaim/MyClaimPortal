const Ticket = require('../models/Ticket');
const Employee = require('../models/employee/Employee');

// @desc    Get Admin Operational Reports
// @route   GET /api/reports/admin
// @access  Private (Admin/Super Admin only)
const getAdminReports = async (req, res) => {
  try {
    const { role, department } = req.user;

    if (!['admin', 'super_admin'].includes(role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Determine vertical filter for plain admin
    let ticketFilter = {};
    if (role === 'admin' && department) {
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
    }

    // 1. Time-based Ticket Counts (Daily, Weekly, Monthly)
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [dailyTickets, weeklyTickets, monthlyTickets] = await Promise.all([
      Ticket.countDocuments({ ...ticketFilter, createdAt: { $gte: today } }),
      Ticket.countDocuments({ ...ticketFilter, createdAt: { $gte: startOfWeek } }),
      Ticket.countDocuments({ ...ticketFilter, createdAt: { $gte: startOfMonth } }),
    ]);

    // 2. Ticket Status Distribution
    const statusDistribution = await Ticket.aggregate([
      { $match: ticketFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const formattedStatus = {
      active: 0,
      in_process: 0,
      completed: 0,
      closed: 0,
    };
    statusDistribution.forEach(stat => {
      if (formattedStatus[stat._id] !== undefined) {
        formattedStatus[stat._id] = stat.count;
      }
    });

    // 3. Employee Performance
    let employeeFilter = { role: { $in: ['employee', 'team', 'staff'] } };
    if (role === 'admin' && department) {
      employeeFilter.department = department;
    }

    const employees = await Employee.find(employeeFilter).select('name _id department');
    const employeeIds = employees.map(emp => emp._id);

    // Aggregate completed tickets per employee
    const completedByEmployee = await Ticket.aggregate([
      { $match: { ...ticketFilter, status: 'completed', assignedTo: { $in: employeeIds } } },
      { $group: { _id: '$assignedTo', completedCount: { $sum: 1 } } }
    ]);

    // Aggregate active/in_process tickets per employee
    const activeByEmployee = await Ticket.aggregate([
      { $match: { ...ticketFilter, status: { $in: ['active', 'in_process'] }, assignedTo: { $in: employeeIds } } },
      { $group: { _id: '$assignedTo', activeCount: { $sum: 1 } } }
    ]);

    const employeePerformance = employees.map(emp => {
      const completed = completedByEmployee.find(c => String(c._id) === String(emp._id))?.completedCount || 0;
      const active = activeByEmployee.find(a => String(a._id) === String(emp._id))?.activeCount || 0;
      return {
        id: emp._id,
        name: emp.name,
        department: emp.department,
        completed,
        active,
        total: completed + active
      };
    }).sort((a, b) => b.completed - a.completed);

    res.json({
      timeframes: {
        daily: dailyTickets,
        weekly: weeklyTickets,
        monthly: monthlyTickets
      },
      statusDistribution: formattedStatus,
      employeePerformance
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAdminReports
};
