const express = require('express');
const router = express.Router();
const PreIPO = require('../models/PreIPO');
const PreIPOAllocation = require('../models/PreIPOAllocation');
const { protect, admin, adminOrSuperPartner } = require('../middleware/authMiddleware');

// Get all Pre-IPOs
router.get('/', protect, async (req, res) => {
  try {
    const preIpos = await PreIPO.find({}).sort('-createdAt');
    res.json(preIpos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new Pre-IPO (Admin Only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, subCategory, price, totalEquity, description, code } = req.body;
    
    // Generate a code if none provided
    const ipoCode = code || `STR-${name.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const preIpo = await PreIPO.create({
      code: ipoCode,
      name,
      subCategory,
      price,
      totalEquity,
      availableEquity: totalEquity, // initially full amount is available
      description,
      tracking: ['Order Placed', 'Payment Verified', 'Transfer Initiated', 'Shares Credited'],
      createdBy: req.user._id
    });
    
    res.status(201).json(preIpo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Pre-IPO (Admin Only)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const preIpo = await PreIPO.findById(req.params.id);
    if (!preIpo) return res.status(404).json({ message: 'Pre-IPO not found' });

    const { price, totalEquity, status } = req.body;

    if (price !== undefined) preIpo.price = price;
    if (status !== undefined) preIpo.status = status;
    
    if (totalEquity !== undefined) {
      // Adjust available equity based on the change in total equity
      const difference = Number(totalEquity) - preIpo.totalEquity;
      preIpo.totalEquity = totalEquity;
      preIpo.availableEquity += difference;
    }

    const updatedPreIpo = await preIpo.save();
    res.json(updatedPreIpo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Allocate shares to a client (Admin, Partner, Super Partner)
router.post('/:id/allocate', protect, adminOrSuperPartner, async (req, res) => {
  try {
    const { clientId, clientName, quantity } = req.body;
    const qty = Number(quantity);
    
    if (!qty || qty <= 0) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    const preIpo = await PreIPO.findById(req.params.id);
    if (!preIpo) return res.status(404).json({ message: 'Pre-IPO not found' });

    if (preIpo.availableEquity < qty) {
      return res.status(400).json({ 
        message: `Insufficient shares available. Only ${preIpo.availableEquity} left.` 
      });
    }

    // Create allocation record
    const allocation = await PreIPOAllocation.create({
      preIpo: preIpo._id,
      client: clientId,
      clientName,
      quantity: qty,
      priceAtAllocation: preIpo.price,
      totalAmount: preIpo.price * qty,
      allocatedBy: req.user._id
    });

    // Decrement available equity
    preIpo.availableEquity -= qty;
    await preIpo.save();

    res.status(201).json({ preIpo, allocation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
