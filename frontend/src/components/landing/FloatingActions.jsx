import { useState, useEffect } from "react";

export default function FloatingActions() {
  const [showScroll, setShowScroll] = useState(false);
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    const timer = setTimeout(() => setPulse(false), 4000);
    return () => { window.removeEventListener("scroll", handleScroll); clearTimeout(timer); };
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="fixed bottom-6 right-5 z-50 flex flex-col gap-3 items-end">
      {/* WhatsApp Button */}
      <a
        href="https://wa.me/918657553000?text=Hi%2C%20I%20want%20to%20recover%20my%20unclaimed%20investments."
        target="_blank"
        rel="noopener noreferrer"
        id="whatsapp-float-btn"
        className="group relative flex items-center gap-2 bg-[#25D366] text-white rounded-full shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-300 hover:scale-105"
      >
        {/* Tooltip label */}
        <span className="absolute right-full mr-3 bg-[#1C1C1C] text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Chat on WhatsApp
          <span className="absolute right-[-5px] top-1/2 -translate-y-1/2 border-4 border-transparent border-l-[#1C1C1C]"/>
        </span>

        {/* Pulse ring */}
        {pulse && (
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-40"/>
        )}

        <div className="w-14 h-14 flex items-center justify-center">
          <svg viewBox="0 0 32 32" className="w-7 h-7" fill="white">
            <path d="M16 2C8.28 2 2 8.28 2 16c0 2.48.66 4.8 1.8 6.82L2 30l7.38-1.76A13.93 13.93 0 0 0 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.5a11.45 11.45 0 0 1-5.83-1.6l-.42-.25-4.38 1.04 1.08-4.26-.28-.44A11.5 11.5 0 1 1 16 27.5zm6.31-8.6c-.35-.17-2.05-1.01-2.37-1.13-.32-.11-.55-.17-.78.17-.23.35-.9 1.13-1.1 1.36-.2.23-.41.26-.76.09-.35-.17-1.47-.54-2.8-1.73-1.03-.92-1.73-2.06-1.93-2.4-.2-.35-.02-.53.15-.7.15-.15.35-.4.52-.6.17-.2.23-.35.35-.58.12-.23.06-.43-.03-.6-.09-.17-.78-1.88-1.07-2.57-.28-.67-.57-.58-.78-.59-.2-.01-.43-.01-.66-.01s-.6.09-.91.43c-.32.35-1.2 1.17-1.2 2.85 0 1.68 1.23 3.3 1.4 3.53.17.23 2.42 3.7 5.86 5.19.82.35 1.46.56 1.96.72.82.26 1.57.22 2.16.13.66-.1 2.05-.84 2.34-1.65.29-.81.29-1.5.2-1.65-.09-.15-.32-.23-.67-.4z"/>
          </svg>
        </div>
      </a>

      {/* Call Button */}
      <a
        href="tel:+918657553000"
        id="call-float-btn"
        className="group relative flex items-center justify-center w-12 h-12 bg-white border-2 border-[#2FBF71] text-[#2FBF71] rounded-full shadow-md hover:bg-[#2FBF71] hover:text-white transition-all duration-300 hover:scale-105"
      >
        <span className="absolute right-full mr-3 bg-[#1C1C1C] text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Call Us Now
          <span className="absolute right-[-5px] top-1/2 -translate-y-1/2 border-4 border-transparent border-l-[#1C1C1C]"/>
        </span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.44 2 2 0 0 1 3.6 1.26h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-1.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
      </a>

      {/* Scroll to Top */}
      {showScroll && (
        <button
          onClick={scrollTop}
          id="scroll-top-btn"
          className="flex items-center justify-center w-10 h-10 bg-slate-800 text-white rounded-full shadow-md hover:bg-slate-700 transition-all duration-300 hover:scale-105"
          aria-label="Scroll to top"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        </button>
      )}
    </div>
  );
}
