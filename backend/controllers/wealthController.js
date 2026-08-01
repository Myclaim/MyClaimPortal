const WealthPortfolio = require('../models/WealthPortfolio');
const WealthProposal = require('../models/WealthProposal');
const MutualFund = require('../models/MutualFund');
const User = require('../models/User');

// Initial seed catalog for Mutual Funds if DB empty
const INITIAL_FUNDS = [
  {
    id: 'mf-1',
    name: 'Quant Small Cap Fund - Direct (G)',
    fundHouse: 'Quant Mutual Fund',
    category: 'Small Cap',
    nav: 268.45,
    returns1m: 4.8, returns3m: 12.4, returns6m: 18.2, returns1y: 38.6, returns3y: 32.4, returns5y: 35.8, sinceInception: 22.4,
    riskometer: 'Very High', aum: '₹18,450 Cr', expenseRatio: 0.77, rating: 5, minSip: 1000,
    fundManager: 'Sanjeev Sharma, Vasav Sahgal',
    objective: 'To generate capital appreciation by investing predominantly in small-cap companies.',
    topHoldings: [
      { name: 'Reliance Industries', pct: '8.4%' },
      { name: 'Jio Financial Services', pct: '6.2%' },
      { name: 'Adani Power', pct: '5.1%' },
      { name: 'HFCL Ltd', pct: '4.3%' },
      { name: 'Bikaji Foods', pct: '3.8%' }
    ],
    sectorAlloc: [
      { sector: 'Energy & Power', pct: 28 },
      { sector: 'Financial Services', pct: 24 },
      { sector: 'Capital Goods', pct: 18 },
      { sector: 'Services', pct: 15 },
      { sector: 'Others', pct: 15 }
    ]
  },
  {
    id: 'mf-2',
    name: 'HDFC Mid-Cap Opportunities Fund (G)',
    fundHouse: 'HDFC Mutual Fund',
    category: 'Mid Cap',
    nav: 184.20,
    returns1m: 3.2, returns3m: 9.8, returns6m: 15.6, returns1y: 29.4, returns3y: 24.8, returns5y: 26.2, sinceInception: 19.8,
    riskometer: 'Very High', aum: '₹64,200 Cr', expenseRatio: 0.85, rating: 5, minSip: 500,
    fundManager: 'Chirag Setalvad',
    objective: 'Long term capital growth by investing predominantly in mid-cap equities.',
    topHoldings: [
      { name: 'Indian Hotels', pct: '4.8%' },
      { name: 'Apollo Tyres', pct: '4.2%' },
      { name: 'Federal Bank', pct: '3.9%' },
      { name: 'Max Financial', pct: '3.5%' },
      { name: 'Coforge', pct: '3.1%' }
    ],
    sectorAlloc: [
      { sector: 'Financials', pct: 22 },
      { sector: 'Automobile', pct: 18 },
      { sector: 'Technology', pct: 16 },
      { sector: 'Consumer Discretionary', pct: 24 },
      { sector: 'Others', pct: 20 }
    ]
  },
  {
    id: 'mf-3',
    name: 'ICICI Pru Bluechip Fund - Direct (G)',
    fundHouse: 'ICICI Prudential MF',
    category: 'Large Cap',
    nav: 112.80,
    returns1m: 2.1, returns3m: 6.4, returns6m: 11.2, returns1y: 22.8, returns3y: 18.6, returns5y: 19.4, sinceInception: 16.5,
    riskometer: 'Very High', aum: '₹52,800 Cr', expenseRatio: 0.92, rating: 4, minSip: 1000,
    fundManager: 'Anish Tawakley, Vaibhav Dusad',
    objective: 'Capital appreciation from a portfolio of large cap companies.',
    topHoldings: [
      { name: 'ICICI Bank', pct: '9.2%' },
      { name: 'HDFC Bank', pct: '8.7%' },
      { name: 'Infosys', pct: '7.1%' },
      { name: 'L&T', pct: '6.4%' },
      { name: 'TCS', pct: '5.2%' }
    ],
    sectorAlloc: [
      { sector: 'Financial Services', pct: 34 },
      { sector: 'IT Services', pct: 16 },
      { sector: 'Capital Goods', pct: 14 },
      { sector: 'Oil & Gas', pct: 12 },
      { sector: 'Others', pct: 24 }
    ]
  },
  {
    id: 'mf-4',
    name: 'Parag Parikh Flexi Cap Fund (G)',
    fundHouse: 'PPFAS Mutual Fund',
    category: 'Flexi Cap',
    nav: 74.50,
    returns1m: 2.8, returns3m: 8.1, returns6m: 14.5, returns1y: 26.2, returns3y: 22.4, returns5y: 24.8, sinceInception: 19.2,
    riskometer: 'Very High', aum: '₹68,500 Cr', expenseRatio: 0.62, rating: 5, minSip: 1000,
    fundManager: 'Rajeev Thakkar, Raunak Onkar',
    objective: 'Long term capital growth by investing in equity instruments across market caps & geographies.',
    topHoldings: [
      { name: 'HDFC Bank', pct: '8.1%' },
      { name: 'Alphabet Inc (Google)', pct: '6.4%' },
      { name: 'Bajaj Holdings', pct: '5.9%' },
      { name: 'ITC Ltd', pct: '5.4%' },
      { name: 'Microsoft Corp', pct: '4.8%' }
    ],
    sectorAlloc: [
      { sector: 'Financials', pct: 30 },
      { sector: 'Global Tech', pct: 18 },
      { sector: 'FMCG', pct: 14 },
      { sector: 'Services', pct: 12 },
      { sector: 'Others', pct: 26 }
    ]
  }
];

