const express = require('express');
const router = express.Router();
const { getLeads, createLead, updateLeadStatus, updateLead } = require('../controllers/crm/leadController');
const { protect, admin, superAdminOnly, adminOrSuperPartner } = require('../middleware/authMiddleware');

// Leads list is scoped for super_admin/admin, super_partner and partner users
router.route('/').get(protect, adminOrSuperPartner, getLeads).post(protect, createLead);

// Leads controller handles RBAC (scoping leads to partners/clients)
router.route('/').get(protect, getLeads).post(protect, createLead);

router.route('/:id/status').patch(protect, admin, updateLeadStatus);
router.route('/:id').patch(protect, updateLead);

module.exports = router;
