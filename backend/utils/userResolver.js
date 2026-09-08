const Admin = require('../models/admin/Admin');
const Employee = require('../models/employee/Employee');
const Partner = require('../models/partner/Partner');
const User = require('../models/User');
const Client = require('../models/client/Client');

/**
 * Resolves user/assignee/client documents across multi-model collections
 * (Admin, Employee, Partner, User, Client) into a lookup map by ID string.
 */
const resolveUserMap = async (ids = []) => {
  const uniqueIds = [
    ...new Set(
      ids
        .filter(Boolean)
        .map(id => (typeof id === 'object' && id._id ? id._id.toString() : id.toString()))
    )
  ];

  if (!uniqueIds.length) return {};

  const [admins, employees, partners, users, clients] = await Promise.all([
    Admin.find({ _id: { $in: uniqueIds } }, 'name email role department').lean(),
    Employee.find({ _id: { $in: uniqueIds } }, 'name email role department designation').lean(),
    Partner.find({ _id: { $in: uniqueIds } }, 'name email role partnerFirm').lean(),
    User.find({ _id: { $in: uniqueIds } }, 'name email role').lean(),
    Client.find({ _id: { $in: uniqueIds } }, 'name email role firstName lastName phone companyName').lean()
  ]);

  const map = {};
  [...admins, ...employees, ...partners, ...users, ...clients].forEach(u => {
    map[u._id.toString()] = {
      _id: u._id,
      name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown',
      email: u.email || '',
      role: u.role || 'team',
      department: u.department || '',
      companyName: u.companyName || u.partnerFirm || ''
    };
  });

  return map;
};

module.exports = { resolveUserMap };
