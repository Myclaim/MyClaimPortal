const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { protect, admin } = require('../middleware/authMiddleware'); // assuming standard auth middleware

router.get('/search', companyController.searchCompanies);
router.get('/', companyController.getCompanies);
router.post('/admin/sync', protect, admin, companyController.manualSync);
router.get('/admin/sync-status', protect, admin, companyController.getSyncStatus);

module.exports = router;
