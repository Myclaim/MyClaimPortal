import { useEffect, useRef, useState } from 'react';

const stats = [
  { count: 1500, suffix: '+', label: 'Clients Served', icon: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>, extra: <><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> },
  { count: 11500, suffix: '+', label: 'Client Interactions', icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/> },
  { count: 90, suffix: '+', label: 'Pin Codes Served', icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></> },
  { count: 6, suffix: '+', label: 'Countries Served', icon: <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></> },
  { count: 500, suffix: '+ Cr', label: 'Amount Reclaimed', icon: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></> },
  { count: 30, suffix: '+', label: 'Years Experience', icon: <><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></> },
];

function useCountUp(target, active) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const duration = 1800;
    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
      else setVal(target);
    };
    requestAnimationFrame(step);
  }, [active, target]);
  return val;
}

function StatItem({ stat, active }) {
  const val = useCountUp(stat.count, active);
  return (
    <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#2FBF71]/50 transition-all duration-300 group">
      <div className="p-3 rounded-xl bg-emerald-50 text-[#2FBF71] group-hover:bg-[#2FBF71] group-hover:text-white transition-colors">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-6 h-6">
          {stat.icon}{stat.extra}
        </svg>
      </div>
      <span className="text-3xl font-extrabold text-[#1C1C1C] font-serif">
        {val.toLocaleString()}{stat.suffix}
      </span>
      <span className="text-xs text-slate-500 text-center font-medium uppercase tracking-wider">{stat.label}</span>
    </div>
  );
}

export default function StatsStrip() {
  const [active, setActive] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setActive(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="stats-strip" ref={ref} className="py-16 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((s, idx) => (
            <StatItem key={idx} stat={s} active={active} />
          ))}
        </div>
      </div>
    </section>
  );
}
