const Client = require('../../models/client/Client');
const crypto = require('crypto');

// Generate a unique referral code like MC-ABCD12
const generateReferralCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'MC-';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

// Ensure client has a referral code, generate if missing
const ensureReferralCode = async (client) => {
  if (!client.referralCode) {
    let code;
    let exists = true;
    while (exists) {
      code = generateReferralCode();
      exists = await Client.findOne({ referralCode: code });
    }
    client.referralCode = code;
    await client.save();
  }
  return client.referralCode;
};

// GET /api/referral/my-code
// Returns this client's referral code + stats
const getMyReferralCode = async (req, res) => {
  try {
    const client = await Client.findById(req.user._id);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    const referralCode = await ensureReferralCode(client);

    // Build list of people referred
    const referredClients = await Client.find({ referredBy: referralCode })
      .select('name email createdAt')
      .sort({ createdAt: -1 });

    res.json({
      referralCode,
      referralCount: client.referralCount || 0,
      referredBy: client.referredBy || null,
      hasEnteredReferCode: client.hasEnteredReferCode || false,
      referCodePromptCount: client.referCodePromptCount || 0,
      referredClients: referredClients.map(c => ({
        name: c.name,
        email: c.email?.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
        joinedAt: c.createdAt
      }))
    });
  } catch (err) {
    console.error('[Referral] getMyReferralCode error:', err);
    res.status(500).json({ message: err.message });
  }
};

// POST /api/referral/apply
// Body: { code: 'MC-XXXXXX' }
const applyReferralCode = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Referral code is required' });

    const trimmedCode = code.trim().toUpperCase();

    const client = await Client.findById(req.user._id);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    // Already applied
    if (client.referredBy) {
      return res.status(400).json({ message: 'You have already applied a referral code' });
    }

    // Cannot use own code
    if (client.referralCode === trimmedCode) {
      return res.status(400).json({ message: "You can't use your own referral code" });
    }

    // Find the referrer
    const referrer = await Client.findOne({ referralCode: trimmedCode });
    if (!referrer) {
      return res.status(404).json({ message: 'Invalid referral code. Please check and try again.' });
    }

    // Apply code
    client.referredBy = trimmedCode;
    client.hasEnteredReferCode = true;
    client.referCodePromptCount = 3; // Stop showing prompt
    await client.save();

    // Increment referrer's count
    await Client.findByIdAndUpdate(referrer._id, { $inc: { referralCount: 1 } });

    res.json({
      message: `Referral recorded! You were referred by ${referrer.name || 'a friend'}.`,
      referredBy: trimmedCode
    });
  } catch (err) {
    console.error('[Referral] applyReferralCode error:', err);
    res.status(500).json({ message: err.message });
  }
};

// POST /api/referral/dismiss-prompt
// Called when client clicks "I don't have a referral code"
const dismissPrompt = async (req, res) => {
  try {
    const client = await Client.findById(req.user._id);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    const newCount = Math.min((client.referCodePromptCount || 0) + 1, 3);
    client.referCodePromptCount = newCount;
    if (newCount >= 3) {
      client.hasEnteredReferCode = true; // Stop showing after 3 dismissals
    }
    await client.save();

    res.json({
      referCodePromptCount: newCount,
      hasEnteredReferCode: client.hasEnteredReferCode
    });
  } catch (err) {
    console.error('[Referral] dismissPrompt error:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMyReferralCode, applyReferralCode, dismissPrompt };
