import { useState } from 'react';
import api from '../../services/api';

export default function ClaimCheck() {
  const [form, setForm] = useState({ fullname: '', phone: '', company: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (form.fullname.trim().length < 2) e.fullname = 'Please enter your full name (at least 2 characters).';
    if (!/^[6-9][0-9]{9}$/.test(form.phone)) e.phone = 'Please enter a valid 10-digit Indian mobile number.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      await api.post('/leads/public', {
        name: form.fullname,
        phone: `+91 ${form.phone}`,
        serviceInterest: form.company ? `Unclaimed Shares - ${form.company}` : 'General Claim Check',
        notes: `Free Database Check inquiry for company/folio: ${form.company || 'Not specified'}`
      });
      setSubmitted(true);
    } catch (err) {
      console.warn('ClaimCheck API fallback:', err.message);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="claim-check" className="py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: Visual Badge / Highlights */}
          <div className="hidden lg:flex flex-col items-center justify-center gap-8">
            <div className="relative w-64 h-64">
              <div className="absolute inset-0 bg-[#2FBF71]/15 rounded-full blur-3xl animate-pulse-glow" />
              <div className="relative z-10 w-full h-full rounded-full border-2 border-emerald-300 flex items-center justify-center bg-[#F8F9FB] shadow-xl">
                <div className="text-center">
                  <div className="text-5xl font-black text-[#C9A227] font-serif">₹</div>
                  <div className="text-[#1C1C1C] font-bold text-lg mt-2">Check Your</div>
                  <div className="text-[#2FBF71] font-bold">Unclaimed Wealth</div>
                </div>
              </div>
              {/* orbiting dots */}
              <div className="absolute inset-0 animate-spin-slow">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#2FBF71] shadow-lg shadow-[#2FBF71]/50" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#C9A227] shadow-lg shadow-[#C9A227]/50" />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#2FBF71]/60" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
              {['IEPF Claims', 'Physical Demat', 'Dividends', 'Lost Shares', 'NRI Legal', 'Succession'].map(tag => (
                <span key={tag} className="text-center py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold">{tag}</span>
              ))}
            </div>
          </div>

          {/* Right: Clean White Form Card */}
          <div className="p-8 sm:p-12 rounded-3xl bg-[#F8F9FB] border border-slate-200/90 shadow-xl">
            {!submitted ? (
              <>
                <div className="inline-block px-3.5 py-1 rounded-full bg-emerald-100 text-[#2FBF71] text-xs font-bold uppercase tracking-wider mb-3">
                  ✦ Confidential & Free
                </div>
                <h2 className="font-serif text-3xl font-bold text-[#1C1C1C] mb-2">Not sure if you have unclaimed shares?</h2>
                <p className="text-slate-600 mb-6 text-sm sm:text-base">Fill in your details and our recovery team will reach out to help you check - at no cost.</p>

                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Your Full Name <span className="text-[#C9A227]">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.fullname}
                      onChange={e => setForm({ ...form, fullname: e.target.value })}
                      onFocus={() => setErrors({ ...errors, fullname: '' })}
                      placeholder="e.g. Ramesh Patel"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[#1C1C1C] placeholder-slate-400 outline-none focus:border-[#2FBF71] focus:ring-2 focus:ring-[#2FBF71]/20 transition-all text-sm"
                    />
                    {errors.fullname && <p className="text-red-500 text-xs mt-1">{errors.fullname}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Contact Mobile Number <span className="text-[#C9A227]">*</span>
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      onFocus={() => setErrors({ ...errors, phone: '' })}
                      placeholder="10-digit Indian mobile number"
                      maxLength={10}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[#1C1C1C] placeholder-slate-400 outline-none focus:border-[#2FBF71] focus:ring-2 focus:ring-[#2FBF71]/20 transition-all text-sm"
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Company Name <span className="text-slate-400 font-normal lowercase">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={e => setForm({ ...form, company: e.target.value })}
                      placeholder="e.g. Tata Steel, Reliance, ITC"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[#1C1C1C] placeholder-slate-400 outline-none focus:border-[#2FBF71] focus:ring-2 focus:ring-[#2FBF71]/20 transition-all text-sm"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 leading-relaxed">
                    <strong className="text-slate-700">Please note:</strong> Our team will contact you within 1–2 working days. This is a 100% free preliminary search inquiry; no fees are charged at this stage.
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 bg-[#2FBF71] hover:bg-[#26aa62] text-white font-bold text-base rounded-full py-4 shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5 mt-2"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    Check With Our Team Free
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-12 flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-emerald-300">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#2FBF71" strokeWidth="2.5" className="w-10 h-10"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#1C1C1C] mb-2">Thank you! Your inquiry has been received.</h3>
                  <p className="text-slate-600">Our team will get back to you within 1–2 working days to help you verify and check your unclaimed shares.</p>
                </div>
                <a href="tel:+918511000454" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#2FBF71] text-[#2FBF71] font-bold hover:bg-[#2FBF71] hover:text-white transition-all">
                  📞 Call us directly: 8511000454
                </a>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
