const express = require('express');
const router = express.Router();
const { authUser } = require('../controllers/auth/authController');

router.post('/login', authUser);

router.get('/init-db', async (req, res) => {
  try {
    const Admin = require('../models/admin/Admin');
    const Partner = require('../models/partner/Partner');
    const Client = require('../models/client/Client');
    const Employee = require('../models/employee/Employee');
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('123456', salt);

    await Admin.findOneAndUpdate({ email: 'superadmin@myclaim.com' }, { name: 'Super Admin', password, role: 'super_admin' }, { upsert: true });
    await Admin.findOneAndUpdate({ email: 'admin@myclaim.com' }, { name: 'Admin User', password, role: 'admin' }, { upsert: true });
    await Partner.findOneAndUpdate({ email: 'partner@myclaim.com' }, { name: 'Partner User', password, role: 'partner' }, { upsert: true });
    await Client.findOneAndUpdate({ email: 'client@myclaim.com' }, { name: 'Client User', password, role: 'client' }, { upsert: true });
    await Employee.findOneAndUpdate({ email: 'employee@myclaim.com' }, { name: 'Employee User', password, role: 'employee' }, { upsert: true });

    res.json({ message: "Database re-seeded successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
