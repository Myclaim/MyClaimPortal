import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Bell, Upload, MessageSquare, Folder, Clock,
  AlertTriangle, CreditCard, RefreshCw, ShoppingBag,
  Plus, Eye, CheckCircle2, TrendingUp, FileText, ArrowRight,
  ArrowLeft, User, Activity, Building2, Star, Zap, ChevronRight,
  GitBranch, TreeDeciduous, X, AlertCircle, Play, Ticket
} from 'lucide-react';
import ClientServiceHub from './ClientServiceHub';
import DocumentsView from '../../../components/documents/DocumentsView';
import AddFamilyMemberModal from '../../../components/forms/AddFamilyMemberModal';
import useAuth from '../../../hooks/useAuth';
import '../../super-admin/Overview.css';

const CL = {
  bg: 'var(--dashboard-bg)',
  bgImage: 'var(--dashboard-bg-image)',
  card: 'var(--dashboard-card)',
  cardBgImage: 'var(--dashboard-card-image)',
  cardSoft: 'var(--dashboard-card-soft)',
  border: 'var(--dashboard-border)',
  text: 'var(--dashboard-text)',
  textMuted: 'var(--dashboard-text-muted)',
  accent: 'var(--dashboard-accent)',
  accentSoft: 'rgba(16, 185, 129, 0.15)',
  green: 'var(--dashboard-accent)',
  greenSoft: 'rgba(16, 185, 129, 0.08)'
};

/* ── helpers ── */
const getStatusBadgeStyle = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return { color: '#10B981', bg: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', dot: '#10B981' };
    case 'in progress': case 'in_progress':
      return { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', dot: '#F59E0B' };
    case 'docs pending': case 'docs_pending': case 'pending':
      return { color: '#818CF8', bg: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.25)', dot: '#818CF8' };
    default:
      return { color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.15)', dot: '#94a3b8' };
  }
};

const getProgressColor = (status) => {
  if (status?.toLowerCase() === 'active') return 'linear-gradient(90deg,#10B981,#059669)';
  if (status?.toLowerCase().includes('progress')) return 'linear-gradient(90deg,#F59E0B,#D97706)';
  return 'linear-gradient(90deg,#F59E0B,#EF4444)';
};

const getProgressLabel = (status, progress) => {
  if (status?.toLowerCase() === 'active') return `${progress}% — Authority Review`;
  if (status?.toLowerCase().includes('progress')) return `${progress}% — Verification`;
  return `${progress}% — Docs Collection`;
};

const getNSE = (name) => {
  const map = { 'TATA STEEL': 'TATASTEEL', 'L&T LIMITED': 'LT', 'WIPRO LTD': 'WIPRO' };
  const key = Object.keys(map).find(k => name?.toUpperCase().includes(k.split(' ')[0]));
  return key ? `NSE: ${map[key]}` : 'NSE: ---';
};

/* ── Animated Counter ── */
const useCountUp = (end, duration = 1200) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = null;
    const num = parseFloat(String(end).replace(/[^0-9.]/g, '')) || 0;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(ease * num));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration]);
  return count;
};

/* ── CLAIM CSS (full animated) ── */
const CLAIM_CSS = `
  /* ── Keyframes ── */
  @keyframes fadeSlideUp   { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeSlideIn   { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
  @keyframes scaleIn       { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
  @keyframes pulseDot      { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.5)} }
  @keyframes floatBadge    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
  @keyframes glowPulse     { 0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,0.45)} 50%{box-shadow:0 0 0 10px rgba(16,185,129,0)} }
  @keyframes warnPulse     { 0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,0.4)} 50%{box-shadow:0 0 0 8px rgba(245,158,11,0)} }
  @keyframes borderGlow    { 0%,100%{border-color:rgba(16,185,129,0.2)} 50%{border-color:rgba(16,185,129,0.6)} }
  @keyframes statPop       { 0%{opacity:0;transform:scale(0.6) translateY(16px)} 65%{transform:scale(1.06) translateY(-3px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes barGrow       { from{width:0} to{width:100%} }
  @keyframes shimmerSweep  { 0%{left:-100%} 100%{left:200%} }
  @keyframes particleFloat { 0%{transform:translateY(0) rotate(0deg);opacity:0.6} 50%{opacity:0.2} 100%{transform:translateY(-80px) rotate(180deg);opacity:0} }
  @keyframes spinSlow      { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes countUp       { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes tabIndicator  { from{width:0;opacity:0} to{opacity:1} }
  @keyframes cardRise      { from{opacity:0;transform:translateY(40px) scale(0.94)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes emptyBounce   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
  @keyframes sparkle       { 0%,100%{opacity:0;transform:scale(0)} 50%{opacity:1;transform:scale(1)} }
  @keyframes ribbonShine   { 0%{transform:translateX(-100%) skew(-20deg)} 100%{transform:translateX(300%) skew(-20deg)} }
  @keyframes tiltLeft      { to{transform:rotateY(-8deg) rotateX(3deg) translateZ(10px)} }
  @keyframes progressFill  { from{width:0%} to{width:var(--progress-w)} }

  /* ── Particles ── */
  .claims-page-wrap {
    position: relative;
    overflow: hidden;
  }
  .particle {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    animation: particleFloat linear infinite;
    z-index: 0;
  }

  /* ── Stat chip ── */
  .stat-chip {
    position: relative; overflow: hidden;
    flex: 1 1 140px;
    border-radius: 18px;
    padding: 20px 22px;
    display: flex; flex-direction: column; align-items: flex-start;
    cursor: default;
    transition: transform 0.28s cubic-bezier(.34,1.56,.64,1), box-shadow 0.28s ease;
    animation: statPop 0.65s cubic-bezier(.34,1.56,.64,1) var(--chip-delay,0ms) both;
  }
  .stat-chip:hover { transform: translateY(-6px) scale(1.03); }
  .stat-chip:hover .chip-shimmer { animation: shimmerSweep 0.6s ease forwards; }
  .chip-shimmer {
    position: absolute; top: 0; left: -100%;
    width: 50%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.09), transparent);
    pointer-events: none; skew-x: -20deg;
  }
  .chip-bar-track {
    width: 100%; height: 3px; border-radius: 999px;
    background: rgba(255,255,255,0.06); margin-top: 12px; overflow: hidden;
  }
  .chip-bar-fill {
    height: 100%; border-radius: 999px;
    animation: barGrow 1.4s cubic-bezier(.4,0,.2,1) var(--bar-delay,0ms) both;
  }

  /* ── Tab bar ── */
  .claims-tab-row {
    display: flex; align-items: flex-end; gap: 2px;
    position: relative;
  }
  .claims-tab-btn {
    background: none; border: none; cursor: pointer;
    padding: 10px 16px; font-size: 13px; font-weight: 600;
    border-radius: 10px 10px 0 0;
    transition: color 0.2s ease, background 0.2s ease;
    position: relative; z-index: 1;
  }
  .claims-tab-btn:hover { background: rgba(255,255,255,0.05); }
  .claims-tab-btn.active { font-weight: 800; }
  .tab-active-indicator {
    position: absolute; bottom: 0; height: 2px;
    background: linear-gradient(90deg,#10B981,#818CF8);
    border-radius: 999px;
    transition: left 0.35s cubic-bezier(.34,1.56,.64,1), width 0.35s cubic-bezier(.34,1.56,.64,1);
    box-shadow: 0 0 10px rgba(16,185,129,0.6);
  }

  /* ── Claim card ── */
  .claim-card {
    background: rgba(255,255,255,0.03);
    backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    border-radius: 22px; padding: 22px;
    display: flex; flex-direction: column; gap: 16px;
    cursor: default; position: relative; overflow: hidden;
    transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s ease, border-color 0.3s ease;
    transform-style: preserve-3d; perspective: 800px;
  }
  .claim-card::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 55%);
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
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent);
    animation: ribbonShine 3s ease infinite;
  }
  .card-active  { border: 1px solid rgba(16,185,129,0.28); }
  .card-active:hover  { border-color: rgba(16,185,129,0.55); box-shadow: 0 28px 56px -16px rgba(16,185,129,0.3); animation: borderGlow 2.5s ease infinite; }
  .card-progress{ border: 1px solid rgba(245,158,11,0.28); }
  .card-progress:hover{ border-color: rgba(245,158,11,0.55); box-shadow: 0 28px 56px -16px rgba(245,158,11,0.25); }
  .card-pending { border: 1px solid rgba(129,140,248,0.4); animation: warnPulse 2.5s ease infinite; }
  .card-pending:hover { border-color: rgba(129,140,248,0.7); box-shadow: 0 28px 56px -16px rgba(129,140,248,0.35); }

  /* ── Avatar ── */
  .claim-avatar {
    transition: transform 0.35s cubic-bezier(.34,1.56,.64,1), box-shadow 0.35s ease;
  }
  .claim-card:hover .claim-avatar {
    transform: scale(1.18) rotate(-6deg);
    box-shadow: 0 10px 28px rgba(16,185,129,0.45);
  }

  /* ── Orb ── */
  .card-orb {
    position: absolute; border-radius: 50%;
    pointer-events: none; transition: opacity 0.4s ease;
  }

  /* ── Buttons ── */
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
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
    transform: translateX(-100%); transition: transform 0.45s ease;
  }
  .claim-btn-primary:hover { transform: translateY(-2px) scale(1.05); }
  .claim-btn-primary:hover::after { transform: translateX(100%); }
  .claim-btn-primary:active { transform: scale(0.96); }
  .claim-btn-sec {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1); color: #94a3b8;
    padding: 10px 14px; border-radius: 11px;
    font-weight: 700; font-size: 12px; cursor: pointer;
    transition: all 0.2s ease;
  }
  .claim-btn-sec:hover { background: rgba(255,255,255,0.1); color: #e2e8f0; border-color: rgba(255,255,255,0.22); transform: translateY(-1px); }

  /* ── Warn banner ── */
  .warn-banner {
    border-radius: 11px; padding: 10px 14px;
    display: flex; align-items: center; gap: 10px;
    font-size: 12px; font-weight: 700;
    background: rgba(245,158,11,0.08);
    border: 1px solid rgba(245,158,11,0.28);
    color: #F59E0B; animation: warnPulse 2.5s ease infinite;
  }

  /* ── New Claim btn ── */
  .new-claim-btn {
    display: flex; align-items: center; gap: 7px;
    background: linear-gradient(135deg,#10B981,#059669);
    border: none; color: #fff; padding: 9px 18px; border-radius: 12px;
    font-weight: 800; font-size: 12px; cursor: pointer;
    box-shadow: 0 4px 20px rgba(16,185,129,0.35);
    transition: transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.22s ease;
    animation: glowPulse 2s ease infinite;
    position: relative; overflow: hidden;
    margin-bottom: 8px;
  }
  .new-claim-btn::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transform: translateX(-100%); transition: transform 0.4s ease;
  }
  .new-claim-btn:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 10px 30px rgba(16,185,129,0.5); }
  .new-claim-btn:hover::after { transform: translateX(100%); }
  .new-claim-btn:active { transform: scale(0.97); }

  /* ── Progress bar ── */
  .progress-bar-track {
    width: 100%; height: 5px; background: rgba(255,255,255,0.06);
    border-radius: 999px; overflow: hidden;
  }
  .progress-bar-fill {
    height: 100%; border-radius: 999px;
    animation: progressFill 1.3s cubic-bezier(.4,0,.2,1) forwards;
  }

  /* ── Empty state ── */
  .empty-emoji { animation: emptyBounce 2s ease infinite; display: inline-block; }
  .sparkle {
    display: inline-block; font-size: 14px;
    animation: sparkle 2s ease infinite;
  }
`;

