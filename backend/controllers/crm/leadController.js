const Lead = require('../../models/Lead');
const Activity = require('../../models/Activity');
const Client = require('../../models/client/Client');
const Admin = require('../../models/admin/Admin');
const Partner = require('../../models/partner/Partner');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const { bustCache: bustUserCache } = require('../user/userController');

// ─────────────────────────────────────────────
// SERVER-SIDE CACHE for Leads
// ─────────────────────────────────────────────
const _leadsCache = new Map();

const bustLeadsCache = () => _leadsCache.clear();

const _populateLeads = async (leads) => {
  if (!leads.length) return leads;

  // Collect all unique IDs in one pass
  const allIds = new Set();
  leads.forEach(l => {
    if (l.sourceUserId && String(l.sourceUserId).length === 24) allIds.add(String(l.sourceUserId));
    if (l.convertedClientId && String(l.convertedClientId).length === 24) allIds.add(String(l.convertedClientId));
  });

  if (!allIds.size) return leads;

  const idArr = [...allIds];

  // Fetch from ALL collections in PARALLEL — single round-trip
  const [admins, partners, clients, users] = await Promise.all([
    Admin.find({ _id: { $in: idArr } }, 'name email role').lean(),
    Partner.find({ _id: { $in: idArr } }, 'name email role').lean(),
    Client.find({ _id: { $in: idArr } }, 'name email role').lean(),
    User.find({ _id: { $in: idArr } }, 'name email role').lean(),
  ]);

  const userMap = {};
  [...admins, ...partners, ...clients, ...users].forEach(u => { userMap[String(u._id)] = u; });

  return leads.map(l => ({
    ...l,
    sourceUserId: (l.sourceUserId && userMap[String(l.sourceUserId)]) || l.sourceUserId,
    convertedClientId: (l.convertedClientId && userMap[String(l.convertedClientId)]) || l.convertedClientId,
  }));
};

// Helper to auto-convert a lead into a Client
const handleLeadConversion = async (lead, customPassword) => {
  if (lead.status === 'converted') {
    const generatedEmail = lead.email || `client_${lead._id.toString().substring(0, 8)}@example.com`;
    if (!lead.convertedClientId) {
      const existingClient = await Client.findOne({ email: generatedEmail.toLowerCase() });
      if (existingClient) throw new Error(`A client account with email ${generatedEmail} already exists.`);
      const salt = await bcrypt.genSalt(10);
      const plain =
        customPassword ||
        process.env.DEFAULT_CLIENT_PASSWORD ||
        (process.env.NODE_ENV === 'production' ? null : 'Client@123');
      if (!plain) {
        throw new Error('Client password is required for lead conversion. Set DEFAULT_CLIENT_PASSWORD or pass a password.');
      }
      const hashedPassword = await bcrypt.hash(plain, salt);
      const newClient = await Client.create({
        ...lead.toObject(),
        _id: undefined,
        password: hashedPassword,
        role: 'client',
        parent_id: lead.sourceUserId,
        email: generatedEmail,
        kyc_data: { address: lead.city }
      });
      lead.convertedClientId = newClient._id;
      // Invalidate the user cache so the newly created client appears in the partner's client list
      if (typeof bustUserCache === 'function') bustUserCache();
    } else if (customPassword) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(customPassword, salt);
      await Client.findByIdAndUpdate(lead.convertedClientId, { password: hashedPassword, email: generatedEmail.toLowerCase() });
    }
  }
};

const getLeads = async (req, res) => {
  try {
    const { role, _id } = req.user;
    const cacheKey = (role === 'super_admin' || role === 'admin') ? 'leads_admin' : `leads_${_id}`;

    const cached = _leadsCache.get(cacheKey);
    if (cached) return res.json(cached);

    let query = {};
    if (role === 'super_admin' || role === 'admin') {
      query = {};
    } else if (role === 'super_partner') {
      const subUsers = await Partner.find({ parent_id: _id }, '_id').lean();
      query = { sourceUserId: { $in: [_id, ...subUsers.map(u => u._id)] } };
    } else {
      query = { sourceUserId: _id };
    }

    const leads = await Lead.find(query, 'name firstName lastName phone email serviceInterest status notes sourceUserId convertedClientId createdAt city').sort('-createdAt').lean();
    const populated = await _populateLeads(leads);

    _leadsCache.set(cacheKey, populated);
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createLead = async (req, res) => {
  try {
    const fields = [
      'name', 'firstName', 'middleName', 'lastName', 'phone', 'email', 'serviceInterest', 'notes', 'status',
      'dob', 'gender', 'maritalStatus', 'oldName', 'newName', 'citizenship',
      'state', 'city', 'pincode', 'permanentAddress', 'stateOld', 'cityOld', 'pincodeOld', 'oldAddress',
      'otherDocsDesc', 'relation', 'relationWithHolder', 'reference', 'referenceName', 'referenceMobileNo',
      'nomineeAge', 'nomineeName', 'nomineeDob', 'nomineeRelation',
      'preference'
    ];
    const leadData = { sourceUserId: req.user._id };
    fields.forEach(f => { if (req.body[f] !== undefined) leadData[f] = req.body[f]; });

    const lead = await Lead.create(leadData);
    if (req.body.status === 'converted') {
      await handleLeadConversion(lead, req.body.password);
      await lead.save();
    }

    bustLeadsCache();
    await Activity.create({ action: `New lead created: ${leadData.name} for ${leadData.serviceInterest}`, user: req.user._id });
    res.status(201).json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateLeadStatus = async (req, res) => {
  try {
    const { status, password } = req.body;
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    lead.status = status;
    await handleLeadConversion(lead, password);
    const updatedLead = await lead.save();
    bustLeadsCache();
    await Activity.create({ action: `Lead ${lead.name} status updated to ${status}`, user: req.user._id });
    res.json(updatedLead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateLead = async (req, res) => {
  try {
    const fields = [
      'name', 'firstName', 'middleName', 'lastName', 'phone', 'email', 'serviceInterest', 'notes', 'status',
      'dob', 'gender', 'maritalStatus', 'oldName', 'newName', 'citizenship',
      'state', 'city', 'pincode', 'permanentAddress', 'stateOld', 'cityOld', 'pincodeOld', 'oldAddress',
      'otherDocsDesc', 'relation', 'relationWithHolder', 'reference', 'referenceName', 'referenceMobileNo',
      'nomineeAge', 'nomineeName', 'nomineeDob', 'nomineeRelation', 'preference'
    ];
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    fields.forEach(f => { if (req.body[f] !== undefined) lead[f] = req.body[f]; });
    await handleLeadConversion(lead, req.body.password);
    await lead.save();

    const updated = await Lead.findById(lead._id).lean();
    const [populated] = await _populateLeads([updated]);

    bustLeadsCache();
    await Activity.create({ action: `Lead ${lead.name} updated`, user: req.user._id });
    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getLeads, createLead, updateLeadStatus, updateLead };
