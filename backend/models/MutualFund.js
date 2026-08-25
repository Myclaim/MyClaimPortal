const mongoose = require('mongoose');

const mutualFundSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  fundHouse: { type: String, required: true },
  category: { type: String, required: true },
  nav: { type: Number, required: true },
  returns1m: { type: Number, default: 0 },
  returns3m: { type: Number, default: 0 },
  returns6m: { type: Number, default: 0 },
  returns1y: { type: Number, default: 0 },
  returns3y: { type: Number, default: 0 },
  returns5y: { type: Number, default: 0 },
  sinceInception: { type: Number, default: 0 },
  riskometer: { type: String, default: 'High' },
  aum: { type: String, required: true },
  expenseRatio: { type: Number, default: 0.75 },
  rating: { type: Number, default: 5 },
  minSip: { type: Number, default: 500 },
  fundManager: { type: String },
  objective: { type: String },
  topHoldings: [{
    name: String,
    pct: String
  }],
  sectorAlloc: [{
    sector: String,
    pct: Number
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('MutualFund', mutualFundSchema);
