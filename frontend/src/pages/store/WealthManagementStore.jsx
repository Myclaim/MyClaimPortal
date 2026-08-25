import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Shield, Award, Users, DollarSign,
  PieChart, BarChart3, Search, Filter, ArrowUpRight, ArrowDownRight,
  Calculator, FileText, CheckCircle2, AlertCircle, Clock, ChevronRight,
  Plus, Download, Share2, Eye, RefreshCw, Sparkles, Building, Landmark,
  HeartPulse, Car, Globe, Calendar, Bookmark, Star, ArrowRight, Zap,
  CheckSquare, Activity, User, Phone, Mail, HelpCircle, AlertTriangle,
  Info, ExternalLink, X, FileSpreadsheet, Lock, Percent, Layers, Trash2, Edit3
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import api from '../../services/api';
import { useSocket } from '../../hooks/useSocket';

// ─── STATIC MARKET & CATEGORY DATA ───────────────────────────────────────────────

const MARKET_TICKER = [
  { symbol: 'NIFTY 50', value: '24,842.10', change: '+184.20', pct: '+0.75%', isUp: true },
  { symbol: 'SENSEX', value: '81,450.60', change: '+520.40', pct: '+0.64%', isUp: true },
  { symbol: 'BANK NIFTY', value: '51,920.30', change: '+610.10', pct: '+1.19%', isUp: true },
  { symbol: 'INDIA VIX', value: '12.85', change: '-0.45', pct: '-3.38%', isUp: false },
  { symbol: 'GOLD (10g)', value: '₹72,450', change: '+210', pct: '+0.29%', isUp: true },
  { symbol: 'USD/INR', value: '83.72', change: '-0.04', pct: '-0.05%', isUp: false }
];

const INITIAL_MUTUAL_FUNDS = [
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

const CURATED_BASKETS = [
  { id: 'b1', name: 'Retirement Wealth Basket', risk: 'Moderate', cagr: '18.4%', minInv: '₹5,000/mo', desc: 'Inflation-beating blend of Flexi-Cap & Hybrid funds for peaceful golden years.', icon: Landmark, tag: 'Popular' },
  { id: 'b2', name: 'Tax Saver ELSS Power Pack', risk: 'High', cagr: '22.1%', minInv: '₹1,500/mo', desc: 'Save up to ₹46,800 under Section 80C with 3-year lowest lock-in.', icon: Shield, tag: 'Tax 80C' },
  { id: 'b3', name: 'Aggressive Alpha Growth', risk: 'Very High', cagr: '28.6%', minInv: '₹2,500/mo', desc: 'High-octane Small & Mid-cap selection focused on emerging multi-baggers.', icon: Zap, tag: 'High Return' },
  { id: 'b4', name: 'Child Education Freedom', risk: 'Moderate', cagr: '19.2%', minInv: '₹3,000/mo', desc: 'Disciplined 10+ year horizon fund suite to secure Ivy-League college fees.', icon: Award, tag: 'Goal Based' },
  { id: 'b5', name: 'Tech & AI Future Disruptors', risk: 'Very High', cagr: '25.4%', minInv: '₹2,000/mo', desc: 'Focused exposure on Global Tech, AI Semiconductors & US Tech giants.', icon: Sparkles, tag: 'Thematic' },
  { id: 'b6', name: 'Women Investor Shield', risk: 'Conservative', cagr: '14.8%', minInv: '₹1,000/mo', desc: 'Low volatility capital protection plus steady compounding for home builders.', icon: HeartPulse, tag: 'Low Risk' }
];

const INITIAL_STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', price: '3,024.50', change: '+45.20', pct: '+1.52%', pe: 28.4, cap: '₹20.4L Cr', recommendation: 'Strong Buy' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: '1,642.10', change: '+18.50', pct: '+1.14%', pe: 19.2, cap: '₹12.5L Cr', recommendation: 'Buy' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: '4,280.00', change: '-24.80', pct: '-0.58%', pe: 32.1, cap: '₹15.4L Cr', recommendation: 'Hold' },
  { symbol: 'INFY', name: 'Infosys Limited', price: '1,824.30', change: '+12.40', pct: '+0.68%', pe: 26.5, cap: '₹7.6L Cr', recommendation: 'Buy' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', price: '1,045.60', change: '+28.90', pct: '+2.84%', pe: 16.8, cap: '₹3.8L Cr', recommendation: 'Strong Buy' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', price: '1,214.80', change: '+14.20', pct: '+1.18%', pe: 18.4, cap: '₹8.5L Cr', recommendation: 'Strong Buy' }
];

const INSURANCE_PRODUCTS = [
  { id: 'ins-1', category: 'Health', title: 'Star Health Optima Secure', sumInsured: '₹1 Cr', premium: '1250', features: ['4x Base Cover', 'Zero Deduction on Consumables', 'Global Emergency Cover'], rating: '4.8★', provider: 'Star Health' },
  { id: 'ins-2', category: 'Health', title: 'HDFC ERGO Optima Secure', sumInsured: '₹1 Cr', premium: '1420', features: ['Instant 2x Cover from Day 1', 'No Claim Bonus up to 100%', 'Cashless at 13,000+ Hospitals'], rating: '4.9★', provider: 'HDFC ERGO' },
  { id: 'ins-3', category: 'Life', title: 'Max Life Smart Term Plan', sumInsured: '₹2 Cr', premium: '1850', features: ['Return of Premium Option', 'Critical Illness Rider', '99.65% Claim Settlement'], rating: '4.9★', provider: 'Max Life' },
  { id: 'ins-4', category: 'Motor', title: 'ICICI Lombard Comprehensive Car', sumInsured: 'IDV ₹12.5 L', premium: '8450', features: ['Zero Depreciation Cover', '24x7 Roadside Assistance', 'Engine Protect Rider'], rating: '4.7★', provider: 'ICICI Lombard' }
];

const FIXED_DEPOSITS_DATA = [
  { bank: 'Shriram Finance', rate: '9.40% p.a.', maxTenure: '60 Months', minAmt: '5000', rating: 'CRISIL AA+/Stable', safety: 'High' },
  { bank: 'Bajaj Finance', rate: '8.85% p.a.', maxTenure: '42 Months', minAmt: '15000', rating: 'CRISIL AAA/Stable', safety: 'Highest (AAA)' },
  { bank: 'Mahindra Finance', rate: '8.60% p.a.', maxTenure: '48 Months', minAmt: '10000', rating: 'IND AAA/Stable', safety: 'Highest (AAA)' },
  { bank: 'HDFC Bank FD', rate: '7.75% p.a.', maxTenure: '55 Months', minAmt: '10000', rating: 'DICGC Insured up to 5L', safety: 'Sovereign Bank' }
];

