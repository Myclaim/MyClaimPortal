const express = require('express');
const router = express.Router();
const {
  getFinanceRevenue,
  getFinanceCollections,
  getFinancePayments
} = require('../controllers/crm/aiDataController');

router.get('/revenue', getFinanceRevenue);
router.get('/collections', getFinanceCollections);
router.get('/payments', getFinancePayments);

module.exports = router;