const INITIAL_PROPOSALS = [
  { proposalId: 'PROP-9041', clientName: 'Dr. Ananya Roy', product: 'Wealth Creation Basket', scheme: 'Quant Small Cap Fund', investmentType: 'SIP', amount: '₹75,000/mo', tenure: '10 Years', status: 'Accepted', advisorName: 'Partner Advisor' },
  { proposalId: 'PROP-9042', clientName: 'Rajesh Kumar Verma', product: 'Tax Saver ELSS + Term Plan', scheme: 'HDFC Mid-Cap Fund', investmentType: 'Lumpsum', amount: '₹1,50,000', tenure: '5 Years', status: 'Viewed', advisorName: 'Partner Advisor' },
  { proposalId: 'PROP-9043', clientName: 'Sunita Mehra', product: 'Shriram FD + Hybrid Fund', scheme: 'ICICI Pru Bluechip', investmentType: 'Lumpsum', amount: '₹5,00,000', tenure: '3 Years', status: 'Shared', advisorName: 'Partner Advisor' }
];

const INITIAL_CLIENTS = [
  { clientName: 'Rajesh Kumar Verma', pan: 'ABCDE1234F', kyc: 'Verified', riskProfile: 'Aggressive', aum: 4250000, sipAmount: 35000, goalsCount: 3, phone: '+91 98765 43210', email: 'rajesh.verma@gmail.com' },
  { clientName: 'Sunita Mehra', pan: 'BKWPS9876K', kyc: 'Verified', riskProfile: 'Moderate', aum: 2810000, sipAmount: 20000, goalsCount: 2, phone: '+91 98123 45678', email: 'sunita.mehra@yahoo.com' },
  { clientName: 'Dr. Ananya Roy', pan: 'CLPRT5432M', kyc: 'Verified', riskProfile: 'Aggressive', aum: 8500000, sipAmount: 75000, goalsCount: 4, phone: '+91 99887 76655', email: 'ananya.roy@aiims.edu' },
  { clientName: 'Vikramaditya Singhania', pan: 'DXPKL8765P', kyc: 'Pending Verification', riskProfile: 'Conservative', aum: 14500000, sipAmount: 120000, goalsCount: 5, phone: '+91 97654 32109', email: 'vikram.singhania@group.com' }
];

// Helper to seed data if collections empty
const seedWealthDataIfEmpty = async () => {
  try {
    const mfCount = await MutualFund.countDocuments();
    if (mfCount === 0) {
      await MutualFund.insertMany(INITIAL_FUNDS);
    }
    const propCount = await WealthProposal.countDocuments();
    if (propCount === 0) {
      await WealthProposal.insertMany(INITIAL_PROPOSALS);
    }
    const portCount = await WealthPortfolio.countDocuments();
    if (portCount === 0) {
      await WealthPortfolio.insertMany(INITIAL_CLIENTS);
    }
  } catch (err) {
    console.error('Error seeding wealth data:', err.message);
  }
};

