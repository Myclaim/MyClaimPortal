import { useRef, useEffect, useState } from "react";

const mediaLogos = [
  { name: "Economic Times", abbr: "ET", color: "#E8320E" },
  { name: "Mint", abbr: "Mint", color: "#E84C4C" },
  { name: "Business Standard", abbr: "BS", color: "#1C4FC9" },
  { name: "NDTV Profit", abbr: "NDTV", color: "#D32F2F" },
  { name: "MoneyControl", abbr: "MC", color: "#0A6ABF" },
  { name: "Financial Express", abbr: "FE", color: "#234499" },
  { name: "Bloomberg Quint", abbr: "BQ", color: "#1D1D1D" },
  { name: "LiveMint", abbr: "LM", color: "#7B3F9E" },
];

const certBadges = [
  { icon: "???", label: "SEBI Registered", sub: "Certified Intermediary" },
  { icon: "??", label: "ISO 27001", sub: "Data Security Certified" },
  { icon: "??", label: "MCA Verified", sub: "Ministry of Corp. Affairs" },
  { icon: "????", label: "IEPF Authorized", sub: "Govt. of India Approved" },
];

export default function TrustedBy() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="trusted-by"
      ref={ref}
      className="py-16 bg-[#F8F9FB] border-b border-slate-200/80"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* As Seen In */}
        <div className="text-center mb-10">
          <p className="text-slate-400 text-xs uppercase tracking-[0.3em] font-semibold mb-6">As Featured In & Trusted By</p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {mediaLogos.map((m) => (
              <div key={m.name} className="group flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200/80 rounded-xl hover:border-[#2FBF71]/40 hover:shadow-sm transition-all duration-300 cursor-default">
                <span className="text-xs font-black tracking-tight" style={{ color: m.color }}>{m.abbr}</span>
                <span className="text-slate-300 text-sm">|</span>
                <span className="text-slate-500 text-xs font-medium">{m.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-slate-200"/>
          <span className="text-slate-300 text-sm">?</span>
          <div className="flex-1 h-px bg-slate-200"/>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {certBadges.map((b) => (
            <div key={b.label} className="flex items-center gap-3 p-4 bg-white border border-slate-200/80 rounded-xl hover:border-[#2FBF71]/40 hover:shadow-sm transition-all duration-300">
              <span className="text-2xl flex-shrink-0">{b.icon}</span>
              <div>
                <p className="font-bold text-[#1C1C1C] text-sm leading-tight">{b.label}</p>
                <p className="text-slate-400 text-xs mt-0.5">{b.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
