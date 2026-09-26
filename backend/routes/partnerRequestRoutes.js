const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const PartnerRequest = require('../models/PartnerRequest');
const Notification = require('../models/Notification');
const User = require('../models/User');

// POST /api/partner-requests  — submit a "Become a Partner" request (guest or authenticated)
router.post('/', async (req, res) => {
  try {
    const { fullName, email, phone, profession, regNo, city, state, about } = req.body;

    if (!fullName || !email || !phone || !profession || !city || !state) {
      return res.status(400).json({ message: 'Please fill all required fields.' });
    }

    // Optional user ID if authenticated
    let userId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        userId = decoded.id || null;
      } catch (_) {
        // Token invalid or expired, continue as guest
      }
    }

    // Save request in database
    const partnerRequest = await PartnerRequest.create({
      userId,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      profession,
      regNo: (regNo || '').trim(),
      city: city.trim(),
      state: state.trim(),
      about: (about || '').trim(),
      status: 'pending',
    });

    // Notify superadmins/admins
    const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } });
    const notificationPromises = admins.map((adm) =>
      Notification.create({
        userId: adm._id,
        title: '🤝 New Partner Request',
        message: `${fullName} (${profession}) from ${city}, ${state} wants to join as a partner.\nEmail: ${email} | Phone: ${phone}${regNo ? ` | Reg: ${regNo}` : ''}`,
        type: 'partner_request',
        isRead: false,
      })
    );
    await Promise.allSettled(notificationPromises);

    res.status(201).json({
      success: true,
      message: 'Your partner request has been submitted. Our team will reach out within 24–48 hours.',
      data: partnerRequest,
    });
  } catch (err) {
    console.error('[PartnerRequest]', err);
    res.status(500).json({ message: 'Failed to submit request. Please try again.' });
  }
});

// GET /api/partner-requests  — Admin view all partner requests
router.get('/', protect, admin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [requests, total] = await Promise.all([
      PartnerRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('userId', 'name email phone avatar')
        .populate('reviewedBy', 'name email'),
      PartnerRequest.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: requests,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error('[PartnerRequest GET]', err);
    res.status(500).json({ message: 'Failed to fetch partner requests.' });
  }
});

// PATCH /api/partner-requests/:id  — Admin update request status/notes
router.patch('/:id', protect, admin, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const update = { reviewedBy: req.user._id, reviewedAt: new Date() };
    if (status) update.status = status;
    if (notes !== undefined) update.notes = notes;

    const updated = await PartnerRequest.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Partner request not found.' });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('[PartnerRequest PATCH]', err);
    res.status(500).json({ message: 'Failed to update partner request.' });
  }
});

module.exports = router;
