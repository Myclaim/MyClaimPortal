const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMyReferralCode, applyReferralCode, dismissPrompt } = require('../controllers/referral/referralController');

router.get('/my-code', protect, getMyReferralCode);
router.post('/apply', protect, applyReferralCode);
router.post('/dismiss-prompt', protect, dismissPrompt);

module.exports = router;