/* ── Floating particle component ── */
const PARTICLES = [
  { size: 6, color: 'rgba(16,185,129,0.25)', x: '10%', delay: '0s', dur: '8s' },
  { size: 4, color: 'rgba(129,140,248,0.2)', x: '25%', delay: '1.5s', dur: '10s' },
  { size: 8, color: 'rgba(16,185,129,0.15)', x: '45%', delay: '3s', dur: '7s' },
  { size: 5, color: 'rgba(245,158,11,0.2)', x: '65%', delay: '0.5s', dur: '9s' },
  { size: 3, color: 'rgba(129,140,248,0.25)', x: '80%', delay: '2s', dur: '6s' },
  { size: 7, color: 'rgba(16,185,129,0.2)', x: '90%', delay: '4s', dur: '11s' },
];

/* ── StatChip ── */
const StatChip = ({ label, value, color, icon: Icon, delay = 0, barColor }) => {
  const numericEnd = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
  const isNumeric = !isNaN(numericEnd) && numericEnd > 0;
  const count = useCountUp(isNumeric ? numericEnd : 0, 1000);
  const displayValue = isNumeric ? String(value).replace(/[0-9.]+/, count.toString()) : value;

  return (
    <div
      className="stat-chip"
      style={{
        '--chip-delay': `${delay}ms`,
        background: `linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)`,
        border: `1px solid ${color}25`,
        boxShadow: `0 4px 24px ${color}12`,
      }}
    >
      <div className="chip-shimmer" />
      {Icon && (
        <div style={{
          width: 38, height: 38, borderRadius: 12,
          background: `${color}18`, border: `1px solid ${color}35`,
          display: 'grid', placeItems: 'center', color, marginBottom: 12,
          boxShadow: `0 4px 16px ${color}20`
        }}>
          <Icon size={18} />
        </div>
      )}
      <div style={{ fontSize: 30, fontWeight: 900, color, lineHeight: 1, letterSpacing: '-1.2px', animation: 'countUp 0.4s ease both' }}>
        {displayValue}
      </div>
      <div style={{ fontSize: 10, color: CL.textMuted, marginTop: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </div>
      <div className="chip-bar-track" style={{ '--bar-delay': `${delay + 300}ms` }}>
        <div className="chip-bar-fill" style={{ background: barColor || color, width: '100%' }} />
      </div>
    </div>
  );
};

/* ── ClaimCard ── */
const ClaimCard = ({ claim, animDelay = 0, onViewDetails }) => {
  const badge = getStatusBadgeStyle(claim.status);
  const progressColor = getProgressColor(claim.status);
  const progressLabel = getProgressLabel(claim.status, claim.progress);
  const initials = claim.name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const nse = getNSE(claim.name);
  const needsDocs = claim.status?.toLowerCase().includes('pending');
  const isActive = claim.status?.toLowerCase() === 'active';

  const [progressVisible, setProgressVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setProgressVisible(true), animDelay + 500);
    return () => clearTimeout(t);
  }, [animDelay]);

  const orbColor = needsDocs ? '#818CF8' : isActive ? '#10B981' : '#F59E0B';
  const cardClass = needsDocs ? 'claim-card card-pending' : isActive ? 'claim-card card-active' : 'claim-card card-progress';
  const ribbonColor = needsDocs ? 'linear-gradient(90deg,#818CF8,#6366F1)' : isActive ? 'linear-gradient(90deg,#10B981,#059669)' : 'linear-gradient(90deg,#F59E0B,#D97706)';

  return (
    <div
      className={cardClass}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ animation: `cardRise 0.55s cubic-bezier(.34,1.56,.64,1) ${animDelay}ms both` }}
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
            <div style={{ fontWeight: 900, color: CL.text, fontSize: 15, letterSpacing: '-0.4px', lineHeight: 1.2 }}>{claim.name}</div>
            <div style={{ fontSize: 10, color: CL.textMuted, marginTop: 3, fontWeight: 600, letterSpacing: '0.02em' }}>
              {claim.isin} · {nse}
            </div>
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 999,
          background: badge.bg, color: badge.color, border: badge.border,
          fontSize: 10, fontWeight: 800, whiteSpace: 'nowrap',
          animation: 'floatBadge 3.5s ease infinite'
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: badge.dot, display: 'inline-block', animation: 'pulseDot 1.6s ease infinite' }} />
          {claim.status}
        </div>
      </div>

      {/* warn banner */}
      {needsDocs && (
        <div className="warn-banner">
          <AlertTriangle size={14} style={{ flexShrink: 0 }} />
          2 documents required — PAN Card &amp; Bank Cheque
        </div>
      )}

      {/* metrics grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {[
          { label: 'Shares', value: claim.shares },
          { label: 'Folio No.', value: claim.folio },
          { label: 'Est. Value', value: claim.estValue, color: '#10B981' }
        ].map((m, mi) => (
          <div key={m.label} style={{
            background: 'rgba(255,255,255,0.03)', borderRadius: 11, padding: '10px 11px',
            border: '1px solid rgba(255,255,255,0.06)',
            animation: `fadeSlideUp 0.45s ease ${animDelay + 200 + mi * 60}ms both`
          }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: m.color || CL.text, letterSpacing: '-0.3px' }}>{m.value}</div>
            <div style={{ fontSize: 9, color: CL.textMuted, marginTop: 3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* progress */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 8 }}>
          <span style={{ color: CL.textMuted, fontWeight: 600 }}>Claim Progress</span>
          <span style={{ fontWeight: 800, color: needsDocs ? '#F59E0B' : '#10B981', fontSize: 11 }}>{progressLabel}</span>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{
            '--progress-w': `${claim.progress}%`,
            background: progressColor,
            width: progressVisible ? `${claim.progress}%` : '0%',
            transition: progressVisible ? `width 1.3s cubic-bezier(.4,0,.2,1) ${animDelay + 300}ms` : 'none'
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          {[0, 25, 50, 75, 100].map(v => (
            <div key={v} style={{
              width: 1, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 1
            }} />
          ))}
        </div>
      </div>

      {/* buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        {needsDocs ? (
          <>
            <button className="claim-btn-primary" style={{ background: 'linear-gradient(135deg,#F59E0B,#EF4444)', boxShadow: '0 4px 16px rgba(239,68,68,0.35)', flex: 1 }}>
              <Upload size={13} /> Upload Docs
            </button>
            <button className="claim-btn-sec" onClick={() => onViewDetails && onViewDetails(claim)}>View</button>
          </>
        ) : (
          <>
            <button className="claim-btn-primary" onClick={() => onViewDetails && onViewDetails(claim)} style={{ background: 'linear-gradient(135deg,#10B981,#059669)', boxShadow: '0 4px 16px rgba(16,185,129,0.35)', flex: 1 }}>
              <Eye size={13} /> View Details
            </button>
            <button className="claim-btn-sec">Docs</button>
          </>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   CLAIM DETAIL VIEW
═══════════════════════════════════════════════ */
const CLAIM_DETAIL_CSS = `
  @keyframes detailSlideIn { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
  @keyframes detailFadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes stepPop       { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }
  @keyframes lineGrow      { from{height:0} to{height:100%} }
  @keyframes tagFloat      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }

  .detail-wrap { animation: detailSlideIn 0.45s cubic-bezier(.34,1.56,.64,1) both; }
  .detail-section {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 18px; padding: 22px;
    backdrop-filter: blur(12px);
    animation: detailFadeUp 0.4s ease var(--sec-delay,0s) both;
  }
  .detail-section:hover {
    border-color: rgba(255,255,255,0.12);
    transition: border-color 0.3s ease;
  }
  .step-dot {
    width: 34px; height: 34px; border-radius: 50%;
    display: grid; place-items: center; flex-shrink: 0;
    animation: stepPop 0.4s cubic-bezier(.34,1.56,.64,1) var(--dot-delay,0s) both;
  }
  .step-line {
    width: 2px; flex-shrink: 0;
    margin: 4px 0; border-radius: 999px;
    animation: lineGrow 0.6s ease var(--line-delay,0s) both;
    min-height: 28px;
  }
  .holder-row {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 14px; border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.02);
    transition: all 0.2s ease;
    animation: detailFadeUp 0.4s ease var(--holder-delay,0s) both;
  }
  .holder-row:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); transform: translateX(4px); }
  .action-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 11px 14px; border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.02);
    transition: all 0.2s ease;
    animation: detailFadeUp 0.4s ease var(--action-delay,0s) both;
  }
  .action-row:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); }
  .update-row {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    animation: detailFadeUp 0.4s ease var(--upd-delay,0s) both;
  }
  .update-row:last-child { border-bottom: none; }
  .back-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 10px;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
    color: var(--dashboard-text-muted); cursor: pointer; font-size: 12px; font-weight: 700;
    transition: all 0.2s ease;
  }
  .back-btn:hover { background: rgba(255,255,255,0.1); color: var(--dashboard-text); transform: translateX(-3px); }
  .stat-box {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px; padding: 14px 20px; min-width: 110px;
    animation: detailFadeUp 0.4s ease var(--sbox-delay,0s) both;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .stat-box:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
  .complete-badge {
    padding: 6px 14px; border-radius: 999px; font-size: 11px; font-weight: 800;
    background: linear-gradient(135deg,#10B981,#059669);
    color: #fff; box-shadow: 0 4px 16px rgba(16,185,129,0.4);
    animation: tagFloat 3s ease infinite;
  }
`;

const ClaimDetailView = ({ claim, onBack }) => {
  const badge = getStatusBadgeStyle(claim.status);
  const initials = claim.name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const orbColor = claim.status?.toLowerCase() === 'active' ? '#10B981'
    : claim.status?.toLowerCase().includes('progress') ? '#F59E0B' : '#818CF8';

  const steps = [
    { label: 'Documents Collected', date: 'Mar 2, 2026', done: true },
    { label: 'Verification', date: 'Mar 5, 2026', done: true },
    { label: 'Application Filed', date: 'Mar 8, 2026', done: true },
    { label: 'Authority Review', date: 'In Progress — Submitted to IEPF Authority', done: false, active: true },
    { label: 'Claim Approved', date: '', done: false },
    { label: 'Shares Credited', date: '', done: false },
  ];

  const adminUpdates = [
    { icon: '🔵', text: 'Documents verified successfully by admin team', by: 'Admin · Mar 3, 9:15 PM' },
    { icon: '🔵', text: 'IEPF-5 form submitted to authority portal', by: 'System · Mar 10, 11:00 AM' },
    { icon: '🟢', text: 'Application acknowledged by IEPF Authority', by: 'Admin · Mar 12, 8:40 PM' },
  ];

  const holders = [
    { name: 'Rajesh Patel', role: '1st Holder', status: 'Deceased', statusColor: '#EF4444' },
    { name: 'Meena Patel', role: '2nd Holder', status: 'Alive', statusColor: '#10B981' },
    { name: 'Ramesh Patel', role: '3rd Holder', status: 'Alive', statusColor: '#10B981' },
  ];

  const actions = [
    { icon: '📈', label: 'Bonus 1:1', year: '2018' },
    { icon: '✂️', label: 'Split ₹10→₹2', year: '2015' },
    { icon: '💰', label: 'Dividend ₹3.50/share', year: '2022' },
  ];

  return (
    <div className="detail-wrap" style={{ position: 'relative' }}>
      <style>{CLAIM_DETAIL_CSS}</style>

      {/* ── Breadcrumb ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={13} /> Back to Claims
        </button>
        <ChevronRight size={14} style={{ color: CL.textMuted, opacity: 0.5 }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: CL.textMuted }}>{claim.name}</span>
      </div>

      {/* ── Company Header ── */}
      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20, padding: '24px 28px', marginBottom: 20,
        backdropFilter: 'blur(12px)', position: 'relative', overflow: 'hidden',
        animation: 'detailFadeUp 0.4s ease both'
      }}>
        {/* bg orb */}
        <div style={{
          position: 'absolute', width: 200, height: 200, borderRadius: '50%',
          background: `radial-gradient(circle, ${orbColor}18 0%, transparent 70%)`,
          top: -60, right: 40, pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: `linear-gradient(135deg,${orbColor}35,${orbColor}10)`,
              border: `2px solid ${orbColor}45`, color: orbColor,
              display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 17,
              boxShadow: `0 8px 24px ${orbColor}25`
            }}>{initials}</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 22, color: CL.text, letterSpacing: '-0.5px', lineHeight: 1.1 }}>{claim.name}</div>
              <div style={{ fontSize: 11, color: CL.textMuted, marginTop: 5, fontWeight: 600, letterSpacing: '0.03em' }}>{claim.isin}</div>
            </div>
          </div>
          <div className="complete-badge">{claim.progress}% Complete</div>
        </div>

        {/* quick stats */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'SHARES', value: claim.shares, delay: '0.1s' },
            { label: 'FOLIO NUMBER', value: claim.folio, delay: '0.18s' },
            { label: 'EST. VALUE', value: claim.estValue, delay: '0.26s', color: '#10B981' },
          ].map(s => (
            <div key={s.label} className="stat-box" style={{ '--sbox-delay': s.delay }}>
              <div style={{ fontSize: 9, color: CL.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color || CL.text, letterSpacing: '-0.5px' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 20, alignItems: 'start' }}>

        {/* LEFT: Progress timeline */}
        <div className="detail-section" style={{ '--sec-delay': '0.15s' }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: CL.text, marginBottom: 20 }}>Claim Progress</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 14 }}>
                {/* dot + line column */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div className="step-dot" style={{
                    '--dot-delay': `${0.15 + i * 0.07}s`,
                    background: step.done ? 'linear-gradient(135deg,#10B981,#059669)'
                      : step.active ? `linear-gradient(135deg,${orbColor}40,${orbColor}15)`
                      : 'rgba(255,255,255,0.06)',
                    border: step.active ? `2px solid ${orbColor}` : step.done ? '2px solid #10B981' : '2px solid rgba(255,255,255,0.1)',
                    boxShadow: step.done ? '0 4px 12px rgba(16,185,129,0.35)' : step.active ? `0 4px 12px ${orbColor}35` : 'none'
                  }}>
                    {step.done ? <CheckCircle2 size={16} color="#fff" /> :
                      step.active ? <Activity size={14} color={orbColor} /> :
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="step-line" style={{
                      '--line-delay': `${0.2 + i * 0.07}s`,
                      background: step.done ? 'linear-gradient(180deg,#10B981,#059669)'
                        : 'rgba(255,255,255,0.07)'
                    }} />
                  )}
                </div>
                {/* content */}
                <div style={{ paddingBottom: i < steps.length - 1 ? 20 : 0, paddingTop: 5, flex: 1 }}>
                  <div style={{
                    fontWeight: step.active ? 800 : step.done ? 700 : 500,
                    color: step.done ? CL.text : step.active ? orbColor : CL.textMuted,
                    fontSize: 13, lineHeight: 1.3
                  }}>{step.label}</div>
                  {step.date && (
                    <div style={{ fontSize: 10, color: step.active ? orbColor : CL.textMuted, marginTop: 3, fontWeight: 600 }}>
                      {step.active && <span style={{
                        display: 'inline-block', background: `${orbColor}20`, color: orbColor,
                        border: `1px solid ${orbColor}40`, borderRadius: 999, padding: '1px 7px',
                        fontSize: 9, fontWeight: 800, marginRight: 6, animation: 'tagFloat 2s ease infinite'
                      }}>Active</span>}{step.date}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: stack of 3 sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Admin Updates */}
          <div className="detail-section" style={{ '--sec-delay': '0.2s' }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: CL.text, marginBottom: 16 }}>Admin Updates</div>
            <div>
              {adminUpdates.map((u, i) => (
                <div key={i} className="update-row" style={{ '--upd-delay': `${0.22 + i * 0.06}s` }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                    background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.2)',
                    display: 'grid', placeItems: 'center', fontSize: 14
                  }}>
                    {i === 2 ? '✅' : '🔵'}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: CL.text, lineHeight: 1.4 }}>{u.text}</div>
                    <div style={{ fontSize: 10, color: CL.textMuted, marginTop: 3, fontWeight: 600 }}>{u.by}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Holders */}
          <div className="detail-section" style={{ '--sec-delay': '0.28s' }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: CL.text, marginBottom: 14 }}>Holders</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {holders.map((h, i) => (
                <div key={i} className="holder-row" style={{ '--holder-delay': `${0.3 + i * 0.07}s` }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                    background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.2)',
                    display: 'grid', placeItems: 'center',
                    fontWeight: 900, fontSize: 11, color: '#818CF8'
                  }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: CL.text }}>{h.name}</div>
                    <div style={{ fontSize: 10, color: CL.textMuted, fontWeight: 600, marginTop: 1 }}>{h.role}</div>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 800, color: h.statusColor,
                    background: `${h.statusColor}15`, border: `1px solid ${h.statusColor}30`,
                    padding: '3px 10px', borderRadius: 999
                  }}>{h.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Corporate Actions */}
          <div className="detail-section" style={{ '--sec-delay': '0.36s' }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: CL.text, marginBottom: 14 }}>Corporate Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {actions.map((a, i) => (
                <div key={i} className="action-row" style={{ '--action-delay': `${0.38 + i * 0.07}s` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                      background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                      display: 'grid', placeItems: 'center', fontSize: 14
                    }}>{a.icon}</div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: CL.text }}>{a.label}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: CL.textMuted }}>{a.year}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

