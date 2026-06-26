const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const Admin = require('../models/admin/Admin');
const Partner = require('../models/partner/Partner');
const Client = require('../models/client/Client');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// ─────────────────────────────────────────────
// SERVER-SIDE CACHE for Activity Log
// ─────────────────────────────────────────────
let _activityCache = null;
let _activityCacheTime = 0;
const ACTIVITY_CACHE_TTL = 2 * 1000; // 2 seconds (for near real-time sync)

router.get('/', protect, async (req, res) => {
  try {
    const now = Date.now();
    if (_activityCache && (now - _activityCacheTime) < ACTIVITY_CACHE_TTL) {
      return res.json(_activityCache);
    }

    // OPTIMIZED: Fetch only last 100 activities with lean()
    const activities = await Activity.find({}, 'action user createdAt')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    if (!activities.length) {
      _activityCache = [];
      _activityCacheTime = now;
      return res.json([]);
    }

    // Collect unique user IDs across ALL activities in one pass
    const uniqueIds = [...new Set(activities.map(a => a.user ? String(a.user) : null).filter(Boolean))];

    // Fetch from ALL 4 collections IN PARALLEL — one round-trip for everything
    const [admins, partners, clients, users] = await Promise.all([
      Admin.find({ _id: { $in: uniqueIds } }, 'name email role').lean(),
      Partner.find({ _id: { $in: uniqueIds } }, 'name email role').lean(),
      Client.find({ _id: { $in: uniqueIds } }, 'name email role').lean(),
      User.find({ _id: { $in: uniqueIds } }, 'name email role').lean(),
    ]);

    const userMap = {};
    [...admins, ...partners, ...clients, ...users].forEach(u => { userMap[String(u._id)] = u; });

    const populated = activities.map(act => ({
      ...act,
      user: (act.user && userMap[String(act.user)]) || act.user,
    }));

    _activityCache = populated;
    _activityCacheTime = now;
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Expose cache buster for mutations
router.bustCache = () => { _activityCache = null; };

module.exports = router;
