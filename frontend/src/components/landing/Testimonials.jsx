import { useState } from 'react';

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
  const [idx, setIdx] = useState(0);

  const activeList = tab === 'clients' ? clientTestimonials : partnerTestimonials;

  return (
    <section id="testimonials" className="py-24 bg-[#F8F9FB] border-b border-slate-200/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-[#2FBF71] text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-300/60">
            ✦ Real Experiences & Partner Trust
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-[#1C1C1C] mb-4">
            Testimonials & <span className="text-[#2FBF71]">Reviews</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto">
            Words of trust from the families we have restored wealth for, and the professional associates who partner with us.
          </p>

          {/* Tab Switcher matching notebook: [for partner] */}
          <div className="flex bg-white p-1.5 rounded-full border border-slate-200/90 shadow-sm max-w-xs sm:max-w-sm mx-auto mt-6">
            <button
              onClick={() => { setTab('clients'); setIdx(0); }}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-full transition-all ${
                tab === 'clients'
                  ? 'bg-[#2FBF71] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Client Stories
            </button>
            <button
              onClick={() => { setTab('partners'); setIdx(0); }}
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

        {/* Testimonial Card */}
        <div className="card-hover-elevate relative p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/90 shadow-xl overflow-hidden">
          <div className="animate-float-soft absolute top-6 left-8 text-8xl text-emerald-100/80 font-serif leading-none select-none pointer-events-none">
            “
          </div>
          
          <div key={`${tab}-${idx}`} className="animate-fade-in-scale relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-1 text-[#C9A227] text-xl">
                {[...Array(5)].map((_, i) => <span key={i} className="hover:scale-125 transition-transform cursor-default">★</span>)}
              </div>
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                tab === 'clients' 
                  ? 'bg-emerald-50 text-[#2FBF71] border-emerald-200' 
                  : 'bg-amber-50 text-[#C9A227] border-amber-200'
              }`}>
                {tab === 'clients' ? 'Verified Claimant' : 'Certified Channel Partner'}
              </span>
            </div>
            
            <p className="text-slate-700 text-base sm:text-xl leading-relaxed mb-8 italic font-normal min-h-[90px]">
              "{activeList[idx].text}"
            </p>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md transition-transform hover:scale-105 ${
                  tab === 'clients'
                    ? 'bg-gradient-to-br from-[#2FBF71] to-[#1e8a4f]'
                    : 'bg-gradient-to-br from-[#C9A227] to-[#8a6e19]'
                }`}>
                  {activeList[idx].initials}
                </div>
                <div>
                  <p className="text-[#1C1C1C] font-bold text-base">{activeList[idx].name}</p>
                  <p className="text-slate-500 text-xs sm:text-sm">{activeList[idx].role}</p>
                </div>
              </div>

              <div className="sm:text-right">
                <span className="inline-block text-xs font-semibold text-[#2FBF71] bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 hover:bg-emerald-100/60 transition-colors">
                  {activeList[idx].service}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Controls */}
        <div className="flex items-center justify-center gap-6 mt-8">
          <button 
            onClick={() => setIdx((idx - 1 + activeList.length) % activeList.length)}
            aria-label="Previous testimonial"
            className="w-11 h-11 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:border-[#2FBF71] hover:text-[#2FBF71] hover:scale-110 active:scale-95 transition-all duration-200"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div className="flex gap-2">
            {activeList.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setIdx(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === idx ? (tab === 'clients' ? 'w-8 bg-[#2FBF71] shadow-sm shadow-emerald-500/40' : 'w-8 bg-[#C9A227] shadow-sm shadow-amber-500/40') : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
          <button 
            onClick={() => setIdx((idx + 1) % activeList.length)}
            aria-label="Next testimonial"
            className="w-11 h-11 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:border-[#2FBF71] hover:text-[#2FBF71] hover:scale-110 active:scale-95 transition-all duration-200"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

      </div>
    </section>
  );
}
