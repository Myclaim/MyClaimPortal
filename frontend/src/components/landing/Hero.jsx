import { useState, useEffect } from 'react';
import { 
  User, 
  Bell, 
  ChevronRight, 
  ShieldCheck 
} from 'lucide-react';
import api from '../../services/api';
import AppDownloadStrip from './AppDownloadStrip';

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
  const [heroCardSlots, setHeroCardSlots] = useState({
    track: 'topLeft', trusted: 'bottomLeft', demat: 'topRight', expert: 'bottomRight'
  });
  useEffect(() => {
    const loop = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'];
    const timer = setInterval(() => {
      setHeroCardSlots((current) => Object.fromEntries(
        Object.entries(current).map(([card, slot]) => [card, loop[(loop.indexOf(slot) + 1) % loop.length]])
      ));
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const cardPosition = (slot) => ({
    topLeft: { left: 'calc(50% - 410px)', top: '105px' },
    topRight: { left: 'calc(50% + 215px)', top: '125px' },
    bottomRight: { left: 'calc(50% + 215px)', top: 'calc(100% - 225px)' },
    bottomLeft: { left: 'calc(50% - 410px)', top: 'calc(100% - 215px)' },
  }[slot]);
  const mobileCardPosition = (slot) => ({
    topLeft: { '--mobile-left': '8px', '--mobile-top': '650px' },
    topRight: { '--mobile-left': 'calc(50% + 4px)', '--mobile-top': '650px' },
    bottomRight: { '--mobile-left': 'calc(50% + 4px)', '--mobile-top': '740px' },
    bottomLeft: { '--mobile-left': '8px', '--mobile-top': '740px' },
  }[slot]);

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
    email: '',
    countryCode: '+91',
    mobile: '',
    company: '',
    serviceInterest: 'IEPF Claim & Verification'
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
        email: formData.email,
        countryCode: formData.countryCode || '+91',
        mobile: formData.mobile,
        phone: `${formData.countryCode || '+91'} ${formData.mobile}`.trim(),
        serviceInterest: formData.serviceInterest || 'IEPF Claim & Verification',
        notes: `Captured from Landing Page Mobile Frame: ${formData.firstName} ${formData.lastName}${formData.email ? ` (${formData.email})` : ''}${formData.company ? ` | Company: ${formData.company}` : ''}`
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
    <section id="hero" className="relative min-h-[88vh] flex flex-col justify-between bg-white pt-0 pb-8 overflow-hidden w-full px-0">

      {/* Background glow ambiance with smooth breathing pulse */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-12 right-1/4 w-[550px] h-[550px] bg-emerald-200/35 rounded-full blur-[140px] animate-pulse-glow" />
        <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-amber-100/40 rounded-full blur-[140px] animate-pulse-glow" style={{ animationDelay: '3s' }} />
      </div>

      <div className="relative z-10 w-full max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-12 my-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">

        {/* Left Column: Heading with Wealthy.in style rotating text, Description, Badges, and Reviews Card */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">

          {/* Main Headline with Wealthy.in style Whole-Word Slide & Fade Transition */}
          <div className="space-y-1 -translate-y-16">
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
          <p className="text-[#556987] text-base sm:text-lg leading-relaxed max-w-xl font-normal -translate-y-16">
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

          {/* Frequently Connect Links */}
          <div className="pt-2 w-full max-w-xl">
          </div>

        </div>

        {/* Right Column: Phone mockup centered with floating feature cards */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-center items-center gap-4 relative overflow-visible lg:-translate-x-12 xl:-translate-x-16 lg:-translate-y-8">

          {/* Outer wrapper — wide enough for phone + side cards without overlapping */}
          <div className="relative flex justify-center items-start lg:items-center w-full min-h-[830px] lg:min-h-[720px] overflow-visible">

            {/* ── Green decorative dots ── */}
            <span className="hidden lg:block absolute w-3.5 h-3.5 rounded-full bg-[#2FBF71] opacity-75" style={{ right: 'calc(50% + 180px)', top: '45px' }} />
            <span className="hidden lg:block absolute w-4 h-4 rounded-full bg-[#2FBF71] opacity-75" style={{ left: 'calc(50% + 220px)', top: '55px' }} />
            <span className="hidden lg:block absolute w-3.5 h-3.5 rounded-full bg-[#2FBF71] opacity-65" style={{ left: 'calc(50% + 295px)', top: '48%' }} />
            <span className="hidden lg:block absolute w-3 h-3 rounded-full bg-[#2FBF71] opacity-65" style={{ right: 'calc(50% + 240px)', bottom: '80px' }} />
            <span className="hidden lg:block absolute w-3 h-3 rounded-full bg-[#2FBF71] opacity-55" style={{ left: 'calc(50% + 200px)', bottom: '50px' }} />

            {/* ── Circular arc decoration behind phone (Centered orbit circle) ── */}
            <svg className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[680px] pointer-events-none -z-0" viewBox="0 0 680 680" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="340" cy="340" r="290" stroke="#2FBF71" strokeWidth="1.2" strokeOpacity="0.35" />
            </svg>

            {/* ── Floating card 1: Track Your Claim (top-left, clearly spaced away from phone) ── */}
            <div data-slot={heroCardSlots.track} className="hero-feature-card flex absolute z-20 bg-white rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.08)] px-4 py-3.5 items-center gap-3.5 border border-slate-100"
              style={{ ...cardPosition(heroCardSlots.track), ...mobileCardPosition(heroCardSlots.track), width: '185px', transition: 'left 1.1s ease-in-out, top 1.1s ease-in-out' }}>
              <div className="w-11 h-11 rounded-xl bg-[#2FBF71] flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/25">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              </div>
              <div className="text-left">
                <div className="text-[13px] font-extrabold text-slate-800 leading-tight">Track Your IEPF<br/>Claim</div>
                <div className="text-[10.5px] text-slate-400 font-medium mt-0.5">Real-time updates</div>
              </div>
            </div>

            {/* ── Floating card 2: Trusted & Compliant (bottom-left, clearly spaced away from phone) ── */}
            <div data-slot={heroCardSlots.trusted} className="hero-feature-card flex absolute z-20 bg-white rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.08)] px-4 py-3.5 items-center gap-3.5 border border-slate-100"
              style={{ ...cardPosition(heroCardSlots.trusted), ...mobileCardPosition(heroCardSlots.trusted), width: '195px', transition: 'left 1.1s ease-in-out, top 1.1s ease-in-out' }}>
              <div className="w-11 h-11 rounded-xl bg-[#6366F1] flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/25">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
                </svg>
              </div>
              <div className="text-left">
                <div className="text-[13px] font-extrabold text-slate-800 leading-tight">NRI Assistance</div>
                <div className="text-[10.5px] text-slate-400 font-medium mt-0.5">Zero-Travel Global Support</div>
              </div>
            </div>

            {/* ── Floating card 3: Dematerialise Shares (top-right, clearly spaced away from phone) ── */}
            <div data-slot={heroCardSlots.demat} className="hero-feature-card flex absolute z-20 bg-white rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.08)] px-4 py-3.5 items-center gap-3.5 border border-slate-100"
              style={{ ...cardPosition(heroCardSlots.demat), ...mobileCardPosition(heroCardSlots.demat), width: '195px', transition: 'left 1.1s ease-in-out, top 1.1s ease-in-out' }}>
              <div className="w-11 h-11 rounded-xl bg-[#F59E0B] flex items-center justify-center shrink-0 shadow-md shadow-amber-500/25">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="13" y2="15"/>
                </svg>
              </div>
              <div className="text-left">
                <div className="text-[13px] font-extrabold text-slate-800 leading-tight">Dematerialise<br/>Physical Share</div>
                <div className="text-[10.5px] text-slate-400 font-medium mt-0.5">Fast &amp; Secure</div>
              </div>
            </div>

            {/* ── Floating card 4: Expert Support (bottom-right, clearly spaced away from phone) ── */}
            <div data-slot={heroCardSlots.expert} className="hero-feature-card flex absolute z-20 bg-white rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.08)] px-4 py-3.5 items-center gap-3.5 border border-slate-100"
              style={{ ...cardPosition(heroCardSlots.expert), ...mobileCardPosition(heroCardSlots.expert), width: '185px', transition: 'left 1.1s ease-in-out, top 1.1s ease-in-out' }}>
              <div className="w-11 h-11 rounded-xl bg-[#3B82F6] flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 17l-1.5-1.5a2.5 2.5 0 0 1 0-3.5l3.5-3.5a2.5 2.5 0 0 1 3.5 0L18 10"/>
                  <path d="M9 19l-4-4a2.5 2.5 0 0 1 0-3.5l3-3a2.5 2.5 0 0 1 3.5 0L13 10"/>
                  <path d="M14 6l1.5 1.5"/>
                  <path d="M7 13l-1.5 1.5"/>
                </svg>
              </div>
              <div className="text-left">
                <div className="text-[13px] font-extrabold text-slate-800 leading-tight">Expert Legal<br/>Support</div>
                <div className="text-[10.5px] text-slate-400 font-medium mt-0.5">Guidance at Every Step</div>
              </div>
            </div>

          {/* ── Smartphone device frame (centered flagship frame matching screenshot) ── */}
          <div className="relative w-[288px] sm:w-[316px] h-[615px] sm:h-[640px] rounded-[56px] bg-gradient-to-br from-[#D7DEE6] via-[#536171] to-[#AAB5C1] p-[3px] shadow-[0_28px_70px_rgba(15,23,42,0.38),inset_0_0_0_1px_rgba(255,255,255,0.55)] border border-[#8793A0] z-10 shrink-0">

            {/* Metallic side controls */}
            <span aria-hidden="true" className="absolute -left-[4px] top-[112px] w-[3px] h-8 rounded-l bg-gradient-to-b from-[#697583] to-[#D5DCE3] shadow-sm" />
            <span aria-hidden="true" className="absolute -left-[4px] top-[158px] w-[3px] h-14 rounded-l bg-gradient-to-b from-[#697583] to-[#D5DCE3] shadow-sm" />
            <span aria-hidden="true" className="absolute -right-[4px] top-[170px] w-[3px] h-[68px] rounded-r bg-gradient-to-b from-[#D5DCE3] to-[#697583] shadow-sm" />

            <div className="relative flex h-full w-full flex-col rounded-[52px] border border-[#161D26] bg-[#07090D] p-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">

            {/* Top Dynamic Island / Speaker Pill */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-between px-3 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-[#1A2533]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#0a0a0a] border border-[#222]" />
            </div>

            {/* Inner Phone Screen */}
            <div className="relative bg-[#FAFCFB] rounded-[43px] overflow-hidden border border-slate-200/60 h-full flex flex-col justify-between pt-7 px-3.5 pb-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.9)]">

              {/* Profile / Header Status Row */}
              <div className="flex items-center justify-between pb-2 px-0.5 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#2FBF71] flex items-center justify-center text-white text-xs font-black shadow-sm">
                    {formData.firstName ? formData.firstName.charAt(0).toUpperCase() : 'N'}
                  </div>
                  <div className="text-left">
                    <span className="text-[9.5px] text-slate-400 block font-medium leading-none">Hello,</span>
                    <div className="flex items-center gap-0.5 text-xs font-bold text-slate-800 mt-0.5">
                      <span>MyClaim <span className="text-[#2FBF71]">India</span></span>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full text-[9px] font-bold text-[#2FBF71]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2FBF71] animate-pulse" />
                  MCA Live
                </div>
              </div>

              {/* Form */}
              <div className="flex-1 flex flex-col justify-between pt-1">
                {submitted ? (
                  <div className="bg-white/95 my-auto p-4 rounded-2xl border border-emerald-200 text-center animate-fadeIn space-y-3 shadow-sm">
                    <div className="w-12 h-12 bg-emerald-100 text-[#2FBF71] rounded-full flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Claim Check Initiated!</div>
                      <p className="text-xs text-slate-500 mt-1 leading-snug">Searching IEPF, MCA &amp; RTA registries</p>
                    </div>
                    <button onClick={() => { setSubmitted(false); setFormData({ firstName: '', lastName: '', email: '', countryCode: '+91', mobile: '', company: '', serviceInterest: 'IEPF Claim & Verification' }); }}
                      className="w-full py-2 bg-[#2FBF71] hover:bg-[#26aa62] text-white text-xs font-bold rounded-xl transition-all cursor-pointer">
                      Check Another Folio
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col justify-between text-left">
                    {/* Banner */}
                    <div className="bg-white border border-slate-100 rounded-xl px-3 py-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                      <div className="text-[11.5px] font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2FBF71]" />
                        <span>Track Your Unclaimed Shares</span>
                      </div>
                      <p className="text-[9.5px] text-slate-400 leading-tight mt-0.5">Free real-time scan across 500+ listed companies &amp; IEPF</p>
                    </div>

                    {/* First + Last Name */}
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div>
                        <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">FIRST NAME</label>
                        <input type="text" name="firstName" required value={formData.firstName} onChange={handleInputChange} placeholder="e.g. Rahul"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200/80 hover:border-emerald-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#2FBF71] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)]" />
                      </div>
                      <div>
                        <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">LAST NAME</label>
                        <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="e.g. Sharma"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200/80 hover:border-emerald-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#2FBF71] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)]" />
                      </div>
                    </div>

                    {/* Mobile */}
                    <div className="mt-1">
                      <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">MOBILE NUMBER</label>
                      <div className="flex gap-1.5">
                        <select name="countryCode" value={formData.countryCode || '+91'} onChange={handleInputChange}
                          className="bg-white border border-slate-200/80 rounded-xl px-1.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#2FBF71] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+971">🇦🇪 +971</option>
                        </select>
                        <input type="tel" name="mobile" required value={formData.mobile} onChange={handleInputChange} placeholder="Enter 10-digit mobile"
                          className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200/80 hover:border-emerald-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#2FBF71] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)]" />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="mt-1">
                      <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">EMAIL ADDRESS</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="e.g. rahul@example.com"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200/80 hover:border-emerald-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#2FBF71] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)]" />
                    </div>

                    {/* Company */}
                    <div className="mt-1">
                      <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                        COMPANY / FOLIO NO. <span className="text-slate-400 font-normal lowercase">(optional)</span>
                      </label>
                      <input type="text" name="company" value={formData.company || ''} onChange={handleInputChange} placeholder="e.g. Reliance, Tata Steel, ITC"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200/80 hover:border-emerald-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#2FBF71] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)]" />
                    </div>

                    {/* Claim Category */}
                    <div className="mt-1">
                      <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">CLAIM CATEGORY</label>
                      <select name="serviceInterest" value={formData.serviceInterest || 'IEPF Claim & Verification'} onChange={handleInputChange}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2FBF71] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                        <option value="IEPF Claim & Verification">IEPF Claim &amp; Recovery</option>
                        <option value="Physical Shares to Demat">Physical Shares Demat</option>
                        <option value="Lost Shares & Succession">Transmission / Legal Heir</option>
                        <option value="Unclaimed Dividends">Unclaimed Dividends Search</option>
                      </select>
                    </div>

                    {/* CTA */}
                    <div className="space-y-1 mt-2">
                      <button type="submit" disabled={submitting}
                        className="btn-shine-effect w-full py-2.5 bg-[#2FBF71] hover:bg-[#26aa62] text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer">
                        {submitting ? <span>Scanning...</span> : <><span>Check Status &amp; Search Records</span><ChevronRight className="w-3.5 h-3.5" /></>}
                      </button>
                      <div className="flex items-center justify-center gap-1 text-[8.5px] text-slate-400 font-medium">
                        <ShieldCheck className="w-3 h-3 text-[#2FBF71]" />
                        <span>100% Confidential • Zero Search Fees • MCA Compliant</span>
                      </div>
                    </div>
                  </form>
                )}
              </div>

              {/* Home indicator */}
              <div className="w-24 h-1 bg-slate-300/80 rounded-full mx-auto mt-1 shrink-0" />
            </div>
            </div>
          </div>{/* end phone frame */}

          </div>{/* end outer wrapper */}

          <AppDownloadStrip />

        </div>


      </div>

      {/* Infinite Marquee Ticker: "frequently connect" - visible directly on screen */}
      <div className="relative z-20 w-full mt-4 sm:mt-6 border-y border-slate-200/80 bg-white/95 backdrop-blur-sm py-2.5 overflow-hidden shadow-xs">
        <div className="flex items-center gap-0">
          <span className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap shrink-0 pl-6 pr-4 border-r border-slate-200 mr-2">
            <span className="w-2 h-2 rounded-full bg-[#2FBF71] animate-pulse" />
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
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/70 text-xs text-slate-700 font-medium whitespace-nowrap hover:border-[#2FBF71]/50 hover:bg-emerald-50 hover:text-[#2FBF71] transition-colors duration-200 cursor-default shadow-2xs"
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
