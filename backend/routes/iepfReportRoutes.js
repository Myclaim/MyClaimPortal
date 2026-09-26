const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const IepfReportRequest = require('../models/IepfReportRequest');
const Notification = require('../models/Notification');
const User = require('../models/User');

const { sendOtpEmail } = require('../utils/emailService');

// In-memory OTP store: target -> { otp, expiresAt }
const otpStore = new Map();

// POST /api/iepf-reports/send-otp — send OTP via nodemailer (email) or SMS
router.post('/send-otp', async (req, res) => {
  try {
    const { target, type } = req.body; // 'email' or 'mobile'
    if (!target) {
      return res.status(400).json({ success: false, message: 'Recipient is required.' });
    }

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    otpStore.set(target.toLowerCase().trim(), { otp, expiresAt });

    if (type === 'email') {
      // Send real email via nodemailer
      await sendOtpEmail(target, otp);
    } else {
      // Mobile SMS OTP logging
      console.log(`[SMS Gateway] OTP for ${target}: ${otp}`);
    }

    res.json({
      success: true,
      message: `OTP sent successfully to ${target}`,
    });
  } catch (err) {
    console.error('[send-otp]', err);
    res.status(500).json({ success: false, message: 'Failed to send OTP.' });
  }
});

// POST /api/iepf-reports/verify-otp — verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { target, otp } = req.body;
    if (!target || !otp) {
      return res.status(400).json({ success: false, message: 'Target and OTP are required.' });
    }
    const key = target.toLowerCase().trim();
    const record = otpStore.get(key);

    if (!record) {
      return res.status(400).json({ success: false, message: 'No OTP requested or OTP has expired.' });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(key);
      return res.status(400).json({ success: false, message: 'OTP has expired.' });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please check the code.' });
    }

    otpStore.delete(key);
    res.json({ success: true, message: 'OTP verified successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to verify OTP.' });
  }
});

// POST /api/iepf-reports — submit Free IEPF Report request
router.post('/', async (req, res) => {
  try {
    const {
      fullName,
      panNumber,
      email,
      mobile,
      folioOrDpId,
      companyName,
      oldAddressProofName,
      shareDocsNames,
    } = req.body;

    if (!fullName || !panNumber || !email || !mobile) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Full Name, PAN Number, Email and Mobile.',
      });
    }

    let userId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        userId = decoded.id || null;
      } catch (_) {}
    }

    const reportRequest = await IepfReportRequest.create({
      userId,
      fullName: fullName.trim(),
      panNumber: panNumber.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      mobile: mobile.trim(),
      folioOrDpId: (folioOrDpId || '').trim(),
      companyName: (companyName || '').trim(),
      oldAddressProofName: oldAddressProofName || '',
      shareDocsNames: Array.isArray(shareDocsNames) ? shareDocsNames : [],
      status: 'pending',
    });

    // Notify admins
    const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } });
    const notificationPromises = admins.map((adm) =>
      Notification.create({
        userId: adm._id,
        title: '📑 New Free IEPF Report Request',
        message: `${fullName} (PAN: ${panNumber.toUpperCase()}) requested an IEPF recovery report. Email: ${email} | Phone: ${mobile}${companyName ? ` | Company: ${companyName}` : ''}`,
        type: 'iepf_request',
        isRead: false,
      })
    );
    await Promise.allSettled(notificationPromises);

    res.status(201).json({
      success: true,
      message: 'Your IEPF Report request has been submitted successfully! We will email your report shortly.',
      data: reportRequest,
    });
  } catch (err) {
    console.error('[IepfReportRequest]', err);
    res.status(500).json({ success: false, message: 'Failed to submit report request.' });
  }
});

// GET /api/iepf-reports — Admin view
router.get('/', protect, admin, async (req, res) => {
  try {
    const list = await IepfReportRequest.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch IEPF requests.' });
  }
});

module.exports = router;
