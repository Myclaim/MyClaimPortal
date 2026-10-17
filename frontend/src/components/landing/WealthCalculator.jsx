import { useState, useMemo } from 'react';

const COMPANIES = [
  { name: 'Reliance Industries', baseCmp: 2950, avgDivPerYear: 9.5, bonusFactor: 2.5 },
  { name: 'Tata Steel / Tata Motors', baseCmp: 1100, avgDivPerYear: 18, bonusFactor: 3.0 },
  { name: 'ITC Limited', baseCmp: 440, avgDivPerYear: 15, bonusFactor: 2.0 },
  { name: 'HDFC Bank', baseCmp: 1720, avgDivPerYear: 19, bonusFactor: 2.2 },
  { name: 'Infosys Limited', baseCmp: 1650, avgDivPerYear: 34, bonusFactor: 4.0 },
  { name: 'State Bank of India', baseCmp: 790, avgDivPerYear: 13, bonusFactor: 1.8 },
];

export default function WealthCalculator() {
  const [selectedCompany, setSelectedCompany] = useState(COMPANIES[0]);
  const [originalShares, setOriginalShares] = useState(100);
  const [dormantYears, setDormantYears] = useState(15);

  const calculation = useMemo(() => {
    const yearsFactor = Math.max(1, dormantYears / 10);
    const bonusMultiplier = (1 + (selectedCompany.bonusFactor - 1) * (yearsFactor / 2.5)).toFixed(1);
    const adjustedShares = Math.round(originalShares * bonusMultiplier);
    const currentMarketValue = Math.round(adjustedShares * selectedCompany.baseCmp);
    const accumulatedDividends = Math.round(adjustedShares * selectedCompany.avgDivPerYear * dormantYears);
    const totalWealth = currentMarketValue + accumulatedDividends;

    return {
      adjustedShares,
      currentMarketValue,
      accumulatedDividends,
      totalWealth,
      bonusMultiplier
    };
  }, [selectedCompany, originalShares, dormantYears]);

  const formatINR = (val) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} Lakh`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <section className="py-20 bg-white relative overflow-hidden border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/70 border border-amber-300/60 text-[#C9A227] text-xs font-bold uppercase tracking-wider mb-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Interactive Wealth Estimator
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1C1C1C] tracking-tight">
            How Much Are Your <span className="text-[#2FBF71]">Old Shares</span> Worth Today?
          </h2>
          <p className="mt-4 text-slate-600 text-base sm:text-lg">
            Old physical share certificates compound significantly through corporate stock splits, bonus issues, and uncollected dividends. Estimate your recovery potential below.
          </p>
        </div>

        {/* Calculator Widget Box */}
        <div className="bg-[#F8F9FB] border border-slate-200/90 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Inputs */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Company Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                  1. Select Portfolio Company
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {COMPANIES.map((comp) => (
                    <button
                      key={comp.name}
                      type="button"
                      onClick={() => setSelectedCompany(comp)}
                      className={`px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 text-left border ${
                        selectedCompany.name === comp.name
                          ? 'bg-emerald-50 border-[#2FBF71] text-[#2FBF71] shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <div className="font-semibold truncate">{comp.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 font-normal">₹{comp.baseCmp} / share</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider 1: Original Shares */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    2. Original Physical Shares on Certificate
                  </label>
                  <span className="text-base font-bold text-[#1C1C1C] font-mono bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
                    {originalShares} Shares
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={originalShares}
                  onChange={(e) => setOriginalShares(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2FBF71]"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>10 shares</span>
                  <span>500 shares</span>
                  <span>1,000 shares</span>
                </div>
              </div>

              {/* Slider 2: Dormancy Years */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    3. Approximate Years Unclaimed / Dormant
                  </label>
                  <span className="text-base font-bold text-[#1C1C1C] font-mono bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
                    {dormantYears} Years
                  </span>
                </div>
                <input
                  type="range"
                  min="7"
                  max="30"
                  step="1"
                  value={dormantYears}
                  onChange={(e) => setDormantYears(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#C9A227]"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>7 yrs (Mandatory IEPF)</span>
                  <span>15 yrs</span>
                  <span>30 yrs</span>
                </div>
              </div>

            </div>

            {/* Right Result Card */}
            <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 relative shadow-xl">
              <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Estimated Recovery
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-[#2FBF71] text-xs font-bold">
                  Split Multiplier: {calculation.bonusMultiplier}x
                </span>
              </div>

              {/* Total Recoverable Highlight */}
              <div className="my-6">
                <div className="text-xs text-slate-500 font-medium">Total Recoverable Portfolio</div>
                <div className="text-3xl sm:text-4xl font-serif font-bold text-[#2FBF71] mt-1">
                  {formatINR(calculation.totalWealth)}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Includes current market value + accumulated dividends
                </div>
              </div>

              {/* Breakdown Rows */}
              <div className="space-y-3.5 py-4 border-t border-slate-100 text-sm">
                <div className="flex justify-between items-center text-slate-700">
                  <span className="text-slate-500">Current Adjusted Shares:</span>
                  <span className="font-semibold text-[#1C1C1C] font-mono">{calculation.adjustedShares} units</span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span className="text-slate-500">Current Share Value:</span>
                  <span className="font-semibold text-[#1C1C1C] font-mono">{formatINR(calculation.currentMarketValue)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span className="text-slate-500">Unclaimed Cash Dividends:</span>
                  <span className="font-semibold text-[#C9A227] font-mono">{formatINR(calculation.accumulatedDividends)}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6">
                <a
                  href="#claim-check"
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-full bg-[#2FBF71] hover:bg-[#26aa62] text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  Search & Claim This Value Free
                </a>
              </div>

              <p className="text-[11px] text-slate-400 text-center mt-3">
                *Estimates based on historical corporate actions and average dividends.
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
