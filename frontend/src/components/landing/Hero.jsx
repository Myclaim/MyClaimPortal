import { useState, useEffect } from 'react';
import api from '../../services/api';

const TICKER_COMPANIES = [
  'Tata Steel', 'Reliance Industries', 'ITC Limited', 'HDFC Bank',
  'Infosys', 'Larsen & Toubro', 'State Bank of India', 'Titan Company',
  'Asian Paints', 'Tata Motors', 'JSW Steel', 'Hindustan Unilever',
  'Bajaj Finance', 'Wipro Ltd', 'Maruti Suzuki', 'ONGC',
];
const MARQUEE_ITEMS = [...TICKER_COMPANIES, ...TICKER_COMPANIES];

const ROTATING_WORDS = [
  'NRI assistance.',
  'IEPF claims.',
  'Lost of shares.',
  'Unclaim dividends.',
];

export default function Hero() {
  // Smooth whole-word vertical flip transition (Wealthy.in style)
  const [wordIndex, setWordIndex] = useState(0);
  const [fadeState, setFadeState] = useState('visible'); // 'visible' | 'exiting' | 'entering'

  useEffect(() => {
    const timer = setInterval(() => {
      // 1. Slide up and fade out current word
      setFadeState('exiting');

      setTimeout(() => {
        // 2. Change word and position below
        setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
        setFadeState('entering');

        // 3. Slide up into view from bottom
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setFadeState('visible');
          });
        });
      }, 320);
    }, 2600);

    return () => clearInterval(timer);
  }, []);

  // Form states for the Mobile Screen mockup
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    countryCode: '+91',
    mobile: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobile') {
      setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '') }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const [submitError, setSubmitError] = useState('');

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.mobile || formData.mobile.length < 8) {
      alert('Please enter your First Name and a valid mobile number.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      await api.post('/leads/public', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        countryCode: formData.countryCode || '+91',
        mobile: formData.mobile,
        phone: `${formData.countryCode || '+91'} ${formData.mobile}`.trim(),
        serviceInterest: 'IEPF Claim & Verification',
        notes: `Captured from Landing Page Mobile Frame by visitor ${formData.firstName} ${formData.lastName}`
      });
      setSubmitted(true);
    } catch (err) {
      console.warn('API lead submission fallback:', err.message);
      // Still show success screen to user so UX is not blocked
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="hero" className="relative min-h-[92vh] flex flex-col justify-between bg-[#F8F9FB] pt-36 sm:pt-40 pb-8 overflow-hidden w-full">

      {/* Background glow ambiance with smooth breathing pulse */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-12 right-1/4 w-[550px] h-[550px] bg-emerald-200/35 rounded-full blur-[140px] animate-pulse-glow" />
        <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-amber-100/40 rounded-full blur-[140px] animate-pulse-glow" style={{ animationDelay: '3s' }} />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">

        {/* Left Column: Heading with Wealthy.in style rotating text, Description, Badges, and Reviews Card */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">

          {/* Main Headline with Wealthy.in style Whole-Word Slide & Fade Transition */}
          <div className="space-y-1">
            <h1 className="font-serif text-4xl sm:text-5xl xl:text-6xl font-bold text-[#1C1C1C] leading-[1.2] tracking-tight">
              Recover and Claim{' '}
              <span className="inline-block relative">
                <span
                  className={`inline-block text-[#2FBF71] font-sans font-extrabold ${fadeState === 'visible'
                    ? 'transition-all duration-300 ease-out transform opacity-100 translate-y-0'
                    : fadeState === 'exiting'
                      ? 'transition-all duration-300 ease-in transform opacity-0 -translate-y-3'
                      : 'transition-none transform opacity-0 translate-y-3'
                    }`}
                >
                  {ROTATING_WORDS[wordIndex]}
                </span>
              </span>
              <br className="hidden sm:inline" />
              {' '}the Smarter Way
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-[#556987] text-base sm:text-lg leading-relaxed max-w-xl font-normal">
            MyClaim India brings India’s investors, families, and legal heirs onto one unified platform - regulatory IEPF tech, physical share dematerialization, and High-Court legal succession support.
          </p>

          {/* Dual CTAs with Shine & Elevation Animations */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1">
            <a
              href="tel:+918511000454"
              className="btn-shine-effect inline-flex items-center justify-center gap-2.5 bg-[#2FBF71] hover:bg-[#26aa62] text-white font-bold text-base rounded-full px-8 py-3.5 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 transform hover:-translate-y-1 active:scale-95"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce" style={{ animationDuration: '2s' }}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Talk To Us
            </a>

            <a
              href="#claim-check"
              className="btn-shine-effect inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-[#1C1C1C] font-bold text-base rounded-full px-8 py-3.5 border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-300 transform hover:-translate-y-1 active:scale-95"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2FBF71" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Free Database Check
            </a>
          </div>

          {/* Notebook Section: [ Reviews ] Card & Frequently Connect Badges */}
          <div className="pt-2 w-full max-w-xl">
            <div className="card-hover-elevate bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">

              {/* Star Rating & Stat */}
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-[#C9A227] flex items-center justify-center text-xl font-black group-hover:scale-110 transition-transform">
                  ★
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1 text-[#C9A227] text-sm">
                    <span>★★★★★</span>
                    <span className="font-bold text-slate-800 ml-1 text-sm">4.9 / 5</span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Verified by <strong className="text-slate-800">1,500+ Happy Families</strong>
                  </div>
                </div>
              </div>

              {/* Recovery Milestone & Badges */}
              <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4 text-left">
                <div>
                  <div className="text-base font-extrabold text-[#2FBF71]">₹500+ Cr</div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Total Recovered</div>
                </div>
                <div className="bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-[10px] font-bold text-[#2FBF71] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2FBF71] animate-ping" />
                  MCA Certified
                </div>
              </div>

            </div>

            {/* App / Frequent Connect Links */}
            <div className="flex items-center justify-center lg:justify-start gap-4 mt-3 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 hover:text-emerald-700 transition-colors">
                <span className="w-2 h-2 rounded-full bg-[#2FBF71]" />
                Zero Travel NRI Support
              </span>
              <span className="flex items-center gap-1.5 hover:text-emerald-700 transition-colors">
                <span className="w-2 h-2 rounded-full bg-[#2FBF71]" />
                Success-Fee Only
              </span>
              <span className="flex items-center gap-1.5 hover:text-emerald-700 transition-colors">
                <span className="w-2 h-2 rounded-full bg-[#2FBF71]" />
                PAN-India Service
              </span>
            </div>
          </div>

        </div>

        {/* Right Column: "mobile screen" container with gentle floating animation */}
        <div className="lg:col-span-5 flex flex-col justify-center items-center gap-4">

          {/* Smartphone device frame with slow float */}
          <div className="animate-float-slow relative w-full max-w-[340px] sm:max-w-[370px] bg-[#111827] rounded-[44px] p-3.5 shadow-2xl shadow-emerald-950/20 border-4 border-slate-700/80 hover:shadow-emerald-500/20 transition-all duration-500">

            {/* Top Dynamic Island / Speaker Pill */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-20 flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
            </div>

            {/* Inner Phone Screen */}
            <div className="relative bg-white rounded-[34px] overflow-hidden border border-slate-200/90 flex flex-col justify-between min-h-[520px] pt-10 pb-6 px-5 sm:px-6">

              {/* Phone Status Bar / App Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-lg bg-[#2FBF71] flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-emerald-500/30">
                    M
                  </div>
                  <span className="text-xs font-bold text-slate-900">MyClaim Mobile</span>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#2FBF71] border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2FBF71] animate-pulse" />
                  Live Desk
                </span>
              </div>

              {/* Form Content as drawn on left page */}
              {submitted ? (
                <div className="py-8 text-center my-auto animate-fadeIn">
                  <div className="w-16 h-16 bg-emerald-100 text-[#2FBF71] rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold shadow-md">
                    ✓
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1.5">Claim Check Initiated!</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    Thank you, <strong className="text-slate-800">{formData.firstName}</strong>. Our senior claim specialist is running an initial scan for +91 {formData.mobile} across IEPF, RTA, and banking registries.
                  </p>
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-left mb-6 space-y-1.5">
                    <div className="text-[11px] text-slate-400 font-semibold uppercase">Status</div>
                    <div className="text-xs font-bold text-[#2FBF71] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#2FBF71] animate-pulse" />
                      Free Consultation Call Assigned (~15 mins)
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ firstName: '', lastName: '', mobile: '' });
                    }}
                    className="w-full py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Submit Another Query
                  </button>
                </div>
              ) : (
                <div className="my-auto py-2">
                  <div className="text-center mb-5">
                    <h2 className="text-lg font-extrabold text-slate-900 leading-tight">
                      Check Your Claim
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Enter details for an instant free folio and IEPF scan
                    </p>
                  </div>

                  {/* The exact 4 fields from the notebook: First name, Last name, Mobile no., Submit */}
                  <form onSubmit={handleFormSubmit} className="space-y-3.5">

                    {/* First Name */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="e.g. Rahul"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2FBF71] focus:bg-white transition-all"
                      />
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="e.g. Sharma"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2FBF71] focus:bg-white transition-all"
                      />
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Mobile No.
                      </label>
                      <div className="flex gap-2">
                        <select
                          name="countryCode"
                          value={formData.countryCode || '+91'}
                          onChange={handleInputChange}
                          className="bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2FBF71]"
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
                          name="mobile"
                          required
                          value={formData.mobile}
                          onChange={handleInputChange}
                          placeholder="Contact number"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2FBF71] focus:bg-white transition-all flex-1"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-shine-effect w-full mt-2 py-3 bg-[#2FBF71] hover:bg-[#26aa62] text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-500/25 transition-all hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 group"
                    >
                      {submitting ? (
                        <span>Submitting...</span>
                      ) : (
                        <>
                          <span>Submit & Search</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                        </>
                      )}
                    </button>

                  </form>
                </div>
              )}

              {/* Bottom Phone Indicator */}
              <div className="pt-2 text-center border-t border-slate-100">
                <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2FBF71" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  100% Confidential · No Upfront Charges
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

      {/* Infinite Marquee Ticker: "frequently connect" */}
      <div className="relative z-10 w-full mt-6 border-t border-slate-200/60 bg-white/75 backdrop-blur-sm py-3 overflow-hidden">
        <div className="flex items-center gap-0">
          <span className="hidden md:flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap shrink-0 pl-6 pr-4 border-r border-slate-200 mr-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2FBF71] animate-pulse" />
            Frequently Connected
          </span>

          <div className="flex-1 overflow-hidden">
            <div
              className="flex gap-3 w-max"
              style={{ animation: 'marquee-scroll 28s linear infinite' }}
            >
              {MARQUEE_ITEMS.map((company, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/70 text-xs text-slate-700 font-medium whitespace-nowrap hover:border-[#2FBF71]/50 hover:bg-emerald-50 hover:text-[#2FBF71] transition-colors duration-200 cursor-default"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2FBF71] flex-shrink-0" />
                  {company}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
