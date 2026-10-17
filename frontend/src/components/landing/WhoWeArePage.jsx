import { useEffect, useRef, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import FloatingActions from "./FloatingActions";

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setVisible(true);
    }, { threshold: 0.12 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function RevealSection({ children, delay = 0, className = "" }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(36px)",
        transition: "opacity 0.75s ease " + delay + "s, transform 0.75s ease " + delay + "s",
      }}
    >
      {children}
    </div>
  );
}

const VALS = [
  { key: "A", title: "Integrity First", desc: "Every claim handled with full transparency and zero hidden charges." },
  { key: "B", title: "30+ Years Expertise", desc: "Deep domain knowledge in IEPF, share transmission and legal succession." },
  { key: "C", title: "Pan-India and NRI", desc: "Serving investors across 90+ pin codes and 6 countries worldwide." },
  { key: "D", title: "Success-Fee Model", desc: "You pay only when we recover. No recovery means no fee, period." },
];

const MILESTONES = [
  { year: "1992", event: "Founded in Surat by a team of financial and legal experts." },
  { year: "2005", event: "Expanded NRI services across UAE, UK, USA and Canada." },
  { year: "2015", event: "Crossed 5,000 successful IEPF claim recoveries." },
  { year: "2024", event: "Rs. 500 Cr+ in investments reclaimed for 1,500+ satisfied clients." },
];

const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#2FBF71" strokeWidth="1.75" className="w-7 h-7">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#2FBF71" strokeWidth="1.75" className="w-7 h-7">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconGlobe = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#2FBF71" strokeWidth="1.75" className="w-7 h-7">
    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const IconHeart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#2FBF71" strokeWidth="1.75" className="w-7 h-7">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ICONS = { A: <IconShield />, B: <IconClock />, C: <IconGlobe />, D: <IconHeart /> };

