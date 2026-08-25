const express = require('express');
const router = express.Router();
const {
  getClaims,
  getClaimById,
  createClaim,
  updateClaimStatus,
} = require('../controllers/crm/claimController');
const { getClaimsSummary, getClaimsPending } = require('../controllers/crm/aiDataController');
const { protect } = require('../middleware/authMiddleware');

router.get('/summary', getClaimsSummary);
router.get('/pending', getClaimsPending);

router.route('/').get(protect, getClaims).post(protect, createClaim);
router.route('/:id').get(protect, getClaimById).put(protect, updateClaimStatus);

module.exports = router;