/* ── Sliding tab indicator helper ── */
const useTabIndicator = (tabs, activeTab) => {
  const refs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  useEffect(() => {
    const el = refs.current[activeTab];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [activeTab]);
  return { refs, indicator };
};

const MyClaimsView = ({ claims, navigate }) => {
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [activeTab, setActiveTab] = useState('All Companies');
  const [tabKey, setTabKey] = useState(0);

  const tabs = ['All Companies', 'Active', 'In Progress', 'Pending', 'Service Hub'];
  const { refs: tabRefs, indicator } = useTabIndicator(tabs, activeTab);

  if (selectedClaim) return <ClaimDetailView claim={selectedClaim} onBack={() => setSelectedClaim(null)} />;



  const totalCompanies = new Set(claims.map(c => c.name)).size;
  const totalShares = claims.reduce((s, c) => s + (Number(c.shares) || 0), 0);
  const pendingDocs = claims.filter(c => c.status?.toLowerCase().includes('pending')).length;

  const filtered = claims.filter(c => {
    if (activeTab === 'All Companies') return true;
    if (activeTab === 'Active') return c.status?.toLowerCase() === 'active';
    if (activeTab === 'In Progress') return c.status?.toLowerCase().includes('progress');
    if (activeTab === 'Pending') return c.status?.toLowerCase().includes('pending');
    return true;
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setTabKey(k => k + 1);
    if (tab === 'Service Hub') setTimeout(() => navigate('/client?tab=service-hub'), 180);
  };




  return (
    <div className="claims-page-wrap">
      <style>{CLAIM_CSS}</style>

      {/* ── Floating particles ── */}
      {PARTICLES.map((p, i) => (
        <div key={i} className="particle" style={{
          width: p.size, height: p.size,
          background: p.color, left: p.x, bottom: 0,
          animationDuration: p.dur, animationDelay: p.delay
        }} />
      ))}

      {/* ── Stats row ── */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 30, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
        <StatChip label="Total Companies" value={totalCompanies}   color="#3B82F6" barColor="#3B82F6" icon={FileText}     delay={0}   />
        <StatChip label="Total Shares"    value={totalShares}      color="#818CF8"  barColor="#818CF8"              icon={TrendingUp}   delay={90}  />
        <StatChip label="Recovery Value"  value="₹3.45L"           color="#10B981"  barColor="#10B981"              icon={CheckCircle2} delay={180} />
        <StatChip label="Pending Docs"    value={pendingDocs}      color="#F59E0B"  barColor="#F59E0B"              icon={AlertTriangle} delay={270} />
      </div>

      {/* ── Tabs row ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        marginBottom: 26, borderBottom: `1px solid ${CL.border}`, paddingBottom: 0,
        position: 'relative', zIndex: 1, animation: 'fadeSlideUp 0.5s ease 0.15s both'
      }}>
        {/* sliding indicator */}
        <div className="claims-tab-row" style={{ position: 'relative' }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab;
            const isServiceHub = tab === 'Service Hub';
            return (
              <button
                key={tab}
                ref={el => tabRefs.current[tab] = el}
                className={`claims-tab-btn${isActive ? ' active' : ''}`}
                onClick={() => handleTabChange(tab)}
                style={{
                  color: isActive ? (isServiceHub ? '#10B981' : CL.text) : CL.textMuted,
                  marginBottom: -1,
                }}
              >
                {tab}
                {isServiceHub && (
                  <span style={{
                    display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                    background: '#10B981', marginLeft: 6, verticalAlign: 'middle',
                    boxShadow: '0 0 8px #10B981', animation: 'pulseDot 1.5s ease infinite'
                  }} />
                )}
                {tab === 'Pending' && pendingDocs > 0 && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 18, height: 18, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#EF4444,#DC2626)',
                    color: '#fff', fontSize: 9, fontWeight: 900, marginLeft: 6,
                    boxShadow: '0 2px 8px rgba(239,68,68,0.5)',
                    animation: 'pulseDot 2s ease infinite'
                  }}>{pendingDocs}</span>
                )}
              </button>
            );
          })}
          {/* sliding underline */}
          <div className="tab-active-indicator" style={{ left: indicator.left, width: indicator.width }} />
        </div>

        <button className="new-claim-btn">
          <Plus size={14} /> New Claim
        </button>
      </div>

      {/* ── Cards grid ── */}
      <div
        key={tabKey}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(295px, 1fr))',
          gap: 22, position: 'relative', zIndex: 1
        }}
      >
        {filtered.length === 0 ? (
          <div style={{
            gridColumn: '1/-1', textAlign: 'center', padding: '70px 0',
            color: CL.textMuted, animation: 'fadeSlideUp 0.4s ease both'
          }}>
            <div className="empty-emoji" style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>No claims for this filter</div>
            <div style={{ fontSize: 13, opacity: 0.6 }}>Try switching to a different tab above</div>
          </div>
        ) : filtered.map((claim, i) => (
          <ClaimCard
            onViewDetails={(c) => setSelectedClaim(c)}
            key={claim.name + i + tabKey}
            claim={claim}
            animDelay={i * 110}
          />
        ))}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   DASHBOARD TAB VIEW (default, no ?tab or ?tab=dashboard)
