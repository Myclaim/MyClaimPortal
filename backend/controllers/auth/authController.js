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
  const { email, password } = req.body;
  const loginId = email.toLowerCase();

  const emailQuery = { 
    $or: [
      { email: { $regex: new RegExp('^' + loginId + '$', 'i') } }, 
      { username: loginId },
      { client_id_ref: { $regex: new RegExp('^' + loginId + '$', 'i') } }
    ] 
  };
  
  // Search across all role-specific models/collections
  let user = await Admin.findOne(emailQuery);
  if (!user) user = await Partner.findOne(emailQuery);
  if (!user) user = await Client.findOne(emailQuery);
  if (!user) user = await Employee.findOne(emailQuery);
  if (!user) user = await User.findOne(emailQuery); // Fallback to original

  if (user && (await bcrypt.compare(password, user.password))) {
    const Activity = require('../../models/Activity');
    await Activity.create({
      action: `User ${user.name || email} logged in`,
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
