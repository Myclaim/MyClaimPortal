import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function Header({ onOpenLogin }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const Logo = () => (
    <Link to="/" className="flex items-center gap-2" aria-label="MyClaim India – Home">
      <img
        src="/myclaim-logo.jpg"
        alt="MyClaim India - Simplify Claims, Save Time, Get Trusted Support"
        className="h-14 sm:h-16 md:h-18 w-auto object-contain max-h-[72px] py-1 transition-transform duration-200 hover:scale-[1.02]"
      />
    </Link>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-300">
      
      {/* Tier 1: Top Bar (Logo, For Partners / Associates, Login & Sign Up) */}
      <div className={`bg-white transition-all duration-300 ${
        scrolled ? 'shadow-sm border-b border-slate-200/70' : 'border-b border-slate-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[72px] sm:min-h-[82px] py-1.5 flex items-center justify-between">
          
          {/* Left: Logo & For Partners Link */}
          <div className="flex items-center gap-8">
            <Logo />
            
            <nav className="hidden sm:flex items-center gap-4 text-sm font-medium text-slate-600">
              <Link 
                to="/become-associate"
                className="hover:text-[#2FBF71] transition-colors py-1 flex items-center"
              >
                <span>For Partners / Associates</span>
              </Link>
            </nav>
          </div>

          {/* Right: Login & Sign Up / Dashboard */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => navigate(user.role === 'client' ? '/client' : '/home')}
                  className="bg-[#2FBF71] hover:bg-[#26aa62] text-white text-sm font-bold rounded-full px-5 py-2 shadow-sm shadow-emerald-500/20 hover:shadow transition-all hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
                >
                  <span>Portal Dashboard</span>
                  <span className="text-[11px] bg-black/15 px-2 py-0.5 rounded-full font-medium">
                    {user.name?.split(' ')[0] || user.role}
                  </span>
                  <span>→</span>
                </button>
                <button
                  onClick={logout}
                  className="text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1 font-semibold cursor-pointer"
                  title="Sign out of portal"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm font-semibold text-slate-700 hover:text-[#2FBF71] px-4 py-2 transition-colors cursor-pointer"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-[#2FBF71] hover:bg-[#26aa62] text-white text-sm font-bold rounded-full px-6 py-2 shadow-sm shadow-emerald-500/20 hover:shadow transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button 
            className="lg:hidden flex flex-col gap-1.5 p-2 text-slate-800" 
            onClick={() => setMobileOpen(o => !o)} 
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-slate-900 transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`}/>
            <span className={`block w-6 h-0.5 bg-slate-900 transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`}/>
            <span className={`block w-6 h-0.5 bg-slate-900 transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`}/>
          </button>

        </div>
      </div>

      {/* Tier 2: Sub-Header Navigation (Exact items requested: Approach of what we do, Our claim process, Who we collab with, Client testimonials, FAQs for clients & partners) */}
      <div className="hidden lg:block bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-11 flex items-center justify-between text-sm font-semibold">
          
          <div className="flex items-center gap-8">
            {/* 1. Approach of What We Do */}
            <a 
              href="/#what-we-do" 
              className="text-slate-700 hover:text-[#2FBF71] transition-colors py-2 flex items-center gap-1.5"
            >
              <span>Approach of What We Do</span>
            </a>

            {/* 2. Our Claim Process */}
            <a 
              href="/#process-section" 
              className="text-slate-700 hover:text-[#2FBF71] transition-colors py-2 flex items-center gap-1.5"
            >
              <span>Our Claim Process</span>
            </a>

            {/* 3. Who We Collab With */}
            <a 
              href="/#collaborate" 
              className="text-slate-700 hover:text-[#2FBF71] transition-colors py-2 flex items-center gap-1.5"
            >
              <span>Who We Collab With</span>
            </a>

            {/* 4. Client Testimonials */}
            <a 
              href="/#testimonials" 
              className="text-slate-700 hover:text-[#2FBF71] transition-colors py-2 flex items-center gap-1.5"
            >
              <span>Client Testimonials</span>
            </a>
          </div>

          {/* 5. FAQs (For Partners & For Clients) */}
          <div 
            className="relative py-2"
            onMouseEnter={() => setFaqOpen(true)}
            onMouseLeave={() => setFaqOpen(false)}
          >
            <a 
              href="/#faq"
              className="flex items-center gap-1.5 text-slate-700 hover:text-[#2FBF71] transition-colors cursor-pointer"
            >
              <span>FAQs</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                Clients & Partners
              </span>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-transform">
                <polyline points="4 6 8 10 12 6"/>
              </svg>
            </a>

            {/* Dual FAQs Dropdown */}
            {faqOpen && (
              <div className="absolute top-full right-0 pt-1 z-50 w-64 animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2">
                  <a 
                    href="/#faq" 
                    className="flex items-center justify-between px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-[#2FBF71] hover:bg-emerald-50/50 transition-colors"
                  >
                    <span>FAQs for Clients</span>
                    <span className="text-[10px] bg-emerald-100 text-[#2FBF71] px-2 py-0.5 rounded-full font-bold">
                      Investors
                    </span>
                  </a>
                  <a 
                    href="/#faq" 
                    className="flex items-center justify-between px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-[#C9A227] hover:bg-amber-50/50 transition-colors"
                  >
                    <span>FAQs for Partners</span>
                    <span className="text-[10px] bg-amber-100 text-[#C9A227] px-2 py-0.5 rounded-full font-bold">
                      Associates
                    </span>
                  </a>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <div className={`lg:hidden fixed inset-0 z-30 bg-white/98 backdrop-blur-xl transition-all duration-400 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="pt-20 pb-8 px-6 flex flex-col gap-3 h-full overflow-y-auto">
          
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 mb-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Partner Desk</p>
            <a 
              href="/become-associate"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between text-sm font-bold text-slate-800 hover:text-[#2FBF71]"
            >
              <span>For Partners / Associates</span>
            </a>
          </div>

          <a href="/#what-we-do" onClick={() => setMobileOpen(false)} className="py-3 text-base font-semibold text-slate-900 border-b border-slate-100">
            Approach of What We Do
          </a>
          <a href="/#process-section" onClick={() => setMobileOpen(false)} className="py-3 text-base font-semibold text-slate-900 border-b border-slate-100">
            Our Claim Process
          </a>
          <a href="/#collaborate" onClick={() => setMobileOpen(false)} className="py-3 text-base font-semibold text-slate-900 border-b border-slate-100">
            Who We Collab With
          </a>
          <a href="/#testimonials" onClick={() => setMobileOpen(false)} className="py-3 text-base font-semibold text-slate-900 border-b border-slate-100">
            Client Testimonials
          </a>

          <div className="py-2 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">FAQs</p>
            <div className="flex flex-col gap-1.5 pl-2">
              <a href="/#faq" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-slate-700 hover:text-[#2FBF71] py-1">
                • FAQs for Clients
              </a>
              <a href="/#faq" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-slate-700 hover:text-[#C9A227] py-1">
                • FAQs for Partners
              </a>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2.5">
            {user ? (
              <>
                <button
                  onClick={() => { setMobileOpen(false); navigate(user.role === 'client' ? '/client' : '/home'); }}
                  className="w-full py-3 bg-[#2FBF71] text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <span>Go to Portal Dashboard</span>
                  <span>→</span>
                </button>
                <button
                  onClick={() => { setMobileOpen(false); logout(); }}
                  className="w-full py-2.5 border border-slate-200 text-slate-500 rounded-xl text-xs font-semibold"
                >
                  Logout ({user.name || user.email})
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setMobileOpen(false); navigate('/login'); }}
                  className="w-full py-3 border border-slate-300 rounded-xl text-sm font-bold text-slate-800"
                >
                  Login
                </button>
                <button
                  onClick={() => { setMobileOpen(false); navigate('/login'); }}
                  className="w-full py-3 bg-[#2FBF71] text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-500/20"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>

    </header>
  );
}
