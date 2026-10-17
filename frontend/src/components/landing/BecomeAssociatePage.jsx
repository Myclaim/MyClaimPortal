import { useEffect, useRef, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import FloatingActions from "./FloatingActions";

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function RevealSection({ children, delay = 0, className = "" }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(40px)",
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
    }}>
      {children}
    </div>
  );
}

const SNAKE_ITEMS = [
  { id: 1,  label: "IEPF Claims" },
  { id: 2,  label: "Dematerialization Of Shares" },
  { id: 3,  label: "Transmission of Shares" },
  { id: 4,  label: "Duplicate shares" },
  { id: 5,  label: "UnClaim Shares" },
  { id: 6,  label: "Unclaim Dividend" },
  { id: 7,  label: "Lost shares" },
  { id: 8,  label: "Succession Certification" },
  { id: 9,  label: "Name Deletion" },
  { id: 10, label: "Change of Address" },
  { id: 11, label: "Unlisted shares" },
];

function SnakeNode({ id }) {
  const item = SNAKE_ITEMS.find(i => i.id === id);
  return (
    <div className="flex flex-col items-center gap-3 group">
      <div className="w-12 h-12 rounded-full bg-[#4CAF50] border-2 border-[#2a7a2a] flex items-center justify-center font-black text-white text-lg shadow-md group-hover:scale-110 transition-transform duration-200 z-10">
        {id}
      </div>
      <div className="bg-[#4CAF50] text-white font-bold text-xs px-3 py-2 rounded-xl text-center shadow leading-snug" style={{ maxWidth: 110 }}>
        {item.label}
      </div>
    </div>
  );
}

function WhatWeDoSnake() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4 select-none hidden md:block">
      <div className="text-center mb-14">
        <h2 className="font-serif text-4xl font-bold text-[#1C1C1C]">
          What we <span className="text-[#2FBF71]">Do</span>?
        </h2>
      </div>

      {/* Row 1: 1→2→3→4 */}
      <div className="relative grid grid-cols-4 mb-0">
        {[1,2,3,4].map(id => <SnakeNode key={id} id={id} />)}
        {/* connecting line */}
        <div className="absolute top-6 left-[12.5%] right-[12.5%] h-0.5 border-t-2 border-dashed border-[#2a2a2a] z-0" />
      </div>

      {/* Right bend connector */}
      <div className="relative h-16">
        <div className="absolute right-[12.5%] top-0 bottom-0 w-0.5 border-r-2 border-dashed border-[#2a2a2a]" />
      </div>

      {/* Row 2: 7←6←5 (right-aligned, reversed) */}
      <div className="relative grid grid-cols-4 mb-0">
        <div /> {/* empty first col */}
        {[7,6,5].map(id => <SnakeNode key={id} id={id} />)}
        {/* connecting line across cols 2-4 */}
        <div className="absolute top-6 left-[37%] right-[12.5%] h-0.5 border-t-2 border-dashed border-[#2a2a2a] z-0" />
      </div>

      {/* Left bend connector */}
      <div className="relative h-16">
        <div className="absolute left-[12.5%] top-0 bottom-0 w-0.5 border-l-2 border-dashed border-[#2a2a2a]" />
      </div>

      {/* Row 3: 8→9→10→11 with arrow */}
      <div className="relative grid grid-cols-4 mb-0">
        {[8,9,10,11].map(id => <SnakeNode key={id} id={id} />)}
        {/* connecting line */}
        <div className="absolute top-6 left-[12.5%] right-[12.5%] h-0.5 border-t-2 border-dashed border-[#2a2a2a] z-0" />
        {/* Arrow on right */}
        <div className="absolute top-[18px] right-[10%] text-[#2a2a2a] font-bold text-lg leading-none">→</div>
      </div>

      <div className="text-center mt-12">
        <span className="inline-block bg-[#4CAF50] text-white font-bold px-6 py-2 rounded-xl shadow text-sm">
          www.myclaimindia.com
        </span>
      </div>
    </div>
  );
}

