import { Link } from 'react-router-dom';
import { useState } from 'react';

export const services = [
  { slug: 'iepf-claims', title: 'IEPF Claims', desc: 'Recover shares and dividends transferred to IEPF.', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></> },
  { slug: 'duplicate-share-certificates', title: 'Duplicate Share Certificates', desc: 'Replace lost, damaged, or missing share certificates.', icon: <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></> },
  { slug: 'demat-physical-shares', title: 'Demat of Physical Shares', desc: 'Convert paper shares into demat holdings.', icon: <><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><path d="M7 9h10M7 12h6"/></> },
  { slug: 'share-transfer-transmission', title: 'Share Transfer & Transmission', desc: 'Complete ownership and legal-heir transfers.', icon: <><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></> },
  { slug: 'nri-shareholder-assistance', title: 'NRI Shareholder Assistance', desc: 'Support for NRIs reclaiming Indian investments.', icon: <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></> },
  { slug: 'legal-heir-probate-support', title: 'Legal Heir & Probate Support', desc: 'Navigate succession and inheritance paperwork.', icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/> },
  { slug: 'hereditary-claims', title: 'Hereditary Claims', desc: 'Claim investments belonging to a deceased family member.', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> },
  { slug: 'unclaimed-deposits-property', title: 'Unclaimed Deposits & Property', desc: 'Trace and reclaim forgotten deposits and assets.', icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></> },
];

export default function WhatWeDo() {
  const [showAllServices, setShowAllServices] = useState(false);
  const serviceGroups = [
    { title: 'Legal Services', items: ['Succession Certificate', 'Legal Heir Certificate', 'Resolving Property Disputes', 'Will Drafting', 'Issue of Death Certificate', 'Legal Assistance', 'Getting Birth Certificate', 'Letter of Administration', 'Filing an FIR', 'Gazette Notification'] },
    { title: 'Equity Shares', items: ['Demat of Physical Shares', 'Duplicate of Shares', 'Transfer and Transmission of Shares', 'Change of Name/Address', 'Succession Certificate', 'Signature Mismatch', 'Probate and Legal Support', 'NRI Services'] },
    { title: 'IEPF', items: ['Unclaimed Dividend Recovery', 'Unclaimed Shares Recovery', 'IEPF Claims and Refunds', 'Tracking Unclaimed Investments', 'IEPF Legal Support', 'NRI IEPF Claim', 'IEPF Form 5', 'NRI Service'] },
    { title: 'Other Services', items: ['Loss of Share Certificate', 'IEPF Rejection', 'Recovery of Shares from NSDL', 'Recovery of Shares from CDSL', 'Recovery of Investments from Closed DP', 'NRI Unclaimed Services', 'Tracking and Claiming Investments', 'Unlisted Buy and Sell'] },
    { title: 'Other Services', items: ['Provident Fund Claim', 'Mutual Fund Claim', 'Life Insurance Claim', 'In-operative Bank Account Claim', 'Claiming Family Disputes of Shares', 'Hereditary Claims', 'Unknown Property Recovery'] },
  ];

  return (
    <section id="what-we-do" className="py-24 bg-white">
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Section Head */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-[#C9A227] text-xs font-bold uppercase tracking-wider mb-4 border border-amber-300/60">
            ✦ Core Financial & Legal Advisory
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-[#1C1C1C] mb-4">Approach of <span className="text-[#2FBF71]">What We Do</span></h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
            Our strategic methodology tackles the bureaucratic hurdles, company law complexities, and documentation delays that keep your rightful wealth locked in unclaimed status.
          </p>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {services.map((s) => (
            <Link key={s.slug} to={`/services/${s.slug}`}
              className="group block min-h-[280px] rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 transition-all duration-300 hover:border-emerald-200 hover:shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
              <div className="mb-6 flex h-24 items-center text-[#55AE76] sm:h-28">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" className="h-20 w-20 drop-shadow-[0_5px_7px_rgba(47,191,113,0.18)] transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105 sm:h-24 sm:w-24">
                  {s.icon}
                </svg>
              </div>
              <h3 className="mb-3 text-lg font-bold leading-snug text-slate-900">{s.title}</h3>
              <p className="text-sm leading-relaxed text-slate-500">{s.desc}</p>
            </Link>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-5 rounded-3xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 via-white to-amber-50 p-6 shadow-sm sm:flex-row sm:items-center sm:p-8">
          <div>
            <strong className="text-base font-bold text-[#1C1C1C] sm:text-lg">Need assistance with PF, Mutual Funds, or Unknown Bank Accounts?</strong>
            <p className="mt-1 text-sm text-slate-600">We also handle 24+ specialized corporate and hereditary claim cases.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowAllServices(true)}
            className="btn-shine-effect shrink-0 rounded-full bg-[#2FBF71] px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#26aa62] hover:shadow-lg"
            aria-haspopup="dialog"
            aria-expanded={showAllServices}
          >
            View All 24+ Services ↓
          </button>
        </div>

      </div>

      {showAllServices && (
        <div
          className="fixed inset-0 z-[200] bg-slate-950/35 px-3 py-5 backdrop-blur-[2px] sm:px-6 sm:py-8"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setShowAllServices(false); }}
          onKeyDown={(event) => { if (event.key === 'Escape') setShowAllServices(false); }}
        >
          <div role="dialog" aria-modal="true" aria-labelledby="all-services-title" className="mx-auto flex max-h-full max-w-[1800px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-emerald-500 px-5 py-4 sm:px-7">
              <div>
                <h3 id="all-services-title" className="text-xl font-bold text-slate-900">All Services</h3>
                <p className="mt-0.5 text-xs text-slate-500">Explore our legal, equity, IEPF, and recovery services.</p>
              </div>
              <button type="button" onClick={() => setShowAllServices(false)} aria-label="Close all services" className="flex h-10 w-10 items-center justify-center rounded-full text-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">×</button>
            </div>
            <div className="grid flex-1 grid-cols-1 overflow-y-auto sm:grid-cols-2 lg:grid-cols-5">
              {serviceGroups.map((group, groupIndex) => (
                <section key={`${group.title}-${groupIndex}`} className={`p-5 sm:p-6 ${groupIndex < serviceGroups.length - 1 ? 'border-b border-slate-200 sm:border-r lg:border-b-0' : ''}`}>
                  <h4 className="mb-4 text-lg font-bold text-slate-900">{group.title}</h4>
                  <ul className="space-y-3.5">
                    {group.items.map((item) => <li key={item} className="text-sm font-medium uppercase leading-relaxed text-slate-700">{item}</li>)}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
