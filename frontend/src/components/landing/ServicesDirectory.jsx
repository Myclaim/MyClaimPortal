import { useState, useEffect, useRef } from 'react';

const tabsData = [
  { key: 'legal', label: 'Legal Services', items: ['Succession Certificate','Legal Heir Certificate','Resolving Property Disputes','Will Drafting','Issue of Death Certificate','Legal Assistance','Getting Birth Certificate','Letter of Administration','Filing an FIR','Gazette Notification'] },
  { key: 'equity', label: 'Equity Shares', items: ['Demat of Physical Shares','Duplicate of Shares','Transfer & Transmission of Shares','Change of Name/Address','Succession Certificate','Signature Mismatch','Probate & Legal Support','NRI Services'] },
  { key: 'iepf', label: 'IEPF', items: ['Unclaimed Dividend Recovery','Unclaimed Shares Recovery','IEPF Claims & Refunds','Tracking Unclaimed Investments','IEPF Legal Support','NRI IEPF Claim','IEPF Form 5'] },
  { key: 'shares', label: 'Other (Shares)', items: ['Loss of Share Certificate','IEPF Rejection Assistance','Recovery from NSDL','Recovery from CDSL','Recovery from Closed DP','NRI Unclaimed Services','Tracking & Claiming Investments','Unlisted Buy & Sell'] },
  { key: 'claims', label: 'Other (Claims)', items: ['Provident Fund Claim','Mutual Fund Claim','Life Insurance Claim','In-Operative Bank Account Claim','Claiming Family Disputes of Shares','Hereditary Claims','Unknown Property Recovery'] },
];

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-[#2FBF71] shrink-0">
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

function AnimatedCard({ item, index }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => setVisible(true), index * 45);
    return () => clearTimeout(timer);
  }, [item, index]);

  return (
    <a
      ref={ref}
      href="#claim-check"
      className="group flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-[#2FBF71] hover:shadow-md transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
        transition: `opacity 0.4s ease ${index * 0.04}s, transform 0.4s ease ${index * 0.04}s`,
      }}
    >
      <CheckIcon />
      <span className="text-sm font-semibold text-slate-700 group-hover:text-[#1C1C1C] transition-colors">{item}</span>
    </a>
  );
}

export default function ServicesDirectory() {
  const [activeTab, setActiveTab] = useState('legal');
  const current = tabsData.find(t => t.key === activeTab);
  const [sectionVisible, setSectionVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setSectionVisible(true); }, { threshold: 0.1 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="services" ref={sectionRef} className="py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Head */}
        <div
          className="mb-12 text-center max-w-3xl mx-auto"
          style={{
            opacity: sectionVisible ? 1 : 0,
            transform: sectionVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-[#2FBF71] text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-300/60">
            ✦ All Claim Categories
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-[#1C1C1C] mb-3">Complete Services Directory</h2>
          <p className="text-slate-600 text-base sm:text-lg">Comprehensive financial & legal advisory for recovering every kind of unclaimed investment.</p>
        </div>

        {/* Tab Buttons */}
        <div
          className="flex flex-wrap justify-center gap-2 mb-10"
          role="tablist"
          style={{
            opacity: sectionVisible ? 1 : 0,
            transform: sectionVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s',
          }}
        >
          {tabsData.map(tab => (
            <button key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === tab.key
                ? 'bg-[#2FBF71] text-white shadow-lg shadow-emerald-500/20 scale-105'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Panel */}
        <div
          className="p-8 sm:p-12 rounded-3xl bg-[#F8F9FB] border border-slate-200/90 shadow-md"
          style={{
            opacity: sectionVisible ? 1 : 0,
            transition: 'opacity 0.6s ease 0.35s',
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {current?.items.map((item, idx) => (
              <AnimatedCard key={item} item={item} index={idx} />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          className="mt-10 text-center"
          style={{
            opacity: sectionVisible ? 1 : 0,
            transform: sectionVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.7s ease 0.5s, transform 0.7s ease 0.5s',
          }}
        >
          <a
            href="#claim-check"
            id="services-cta"
            className="inline-flex items-center gap-2.5 bg-[#2FBF71] hover:bg-[#26aa62] text-white font-bold px-8 py-4 rounded-full shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-0.5"
          >
            Start Your Recovery Journey
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
