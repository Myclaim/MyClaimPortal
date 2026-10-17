export default function Footer() {
  return (
    <>
      {/* Headquarters / Contact */}
      <section id="contact" className="bg-[#F8F9FB] border-t border-slate-200/80">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Info */}
          <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center gap-8">
            <div>
              <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-100 text-[#2FBF71] text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-300/60">
                ✦ Registered Office
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1C1C] mb-4">Our Headquarters</h2>
              <div className="space-y-1 text-slate-600 text-base sm:text-lg">
                <p className="font-semibold text-slate-800">3rd Floor, Altair by SVK Associates,</p>
                <p>Dumas Road, Piplod,</p>
                <p>Surat, Gujarat - 395007</p>
              </div>
            </div>

            <div className="space-y-3.5 text-sm sm:text-base">
              <div className="flex items-center gap-3">
                <span className="text-[#C9A227] font-bold w-24 sm:w-28 text-xs uppercase tracking-wider">Phone:</span>
                <a href="tel:+918511000454" className="text-[#1C1C1C] font-semibold hover:text-[#2FBF71] transition-colors">+91 85110 00454</a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#C9A227] font-bold w-24 sm:w-28 text-xs uppercase tracking-wider">WhatsApp:</span>
                <a href="https://wa.me/918511000454" target="_blank" rel="noopener noreferrer" className="text-[#1C1C1C] font-semibold hover:text-[#2FBF71] transition-colors">+91 85110 00454</a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#C9A227] font-bold w-24 sm:w-28 text-xs uppercase tracking-wider">Email:</span>
                <a href="mailto:info@myclaimindia.com" className="text-[#1C1C1C] font-semibold hover:text-[#2FBF71] transition-colors">info@myclaimindia.com</a>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              {[
                { href: 'https://facebook.com', label: 'Facebook', icon: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /> },
                { href: 'https://twitter.com', label: 'Twitter', icon: <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" /> },
                { href: 'https://youtube.com', label: 'YouTube', icon: <><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white" stroke="none" /></> },
                { href: 'https://www.instagram.com/myclaimindia/', label: 'Instagram', icon: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></>, stroke: true },
                { href: 'https://www.linkedin.com/company/myclaim-india/', label: 'LinkedIn', icon: <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74v-8.37H5.06v8.37h2.8z" /> },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  aria-label={`MyClaim India on ${s.label}`}
                  className="w-10 h-10 rounded-full bg-white border border-slate-200/90 shadow-sm flex items-center justify-center text-slate-700 hover:text-white hover:bg-[#2FBF71] hover:border-[#2FBF71] transition-all duration-300">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill={s.stroke ? 'none' : 'currentColor'} stroke={s.stroke ? 'currentColor' : 'none'} strokeWidth={s.stroke ? 2 : 0}>{s.icon}</svg>
                </a>
              ))}
            </div>
          </div>

          {/* Google Map */}
          <div className="h-80 lg:h-auto min-h-64 border-t lg:border-t-0 lg:border-l border-slate-200">
            <iframe
              src="https://maps.google.com/maps?q=Altair%20by%20SVK%20Associates,%20Dumas%20Road,%20Piplod,%20Surat,%20Gujarat%20395007&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%" height="100%"
              style={{ border: 0, display: 'block', minHeight: '340px' }}
              allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="MyClaim India Headquarters - Altair, Dumas Road, Surat"
            />
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="mb-5">
                <a href="/" aria-label="MyClaim India – Home">
                  <img
                    src="/myclaim-logo.jpg"
                    alt="MyClaim India"
                    className="h-16 sm:h-20 w-auto object-contain bg-white rounded-xl p-1"
                  />
                </a>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Trusted advisors helping Indian citizens and NRIs recover lost investments - from IEPF claims and physical share certificates to legal succession support.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-[#1C1C1C] font-bold mb-5 text-sm uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-3">
                {[
                  { label: 'About Us', href: '/who-we-are' },
                  { label: 'Contact Us', href: '/#contact' },
                  { label: 'IEPF Claims', href: '/#services' },
                  { label: 'NRI Support', href: '/#services' },
                  { label: 'Become Associate', href: '/become-associate' },
                  { label: 'Blogs', href: '/#resources' },
                  { label: 'Case Studies', href: '/#resources' }
                ].map(link => (
                  <li key={link.label}><a href={link.href} className="text-slate-600 hover:text-[#2FBF71] text-sm transition-colors">{link.label}</a></li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-[#1C1C1C] font-bold mb-5 text-sm uppercase tracking-wider">Services</h4>
              <ul className="space-y-3">
                {['IEPF Claims', 'Demat of Shares', 'Duplicate Shares', 'Succession Certificate', 'NRI Assistance', 'Hereditary Claims', 'Legal Support'].map(link => (
                  <li key={link}><a href="#services" className="text-slate-600 hover:text-[#2FBF71] text-sm transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-[#1C1C1C] font-bold mb-5 text-sm uppercase tracking-wider">Stay Updated</h4>
              <p className="text-slate-500 text-sm mb-4 leading-relaxed">
                Subscribe to our newsletter to get regulatory updates and guides on recovering unclaimed investments.
              </p>
              <form className="flex flex-col gap-2.5">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#1C1C1C] placeholder-slate-400 outline-none focus:border-[#2FBF71] transition-colors"
                />
                <button
                  type="submit"
                  className="py-3 rounded-full bg-[#2FBF71] hover:bg-[#26aa62] text-white font-bold text-sm shadow-sm transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 py-6 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <p className="text-slate-500 text-xs sm:text-sm">© 2026 MyClaim India. All rights reserved.</p>
            <p className="text-slate-400 text-xs max-w-xl">MyClaim India provides advisory and claim-assistance services. Outcomes depend on the facts of each case and the decisions of the relevant authorities.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
