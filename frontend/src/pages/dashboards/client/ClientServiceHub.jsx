import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  Star,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Zap,
  Shield,
  FileText,
  TrendingUp,
  Users,
  Package,
  Globe,
  RefreshCw,
  Filter,
  X
} from 'lucide-react';
import api from '../../../services/api';

/* ─── Design Tokens (Black & Green) ──────────────────────────── */
const C = {
  bg:          'var(--dashboard-bg)',
  bgImage:     'var(--dashboard-bg-image)',
  bgCard:      'var(--dashboard-card)',
  bgCardImage: 'var(--dashboard-card-image)',
  bgCard2:     'var(--dashboard-card-soft)',
  border:      'var(--dashboard-border)',
  borderGreen: 'rgba(16,185,129,0.25)',
  text:        'var(--dashboard-text)',
  textMuted:   'var(--dashboard-text-muted)',
  textSub:     'var(--dashboard-text-muted)',
  green:       'var(--dashboard-accent)',
  greenSoft:   'rgba(16,185,129,0.10)',
  greenGlow:   'rgba(16,185,129,0.18)',
  greenDark:   '#059669',
};

/* ─── Icon Map ─────────────────────────────────────────────────── */
const iconMap = {
  'iepf': Shield,
  'mutual': TrendingUp,
  'dividend': TrendingUp,
  'document': FileText,
  'legal': Shield,
  'share': TrendingUp,
  'recovery': RefreshCw,
  'family': Users,
  'nomination': Users,
  'transfer': Package,
  'default': Zap,
};

function pickIcon(name = '') {
  const lower = name.toLowerCase();
  for (const [key, Icon] of Object.entries(iconMap)) {
    if (lower.includes(key)) return Icon;
  }
  return iconMap.default;
}

/* ─── Category Colors ─────────────────────────────────────────── */
const catColors = {
  'Physical Shares': { main: '#10B981', soft: 'rgba(16, 185, 129, 0.15)', glow: 'rgba(16, 185, 129, 0.3)', grad: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)' },
  'Dividends':       { main: '#10B981', soft: 'rgba(16, 185, 129, 0.15)', glow: 'rgba(16, 185, 129, 0.3)', grad: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)' },
  'Insurance':       { main: '#10B981', soft: 'rgba(16, 185, 129, 0.15)', glow: 'rgba(16, 185, 129, 0.3)', grad: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)' },
  'default':         { main: '#10B981', soft: 'rgba(16, 185, 129, 0.15)', glow: 'rgba(16, 185, 129, 0.3)', grad: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)' }
};

function getCatColor(cat) {
  return catColors[cat] || catColors.default;
}

/* ─── Particles Configuration ─────────────────────────────────────── */
const PARTICLES = [
  { size: 6, color: 'rgba(243, 159, 90, 0.25)', x: '5%', delay: '0s', dur: '8s' },
  { size: 4, color: 'rgba(52, 211, 153, 0.2)', x: '15%', delay: '1.5s', dur: '10s' },
  { size: 8, color: 'rgba(174, 68, 90, 0.25)', x: '25%', delay: '3s', dur: '7s' },
  { size: 5, color: 'rgba(139, 92, 246, 0.3)', x: '35%', delay: '0.5s', dur: '9s' },
  { size: 3, color: 'rgba(243, 159, 90, 0.2)', x: '45%', delay: '2s', dur: '6s' },
  { size: 7, color: 'rgba(16, 185, 129, 0.25)', x: '55%', delay: '4s', dur: '11s' },
  { size: 5, color: 'rgba(52, 211, 153, 0.25)', x: '65%', delay: '1s', dur: '8.5s' },
  { size: 9, color: 'rgba(139, 92, 246, 0.2)', x: '75%', delay: '2.5s', dur: '12s' },
  { size: 4, color: 'rgba(243, 159, 90, 0.3)', x: '85%', delay: '5s', dur: '9.5s' },
  { size: 6, color: 'rgba(16, 185, 129, 0.2)', x: '95%', delay: '0.8s', dur: '7.5s' },
  { size: 7, color: 'rgba(52, 211, 153, 0.15)', x: '12%', delay: '6s', dur: '13s' },
  { size: 4, color: 'rgba(174, 68, 90, 0.2)', x: '32%', delay: '3.5s', dur: '8.2s' },
  { size: 8, color: 'rgba(139, 92, 246, 0.25)', x: '52%', delay: '1.2s', dur: '10.5s' },
  { size: 5, color: 'rgba(16, 185, 129, 0.3)', x: '72%', delay: '4.5s', dur: '7.8s' },
  { size: 6, color: 'rgba(243, 159, 90, 0.2)', x: '92%', delay: '2.8s', dur: '11.5s' },
];

