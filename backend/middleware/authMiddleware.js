const jwt = require('jsonwebtoken');
const Admin = require('../models/admin/Admin');
const Partner = require('../models/partner/Partner');
const Client = require('../models/client/Client');
const Employee = require('../models/employee/Employee');
const User = require('../models/User');

// Simple in-memory auth cache to avoid DB hit on every request
// Cache: { token -> { user, expiresAt } }
const authCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minute cache

const cleanupCache = () => {
  const now = Date.now();
  for (const [key, val] of authCache.entries()) {
    if (val.expiresAt < now) authCache.delete(key);
  }
};
setInterval(cleanupCache, 60 * 1000); // cleanup every minute

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Serve from cache if available (avoids DB hit on every request)
      const cached = authCache.get(token);
      if (cached && cached.expiresAt > Date.now()) {
        req.user = cached.user;
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

      // Query all 5 collections IN PARALLEL — not sequentially
      const [adminUser, partnerUser, clientUser, employeeUser, genericUser] = await Promise.all([
        Admin.findById(decoded.id).select('-password').lean(),
        Partner.findById(decoded.id).select('-password').lean(),
        Client.findById(decoded.id).select('-password').lean(),
        Employee.findById(decoded.id).select('-password').lean(),
        User.findById(decoded.id).select('-password').lean()
      ]);

      const user = adminUser || partnerUser || clientUser || employeeUser || genericUser;

      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Cache the result for 5 minutes
      authCache.set(token, { user, expiresAt: Date.now() + CACHE_TTL_MS });

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

// Strictly Super Admin only — regular admin role is rejected
const superAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'super_admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Super Admin only.' });
  }
};

const adminOrSuperPartner = (req, res, next) => {
  if (req.user && (['admin', 'super_admin', 'super_partner', 'partner'].includes(req.user.role))) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized for this action' });
  }
};

module.exports = { protect, admin, superAdminOnly, adminOrSuperPartner };