const INITIAL_CLIENTS_ROSTER = [
  { id: 'cl-101', clientName: 'Rajesh Kumar Verma', pan: 'ABCDE1234F', kyc: 'Verified', riskProfile: 'Aggressive', aum: 4250000, sipAmount: 35000, goalsCount: 3, phone: '+91 98765 43210', email: 'rajesh.verma@gmail.com' },
  { id: 'cl-102', clientName: 'Sunita Mehra', pan: 'BKWPS9876K', kyc: 'Verified', riskProfile: 'Moderate', aum: 2810000, sipAmount: 20000, goalsCount: 2, phone: '+91 98123 45678', email: 'sunita.mehra@yahoo.com' },
  { id: 'cl-103', clientName: 'Dr. Ananya Roy', pan: 'CLPRT5432M', kyc: 'Verified', riskProfile: 'Aggressive', aum: 8500000, sipAmount: 75000, goalsCount: 4, phone: '+91 99887 76655', email: 'ananya.roy@aiims.edu' },
  { id: 'cl-104', clientName: 'Vikramaditya Singhania', pan: 'DXPKL8765P', kyc: 'Pending Verification', riskProfile: 'Conservative', aum: 14500000, sipAmount: 120000, goalsCount: 5, phone: '+91 97654 32109', email: 'vikram.singhania@group.com' }
];

const AUM_GRAPH_DATA = [
  { month: 'Jan', aum: 84.5, sips: 24.2 },
  { month: 'Feb', aum: 90.2, sips: 26.5 },
  { month: 'Mar', aum: 96.8, sips: 29.1 },
  { month: 'Apr', aum: 104.2, sips: 32.4 },
  { month: 'May', aum: 112.5, sips: 35.8 },
  { month: 'Jun', aum: 119.8, sips: 38.2 },
  { month: 'Jul', aum: 128.4, sips: 42.5 }
];

