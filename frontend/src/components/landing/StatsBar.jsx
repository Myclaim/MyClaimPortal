import { useEffect, useRef, useState } from 'react';

function CounterItem({ end, prefix = '', suffix = '+', label, iconSrc, duration = 1800, delay = 0 }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.15 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime = null;
    let animationFrame;

    const timeout = setTimeout(() => {
      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(ease * end));

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        } else {
          setCount(end);
        }
      };

      animationFrame = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [hasStarted, end, duration, delay]);

  return (
    <div 
      ref={ref} 
      className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl group hover:-translate-y-1.5 transition-all duration-300 cursor-default"
    >
      {/* 3D Metallic & Neon Icon */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 mb-3 flex items-center justify-center transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300">
        <img 
          src={iconSrc} 
          alt={label} 
          className="w-full h-full object-contain filter drop-shadow-sm select-none pointer-events-none" 
          loading="lazy"
        />
      </div>

      {/* Metric Count */}
      <div className="flex items-baseline justify-center gap-0.5 mb-1">
        {prefix && <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{prefix}</span>}
        <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111827] font-sans tracking-tight leading-none tabular-nums">
          {count.toLocaleString()}{suffix}
        </span>
      </div>

      {/* Label */}
      <span className="text-slate-500 group-hover:text-slate-800 text-[11px] sm:text-xs font-bold uppercase tracking-wider leading-snug transition-colors text-center">
        {label}
      </span>
    </div>
  );
}

export default function StatsBar() {
  const stats = [
    { end: 1500, suffix: '+', label: 'CLIENTS SERVED', iconSrc: '/assets/stats/clients.jpg', delay: 0 },
    { end: 11500, suffix: '+', label: 'CLIENT INTERACTIONS', iconSrc: '/assets/stats/interactions.jpg', delay: 100 },
    { end: 90, suffix: '+', label: 'PIN CODES SERVED', iconSrc: '/assets/stats/pincodes.jpg', delay: 200 },
    { end: 6, suffix: '+', label: 'COUNTRIES SERVED', iconSrc: '/assets/stats/countries.jpg', delay: 300 },
    { end: 500, suffix: '+ Cr', prefix: '₹', label: 'AMOUNT RECLAIMED IN CR', iconSrc: '/assets/stats/rupee.jpg', delay: 400 },
    { end: 30, suffix: '+', label: 'PROFESSIONAL EXPERIENCE', iconSrc: '/assets/stats/briefcase.jpg', delay: 500 },
  ];

  return (
    <section className="relative bg-white py-12 sm:py-16 px-6 sm:px-8 lg:px-12 border-b border-slate-200/80 overflow-hidden">
      <div className="relative z-10 max-w-screen-2xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-6 lg:gap-8 items-center text-center">
        {stats.map((stat, i) => (
          <CounterItem
            key={i}
            end={stat.end}
            prefix={stat.prefix}
            suffix={stat.suffix}
            label={stat.label}
            iconSrc={stat.iconSrc}
            delay={stat.delay}
            duration={1600}
          />
        ))}
      </div>
    </section>
  );
}
