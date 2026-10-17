import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginModal({ isOpen, onClose }) {
  const [tab, setTab] = useState('investor'); // 'investor' | 'partner'
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (phone.length >= 10) {
      setSubmitted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1C1C1C] to-[#2b2b2b] p-6 text-white text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2FBF71]/20 text-[#2FBF71] text-xs font-semibold uppercase tracking-wider mb-2 border border-[#2FBF71]/30">
            MyClaim India Portal
          </div>
          <h3 className="text-xl font-bold font-serif">Sign In / Track Claim</h3>
          <p className="text-slate-300 text-xs mt-1">Access your recovery status or partner dashboard</p>

          {/* Switcher */}
          <div className="flex bg-white/10 p-1 rounded-full mt-4 max-w-xs mx-auto border border-white/10">
            <button
              onClick={() => { setTab('investor'); setSubmitted(false); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all ${
                tab === 'investor' ? 'bg-[#2FBF71] text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              Investor / Claimant
            </button>
            <button
              onClick={() => { setTab('partner'); setSubmitted(false); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all ${
                tab === 'partner' ? 'bg-[#C9A227] text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              Partner / Associate
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-emerald-100 text-[#2FBF71] rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
                ✓
              </div>
              <h4 className="font-bold text-lg text-slate-900 mb-1">OTP Sent Successfully!</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mb-6">
                We've sent a 6-digit OTP to +91 {phone}. Enter code to access your {tab === 'investor' ? 'claim tracking portal' : 'associate commission desk'}.
              </p>
              <button
                onClick={() => { setSubmitted(false); onClose(); navigate('/login'); }}
                className="w-full py-3 bg-[#2FBF71] hover:bg-[#26aa62] text-white font-bold rounded-xl text-sm transition-all shadow-md"
              >
                Proceed to Dashboard Login →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Registered Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full pl-14 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2FBF71] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {tab === 'partner' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Associate ID / Email (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MCA-9842 or partner@email.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:bg-white transition-all"
                  />
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-md transition-all hover:opacity-95 ${
                  tab === 'investor' ? 'bg-[#2FBF71] shadow-emerald-500/25' : 'bg-[#C9A227] shadow-amber-500/25'
                }`}
              >
                {tab === 'investor' ? 'Get OTP & Track Claim' : 'Sign In to Partner Portal'}
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Or</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <button
                type="button"
                onClick={() => { onClose(); navigate('/login'); }}
                className="w-full py-2.5 rounded-xl border border-slate-200 hover:border-[#2FBF71] hover:bg-emerald-50/50 text-slate-700 hover:text-[#2FBF71] font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Portal Sign In (Staff, Partner & Client)</span>
                <span>→</span>
              </button>

              {/* Mobile App Download Box */}
              <div className="pt-4 border-t border-slate-100 mt-4 text-center">
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2.5">
                  Or use MyClaim Mobile App
                </p>
                <div className="flex items-center justify-center gap-3">
                  <a
                    href="#download-android"
                    onClick={(e) => { e.preventDefault(); alert('MyClaim India Android APK / Play Store link is ready for download.'); }}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-colors"
                  >
                    <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.609 1.814L13.792 12 3.61 22.186a1.99 1.99 0 01-.61-.318c-.37-.306-.6-.763-.6-1.268V3.4c0-.505.23-.962.6-1.268.188-.155.397-.263.61-.318zM15.207 13.414l2.58 2.58-13.178 7.608 10.598-10.188zm0-2.828L4.609.398 17.787 8.006l-2.58 2.58zm1.414 1.414l3.18-3.18c.677-.677.677-1.776 0-2.453-.33-.33-.772-.5-1.226-.5-.454 0-.897.17-1.227.5L15.908 7.63l2.828 2.828-2.115 2.115z" />
                    </svg>
                    Google Play
                  </a>
                  <a
                    href="#download-ios"
                    onClick={(e) => { e.preventDefault(); alert('MyClaim India iOS App Store link is ready for download.'); }}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-colors"
                  >
                    <svg className="w-4 h-4 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.9.04-2 .6-2.63 1.34-.56.64-.97 1.7-0.85 2.73 1.01.08 2.04-.51 2.56-1.2" />
                    </svg>
                    App Store
                  </a>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