═══════════════════════════════════════════════ */
/* ── FAMILY TREE COMPONENT ── */
const ClientFamilyTreeNode = ({ name, role, isClient }) => (
  <div style={{ 
    background: isClient ? 'linear-gradient(135deg, #10B981, #059669)' : 'rgba(30, 41, 59, 0.45)', 
    border: `2px solid ${isClient ? 'rgba(16,185,129,0.5)' : 'rgba(255, 255, 255, 0.08)'}`,
    color: '#fff',
    padding: '14px 28px', 
    borderRadius: '16px', 
    minWidth: '140px',
    textAlign: 'center',
    boxShadow: isClient 
      ? '0 10px 25px -5px rgba(16,185,129,0.4), 0 0 20px rgba(16,185,129,0.15)' 
      : '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05)',
    position: 'relative',
    zIndex: 2,
    backdropFilter: 'blur(8px)',
    transition: 'transform 0.2s ease, border-color 0.2s ease',
  }}
  className="family-node-hover"
  >
    <div style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '-0.3px' }}>{name}</div>
    <div style={{ fontSize: '10px', color: isClient ? '#A7F3D0' : 'rgba(255, 255, 255, 0.5)', fontWeight: 800, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{role}</div>
  </div>
);

const ClientFamilyTreeView = ({ familyMembers, client, onAddFamily }) => {
  const ancestors = familyMembers.filter(m => ['Father', 'Mother', 'Grandfather', 'Grandmother'].includes(m.relationWithHolder));
  const siblings = familyMembers.filter(m => ['Brother', 'Sister'].includes(m.relationWithHolder));
  const children = familyMembers.filter(m => ['Son', 'Daughter'].includes(m.relationWithHolder));
  const spouse = familyMembers.filter(m => ['Spouse'].includes(m.relationWithHolder));
  const others = familyMembers.filter(m => !['Father', 'Mother', 'Grandfather', 'Grandmother', 'Brother', 'Sister', 'Son', 'Daughter', 'Spouse'].includes(m.relationWithHolder));

  const lineBg = 'rgba(255, 255, 255, 0.15)';

  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '40px', 
      background: CL.card, 
      backgroundImage: CL.cardBgImage,
      borderRadius: '20px', 
      border: `1px solid ${CL.border}`,
      boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(12px)',
      position: 'relative'
    }}>
      <style>{`
        .family-node-hover {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .family-node-hover:hover {
          transform: translateY(-5px);
          border-color: #10B981 !important;
          box-shadow: 0 10px 25px -5px rgba(16,185,129,0.3), 0 0 15px rgba(16,185,129,0.1) !important;
        }
      `}</style>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 900, margin: 0, letterSpacing: '-0.5px', color: CL.text }}>Family Tree &amp; Hierarchy</h3>
        <button 
          onClick={onAddFamily}
          style={{ 
            padding: '10px 20px', 
            background: 'linear-gradient(135deg, #10B981, #059669)', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '12px', 
            cursor: 'pointer', 
            fontSize: '13px', 
            fontWeight: 800, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            boxShadow: '0 8px 20px rgba(16,185,129,0.35)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(16,185,129,0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(16,185,129,0.35)';
          }}
        >
          <Plus size={16} /> Add Member
        </button>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', padding: '20px 0' }}>
        
        {/* Ancestors Level */}
        {ancestors.length > 0 && (
          <div style={{ display: 'flex', gap: '30px', marginBottom: '40px', position: 'relative' }}>
            {ancestors.map((m, i) => <ClientFamilyTreeNode key={`anc-${i}`} name={m.name} role={m.relationWithHolder} />)}
            <div style={{ position: 'absolute', bottom: '-40px', left: '50%', width: '2px', height: '40px', background: lineBg, transform: 'translateX(-50%)', zIndex: 1 }} />
            {ancestors.length > 1 && (
              <div style={{ position: 'absolute', bottom: '-20px', left: '10%', right: '10%', height: '2px', background: lineBg, zIndex: 1 }} />
            )}
          </div>
        )}

        {/* Client & Siblings Level */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '40px', position: 'relative', marginBottom: '40px', width: '100%' }}>
          
          {/* Siblings (Left) */}
          <div style={{ display: 'flex', gap: '20px', position: 'relative', justifyContent: 'flex-end' }}>
            {siblings.map((m, i) => <ClientFamilyTreeNode key={`sib-${i}`} name={m.name} role={m.relationWithHolder} />)}
            {siblings.length > 0 && (
              <div style={{ position: 'absolute', top: '50%', right: '-40px', width: '40px', height: '2px', background: lineBg, zIndex: 1, transform: 'translateY(-50%)' }} />
            )}
          </div>

          {/* Client Node (Center) */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'center' }}>
            <ClientFamilyTreeNode name={client?.name} role="PRIMARY CLIENT" isClient={true} />
            {children.length > 0 && (
              <div style={{ position: 'absolute', bottom: '-40px', left: '50%', width: '2px', height: '40px', background: lineBg, transform: 'translateX(-50%)', zIndex: 1 }} />
            )}
          </div>

          {/* Spouse (Right) */}
          <div style={{ display: 'flex', gap: '20px', position: 'relative', justifyContent: 'flex-start' }}>
            {spouse.length > 0 && (
              <div style={{ position: 'absolute', top: '50%', left: '-40px', width: '40px', height: '2px', background: lineBg, zIndex: 1, transform: 'translateY(-50%)' }} />
            )}
            {spouse.map((m, i) => <ClientFamilyTreeNode key={`sp-${i}`} name={m.name} role={m.relationWithHolder} />)}
          </div>
        </div>

        {/* Children Level */}
        {children.length > 0 && (
          <div style={{ display: 'flex', gap: '30px', position: 'relative' }}>
            {children.length > 1 && (
              <div style={{ position: 'absolute', top: '-20px', left: '20%', right: '20%', height: '2px', background: lineBg, zIndex: 1 }} />
            )}
            {children.map((m, i) => (
              <div key={`child-${i}`} style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-20px', left: '50%', width: '2px', height: '20px', background: lineBg, transform: 'translateX(-50%)', zIndex: 1 }} />
                <ClientFamilyTreeNode name={m.name} role={m.relationWithHolder} />
              </div>
            ))}
          </div>
        )}

        {/* Other Relatives */}
        {others.length > 0 && (
          <div style={{ marginTop: '60px', width: '100%' }}>
            <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '0 0 20px' }} />
            <h4 style={{ fontSize: '13px', fontWeight: 800, color: CL.textMuted, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Other Relatives</h4>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {others.map((m, i) => <ClientFamilyTreeNode key={`oth-${i}`} name={m.name} role={m.relationWithHolder} />)}
            </div>
          </div>
        )}

        {familyMembers.length === 0 && (
          <div style={{ 
            color: CL.textMuted, 
            padding: '40px', 
            border: `2px dashed ${CL.border}`, 
            borderRadius: '16px', 
            width: '100%', 
            maxWidth: '400px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            background: 'rgba(255,255,255,0.01)'
          }}>
            <GitBranch size={32} style={{ marginBottom: '12px', opacity: 0.5, color: CL.accent }} />
            <p style={{ margin: 0, fontWeight: 700, color: CL.text }}>No family members linked yet.</p>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: CL.textMuted }}>Click "Add Member" to start building your family tree.</p>
          </div>
        )}

      </div>
    </div>
  );
};

