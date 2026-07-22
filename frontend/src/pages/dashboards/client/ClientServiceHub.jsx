import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  X,
  Plus
} from 'lucide-react';
import api from '../../../services/api';
import CreateTicketModal from '../../../components/forms/CreateTicketModal';

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

/* ─── Status badge config ─────────────────────────────────────── */
const statusConfig = {
  Active:      { label: 'Active',      color: C.green,    bg: C.greenSoft },
  'In Progress':{ label: 'In Progress', color: '#F59E0B',  bg: 'rgba(245,158,11,0.10)' },
  Pending:     { label: 'Pending',     color: '#A855F7',   bg: 'rgba(168,85,247,0.10)' },
  Completed:   { label: 'Completed',   color: '#22C55E',   bg: 'rgba(34,197,94,0.10)' },
  Inactive:    { label: 'Inactive',    color: '#71717A',   bg: 'rgba(113,113,122,0.10)' },
};

/* ─── Service Card ─────────────────────────────────────────────── */
const ServiceCard = ({ service, onSelect }) => {
  const Icon = pickIcon(service.name || service.title || '');
  const statusKey = service.status || 'Active';
  const st = statusConfig[statusKey] || statusConfig['Active'];
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => onSelect(service)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? C.bgCard2 : C.bgCard, backgroundImage: C.bgCardImage, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${hovered ? C.borderGreen : C.border}`,
        borderRadius: 16,
        padding: 20,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: hovered ? `0 8px 32px rgba(16,185,129,0.08)` : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow dot top-right */}
      {hovered && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: 80, height: 80,
          background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
      )}

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: C.greenSoft,
          border: `1px solid ${C.borderGreen}`,
          display: 'grid', placeItems: 'center',
          color: C.green, flexShrink: 0,
        }}>
          <Icon size={20} />
        </div>

        {/* Status badge */}
        <div style={{
          padding: '4px 10px', borderRadius: 999,
          background: st.bg, color: st.color,
          fontSize: 10, fontWeight: 800,
          letterSpacing: '0.04em',
        }}>
          {st.label}
        </div>
      </div>

      {/* Title */}
      <div style={{ fontWeight: 800, color: C.text, fontSize: 14, marginBottom: 6, lineHeight: 1.3 }}>
        {service.name || service.title || 'Service'}
      </div>

      {/* Description */}
      <div style={{
        fontSize: 12, color: C.textMuted, lineHeight: 1.5,
        marginBottom: 16,
        display: '-webkit-box', WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {service.description || 'Professional claim recovery and legal assistance service.'}
      </div>

      {/* Meta row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 11, fontWeight: 700, color: C.green,
          opacity: hovered ? 1 : 0.6, transition: 'opacity 0.2s',
        }}>
          Get Started <ChevronRight size={14} />
        </div>
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
              Claim Hub › Details
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
          <button style={{
            width: '100%', padding: '13px',
            background: `linear-gradient(135deg, ${C.greenDark}, ${C.green})`,
            border: 'none', borderRadius: 12,
            color: 'C.bg', fontWeight: 800, fontSize: 14,
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
  const navigate = useNavigate();
  const [services, setServices]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filter, setFilter]           = useState('All');
  const [selected, setSelected]       = useState(null);
  const [refreshing, setRefreshing]   = useState(false);
  const [showModal, setShowModal]     = useState(false);

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
    <div style={{ flexGrow: 1, minHeight: 'max-content', backgroundColor: C.bg, backgroundImage: C.bgImage, color: C.text, padding: '24px' }}>

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
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#000',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '13px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(16, 185, 129, 0.3)';
              e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(16, 185, 129, 0.2)';
              e.currentTarget.style.background = 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
            }}
          >
            <Plus size={16} /> New Ticket
          </button>
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
          { label: 'Total Claims Available',  value: services.length, color: C.text    },
          { label: 'Physical Shares', value: services.filter(s => s.category === 'Physical Shares').length, color: C.green },
          { label: 'Dividends',       value: services.filter(s => s.category === 'Dividends').length, color: '#F59E0B' },
          { label: 'Other',           value: services.filter(s => s.category !== 'Physical Shares' && s.category !== 'Dividends').length,  color: '#22C55E' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            backgroundColor: C.bgCard, backgroundImage: C.bgCardImage, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid ${C.border}`,
            borderRadius: 14, padding: '14px 16px',
          }}>
            <div style={{ fontSize: 22, fontWeight: 900, color, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── Search + Filter bar ─────────────────────────── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {/* Search input */}
        <div style={{
          flex: 1, minWidth: 200,
          backgroundColor: C.bgCard, backgroundImage: C.bgCardImage, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid ${C.border}`,
          borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px',
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
              style={{
                padding: '8px 14px', borderRadius: 999,
                background: filter === cat ? C.green : C.bgCard,
                border: `1px solid ${filter === cat ? C.green : C.border}`,
                color: filter === cat ? 'C.bg' : C.textSub,
                fontSize: 11, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.18s',
              }}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {filtered.map((svc, i) => (
            <ServiceCard key={svc._id || svc.id || i} service={svc} onSelect={setSelected} />
          ))}
        </div>
      )}

      {/* ── Detail panel ────────────────────────────────── */}
      {selected && <DetailPanel service={selected} onClose={() => setSelected(null)} />}

      {showModal && (
        <CreateTicketModal 
          onClose={() => setShowModal(false)} 
          onSuccess={() => {
            alert('Ticket created successfully!');
            navigate('/client?tab=services');
          }} 
        />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
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
