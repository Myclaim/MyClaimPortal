const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const ClientRequest = require('../models/ClientRequest');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendClientRequestAckEmail } = require('../utils/emailService');

// POST /api/client-requests — submit a new client inquiry / registration request
router.post('/', async (req, res) => {
  try {
    const { fullName, email, phone, service, city, state, companyOrFolio, details } = req.body;

    if (!fullName || !email || !phone || !service || !city || !state) {
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
        // Continue as guest
      }
    }

    // Save in database
    const clientRequest = await ClientRequest.create({
      userId,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      service: service.trim(),
      city: city.trim(),
      state: state.trim(),
      companyOrFolio: (companyOrFolio || '').trim(),
      details: (details || '').trim(),
      status: 'pending',
    });

    // Notify superadmins/admins
    try {
      const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } });
      const notificationPromises = admins.map((adm) =>
        Notification.create({
          userId: adm._id,
          title: '📋 New Client Request',
          message: `${fullName} requested help with "${service}" from ${city}, ${state}.\nEmail: ${email} | Phone: ${phone}`,
          type: 'client_request',
          isRead: false,
        })
      );
      await Promise.allSettled(notificationPromises);
    } catch (notifErr) {
      console.error('[ClientRequest Notification error]:', notifErr);
    }

    // Send confirmation email asynchronously
    sendClientRequestAckEmail(email, fullName, service).catch((e) =>
      console.warn('[ClientRequest Ack Email error]:', e.message)
    );

    res.status(201).json({
      success: true,
      message: 'Your request has been submitted. Our claim advisor will contact you within 24 hours.',
      data: clientRequest,
    });
  } catch (err) {
    console.error('[ClientRequest POST]', err);
    res.status(500).json({ message: 'Failed to submit client request. Please try again.' });
  }
});

// GET /api/client-requests — Admin view all client requests
router.get('/', protect, admin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [requests, total] = await Promise.all([
      ClientRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('userId', 'name email phone avatar')
        .populate('reviewedBy', 'name email'),
      ClientRequest.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: requests,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error('[ClientRequest GET]', err);
    res.status(500).json({ message: 'Failed to fetch client requests.' });
  }
});

// PATCH /api/client-requests/:id — Admin update request status/notes
router.patch('/:id', protect, admin, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const update = { reviewedBy: req.user._id, reviewedAt: new Date() };
    if (status) update.status = status;
    if (notes !== undefined) update.notes = notes;

    const updated = await ClientRequest.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Client request not found.' });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('[ClientRequest PATCH]', err);
    res.status(500).json({ message: 'Failed to update client request.' });
  }
});

module.exports = router;