/* ── DOCUMENTS HUB COMPONENT ── */
const ClientDocumentsHub = ({ documents, clientProfile, user, onRefresh }) => {
  const [activeSubTab, setActiveSubTab] = useState('My Documents');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);

  const getDocDetails = (docName) => {
    // Exact check first
    let doc = documents.find(d => d.name.toLowerCase() === docName.toLowerCase());
    // Partial check fallback
    if (!doc) {
      doc = documents.find(d => d.name.toLowerCase().includes(docName.toLowerCase().replace(' card', '').trim()));
    }
    
    if (doc) {
      return {
        uploaded: true,
        status: doc.verification_status || 'pending',
        url: doc.file_url,
        name: doc.name,
        docRecord: doc
      };
    }
    
    // Check clientProfile fallback for PAN/Aadhaar
    if (clientProfile?.kyc_data) {
      if (docName === 'PAN Card' && clientProfile.kyc_data.panCardFile) {
        return { uploaded: true, status: 'verified', url: clientProfile.kyc_data.panCardFile, name: 'PAN Card' };
      }
      if (docName === 'Aadhaar Card' && clientProfile.kyc_data.aadharCardFile) {
        return { uploaded: true, status: 'verified', url: clientProfile.kyc_data.aadharCardFile, name: 'Aadhaar Card' };
      }
    }
    
    return { uploaded: false, status: 'Not uploaded' };
  };

  const handleFileUpload = async (file, docName) => {
    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', docName);
    formData.append('linked_to', 'client');
    formData.append('doc_category', 'primary');
    formData.append('folder', 'General');
    formData.append('client_id', clientProfile?._id || clientProfile?.id || user?._id || user?.id);

    try {
      await axios.post('https://myclaimportal.onrender.com/api/documents/upload', formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      await onRefresh();
    } catch (err) {
      console.error("Error uploading file:", err);
      setError(err.response?.data?.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const triggerDirectUpload = (docName) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        await handleFileUpload(file, docName);
      }
    };
    input.click();
  };

  const triggerGeneralUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        const docName = prompt("Enter a name/tag for this document:", file.name);
        if (docName) {
          await handleFileUpload(file, docName);
        }
      }
    };
    input.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const docName = prompt("Enter a name/tag for this document:", file.name);
      if (docName) {
        await handleFileUpload(file, docName);
      }
    }
  };

  const cardItems = [
    { name: 'PAN Card', type: 'pan' },
    { name: 'Aadhaar Card', type: 'aadhaar' },
    { name: 'Bank Cancelled Cheque', type: 'cheque' },
    { name: 'Death Certificate', type: 'death' },
  ];

  return (
    <div style={{ position: 'relative' }}>
      {/* Document Preview Modal */}
      {previewDoc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '20px' }} onClick={() => setPreviewDoc(null)}>
          <div style={{ background: 'var(--dashboard-card)', border: '1px solid var(--dashboard-border)', borderRadius: '20px', width: '90%', maxWidth: '1000px', height: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#fff' }}>{previewDoc.name}</h3>
                <a 
                  href={`https://myclaimportal.onrender.com${previewDoc.url}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '8px', textDecoration: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                ><Download size={14} /> View Original</a>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }} onClick={() => setPreviewDoc(null)}><X size={22} /></button>
            </div>
            <div style={{ flex: 1, padding: 0, overflow: 'hidden', background: '#0a0f18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {(() => {
                const fullUrl = `https://myclaimportal.onrender.com${previewDoc.url}`;
                const ext = previewDoc.url.split('.').pop().toLowerCase();
                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
                
                if (isImage) {
                  return <img src={fullUrl} alt={previewDoc.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />;
                } else {
                  return <iframe src={fullUrl} title={previewDoc.name} style={{ width: '100%', height: '100%', border: 'none' }} />;
                }
              })()}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 24 }}>
        {['My Documents', 'Company Documents'].map(tab => (
          <div 
            key={tab}
            style={{
              padding: '12px 0', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              color: activeSubTab === tab ? '#fff' : 'rgba(255,255,255,0.4)',
              borderBottom: activeSubTab === tab ? '2.5px solid #10B981' : '2.5px solid transparent',
              transition: 'all 0.2s',
              position: 'relative',
              top: '1px'
            }}
            onClick={() => setActiveSubTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      {activeSubTab === 'My Documents' ? (
        <div>
          <div style={{ fontSize: '13px', color: 'var(--dashboard-text-muted)', marginBottom: 20, fontWeight: 500 }}>
            Your identity and financial documents
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', marginBottom: 20, fontWeight: 600 }}>
              {error}
            </div>
          )}

          {/* Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
            {cardItems.map(item => {
              const details = getDocDetails(item.name);
              const isUploaded = details.uploaded;
              
              let borderStyle = '1px solid rgba(255,255,255,0.08)';
              let bgStyle = 'rgba(255,255,255,0.02)';
              let iconColor = 'rgba(255,255,255,0.4)';
              let statusText = 'Not uploaded';
              let statusColor = 'rgba(255,255,255,0.4)';
              let cardGlow = 'none';

              if (!isUploaded) {
                borderStyle = '1px solid rgba(245,158,11,0.2)';
                bgStyle = 'rgba(245,158,11,0.02)';
                iconColor = '#F59E0B';
                statusColor = '#F59E0B';
                cardGlow = '0 8px 24px rgba(245,158,11,0.06)';
              } else if (details.status === 'verified') {
                borderStyle = '1px solid rgba(16,185,129,0.25)';
                bgStyle = 'rgba(16,185,129,0.02)';
                iconColor = '#10B981';
                statusText = 'Verified';
                statusColor = '#10B981';
                cardGlow = '0 8px 24px rgba(16,185,129,0.08)';
              } else {
                borderStyle = '1px solid rgba(129,140,248,0.25)';
                bgStyle = 'rgba(129,140,248,0.02)';
                iconColor = '#818CF8';
                statusText = details.status.charAt(0).toUpperCase() + details.status.slice(1);
                statusColor = '#818CF8';
                cardGlow = '0 8px 24px rgba(129,140,248,0.08)';
              }

              return (
                <div 
                  key={item.name} 
                  style={{
                    background: bgStyle,
                    border: borderStyle,
                    borderRadius: '16px',
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: cardGlow,
                    backdropFilter: 'blur(8px)',
                    transition: 'transform 0.2s ease, border-color 0.2s ease'
                  }}
                  className="family-node-hover"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.03)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: iconColor, border: '1px solid rgba(255,255,255,0.06)'
                    }}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginBottom: 4 }}>{item.name}</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: statusColor, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {isUploaded && details.status === 'verified' && <span>✓</span>}
                        {isUploaded && details.status !== 'verified' && <span>⌛</span>}
                        {!isUploaded && <span>⚠</span>}
                        {statusText}
                      </div>
                    </div>
                  </div>

                  <div>
                    {isUploaded ? (
                      <button 
                        onClick={() => setPreviewDoc({ name: item.name, url: details.url })}
                        style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      >
                        <Eye size={16} />
                      </button>
                    ) : (
                      <button 
                        onClick={() => triggerDirectUpload(item.name)}
                        style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#F59E0B', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(245,158,11,0.25)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(245,158,11,0.15)'}
                      >
                        <Upload size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '32px 0' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <Folder size={18} color="#10B981" />
            <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#fff' }}>Document Folders</h3>
          </div>

          {/* Folder & Document Browser */}
          <DocumentsView 
            documents={documents} 
            client={clientProfile || user} 
            onRefresh={onRefresh} 
            readOnlyStructure={true} 
            theme="dark" 
          />
        </div>
      ) : (
        /* Company Documents View */
        <div style={{
          textAlign: 'center', padding: '60px 20px', color: 'var(--dashboard-text-muted)',
          background: 'rgba(255,255,255,0.01)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <Folder size={48} style={{ marginBottom: '16px', opacity: 0.3, color: CL.accent }} />
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>No company documents shared yet</div>
          <div style={{ fontSize: '12px', marginTop: '6px' }}>Shared files from My Claim team will be visible here.</div>
        </div>
      )}
    </div>
  );
};

const getNotifTypeStyles = (type) => {
  switch (type) {
    case 'ticket_assigned':
    case 'ticket_reassigned': return { icon: Ticket, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' };
    case 'comment_added': return { icon: MessageSquare, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' };
    case 'doc_approved': return { icon: FileText, color: '#10b981', bg: 'rgba(16,185,129,0.1)' };
    case 'doc_rejected': return { icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
    case 'task_overdue': return { icon: AlertCircle, color: '#dc2626', bg: 'rgba(220,38,38,0.1)' };
    case 'due_approaching': return { icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' };
    case 'task_completed': return { icon: CheckCircle2, color: '#10b981', bg: 'rgba(16,185,129,0.1)' };
    default: return { icon: Bell, color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.03)' };
  }
};

const ClientNotificationsView = ({ notifications, onRefresh, user }) => {
  const navigate = useNavigate();

  const markAsRead = async (id) => {
    try {
      await axios.patch(`https://myclaimportal.onrender.com/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      onRefresh();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch('https://myclaimportal.onrender.com/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      onRefresh();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{
      background: CL.card, 
      backgroundImage: CL.cardBgImage,
      borderRadius: '20px', 
      border: `1px solid ${CL.border}`,
      boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(12px)',
      padding: '32px',
      position: 'relative'
    }}>
      <style>{`
        .client-notif-item {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 16px 20px;
          display: flex;
          gap: 16px;
          margin-bottom: 14px;
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
        }
        .client-notif-item:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(16, 185, 129, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }
        .client-notif-item.unread {
          background: rgba(16, 185, 129, 0.02);
          border-color: rgba(16, 185, 129, 0.25);
        }
        .client-notif-item.unread::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: #10B981;
          box-shadow: 0 0 10px #10B981;
        }
      `}</style>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 900, margin: 0, letterSpacing: '-0.5px', color: CL.text, display: 'flex', alignItems: 'center', gap: 10 }}>
            Notifications
            {unreadCount > 0 && (
              <span style={{ fontSize: '11px', background: 'linear-gradient(135deg,#EF4444,#DC2626)', color: '#fff', padding: '3px 10px', borderRadius: 999, fontWeight: 900, boxShadow: '0 2px 8px rgba(239,68,68,0.4)' }}>
                {unreadCount} New
              </span>
            )}
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: CL.textMuted, fontWeight: 600 }}>Stay updated on your claims and file uploads</p>
        </div>
        <button 
          onClick={markAllAsRead} 
          disabled={unreadCount === 0}
          style={{ 
            padding: '10px 20px', 
            background: 'rgba(255,255,255,0.05)', 
            color: CL.text, 
            border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: '12px', 
            cursor: unreadCount === 0 ? 'not-allowed' : 'pointer', 
            fontSize: '12px', 
            fontWeight: 800, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            opacity: unreadCount === 0 ? 0.5 : 1,
            transition: 'all 0.2s'
          }}
        >
          <CheckCircle2 size={15} /> Mark all as read
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {notifications.length === 0 ? (
          <div style={{ 
            color: CL.textMuted, 
            padding: '60px 40px', 
            border: `2px dashed ${CL.border}`, 
            borderRadius: '16px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            background: 'rgba(255,255,255,0.01)',
            textAlign: 'center'
          }}>
            <Bell size={40} style={{ marginBottom: '16px', opacity: 0.3, color: CL.accent }} />
            <h4 style={{ margin: 0, fontWeight: 800, color: CL.text, fontSize: '15px' }}>All caught up!</h4>
            <p style={{ margin: '6px 0 0', fontSize: '12px', color: CL.textMuted }}>You do not have any notifications at the moment.</p>
          </div>
        ) : (
          notifications.map(n => {
            const { icon: Icon, color, bg } = getNotifTypeStyles(n.type);
            return (
              <div key={n._id} className={`client-notif-item ${!n.isRead ? 'unread' : ''}`}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyItems: 'center',
                  background: bg || 'rgba(255,255,255,0.03)', color: color || CL.textMuted,
                  justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <Icon size={18} strokeWidth={2.5} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#fff' }}>{n.title}</h4>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '10px', color: CL.textMuted, fontWeight: 700 }}>
                      <Clock size={11} />
                      {new Date(n.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ margin: '6px 0 12px 0', fontSize: '13px', color: CL.textMuted, lineHeight: 1.4, fontWeight: 500 }}>{n.message}</p>
                  
                  <div style={{ display: 'flex', gap: 10 }}>
                    {!n.isRead && (
                      <button 
                        onClick={() => markAsRead(n._id)}
                        style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                      >
                        Mark as read
                      </button>
                    )}
                    {n.link && (
                      <button 
                        onClick={async () => {
                          if (!n.isRead) {
                            await markAsRead(n._id);
                          }
                          let tab = n.link.split('?tab=')[1] || '';
                          if (tab === 'docs') tab = 'documents';
                          if (tab) navigate(`/client?tab=${tab}`);
                          else navigate('/client');
                        }}
                        style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981', fontSize: '11px', fontWeight: 700, padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16,185,129,0.15)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'}
                      >
                        View Details <Play size={8} fill="#10B981" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const DashboardView = ({ overview, claims, navigate }) => {
  const inProgress = claims.filter(c => !c.status?.toLowerCase().includes('active')).length;

  return (
    <>
      {/* Overview stat cards */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Claims', value: overview.totalClaims || claims.length, color: CL.text, icon: FileText },
          { label: 'In Progress', value: overview.inProgress || inProgress, color: '#F59E0B', icon: TrendingUp },
          { label: 'Completed', value: overview.completed || 1, color: '#10B981', icon: CheckCircle2 },
          { label: 'Need Action', value: overview.needAction || 2, color: '#EF4444', icon: AlertTriangle },
        ].map(s => (
          <div key={s.label} style={{
            flex: '1 1 140px',
            backgroundColor: CL.card, backgroundImage: CL.cardBgImage,
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            border: `1px solid ${CL.border}`, borderRadius: 14, padding: '16px 14px',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start'
          }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, color: CL.textMuted, marginTop: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* My Claims preview — clicking navigates to the claims tab */}
      <div style={{
        backgroundColor: CL.card, backgroundImage: CL.cardBgImage,
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${CL.border}`, borderRadius: 16, padding: 20, marginBottom: 24
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: CL.text, margin: 0 }}>My Claims</h2>
          <button onClick={() => navigate('/client?tab=claims')} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'none', border: 'none', color: CL.accent,
            fontWeight: 700, fontSize: 12, cursor: 'pointer'
          }}>View All <ArrowRight size={13} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {claims.slice(0, 3).map((claim, i) => {
            const badge = getStatusBadgeStyle(claim.status);
            const initials = claim.name.split(' ').map(n => n[0]).join('').slice(0, 2);
            return (
              <div key={i} style={{
                backgroundColor: 'rgba(255,255,255,0.02)', border: `1px solid ${CL.border}`,
                borderRadius: 12, padding: '14px 16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16,185,129,0.12)', color: '#10B981', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 11 }}>{initials}</div>
                    <div style={{ fontWeight: 800, color: CL.text, fontSize: 13 }}>{claim.name}</div>
                  </div>
                  <div style={{ padding: '3px 8px', borderRadius: 999, background: badge.bg, color: badge.color, border: badge.border, fontSize: 9, fontWeight: 800 }}>
                    {claim.status}
                  </div>
                </div>
                <div style={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 999 }}>
                  <div style={{ width: `${claim.progress}%`, height: '100%', background: getProgressColor(claim.status), borderRadius: 999 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginTop: 6, color: CL.textMuted }}>
                  <span>{claim.progress}%</span><span>{claim.folio}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Actions */}
      <div style={{
        backgroundColor: CL.card, backgroundImage: CL.cardBgImage,
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${CL.border}`, borderRadius: 16, padding: 20, marginBottom: 24
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={16} color={CL.accent} />
            <h2 style={{ fontSize: 15, fontWeight: 800, color: CL.text, margin: 0 }}>Pending Actions</h2>
          </div>
          <div style={{ background: 'rgba(16,185,129,0.12)', color: CL.accent, fontWeight: 800, padding: '4px 10px', borderRadius: 999, fontSize: 10 }}>
            2 Actions
          </div>
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          {[{ title: 'Upload Documents', subtitle: '2 documents pending' }, { title: 'Verify Identity', subtitle: 'Pending verification' }].map(item => (
            <div key={item.title} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
              padding: '12px 16px', borderRadius: 12,
              background: 'rgba(16,185,129,0.02)', border: '1px solid rgba(16,185,129,0.12)', flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(16,185,129,0.08)', display: 'grid', placeItems: 'center', color: CL.accent, flexShrink: 0 }}>
                  <CreditCard size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: CL.text }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: CL.textMuted, marginTop: 2 }}>{item.subtitle}</div>
                </div>
              </div>
              <button 
                onClick={() => navigate('/client?tab=documents')}
                style={{ background: CL.accent, border: 'none', color: CL.bg, padding: '8px 16px', borderRadius: 10, fontWeight: 800, fontSize: 11, cursor: 'pointer' }}
              >
                Upload
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 800, color: CL.text, marginBottom: 14 }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
          {[
            { label: 'Upload Document', icon: Upload },
            { label: 'Support', icon: MessageSquare },
            { label: 'Investment Store', icon: ShoppingBag },
            { label: 'Document Hub', icon: Folder }
          ].map(a => (
            <div key={a.label} 
              onClick={() => {
                if (a.label === 'Document Hub' || a.label === 'Upload Document') navigate('/client?tab=documents');
                else if (a.label === 'Support') navigate('/client?tab=service-hub');
                else if (a.label === 'Investment Store') navigate('/client?tab=investment-store');
              }}
              style={{
                backgroundColor: CL.card, backgroundImage: CL.cardBgImage,
                backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                border: `1px solid ${CL.border}`, borderRadius: 14, padding: '20px 14px',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s'
              }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', display: 'grid', placeItems: 'center', color: CL.accent, marginBottom: 12 }}>
                <a.icon size={18} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: CL.text }}>{a.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Refer & Earn */}
      <div style={{
        backgroundColor: CL.card, backgroundImage: CL.cardBgImage,
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(16,185,129,0.15)',
        borderRadius: 14, padding: '18px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14
      }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'grid', placeItems: 'center', color: CL.accent, flexShrink: 0 }}>
            <RefreshCw size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 800, color: CL.text, fontSize: 14 }}>Refer a Friend &amp; Earn ₹5,000</div>
            <div style={{ color: CL.textMuted, fontSize: 11, marginTop: 2 }}>For every friend who completes their claim recovery through RM Legal</div>
          </div>
        </div>
        <button style={{ background: CL.accent, border: 'none', color: CL.bg, padding: '10px 20px', borderRadius: 10, fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>
          Refer Now
        </button>
      </div>
    </>
  );
};

/* ══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
const ClientDashboard = ({ user: propUser }) => {
  const { user: authUser } = useAuth();
  const user = propUser || authUser;
  const location = useLocation();
  const navigate = useNavigate();

  const urlTab = new URLSearchParams(location.search).get('tab');
  const showServiceHub = urlTab === 'service-hub';
  const showClaims = urlTab === 'claims';
  const showFamilyTree = urlTab === 'family-tree';
  const showDocuments = urlTab === 'documents';
  const showNotifications = urlTab === 'notifications';

  const [dashboard, setDashboard] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isAddFamilyModalOpen, setIsAddFamilyModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifHovered, setNotifHovered] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  const fetchClientNotifications = async () => {
    if (!user?.token) return;
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      const { data } = await axios.get('https://myclaimportal.onrender.com/api/notifications', { headers });
      setNotifications(data.notifications || []);
      setUnreadNotifCount(data.unreadCount || 0);
      window.dispatchEvent(new CustomEvent('notificationCountUpdate', { detail: data.unreadCount || 0 }));
    } catch (err) {
      console.error("Error fetching client notifications:", err);
    }
  };

  const fetchFamilyData = async () => {
    if (!user?.token) return;
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      const [profileRes, familyRes] = await Promise.all([
        axios.get('https://myclaimportal.onrender.com/api/users/client/profile', { headers }),
        axios.get(`https://myclaimportal.onrender.com/api/users?parent_id=${user._id || user.id}`, { headers }).catch(() => ({ data: [] }))
      ]);
      setClientProfile(profileRes.data);
      const embedded = profileRes.data.familyMembers || [];
      const standalone = familyRes.data || [];
      
      const combined = [...embedded];
      standalone.forEach(s => {
        if (!combined.some(c => c._id === s._id || c.name === s.name)) {
          combined.push(s);
        }
      });
      setFamilyMembers(combined);
    } catch (err) {
      console.error("Error fetching client family tree data:", err);
    }
  };

  const fetchDocuments = async () => {
    if (!user?.token) return;
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      const { data } = await axios.get('https://myclaimportal.onrender.com/api/documents', { headers });
      setDocuments(data);
    } catch (err) {
      console.error("Error fetching client documents:", err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      if (!user?.token) { setLoading(false); return; }
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${user.token}` };
        const [dashRes] = await Promise.all([
          axios.get('https://myclaimportal.onrender.com/api/dashboard/client', { headers }),
          fetchFamilyData(),
          fetchDocuments(),
          fetchClientNotifications()
        ]);
        setDashboard(dashRes.data);
      } catch (err) {
        console.error(err);
      } finally { setLoading(false); }
    };
    initData();
  }, [user]);

  const overview = dashboard?.overview || { totalClaims: 3, inProgress: 2, completed: 1, needAction: 2 };

  const claims = (dashboard?.claims || [
    { name: 'TATA STEEL', status: 'Active', progress: 80, folio: 'TWD004589', shares: 120, isin: 'INE081A01020', estValue: '₹1.88L' },
    { name: 'L&T LIMITED', status: 'In Progress', progress: 60, folio: 'LT098765', shares: 50, isin: 'INE018A01030', estValue: '₹90K' },
    { name: 'WIPRO LTD', status: 'Docs Pending', progress: 45, folio: 'WP234112', shares: 410, isin: 'INE075A01022', estValue: '₹1.87L' },
  ]);

  if (loading) return (
    <div style={{ minHeight: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', color: CL.textMuted, background: CL.bg }}>
      <Clock size={36} style={{ color: CL.accent }} />
    </div>
  );

  if (showServiceHub) return (
    <ClientServiceHub user={user} onBack={() => navigate('/client')} />
  );

  const pageTitle = showClaims ? 'My Claims' : 'Dashboard';
  const pageSubtitle = showClaims
    ? 'All company claims linked to your account'
    : "Here's your CLIENT command center.";

  const firstName = user?.name?.split(' ')[0] || 'Kunal';

  const HEADER_CSS = `
    @keyframes wave        { 0%,100%{ transform:rotate(0deg); } 25%{ transform:rotate(20deg); } 75%{ transform:rotate(-10deg); } }
    @keyframes headerSlide { from{ opacity:0; transform:translateY(-20px); } to{ opacity:1; transform:translateY(0); } }
    @keyframes badgeBounce { 0%,100%{ transform:scale(1); } 50%{ transform:scale(1.25); } }
    @keyframes ringPulse   { 0%{ transform:scale(1); opacity:0.7; } 100%{ transform:scale(2.2); opacity:0; } }
    @keyframes gradShift   { 0%{ background-position:0% 50%; } 50%{ background-position:100% 50%; } 100%{ background-position:0% 50%; } }
    @keyframes textShimmer { 0%{ background-position:-200% center; } 100%{ background-position:200% center; } }
    @keyframes subtitleIn  { from{ opacity:0; transform:translateX(-12px); } to{ opacity:1; transform:translateX(0); } }
    @keyframes bellShake   { 0%,100%{ transform:rotate(0); } 20%{ transform:rotate(-12deg); } 40%{ transform:rotate(12deg); } 60%{ transform:rotate(-8deg); } 80%{ transform:rotate(8deg); } }
    @keyframes orb1        { 0%,100%{ transform:translate(0,0) scale(1); } 33%{ transform:translate(30px,-20px) scale(1.1); } 66%{ transform:translate(-15px,25px) scale(0.9); } }
    @keyframes orb2        { 0%,100%{ transform:translate(0,0) scale(1); } 33%{ transform:translate(-25px,15px) scale(0.9); } 66%{ transform:translate(20px,-20px) scale(1.1); } }

    .header-title-shimmer {
      color: var(--dashboard-text);
    }
    .notif-btn {
      position: relative; overflow: visible;
      display: flex; align-items: center; justify-content: center;
      padding: 12px; border-radius: 14px;
      cursor: pointer; font-weight: 800; font-size: 13px;
      border: 1px solid rgba(16,185,129,0.35);
      background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(129,140,248,0.08));
      color: var(--dashboard-text);
      backdrop-filter: blur(12px);
      transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s ease, border-color 0.2s ease;
      animation: headerSlide 0.6s ease 0.4s both;
    }
    .notif-btn:hover {
      transform: translateY(-3px) scale(1.04);
      box-shadow: 0 12px 32px rgba(16,185,129,0.25);
      border-color: rgba(16,185,129,0.6);
    }
    .notif-btn:active { transform: scale(0.97); }
    .notif-btn .bell-icon {
      transition: transform 0.3s ease;
    }
    .notif-btn:hover .bell-icon {
      animation: bellShake 0.5s ease;
    }
    .notif-ring {
      position: absolute; inset: -4px;
      border-radius: 18px;
      border: 2px solid rgba(16,185,129,0.5);
      animation: ringPulse 2s ease infinite;
      pointer-events: none;
    }
    .notif-badge {
      position: absolute; top: -6px; right: -6px;
      min-width: 20px; height: 20px; border-radius: 999px;
      background: linear-gradient(135deg,#EF4444,#DC2626);
      color: #fff; font-size: 10px; font-weight: 900;
      display: flex; align-items: center; justify-content: center;
      padding: 0 5px;
      border: 2px solid var(--dashboard-bg);
      animation: badgeBounce 2s ease 1s infinite;
      box-shadow: 0 4px 12px rgba(239,68,68,0.5);
    }
    .header-wrap {
      position: relative;
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 36px;
      padding: 28px 32px;
      border-radius: 20px;
      background: linear-gradient(135deg, rgba(16,185,129,0.07) 0%, rgba(129,140,248,0.05) 50%, rgba(255,255,255,0.02) 100%);
      border: 1px solid rgba(255,255,255,0.07);
      backdrop-filter: blur(8px);
      overflow: hidden;
      animation: headerSlide 0.5s ease both;
    }
    .header-orb-1 {
      position: absolute; width: 180px; height: 180px; border-radius: 50%;
      background: radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%);
      top: -60px; right: 80px; pointer-events: none;
      animation: orb1 8s ease-in-out infinite;
    }
    .header-orb-2 {
      position: absolute; width: 140px; height: 140px; border-radius: 50%;
      background: radial-gradient(circle, rgba(129,140,248,0.12) 0%, transparent 70%);
      bottom: -40px; left: 200px; pointer-events: none;
      animation: orb2 10s ease-in-out infinite;
    }
    .header-orb-3 {
      position: absolute; width: 80px; height: 80px; border-radius: 50%;
      background: radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%);
      top: 10px; left: 40%; pointer-events: none;
      animation: orb1 6s ease-in-out 2s infinite;
    }
    .header-title-block {
      animation: headerSlide 0.5s ease 0.1s both;
      position: relative; z-index: 1;
    }
    .header-greeting {
      font-size: 30px; font-weight: 900;
      letter-spacing: -0.8px; margin: 0 0 8px 0;
      line-height: 1.1;
    }
    .header-subtitle {
      font-size: 14px; font-weight: 600;
      color: var(--dashboard-text-muted);
      animation: subtitleIn 0.5s ease 0.3s both;
    }
    .header-tag {
      display: inline-block;
      background: rgba(16,185,129,0.15); color: #10B981;
      border: 1px solid rgba(16,185,129,0.3);
      border-radius: 999px; padding: 2px 10px; font-size: 11px;
      font-weight: 800; letter-spacing: 0.05em;
      margin-right: 8px; vertical-align: middle;
      animation: headerSlide 0.5s ease 0.5s both;
    }
  `;

  return (
    <main style={{
      flexGrow: 1, minHeight: 'max-content', minWidth: '100%',
      padding: '32px', backgroundColor: CL.bg, backgroundImage: CL.bgImage,
      color: CL.text, boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5)'
    }}>
      <style>{HEADER_CSS}</style>

      {/* ── ANIMATED HEADER ── */}
      <div className="header-wrap">
        {/* background orbs */}
        <div className="header-orb-1" />
        <div className="header-orb-2" />
        <div className="header-orb-3" />

        {/* left: title block */}
        <div className="header-title-block">
          <div style={{ marginBottom: 6 }}>
            <span className="header-tag">
              {showClaims ? '📁 MY CLAIMS' : showFamilyTree ? '🌳 FAMILY TREE' : showDocuments ? '📁 DOCUMENTS HUB' : showNotifications ? '🔔 NOTIFICATIONS' : '🏠 DASHBOARD'}
            </span>
          </div>
          <h1 className="header-greeting">
            {showClaims ? (
              <span className="header-title-shimmer">My Claims</span>
            ) : showFamilyTree ? (
              <span className="header-title-shimmer">Family Tree</span>
            ) : showDocuments ? (
              <span className="header-title-shimmer">Documents Hub</span>
            ) : showNotifications ? (
              <span className="header-title-shimmer">Notifications</span>
            ) : (
              <>
                Welcome back,{' '}
                <span className="header-title-shimmer">{firstName}</span>
                {' '}
                <span style={{ display: 'inline-block', animation: 'wave 2s ease infinite', fontSize: 26 }}>👋</span>
              </>
            )}
          </h1>
          <div className="header-subtitle">
            {showClaims ? (
              <>Track &amp; manage all your <strong style={{ color: CL.accent }}>company claims</strong> in one place</>
            ) : showFamilyTree ? (
              <>View and manage your <strong style={{ color: CL.accent }}>family hierarchy</strong> and relations</>
            ) : showDocuments ? (
              <>View, upload, and sync your <strong style={{ color: CL.accent }}>identity &amp; financial documents</strong></>
            ) : showNotifications ? (
              <>Stay updated on your <strong style={{ color: CL.accent }}>claim statuses and updates</strong></>
            ) : (
              <>Here's your <strong style={{ color: CL.accent }}>CLIENT</strong> command center — stay on top of everything.</>
            )}
          </div>
        </div>

        {/* right: animated notification bell */}
        <div style={{ position: 'relative', zIndex: 1, animation: 'headerSlide 0.5s ease 0.4s both' }}>
          <button
            className="notif-btn"
            onMouseEnter={() => setNotifHovered(true)}
            onMouseLeave={() => setNotifHovered(false)}
            onClick={() => navigate('/client?tab=notifications')}
          >
            {/* pulse ring */}
            <div className="notif-ring" />
            {/* badge */}
            {unreadNotifCount > 0 && <div className="notif-badge">{unreadNotifCount}</div>}
            <span className="bell-icon"><Bell size={20} /></span>
          </button>
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      {showClaims ? (
        <MyClaimsView claims={claims} navigate={navigate} />
      ) : showFamilyTree ? (
        <ClientFamilyTreeView familyMembers={familyMembers} client={clientProfile || user} onAddFamily={() => setIsAddFamilyModalOpen(true)} />
      ) : showDocuments ? (
        <ClientDocumentsHub documents={documents} clientProfile={clientProfile} user={user} onRefresh={fetchDocuments} />
      ) : showNotifications ? (
        <ClientNotificationsView notifications={notifications} onRefresh={fetchClientNotifications} user={user} />
      ) : (
        <DashboardView overview={overview} claims={claims} navigate={navigate} />
      )}

      {/* 👨‍👩‍👧 ADD FAMILY MEMBER MODAL */}
      {isAddFamilyModalOpen && (
        <AddFamilyMemberModal
          isOpen={isAddFamilyModalOpen}
          onClose={() => setIsAddFamilyModalOpen(false)}
          clientId={user?._id || user?.id}
          onSuccess={fetchFamilyData}
        />
      )}

    </main>
  );
};

export default ClientDashboard;
