import { useEffect, useRef, useState } from 'react';

function CounterItem({ end, suffix = '+', label, duration = 1800, delay = 0 }) {
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
        // Ease out cubic for natural, smooth deceleration
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
      className="flex flex-col items-center justify-center p-3 rounded-2xl group hover:-translate-y-1.5 hover:bg-white/5 transition-all duration-300 cursor-default"
    >
      <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#85df95] font-sans tracking-tight leading-none mb-2 tabular-nums group-hover:text-emerald-200 group-hover:scale-105 transition-all duration-300 drop-shadow-sm">
        {count}{suffix}
      </span>
      <span className="text-white/90 group-hover:text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider leading-snug transition-colors">
        {label}
      </span>
    </div>
  );
}

export default function StatsBar() {
  const stats = [
    { end: 1500, suffix: '+', label: 'CLIENTS SERVED', delay: 0 },
    { end: 11500, suffix: '+', label: 'CLIENT INTERACTIONS', delay: 100 },
    { end: 90, suffix: '+', label: 'PIN CODES SERVED', delay: 200 },
    { end: 6, suffix: '+', label: 'COUNTRIES SERVED', delay: 300 },
    { end: 500, suffix: '+', label: 'AMOUNT RECLAIMED IN CR', delay: 400 },
    { end: 30, suffix: '+', label: 'PROFESSIONAL EXPERIENCE', delay: 500 },
  ];

  return (
    <section className="relative bg-gradient-to-r from-[#25562a] via-[#2d6632] to-[#25562a] py-10 sm:py-12 px-4 sm:px-6 lg:px-8 border-y border-emerald-950/20 shadow-inner overflow-hidden">
      {/* Subtle animated background light beam */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-100 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 lg:gap-8 items-center text-center">
        {stats.map((stat, i) => (
          <CounterItem
            key={i}
            end={stat.end}
            suffix={stat.suffix}
            label={stat.label}
            delay={stat.delay}
            duration={1600}
          />
        ))}
      </div>
    </section>
  );
}
