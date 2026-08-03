import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Bell, Upload, MessageSquare, Folder, Clock,
  AlertTriangle, CreditCard, RefreshCw, ShoppingBag,
  Plus, Eye, CheckCircle2, TrendingUp, FileText, ArrowRight,
  ArrowLeft, User, Activity, Building2, Star, Zap, ChevronRight,
  GitBranch, TreeDeciduous, X, AlertCircle, Play, Ticket, Download, Gift,
  Sun, Moon, LogOut, Phone, Mail, HelpCircle, Layers, UserPlus
} from 'lucide-react';
import ClientServiceHub from './ClientServiceHub';
import ClientMyServices from './ClientMyServices';
import ReferFriendTab from './ReferFriendTab';
import ClientStoreProposalsTab from './ClientStoreProposalsTab';
import ReferCodeModal from '../../../components/modals/ReferCodeModal';
import DocumentsView from '../../../components/documents/DocumentsView';
import AddFamilyMemberModal from '../../../components/forms/AddFamilyMemberModal';
import useAuth from '../../../hooks/useAuth';
import { useTheme } from '../../../contexts/ThemeContext';
import api from '../../../services/api';
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
      return { color: 'var(--dashboard-text-muted)', bg: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.15)', dot: 'var(--dashboard-text-muted)' };
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
    background: linear-gradient(90deg, transparent, var(--dashboard-border), transparent);
    pointer-events: none; skew-x: -20deg;
  }
  .chip-bar-track {
    width: 100%; height: 3px; border-radius: 999px;
    background: var(--dashboard-border); margin-top: 12px; overflow: hidden;
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
  .claims-tab-btn:hover { background: var(--dashboard-card); }
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
    background: var(--dashboard-card-soft);
    backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    border-radius: 22px; padding: 22px;
    display: flex; flex-direction: column; gap: 16px;
    cursor: default; position: relative; overflow: hidden;
    transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s ease, border-color 0.3s ease;
    transform-style: preserve-3d; perspective: 800px;
  }
  .claim-card::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, var(--dashboard-card) 0%, transparent 55%);
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
    background: linear-gradient(90deg, transparent, var(--dashboard-border), transparent);
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
    border: none; color: var(--dashboard-text);
    padding: 10px 18px; border-radius: 11px;
    font-weight: 800; font-size: 12px; cursor: pointer;
    display: flex; align-items: center; gap: 6px;
    transition: transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.22s ease;
    position: relative; overflow: hidden;
  }
  .claim-btn-primary::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, var(--dashboard-border), transparent);
    transform: translateX(-100%); transition: transform 0.45s ease;
  }
  .claim-btn-primary:hover { transform: translateY(-2px) scale(1.05); }
  .claim-btn-primary:hover::after { transform: translateX(100%); }
  .claim-btn-primary:active { transform: scale(0.96); }
  .claim-btn-sec {
    background: var(--dashboard-card);
    border: 1px solid var(--dashboard-border); color: var(--dashboard-text-muted);
    padding: 10px 14px; border-radius: 11px;
    font-weight: 700; font-size: 12px; cursor: pointer;
    transition: all 0.2s ease;
  }
  .claim-btn-sec:hover { background: var(--dashboard-border); color: var(--dashboard-border); border-color: var(--dashboard-border); transform: translateY(-1px); }

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
    border: none; color: var(--dashboard-text); padding: 9px 18px; border-radius: 12px;
    font-weight: 800; font-size: 12px; cursor: pointer;
    box-shadow: 0 4px 20px rgba(16,185,129,0.35);
    transition: transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.22s ease;
    animation: glowPulse 2s ease infinite;
    position: relative; overflow: hidden;
    margin-bottom: 8px;
  }
  .new-claim-btn::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, var(--dashboard-border), transparent);
    transform: translateX(-100%); transition: transform 0.4s ease;
  }
  .new-claim-btn:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 10px 30px rgba(16,185,129,0.5); }
  .new-claim-btn:hover::after { transform: translateX(100%); }
  .new-claim-btn:active { transform: scale(0.97); }

  /* ── Progress bar ── */
  .progress-bar-track {
    width: 100%; height: 5px; background: var(--dashboard-border);
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
        background: `linear-gradient(145deg, var(--dashboard-border) 0%, rgba(255,255,255,0.02) 100%)`,
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
            background: 'var(--dashboard-card-soft)', borderRadius: 11, padding: '10px 11px',
            border: '1px solid var(--dashboard-border)',
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
              width: 1, height: 4, background: 'var(--dashboard-border)', borderRadius: 1
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
    background: var(--dashboard-card-soft);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 18px; padding: 22px;
    backdrop-filter: blur(12px);
    animation: detailFadeUp 0.4s ease var(--sec-delay,0s) both;
  }
  .detail-section:hover {
    border-color: var(--dashboard-border);
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
    border: 1px solid var(--dashboard-border);
    background: rgba(255,255,255,0.02);
    transition: all 0.2s ease;
    animation: detailFadeUp 0.4s ease var(--holder-delay,0s) both;
  }
  .holder-row:hover { background: var(--dashboard-card); border-color: var(--dashboard-border); transform: translateX(4px); }
  .action-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 11px 14px; border-radius: 12px;
    border: 1px solid var(--dashboard-border);
    background: rgba(255,255,255,0.02);
    transition: all 0.2s ease;
    animation: detailFadeUp 0.4s ease var(--action-delay,0s) both;
  }
  .action-row:hover { background: var(--dashboard-card); border-color: var(--dashboard-border); }
  .update-row {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--dashboard-card);
    animation: detailFadeUp 0.4s ease var(--upd-delay,0s) both;
  }
  .update-row:last-child { border-bottom: none; }
  .back-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 10px;
    background: var(--dashboard-border); border: 1px solid var(--dashboard-border);
    color: var(--dashboard-text-muted); cursor: pointer; font-size: 12px; font-weight: 700;
    transition: all 0.2s ease;
  }
  .back-btn:hover { background: var(--dashboard-border); color: var(--dashboard-text); transform: translateX(-3px); }
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
    color: var(--dashboard-text); box-shadow: 0 4px 16px rgba(16,185,129,0.4);
    animation: tagFloat 3s ease infinite;
  }
