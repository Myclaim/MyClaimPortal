import { useState, useRef, useEffect } from 'react';

const claimantFaqs = [
  { q: 'How long does the claim recovery process take?', a: 'Simple unclaimed dividend recoveries typically take 30-60 days. IEPF claims usually take 60-90 days after document submission. Our team keeps you updated at every stage.' },
  { q: 'What documents are required to start a claim?', a: 'Basic documents include your PAN card, Aadhaar card, bank passbook or cancelled cheque, and share certificates or demat account statements. If original certificates are lost, we guide you through FIR and indemnity paperwork.' },
  { q: 'How much does MyClaim India charge for its services?', a: 'We operate on a transparent success-fee model. You pay only when we successfully recover and credit your funds/shares. There are zero upfront service fees.' },
  { q: 'Can NRIs use your recovery services remotely?', a: 'Yes! We serve clients across 6+ countries (USA, UK, UAE, Singapore, Canada, Australia). All procedures, including zero-travel Power of Attorney and embassy attestations, are handled without requiring you to fly to India.' },
  { q: 'Can you recover shares lying unclaimed for 20-30 years?', a: 'Yes. We specialize in historical recovery — including paper certificates of merged or renamed companies (e.g., Brooke Bond, Pond\'s, Lipton into HUL, or legacy Reliance and Tata folios).' },
  { q: 'What if the original shareholder has passed away?', a: 'We manage full transmission and legal succession — assisting with Legal Heir Certificates, Succession Certificates, Letter of Administration, and family NOCs.' },
];

const partnerFaqs = [
  { q: 'Who can register as a MyClaim Associate or Partner?', a: 'Chartered Accountants (CAs), Company Secretaries (CS), High Court and District Advocates, Mutual Fund Distributors (MFDs), and wealth advisory firms are eligible to join our partner ecosystem.' },
  { q: 'What is the commission and revenue sharing structure?', a: 'We offer an attractive success-linked commission model for every successful recovery case referred. Payouts are made promptly via direct bank transfer upon client receipt.' },
  { q: 'How do I submit and track referred client cases?', a: 'Partners receive access to our dedicated Associate Desk where you can register client leads, upload preliminary folios, and track real-time regulatory status.' },
  { q: 'Do partners need to interact directly with IEPF or RTAs?', a: 'No. MyClaim India\'s full-time operational team handles 100% of the back-end filings, registrar follow-ups, and MCA coordination.' },
  { q: 'Is there a formal agreement or NDA signed?', a: 'Yes. Every partner relationship is backed by a formal Channel Partner Agreement with complete confidentiality and non-disclosure clauses protecting client relationships.' },
];

function AccordionItem({ faq, isOpen, onClick, index }) {
  const contentRef = useRef(null);
  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-300 bg-white ${isOpen ? 'border-[#2FBF71] shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-5 sm:p-6 text-left gap-4"
        aria-expanded={isOpen}
        id={`faq-btn-${index}`}
      >
        <span className={`font-semibold text-sm sm:text-base leading-snug ${isOpen ? 'text-[#2FBF71]' : 'text-slate-900'}`}>{faq.q}</span>
        <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-[#2FBF71] rotate-45' : 'bg-slate-100'}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke={isOpen ? 'white' : '#2FBF71'} strokeWidth="2.5" className="w-3.5 h-3.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </span>
      </button>
      <div
        ref={contentRef}
        style={{ maxHeight: isOpen ? (contentRef.current ? contentRef.current.scrollHeight + 'px' : '500px') : '0px', opacity: isOpen ? 1 : 0 }}
        className="transition-all duration-300 overflow-hidden"
      >
        <div className="px-5 sm:px-6 pb-5 sm:pb-6">
          <div className="w-full h-px bg-slate-100 mb-4" />
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">{faq.a}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [tab, setTab] = useState('claimants'); // 'claimants' | 'partners'
  const [openIndex, setOpenIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const activeFaqs = tab === 'claimants' ? claimantFaqs : partnerFaqs;
  const toggle = (i) => setOpenIndex(openIndex === i ? -1 : i);

  return (
    <section id="faq" ref={ref} className="py-24 bg-white border-b border-slate-200" style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(40px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          {/* Left Column: Heading & Tab Selection */}
          <div className="lg:w-5/12 lg:sticky lg:top-28">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-[#2FBF71] text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-300/60">
              ✦ Knowledge Base
            </span>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-[#1C1C1C] mb-4">
              Frequently Asked <br />
              <span className="text-[#2FBF71]">Questions</span>
            </h2>
            <p className="text-slate-600 text-base leading-relaxed mb-8">
              Everything you need to know about reclaiming lost shares, IEPF compliance, succession, and our professional partner program.
            </p>

            {/* Notebook Section 6: Dual Tabs (Claimants & Partners) */}
            <div className="bg-[#F8F9FB] p-2 rounded-2xl border border-slate-200/90 mb-8 space-y-2">
              <button
                onClick={() => { setTab('claimants'); setOpenIndex(0); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between ${
                  tab === 'claimants'
                    ? 'bg-[#2FBF71] text-white shadow-md'
                    : 'text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                <span>For Claimants & Investors</span>
                <span>→</span>
              </button>
              <button
                onClick={() => { setTab('partners'); setOpenIndex(0); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between ${
                  tab === 'partners'
                    ? 'bg-[#C9A227] text-white shadow-md'
                    : 'text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                <span>For Partners & Associates</span>
                <span>→</span>
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8F9FB] border border-slate-200">
              <h4 className="font-bold text-sm text-[#1C1C1C] mb-1">Have a specific question?</h4>
              <p className="text-xs text-slate-500 mb-4">Our senior claim advisors are available Monday to Saturday (9:30 AM to 6:30 PM).</p>
              <a href="tel:+918511000454" className="inline-flex items-center gap-2 text-xs font-bold text-[#2FBF71] hover:underline">
                Call Helpline: +91 85110 00454 →
              </a>
            </div>
          </div>

          {/* Right Column: Accordion list */}
          <div className="lg:w-7/12 w-full space-y-4">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Showing {tab === 'claimants' ? 'Claimant & Recovery FAQs' : 'Partner & Commission FAQs'}
              </span>
              <span className="text-xs font-bold text-[#2FBF71]">
                {activeFaqs.length} Answers
              </span>
            </div>

            {activeFaqs.map((faq, i) => (
              <AccordionItem
                key={`${tab}-${i}`}
                faq={faq}
                isOpen={openIndex === i}
                onClick={() => toggle(i)}
                index={i}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}