// @desc Get Wealth Overview Stats & Summary
// @route GET /api/wealth/overview
// @access Private/Public
exports.getWealthOverview = async (req, res) => {
  try {
    await seedWealthDataIfEmpty();

    const mutualFunds = await MutualFund.find().lean();
    const proposals = await WealthProposal.find().sort({ createdAt: -1 }).lean();
    const clientPortfolios = await WealthPortfolio.find().lean();

    // Calculate aggregated metrics from DB
    const totalAumNumber = clientPortfolios.reduce((sum, c) => sum + (c.aum || 0), 0);
    const totalSipNumber = clientPortfolios.reduce((sum, c) => sum + (c.sipAmount || 0), 0);
    const totalClientsCount = clientPortfolios.length;

    res.json({
      success: true,
      stats: {
        totalAum: `₹${(totalAumNumber / 10000000).toFixed(1)} Cr`,
        totalClients: totalClientsCount,
        monthlySip: `₹${(totalSipNumber / 100000).toFixed(1)} Lakhs`,
        fdValue: '₹14.5 Cr',
        insurancePremium: '₹18.2 Lakhs'
      },
      mutualFunds,
      proposals,
      clientPortfolios
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get Mutual Funds Catalog
// @route GET /api/wealth/mutual-funds
// @access Private/Public
exports.getMutualFunds = async (req, res) => {
  try {
    await seedWealthDataIfEmpty();
    const funds = await MutualFund.find().lean();
    res.json({ success: true, funds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get Wealth Client Portfolios
// @route GET /api/wealth/clients
// @access Private/Public
exports.getWealthClients = async (req, res) => {
  try {
    await seedWealthDataIfEmpty();
    const clients = await WealthPortfolio.find().sort({ aum: -1 }).lean();
    res.json({ success: true, clients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get Wealth Proposals
// @route GET /api/wealth/proposals
// @access Private/Public
exports.getProposals = async (req, res) => {
  try {
    await seedWealthDataIfEmpty();
    const proposals = await WealthProposal.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, proposals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create Wealth Proposal
// @route POST /api/wealth/proposals
// @access Private/Public
exports.createProposal = async (req, res) => {
  try {
    const { clientName, product, scheme, investmentType, amount, tenure, advisorName } = req.body;
    
    if (!clientName || !scheme || !amount) {
      return res.status(400).json({ success: false, message: 'Please provide client name, scheme, and investment amount' });
    }

    const proposalId = `PROP-${Math.floor(1000 + Math.random() * 9000)}`;

    const newProposal = await WealthProposal.create({
      proposalId,
      clientName,
      product: product || 'Mutual Funds',
      scheme,
      investmentType: investmentType || 'SIP',
      amount: amount.startsWith('₹') ? amount : `₹${Number(amount).toLocaleString('en-IN')}${investmentType === 'SIP' ? '/mo' : ''}`,
      tenure: tenure || '5 Years',
      status: 'Shared',
      advisorName: advisorName || (req.user ? req.user.name : 'Partner Advisor'),
      createdBy: req.user ? req.user._id : null
    });

    if (global.io) {
      global.io.emit('wealth_proposal_created', newProposal);
    }

    res.status(201).json({ success: true, proposal: newProposal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create Wealth Client Portfolio
// @route POST /api/wealth/clients
// @access Private/Public
exports.createWealthClient = async (req, res) => {
  try {
    const { clientName, pan, kyc, riskProfile, aum, sipAmount, phone, email } = req.body;
    if (!clientName || !pan) {
      return res.status(400).json({ success: false, message: 'Please provide client name and PAN' });
    }
    const newClient = await WealthPortfolio.create({
      clientName,
      pan,
      kyc: kyc || 'Verified',
      riskProfile: riskProfile || 'Moderate',
      aum: Number(aum) || 0,
      sipAmount: Number(sipAmount) || 0,
      phone: phone || '',
      email: email || '',
      partner: req.user ? req.user._id : null
    });
    res.status(201).json({ success: true, client: newClient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete Wealth Client Portfolio
// @route DELETE /api/wealth/clients/:id
// @access Private/Public
exports.deleteWealthClient = async (req, res) => {
  try {
    const deletedClient = await WealthPortfolio.findByIdAndDelete(req.params.id);
    if (!deletedClient) {
      return res.status(404).json({ success: false, message: 'Client portfolio not found' });
    }
    res.json({ success: true, message: 'Client portfolio deleted', client: deletedClient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update Proposal Status
// @route PATCH /api/wealth/proposals/:id/status
// @access Private/Public
exports.updateProposalStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const proposal = await WealthProposal.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }
    res.json({ success: true, proposal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


