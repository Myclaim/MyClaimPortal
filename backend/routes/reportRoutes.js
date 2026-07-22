const express = require('express');
const router = express.Router();
const { getAdminReports } = require('../controllers/reportController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/admin', protect, admin, getAdminReports);

module.exports = router;
