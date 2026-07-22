import React, { useState, useEffect, useCallback } from 'react';
import {
  Gift, Copy, CheckCircle2, Share2, Users,
  Star, Zap, Loader2, Clock
} from 'lucide-react';
import api from '../../../services/api';

const TAB_CSS = `
  @keyframes tabSlideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes codeGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.3); } 50% { box-shadow: 0 0 0 12px rgba(16,185,129,0); } }
  @keyframes giftSpin { 0%, 100% { transform: rotate(-8deg) scale(1); } 50% { transform: rotate(8deg) scale(1.08); } }
  @keyframes shimmerFlow { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes ringOut { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(1.8); opacity: 0; } }
  @keyframes countUp { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes stepIn { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes personFade { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }

  .ref-tab-wrap { animation: tabSlideUp 0.45s ease both; }

  .ref-hero {
    background: linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(129,140,248,0.08) 50%, rgba(245,158,11,0.06) 100%);
    border: 1px solid rgba(16,185,129,0.2);
    border-radius: 24px; padding: 36px 32px;
    position: relative; overflow: hidden;
    animation: tabSlideUp 0.4s ease both;
  }
  .ref-code-box {
    background: rgba(0,0,0,0.25);
    border: 2px solid rgba(16,185,129,0.35);
    border-radius: 18px; padding: 20px 24px;
    display: flex; align-items: center; justify-content: space-between;
    animation: codeGlow 3s ease-in-out infinite;
    gap: 16px; flex-wrap: wrap;
  }
  .ref-code-text {
    font-size: 28px; font-weight: 900;
    letter-spacing: 5px;
    background: linear-gradient(135deg, #10B981, #6EE7B7, #10B981);
    background-size: 200% auto;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmerFlow 3s linear infinite;
    user-select: all;
  }
  .ref-copy-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 18px; border-radius: 12px;
    background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3);
    color: #10B981; font-size: 13px; font-weight: 800;
    cursor: pointer; transition: all 0.2s ease; white-space: nowrap;
  }
  .ref-copy-btn:hover { background: rgba(16,185,129,0.25); transform: translateY(-1px); }
  .ref-share-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 18px; border-radius: 12px;
    background: rgba(37,99,235,0.15); border: 1px solid rgba(37,99,235,0.3);
    color: #60a5fa; font-size: 13px; font-weight: 800;
    cursor: pointer; transition: all 0.2s ease; white-space: nowrap;
  }
  .ref-share-btn:hover { background: rgba(37,99,235,0.25); transform: translateY(-1px); }
  .ref-stat-card {
    background: var(--dashboard-card, rgba(255,255,255,0.04));
    border: 1px solid var(--dashboard-border, rgba(255,255,255,0.08));
    border-radius: 18px; padding: 22px 20px;
    transition: all 0.3s ease;
    animation: tabSlideUp 0.4s ease both;
  }
  .ref-stat-card:hover { transform: translateY(-4px); border-color: rgba(16,185,129,0.3); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
  .ref-step-card {
    background: var(--dashboard-card-soft, rgba(255,255,255,0.03));
    border: 1px solid var(--dashboard-border, rgba(255,255,255,0.07));
    border-radius: 16px; padding: 20px;
    display: flex; gap: 16px; align-items: flex-start;
    animation: stepIn 0.4s ease both;
    transition: all 0.2s ease;
  }
  .ref-step-card:hover { transform: translateX(4px); border-color: rgba(16,185,129,0.2); }
  .ref-step-num {
    width: 42px; height: 42px; border-radius: 12px;
    background: linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.08));
    border: 1.5px solid rgba(16,185,129,0.3);
    color: #10B981; font-size: 16px; font-weight: 900;
    display: grid; place-items: center; flex-shrink: 0;
  }
  .ref-person-row {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 16px; border-radius: 14px;
    border: 1px solid var(--dashboard-border, rgba(255,255,255,0.07));
    background: rgba(255,255,255,0.02);
    animation: personFade 0.35s ease both;
    transition: all 0.2s ease;
  }
  .ref-person-row:hover { background: rgba(255,255,255,0.04); transform: translateX(4px); }
  .ref-avatar {
    width: 40px; height: 40px; border-radius: 50%;
    background: linear-gradient(135deg, rgba(16,185,129,0.3), rgba(129,140,248,0.2));
    border: 2px solid rgba(16,185,129,0.3);
    display: grid; place-items: center;
    font-size: 14px; font-weight: 900; color: #10B981;
    flex-shrink: 0;
  }
  .ref-empty {
    text-align: center; padding: 48px 24px;
    color: rgba(255,255,255,0.35);
  }
`;

