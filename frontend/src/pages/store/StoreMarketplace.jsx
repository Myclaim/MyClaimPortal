import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter, Star, Zap, Shield, ChevronRight, ArrowRight } from 'lucide-react';
import api from '../../services/api';

const StoreMarketplace = ({ title, vertical }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const mockProducts = {
    claim: [
      { id: 1, name: 'IEPF Share Recovery Bundle', price: '4,999', rating: 4.8, sales: '2.4k', img: '📄', color: '#15803d' },
      { id: 2, name: 'Physical to Demat Kit', price: '1,299', rating: 4.9, sales: '1.8k', img: '💳', color: '#3b82f6' },
      { id: 3, name: 'Succession Certificate Pro', price: '9,999', rating: 4.7, sales: '900+', img: '⚖️', color: '#8b5cf6' },
    ],
    service: [
      { id: 4, name: 'GST Filing Annual', price: '2,499', rating: 4.9, sales: '5k+', img: '📊', color: '#10b981' },
      { id: 5, name: 'Corporate Compliance', price: '14,999', rating: 4.6, sales: '400+', img: '🏢', color: '#ef4444' },
    ],
    pre_ipo: [
      { id: 6, name: 'HDFC Securities Pre-IPO', price: '750/sh', rating: 4.9, sales: 'Excl', img: '📈', color: '#0ea5e9' },
      { id: 7, name: 'Swiggy Private Equity', price: '380/sh', rating: 4.5, sales: 'Hot', img: '🍔', color: '#f43f5e' },
    ]
  };

  useEffect(() => {
    setTimeout(() => {
      setProducts(mockProducts[vertical] || []);
      setLoading(false);
    }, 700);
  }, [vertical]);

  return (
    <div className="page active" style={{ display: 'block' }}>
      <style>{`
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
        .product-card { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .product-card:hover { transform: translateY(-10px) scale(1.02); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1); border-color: #15803d; }
        .gradient-text { background: linear-gradient(90deg, #15803d, #22c55e); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      `}</style>

      <div className="topbar">
        <div>
          <div className="topbar-title">{title}</div>
          <div className="topbar-subtitle">Premium curated bundles and exclusive investment opportunities</div>
        </div>
        <div className="topbar-spacer"></div>
        <button className="topbar-btn secondary"><ShoppingCart size={16} /> Cart (0)</button>
      </div>

      <div className="content">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
          <div className="search-input" style={{ flex: 1, border: '1px solid var(--border)', background: 'var(--card)' }}><Search size={18} color="#22c55e" /><input type="text" placeholder="Search premium services..." style={{ background: 'transparent', color: 'var(--text)' }} /></div>
          <button className="export-btn" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}><Filter size={16} /> Filters</button>
        </div>

        <div className="grid-3" style={{ gap: '32px' }}>
          {loading ? (
             [1,2,3].map(i => <div key={i} className="card" style={{ height: '350px', background: 'var(--card)', animation: 'pulse 1.5s infinite' }}></div>)
          ) : products.map((p, i) => (
            <div key={p.id} className="card product-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
               <div style={{ height: '180px', background: `${p.color}05`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px', position: 'relative' }}>
                  <div style={{ animation: 'float 3s ease-in-out infinite' }}>{p.img}</div>
                  <div style={{ position: 'absolute', top: '16px', right: '16px', padding: '4px 12px', borderRadius: '20px', background: 'var(--card)', border: '1px solid var(--border)', fontSize: '12px', fontWeight: 800, color: '#22c55e', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>NEW</div>
               </div>
               
               <div style={{ padding: '24px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                     <Shield size={10} /> Certified Bundle
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px', height: '44px', overflow: 'hidden', color: 'var(--text)' }}>{p.name}</h3>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 700 }}>
                        <Star size={14} fill="#0d9488" color="#0d9488" /> {p.rating}
                     </div>
                     <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>• {p.sales} Sold</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>STARTING FROM</div>
                        <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text)' }}>₹{p.price}</div>
                     </div>
                     <button style={{ width: '44px', height: '44px', borderRadius: '12px', border: 'none', background: '#15803d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 8px 15px -5px rgba(21, 128, 61, 0.4)' }}>
                        <ArrowRight size={20} />
                     </button>
                  </div>
               </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginTop: '60px', padding: '40px', background: 'linear-gradient(135deg, #0f172a 0%, #166534 100%)', color: '#fff', position: 'relative', overflow: 'hidden', border: 'none' }}>
           <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#4ade80', marginBottom: '8px' }}>EXCLUSIVE MEMBERSHIP</div>
              <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '16px', color: '#fff' }}>Want access to early-stage <br/> <span style={{ color: '#22c55e' }}>Pre-IPO opportunities?</span></h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '500px', marginBottom: '24px' }}>Join our elite circle of investors and be the first to know about high-growth private equity deals in the Indian startup ecosystem.</p>
              <button style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: '#22c55e', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 20px rgba(34, 197, 94, 0.3)' }}>Upgrade to Premium <ChevronRight size={18} /></button>
           </div>
           <div style={{ position: 'absolute', right: '-10%', top: '-20%', fontSize: '300px', opacity: 0.1 }}><Zap /></div>
        </div>
      </div>
    </div>
  );
};

export default StoreMarketplace;
