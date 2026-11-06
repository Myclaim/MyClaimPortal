import { useState, useEffect, useRef } from 'react';

const clientTestimonials = [
  { 
    initials: 'RK', 
    name: 'Dr. Ramesh Kania', 
    role: 'USA NRI Investor', 
    service: 'Titan, Reliance & SRF IEPF Recovery (₹42 Lakhs)', 
    text: 'MyClaim India recovered unclaimed shares from Titan, Reliance, and SRF Ltd. that I was unaware of after moving to the USA. They expertly handled the entire embassy attestation and zero-travel POA process. Truly exceptional service for NRIs!' 
  },
  { 
    initials: 'RJ', 
    name: 'Renuka Joshi', 
    role: 'Deceased Estate Legal Heir', 
    service: 'Escorts Kubota Demat & Pilani IEPF Recovery (₹28 Lakhs)', 
    text: 'I discovered that my late father\'s physical shares of Escorts Kubota needed dematerialization, and shares from Pilani Investment had gone to IEPF. With MyClaim India\'s high court succession support, we received the full credit directly in our demat account.' 
  },
  { 
    initials: 'JP', 
    name: 'Jimmy Panthaki', 
    role: 'Shareholder, Surat', 
    service: 'Flood Lost Shares Duplication (₹19 Lakhs)', 
    text: 'During the Surat flood, our original share certificates for DCW, Exide, and ACC were destroyed. MyClaim India managed FIR filings, newspaper ads, and company registrar interactions smoothly until duplicate shares were safely issued.' 
  },
];

const partnerTestimonials = [
  {
    initials: 'RM',
    name: 'CA Rajesh Mehta',
    role: 'Chartered Accountant Partner (Ahmedabad)',
    service: '18+ Client Claims Referred · ₹1.2 Cr Recovered',
    text: 'As a practicing CA, many of my HNIs have dormant shares or IEPF issues that we don\'t have bandwidth to handle. MyClaim India\'s partner desk provides an effortless referral tracking portal, high client satisfaction, and timely success commission.'
  },
  {
    initials: 'VS',
    name: 'Vikram Singhania',
    role: 'Wealth Advisor & MFD (Mumbai)',
    service: 'Strategic Channel Associate · 25+ Successful Demats',
    text: 'The best partner program for financial distributors. Their team takes complete ownership of legal heirship, probate, and physical share dematerialization, allowing me to unlock locked client portfolios seamlessly.'
  },
  {
    initials: 'SP',
    name: 'Advocate Sneha Parikh',
    role: 'Succession & Legal Consultant (Surat)',
    service: 'Court & IEPF Legal Associate',
    text: 'Collaborating with MyClaim India has expanded our legal practice. Their specialized technical knowledge of MCA rules combined with our court filings delivers unparalleled outcomes for complex family hereditary disputes.'
  }
];

