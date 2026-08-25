const express = require('express');
const router = express.Router();
const { getProposals, createProposal, updateProposal } = require('../controllers/crm/proposalController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .get(protect, getProposals)
  .post(protect, upload.single('attachment'), createProposal);

router.route('/:id')
  .patch(protect, upload.single('attachment'), updateProposal);

module.exports = router;