export default function WhoWeArePage({ onOpenLogin }) {
  const [heroVisible, setHeroVisible] = useState(false);
  useEffect(() => { setTimeout(() => setHeroVisible(true), 100); }, []);

  return (
    <div className="font-sans bg-white min-h-screen text-[#1C1C1C] selection:bg-[#2FBF71] selection:text-white">
      <Header onOpenLogin={onOpenLogin} />

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-28">
        <img src="/assets/who-we-are-bg.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none select-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/10 to-white pointer-events-none" />
        <div
          className="relative z-10 text-center max-w-3xl mx-auto px-6 py-28"
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "translateY(0)" : "translateY(40px)",
            transition: "opacity 0.9s ease, transform 0.9s ease",
          }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#2FBF71] text-xs font-bold uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2FBF71] animate-pulse" />
            MyClaim India
          </span>
          <h1 className="font-serif text-5xl lg:text-7xl font-bold text-[#1C1C1C] leading-tight mb-6">
            Who We <span className="text-[#2FBF71]">Are</span>
          </h1>
          <p className="text-slate-600 text-lg sm:text-xl leading-relaxed max-w-xl mx-auto">
            India&apos;s most trusted investment recovery advisory — helping families reclaim what is rightfully theirs.
          </p>
        </div>
      </section>

      {/* About Content */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <RevealSection>
            <div className="w-16 h-1 bg-gradient-to-r from-[#2FBF71] to-[#C9A227] rounded-full mx-auto mb-10" />
            <div className="space-y-6 text-slate-600 text-lg sm:text-xl leading-relaxed">
              <p>
                <strong className="text-[#1C1C1C] font-serif">MyclaimIndia</strong> is the most trustworthy and legitimate investment recovery advisory, having a group of passionate and high-performing specialists to alleviate the difficulties of investors. Our team comprises experienced and passionate skilled professionals with more than <span className="text-[#2FBF71] font-semibold">30+ years worth of expertise</span> in dealing with problems that investors and their families encounter.
              </p>
              <p>
                We have a nationwide network of skilled attorneys to help you with all the legal challenges preventing you from recovering your lost money. Our specialists are always available to help you with the best solution, whether you are having problems with the transmission of shares, IEPF claims of shares, dividends & tracking your missing shares or recovering shares.
              </p>
              <p>
                Our main office is in Surat, but thanks to our network of partners, we are also present in all of the country&apos;s major cities. We are dedicated to giving our clients the best services and support possible, and we&apos;ll keep growing our service offerings in other markets & areas to help them get their unclaimed assets back.
              </p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#F8F9FB] border-y border-slate-200/80">
        <div className="max-w-5xl mx-auto px-6">
          <RevealSection className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-200">
            {[
              { num: "1,500+", label: "Clients Served" },
              { num: "Rs. 500 Cr+", label: "Reclaimed" },
              { num: "30+", label: "Years Experience" },
              { num: "6+", label: "Countries" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center py-10 px-4 gap-2">
                <span className="font-serif text-3xl sm:text-4xl font-extrabold text-[#1C1C1C]">{s.num}</span>
                <span className="text-slate-500 text-xs uppercase tracking-widest font-semibold text-center">{s.label}</span>
              </div>
            ))}
          </RevealSection>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <RevealSection className="text-center mb-14">
            <p className="text-[#2FBF71] text-xs font-bold uppercase tracking-widest mb-3">What Drives Us</p>
            <h2 className="font-serif text-4xl font-bold text-[#1C1C1C]">Our Core <span className="text-[#2FBF71]">Values</span></h2>
          </RevealSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALS.map((v, i) => (
              <RevealSection key={v.key} delay={i * 0.12}>
                <div className="group h-full flex flex-col gap-4 p-7 rounded-3xl border border-slate-200/80 bg-white hover:border-[#2FBF71]/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="p-2.5 w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                    {ICONS[v.key]}
                  </div>
                  <h3 className="font-bold text-lg text-[#1C1C1C] leading-tight">{v.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed flex-1">{v.desc}</p>
                  <div className="w-8 h-0.5 bg-[#2FBF71] rounded-full group-hover:w-16 transition-all duration-500" />
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-[#F8F9FB] border-y border-slate-200/80">
        <div className="max-w-4xl mx-auto px-6">
          <RevealSection className="text-center mb-14">
            <p className="text-[#2FBF71] text-xs font-bold uppercase tracking-widest mb-3">Our Journey</p>
            <h2 className="font-serif text-4xl font-bold text-[#1C1C1C]">Three Decades of <span className="text-[#2FBF71]">Trust</span></h2>
          </RevealSection>
          <div className="relative">
            <div className="absolute left-7 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#2FBF71] via-[#C9A227] to-[#2FBF71] opacity-40" />
            <div className="flex flex-col gap-10">
              {MILESTONES.map((m, i) => (
                <RevealSection key={m.year} delay={i * 0.1}>
                  <div className={"flex items-center gap-6 " + (i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse")}>
                    <div className="flex-1 hidden md:block" />
                    <div className="relative flex-shrink-0 w-14 h-14 rounded-full bg-white border-2 border-[#2FBF71] flex items-center justify-center shadow-md z-10">
                      <span className="text-[#2FBF71] font-black text-xs">{m.year}</span>
                    </div>
                    <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-[#2FBF71]/40 hover:shadow-md transition-all duration-300">
                      <p className="text-xs font-bold text-[#2FBF71] uppercase tracking-widest mb-1">{m.year}</p>
                      <p className="text-[#1C1C1C] font-medium text-sm sm:text-base leading-relaxed">{m.event}</p>
                    </div>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section id="team" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <RevealSection className="text-center mb-16">
            <p className="text-[#2FBF71] text-xs font-bold uppercase tracking-widest mb-3">The People Behind</p>
            <h2 className="font-serif text-4xl font-bold text-[#1C1C1C]">Our <span className="text-[#2FBF71]">Team</span></h2>
          </RevealSection>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pranav Sarvaiya */}
            <RevealSection delay={0.1}>
              <div className="group bg-white rounded-3xl p-6 border border-slate-200/80 hover:shadow-xl hover:border-[#2FBF71]/30 transition-all duration-300 flex flex-col sm:flex-row gap-6 items-center sm:items-start h-full">
                <div className="w-40 h-48 sm:w-48 sm:h-56 flex-shrink-0 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img src="/assets/pranav.jpg" alt="Pranav Sarvaiya" className="w-full h-full object-cover object-top" onError={(e) => { e.target.onerror = null; e.target.src = 'https://ui-avatars.com/api/?name=Pranav+Sarvaiya&background=2FBF71&color=fff&size=256'; }} />
                </div>
                <div className="flex-1 flex flex-col h-full text-center sm:text-left">
                  <h3 className="text-[#1C1C1C] font-bold text-xl mb-1 uppercase tracking-wider">Pranav Sarvaiya</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Co-Founder</p>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1">
                    Pranav Sarvaiya is an Analyst at MyClaim India in Surat, Gujarat, with a Bachelor of Business Administration in Finance from SDA, Surat. He has over 5000 connections and is proficient in organizational leadership and skills.
                  </p>
                  <div className="mt-auto flex justify-center sm:justify-start">
                    <a href="https://www.linkedin.com/in/pranav-sarvaiya-184995323" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-500 hover:text-[#2FBF71] hover:border-[#2FBF71] transition-colors">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </a>
                  </div>
                </div>
              </div>
            </RevealSection>

            {/* Rushi Sarvaiya */}
            <RevealSection delay={0.2}>
              <div className="group bg-white rounded-3xl p-6 border border-slate-200/80 hover:shadow-xl hover:border-[#2FBF71]/30 transition-all duration-300 flex flex-col sm:flex-row gap-6 items-center sm:items-start h-full">
                <div className="w-40 h-48 sm:w-48 sm:h-56 flex-shrink-0 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img src="/assets/rushi.jpg" alt="Rushi Sarvaiya" className="w-full h-full object-cover object-top" onError={(e) => { e.target.onerror = null; e.target.src = 'https://ui-avatars.com/api/?name=Rushi+Sarvaiya&background=C9A227&color=fff&size=256'; }} />
                </div>
                <div className="flex-1 flex flex-col h-full text-center sm:text-left">
                  <h3 className="text-[#1C1C1C] font-bold text-xl mb-1 uppercase tracking-wider">Rushi Sarvaiya</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Co-Founder | Christ University</p>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1">
                    With over 2.5 years of experience working in the finance sector at a prominent broking firm, Rushi Sarvaiya has developed extensive expertise in dealing with pre-IPO shares. Major skill lies in navigating the complexities of private equity deals.
                  </p>
                  <div className="mt-auto flex justify-center sm:justify-start">
                    <a href="https://www.linkedin.com/in/rushi-sarvaiya" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-500 hover:text-[#2FBF71] hover:border-[#2FBF71] transition-colors">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </a>
                  </div>
                </div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#F8F9FB] border-t border-slate-200/80">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <RevealSection>
            <div className="bg-gradient-to-br from-[#2FBF71] to-emerald-600 rounded-3xl p-12 text-white shadow-2xl shadow-emerald-500/20">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4 leading-tight">Ready to Reclaim What is Yours?</h2>
              <p className="text-white/80 text-base mb-8 max-w-lg mx-auto">Get a free consultation. No upfront fee. No obligation.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="tel:+918657553000"
                  id="wwa-call-btn"
                  className="inline-flex items-center gap-2 bg-white text-[#2FBF71] font-bold px-8 py-3.5 rounded-xl hover:bg-emerald-50 transition-colors text-sm"
                >
                  Call Us Free
                </a>
                <a
                  href="/"
                  id="wwa-home-btn"
                  className="inline-flex items-center gap-2 bg-white/15 border border-white/40 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-white/25 transition-colors text-sm"
                >
                  Back to Home
                </a>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      <Footer />
      <FloatingActions />
    </div>
  );
}
