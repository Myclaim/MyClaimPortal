const Claim = require('../../models/Claim');
const Activity = require('../../models/Activity');
const { createActivityAndNotify } = require('../../utils/activityHelper');

// @desc    Get all claims
// @route   GET /api/claims
// @access  Private
const getClaims = async (req, res) => {
  const { client_id } = req.query;
  const filter = client_id ? { $or: [{ client_id }, { userId: client_id }] } : {};
  const claims = await Claim.find(filter).sort({ createdAt: -1 });
  res.json(claims);
};

// @desc    Get single claim
// @route   GET /api/claims/:id
// @access  Private
const getClaimById = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (claim) {
      res.json(claim);
    } else {
      res.status(404).json({ message: 'Claim not found' });
    }
  } catch (err) {
    res.status(400).json({ message: 'Invalid claim ID' });
  }
};

// @desc    Create a claim
// @route   POST /api/claims
// @access  Private
const createClaim = async (req, res) => {
  const { clientName } = req.body;

  if (!clientName) {
    return res.status(400).json({ message: 'Client name is required' });
  }

  const claim = await Claim.create({
    clientName,
    status: 'pending',
  });

  // Log activity and notify SuperAdmin real-time
  await createActivityAndNotify({
    action: `Claim created for ${clientName} by ${req.user?.name || 'User'}`,
    user: req.user,
    claim: claim,
    type: 'claim_created'
  });

  res.status(201).json(claim);
};

// @desc    Update claim status
// @route   PUT /api/claims/:id
// @access  Private
const updateClaimStatus = async (req, res) => {
  const { status } = req.body;
  
  const claim = await Claim.findById(req.params.id);

  if (claim) {
    claim.status = status || claim.status;
    const updatedClaim = await claim.save();

    // Log activity and notify SuperAdmin real-time
    await createActivityAndNotify({
      action: `Claim status updated to ${status} for ${claim.clientName} by ${req.user?.name || 'User'}`,
      user: req.user,
      claim: updatedClaim,
      type: 'claim_created'
    });

    res.json(updatedClaim);
  } else {
    res.status(404).json({ message: 'Claim not found' });
  }
};

module.exports = {
  getClaims,
  getClaimById,
  createClaim,
  updateClaimStatus,
};