/* ─── Status badge config ─────────────────────────────────────── */
const statusConfig = {
  Active:      { label: 'Active',      color: C.green,    bg: C.greenSoft },
  'In Progress':{ label: 'In Progress', color: '#F59E0B',  bg: 'rgba(245,158,11,0.10)' },
  Pending:     { label: 'Pending',     color: '#A855F7',   bg: 'rgba(168,85,247,0.10)' },
  Completed:   { label: 'Completed',   color: '#22C55E',   bg: 'rgba(34,197,94,0.10)' },
  Inactive:    { label: 'Inactive',    color: '#71717A',   bg: 'rgba(113,113,122,0.10)' },
};

const ServiceCard = ({ service, onSelect, index = 0 }) => {
  const Icon = pickIcon(service.name || service.title || '');
  const statusKey = service.status || 'Active';
  const st = statusConfig[statusKey] || statusConfig['Active'];
  const [hovered, setHovered] = useState(false);
  
  const theme = getCatColor(service.category);
  const initials = (service.name || service.title || 'S').split(' ').map(n => n[0]).join('').slice(0, 2);
  const ribbonColor = `linear-gradient(90deg, ${theme.main}, ${theme.main}88)`;
  const orbColor = theme.main;

  return (
    <div
      className="claim-card cursor-spotlight-card"
      onClick={() => onSelect(service)}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        animation: `cardRise 0.55s cubic-bezier(.34,1.56,.64,1) ${index * 50}ms both`
      }}
    >
      {/* ribbon top */}
      <div className="card-ribbon" style={{ background: ribbonColor }} />

      {/* floating glow orb */}
      <div className="card-orb" style={{
        width: 140, height: 140, top: -50, right: -40,
        background: `radial-gradient(circle, ${orbColor}22 0%, transparent 70%)`,
        opacity: hovered ? 1 : 0.5, transition: 'opacity 0.4s ease'
      }} />
      <div className="card-orb" style={{
        width: 80, height: 80, bottom: 10, left: -20,
        background: `radial-gradient(circle, ${orbColor}15 0%, transparent 70%)`,
        opacity: hovered ? 0.8 : 0.3, transition: 'opacity 0.4s ease 0.1s'
      }} />

      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="claim-avatar" style={{
            width: 46, height: 46, borderRadius: 14,
            background: `linear-gradient(135deg, ${orbColor}30, ${orbColor}08)`,
            border: `1.5px solid ${orbColor}40`,
            color: orbColor, display: 'grid', placeItems: 'center',
            fontWeight: 900, fontSize: 14, flexShrink: 0,
            boxShadow: `0 6px 18px ${orbColor}25`
          }}>{initials}</div>
          <div>
            <div style={{ fontWeight: 900, color: C.text, fontSize: 15, letterSpacing: '-0.4px', lineHeight: 1.2, wordBreak: 'break-word', transition: 'color 0.3s' }}>
              {service.name || service.title || 'Service'}
            </div>
            <div style={{ fontSize: 10, color: C.textMuted, marginTop: 3, fontWeight: 600, letterSpacing: '0.02em' }}>
              {service.category || 'Service Category'}
            </div>
          </div>
        </div>
        <div className="holographic-badge" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 999,
          background: st.bg, color: st.color, border: `1px solid ${st.color}40`,
          fontSize: 10, fontWeight: 800, whiteSpace: 'nowrap',
          animation: 'floatBadge 3.5s ease infinite'
        }}>
          {st.label}
        </div>
      </div>

      <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {service.description || 'Professional claim recovery and legal assistance service.'}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted }}>Duration</span>
          <span style={{ fontSize: '11px', fontWeight: 800, color: orbColor }}>{service.stages || 4} Stages</span>
        </div>
        <div style={{
          width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '999px', overflow: 'hidden'
        }}>
          <div style={{
            width: '100%', height: '100%', background: orbColor,
            borderRadius: '999px', transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            transformOrigin: 'left',
            transform: hovered ? 'scaleX(1)' : 'scaleX(0.7)'
          }} />
        </div>
      </div>

      {/* buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: '4px' }}>
        <button className="claim-btn-primary liquid-btn" style={{ background: `linear-gradient(135deg, ${orbColor}, ${orbColor}dd)`, boxShadow: `0 4px 16px ${orbColor}55`, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: 'none', padding: '10px 16px', borderRadius: '12px', color: '#fff', fontWeight: 800, fontSize: 12, cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform='scale(1.02)'} onMouseLeave={(e) => e.currentTarget.style.transform='scale(1)'}>
          <Icon size={14} /> Request Service
        </button>
      </div>
    </div>
  );
};

/* ─── Service Detail Side Panel ───────────────────────────────── */
const DetailPanel = ({ service, onClose }) => {
  if (!service) return null;
  const Icon = pickIcon(service.name || service.title || '');
  const statusKey = service.status || 'Active';
  const st = statusConfig[statusKey] || statusConfig['Active'];

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
          zIndex: 1000,
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0,
        width: 420, maxWidth: '95vw', height: '100vh',
        backgroundColor: C.bgCard, backgroundImage: C.bgCardImage, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderLeft: `1px solid ${C.border}`,
        boxShadow: '-16px 0 60px rgba(0,0,0,0.5)',
        zIndex: 1001,
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

        {/* Header */}
        <div style={{
          padding: '24px 24px 20px',
          borderBottom: `1px solid ${C.border}`,
          background: `linear-gradient(135deg, ${C.greenSoft} 0%, transparent 60%)`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Service Hub › Details
            </div>
            <button onClick={onClose} style={{
              background: 'var(--border)', border: `1px solid ${C.border}`,
              borderRadius: 8, width: 32, height: 32, display: 'grid', placeItems: 'center',
              color: C.textMuted, cursor: 'pointer',
            }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: C.greenSoft, border: `1px solid ${C.borderGreen}`,
              display: 'grid', placeItems: 'center', color: C.green, flexShrink: 0,
            }}>
              <Icon size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 18, color: C.text, lineHeight: 1.2, marginBottom: 6 }}>
                {service.name || service.title}
              </div>
              <div style={{
                display: 'inline-flex', padding: '4px 10px', borderRadius: 999,
                background: st.bg, color: st.color, fontSize: 10, fontWeight: 800,
              }}>
                {st.label}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {/* Description */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
              About this service
            </div>
            <p style={{ fontSize: 13, color: C.textSub, lineHeight: 1.7, margin: 0 }}>
              {service.description || 'Professional service to help you recover and manage your claims effectively with expert legal assistance.'}
            </p>
          </div>

          {/* Details grid */}
          <div style={{
            backgroundColor: C.bgCard2, backgroundImage: C.bgCardImage, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid ${C.border}`,
            borderRadius: 12, padding: 16, marginBottom: 24,
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
          }}>
            {service.category && (
              <div>
                <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Category</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{service.category}</div>
              </div>
            )}
            {service.duration && (
              <div>
                <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Duration</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{service.duration}</div>
              </div>
            )}
            {service.type && (
              <div>
                <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Type</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{service.type}</div>
              </div>
            )}
          </div>

          {/* Features / checkpoints */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
              What's included
            </div>
            {[
              'Expert legal consultation',
              'Document verification & collection',
              'End-to-end process management',
              'Status updates & notifications',
              'Post-claim support',
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                <CheckCircle2 size={15} color={C.green} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: C.textSub }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '20px 24px', borderTop: `1px solid ${C.border}` }}>
          <button 
            className="liquid-btn"
            onMouseEnter={(e) => e.currentTarget.style.transform='scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform='scale(1)'}
            onClick={(e) => {
              const btn = e.currentTarget;
              const circle = document.createElement('span');
              const diameter = Math.max(btn.clientWidth, btn.clientHeight);
              const radius = diameter / 2;
              const rect = btn.getBoundingClientRect();
              circle.style.width = circle.style.height = `${diameter}px`;
              circle.style.left = `${e.clientX - rect.left - radius}px`;
              circle.style.top = `${e.clientY - rect.top - radius}px`;
              circle.classList.add('ripple');
              const existing = btn.querySelector('.ripple');
              if (existing) existing.remove();
              btn.appendChild(circle);
              setTimeout(() => circle.remove(), 600);
            }}
            style={{
            width: '100%', padding: '13px',
            background: `linear-gradient(135deg, ${C.greenDark}, ${C.green})`,
            border: 'none', borderRadius: 12,
            color: '#ffffff', fontWeight: 800, fontSize: 14,
            cursor: 'pointer', boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
            transition: 'all 0.2s',
          }}>
            Request This Service
          </button>
        </div>
      </div>
    </>
  );
};

/* ─── Main Component ──────────────────────────────────────────── */
const ClientServiceHub = ({ user, onBack }) => {
  const [services, setServices]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filter, setFilter]           = useState('All');
  const [selected, setSelected]       = useState(null);
  const [refreshing, setRefreshing]   = useState(false);

  /* Fetch claim store services from backend */
  const fetchServices = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await api.get('/department-services?type=claim');
      let rawServices = res.data;
      if (!rawServices || rawServices.length === 0) {
        rawServices = FALLBACK_SERVICES;
      }
      const mappedClaims = rawServices.filter(s => s.status !== false).map(s => ({
        _id: s._id || s.id,
        name: s.name,
        title: s.name,
        description: s.description,
        status: 'Active',
        category: s.category,
        price: s.price,
        originalItem: s
      }));
      setServices(mappedClaims);
    } catch (err) {
      console.error(err);
      // Fallback if API fails completely
      const mappedClaims = FALLBACK_SERVICES.filter(s => s.status !== false).map(s => ({
        _id: s.id,
        name: s.name,
        title: s.name,
        description: s.description,
        status: 'Active',
        category: s.category,
        price: s.price,
        originalItem: s
      }));
      setServices(mappedClaims);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  /* Filter & search */
  const categories = ['All', ...Array.from(new Set(services.map(s => s.category).filter(Boolean)))];
  const filtered = services.filter(s => {
    const matchSearch = !search ||
      (s.name || s.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.description || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || s.category === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ position: 'relative', overflow: 'hidden', flexGrow: 1, minHeight: 'max-content', backgroundColor: C.bg, backgroundImage: C.bgImage, color: C.text, padding: '24px', zIndex: 1 }}>

      {/* ── Ambient Background Blobs ── */}
      <div style={{ position: 'absolute', top: '-10%', left: '0%', width: '35vw', height: '35vw', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: -1, animation: 'ambientMove1 20s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '-15%', right: '5%', width: '45vw', height: '45vw', background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)', pointerEvents: 'none', zIndex: -1, animation: 'ambientMove2 25s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', top: '15%', right: '25%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%)', pointerEvents: 'none', zIndex: -1, animation: 'ambientMove3 18s ease-in-out infinite' }} />

      {/* ── Floating particles ── */}
      {PARTICLES.map((p, i) => (
        <div key={i} className="particle" style={{
          width: p.size, height: p.size,
          background: p.color, left: p.x, bottom: 0,
          animationDuration: p.dur, animationDelay: p.delay, zIndex: -1
        }} />
      ))}

      {/* ── Top bar ────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <button
          onClick={onBack}
          style={{
            backgroundColor: C.bgCard, backgroundImage: C.bgCardImage, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid ${C.border}`,
            borderRadius: 10, width: 38, height: 38,
            display: 'grid', placeItems: 'center',
            color: C.textMuted, cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, margin: 0, color: C.text, letterSpacing: '-0.3px' }}>
            Claim Hub
          </h1>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>
            View your generated claims
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button
            onClick={() => fetchServices(true)}
            disabled={refreshing}
            style={{
              backgroundColor: C.bgCard, backgroundImage: C.bgCardImage, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid ${C.border}`,
              borderRadius: 10, width: 38, height: 38,
              display: 'grid', placeItems: 'center',
              color: C.textMuted, cursor: 'pointer',
            }}
          >
            <RefreshCw size={15} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
      </div>

      {/* ── Stats strip ────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: 12, marginBottom: 24,
      }}>
        {[
          { label: 'Total Claims Available',  value: services.length, color: '#34D399', shadow: 'rgba(52, 211, 153, 0.2)', Icon: FileText },
          { label: 'Physical Shares', value: services.filter(s => s.category === 'Physical Shares').length, color: '#8B5CF6', shadow: 'rgba(139, 92, 246, 0.2)', Icon: Package },
          { label: 'Dividends',       value: services.filter(s => s.category === 'Dividends').length, color: '#10B981', shadow: 'rgba(16, 185, 129, 0.2)', Icon: TrendingUp },
          { label: 'Other',           value: services.filter(s => s.category !== 'Physical Shares' && s.category !== 'Dividends').length,  color: '#F59E0B', shadow: 'rgba(245, 158, 11, 0.2)', Icon: Zap },
        ].map(({ label, value, color, shadow, Icon }, idx) => (
          <div key={label} 
            className="cursor-spotlight-card stat-chip"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
              e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform='translateY(-6px) scale(1.03)'; e.currentTarget.style.boxShadow=`0 8px 32px ${shadow}`; e.currentTarget.style.borderColor=`${color}88`; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform='translateY(0) scale(1)'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor=`${color}25`; }}
            style={{
            backgroundColor: C.bgCard, backgroundImage: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', 
            border: `1px solid ${color}25`,
            borderRadius: 18, padding: '16px 20px',
            animation: `statPop 0.4s cubic-bezier(.34,1.56,.64,1) ${idx * 20}ms both`,
            transition: 'all 0.35s cubic-bezier(.34,1.56,.64,1)',
            position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start'
          }}>
            <svg style={{ position: 'absolute', right: -10, bottom: -5, width: '130px', height: '60px', opacity: 0.85, pointerEvents: 'none', filter: `drop-shadow(0px 0px 8px ${color}66)` }} viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M0,25 Q15,25 25,15 T50,20 T75,10 T100,5" fill="none" stroke={color} strokeWidth="3" />
            </svg>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: `${color}18`, border: `1px solid ${color}35`,
              display: 'grid', placeItems: 'center', color, marginBottom: 12,
              boxShadow: `0 4px 16px ${color}20`
            }}>
              <Icon size={18} strokeWidth={2.5} />
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color, lineHeight: 1, letterSpacing: '-1.2px', marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── Search + Filter bar ─────────────────────────── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {/* Search input */}
        <div style={{
          flex: 1, minWidth: 200,
          backgroundColor: C.bgCard, backgroundImage: C.bgCardImage, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `2px solid rgba(255, 255, 255, 0.15)`,
          borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          animation: 'fadeSlideUp 0.3s ease 20ms both'
        }}>
          <Search size={15} color={C.textMuted} style={{ flexShrink: 0 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search claims…"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: C.text, fontSize: 13, fontFamily: 'inherit',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, display: 'grid', placeItems: 'center' }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category filter pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {categories.slice(0, 5).map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`category-pill ${filter === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Services Grid ────────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              backgroundColor: C.bgCard, backgroundImage: C.bgCardImage, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid ${C.border}`,
              borderRadius: 16, padding: 20, height: 160,
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          backgroundColor: C.bgCard, backgroundImage: C.bgCardImage, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid ${C.border}`,
          borderRadius: 16,
        }}>
          <Globe size={40} color={C.textMuted} style={{ marginBottom: 14, opacity: 0.5 }} />
          <div style={{ fontWeight: 800, color: C.text, fontSize: 16, marginBottom: 8 }}>No claims found</div>
          <div style={{ color: C.textMuted, fontSize: 13 }}>
            {search ? `No results for "${search}"` : 'No claims available right now.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, alignItems: 'start' }}>
          {filtered.map((svc, i) => (
            <ServiceCard key={svc._id || svc.id || i} service={svc} onSelect={setSelected} index={i} />
          ))}
        </div>
      )}

      {/* ── Detail panel ────────────────────────────────── */}
      {selected && <DetailPanel service={selected} onClose={() => setSelected(null)} />}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes ambientMove1 { 0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.8; } 33% { transform: translate(15vw, 15vh) scale(1.1); opacity: 1; } 66% { transform: translate(-10vw, 20vh) scale(0.9); opacity: 0.7; } }
        @keyframes ambientMove2 { 0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.8; } 33% { transform: translate(-20vw, -10vh) scale(1.2); opacity: 1; } 66% { transform: translate(10vw, -20vh) scale(0.8); opacity: 0.6; } }
        @keyframes ambientMove3 { 0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; } 50% { transform: translate(-15vw, 10vh) scale(1.3); opacity: 1; } }
        @keyframes particleFloat { 0% { transform: translateY(0) rotate(0deg); opacity: 0.6; } 50% { opacity: 0.2; } 100% { transform: translateY(-80px) rotate(180deg); opacity: 0; } }
        .particle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          animation: particleFloat linear infinite;
          z-index: 0;
        }

        /* Category Filter Pills */
        .category-pill {
          padding: 10px 18px; 
          border-radius: 999px;
          font-size: 12px; 
          font-weight: 700; 
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          background: var(--dashboard-card);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: var(--dashboard-text);
          box-shadow: none;
          outline: none;
        }
        
        .category-pill:hover {
          background-color: rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.6);
          color: #ffffff;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
          transform: translateY(-2px);
        }

        .category-pill.active {
          background: #10B981;
          border-color: #10B981;
          color: #030712;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }

        .category-pill.active:hover {
          background: #059669;
          border-color: #059669;
          color: #ffffff;
        }

        /* Claim card styles from Dashboard */
        .claim-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border-radius: 22px; padding: 22px;
          display: flex; flex-direction: column; gap: 16px;
          cursor: default; position: relative; overflow: hidden;
          transform-style: preserve-3d; perspective: 800px;
        }
        .claim-card::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255,0.05) 0%, transparent 55%);
          border-radius: 22px; pointer-events: none; z-index: 0;
        }
        .claim-card > * { position: relative; z-index: 1; }
        .claim-card:hover {
          transform: translateY(-8px) scale(1.015) rotateX(1deg);
          box-shadow: 0 28px 56px -16px rgba(0,0,0,0.55);
        }
        .claim-card .card-ribbon {
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          border-radius: 22px 22px 0 0; overflow: hidden;
        }
        .claim-card .card-ribbon::after {
          content: ''; position: absolute; top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255,0.7), transparent);
          animation: ribbonShine 3s ease infinite;
        }
        .claim-avatar {
          transition: transform 0.35s cubic-bezier(.34,1.56,.64,1), box-shadow 0.35s ease;
        }
        .claim-card:hover .claim-avatar {
          transform: scale(1.18) rotate(-6deg);
          box-shadow: 0 10px 28px rgba(16,185,129,0.45);
        }
        
        /* Orb */
        .card-orb {
          position: absolute; border-radius: 50%;
          pointer-events: none; transition: opacity 0.4s ease;
        }

        /* Buttons */
        .claim-btn-primary {
          border: none; color: #fff;
          padding: 10px 18px; border-radius: 11px;
          font-weight: 800; font-size: 12px; cursor: pointer;
          display: flex; align-items: center; gap: 6px;
          transition: transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.22s ease;
          position: relative; overflow: hidden;
        }
        .claim-btn-primary::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255,0.25), transparent);
          transform: translateX(-100%); transition: transform 0.45s ease;
        }
        .claim-card:hover .claim-btn-primary::after {
          transform: translateX(100%);
        }

        @keyframes ribbonShine {
          0% { left: -100% }
          100% { left: 200% }
        }
        @keyframes cardRise {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

/* ─── Fallback data when API is unavailable ───────────────────── */
const FALLBACK_SERVICES = [
  { id: 'c1', code: 'CLM-IEPF-001', name: 'IEPF Claim Recovery', category: 'Physical Shares', subCategory: 'IEPF Authority', price: 2499, stages: 6, status: true, mappedStore: 'All Stores', description: 'Recover shares & dividends from IEPF', tracking: ['Docs Collected', 'Verification', 'IEPF-5 Filed', 'Authority Review', 'Claim Approved', 'Shares Credited'] },
  { id: 'c2', code: 'CLM-SHR-002', name: 'Share Recovery', category: 'Physical Shares', subCategory: 'Registrar', price: 1999, stages: 5, status: true, mappedStore: 'All Stores', description: 'Recover physical shares', tracking: ['Docs Collected', 'Verification', 'Filed', 'Processing', 'Shares Credited'] },
  { id: 'c3', code: 'CLM-DEM-003', name: 'Dematerialisation', category: 'Physical Shares', subCategory: 'Depository', price: 1499, stages: 5, status: true, mappedStore: 'All Stores', description: 'Convert physical to demat', tracking: ['Docs Collected', 'Verification', 'Filed', 'Processing', 'Shares Credited'] },
  { id: 'c4', code: 'CLM-DUP-004', name: 'Duplicate Certificate', category: 'Physical Shares', subCategory: 'Registrar', price: 1299, stages: 4, status: true, mappedStore: 'All Stores', description: 'Apply for duplicate certificate', tracking: ['Docs Collected', 'Verification', 'Filed', 'Issued'] },
  { id: 'c5', code: 'CLM-TRN-005', name: 'Transmission', category: 'Physical Shares', subCategory: 'Legal Heir', price: 2999, stages: 5, status: true, mappedStore: 'All Stores', description: 'Transmission of shares to legal heir', tracking: ['Docs Collected', 'Verification', 'Filed', 'Processing', 'Transmitted'] },
  { id: 'c6', code: 'CLM-NAM-006', name: 'Name Correction', category: 'Physical Shares', subCategory: 'Registrar', price: 999, stages: 4, status: true, mappedStore: 'All Stores', description: 'Correct name on shares', tracking: ['Docs Collected', 'Verification', 'Filed', 'Corrected'] },
  { id: 'c7', code: 'CLM-DIV-007', name: 'Unclaimed Dividend', category: 'Dividends', subCategory: 'IEPF', price: 1499, stages: 4, status: true, mappedStore: 'All Stores', description: 'Claim unpaid dividend', tracking: ['Docs Collected', 'Verification', 'Filed', 'Credited'] },
  { id: 'c8', code: 'CLM-INS-008', name: 'Insurance Claim', category: 'Insurance', subCategory: 'Life Insurance', price: 3499, stages: 4, status: false, mappedStore: 'All Stores', description: 'Process life insurance claim', tracking: ['Docs Collected', 'Verification', 'Filed', 'Settled'] },
];

export default ClientServiceHub;