export default function Testimonials() {
  const [tab, setTab] = useState('clients'); // 'clients' | 'partners'
  const [activeIdx, setActiveIdx] = useState(0); // Start from 1st card
  const [offset, setOffset] = useState(0);
  const trackRef = useRef(null);

  const activeList = tab === 'clients' ? clientTestimonials : partnerTestimonials;

  // Continuous automatic smooth moving rotation (10 seconds per splash card)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % activeList.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [activeList.length]);

  // Dynamically calculate horizontal offset so the showcased card is perfectly centered on all screens
  useEffect(() => {
    const updateOffset = () => {
      if (trackRef.current && trackRef.current.parentElement) {
        const containerWidth = trackRef.current.parentElement.offsetWidth;
        const cardEl = trackRef.current.children[activeIdx];
        if (cardEl) {
          const cardWidth = cardEl.offsetWidth;
          const cardLeft = cardEl.offsetLeft;
          const targetOffset = (containerWidth / 2) - cardLeft - (cardWidth / 2);
          setOffset(targetOffset);
        }
      }
    };

    updateOffset();
    const handleResize = () => updateOffset();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeIdx, tab, activeList.length]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setActiveIdx(0);
  };

  return (
    <section id="testimonials" className="py-24 bg-white overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-2 sm:px-4 lg:px-6">
        
        {/* Section Header */}
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-[#2FBF71] text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-300/60">
            ✦ Real Experiences & Partner Trust
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-[#1C1C1C] mb-4">
            Testimonials & <span className="text-[#2FBF71]">Reviews</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
            Words of trust from the families we have restored wealth for, and the professional associates who partner with us.
          </p>

          {/* Tab Switcher */}
          <div className="flex bg-white p-1.5 rounded-full border border-slate-200/90 shadow-sm max-w-xs sm:max-w-sm mx-auto mt-6">
            <button
              onClick={() => handleTabChange('clients')}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-full transition-all ${
                tab === 'clients'
                  ? 'bg-[#2FBF71] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Client Stories
            </button>
            <button
              onClick={() => handleTabChange('partners')}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-full transition-all ${
                tab === 'partners'
                  ? 'bg-[#C9A227] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Partner / Associate Stories
            </button>
          </div>
        </div>

        {/* Carousel Viewport with Edge Fade Gradients */}
        <div className="relative w-full overflow-hidden py-8">
          {/* Subtle Left & Right Edge Fade Gradients */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 sm:w-28 bg-gradient-to-r from-[#F8F9FB] to-transparent z-30" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 sm:w-28 bg-gradient-to-l from-[#F8F9FB] to-transparent z-30" />

          {/* Horizontally Moving Line Track */}
          <div
            ref={trackRef}
            className="flex items-center gap-6 sm:gap-8 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.35,1)] will-change-transform"
            style={{ transform: `translateX(${offset}px)` }}
          >
            {activeList.map((item, i) => {
              const isShowcased = i === activeIdx;

              return (
                <div
                  key={`${tab}-${i}`}
                  onClick={() => setActiveIdx(i)}
                  className={`w-[310px] sm:w-[390px] md:w-[450px] shrink-0 relative flex flex-col justify-between p-7 sm:p-8 rounded-3xl bg-white transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.35,1)] cursor-pointer select-none ${
                    isShowcased
                      ? 'scale-[1.04] z-20 opacity-100 filter-none shadow-2xl shadow-emerald-600/20 border-2 border-[#2FBF71] ring-4 ring-emerald-500/15'
                      : 'scale-[0.93] z-10 opacity-35 filter blur-[2px] hover:blur-none hover:opacity-85 hover:scale-[0.97] border border-slate-200/90 shadow-sm'
                  }`}
                >
                  {/* Moving Splash Glow Aura (only on showcased card) */}
                  {isShowcased && (
                    <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-r from-[#2FBF71]/30 via-emerald-400/40 to-teal-400/30 blur-lg animate-pulse opacity-80 pointer-events-none -z-10" />
                  )}

                  {/* Watermarked quotation mark */}
                  <div 
                    className={`absolute top-4 left-5 text-6xl font-serif leading-none select-none pointer-events-none transition-colors duration-700 ${
                      isShowcased ? 'text-emerald-200/70 scale-110' : 'text-slate-200/50'
                    }`}
                  >
                    “
                  </div>

                  {/* Top Badge: Shows Live Beacon if showcased */}
                  <div className="relative z-10 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex gap-1 text-[#C9A227] text-base">
                        {[...Array(5)].map((_, starIdx) => (
                          <span key={starIdx} className="hover:scale-125 transition-transform cursor-default">
                            ★
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isShowcased && (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2FBF71] opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2FBF71]" />
                          </span>
                        )}
                        <span
                          className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full border transition-colors duration-500 ${
                            isShowcased
                              ? 'bg-emerald-50 text-[#2FBF71] border-emerald-300'
                              : 'bg-slate-50 text-slate-500 border-slate-200'
                          }`}
                        >
                          {tab === 'clients' ? 'Verified Claimant' : 'Certified Partner'}
                        </span>
                      </div>
                    </div>

                    {/* Feedback Quote */}
                    <p 
                      className={`text-sm sm:text-[15px] leading-relaxed mb-6 italic font-normal flex-1 transition-colors duration-500 min-h-[96px] ${
                        isShowcased ? 'text-slate-800' : 'text-slate-500'
                      }`}
                    >
                      "{item.text}"
                    </p>
                  </div>

                  {/* Author & Recovery Tag */}
                  <div className="relative z-10 pt-5 border-t border-slate-100 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm transition-transform duration-500 shrink-0 ${
                          isShowcased
                            ? tab === 'clients'
                              ? 'bg-gradient-to-br from-[#2FBF71] to-[#1e8a4f] scale-110 shadow-emerald-500/30'
                              : 'bg-gradient-to-br from-[#C9A227] to-[#8a6e19] scale-110 shadow-amber-500/30'
                            : 'bg-slate-400'
                        }`}
                      >
                        {item.initials}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-bold text-sm sm:text-base truncate transition-colors duration-500 ${
                          isShowcased ? 'text-[#1C1C1C]' : 'text-slate-600'
                        }`}>
                          {item.name}
                        </p>
                        <p className="text-slate-400 text-xs truncate">{item.role}</p>
                      </div>
                    </div>

                    {/* Service / Recovery Tag */}
                    <div className="w-full">
                      <span 
                        className={`block text-center text-[11px] font-semibold px-2.5 py-1.5 rounded-xl border transition-colors duration-500 leading-tight ${
                          isShowcased
                            ? 'text-[#2FBF71] bg-emerald-50 border-emerald-200 font-bold'
                            : 'text-slate-500 bg-slate-50 border-slate-200'
                        }`}
                      >
                        {item.service}
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Navigation Controls with Active Progress Fill */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setActiveIdx((activeIdx - 1 + activeList.length) % activeList.length)}
            aria-label="Previous testimonial"
            className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-600 hover:border-[#2FBF71] hover:text-[#2FBF71] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Animated Indicator Pills */}
          <div className="flex items-center gap-2">
            {activeList.map((_, i) => {
              const isSelected = i === activeIdx;
              return (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  aria-label={`Show testimonial ${i + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-700 cursor-pointer ${
                    isSelected
                      ? tab === 'clients'
                        ? 'w-10 bg-[#2FBF71] shadow-xs shadow-emerald-500/40'
                        : 'w-10 bg-[#C9A227] shadow-xs shadow-amber-500/40'
                      : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              );
            })}
          </div>

          <button
            onClick={() => setActiveIdx((activeIdx + 1) % activeList.length)}
            aria-label="Next testimonial"
            className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-600 hover:border-[#2FBF71] hover:text-[#2FBF71] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

      </div>
    </section>
  );
}