function WhatWeDoMobile() {
  return (
    <div className="md:hidden py-12 px-8">
      <div className="text-center mb-10">
        <h2 className="font-serif text-3xl font-bold text-[#1C1C1C]">
          What we <span className="text-[#2FBF71]">Do</span>?
        </h2>
      </div>
      <div className="relative border-l-2 border-dashed border-slate-300 ml-5 space-y-8 pl-10">
        {SNAKE_ITEMS.map(item => (
          <div key={item.id} className="relative">
            <div className="absolute -left-[52px] top-0 w-11 h-11 rounded-full bg-[#4CAF50] border-2 border-[#2a7a2a] flex items-center justify-center font-black text-white text-base shadow">
              {item.id}
            </div>
            <span className="bg-[#4CAF50] text-white font-bold text-sm px-4 py-2 rounded-xl inline-block shadow">
              {item.label}
            </span>
          </div>
        ))}
      </div>
      <div className="text-center mt-12">
        <span className="inline-block bg-[#4CAF50] text-white font-bold px-5 py-2 rounded-xl shadow text-sm">
          www.myclaimindia.com
        </span>
      </div>
    </div>
  );
}

export default function BecomeAssociatePage({ onOpenLogin }) {
  const [heroVisible, setHeroVisible] = useState(false);
  useEffect(() => { setTimeout(() => setHeroVisible(true), 100); }, []);

  const [partnerData, setPartnerData] = useState({
    name: '',
    email: '',
    countryCode: '+91',
    contact: '',
    city: '',
    address: '',
    pinCode: '',
    country: '',
    state: '',
    profession: '',
    referredBy: ''
  });
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handlePartnerSubmit = (e) => {
    e.preventDefault();
    if (!partnerData.name || !partnerData.contact) {
      alert('Please fill out Name and Contact number.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setPartnerSubmitted(true);
    }, 600);
  };

  return (
    <div className="font-sans bg-white min-h-screen text-[#1C1C1C] selection:bg-[#2FBF71] selection:text-white">
      <Header onOpenLogin={onOpenLogin} />

      {/* Hero with Smartphone Frame */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-[#F8F9FB] pt-36 sm:pt-42 pb-16 overflow-hidden">
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-12 right-1/4 w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-[140px]" />
          <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-amber-100/40 rounded-full blur-[140px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Heading and Value */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-[#2FBF71] text-xs font-bold uppercase tracking-widest border border-emerald-200">
              ✦ Official Channel Partner Program
            </span>
            
            <h1 className="font-serif text-4xl sm:text-5xl xl:text-6xl font-bold text-[#1C1C1C] leading-tight">
              Become an <span className="text-[#2FBF71]">Associate</span> Partner
            </h1>
            
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
              Partner with India's leading unclaimed asset recovery network. Help your clients recover dormant shares, IEPF refunds, and mutual funds while earning high success-linked revenue.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 w-full max-w-lg">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-left">
                <div className="text-xl font-bold text-[#2FBF71]">100%</div>
                <div className="text-xs text-slate-500 font-medium">Filing Handled By Us</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-left">
                <div className="text-xl font-bold text-[#C9A227]">High</div>
                <div className="text-xs text-slate-500 font-medium">Success Payouts</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-left col-span-2 sm:col-span-1">
                <div className="text-xl font-bold text-slate-900">Direct</div>
                <div className="text-xs text-slate-500 font-medium">Client Retainment</div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-1">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#2FBF71]" /> Instant Commission Payout</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#2FBF71]" /> Partner Agreement & NDA</span>
            </div>
          </div>

          {/* Right Column: Smartphone Mockup with Partner Form */}
          <div className="lg:col-span-5 flex flex-col justify-center items-center gap-4">
            
            {/* Smartphone device frame */}
            <div className="relative w-full max-w-[340px] sm:max-w-[370px] bg-[#111827] rounded-[44px] p-3.5 shadow-2xl shadow-slate-900/25 border-4 border-slate-700/80">
              
              {/* Dynamic Island Pill */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-20 flex items-center justify-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              </div>

              {/* Inner Screen */}
              <div className="relative bg-white rounded-[34px] overflow-hidden border border-slate-200/90 flex flex-col justify-between min-h-[580px] pt-10 pb-6 px-5 sm:px-6">
                
                {/* Status Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-[#C9A227] flex items-center justify-center text-white text-xs font-bold">
                      A
                    </div>
                    <span className="text-xs font-bold text-slate-900">Partner Desk</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-[#C9A227] border border-amber-200">
                    Apply Now
                  </span>
                </div>

                {/* Form Content */}
                {partnerSubmitted ? (
                  <div className="py-8 text-center my-auto animate-fadeIn px-2">
                    <div className="w-16 h-16 bg-amber-100 text-[#C9A227] rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold shadow-md">
                      ✓
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1.5">Registration Received!</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-6">
                      Thank you, <strong className="text-slate-800">{partnerData.name}</strong>. Your details have been submitted to the Partner Desk. We will call you on {partnerData.countryCode} {partnerData.contact} shortly.
                    </p>
                    <button
                      onClick={() => {
                        setPartnerSubmitted(false);
                        setPartnerData({
                          name: '', email: '', countryCode: '+91', contact: '',
                          city: '', address: '', pinCode: '', country: '',
                          state: '', profession: '', referredBy: ''
                        });
                      }}
                      className="w-full py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Register Another Associate
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col h-full py-1">
                    <div className="text-center mb-3">
                      <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                        Enter Your Details
                      </h2>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Fill out the details below to join as an associate
                      </p>
                    </div>

                    <form onSubmit={handlePartnerSubmit} className="space-y-3 overflow-y-auto max-h-[440px] pr-1.5 scrollbar-thin">
                      
                      {/* Name */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Name:
                        </label>
                        <input
                          type="text"
                          required
                          value={partnerData.name || ''}
                          onChange={(e) => setPartnerData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter your Name"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:bg-white transition-all"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Email:
                        </label>
                        <input
                          type="email"
                          required
                          value={partnerData.email || ''}
                          onChange={(e) => setPartnerData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter your Email Address"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:bg-white transition-all"
                        />
                      </div>

                      {/* Contact */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Contact:
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={partnerData.countryCode || '+91'}
                            onChange={(e) => setPartnerData(prev => ({ ...prev, countryCode: e.target.value }))}
                            className="bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                          >
                            <option value="+91">🇮🇳 +91</option>
                            <option value="+1">🇺🇸 +1</option>
                            <option value="+44">🇬🇧 +44</option>
                            <option value="+971">🇦🇪 +971</option>
                            <option value="+65">🇸🇬 +65</option>
                            <option value="+61">🇦🇺 +61</option>
                          </select>
                          <input
                            type="tel"
                            required
                            value={partnerData.contact || ''}
                            onChange={(e) => setPartnerData(prev => ({ ...prev, contact: e.target.value.replace(/\D/g, '') }))}
                            placeholder="(201) 555-0123"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:bg-white transition-all flex-1"
                          />
                        </div>
                      </div>

                      {/* City */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          City:
                        </label>
                        <input
                          type="text"
                          value={partnerData.city || ''}
                          onChange={(e) => setPartnerData(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="Enter your City Name"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:bg-white transition-all"
                        />
                      </div>

                      {/* Address */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Address:
                        </label>
                        <input
                          type="text"
                          value={partnerData.address || ''}
                          onChange={(e) => setPartnerData(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Enter your Address"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:bg-white transition-all"
                        />
                      </div>

                      {/* Pin Code */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Pin Code:
                        </label>
                        <input
                          type="text"
                          value={partnerData.pinCode || ''}
                          onChange={(e) => setPartnerData(prev => ({ ...prev, pinCode: e.target.value }))}
                          placeholder="Enter your Pin Code"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:bg-white transition-all"
                        />
                      </div>

                      {/* Country */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Country:
                        </label>
                        <input
                          type="text"
                          value={partnerData.country || ''}
                          onChange={(e) => setPartnerData(prev => ({ ...prev, country: e.target.value }))}
                          placeholder="Enter your Country"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:bg-white transition-all"
                        />
                      </div>

                      {/* State */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          State:
                        </label>
                        <input
                          type="text"
                          value={partnerData.state || ''}
                          onChange={(e) => setPartnerData(prev => ({ ...prev, state: e.target.value }))}
                          placeholder="Enter your State"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:bg-white transition-all"
                        />
                      </div>

                      {/* Nature Of Profession/Business */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Nature Of Profession/Business:
                        </label>
                        <select
                          value={partnerData.profession || ''}
                          onChange={(e) => setPartnerData(prev => ({ ...prev, profession: e.target.value }))}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:bg-white transition-all"
                        >
                          <option value="">Select your Profession</option>
                          <option value="Stock broker">Stock broker</option>
                          <option value="Sub broker">Sub broker</option>
                          <option value="CA/CS/CFA/MBA">CA/CS/CFA/MBA</option>
                          <option value="DP manager">DP manager</option>
                          <option value="Wealth/Investment Advisor">Wealth/Investment Advisor</option>
                          <option value="LIC/Insurance Agent">LIC/Insurance Agent</option>
                          <option value="Mutual fund Distributor">Mutual fund Distributor</option>
                          <option value="Financial Trainer">Financial Trainer</option>
                          <option value="Consultants">Consultants</option>
                          <option value="Financial influencers">Financial influencers</option>
                          <option value="Others">Others</option>
                        </select>
                      </div>

                      {/* Reffered By */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Reffered By:
                        </label>
                        <input
                          type="text"
                          value={partnerData.referredBy || ''}
                          onChange={(e) => setPartnerData(prev => ({ ...prev, referredBy: e.target.value }))}
                          placeholder="Reffered By"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:bg-white transition-all"
                        />
                      </div>

                      {/* Register Button */}
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full mt-2 py-3 bg-[#4CAF50] hover:bg-[#3d9e40] text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-500/25 transition-all hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {submitting ? 'Submitting...' : 'Register'}
                      </button>
                    </form>
                  </div>
                )}

                {/* Bottom Phone Indicator */}
                <div className="pt-2 text-center border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="2.5">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Authorized Associate Agreement
                  </span>
                  <div className="w-24 h-1 bg-slate-300 rounded-full mx-auto mt-2" />
                </div>

              </div>
            </div>

            {/* Download MyClaim App bar matching user screenshot reference */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-1">
              <span className="text-sm font-medium text-slate-800">
                Download MyClaim App
              </span>
              <a
                href="#google-play"
                onClick={(e) => { e.preventDefault(); alert('MyClaim India Google Play link is opening...'); }}
                className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-sm hover:shadow transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Google Play</span>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </a>
              <a
                href="#app-store"
                onClick={(e) => { e.preventDefault(); alert('MyClaim India App Store link is opening...'); }}
                className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-sm hover:shadow transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>App Store</span>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.9.04-2 .6-2.63 1.34-.56.64-.97 1.7-0.85 2.73 1.01.08 2.04-.51 2.56-1.2" />
                </svg>
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* Snake What We Do */}
      <section className="bg-[#fafaf8] border-y border-slate-200/80">
        <RevealSection>
          <WhatWeDoSnake />
          <WhatWeDoMobile />
        </RevealSection>
      </section>

      {/* Target Audiences */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <RevealSection className="text-center mb-16">
            <p className="text-[#2FBF71] text-xs font-bold uppercase tracking-widest mb-3">Who Can Join</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1C1C1C]">MyClaim India <span className="text-[#2FBF71]">Associates</span></h2>
          </RevealSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Financial Services Provider", icon: "🏦", items: ["Stockbrokers","Investment Banks","Asset Management Firms","Insurance Companies","Brokerage Houses","Pension Funds","Mutual Fund Companies","Credit Rating Agencies","Financial Advisory Firms","Hedge Funds"] },
              { title: "Professional", icon: "⚖️", items: ["Financial Consultants","Chartered Accountants","Tax Advisors","Investment Advisors","Wealth Managers","Stockbrokers","Financial Planners","Credit Analysts","Loan Officers","Insurance Agents"] },
              { title: "Financial Business Owner", icon: "💼", items: ["CPA Institute Members","MSW Trainers","Financial Educators","Providers","Investment Training Firms","Wealth Management Coaches","Financial Certification Counsel Providers","Professional Financial Networks","Stock Market Training Institutions"] },
              { title: "Others", icon: "🌟", items: ["Content Creators","Retired Bankers","Insurance Consultants","Brokers","Investment Coaches","LIC Agents","Mutual Fund Distributors","Financial Bloggers","Real Estate Brokers","Financial Influencers"] }
            ].map((col, i) => (
              <RevealSection key={col.title} delay={i * 0.1}>
                <div className="bg-white rounded-3xl p-8 border border-slate-200/80 hover:shadow-xl hover:border-[#2FBF71]/30 transition-all duration-300 h-full">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl mb-6 shadow-inner">{col.icon}</div>
                  <h3 className="text-[#1C1C1C] font-bold text-lg mb-5 leading-snug">{col.title}</h3>
                  <ul className="space-y-3">
                    {col.items.map(item => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                        <svg className="w-4 h-4 text-[#2FBF71] mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Mutual Growth Steps */}
      <section className="py-24 bg-[#F8F9FB] border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6">
          <RevealSection className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1C1C1C]">Step Towards <span className="text-[#2FBF71]">Mutual Growth</span></h2>
          </RevealSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Expand Your Clientele", icon: "🤝" },
              { title: "Ensure Rewards On Conversions", icon: "🏆" },
              { title: "Unlock High Commission Rate", icon: "💰" },
              { title: "Limitless Opportunity For Business Expansion", icon: "🚀" }
            ].map((step, i) => (
              <RevealSection key={step.title} delay={i * 0.1}>
                <div className="bg-white rounded-3xl p-8 border border-slate-200/80 text-center h-full hover:-translate-y-1 transition-transform duration-300 hover:shadow-lg flex flex-col items-center justify-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-4xl mb-2">{step.icon}</div>
                  <h3 className="text-[#1C1C1C] font-bold text-sm sm:text-base leading-snug">{step.title}</h3>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* What We Need From You */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <RevealSection className="text-center mb-20">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1C1C1C]">What We <span className="text-[#2FBF71]">Need</span> From You?</h2>
            <div className="w-12 h-1 bg-gradient-to-r from-[#2FBF71] to-[#C9A227] rounded-full mx-auto my-6" />
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
              All we need is that you use your current social network and our comprehensive database to locate investors who have unclaimed or forgotten investments and help them retrieve their priceless asset.
            </p>
          </RevealSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 text-center">
            {[
              { title: "No Investments", desc: "To be affiliated with myclaimindia, you do not need to make any financial investments. One's most valuable asset is their time!!" },
              { title: "No Time Commitments", desc: "MyclaimIndia can be a side hustle for you. You can pursue the same with other engagements." },
              { title: "No Experience", desc: "All we require is for you to be somewhat of a decent salesperson and to have a basic understanding of the financial market." }
            ].map((req, i) => (
              <RevealSection key={req.title} delay={i * 0.15}>
                <div className="pt-8 md:pt-0 md:px-8">
                  <h3 className="text-xl font-bold text-[#1C1C1C] mb-4">{req.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{req.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Access To Checklist */}
      <section className="py-24 bg-[#F8F9FB] border-t border-slate-200/80">
        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center">
          <RevealSection className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1C1C1C] leading-tight">
              With Our <span className="text-[#2FBF71]">Partnership Program</span><br/>You Will Have Access To
            </h2>
          </RevealSection>
          <div className="w-full bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xl shadow-emerald-500/5">
            <div className="space-y-6">
              {[
                { title: "Product Training", desc: "Learn about our products from our well trained experts. By improving your management and communication abilities, you may better service your clients' needs while also growing personally." },
                { title: "Assistance for Sales", desc: "" },
                { title: "Operational Transparency", desc: "" },
                { title: "Associate Panel", desc: "" },
                { title: "Non-Industry Specific", desc: "" }
              ].map((item, i) => (
                <RevealSection key={item.title} delay={i * 0.1}>
                  <div className="flex items-start gap-4 border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                    <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    </div>
                    <div>
                      <h4 className="text-[#1C1C1C] font-bold text-lg">{item.title}</h4>
                      {item.desc && <p className="text-slate-500 text-sm mt-2 leading-relaxed max-w-2xl">{item.desc}</p>}
                    </div>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <FloatingActions />
    </div>
  );
}
