import { useState } from 'react';

const showcaseItems = [
  {
    id: 'iepf',
    badge: 'GOVERNMENT COMPLIANT · SEC 124(6)',
    title: 'IEPF Claim & Unclaimed Dividend Vault',
    subtitle: 'Track and reclaim shares transferred to the Investor Education & Protection Fund Authority.',
    description: 'When dividends remain unpaid or unclaimed for 7 consecutive years, shares are mandatorily transferred to the IEPF demat account. Our specialized regulatory team files Form IEPF-5, coordinates with nodal officers, and ensures direct demat credit to your portfolio.',
    image: '/assets/iepf-3d.png',
    features: [
      'MCA Form IEPF-5 e-filing with automated challan validation',
      'End-to-end liaison with Company RTA & IEPF Nodal Officers',
      'Original share verification & indemnity bond execution',
      'Direct Demat & Bank credit of all cumulative dividends'
    ],
    stat: '₹180+ Cr',
    statLabel: 'Recovered from IEPF'
  },
  {
    id: 'demat',
    badge: 'PAPER TO DIGITAL · SEBI MANDATE',
    title: 'Physical Certificate Dematerialization',
    subtitle: 'Convert obsolete, damaged, or lost paper certificates into liquid digital demat shares.',
    description: 'SEBI has mandated that physical shares cannot be traded without demat. We resolve the hardest roadblocks: severe signature mismatch, old address changes, lost original folio records, and issue of duplicate share certificates.',
    image: '/assets/demat-3d.png',
    features: [
      'Duplicate share certificate retrieval via FIR & newspaper notices',
      'Banker signature verification (Form ISR-1, ISR-2 compliance)',
      'Transmission upon death of primary shareholder',
      'Direct demat credit into Zerodha, Groww, AngelOne or any DP'
    ],
    stat: '4,200+',
    statLabel: 'Folios Dematerialized'
  },
  {
    id: 'legal',
    badge: 'COURT & JURISDICTION · CROSS-BORDER',
    title: 'Legal Heirship & NRI Wealth Repatriation',
    subtitle: 'Navigate succession certificates, probate, and cross-border repatriation seamlessly.',
    description: 'For inheritance cases where original investors have passed away without a nomination, our high-court legal team obtains Succession Certificates or Letters of Administration. For NRIs, we handle full FEMA & RBI compliance for overseas transfer.',
    image: '/assets/legal-3d.png',
    features: [
      'Succession Certificate & Legal Heir petition in Civil Courts',
      'Family settlement deed & NOC drafting among legal heirs',
      'NRI NRO/NRE account setup & 15CA/15CB tax compliance',
      'Complete repatriation of funds to USA, UK, UAE, Canada & Singapore'
    ],
    stat: '6+ Countries',
    statLabel: 'NRI Clients Served'
  }
];

export default function FeatureShowcase() {
  const [activeTab, setActiveTab] = useState(0);
  const active = showcaseItems[activeTab];

  return (
    <section className="py-24 bg-[#F8F9FB] relative overflow-hidden border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-500/20 text-[#2FBF71] text-xs font-bold uppercase tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2FBF71] animate-ping" />
            Specialized 3D Asset Recovery
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1C1C1C] tracking-tight">
            How We Unlock Your <span className="text-[#2FBF71]">Forgotten Wealth</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Backed by proprietary regulatory workflows, court legal expertise, and direct RTA coordination across India.
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {showcaseItems.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(idx)}
              className={`px-6 py-3.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === idx
                  ? 'bg-[#2FBF71] text-white font-bold shadow-lg shadow-emerald-500/20 scale-105'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-sm'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeTab === idx ? 'bg-white' : 'bg-[#2FBF71]'}`} />
              {item.title.split('&')[0]}
            </button>
          ))}
        </div>

        {/* Interactive 3D Showcase Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 lg:p-14 shadow-xl transition-all duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Information & Checklist */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold text-[#C9A227] tracking-widest uppercase bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 inline-block">
                {active.badge}
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1C1C] leading-tight">
                {active.title}
              </h3>
              <p className="text-[#2FBF71] font-semibold text-lg">
                {active.subtitle}
              </p>
              <p className="text-slate-600 leading-relaxed text-base">
                {active.description}
              </p>

              {/* Bullet Features */}
              <div className="space-y-3 pt-2">
                {active.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[#2FBF71] shrink-0 mt-0.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <span className="text-slate-700 text-sm font-medium">{feat}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <a
                  href="#claim-check"
                  className="px-8 py-3.5 rounded-full bg-[#2FBF71] hover:bg-[#26aa62] text-white font-bold text-sm shadow-md shadow-emerald-500/20 hover:scale-105 transition-all duration-300"
                >
                  Verify Your Claim Free
                </a>
                <a
                  href="tel:+918511000454"
                  className="px-6 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-semibold text-sm transition-all duration-300"
                >
                  Talk to Specialist →
                </a>
              </div>
            </div>

            {/* Right Column: 3D Visual with Floating Stat Card */}
            <div className="lg:col-span-6 relative flex justify-center">
              <div className="relative z-10 w-full max-w-lg rounded-3xl overflow-hidden border border-slate-200/80 shadow-xl bg-slate-50 group hover:border-[#2FBF71]/50 transition-all duration-500">
                <img
                  src={active.image}
                  alt={active.title}
                  className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Floating Metric Badge */}
                <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between shadow-xl">
                  <div>
                    <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Track Record</div>
                    <div className="text-2xl font-bold text-[#1C1C1C] font-serif">{active.stat}</div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-emerald-100 text-[#2FBF71] text-xs font-bold rounded-full">
                      {active.statLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
