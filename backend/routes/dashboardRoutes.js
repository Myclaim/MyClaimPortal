const express = require('express');
const router = express.Router();
const { getDashboardStats, getAdminDashboardStats, getEmployeeDashboardStats, getClientDashboardStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getDashboardStats);
router.get('/admin', protect, getAdminDashboardStats);
router.get('/employee', protect, getEmployeeDashboardStats);
router.get('/client', protect, getClientDashboardStats);

module.exports = router;
