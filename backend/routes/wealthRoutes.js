const express = require('express');
const router = express.Router();
const {
  getWealthOverview,
  getMutualFunds,
  getWealthClients,
  createWealthClient,
  deleteWealthClient,
  getProposals,
  createProposal,
  updateProposalStatus
} = require('../controllers/wealthController');

// Define Wealth API Endpoints
router.get('/overview', getWealthOverview);
router.get('/mutual-funds', getMutualFunds);
router.get('/clients', getWealthClients);
router.post('/clients', createWealthClient);
router.delete('/clients/:id', deleteWealthClient);
router.get('/proposals', getProposals);
router.post('/proposals', createProposal);
router.patch('/proposals/:id/status', updateProposalStatus);

module.exports = router;