`;

const ClaimDetailView = ({ claim, onBack }) => {
  const badge = getStatusBadgeStyle(claim.status);
  const initials = claim.name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const orbColor = claim.status?.toLowerCase() === 'active' ? '#10B981'
    : claim.status?.toLowerCase().includes('progress') ? '#F59E0B' : '#818CF8';

  const steps = claim.stages && claim.stages.length > 0 ? claim.stages.map(stage => ({
    label: stage.name,
    date: stage.date,
    done: stage.status === 'completed',
    active: stage.status === 'in-progress' || (stage.subProgress > 0 && stage.subProgress < 100),
    subProgress: stage.subProgress || 0
  })) : [
    { label: 'Documents Collected', date: 'Mar 2, 2026', done: true },
    { label: 'Verification', date: 'Mar 5, 2026', done: true },
    { label: 'Application Filed', date: 'Mar 8, 2026', done: true },
    { label: 'Authority Review', date: 'In Progress — Submitted to IEPF Authority', done: false, active: true },
    { label: 'Claim Approved', date: '', done: false },
    { label: 'Shares Credited', date: '', done: false },
  ];

  const adminUpdates = claim.comments && claim.comments.length > 0 ? claim.comments.slice().reverse().map(c => {
    const dateStr = new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    return { icon: '🔵', text: c.text, by: `Admin · ${dateStr}` };
  }) : [
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
        background: 'var(--dashboard-card-soft)', border: '1px solid rgba(255,255,255,0.07)',
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
                      : 'var(--dashboard-border)',
                    border: step.active ? `2px solid ${orbColor}` : step.done ? '2px solid #10B981' : '2px solid var(--dashboard-border)',
                    boxShadow: step.done ? '0 4px 12px rgba(16,185,129,0.35)' : step.active ? `0 4px 12px ${orbColor}35` : 'none'
                  }}>
                    {step.done ? <CheckCircle2 size={16} color="#fff" /> :
                      step.active ? <Activity size={14} color={orbColor} /> :
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--dashboard-border)' }} />}
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
                <div style={{ paddingBottom: i < steps.length - 1 ? 24 : 0, paddingTop: 5, flex: 1 }}>
                  <div style={{
                    fontWeight: step.active ? 800 : step.done ? 700 : 500,
                    color: step.done ? CL.text : step.active ? orbColor : CL.textMuted,
                    fontSize: 13, lineHeight: 1.3
                  }}>{step.label}</div>
                  {step.date && (
                    <div style={{ fontSize: 10, color: step.active ? orbColor : CL.textMuted, marginTop: 4, fontWeight: 600 }}>
                      {step.active && <span style={{
                        display: 'inline-block', background: `${orbColor}20`, color: orbColor,
                        border: `1px solid ${orbColor}40`, borderRadius: 999, padding: '1px 7px',
                        fontSize: 9, fontWeight: 800, marginRight: 6, animation: 'tagFloat 2s ease infinite'
                      }}>Active</span>}{step.date}
                    </div>
                  )}

                  {/* 4 Substages for every stage */}
                  <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 0, paddingLeft: 0, borderLeft: step.done ? `1px solid rgba(16,185,129,0.3)` : step.active ? `1px solid ${orbColor}50` : `1px solid var(--dashboard-border)`, marginLeft: 8 }}>
                    {['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'].map((subName, subIdx) => {
                      const val = (subIdx + 1) * 25;
                      const isSubDone = step.done || step.subProgress >= val;
                      const subColor = isSubDone ? (step.done ? '#10B981' : orbColor) : 'var(--dashboard-border)';
                      return (
                        <div key={val} style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', padding: '5px 0 5px 16px' }}>
                          <div style={{ position: 'absolute', left: -4, top: '50%', transform: 'translateY(-50%)', width: 7, height: 7, borderRadius: '50%', background: subColor, border: `2px solid var(--dashboard-card)` }} />
                          <div style={{ fontSize: 11, fontWeight: isSubDone ? 700 : 500, color: isSubDone ? CL.text : CL.textMuted }}>
                            {subName} <span style={{ opacity: 0.5, marginLeft: 4 }}>({val}%)</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
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

  const tabs = ['All Companies', 'Active', 'In Progress', 'Completed', 'Claim Hub'];
  const { refs: tabRefs, indicator } = useTabIndicator(tabs, activeTab);

  if (selectedClaim) return <ClaimDetailView claim={selectedClaim} onBack={() => setSelectedClaim(null)} />;



  const totalCompanies = new Set(claims.map(c => c.name)).size;
  const totalShares = claims.reduce((s, c) => s + (Number(c.shares) || 0), 0);
  const completedDocs = claims.filter(c => c.status?.toLowerCase().includes('completed') || c.status?.toLowerCase() === 'closed').length;

  const filtered = claims.filter(c => {
    if (activeTab === 'All Companies') return true;
    if (activeTab === 'Active') return c.status?.toLowerCase() === 'active';
    if (activeTab === 'In Progress') return c.status?.toLowerCase().includes('progress');
    if (activeTab === 'Completed') return c.status?.toLowerCase().includes('completed') || c.status?.toLowerCase() === 'closed';
    return true;
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setTabKey(k => k + 1);
    if (tab === 'Claim Hub') setTimeout(() => navigate('/client?tab=service-hub'), 180);
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
        <StatChip label="Completed"       value={completedDocs}    color="#10B981"  barColor="#10B981"              icon={CheckCircle2} delay={270} />
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
            const isServiceHub = tab === 'Claim Hub';
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
                    color: 'var(--dashboard-text)', fontSize: 9, fontWeight: 900, marginLeft: 6,
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
    background: isClient ? 'linear-gradient(135deg, #10B981, #059669)' : 'var(--family-node-bg)', 
    border: `2px solid ${isClient ? 'rgba(16,185,129,0.5)' : 'var(--family-node-border)'}`,
    color: isClient ? '#fff' : 'var(--dashboard-text)',
    padding: '14px 28px', 
    borderRadius: '16px', 
    minWidth: '140px',
    textAlign: 'center',
    boxShadow: isClient 
      ? '0 10px 25px -5px rgba(16,185,129,0.4), 0 0 20px rgba(16,185,129,0.15)' 
      : 'var(--family-node-shadow)',
    position: 'relative',
    zIndex: 2,
    backdropFilter: 'blur(8px)',
    transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
  }}
  className="family-node-hover"
  >
    <div style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '-0.3px', color: isClient ? '#fff' : 'var(--dashboard-text)' }}>{name}</div>
    <div style={{ fontSize: '10px', color: isClient ? '#A7F3D0' : 'var(--family-role-color)', fontWeight: 800, margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{role}</div>
  </div>
);

const ClientFamilyTreeView = ({ familyMembers, client, onAddClick }) => {
  const ancestors = familyMembers.filter(m => ['Father', 'Mother', 'Grandfather', 'Grandmother'].includes(m.relationWithHolder));
  const siblings = familyMembers.filter(m => ['Brother', 'Sister'].includes(m.relationWithHolder));
  const children = familyMembers.filter(m => ['Son', 'Daughter'].includes(m.relationWithHolder));
  const spouse = familyMembers.filter(m => ['Spouse'].includes(m.relationWithHolder));
  const others = familyMembers.filter(m => !['Father', 'Mother', 'Grandfather', 'Grandmother', 'Brother', 'Sister', 'Son', 'Daughter', 'Spouse'].includes(m.relationWithHolder));

  const lineBg = 'var(--dashboard-border)';

  return (
    <div className="family-tree-container" style={{ 
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
        .family-tree-container {
          --family-node-bg: var(--dashboard-card);
          --family-node-border: var(--dashboard-border);
          --family-node-shadow: 0 4px 12px rgba(0,0,0,0.05), inset 0 1px 1px var(--dashboard-card);
          --family-role-color: var(--dashboard-text-muted);
        }
        .dark .family-tree-container {
          --family-node-bg: rgba(30, 41, 59, 0.45);
          --family-node-border: rgba(255, 255, 255, 0.08);
          --family-node-shadow: 0 4px 12px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.02);
          --family-role-color: rgba(255, 255, 255, 0.5);
        }
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
          onClick={onAddClick}
          style={{ 
            padding: '10px 20px', 
            background: 'linear-gradient(135deg, #10B981, #059669)', 
            color: '#ffffff', 
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
          <UserPlus size={16} /> Add Member
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
            <ClientFamilyTreeNode name={client?.name || 'Primary Client'} role="PRIMARY CLIENT" isClient={true} />
            {(children.length > 0 || spouse.length > 0) && (
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
          <div style={{ padding: '40px', background: 'var(--dashboard-card-soft)', borderRadius: '16px', border: `1px dashed var(--dashboard-border)`, marginTop: '20px' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--dashboard-card)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: CL.textMuted }}>
              <User size={24} />
            </div>
            <p style={{ margin: 0, fontWeight: 700, color: CL.text }}>No family members linked yet.</p>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: CL.textMuted }}>Click "+ Add Member" to build your family tree hierarchy.</p>
            <button
              onClick={onAddClick}
              style={{
                marginTop: '16px',
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <UserPlus size={16} /> Add Member
            </button>
          </div>
        )}

      </div>
    </div>
  );
};


const ClientDocumentsHub = ({ documents, clientProfile, user, onRefresh }) => {
  const { theme } = useTheme();
  const BASE_URL = import.meta.env.DEV ? 'http://localhost:5005' : 'https://myclaimportal.onrender.com';
  const [activeSubTab, setActiveSubTab] = useState('Client Documents');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [companyDocs, setCompanyDocs] = useState([]);
  const [legalDocs, setLegalDocs] = useState([]);
  const [loadingCompany, setLoadingCompany] = useState(false);
  const [loadingLegal, setLoadingLegal] = useState(false);

  const fetchCompanyDocs = async () => {
    setLoadingCompany(true);
    try {
      const { data } = await axios.get(`${BASE_URL}/api/documents/company`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setCompanyDocs(data);
    } catch (err) {
      console.error('Error fetching company documents:', err);
    } finally {
      setLoadingCompany(false);
    }
  };

  const fetchLegalDocs = async () => {
    setLoadingLegal(true);
    try {
      const { data } = await axios.get(`${BASE_URL}/api/documents/legal`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setLegalDocs(data);
    } catch (err) {
      console.error('Error fetching legal documents:', err);
    } finally {
      setLoadingLegal(false);
    }
  };

  // Lazy-load tab data on first switch
  useEffect(() => {
    if (activeSubTab === 'Company Documents' && companyDocs.length === 0 && !loadingCompany) {
      fetchCompanyDocs();
    }
    if (activeSubTab === 'Legal Documents' && legalDocs.length === 0 && !loadingLegal) {
      fetchLegalDocs();
    }
  }, [activeSubTab]);

  const getDocDetails = (docName) => {
    let doc = documents.find(d => d.name.toLowerCase() === docName.toLowerCase());
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
      await axios.post(`${BASE_URL}/api/documents/upload`, formData, {
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

  const primaryDocs = documents.filter(d => d.doc_category === 'primary');
  const uniquePrimaryNames = [...new Set(primaryDocs.map(d => d.name))];
  const cardItems = uniquePrimaryNames.map(name => ({ name, type: 'dynamic' }));
  
  if (!cardItems.find(c => c.name.toLowerCase() === 'aadhaar card')) cardItems.unshift({ name: 'Aadhaar Card', type: 'aadhaar' });
  if (!cardItems.find(c => c.name.toLowerCase() === 'pan card')) cardItems.unshift({ name: 'PAN Card', type: 'pan' });

  /* ── read-only card for admin/legal docs ── */
  const ReadOnlyDocCard = ({ doc }) => {
    const ext = doc.file_url?.split('.').pop()?.toLowerCase() || '';
    const isImage = ['jpg','jpeg','png','gif','webp'].includes(ext);
    const isPDF = ext === 'pdf';
    const formatSize = (b) => !b ? '' : b < 1024 ? `${b} B` : b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(1)} MB`;
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    return (
      <div style={{ background: 'rgba(129,140,248,0.03)', border: '1px solid rgba(129,140,248,0.18)', borderRadius: '16px', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, transition: 'transform 0.2s ease, border-color 0.2s ease' }} className="family-node-hover">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(129,140,248,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818CF8', border: '1px solid rgba(129,140,248,0.2)', flexShrink: 0 }}>
            <FileText size={20} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--dashboard-text)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--dashboard-text-muted)', background: 'rgba(129,140,248,0.08)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(129,140,248,0.15)' }}>{isPDF ? 'PDF' : isImage ? 'Image' : ext.toUpperCase() || 'File'}</span>
              {doc.file_size && <span style={{ fontSize: '11px', color: 'var(--dashboard-text-muted)' }}>{formatSize(doc.file_size)}</span>}
              {doc.createdAt && <span style={{ fontSize: '11px', color: 'var(--dashboard-text-muted)' }}>{formatDate(doc.createdAt)}</span>}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={() => setPreviewDoc({ name: doc.name, url: doc.file_url })} title="Preview" style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--dashboard-card)', border: '1px solid var(--dashboard-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dashboard-text)', cursor: 'pointer' }}>
            <Eye size={15} />
          </button>
          <a href={`${BASE_URL}${doc.file_url}`} target="_blank" rel="noreferrer" title="Download" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', textDecoration: 'none' }}>
            <Download size={15} />
          </a>
        </div>
      </div>
    );
  };

  return (
    <div style={{ position: 'relative' }}>
      {previewDoc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '20px' }} onClick={() => setPreviewDoc(null)}>
          <div style={{ background: 'var(--dashboard-card)', border: '1px solid var(--dashboard-border)', borderRadius: '20px', width: '90%', maxWidth: '1000px', height: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: 'var(--dashboard-text)' }}>{previewDoc.name}</h3>
                {previewDoc.url && (
                  <a href={`${BASE_URL}${previewDoc.url}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '12px', background: 'var(--dashboard-card)', border: '1px solid var(--dashboard-border)', padding: '6px 12px', borderRadius: '8px', textDecoration: 'none', color: 'var(--dashboard-text)', fontWeight: 700, cursor: 'pointer' }}><Download size={14} /> View Original</a>
                )}
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }} onClick={() => setPreviewDoc(null)}><X size={22} /></button>
            </div>
            <div style={{ flex: 1, padding: 0, overflow: 'hidden', background: '#0a0f18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {(() => {
                if (!previewDoc.url) return <div style={{ color: 'var(--dashboard-text)', fontSize: '16px' }}>No file uploaded yet.</div>;
                const fullUrl = previewDoc.url.startsWith('http') ? previewDoc.url : `${BASE_URL}${previewDoc.url}`;
                const ext = fullUrl.split('.').pop().toLowerCase();
                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
                return isImage ? <img src={fullUrl} alt={previewDoc.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <iframe src={fullUrl} title={previewDoc.name} style={{ width: '100%', height: '100%', border: 'none' }} />;
              })()}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--dashboard-border)', marginBottom: 24 }}>
        {['Client Documents', 'Company Documents', 'Legal Documents'].map(tab => (
          <div 
            key={tab}
            style={{
              padding: '12px 0', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              color: activeSubTab === tab ? 'var(--dashboard-text)' : 'var(--dashboard-text-muted)',
              borderBottom: activeSubTab === tab ? '2.5px solid #10B981' : '2.5px solid transparent',
              transition: 'all 0.2s', position: 'relative', top: '1px'
            }}
            onClick={() => setActiveSubTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      {activeSubTab === 'Client Documents' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: '13px', color: 'var(--dashboard-text-muted)', fontWeight: 500 }}>
              Your identity and financial documents
            </div>
            <button
              onClick={triggerGeneralUpload}
              disabled={uploading}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: 800,
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', border: 'none',
                color: '#ffffff', cursor: uploading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s ease', opacity: uploading ? 0.7 : 1
              }}
            >
              <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload Doc'}
            </button>
          </div>

          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', marginBottom: 20, fontWeight: 600 }}>{error}</div>}
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
            {cardItems.map(item => {
              const details = getDocDetails(item.name);
              const isUploaded = details.uploaded;
              let borderStyle = !isUploaded ? '1px solid rgba(245,158,11,0.2)' : (details.status === 'verified' ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(129,140,248,0.25)');
              let iconColor = !isUploaded ? '#F59E0B' : (details.status === 'verified' ? '#10B981' : '#818CF8');
              return (
                <div key={item.name} style={{ background: 'rgba(255,255,255,0.02)', border: borderStyle, borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(8px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--dashboard-card-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor, border: '1px solid var(--dashboard-border)' }}><FileText size={20} /></div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--dashboard-text)', marginBottom: 4 }}>{item.name}</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: iconColor }}>{isUploaded ? details.status.charAt(0).toUpperCase() + details.status.slice(1) : 'Not uploaded'}</div>
                    </div>
                  </div>
                  {isUploaded ? (
                    <button onClick={() => setPreviewDoc({ name: item.name, url: details.url })} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--dashboard-card)', border: '1px solid var(--dashboard-border)', color: 'var(--dashboard-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Eye size={16} /></button>
                  ) : (
                    <button onClick={() => triggerDirectUpload(item.name)} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Upload size={16} /></button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}



      {/* ── COMPANY DOCUMENTS ── */}
      {activeSubTab === 'Company Documents' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: '13px', color: 'var(--dashboard-text-muted)', fontWeight: 500 }}>
              Documents shared by My Claim team specifically for your account
            </div>
            <button
              onClick={fetchCompanyDocs}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, background: 'var(--dashboard-card)', border: '1px solid var(--dashboard-border)', color: 'var(--dashboard-text)', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
          {loadingCompany ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: 'var(--dashboard-text-muted)' }}>
              <Clock size={24} style={{ color: CL.accent, marginRight: 10 }} /> Loading...
            </div>
          ) : companyDocs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--dashboard-text-muted)', background: 'rgba(129,140,248,0.02)', borderRadius: '16px', border: '1px solid rgba(129,140,248,0.12)' }}>
              <Building2 size={48} style={{ marginBottom: '16px', opacity: 0.3, color: '#818CF8' }} />
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--dashboard-text)' }}>No company documents shared yet</div>
              <div style={{ fontSize: '12px', marginTop: '6px' }}>Files shared by My Claim team for your account will appear here.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {companyDocs.map(doc => <ReadOnlyDocCard key={doc._id} doc={doc} />)}
            </div>
          )}
        </div>
      )}

      {/* ── LEGAL DOCUMENTS ── */}
      {activeSubTab === 'Legal Documents' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: '13px', color: 'var(--dashboard-text-muted)', fontWeight: 500 }}>
              Official legal documents, templates and compliance files
            </div>
            <button
              onClick={fetchLegalDocs}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, background: 'var(--dashboard-card)', border: '1px solid var(--dashboard-border)', color: 'var(--dashboard-text)', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
          <div style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.18)', borderRadius: '12px', padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <AlertCircle size={18} color="#10B981" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--dashboard-text)', marginBottom: 3 }}>Legal Notice</div>
              <div style={{ fontSize: '12px', color: 'var(--dashboard-text-muted)', lineHeight: 1.5 }}>These documents are provided for your reference only. Please read all legal documents carefully before signing. For any queries, contact your assigned relationship manager.</div>
            </div>
          </div>
          {loadingLegal ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: 'var(--dashboard-text-muted)' }}>
              <Clock size={24} style={{ color: CL.accent, marginRight: 10 }} /> Loading...
            </div>
          ) : legalDocs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--dashboard-text-muted)', background: 'rgba(16,185,129,0.02)', borderRadius: '16px', border: '1px dashed rgba(16,185,129,0.2)' }}>
              <FileText size={48} style={{ marginBottom: '16px', opacity: 0.3, color: '#10B981' }} />
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--dashboard-text)' }}>No legal documents available</div>
              <div style={{ fontSize: '12px', marginTop: '6px' }}>Legal documents and templates will be published here by the My Claim team.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {legalDocs.map(doc => <ReadOnlyDocCard key={doc._id} doc={doc} />)}
            </div>
          )}
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
    default: return { icon: Bell, color: 'var(--text-muted)', bg: 'var(--dashboard-card-soft)' };
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
          border: 1px solid var(--dashboard-border);
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
              <span style={{ fontSize: '11px', background: 'linear-gradient(135deg,#EF4444,#DC2626)', color: 'var(--dashboard-text)', padding: '3px 10px', borderRadius: 999, fontWeight: 900, boxShadow: '0 2px 8px rgba(239,68,68,0.4)' }}>
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
            background: 'var(--dashboard-card)', 
            color: CL.text, 
            border: '1px solid var(--dashboard-border)', 
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
                  background: bg || 'var(--dashboard-card-soft)', color: color || CL.textMuted,
                  justifyContent: 'center', flexShrink: 0, border: '1px solid var(--dashboard-card)'
                }}>
                  <Icon size={18} strokeWidth={2.5} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: 'var(--dashboard-text)' }}>{n.title}</h4>
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
                        style={{ background: 'none', border: '1px solid var(--dashboard-border)', color: 'var(--dashboard-text)', fontSize: '11px', fontWeight: 700, padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--dashboard-card)'}
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
          { label: 'Completed', value: overview.completed || claims.filter(c => c.status?.toLowerCase() === 'completed').length, color: '#10B981', icon: CheckCircle2 },
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 8 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 1, minWidth: 0 }}>
                    <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 8, background: 'rgba(16,185,129,0.12)', color: '#10B981', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 11 }}>{initials}</div>
                    <div style={{ fontWeight: 800, color: CL.text, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={claim.name}>{claim.name}</div>
                  </div>
                  <div style={{ flexShrink: 0, padding: '3px 8px', borderRadius: 999, background: badge.bg, color: badge.color, border: badge.border, fontSize: 9, fontWeight: 800 }}>
                    {claim.status}
                  </div>
                </div>
                <div style={{ width: '100%', height: 3, background: 'var(--dashboard-card)', borderRadius: 999 }}>
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
            { label: 'Document Hub', icon: Folder }
          ].map(a => (
            <div key={a.label} 
              onClick={() => {
                if (a.label === 'Document Hub' || a.label === 'Upload Document') navigate('/client?tab=documents');
                else if (a.label === 'Support') navigate('/client?tab=service-hub');
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
            <Gift size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 800, color: CL.text, fontSize: 14 }}>Refer a Friend</div>
            <div style={{ color: CL.textMuted, fontSize: 11, marginTop: 2 }}>Share your referral code — when a friend joins using your code, they're linked to your account</div>
          </div>
        </div>
        <button
          onClick={() => navigate('/client?tab=refer-friend')}
          style={{ background: CL.accent, border: 'none', color: CL.bg, padding: '10px 20px', borderRadius: 10, fontWeight: 800, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Gift size={13} /> Refer a Friend
        </button>
      </div>
    </>
  );
};

/* ── MY PROFILE VIEW COMPONENT ── */
const MyProfileView = ({ user, clientProfile }) => {
  const name = clientProfile?.name || user?.name || 'Client User';
  const email = clientProfile?.email || user?.email || 'client@myclaim.com';
  const mobile = clientProfile?.kyc_data?.mobile || clientProfile?.mobile || clientProfile?.phone || user?.phone || '+91 9924261499';

  return (
    <div style={{
      maxWidth: '680px',
      margin: '20px auto',
      background: CL.card,
      backgroundImage: CL.cardBgImage,
      border: `1px solid ${CL.border}`,
      borderRadius: '24px',
      padding: '36px',
      boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative top accent gradient */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '5px',
        background: 'linear-gradient(90deg, #10B981, #818CF8, #F59E0B)'
      }} />

      {/* Header Avatar & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--dashboard-border)' }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          color: '#ffffff', fontSize: '32px', fontWeight: 900,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(16,185,129,0.35)', flexShrink: 0
        }}>
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: 'var(--dashboard-text)' }}>My Profile</h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--dashboard-text-muted)', fontWeight: 500 }}>Your personal contact and account details</p>
        </div>
      </div>

      {/* Details Cards Grid - strictly Name, Email, Mobile Number */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Full Name */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--dashboard-border)',
          borderRadius: '16px',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '18px'
        }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '12px',
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
            display: 'grid', placeItems: 'center', color: '#10B981', flexShrink: 0
          }}>
            <User size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--dashboard-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
              Full Name
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--dashboard-text)' }}>
              {name}
            </div>
          </div>
        </div>

        {/* Email Address */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--dashboard-border)',
          borderRadius: '16px',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '18px'
        }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '12px',
            background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)',
            display: 'grid', placeItems: 'center', color: '#818CF8', flexShrink: 0
          }}>
            <Mail size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--dashboard-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
              Email Address
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--dashboard-text)' }}>
              {email}
            </div>
          </div>
        </div>

        {/* Mobile Number */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--dashboard-border)',
          borderRadius: '16px',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '18px'
        }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '12px',
            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
            display: 'grid', placeItems: 'center', color: '#F59E0B', flexShrink: 0
          }}>
            <Phone size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--dashboard-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
              Mobile Number
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--dashboard-text)' }}>
              {mobile}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
const ClientDashboard = ({ user: propUser }) => {
  const { user: authUser, logout } = useAuth();
  const user = propUser || authUser;
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const urlTab = new URLSearchParams(location.search).get('tab');
  const showProfile = urlTab === 'profile';
  const showServiceHub = urlTab === 'service-hub';
  const showClaims = urlTab === 'claims';
  const showFamilyTree = urlTab === 'family-tree';
  const showDocuments = urlTab === 'documents';
  const showNotifications = urlTab === 'notifications';
  const showServices = urlTab === 'services';
  const showIEPFSearch = urlTab === 'iepf-search';
  const showReferFriend = urlTab === 'refer-friend';
  const showStoreProposals = urlTab === 'store-proposals';

  const [dashboard, setDashboard] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isAddFamilyModalOpen, setIsAddFamilyModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifHovered, setNotifHovered] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [showReferModal, setShowReferModal] = useState(false);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchClientNotifications = async () => {
    if (!user?.token) return;
    try {
      const { data } = await api.get('/notifications');
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
      const [profileRes, familyRes] = await Promise.all([
        api.get('/users/client/profile'),
        api.get(`/users?parent_id=${user._id || user.id}`).catch(() => ({ data: [] }))
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
      const { data } = await api.get('/documents');
      setDocuments(data);
    } catch (err) {
      console.error("Error fetching client documents:", err);
    }
  };

  const fetchDashboardData = async () => {
    if (!user?.token) return;
    try {
      const { data } = await api.get('/dashboard/client');
      setDashboard(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      if (!user?.token) { setLoading(false); return; }
      try {
        setLoading(true);
        await Promise.all([
          fetchDashboardData(),
          fetchFamilyData(),
          fetchDocuments(),
          fetchClientNotifications()
        ]);
      } catch (err) {
        console.error(err);
      } finally { setLoading(false); }
    };
    initData();

    // Listen to real-time notification events from Layout's socket listener
    const handleNewNotif = () => {
      fetchClientNotifications();
      fetchDashboardData();
    };
    window.addEventListener('newNotificationEvent', handleNewNotif);
    return () => window.removeEventListener('newNotificationEvent', handleNewNotif);
  }, [user]);

  // ── Show referral code prompt for new clients (max 3 times) ──
  useEffect(() => {
    if (!user || user.role !== 'client' || loading) return;
    const checkReferPrompt = async () => {
      try {
        const { data: refData } = await api.get('/referral/my-code');
        // Show modal if: hasn't entered a code AND been shown fewer than 3 times
        if (!refData.hasEnteredReferCode && (refData.referCodePromptCount || 0) < 3) {
          // Small delay so dashboard loads first
          setTimeout(() => setShowReferModal(true), 1200);
        }
      } catch (e) {
        // silently skip if referral API unavailable
      }
    };
    checkReferPrompt();
  }, [user, loading]);

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

  const firstName = user?.name?.split(' ')[0] || 'Client';

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
      color: var(--dashboard-text); font-size: 10px; font-weight: 900;
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
      z-index: 10;
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
              {showProfile ? '👤 MY PROFILE' : showClaims ? '📁 MY CLAIMS' : showFamilyTree ? '🌳 FAMILY TREE' : showDocuments ? '📁 DOCUMENTS HUB' : showNotifications ? '🔔 NOTIFICATIONS' : showReferFriend ? '🎁 REFER A FRIEND' : '🏠 DASHBOARD'}
            </span>
          </div>
          <h1 className="header-greeting">
            {showProfile ? (
              <span className="header-title-shimmer">My Profile</span>
            ) : showClaims ? (
              <span className="header-title-shimmer">My Claims</span>
            ) : showFamilyTree ? (
              <span className="header-title-shimmer">Family Tree</span>
            ) : showDocuments ? (
              <span className="header-title-shimmer">Documents Hub</span>
            ) : showNotifications ? (
              <span className="header-title-shimmer">Notifications</span>
            ) : showReferFriend ? (
              <span className="header-title-shimmer">Refer a Friend</span>
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
            {showProfile ? (
              <>View your personal <strong style={{ color: CL.accent }}>contact &amp; account details</strong></>
            ) : showClaims ? (
              <>Track &amp; manage all your <strong style={{ color: CL.accent }}>company claims</strong> in one place</>
            ) : showFamilyTree ? (
              <>View and manage your <strong style={{ color: CL.accent }}>family hierarchy</strong> and relations</>
            ) : showDocuments ? (
              <>View, upload, and sync your <strong style={{ color: CL.accent }}>identity &amp; financial documents</strong></>
            ) : showNotifications ? (
              <>Stay updated on your <strong style={{ color: CL.accent }}>claim statuses and updates</strong></>
            ) : showReferFriend ? (
              <>Share your code, earn <strong style={{ color: CL.accent }}>₹500 per referral</strong> and help friends recover their assets</>
            ) : (
              <>Here's your <strong style={{ color: CL.accent }}>CLIENT</strong> command center — stay on top of everything.</>
            )}
          </div>
        </div>

        {/* right: topbar action icons (Bell, Theme Toggle, User Profile Menu) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1, animation: 'headerSlide 0.5s ease 0.4s both' }}>
          {/* 1. Notifications Bell */}
          <button
            className="notif-btn"
            style={{ width: 42, height: 42, borderRadius: '50%', padding: 0 }}
            title="Notifications"
            onClick={() => navigate('/client?tab=notifications')}
          >
            {unreadNotifCount > 0 && <div className="notif-badge">{unreadNotifCount}</div>}
            <span className="bell-icon"><Bell size={18} /></span>
          </button>

          {/* 2. Light / Dark Theme Mode Toggle */}
          <button
            className="notif-btn"
            style={{ width: 42, height: 42, borderRadius: '50%', padding: 0 }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun size={18} color="#F59E0B" /> : <Moon size={18} color="#818CF8" />}
          </button>

          {/* 3. User Account / Profile Button Trigger & Popover Menu */}
          <div style={{ position: 'relative' }} ref={profileMenuRef}>
            <button
              className="notif-btn"
              style={{ width: 42, height: 42, borderRadius: '50%', padding: 0, border: showProfileMenu ? '1.5px solid #10B981' : undefined }}
              title="Account Profile"
              onClick={() => setShowProfileMenu(prev => !prev)}
            >
              <User size={18} />
            </button>

            {/* Profile Popover Menu */}
            {showProfileMenu && (
              <div style={{
                position: 'absolute',
                top: '52px',
                right: 0,
                width: '340px',
                background: theme === 'dark' ? '#1E293B' : '#FFFFFF',
                color: theme === 'dark' ? '#F8FAFC' : '#0F172A',
                border: theme === 'dark' ? '1px solid #334155' : '1px solid #E2E8F0',
                borderRadius: '20px',
                boxShadow: '0 25px 60px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.1)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                zIndex: 9999,
                overflow: 'hidden',
                animation: 'headerSlide 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
              }}>
                {/* User Info Top Card */}
                <div style={{
                  padding: '20px',
                  borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #E2E8F0',
                  background: theme === 'dark' ? '#0F172A' : '#F8FAFC'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                    <div style={{
                      width: '52px', height: '52px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                      border: '2px solid rgba(255,255,255,0.2)',
                      color: '#ffffff', fontSize: '22px', fontWeight: 900,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 14px rgba(29,78,216,0.35)', flexShrink: 0
                    }}>
                      {(user?.name || clientProfile?.name || 'P').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: theme === 'dark' ? '#F8FAFC' : '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user?.name || clientProfile?.name || 'pranavsarvaiya54'}
                      </div>
                      <button
                        onClick={() => { setShowProfileMenu(false); navigate('/client?tab=profile'); }}
                        style={{ background: 'none', border: 'none', padding: 0, color: '#2563EB', fontSize: '13px', fontWeight: 700, cursor: 'pointer', marginTop: '2px', textDecoration: 'underline' }}
                      >
                        View Profile
                      </button>
                    </div>
                  </div>

                  {/* Phone & Email Info */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px',
                    color: theme === 'dark' ? '#94A3B8' : '#64748B', paddingTop: '10px',
                    borderTop: theme === 'dark' ? '1px dashed #334155' : '1px dashed #E2E8F0', flexWrap: 'wrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={13} color={theme === 'dark' ? '#94A3B8' : '#64748B'} />
                      <span>{clientProfile?.kyc_data?.mobile || user?.phone || clientProfile?.mobile || clientProfile?.phone || '9924261499'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                      <Mail size={13} color={theme === 'dark' ? '#94A3B8' : '#64748B'} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || clientProfile?.email || 'pranavsarvaiya54@yahoo.com'}</span>
                    </div>
                  </div>
                </div>

                {/* Inner List Box (Padded bordered list matching screenshot) */}
                <div style={{ padding: '12px' }}>
                  <div style={{
                    border: theme === 'dark' ? '1px solid #334155' : '1px solid #E2E8F0',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background: theme === 'dark' ? '#0F172A' : '#FFFFFF'
                  }}>
                    {[
                      { label: 'My Services', icon: FileText, tab: 'services' },
                      { label: 'My Claims', icon: Layers, tab: 'claims' },
                      { label: 'Family Tree', icon: TreeDeciduous, tab: 'family-tree' },
                      { label: 'Documents Hub', icon: Folder, tab: 'documents' },
                      { label: 'Help & Support', icon: HelpCircle, tab: 'service-hub' },
                      { label: 'Store Proposals', icon: ShoppingBag, tab: 'store-proposals' },
                      { label: 'Refer & Earn', icon: Gift, tab: 'refer-friend' },
                    ].map((opt) => (
                      <div
                        key={opt.label}
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate(`/client?tab=${opt.tab}`);
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px 16px', cursor: 'pointer',
                          borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #F1F5F9',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = theme === 'dark' ? '#1E293B' : '#F8FAFC'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: theme === 'dark' ? '#1E293B' : '#F1F5F9',
                            border: theme === 'dark' ? '1px solid #334155' : '1px solid #E2E8F0',
                            display: 'grid', placeItems: 'center', color: theme === 'dark' ? '#94A3B8' : '#475569'
                          }}>
                            <opt.icon size={16} />
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: theme === 'dark' ? '#F8FAFC' : '#0F172A' }}>{opt.label}</span>
                        </div>
                        <ChevronRight size={15} color={theme === 'dark' ? '#64748B' : '#94A3B8'} />
                      </div>
                    ))}

                    {/* Log out row */}
                    <div
                      onClick={() => {
                        setShowProfileMenu(false);
                        if (logout) logout();
                        navigate('/login');
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 16px', cursor: 'pointer',
                        background: 'rgba(239,68,68,0.04)',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.04)'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'grid', placeItems: 'center', color: '#EF4444' }}>
                          <LogOut size={16} />
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#EF4444' }}>Log out</span>
                      </div>
                      <ChevronRight size={15} color="#EF4444" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      {showProfile ? (
        <MyProfileView user={user} clientProfile={clientProfile} />
      ) : showClaims ? (
        <MyClaimsView claims={claims} navigate={navigate} />
      ) : showFamilyTree ? (
        <ClientFamilyTreeView familyMembers={familyMembers} client={clientProfile || user} onAddClick={() => setIsAddFamilyModalOpen(true)} />
      ) : showDocuments ? (
        <ClientDocumentsHub documents={documents} clientProfile={clientProfile} user={user} onRefresh={fetchDocuments} />
      ) : showNotifications ? (
        <ClientNotificationsView notifications={notifications} onRefresh={fetchClientNotifications} user={user} />
      ) : showServices ? (
        <ClientMyServices user={user} />
      ) : showReferFriend ? (
        <ReferFriendTab user={user} />
      ) : showStoreProposals ? (
        <ClientStoreProposalsTab user={user} />
      ) : showIEPFSearch ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center', animation: 'headerSlide 0.5s ease both' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px', animation: 'badgeBounce 2s infinite' }}>🔍</div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>IEPF Search</h2>
          <p style={{ fontSize: '16px', color: 'var(--dashboard-text-muted)', maxWidth: '400px', lineHeight: 1.6 }}>
            The advanced IEPF search engine is coming soon. Get ready to uncover unclaimed wealth easily!
          </p>
          <div style={{ marginTop: '32px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)', animation: 'ringPulse 1.5s infinite' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)', animation: 'ringPulse 1.5s infinite 0.2s' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)', animation: 'ringPulse 1.5s infinite 0.4s' }} />
          </div>
        </div>
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

      {/* 🎁 REFERRAL CODE PROMPT MODAL */}
      {showReferModal && (
        <ReferCodeModal
          onClose={(applied) => {
            setShowReferModal(false);
          }}
        />
      )}

    </main>
  );
};

export { ClientDocumentsHub };
export default ClientDashboard;