const timeAgo = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const ReferFriendTab = ({ user }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const { data: res } = await api.get('/referral/my-code');
      setData(res);
    } catch (err) {
      console.error('[ReferFriendTab] error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCopy = () => {
    if (!data?.referralCode) return;
    navigator.clipboard.writeText(data.referralCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleShare = () => {
    if (!data?.referralCode) return;
    const text = `Join MyClaim and recover your unclaimed assets! Use my referral code *${data.referralCode}* when you sign up. Sign up at myclaim.in`;
    if (navigator.share) {
      navigator.share({ title: 'MyClaim Referral', text }).catch(() => {});
    } else {
      const wa = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(wa, '_blank');
    }
  };

  const CL = {
    text: 'var(--dashboard-text)',
    textMuted: 'var(--dashboard-text-muted)',
    accent: 'var(--dashboard-accent)',
    card: 'var(--dashboard-card)',
    border: 'var(--dashboard-border)',
  };

  const stats = [
    { label: 'Total Referrals', value: data?.referralCount ?? 0, icon: Users, color: '#10B981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.2)', suffix: '' },
    { label: 'Joined Via Your Code', value: data?.referredClients?.length ?? 0, icon: Star, color: '#818CF8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.2)', suffix: '' },
  ];

  const steps = [
    { num: '1', title: 'Share Your Code', desc: 'Share your unique referral code with friends who want to recover their unclaimed shares or assets on MyClaim.' },
    { num: '2', title: 'Friend Registers', desc: 'Your friend signs up on MyClaim and enters your referral code during their first login to link their account to yours.' },
    { num: '3', title: 'Reference Recorded', desc: 'Once your friend enters your code, the referral relationship is saved. You can see who joined via your code in the list below.' },
  ];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: CL.textMuted }}>
      <Loader2 size={28} style={{ color: '#10B981', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <>
      <style>{TAB_CSS}</style>
      <div className="ref-tab-wrap" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── HERO SECTION ── */}
        <div className="ref-hero">
          {/* BG orbs */}
          <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)', top: -100, right: -80, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(129,140,248,0.08) 0%, transparent 70%)', bottom: -60, left: -60, pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Gift icon */}
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.3)', display: 'grid', placeItems: 'center', marginBottom: 16, color: '#10B981', animation: 'giftSpin 4s ease-in-out infinite' }}>
              <Gift size={28} />
            </div>

            <div style={{ fontSize: 28, fontWeight: 900, color: CL.text, marginBottom: 6, letterSpacing: '-0.5px' }}>
              Refer a Friend
            </div>
            <div style={{ color: CL.textMuted, fontSize: 14, marginBottom: 28, maxWidth: 500, lineHeight: 1.6 }}>
              Share your personal referral code with friends. When they sign up using your code, your accounts are linked and their referral is recorded under your name.
            </div>

            {/* Referral Code Box */}
            <div className="ref-code-box">
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Your Referral Code</div>
                <div className="ref-code-text">{data?.referralCode || '...'}</div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="ref-copy-btn" onClick={handleCopy}>
                  {copied ? <><CheckCircle2 size={15} /> Copied!</> : <><Copy size={15} /> Copy Code</>}
                </button>
                <button className="ref-share-btn" onClick={handleShare}>
                  <Share2 size={15} /> Share
                </button>
              </div>
            </div>

            {/* Referred by */}
            {data?.referredBy && (
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'rgba(255,255,255,0.5)' }}>
                <CheckCircle2 size={14} color="#10B981" />
                You were referred with code: <strong style={{ color: '#10B981' }}>{data.referredBy}</strong>
              </div>
            )}
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {stats.map((s, i) => (
            <div key={s.label} className="ref-stat-card" style={{ animationDelay: `${i * 0.08}s` }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: s.bg, border: `1px solid ${s.border}`, display: 'grid', placeItems: 'center', color: s.color, marginBottom: 14 }}>
                <s.icon size={18} />
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: CL.text, letterSpacing: '-0.5px', animation: 'countUp 0.5s cubic-bezier(.34,1.56,.64,1) both', animationDelay: `${i * 0.1 + 0.2}s` }}>
                {s.value}{s.suffix}
              </div>
              <div style={{ fontSize: 12, color: CL.textMuted, marginTop: 4, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── HOW IT WORKS ── */}
        <div style={{ background: CL.card, border: `1px solid ${CL.border}`, borderRadius: 20, padding: '24px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Zap size={18} color="#10B981" />
            <span style={{ fontSize: 16, fontWeight: 800, color: CL.text }}>How It Works</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {steps.map((step, i) => (
              <div key={step.num} className="ref-step-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="ref-step-num">{step.num}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: CL.text, marginBottom: 4 }}>{step.title}</div>
                  <div style={{ fontSize: 12.5, color: CL.textMuted, lineHeight: 1.6 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── REFERRED PEOPLE LIST ── */}
        <div style={{ background: CL.card, border: `1px solid ${CL.border}`, borderRadius: 20, padding: '24px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Users size={18} color="#10B981" />
              <span style={{ fontSize: 16, fontWeight: 800, color: CL.text }}>People You've Referred</span>
            </div>
            {data?.referredClients?.length > 0 && (
              <div style={{ fontSize: 12, fontWeight: 700, color: '#10B981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 999, padding: '3px 10px' }}>
                {data.referredClients.length} {data.referredClients.length === 1 ? 'person' : 'people'}
              </div>
            )}
          </div>

          {data?.referredClients?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.referredClients.map((person, i) => (
                <div key={i} className="ref-person-row" style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className="ref-avatar">{person.name?.[0]?.toUpperCase() || '?'}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: CL.text, marginBottom: 2 }}>{person.name}</div>
                    <div style={{ fontSize: 11.5, color: CL.textMuted }}>{person.email}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: CL.textMuted, flexShrink: 0 }}>
                    <Clock size={11} />
                    {timeAgo(person.joinedAt)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="ref-empty">
              <div style={{ fontSize: 48, marginBottom: 12 }}>🌟</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: CL.text }}>No referrals yet</div>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>Share your code above and start earning rewards when your friends join MyClaim!</div>
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default ReferFriendTab;
