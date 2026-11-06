import { useEffect, useState } from 'react';

const processFeatures = [
  {
    title: 'Digital ecosystem',
    desc: 'Keep asset discovery, documents, and claim progress together in one connected workspace.',
    panelTitle: 'One connected workspace',
    panelDesc: 'A clear view of the key parts of your recovery journey.',
    rows: ['Asset discovery', 'Document checklist', 'Claim progress'],
  },
  {
    title: 'Fast-track onboarding',
    desc: 'Get started with a guided intake and a clear checklist of the information your case needs.',
    panelTitle: 'Guided onboarding',
    panelDesc: 'Start with the essentials and see what information is needed next.',
    rows: ['Share basic details', 'Add holder information', 'Review the document checklist'],
  },
  {
    title: 'Assets discovery',
    desc: 'Organize searches for shares, dividends, deposits, and other potentially unclaimed assets.',
    panelTitle: 'Asset discovery',
    panelDesc: 'Review the asset types and records that may be relevant to your search.',
    rows: ['Shares and folios', 'Unpaid dividends', 'Deposits and other assets'],
  },
  {
    title: 'Unclaimed wealth recovery',
    desc: 'Understand the steps, records, and follow-ups involved in pursuing an eligible recovery claim.',
    panelTitle: 'Recovery journey',
    panelDesc: 'Follow each stage with clear next steps and document guidance.',
    rows: ['Case review', 'Application preparation', 'Institution follow-up'],
  },
  {
    title: 'Digital family tree',
    desc: 'Organize family relationships and supporting records for claims involving legal heirs.',
    panelTitle: 'Family and heir records',
    panelDesc: 'Keep holder and family information organized for succession-related cases.',
    rows: ['Original holder details', 'Family relationships', 'Supporting documents'],
  },
  {
    title: 'Customer support & legal services',
    desc: 'Get coordinated customer support and guidance on legal paperwork relevant to your case.',
    panelTitle: 'Support when you need it',
    panelDesc: 'Find the right help for process questions and legal documentation.',
    rows: ['Dedicated case coordination', 'Legal document guidance', 'Status and follow-up support'],
  },
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
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const activeFeature = processFeatures[activeFeatureIndex];

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        setActiveFeatureIndex((current) => (current + 1) % processFeatures.length);
      }
    }, 4500);
    return () => window.clearInterval(timer);
  }, [activeFeatureIndex]);

  return (
    <>
      {/* 3) Our Claim Process (matching notebook section 3) */}
      <section id="process-section" className="overflow-hidden bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-screen-2xl px-6 sm:px-8 lg:px-12">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <span className="inline-flex items-center gap-2 text-sm font-bold tracking-wide text-emerald-700">
                <span className="h-2 w-2 rounded-sm bg-emerald-500" /> The MyClaim experience
              </span>
              <h2 className="mt-5 max-w-3xl font-serif text-4xl font-bold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                A clearer journey to recover your family’s wealth
              </h2>

              <div role="tablist" aria-label="Claim process features" className="mt-10 border-l-[3px] border-slate-200 sm:mt-14">
                {processFeatures.map((feature, index) => {
                  const isActive = index === activeFeatureIndex;
                  return (
                    <button key={feature.title} type="button" role="tab" aria-selected={isActive} onClick={() => setActiveFeatureIndex(index)}
                      className={`-ml-[3px] block w-full border-l-[3px] px-5 py-4 text-left transition-all duration-300 sm:px-6 sm:py-5 ${isActive ? 'border-[#2FBF71] text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-700'}`}>
                      <span className={`block text-xl font-semibold sm:text-2xl ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>{feature.title}</span>
                      {isActive && <span key={activeFeatureIndex} className="feature-panel-enter mt-2 block max-w-xl text-base leading-relaxed text-slate-600">{feature.desc}</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl py-6 sm:py-10">
              <div className="absolute inset-8 rounded-full bg-emerald-100/70 blur-3xl" />
              <div className="relative mx-auto max-w-[390px] rounded-[30px] border border-slate-200 bg-white p-3 shadow-[0_24px_70px_rgba(15,23,42,0.12)] sm:p-4">
                <div className="overflow-hidden rounded-[22px] bg-[#F8FAF9]">
                  <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-[#2FBF71]">
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h5M8 16h8"/></svg>
                      </span>
                      <div>
                        <div className="text-sm font-bold text-slate-900">MyClaim India</div>
                        <div className="text-xs text-slate-400">Your recovery workspace</div>
                      </div>
                    </div>
                    <span className="h-2.5 w-2.5 rounded-full bg-[#2FBF71] ring-4 ring-emerald-100" />
                  </div>

                  <div key={activeFeatureIndex} className="feature-panel-enter p-4 sm:p-5">
                    <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-[#2FBF71] p-5 text-white shadow-lg shadow-emerald-700/15">
                      <div className="text-xs font-semibold text-white/75">YOUR CLAIM JOURNEY</div>
                      <div className="mt-2 text-xl font-bold">{activeFeature.panelTitle}</div>
                      <div className="mt-1 text-sm leading-relaxed text-white/85">{activeFeature.panelDesc}</div>
                      <div className="mt-5 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-white" />
                        <span className="text-xs font-semibold text-white/90">Guidance at every step</span>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-800">What we help you manage</span>
                        <span className="text-xs font-bold text-[#2FBF71]">0{activeFeatureIndex + 1}/06</span>
                      </div>
                      <div className="space-y-2.5">
                        {activeFeature.rows.map((row, index) => (
                          <div key={row} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-[#2FBF71]">
                              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6"/></svg>
                            </span>
                            <span className="flex-1 text-sm font-medium text-slate-700">{row}</span>
                            <span className="text-xs text-slate-300">›</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between px-1 text-xs font-semibold text-slate-400">
                      <span>Private & secure</span><span className="text-[#2FBF71]">MyClaim support</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
      <style>{`@keyframes featurePanelEnter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } .feature-panel-enter { animation: featurePanelEnter 420ms ease-out both; } @media (prefers-reduced-motion: reduce) { .feature-panel-enter { animation: none; } }`}</style>

      {/* 4) Who We Collaborate With (matching notebook section 4: "icons change") */}
      <section id="collaborate" className="py-24 bg-white">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-12">
          
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
                className="group relative flex flex-col justify-between p-7 rounded-3xl bg-[#F8F9FB] border border-slate-200/90 hover:border-[#2FBF71]/60 hover:bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-3.5 rounded-2xl bg-white shadow-sm border border-slate-100 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      {p.icon}
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${p.highlight} group-hover:shadow-sm transition-shadow`}>
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
                  <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
}
