const express = require('express');
const router = express.Router();
const {
  getPartnersList,
  getPartnersLeads,
  getPartnersConversions
} = require('../controllers/crm/aiDataController');

router.get('/', getPartnersList);
router.get('/leads', getPartnersLeads);
router.get('/conversions', getPartnersConversions);

module.exports = router;
