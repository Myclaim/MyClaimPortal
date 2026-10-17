import { useState } from 'react';

const blogs = [
  { id: 'tata-steel', tags: ['tata','tatasteel','iepf','unclaim'], img: '/assets/blog-tata-steel.png', title: '₹1000 Crore Worth of Unclaimed Shares in Tata Steel Ltd\'s IEPF Account!', excerpt: 'If you own shares in Tata Steel Ltd., ensure you have claimed and received your dividends. If dividends on TATASTEEL shares remain unclaimed for seven consecutive years or more, your shares will be transferred to a government fund.', date: '12/04/2023', tagLabels: ['TATA','TATASTEEL','IEPF','UNCLAIM'] },
  { id: 'jsw-steel', tags: ['jsw','jswsteel','iepf','unclaim'], img: '/assets/blog-jsw.png', title: '₹1,500 Crore Worth of Unclaimed Shares in JSW Steel Ltd\'s IEPF Account', excerpt: 'If you hold old physical share certificates or legacy demat folios in JSW Steel Ltd., check if your unpaid dividends caused statutory transfer to the IEPF.', date: '15 Aug 2024', tagLabels: ['JSW','JSW STEEL','IEPF','UNCLAIM'] },
  { id: 'reliance', tags: ['reliance','iepf','unclaim'], img: '/assets/blog-reliance.png', title: '10,000 Crore Worth of Shares Lying Unclaimed in the IEPF Account of Reliance Industries Ltd.', excerpt: 'Reliance Industries Limited holds the largest corpus of unclaimed equity in India. Decades of bonus issues and demergers mean original physical certificates may now be worth millions.', date: '14 Aug 2024', tagLabels: ['RELIANCE','IEPF','UNCLAIM'] },
  { id: 'hdfc-bank', tags: ['hdfc','hdfcbank','unclaim','iepf'], img: '/assets/blog-hdfc.png', title: 'HDFC Bank\'s IEPF Account Holds Unclaimed Shares Valued at 1,700 Crore!', excerpt: 'If you or your parents held old bank shares or physical certificates in HDFC Bank Limited, verify if uncashed dividend warrants led to transfer.', date: '15 Aug 2024', tagLabels: ['HDFC','HDFC BANK','UNCLAIM','IEPF'] },
  { id: 'hul', tags: ['hul','hindustanunilever','iepf','unclaim'], img: '/assets/blog-hul.png', title: 'Hindustan Unilever Ltd\'s IEPF Account Holds Unclaimed Shares Valued at ₹1,570 Crore!', excerpt: 'Generations of Indian families purchased HUL (formerly Brooke Bond / Lipton / Pond\'s) shares. Trace forgotten folios, resolve signature mismatches, and reclaim your wealth.', date: '15 Aug 2024', tagLabels: ['HUL','HINDUSTAN UNILEVER','IEPF','UNCLAIM'] },
];

const filterBtns = [
  { key: 'all', label: 'Show All' }, { key: 'tata', label: 'TATA Steel' }, { key: 'jsw', label: 'JSW Steel' },
  { key: 'reliance', label: 'Reliance' }, { key: 'hdfc', label: 'HDFC Bank' }, { key: 'hul', label: 'Hindustan Unilever' },
  { key: 'iepf', label: 'IEPF Claims' }, { key: 'unclaim', label: 'Unclaimed Shares' },
];

export default function Blogs() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? blogs : blogs.filter(b => b.tags.includes(filter));

  return (
    <section id="resources" className="py-24 bg-[#F8F9FB] border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden mb-12 p-8 sm:p-12 bg-white border border-slate-200/90 shadow-md">
          <div className="relative z-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-[#2FBF71] text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-300/60">
              ✦ Market Intelligence & Case Studies
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1C1C1C] mb-4">Corporate Share Recovery & IEPF Insights</h2>
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl">Forensic analysis, statutory updates, and step-by-step recovery guides for unclaimed shares and dividends across India's premier listed conglomerates.</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-2 mb-10">
          {filterBtns.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${filter === f.key
                ? 'bg-[#2FBF71] text-white shadow-md shadow-emerald-500/20'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-400'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Feed */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {filtered.map(post => (
              <article key={post.id} className="group flex flex-col sm:flex-row gap-6 p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-[#2FBF71]/60 hover:shadow-lg transition-all duration-300">
                <div className="sm:w-44 h-32 shrink-0 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center p-3 border border-slate-100">
                  <img src={post.img} alt={post.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"/>
                </div>
                <div className="flex flex-col gap-2.5 flex-1">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {post.tagLabels.map(t => <span key={t} className="text-[11px] font-bold text-[#2FBF71] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">{t}</span>)}
                    <span className="text-xs text-slate-400 ml-auto">📅 {post.date}</span>
                  </div>
                  <h3 className="font-bold text-[#1C1C1C] group-hover:text-[#2FBF71] transition-colors leading-snug text-base sm:text-lg">{post.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-2">{post.excerpt}</p>
                  <button className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2FBF71] hover:text-[#26aa62] transition-colors w-fit mt-1">
                    Read Insights
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-6">
            {/* Recent Posts */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
              <h4 className="font-bold text-[#1C1C1C] mb-4 text-xs uppercase tracking-wider">Recent Posts</h4>
              <div className="flex flex-col gap-4">
                {blogs.slice(0).reverse().slice(0, 5).map(b => (
                  <a key={b.id} href="#resources" className="group flex gap-3 items-start hover:opacity-80 transition-opacity">
                    <div className="w-12 h-10 shrink-0 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center p-1">
                      <img src={b.img} alt="" className="w-full h-full object-contain"/>
                    </div>
                    <div>
                      <h5 className="text-xs text-slate-700 group-hover:text-[#2FBF71] transition-colors leading-snug line-clamp-2 font-medium">{b.title}</h5>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">{b.date}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Testimonial */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
              <h4 className="font-bold text-[#1C1C1C] mb-3 text-xs uppercase tracking-wider">Client Spotlight</h4>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#2FBF71] flex items-center justify-center font-bold text-xs">JP</div>
                <div>
                  <p className="text-[#1C1C1C] font-bold text-sm">Jimmy Panthaki</p>
                  <p className="text-[#C9A227] text-xs">★★★★★</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 italic leading-relaxed">"During the Surat flood, I lost my share certificates for DCW, Exide Industries, and ACC Ltd. MyClaim India stepped in to help with the duplication process."</p>
            </div>

            {/* Quick Contact */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
              <h4 className="font-bold text-[#1C1C1C] mb-3 text-xs uppercase tracking-wider">Quick Inquiry</h4>
              <form className="flex flex-col gap-3">
                <input type="text" placeholder="Full Name" className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-[#1C1C1C] placeholder-slate-400 outline-none focus:border-[#2FBF71] transition-colors"/>
                <input type="email" placeholder="Email Address" className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-[#1C1C1C] placeholder-slate-400 outline-none focus:border-[#2FBF71] transition-colors"/>
                <textarea rows={3} placeholder="Message" className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-[#1C1C1C] placeholder-slate-400 outline-none focus:border-[#2FBF71] transition-colors resize-none"/>
                <button type="submit" className="w-full py-3 rounded-full bg-[#2FBF71] text-white font-bold text-xs hover:bg-[#26aa62] shadow-sm transition-colors">Submit Message</button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
