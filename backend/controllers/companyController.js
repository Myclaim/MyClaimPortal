const Company = require('../models/Company');
const SyncLog = require('../models/SyncLog');
const { syncAllCompanies } = require('../services/syncService');

exports.searchCompanies = async (req, res) => {
  try {
    const { q, limit = 10, page = 1 } = req.query;
    
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const regex = new RegExp(q, 'i');
    
    const companies = await Company.find({
      $or: [
        { name: regex },
        { nseSymbol: regex },
        { bseScripCode: regex },
        { isin: regex }
      ]
    })
    .sort({ name: 1 })
    .limit(parseInt(limit) * 1)
    .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Company.countDocuments({
      $or: [
        { name: regex },
        { nseSymbol: regex },
        { bseScripCode: regex },
        { isin: regex }
      ]
    });

    res.json({
      success: true,
      companies,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error in searchCompanies:', error);
    res.status(500).json({ success: false, message: 'Server error during search' });
  }
};

exports.getCompanies = async (req, res) => {
  try {
    const { page = 1, limit = 50, exchange } = req.query;
    let query = {};
    
    if (exchange) {
      query.exchanges = exchange.toUpperCase();
    }

    const companies = await Company.find(query)
      .sort({ name: 1 })
      .limit(parseInt(limit) * 1)
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Company.countDocuments(query);

    res.json({
      success: true,
      companies,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching companies' });
  }
};

exports.manualSync = async (req, res) => {
  try {
    // Fire and forget so we don't block the request
    syncAllCompanies().catch(err => console.error('Manual sync failed:', err));
    res.json({ success: true, message: 'Manual sync triggered successfully in the background.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to trigger sync' });
  }
};

exports.getSyncStatus = async (req, res) => {
  try {
    const latestSync = await SyncLog.findOne().sort({ createdAt: -1 });
    const totalCompanies = await Company.countDocuments();
    
    res.json({
      success: true,
      totalCompanies,
      latestSync: latestSync || { status: 'No sync recorded yet' }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch sync status' });
  }
};
