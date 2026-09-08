const Admin = require('../../models/admin/Admin');
const Partner = require('../../models/partner/Partner');
const Client = require('../../models/client/Client');
const Employee = require('../../models/employee/Employee');
const User = require('../../models/User'); // Keep for backward compat

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

const authUser = async (req, res) => {
  const { email, password, portal } = req.body;
  const loginId = email ? email.toLowerCase().trim() : '';

  // Detect portal from request body or request Origin / Referer header
  const origin = req.headers.origin || req.headers.referer || '';
  let portalType = portal; // 'client' | 'management' | undefined
  if (!portalType) {
    if (origin.includes('myclaimindia.com')) {
      portalType = 'client';
    } else if (origin.includes('wealthearth.com')) {
      portalType = 'management';
    }
  }

  const emailQuery = { 
    $or: [
      { email: { $regex: new RegExp('^' + loginId + '$', 'i') } }, 
      { username: loginId },
      { client_id_ref: { $regex: new RegExp('^' + loginId + '$', 'i') } }
    ] 
  };
  
  // Look up user across collections
  let user = null;
  let detectedRole = null;

  const clientUser = await Client.findOne(emailQuery);
  const adminUser = await Admin.findOne(emailQuery);
  const partnerUser = await Partner.findOne(emailQuery);
  const employeeUser = await Employee.findOne(emailQuery);
  const legacyUser = await User.findOne(emailQuery);

  if (portalType === 'client') {
    // Client portal only allows clients
    if (clientUser) {
      user = clientUser;
      detectedRole = 'client';
    } else if (adminUser || partnerUser || employeeUser || (legacyUser && legacyUser.role !== 'client')) {
      return res.status(403).json({
        message: 'Access Restricted: Administrative and Partner accounts must log in via wealthearth.com.'
      });
    }
  } else if (portalType === 'management') {
    // Management portal allows admin, super_admin, employee, partner, super_partner
    if (clientUser && !adminUser && !partnerUser && !employeeUser) {
      return res.status(403).json({
        message: 'Access Restricted: Client accounts must log in via myclaimindia.com.'
      });
    }

    if (adminUser) {
      user = adminUser;
      detectedRole = adminUser.role || 'admin';
    } else if (partnerUser) {
      user = partnerUser;
      detectedRole = partnerUser.role || 'partner';
    } else if (employeeUser) {
      user = employeeUser;
      detectedRole = employeeUser.role || 'employee';
    } else if (legacyUser && legacyUser.role !== 'client') {
      user = legacyUser;
      detectedRole = legacyUser.role;
    }
  } else {
    // Fallback if portal not explicitly set
    if (adminUser) user = adminUser;
    else if (partnerUser) user = partnerUser;
    else if (clientUser) user = clientUser;
    else if (employeeUser) user = employeeUser;
    else if (legacyUser) user = legacyUser;
  }

  if (user && (await bcrypt.compare(password, user.password))) {
    const Activity = require('../../models/Activity');
    await Activity.create({
      action: `User ${user.name || email} logged in (${portalType || 'direct'})`,
      user: user._id,
    });
    const userData = user.toObject();
    delete userData.password;
    res.json({
      ...userData,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials. Use Email or Username' });
  }
};

module.exports = { authUser };
