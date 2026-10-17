const steps = [
  { n: 1, title: 'Contact', desc: 'Seamlessly communicate with clients via call, WhatsApp, or home visit.', img: '/assets/process-1-contact.png' },
  { n: 2, title: 'Collect', desc: 'Gather necessary folios, death certs, and documents with a customer-focused approach.', img: '/assets/process-2-collect.png' },
  { n: 3, title: 'Check', desc: 'Thoroughly review and verify all collected records across IEPF and company RTAs.', img: '/assets/process-3-check.png' },
  { n: 4, title: 'Confirm', desc: 'Validate entitlement, legal heirship, and claim value with all stakeholders.', img: '/assets/process-4-confirm.png' },
  { n: 5, title: 'Certify', desc: 'Officially certify affidavits, indemnity bonds, and succession documents.', img: '/assets/process-5-certify.png' },
  { n: 6, title: 'Contract', desc: 'Establish formal transparent success-fee agreements before regulatory filing.', img: '/assets/process-6-contract.png' },
  { n: 7, title: 'Claim', desc: 'Submit statutory IEPF-5 forms and company transfer applications.', img: '/assets/process-7-claim.png' },
  { n: 8, title: 'Capitalize', desc: 'Recover rightful investments directly credited to your Demat & bank account.', img: '/assets/process-8-capitalize.png' },
];

const collabPartners = [
  {
    category: 'Individual & NRI Investors',
    title: 'Indian Citizens & Global NRIs',
    desc: 'Supporting domestic investors and NRIs across 6+ countries (USA, UK, UAE, Singapore, Australia) with zero-travel POA repatriation.',
    badge: 'Cross-Border Desk',
    icon: (
      <svg className="w-8 h-8 text-[#2FBF71]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    highlight: 'bg-emerald-50 text-[#2FBF71] border-emerald-200'
  },
  {
    category: 'Corporate & Listed Entities',
    title: 'Limited & Private Companies',
    desc: 'Working directly with company registrars (RTAs like Link Intime, KFintech, Bigshare) and secretarial desks for share deduplication.',
    badge: 'RTA Compliance',
    icon: (
      <svg className="w-8 h-8 text-[#C9A227]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
        <path d="M9 9h1" />
        <path d="M9 13h1" />
        <path d="M9 17h1" />
        <path d="M14 9h1" />
        <path d="M14 13h1" />
        <path d="M14 17h1" />
      </svg>
    ),
    highlight: 'bg-amber-50 text-[#C9A227] border-amber-200'
  },
  {
    category: 'Banking & Financial Desks',
    title: 'Banks & Financial Institutions',
    desc: 'Tracing inoperative savings accounts, matured fixed deposits, unclaimed insurance proceeds, and dormant mutual fund folios.',
    badge: 'Dormant Asset Tech',
    icon: (
      <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
    highlight: 'bg-blue-50 text-blue-600 border-blue-200'
  },
  {
    category: 'Channel Partner Network',
    title: 'CAs, Advocates & Wealth Advisors',
    desc: 'Strategic partnerships with Chartered Accountants, High Court advocates, and mutual fund distributors for collaborative client claims.',
    badge: 'Partner Program',
    icon: (
      <svg className="w-8 h-8 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <line x1="20" y1="8" x2="20" y2="14" />
        <line x1="23" y1="11" x2="17" y2="11" />
      </svg>
    ),
    highlight: 'bg-purple-50 text-purple-600 border-purple-200'
  },
];

export default function Process() {
  return (
    <>
      {/* 3) Our Claim Process (matching notebook section 3) */}
      <section id="process-section" className="py-24 bg-[#F8F9FB] border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-[#2FBF71] text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-300/60">
              ✦ Systematic Recovery Workflow
            </span>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-[#1C1C1C] mb-4">
              Our Claim <span className="text-[#2FBF71]">Process</span>
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-[#2FBF71] to-[#C9A227] rounded-full mx-auto mb-4"/>
            <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto">
              A proven 8-step journey — from first contact to recovering your rightful investments.
            </p>
          </div>

          {/* Row 1: Steps 1-4 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {steps.slice(0, 4).map((step, i) => (
              <div key={step.n} className="relative bg-white border border-slate-200/90 rounded-3xl p-6 flex flex-col items-center text-center gap-4 hover:shadow-lg hover:border-[#2FBF71]/50 transition-all duration-300 group">
                {i < 3 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 bg-[#2FBF71] rounded-full items-center justify-center shadow-md">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                )}
                <div className="w-8 h-8 rounded-full bg-[#2FBF71] text-white text-sm font-black flex items-center justify-center shadow-md shadow-[#2FBF71]/20">
                  {step.n}
                </div>
                <img src={step.img} alt={step.title} className="h-16 w-auto object-contain group-hover:scale-105 transition-all duration-300"/>
                <div>
                  <h3 className="font-bold text-[#1C1C1C] mb-1">{step.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Row 2: Steps 5-8 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {steps.slice(4).map((step, i) => (
              <div key={step.n} className="relative bg-white border border-slate-200/90 rounded-3xl p-6 flex flex-col items-center text-center gap-4 hover:shadow-lg hover:border-[#C9A227]/50 transition-all duration-300 group">
                {i < 3 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 bg-[#C9A227] rounded-full items-center justify-center shadow-md">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                )}
                <div className="w-8 h-8 rounded-full bg-[#C9A227] text-white text-sm font-black flex items-center justify-center shadow-md shadow-[#C9A227]/20">
                  {step.n}
                </div>
                <img src={step.img} alt={step.title} className="h-16 w-auto object-contain group-hover:scale-105 transition-all duration-300"/>
                <div>
                  <h3 className="font-bold text-[#1C1C1C] mb-1">{step.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4) Who We Collaborate With (matching notebook section 4: "icons change") */}
      <section id="collaborate" className="py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-[#C9A227] text-xs font-bold uppercase tracking-wider mb-4 border border-amber-300/60">
              ✦ Ecosystem Collaborations
            </span>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-[#1C1C1C] mb-4">
              Who We <span className="text-[#2FBF71]">Collaborate</span> With?
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-[#2FBF71] to-[#C9A227] rounded-full mx-auto mb-4"/>
            <p className="text-slate-600 max-w-2xl mx-auto text-base sm:text-lg">
              Our experienced team collaborates seamlessly with individual families, NRI communities, listed corporates, banks, and legal advisors across the country.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {collabPartners.map((p) => (
              <div 
                key={p.title} 
                className="group relative flex flex-col justify-between p-7 rounded-3xl bg-[#F8F9FB] border border-slate-200/90 hover:border-[#2FBF71]/60 hover:bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-3.5 rounded-2xl bg-white shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                      {p.icon}
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${p.highlight}`}>
                      {p.badge}
                    </span>
                  </div>

                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {p.category}
                  </div>
                  <h3 className="text-[#1C1C1C] font-bold text-lg mb-2.5 group-hover:text-[#2FBF71] transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {p.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-200/70 flex items-center justify-between text-xs font-bold text-[#2FBF71]">
                  <span>Explore Workflow</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
}
