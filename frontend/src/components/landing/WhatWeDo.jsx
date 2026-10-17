const services = [
  { pill: 'MCA / IEPF-5', title: 'IEPF Claims', desc: 'Reclaim dividends and shares transferred to the IEPF Authority after 7 consecutive dormant years with complete regulatory filing.', chips: ['Form IEPF-5','RTA Verification','Direct Bank Credit'], cta: 'Claim Recovery', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></> },
  { pill: 'Loss & Theft', title: 'Duplicate Issue of Shares', desc: 'Obtain legally valid duplicate share certificates from company registrars when original paper certificates are lost or damaged.', chips: ['FIR & Indemnity','Newspaper Ads','Registrar Approval'], cta: 'Apply Duplicate', icon: <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></> },
  { pill: 'SEBI Mandate', title: 'Demat of Physical Shares', desc: 'Seamlessly convert legacy physical paper share certificates into electronic dematerialized format in your NSDL or CDSL account.', chips: ['DRF Submission','NSDL & CDSL','Instant Liquidity'], cta: 'Convert to Demat', icon: <><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><path d="M7 9h10M7 12h6"/></> },
  { pill: 'Legal Succession', title: 'Transfer & Transmission', desc: 'Facilitate legal transmission to rightful legal heirs after the demise of the original holder, resolving probate and succession requirements.', chips: ['Succession Cert.','Legal Heirship','Probate Support'], cta: 'Transmit Shares', icon: <><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></> },
  { pill: 'Global NRI', title: 'NRI Assistance', desc: 'Dedicated remote recovery desk for NRIs living in USA, UK, UAE, Singapore & Australia to reclaim Indian investments without flying to India.', chips: ['Zero Travel POA','Embassy Attestation','NRE/NRO Repatriation'], cta: 'NRI Services', icon: <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>, highlight: true },
  { pill: 'Court & Probate', title: 'Legal Support & Probate', desc: 'Complete legal backing for probate proceedings, succession certificates, Letter of Administration, and civil court representations.', chips: ['Succession Cert.','Probate of Will','Letter of Admin'], cta: 'Legal Assistance', icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/> },
  { pill: 'Deceased Folios', title: 'Hereditary Claims', desc: 'Help families trace, verify, and reclaim investments left behind by deceased parents or relatives across shares, funds, and banks.', chips: ['Legal Heir Verification','No-Nominee Claims','Family Settlements'], cta: 'Hereditary Recovery', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> },
  { pill: 'Unclaimed FDs', title: 'Unknown Property & FD Claims', desc: 'Deep forensic tracking to uncover forgotten bank fixed deposits, inoperative accounts, and unmapped real properties across India.', chips: ['Dormant FD Recovery','In-Operative Accounts','Asset Identification'], cta: 'Trace Deposits', icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></> },
];

const pains = [
  { num: '01', title: 'Lost Investment Track?', desc: 'We trace historical physical shares, unpaid dividends, and forgotten folios across India.' },
  { num: '02', title: 'Trapped in Bureaucracy?', desc: 'We handle IEPF-5 forms, MCA compliance, and registrar follow-ups from start to finish.' },
  { num: '03', title: 'Legal Heirs or NRI Abroad?', desc: 'We draft succession paperwork, obtain legal heir certifications, and assist NRIs remotely.' },
];

export default function WhatWeDo() {
  return (
    <section id="what-we-do" className="py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Head */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-[#C9A227] text-xs font-bold uppercase tracking-wider mb-4 border border-amber-300/60">
            ✦ Core Financial & Legal Advisory
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-[#1C1C1C] mb-4">Approach of <span className="text-[#2FBF71]">What We Do</span></h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
            Our strategic methodology tackles the bureaucratic hurdles, company law complexities, and documentation delays that keep your rightful wealth locked in unclaimed status.
          </p>
        </div>

        {/* Pain Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {pains.map(p => (
            <div key={p.num} className="group flex gap-4 p-6 rounded-2xl bg-[#F8F9FB] border border-slate-200/90 hover:border-[#2FBF71]/60 hover:bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <span className="text-4xl font-black text-[#2FBF71] font-mono shrink-0 group-hover:scale-110 group-hover:text-emerald-500 transition-all duration-300">{p.num}</span>
              <div>
                <h4 className="font-bold text-[#1C1C1C] mb-1 group-hover:text-[#2FBF71] transition-colors">{p.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {services.map((s) => (
            <article key={s.title}
              className={`group relative p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer bg-white
                ${s.highlight
                  ? 'border-emerald-300 ring-2 ring-emerald-500/20 shadow-md hover:border-emerald-400'
                  : 'border-slate-200/90 hover:border-[#2FBF71]/60 shadow-sm'}`}>
              
              {/* Top */}
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${s.highlight ? 'bg-emerald-100 text-[#2FBF71]' : 'bg-slate-100 text-slate-700'} group-hover:bg-[#2FBF71] group-hover:text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-sm`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    {s.icon}
                  </svg>
                </div>
                <span className="text-[11px] font-bold text-[#C9A227] bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 group-hover:border-amber-300 transition-colors">{s.pill}</span>
              </div>

              <h3 className="font-bold text-[#1C1C1C] text-base mb-2 group-hover:text-[#2FBF71] transition-colors">{s.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">{s.desc}</p>

              {/* Chips */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {s.chips.map(c => <span key={c} className="text-[11px] text-slate-600 bg-slate-100 group-hover:bg-emerald-50/60 px-2 py-0.5 rounded-full transition-colors">{c}</span>)}
              </div>

              {/* Arrow CTA */}
              <a href="#claim-check" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2FBF71] hover:text-[#26aa62] transition-colors">
                <span>{s.cta}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-300">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </a>
            </article>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-8 rounded-3xl bg-gradient-to-r from-emerald-50 via-white to-amber-50 border border-emerald-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <strong className="text-[#1C1C1C] font-bold text-base sm:text-lg">Need assistance with PF, Mutual Funds, or Unknown Bank Accounts?</strong>
            <p className="text-slate-600 text-sm mt-1">We also handle 24+ specialized corporate and hereditary claim cases.</p>
          </div>
          <a href="#services" className="btn-shine-effect shrink-0 px-8 py-3.5 rounded-full bg-[#2FBF71] text-white font-bold text-sm shadow-md shadow-emerald-500/20 hover:bg-[#26aa62] hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
            View All 24+ Services ↓
          </a>
        </div>

      </div>
    </section>
  );
}
