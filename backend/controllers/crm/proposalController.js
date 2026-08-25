const Proposal = require('../../models/Proposal');
const { createActivityAndNotify } = require('../../utils/activityHelper');

// ─────────────────────────────────────────────
// SERVER-SIDE CACHE for Proposals
// ─────────────────────────────────────────────
let _proposalsCache = null;

const bustProposalsCache = () => { _proposalsCache = null; };

// @desc    Get all proposals
// @route   GET /api/proposals
// @access  Private
const getProposals = async (req, res) => {
  try {
    if (_proposalsCache) return res.json(_proposalsCache);

    const proposals = await Proposal.find()
      .populate('createdBy', 'name role')
      .populate('assignedTo', 'name role')
      .sort({ createdAt: -1 })
      .lean();

    _proposalsCache = proposals;
    res.json(proposals);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching proposals' });
  }
};

// @desc    Create new proposal
// @route   POST /api/proposals
// @access  Private
const createProposal = async (req, res) => {
  try {
    const { clientName, serviceRequest, category, priority, sendToUserType, assignUserName, assignedTo, superPartner, partner, admin, status, notes } = req.body;
    if (!clientName || !serviceRequest) {
      return res.status(400).json({ message: 'Please provide required fields (clientName, serviceRequest)' });
    }
    const attachmentPath = req.file ? `/uploads/${req.file.filename}` : (req.body.attachmentPath || null);
    const proposal = await Proposal.create({
      clientName, serviceRequest, category, priority, sendToUserType, assignUserName,
      assignedTo: assignedTo || null, superPartner, partner, admin,
      status: status || 'Draft', notes, attachmentPath, createdBy: req.user._id
    });
    bustProposalsCache();

    await createActivityAndNotify({
      action: `Proposal created for ${clientName} (${serviceRequest}) by ${req.user.name || 'User'}`,
      user: req.user,
      proposal,
      type: 'proposal_created'
    });

    res.status(201).json(proposal);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error creating proposal' });
  }
};

// @desc    Update proposal
// @route   PATCH /api/proposals/:id
// @access  Private
const updateProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });

    const fields = ['clientName', 'serviceRequest', 'category', 'priority', 'sendToUserType', 'assignUserName', 'assignedTo', 'superPartner', 'partner', 'admin', 'status', 'notes'];
    fields.forEach(f => { if (req.body[f] !== undefined) proposal[f] = req.body[f]; });
    if (req.file) proposal.attachmentPath = `/uploads/${req.file.filename}`;

    await proposal.save();
    bustProposalsCache();

    const populated = await Proposal.findById(proposal._id)
      .populate('createdBy', 'name role')
      .populate('assignedTo', 'name role')
      .lean();

    await createActivityAndNotify({
      action: `Proposal updated for ${proposal.clientName} (${proposal.serviceRequest}) - Status: ${proposal.status} by ${req.user.name || 'User'}`,
      user: req.user,
      proposal: populated,
      type: 'proposal_created'
    });

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating proposal' });
  }
};

module.exports = { getProposals, createProposal, updateProposal };