const ASSET_ALLOC_DATA = [
  { name: 'Equity Mutual Funds', value: 45, color: '#22c55e' },
  { name: 'Fixed Deposits & Debt', value: 25, color: '#3b82f6' },
  { name: 'Direct Stocks', value: 15, color: '#a855f7' },
  { name: 'Insurance & Health', value: 10, color: '#f59e0b' },
  { name: 'Pre-IPO & SIF', value: 5, color: '#ec4899' }
];

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function WealthManagementStore() {
  const { socket, connected: socketConnected } = useSocket();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modals state
  const [selectedFundModal, setSelectedFundModal] = useState(null);
  const [selectedClientModal, setSelectedClientModal] = useState(null);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);

  // New stock input form
  const [newStockSymbol, setNewStockSymbol] = useState('');
  const [newStockName, setNewStockName] = useState('');
  const [newStockPrice, setNewStockPrice] = useState('');
  const [newStockRec, setNewStockRec] = useState('Buy');

  // New client input form
  const [newClientName, setNewClientName] = useState('');
  const [newClientPan, setNewClientPan] = useState('');
  const [newClientKyc, setNewClientKyc] = useState('Verified');
  const [newClientRisk, setNewClientRisk] = useState('Moderate');
  const [newClientAum, setNewClientAum] = useState('');
  const [newClientSip, setNewClientSip] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');

  // Dynamic state loaded from DB
  const [loading, setLoading] = useState(true);
  const [mutualFunds, setMutualFunds] = useState(INITIAL_MUTUAL_FUNDS);
  const [stocksWatchlist, setStocksWatchlist] = useState(INITIAL_STOCKS);
  const [clientsRoster, setClientsRoster] = useState(INITIAL_CLIENTS_ROSTER);
  const [proposals, setProposals] = useState([]);

  // Dynamic computed stats
  const stats = useMemo(() => {
    const totalAumVal = clientsRoster.reduce((sum, c) => sum + (Number(c.aum) || 0), 0);
    const totalSipVal = clientsRoster.reduce((sum, c) => sum + (Number(c.sipAmount) || 0), 0);
    return {
      totalAum: `₹${(totalAumVal / 10000000).toFixed(2)} Cr`,
      totalClients: clientsRoster.length,
      monthlySip: `₹${(totalSipVal / 100000).toFixed(1)} Lakhs`,
      fdValue: '₹14.5 Cr',
      insurancePremium: '₹18.2 Lakhs'
    };
  }, [clientsRoster]);

  // Calculators State
  const [sipAmount, setSipAmount] = useState(15000);
  const [sipRate, setSipRate] = useState(14);
  const [sipYears, setSipYears] = useState(15);

  // Goal Calculator State
  const [selectedGoal, setSelectedGoal] = useState('Retirement');
  const [targetCorpus, setTargetCorpus] = useState(25000000);
  const [goalYears, setGoalYears] = useState(20);

  // Proposal Builder State
  const [propStep, setPropStep] = useState(1);
  const [propClient, setPropClient] = useState('');
  const [propProduct, setPropProduct] = useState('Mutual Funds');
  const [propScheme, setPropScheme] = useState('Quant Small Cap Fund - Direct (G)');
  const [propType, setPropType] = useState('SIP');
  const [propAmount, setPropAmount] = useState('10000');
  const [propTenure, setPropTenure] = useState('10 Years');

  // ── Fetch DB Data on Mount
  const fetchWealthData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/wealth/overview');
      if (res.data && res.data.success) {
        if (res.data.mutualFunds && res.data.mutualFunds.length > 0) setMutualFunds(res.data.mutualFunds);
        if (res.data.proposals && res.data.proposals.length > 0) setProposals(res.data.proposals);
        if (res.data.clientPortfolios && res.data.clientPortfolios.length > 0) setClientsRoster(res.data.clientPortfolios);
      }
    } catch (err) {
      console.warn('Backend API connection fallback, utilizing active Mongoose dataset:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWealthData();
  }, []);

  // WebSockets real-time listener for proposals
  useEffect(() => {
    if (socket) {
      socket.on('wealth_proposal_created', (newProp) => {
        setProposals((prev) => [newProp, ...prev]);
      });
      return () => {
        socket.off('wealth_proposal_created');
      };
    }
  }, [socket]);

  // Filtered mutual funds list
  const filteredFunds = useMemo(() => {
    return mutualFunds.filter((mf) => {
      const matchesCategory = selectedCategory === 'All' || mf.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || (mf.name && mf.name.toLowerCase().includes(q)) || (mf.fundHouse && mf.fundHouse.toLowerCase().includes(q)) || (mf.category && mf.category.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [mutualFunds, selectedCategory, searchQuery]);

  // Filtered Clients Roster
  const filteredClients = useMemo(() => {
    return clientsRoster.filter((c) => {
      const q = clientSearchQuery.toLowerCase();
      if (!q) return true;
      const name = (c.clientName || c.name || '').toLowerCase();
      const pan = (c.pan || '').toLowerCase();
      const phone = (c.phone || '').toLowerCase();
      const risk = (c.riskProfile || '').toLowerCase();
      return name.includes(q) || pan.includes(q) || phone.includes(q) || risk.includes(q);
    });
  }, [clientsRoster, clientSearchQuery]);

  // ── SIP Calculation logic
  const sipResult = useMemo(() => {
    const P = Number(sipAmount) || 0;
    const r = (Number(sipRate) || 0) / 12 / 100;
    const n = (Number(sipYears) || 0) * 12;
    if (r === 0 || n === 0) return { invested: P * n, total: P * n, profit: 0 };
    const total = P * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    const invested = P * n;
    const profit = Math.max(0, total - invested);
    return {
      invested: Math.round(invested),
      total: Math.round(total),
      profit: Math.round(profit)
    };
  }, [sipAmount, sipRate, sipYears]);

  // ── Goal Required SIP Calculation
  const goalSipResult = useMemo(() => {
    const FV = Number(targetCorpus) || 0;
    const r = 0.12 / 12;
    const n = (Number(goalYears) || 0) * 12;
    if (r === 0 || n === 0) return 0;
    const requiredMonthly = FV / (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    return Math.round(requiredMonthly);
  }, [targetCorpus, goalYears]);

  // ── Create Proposal Saved to DB
  const handleAddProposal = async () => {
    if (!propClient) {
      alert('Please select a client to generate a proposal.');
      return;
    }

    try {
      const res = await api.post('/wealth/proposals', {
        clientName: propClient,
        product: `${propScheme} (${propType})`,
        scheme: propScheme,
        investmentType: propType,
        amount: String(propAmount),
        tenure: propTenure,
        advisorName: 'Partner Advisor'
      });

      if (res.data && res.data.proposal) {
        setProposals([res.data.proposal, ...proposals]);
      } else {
        const fallbackProp = {
          proposalId: `PROP-${Math.floor(1000 + Math.random() * 9000)}`,
          clientName: propClient,
          product: `${propScheme} (${propType})`,
          amount: `₹${Number(propAmount).toLocaleString('en-IN')}${propType === 'SIP' ? '/mo' : ''}`,
          createdAt: new Date().toISOString(),
          status: 'Shared'
        };
        setProposals([fallbackProp, ...proposals]);
      }
      setPropStep(7);
    } catch (err) {
      console.error('Error saving proposal to DB:', err);
      setPropStep(7);
    }
  };

  // ── Update Proposal Status in DB
  const handleUpdateProposalStatus = async (proposalObj, newStatus) => {
    const pId = proposalObj._id || proposalObj.id;
    try {
      if (pId && !String(pId).startsWith('PROP-')) {
        await api.patch(`/wealth/proposals/${pId}/status`, { status: newStatus });
      }
      setProposals(proposals.map((p) => {
        if ((p._id && p._id === pId) || (p.proposalId && p.proposalId === proposalObj.proposalId)) {
          return { ...p, status: newStatus };
        }
        return p;
      }));
    } catch (err) {
      console.error('Error updating proposal status:', err);
    }
  };

  // ── Create New Client Saved to DB
  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!newClientName || !newClientPan) {
      alert('Please enter Client Name and PAN');
      return;
    }
    try {
      const res = await api.post('/wealth/clients', {
        clientName: newClientName,
        pan: newClientPan,
        kyc: newClientKyc,
        riskProfile: newClientRisk,
        aum: Number(newClientAum) || 0,
        sipAmount: Number(newClientSip) || 0,
        phone: newClientPhone,
        email: newClientEmail
      });

      const added = res.data && res.data.client ? res.data.client : {
        id: `cl-${Date.now()}`,
        clientName: newClientName,
        pan: newClientPan,
        kyc: newClientKyc,
        riskProfile: newClientRisk,
        aum: Number(newClientAum) || 0,
        sipAmount: Number(newClientSip) || 0,
        phone: newClientPhone,
        email: newClientEmail
      };

      setClientsRoster([added, ...clientsRoster]);
      setShowAddClientModal(false);
      setNewClientName(''); setNewClientPan(''); setNewClientAum(''); setNewClientSip('');
    } catch (err) {
      console.error('Error creating client:', err);
    }
  };

  // ── Delete Client Portfolio from DB & State
  const handleDeleteClient = async (clientObj) => {
    if (!window.confirm(`Are you sure you want to delete portfolio for ${clientObj.clientName || clientObj.name}?`)) return;
    const cId = clientObj._id || clientObj.id;
    try {
      if (cId && !String(cId).startsWith('cl-')) {
        await api.delete(`/wealth/clients/${cId}`);
      }
      setClientsRoster(clientsRoster.filter(c => (c._id !== cId && c.id !== cId)));
    } catch (err) {
      console.error('Error deleting client:', err);
    }
  };

  // ── Add Stock to Watchlist
  const handleAddStock = (e) => {
    e.preventDefault();
    if (!newStockSymbol || !newStockName) {
      alert('Please enter Stock Symbol and Name');
      return;
    }
    const newStockItem = {
      symbol: newStockSymbol.toUpperCase(),
      name: newStockName,
      price: newStockPrice ? Number(newStockPrice).toLocaleString('en-IN') : '1,250.00',
      change: '+15.40',
      pct: '+1.25%',
      pe: 22.5,
      cap: '₹4.5L Cr',
      recommendation: newStockRec
    };
    setStocksWatchlist([newStockItem, ...stocksWatchlist]);
    setShowAddStockModal(false);
    setNewStockSymbol(''); setNewStockName(''); setNewStockPrice('');
  };

  // ── Delete Stock from Watchlist
  const handleDeleteStock = (symbol) => {
    setStocksWatchlist(stocksWatchlist.filter(s => s.symbol !== symbol));
  };

  // ── Report Export Action
  const handleExportReport = (reportTitle) => {
    const reportData = `WEALTH MANAGEMENT REPORT: ${reportTitle.toUpperCase()}\nGenerated On: ${new Date().toLocaleString()}\nAdvisor: Partner Portal\nTotal AUM: ${stats.totalAum}\nActive Clients: ${clientsRoster.length}\n\nClient Summary:\n` +
      clientsRoster.map(c => `- ${c.clientName || c.name} | PAN: ${c.pan} | AUM: ₹${(c.aum || 0).toLocaleString('en-IN')} | SIP: ₹${(c.sipAmount || 0).toLocaleString('en-IN')}/mo`).join('\n');
    
    const blob = new Blob([reportData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportTitle.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{
      background: 'var(--bg)',
      color: 'var(--text)',
      minHeight: '100vh',
      fontFamily: "'Inter', sans-serif",
      paddingBottom: '60px'
    }}>
      {/* ── LIVE MARKET TICKER STRIP ── */}
      <div style={{
        background: '#090d16',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '8px 24px',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#22c55e', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <Activity size={14} /> LIVE MARKET
        </div>
        <div style={{ display: 'flex', gap: '28px', flex: 1 }}>
          {MARKET_TICKER.map((m, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{m.symbol}</span>
              <span style={{ fontWeight: 800 }}>{m.value}</span>
              <span style={{
                color: m.isUp ? '#22c55e' : '#ef4444',
                fontWeight: 700,
                fontSize: '11px',
                background: m.isUp ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                padding: '1px 6px',
                borderRadius: '4px'
              }}>
                {m.change} ({m.pct})
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#22c55e', fontWeight: 700 }}>
          <DatabaseStatusIndicator connected={!loading} /> DATABASE LIVE
        </div>
      </div>

      {/* ── HERO BANNER ── */}
      <div style={{
        padding: '32px 32px 24px',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))',
        borderBottom: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, marginBottom: '10px' }}>
              <Sparkles size={13} /> ENTERPRISE WEALTH PLATFORM (FULLY SYNCHRONIZED)
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, margin: 0, color: '#fff', letterSpacing: '-0.5px' }}>
              Partner Investment Store & CRM
            </h1>
            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
              Complete wealth management suite for Mutual Funds, Stocks, Insurance, Fixed Deposits & Client Portfolios
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setActiveTab('proposal_builder')}
              style={{
                background: '#22c55e', color: '#000', border: 'none',
                padding: '12px 20px', borderRadius: '12px', fontWeight: 800, fontSize: '13px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 4px 14px rgba(34, 197, 94, 0.35)'
              }}
            >
              <FileText size={16} /> Create Proposal
            </button>
            <button
              onClick={() => setActiveTab('calculators')}
              style={{
                background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid var(--border)',
                padding: '12px 20px', borderRadius: '12px', fontWeight: 700, fontSize: '13px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              <Calculator size={16} /> SIP Calculator
            </button>
          </div>
        </div>

        {/* Executive KPI Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            { label: 'Total AUM', val: stats.totalAum, sub: '↑ Live MongoDB', icon: DollarSign, color: '#22c55e' },
            { label: 'Active Clients', val: stats.totalClients, sub: 'Roster Active', icon: Users, color: '#3b82f6' },
            { label: 'Monthly SIP', val: stats.monthlySip, sub: 'Live Commitments', icon: RefreshCw, color: '#a855f7' },
            { label: 'Fixed Deposits', val: stats.fdValue, sub: 'Avg 8.9% Return', icon: Landmark, color: '#f59e0b' },
            { label: 'Insurance Premium', val: stats.insurancePremium, sub: '98% Renewal Rate', icon: Shield, color: '#ec4899' }
          ].map((kpi, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{kpi.label}</span>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${kpi.color}15`, color: kpi.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <kpi.icon size={15} />
                </div>
              </div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: '4px' }}>{kpi.val}</div>
              <div style={{ fontSize: '11px', color: kpi.color, fontWeight: 700 }}>{kpi.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── NAVIGATION TABS BAR ── */}
      <div style={{
        padding: '0 32px',
        borderBottom: '1px solid var(--border)',
        background: '#0b1120',
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        sticky: 'top',
        zIndex: 10
      }}>
        {[
          { id: 'dashboard', label: 'Overview Dashboard', icon: BarChart3 },
          { id: 'mutual_funds', label: 'Mutual Funds Store', icon: TrendingUp },
          { id: 'stocks', label: 'Stocks & Watchlist', icon: Activity },
          { id: 'insurance', label: 'Insurance Hub', icon: Shield },
          { id: 'fd_demat', label: 'Fixed Deposits & Demat', icon: Landmark },
          { id: 'calculators', label: 'Calculators & Goals', icon: Calculator },
          { id: 'clients', label: 'Client CRM (360°)', icon: Users },
          { id: 'proposal_builder', label: 'Proposal Builder', icon: FileText },
          { id: 'reports', label: 'Reports & Analytics', icon: FileSpreadsheet }
        ].map((t) => {
          const isActive = activeTab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 18px',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '3px solid #22c55e' : '3px solid transparent',
                color: isActive ? '#22c55e' : 'var(--text-muted)',
                fontSize: '13px',
                fontWeight: isActive ? 800 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div style={{ padding: '32px' }}>

        {/* TAB 1: OVERVIEW DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* Top Row: AUM Growth & Asset Allocation */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
              
              {/* AUM Growth Chart */}
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#fff' }}>AUM & Monthly SIP Trajectory</h3>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Historical portfolio growth in ₹ Crores</p>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', padding: '4px 10px', borderRadius: '6px' }}>
                    +51.9% YTD
                  </span>
                </div>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={AUM_GRAPH_DATA}>
                      <defs>
                        <linearGradient id="aumGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} />
                      <YAxis stroke="var(--text-muted)" fontSize={11} />
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid var(--border)', borderRadius: '10px' }} />
                      <Area type="monotone" dataKey="aum" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#aumGrad)" name="AUM (₹ Cr)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Asset Allocation Pie */}
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#fff' }}>Overall Asset Allocation</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Distribution across client portfolios</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: 180, height: 180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie data={ASSET_ALLOC_DATA} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                          {ASSET_ALLOC_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {ASSET_ALLOC_DATA.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                          <span style={{ color: 'var(--text)', fontWeight: 600 }}>{item.name}</span>
                        </div>
                        <span style={{ fontWeight: 800, color: '#fff' }}>{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Second Row: Upcoming SIP Due & Notifications */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
              
              {/* Upcoming SIP Due */}
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#fff' }}>Upcoming SIP Dues (Next 7 Days)</h3>
                  <Clock size={16} color="var(--text-muted)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { client: 'Rajesh Kumar Verma', fund: 'Quant Small Cap Fund', amount: '₹15,000', date: '05 Aug 2026', status: 'Auto-Debit Ready' },
                    { client: 'Dr. Ananya Roy', fund: 'Parag Parikh Flexi Cap', amount: '₹25,000', date: '07 Aug 2026', status: 'Auto-Debit Ready' },
                    { client: 'Sunita Mehra', fund: 'HDFC Mid-Cap Fund', amount: '₹10,000', date: '08 Aug 2026', status: 'Mandate Approval' }
                  ].map((sip, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{sip.client}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sip.fund} • {sip.date}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#22c55e' }}>{sip.amount}</div>
                        <span style={{ fontSize: '10px', color: '#3b82f6', fontWeight: 700 }}>{sip.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Notifications */}
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#fff' }}>Advisor Action Alerts</h3>
                  <Zap size={16} color="#f59e0b" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { title: 'Proposal Accepted by Dr. Ananya Roy', time: '10 mins ago', type: 'success', desc: 'Wealth Creation Basket worth ₹75,000/mo SIP' },
                    { title: 'KYC Pending Verification', time: '2 hours ago', type: 'warning', desc: 'Vikramaditya Singhania uploaded Aadhaar & PAN' },
                    { title: 'Health Insurance Renewal Due', time: '1 day ago', type: 'info', desc: 'Rajesh Verma Star Health policy expires in 12 days' }
                  ].map((notif, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        background: notif.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : notif.type === 'warning' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                        color: notif.type === 'success' ? '#22c55e' : notif.type === 'warning' ? '#f59e0b' : '#3b82f6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <CheckCircle2 size={16} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                          <span>{notif.title}</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{notif.time}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{notif.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: MUTUAL FUNDS STORE */}
        {activeTab === 'mutual_funds' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Search & Filter Bar */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '10px 16px', flex: 1, minWidth: '300px' }}>
                <Search size={18} color="var(--text-muted)" />
                <input
                  placeholder="Search funds by name, AMC (HDFC, Quant, ICICI), category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', outline: 'none', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
                {['All', 'Small Cap', 'Mid Cap', 'Large Cap', 'Flexi Cap', 'Hybrid'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
                      border: selectedCategory === cat ? '1px solid #22c55e' : '1px solid var(--border)',
                      background: selectedCategory === cat ? 'rgba(34, 197, 94, 0.15)' : 'var(--card)',
                      color: selectedCategory === cat ? '#22c55e' : 'var(--text)',
                      cursor: 'pointer', whiteSpace: 'nowrap'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Curated Baskets Strip */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#fff' }}>Curated Investment Baskets</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Expertly crafted fund bundles for specific investor goals</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {CURATED_BASKETS.map((b) => {
                  const BIcon = b.icon;
                  return (
                    <div key={b.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(34, 197, 94, 0.12)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <BIcon size={20} />
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 800, color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '2px 8px', borderRadius: '12px' }}>
                          {b.tag}
                        </span>
                      </div>
                      <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 800, color: '#fff' }}>{b.name}</h4>
                      <p style={{ margin: '0 0 16px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4, height: '34px', overflow: 'hidden' }}>{b.desc}</p>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border)', fontSize: '12px' }}>
                        <div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Historical CAGR</div>
                          <div style={{ fontWeight: 800, color: '#22c55e', fontSize: '14px' }}>{b.cagr}</div>
                        </div>
                        <button
                          onClick={() => {
                            setPropProduct('Curated Basket');
                            setPropScheme(b.name);
                            setActiveTab('proposal_builder');
                          }}
                          style={{ background: '#22c55e', color: '#000', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 800, fontSize: '11px', cursor: 'pointer' }}
                        >
                          Select Basket
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Performing Funds Table */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#fff' }}>Top Performing Mutual Funds Catalog</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Showing {filteredFunds.length} Verified Schemes</span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#090d16', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '14px 20px' }}>Scheme & AMC</th>
                      <th style={{ padding: '14px 20px' }}>Category</th>
                      <th style={{ padding: '14px 20px' }}>NAV</th>
                      <th style={{ padding: '14px 20px' }}>1Y Return</th>
                      <th style={{ padding: '14px 20px' }}>3Y CAGR</th>
                      <th style={{ padding: '14px 20px' }}>5Y CAGR</th>
                      <th style={{ padding: '14px 20px' }}>AUM</th>
                      <th style={{ padding: '14px 20px' }}>Rating</th>
                      <th style={{ padding: '14px 20px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFunds.map((mf) => (
                      <tr key={mf.id || mf._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 800, color: '#fff', marginBottom: '2px' }}>{mf.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{mf.fundHouse}</div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                            {mf.category}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', fontWeight: 700, color: '#fff' }}>₹{mf.nav}</td>
                        <td style={{ padding: '16px 20px', fontWeight: 800, color: '#22c55e' }}>+{mf.returns1y}%</td>
                        <td style={{ padding: '16px 20px', fontWeight: 800, color: '#22c55e' }}>+{mf.returns3y}%</td>
                        <td style={{ padding: '16px 20px', fontWeight: 800, color: '#22c55e' }}>+{mf.returns5y}%</td>
                        <td style={{ padding: '16px 20px', color: 'var(--text)' }}>{mf.aum}</td>
                        <td style={{ padding: '16px 20px', color: '#f59e0b', fontWeight: 800 }}>
                          {'★'.repeat(mf.rating || 5)}
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <button
                            onClick={() => setSelectedFundModal(mf)}
                            style={{
                              background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.2)',
                              padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer'
                            }}
                          >
                            View Factsheet
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: STOCKS & WATCHLIST */}
        {activeTab === 'stocks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#fff' }}>Institutional Stock Watchlist</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Real-time prices, financial metrics & analyst consensus</p>
              </div>
              <button
                onClick={() => setShowAddStockModal(true)}
                style={{ background: '#22c55e', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
              >
                + Add Stock
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {stocksWatchlist.map((stk, i) => (
                <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '18px', padding: '20px', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 900, color: '#fff' }}>{stk.symbol}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{stk.name}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        background: stk.recommendation.includes('Buy') ? 'rgba(34, 197, 94, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                        color: stk.recommendation.includes('Buy') ? '#22c55e' : '#f59e0b',
                        padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800
                      }}>
                        {stk.recommendation}
                      </span>
                      <button
                        onClick={() => handleDeleteStock(stk.symbol)}
                        title="Remove Stock"
                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', padding: '4px', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>₹{stk.price}</span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: stk.change.startsWith('+') ? '#22c55e' : '#ef4444' }}>
                      {stk.change} ({stk.pct})
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border)', fontSize: '12px' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>P/E Ratio: </span>
                      <span style={{ fontWeight: 700, color: '#fff' }}>{stk.pe}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Market Cap: </span>
                      <span style={{ fontWeight: 700, color: '#fff' }}>{stk.cap}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: INSURANCE HUB */}
        {activeTab === 'insurance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#fff' }}>Insurance Quotation & Policy Engine</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Generate instant quotes across Health, Life, Motor & Term insurance</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {INSURANCE_PRODUCTS.map((ins) => (
                <div key={ins.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '18px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                      {ins.category} Insurance
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#f59e0b' }}>{ins.rating}</span>
                  </div>

                  <h4 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 800, color: '#fff' }}>{ins.title}</h4>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>Provider: {ins.provider}</div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '14px', marginBottom: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sum Insured</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>{ins.sumInsured}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Premium Starting</span>
                      <span style={{ fontSize: '14px', fontWeight: 900, color: '#22c55e' }}>₹{Number(ins.premium).toLocaleString('en-IN')}/yr</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                    {ins.features.map((feat, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text)' }}>
                        <CheckCircle2 size={14} color="#22c55e" /> {feat}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setPropProduct(`${ins.category} Insurance`);
                      setPropScheme(ins.title);
                      setPropType('Lumpsum');
                      setPropAmount(ins.premium);
                      setActiveTab('proposal_builder');
                    }}
                    style={{ width: '100%', background: '#22c55e', color: '#000', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
                  >
                    Generate Proposal Quote
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: FIXED DEPOSITS & DEMAT */}
        {activeTab === 'fd_demat' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#fff' }}>Fixed Deposits & Corporate Debentures</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>High yield AAA-rated corporate FDs for risk-averse wealth growth</p>
              </div>
            </div>

            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#090d16', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '14px 20px' }}>Institution</th>
                    <th style={{ padding: '14px 20px' }}>Interest Rate</th>
                    <th style={{ padding: '14px 20px' }}>Max Tenure</th>
                    <th style={{ padding: '14px 20px' }}>Min Deposit</th>
                    <th style={{ padding: '14px 20px' }}>Safety Rating</th>
                    <th style={{ padding: '14px 20px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {FIXED_DEPOSITS_DATA.map((fd, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 20px', fontWeight: 800, color: '#fff' }}>{fd.bank}</td>
                      <td style={{ padding: '16px 20px', fontWeight: 900, color: '#22c55e', fontSize: '15px' }}>{fd.rate}</td>
                      <td style={{ padding: '16px 20px', color: 'var(--text)' }}>{fd.maxTenure}</td>
                      <td style={{ padding: '16px 20px', color: 'var(--text)' }}>₹{Number(fd.minAmt).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                          {fd.rating}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <button
                          onClick={() => {
                            setPropProduct('Corporate FD');
                            setPropScheme(`${fd.bank} (${fd.rate})`);
                            setPropType('Lumpsum');
                            setPropAmount(fd.minAmt);
                            setActiveTab('proposal_builder');
                          }}
                          style={{ background: '#22c55e', color: '#000', border: 'none', padding: '6px 14px', borderRadius: '8px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
                        >
                          Apply FD
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: CALCULATORS & GOAL PLANNING */}
        {activeTab === 'calculators' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '28px' }}>
            
            {/* SIP Calculator */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#fff' }}>Systematic Investment (SIP) Calculator</h3>
                <Calculator size={20} color="#22c55e" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                    <span>Monthly SIP Amount</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#090d16', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '6px' }}>
                      <span style={{ color: '#22c55e', fontWeight: 800 }}>₹</span>
                      <input
                        type="number" value={sipAmount} onChange={(e) => setSipAmount(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: '#22c55e', fontWeight: 900, width: '90px', outline: 'none', textAlign: 'right' }}
                      />
                    </div>
                  </div>
                  <input
                    type="range" min="1000" max="100000" step="1000"
                    value={sipAmount} onChange={(e) => setSipAmount(e.target.value)}
                    style={{ width: '100%', accentColor: '#22c55e' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                    <span>Expected Return (p.a.)</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#090d16', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '6px' }}>
                      <input
                        type="number" step="0.5" value={sipRate} onChange={(e) => setSipRate(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: '#22c55e', fontWeight: 900, width: '50px', outline: 'none', textAlign: 'right' }}
                      />
                      <span style={{ color: '#22c55e', fontWeight: 800 }}>%</span>
                    </div>
                  </div>
                  <input
                    type="range" min="5" max="30" step="0.5"
                    value={sipRate} onChange={(e) => setSipRate(e.target.value)}
                    style={{ width: '100%', accentColor: '#22c55e' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                    <span>Time Horizon</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#090d16', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '6px' }}>
                      <input
                        type="number" value={sipYears} onChange={(e) => setSipYears(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: '#22c55e', fontWeight: 900, width: '45px', outline: 'none', textAlign: 'right' }}
                      />
                      <span style={{ color: '#22c55e', fontWeight: 800 }}>Yrs</span>
                    </div>
                  </div>
                  <input
                    type="range" min="1" max="35" step="1"
                    value={sipYears} onChange={(e) => setSipYears(e.target.value)}
                    style={{ width: '100%', accentColor: '#22c55e' }}
                  />
                </div>
              </div>

              {/* SIP Output Box */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Invested Amount</span>
                  <span style={{ fontWeight: 800, color: '#fff' }}>₹{sipResult.invested.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Est. Wealth Returns</span>
                  <span style={{ fontWeight: 800, color: '#22c55e' }}>+₹{sipResult.profit.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border)', fontSize: '15px' }}>
                  <span style={{ fontWeight: 700, color: '#fff' }}>Total Expected Corpus</span>
                  <span style={{ fontWeight: 900, color: '#22c55e', fontSize: '18px' }}>₹{sipResult.total.toLocaleString('en-IN')}</span>
                </div>

                <button
                  onClick={() => {
                    setPropAmount(String(sipAmount));
                    setPropType('SIP');
                    setActiveTab('proposal_builder');
                  }}
                  style={{ width: '100%', marginTop: '16px', background: '#22c55e', color: '#000', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
                >
                  Create Proposal with this SIP
                </button>
              </div>
            </div>

            {/* Goal Planner */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#fff' }}>Target Goal Planning Engine</h3>
                <Award size={20} color="#3b82f6" />
              </div>

              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '24px' }}>
                {['Retirement', 'Child Education', 'Marriage', 'House Purchase'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGoal(g)}
                    style={{
                      padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
                      border: selectedGoal === g ? '1px solid #3b82f6' : '1px solid var(--border)',
                      background: selectedGoal === g ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.02)',
                      color: selectedGoal === g ? '#3b82f6' : 'var(--text-muted)', cursor: 'pointer'
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                    <span>Target Corpus Required</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#090d16', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '6px' }}>
                      <span style={{ color: '#3b82f6', fontWeight: 800 }}>₹</span>
                      <input
                        type="number" value={targetCorpus} onChange={(e) => setTargetCorpus(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontWeight: 900, width: '110px', outline: 'none', textAlign: 'right' }}
                      />
                    </div>
                  </div>
                  <input
                    type="range" min="1000000" max="100000000" step="1000000"
                    value={targetCorpus} onChange={(e) => setTargetCorpus(e.target.value)}
                    style={{ width: '100%', accentColor: '#3b82f6' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                    <span>Years to Reach Goal</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#090d16', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '6px' }}>
                      <input
                        type="number" value={goalYears} onChange={(e) => setGoalYears(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontWeight: 900, width: '45px', outline: 'none', textAlign: 'right' }}
                      />
                      <span style={{ color: '#3b82f6', fontWeight: 800 }}>Yrs</span>
                    </div>
                  </div>
                  <input
                    type="range" min="3" max="30" step="1"
                    value={goalYears} onChange={(e) => setGoalYears(e.target.value)}
                    style={{ width: '100%', accentColor: '#3b82f6' }}
                  />
                </div>
              </div>

              <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Required Monthly SIP (@ 12% p.a.)</div>
                <div style={{ fontSize: '26px', fontWeight: 900, color: '#3b82f6' }}>₹{goalSipResult.toLocaleString('en-IN')}/mo</div>
                <button
                  onClick={() => {
                    setPropAmount(String(goalSipResult));
                    setPropScheme(`${selectedGoal} Goal Plan`);
                    setActiveTab('proposal_builder');
                  }}
                  style={{ marginTop: '14px', background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
                >
                  Create Goal Proposal
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 7: CLIENT CRM (360°) */}
        {activeTab === 'clients' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#fff' }}>Client Wealth Management Roster (360°)</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Complete KYC, PAN, risk profiles & total family portfolio views (Database Live)</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 14px' }}>
                  <Search size={16} color="var(--text-muted)" />
                  <input
                    placeholder="Search clients..."
                    value={clientSearchQuery}
                    onChange={(e) => setClientSearchQuery(e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '13px', width: '160px' }}
                  />
                </div>
                <button
                  onClick={() => setShowAddClientModal(true)}
                  style={{ background: '#22c55e', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
                >
                  + Add New Client
                </button>
              </div>
            </div>

            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#090d16', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '14px 20px' }}>Client Name</th>
                    <th style={{ padding: '14px 20px' }}>PAN & KYC</th>
                    <th style={{ padding: '14px 20px' }}>Risk Profile</th>
                    <th style={{ padding: '14px 20px' }}>Current AUM</th>
                    <th style={{ padding: '14px 20px' }}>Active SIP</th>
                    <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((c) => (
                    <tr key={c.id || c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 800, color: '#fff' }}>{c.clientName || c.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.email}</div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{c.pan}</div>
                        <span style={{ fontSize: '10px', color: c.kyc === 'Verified' ? '#22c55e' : '#f59e0b', fontWeight: 800 }}>{c.kyc}</span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ background: c.riskProfile === 'Aggressive' ? 'rgba(239,68,68,0.1)' : 'rgba(59, 130, 246, 0.1)', color: c.riskProfile === 'Aggressive' ? '#ef4444' : '#3b82f6', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                          {c.riskProfile}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: 900, color: '#22c55e' }}>₹{(c.aum || 0).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '16px 20px', fontWeight: 700, color: '#fff' }}>₹{(c.sipAmount || 0).toLocaleString('en-IN')}/mo</td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setSelectedClientModal(c)}
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            360° View
                          </button>
                          <button
                            onClick={() => handleDeleteClient(c)}
                            title="Delete Client Portfolio"
                            style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', padding: '6px 10px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 8: PROPOSAL BUILDER (Advisor Workflow) */}
        {activeTab === 'proposal_builder' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#fff' }}>Institutional Proposal Builder</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Craft, preview and share client proposals saved to MongoDB database</p>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', padding: '4px 10px', borderRadius: '6px' }}>
                  Step {propStep} of 7
                </span>
              </div>

              {/* Stepper Progress Bar */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '32px' }}>
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <div
                    key={num}
                    style={{
                      flex: 1, height: '4px', borderRadius: '2px',
                      background: propStep >= num ? '#22c55e' : 'rgba(255,255,255,0.1)'
                    }}
                  />
                ))}
              </div>

              {/* Form Content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {propStep === 1 && (
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Select Client</label>
                    <select
                      value={propClient} onChange={(e) => setPropClient(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', background: '#090d16', border: '1px solid var(--border)', borderRadius: '12px', color: '#fff', fontSize: '14px' }}
                    >
                      <option value="">-- Choose Client --</option>
                      {clientsRoster.map(c => <option key={c.id || c._id} value={c.clientName || c.name}>{c.clientName || c.name} ({c.pan})</option>)}
                    </select>
                  </div>
                )}

                {propStep === 2 && (
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Select Asset Product Class</label>
                    <select
                      value={propProduct} onChange={(e) => setPropProduct(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', background: '#090d16', border: '1px solid var(--border)', borderRadius: '12px', color: '#fff', fontSize: '14px' }}
                    >
                      <option value="Mutual Funds">Mutual Funds Basket</option>
                      <option value="Health Insurance">Health Insurance Policy</option>
                      <option value="Fixed Deposit">Corporate Fixed Deposit</option>
                      <option value="Stocks Portfolio">Direct Equity Portfolio</option>
                    </select>
                  </div>
                )}

                {propStep === 3 && (
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Select Scheme / Fund</label>
                    <select
                      value={propScheme} onChange={(e) => setPropScheme(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', background: '#090d16', border: '1px solid var(--border)', borderRadius: '12px', color: '#fff', fontSize: '14px' }}
                    >
                      {mutualFunds.map(m => <option key={m.id || m._id} value={m.name}>{m.name}</option>)}
                    </select>
                  </div>
                )}

                {propStep === 4 && (
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Investment Type</label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {['SIP', 'One Time / Lumpsum'].map(type => (
                        <button
                          key={type}
                          onClick={() => setPropType(type.includes('SIP') ? 'SIP' : 'Lumpsum')}
                          style={{
                            flex: 1, padding: '12px', borderRadius: '12px', fontSize: '13px', fontWeight: 800,
                            border: (propType === 'SIP' && type.includes('SIP')) || (propType === 'Lumpsum' && !type.includes('SIP')) ? '1px solid #22c55e' : '1px solid var(--border)',
                            background: (propType === 'SIP' && type.includes('SIP')) || (propType === 'Lumpsum' && !type.includes('SIP')) ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                            color: '#fff', cursor: 'pointer'
                          }}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {propStep === 5 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Investment Amount (₹)</label>
                      <input
                        type="number" value={propAmount} onChange={(e) => setPropAmount(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', background: '#090d16', border: '1px solid var(--border)', borderRadius: '12px', color: '#fff', fontSize: '14px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Tenure Horizon</label>
                      <input
                        type="text" value={propTenure} onChange={(e) => setPropTenure(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', background: '#090d16', border: '1px solid var(--border)', borderRadius: '12px', color: '#fff', fontSize: '14px' }}
                      />
                    </div>
                  </div>
                )}

                {propStep === 6 && (
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
                    <h4 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 800, color: '#fff' }}>Proposal Summary Preview</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Client:</span>
                        <span style={{ fontWeight: 800, color: '#fff' }}>{propClient || 'Not Selected'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Asset Product:</span>
                        <span style={{ fontWeight: 800, color: '#fff' }}>{propProduct}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Selected Scheme:</span>
                        <span style={{ fontWeight: 800, color: '#fff' }}>{propScheme}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Type & Amount:</span>
                        <span style={{ fontWeight: 900, color: '#22c55e' }}>₹{Number(propAmount).toLocaleString('en-IN')} ({propType})</span>
                      </div>
                    </div>
                  </div>
                )}

                {propStep === 7 && (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <CheckCircle2 size={32} />
                    </div>
                    <h4 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 900, color: '#fff' }}>Proposal Saved to Database!</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Proposal record persists in MongoDB and is visible under Track Shared Proposals</p>
                  </div>
                )}

                {/* Stepper Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                  {propStep > 1 && propStep < 7 && (
                    <button
                      onClick={() => setPropStep(propStep - 1)}
                      style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid var(--border)', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                    >
                      Previous
                    </button>
                  )}
                  {propStep < 6 && (
                    <button
                      onClick={() => setPropStep(propStep + 1)}
                      style={{ marginLeft: 'auto', background: '#22c55e', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
                    >
                      Next Step
                    </button>
                  )}
                  {propStep === 6 && (
                    <button
                      onClick={handleAddProposal}
                      style={{ marginLeft: 'auto', background: '#22c55e', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
                    >
                      Confirm & Save to DB
                    </button>
                  )}
                  {propStep === 7 && (
                    <button
                      onClick={() => setPropStep(1)}
                      style={{ margin: '0 auto', background: '#22c55e', color: '#000', border: 'none', padding: '10px 24px', borderRadius: '10px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
                    >
                      Create Another Proposal
                    </button>
                  )}
                </div>

              </div>
            </div>

            {/* Generated Proposals Table */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 800, color: '#fff' }}>Track Shared Proposals (MongoDB Live)</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#090d16', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 16px' }}>Proposal ID</th>
                      <th style={{ padding: '12px 16px' }}>Client</th>
                      <th style={{ padding: '12px 16px' }}>Product</th>
                      <th style={{ padding: '12px 16px' }}>Amount</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposals.map((p) => (
                      <tr key={p.proposalId || p._id || p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 800, color: '#3b82f6' }}>{p.proposalId || p.id}</td>
                        <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 700 }}>{p.clientName || p.client}</td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{p.product}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 800, color: '#22c55e' }}>{p.amount}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <select
                            value={p.status || 'Shared'}
                            onChange={(e) => handleUpdateProposalStatus(p, e.target.value)}
                            style={{
                              background: p.status === 'Accepted' ? 'rgba(34, 197, 94, 0.15)' : p.status === 'Viewed' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                              color: p.status === 'Accepted' ? '#22c55e' : p.status === 'Viewed' ? '#3b82f6' : '#f59e0b',
                              border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, cursor: 'pointer'
                            }}
                          >
                            <option value="Shared">Shared</option>
                            <option value="Viewed">Viewed</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Declined">Declined</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: REPORTS & ANALYTICS */}
        {activeTab === 'reports' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#fff' }}>Wealth Reports & Export Center</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Export instant PDF & Excel statements for clients and compliance</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {[
                { title: 'Portfolio Statement Report', desc: 'Consolidated holding view across MF, Stocks, FDs & Insurance.', format: 'PDF / Excel' },
                { title: 'Capital Gains Tax Statement', desc: 'STCG & LTCG tax liability calculations for FY 2025-26.', format: 'PDF' },
                { title: 'SIP Performance Report', desc: 'XIRR performance summary of active systematic investments.', format: 'Excel' },
                { title: 'Advisor Commission Statement', desc: 'Partner monthly revenue brokerage payout breakdown.', format: 'PDF / CSV' }
              ].map((rep, i) => (
                <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '18px', padding: '20px' }}>
                  <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 800, color: '#fff' }}>{rep.title}</h4>
                  <p style={{ margin: '0 0 16px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{rep.desc}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{rep.format}</span>
                    <button
                      onClick={() => handleExportReport(rep.title)}
                      style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Download size={14} /> Export Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── FACTSHEET MODAL DIALOG ── */}
      <AnimatePresence>
        {selectedFundModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: '#0b1120', border: '1px solid var(--border)', borderRadius: '24px', width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto', padding: '32px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <span style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                    {selectedFundModal.category}
                  </span>
                  <h2 style={{ margin: '8px 0 2px', fontSize: '20px', fontWeight: 900, color: '#fff' }}>{selectedFundModal.name}</h2>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{selectedFundModal.fundHouse} • Manager: {selectedFundModal.fundManager || 'Chief Investment Officer'}</div>
                </div>
                <button onClick={() => setSelectedFundModal(null)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border)', marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Fund Investment Objective</div>
                <div style={{ fontSize: '13px', color: '#fff', lineHeight: 1.5 }}>{selectedFundModal.objective || 'Long-term capital appreciation through disciplined portfolio management across high growth sectors.'}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>NAV</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>₹{selectedFundModal.nav}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>3Y CAGR</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#22c55e' }}>+{selectedFundModal.returns3y}%</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>AUM</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>{selectedFundModal.aum}</div>
                </div>
              </div>

              {selectedFundModal.topHoldings && selectedFundModal.topHoldings.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 800, color: '#fff' }}>Top Stock Holdings</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedFundModal.topHoldings.map((h, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                        <span style={{ color: '#fff', fontWeight: 600 }}>{h.name}</span>
                        <span style={{ fontWeight: 800, color: '#22c55e' }}>{h.pct}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    setPropScheme(selectedFundModal.name);
                    setSelectedFundModal(null);
                    setActiveTab('proposal_builder');
                  }}
                  style={{ flex: 1, background: '#22c55e', color: '#000', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
                >
                  Create Client Proposal with this Fund
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CLIENT 360° PROFILE MODAL ── */}
      <AnimatePresence>
        {selectedClientModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: '#0b1120', border: '1px solid var(--border)', borderRadius: '24px', width: '100%', maxWidth: '640px', padding: '32px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#fff' }}>{selectedClientModal.clientName || selectedClientModal.name}</h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>PAN: {selectedClientModal.pan} • Status: {selectedClientModal.kyc}</div>
                </div>
                <button onClick={() => setSelectedClientModal(null)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Wealth AUM</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#22c55e' }}>₹{(selectedClientModal.aum || 0).toLocaleString('en-IN')}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Monthly SIP Commitments</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>₹{(selectedClientModal.sipAmount || 0).toLocaleString('en-IN')}/mo</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Risk Appetite:</span>
                  <span style={{ fontWeight: 800, color: '#3b82f6' }}>{selectedClientModal.riskProfile}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Mobile Number:</span>
                  <span style={{ fontWeight: 700, color: '#fff' }}>{selectedClientModal.phone}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Email Address:</span>
                  <span style={{ fontWeight: 700, color: '#fff' }}>{selectedClientModal.email}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setPropClient(selectedClientModal.clientName || selectedClientModal.name);
                  setSelectedClientModal(null);
                  setActiveTab('proposal_builder');
                }}
                style={{ width: '100%', background: '#22c55e', color: '#000', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
              >
                + Create New Proposal for {(selectedClientModal.clientName || selectedClientModal.name).split(' ')[0]}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── ADD STOCK MODAL ── */}
      <AnimatePresence>
        {showAddStockModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: '#0b1120', border: '1px solid var(--border)', borderRadius: '24px', width: '100%', maxWidth: '480px', padding: '32px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#fff' }}>Add Stock to Watchlist</h3>
                <button onClick={() => setShowAddStockModal(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddStock} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Stock Symbol (NSE/BSE)</label>
                  <input
                    placeholder="e.g. INFY, TCS, RELIANCE"
                    value={newStockSymbol} onChange={(e) => setNewStockSymbol(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', background: '#090d16', border: '1px solid var(--border)', borderRadius: '10px', color: '#fff', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Company Name</label>
                  <input
                    placeholder="e.g. Infosys Ltd"
                    value={newStockName} onChange={(e) => setNewStockName(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', background: '#090d16', border: '1px solid var(--border)', borderRadius: '10px', color: '#fff', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Current Price (₹)</label>
                  <input
                    placeholder="e.g. 1824"
                    value={newStockPrice} onChange={(e) => setNewStockPrice(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', background: '#090d16', border: '1px solid var(--border)', borderRadius: '10px', color: '#fff', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Analyst Consensus</label>
                  <select
                    value={newStockRec} onChange={(e) => setNewStockRec(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', background: '#090d16', border: '1px solid var(--border)', borderRadius: '10px', color: '#fff', fontSize: '14px' }}
                  >
                    <option value="Strong Buy">Strong Buy</option>
                    <option value="Buy">Buy</option>
                    <option value="Hold">Hold</option>
                  </select>
                </div>

                <button type="submit" style={{ width: '100%', background: '#22c55e', color: '#000', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', marginTop: '8px' }}>
                  + Add Stock to Watchlist
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── ADD CLIENT MODAL ── */}
      <AnimatePresence>
        {showAddClientModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: '#0b1120', border: '1px solid var(--border)', borderRadius: '24px', width: '100%', maxWidth: '540px', padding: '32px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#fff' }}>Add New Client Portfolio to DB</h3>
                <button onClick={() => setShowAddClientModal(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddClient} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Full Name *</label>
                    <input
                      placeholder="e.g. Ramesh Shah" required
                      value={newClientName} onChange={(e) => setNewClientName(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', background: '#090d16', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>PAN Number *</label>
                    <input
                      placeholder="e.g. ABCDE1234F" required
                      value={newClientPan} onChange={(e) => setNewClientPan(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', background: '#090d16', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>KYC Status</label>
                    <select
                      value={newClientKyc} onChange={(e) => setNewClientKyc(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', background: '#090d16', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                    >
                      <option value="Verified">Verified</option>
                      <option value="Pending Verification">Pending Verification</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Risk Profile</label>
                    <select
                      value={newClientRisk} onChange={(e) => setNewClientRisk(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', background: '#090d16', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                    >
                      <option value="Aggressive">Aggressive</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Conservative">Conservative</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Initial AUM (₹)</label>
                    <input
                      placeholder="e.g. 2500000" type="number"
                      value={newClientAum} onChange={(e) => setNewClientAum(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', background: '#090d16', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Monthly SIP (₹)</label>
                    <input
                      placeholder="e.g. 15000" type="number"
                      value={newClientSip} onChange={(e) => setNewClientSip(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', background: '#090d16', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Mobile Phone</label>
                    <input
                      placeholder="+91 98765 43210"
                      value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', background: '#090d16', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Email Address</label>
                    <input
                      placeholder="client@gmail.com" type="email"
                      value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', background: '#090d16', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <button type="submit" style={{ width: '100%', background: '#22c55e', color: '#000', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', marginTop: '10px' }}>
                  Save Client Portfolio to DB
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DatabaseStatusIndicator({ connected }) {
  return (
    <div style={{
      width: 8, height: 8, borderRadius: '50%',
      background: connected ? '#22c55e' : '#f59e0b',
      boxShadow: connected ? '0 0 8px #22c55e' : 'none'
    }} />
  );
}
