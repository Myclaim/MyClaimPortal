import React, { useState, useEffect } from 'react';
import { X, Gift, ArrowRight, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const MODAL_CSS = `
  @keyframes modalBackdropIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes modalSlideUp { from { opacity: 0; transform: translateY(60px) scale(0.92); } to { opacity: 1; transform: translateY(0) scale(1); } }
  @keyframes giftBounce { 0%, 100% { transform: translateY(0) rotate(-5deg); } 50% { transform: translateY(-12px) rotate(5deg); } }
  @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes ringExpand { 0% { transform: scale(0.8); opacity: 0.7; } 100% { transform: scale(1.5); opacity: 0; } }
  @keyframes successPop { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  .refer-modal-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(8px);
    z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    animation: modalBackdropIn 0.3s ease both;
  }
  .refer-modal-card {
    background: var(--card, #1a1f2e);
    border: 1px solid rgba(16,185,129,0.25);
    border-radius: 28px;
    padding: 40px 36px;
    width: 100%; max-width: 460px;
    position: relative; overflow: hidden;
    animation: modalSlideUp 0.4s cubic-bezier(.34,1.56,.64,1) both;
    box-shadow: 0 40px 80px -20px rgba(0,0,0,0.6), 0 0 60px rgba(16,185,129,0.08);
  }
  .refer-modal-gift {
    width: 80px; height: 80px; border-radius: 50%;
    background: linear-gradient(135deg, rgba(16,185,129,0.2), rgba(129,140,248,0.15));
    border: 2px solid rgba(16,185,129,0.3);
    display: grid; place-items: center;
    margin: 0 auto 24px;
    position: relative; animation: giftBounce 3s ease-in-out infinite;
  }
  .refer-modal-gift::before {
    content: ''; position: absolute; inset: -8px; border-radius: 50%;
    border: 2px solid rgba(16,185,129,0.2);
    animation: ringExpand 2s ease-in-out infinite;
  }
  .refer-code-input {
    width: 100%; padding: 14px 18px;
    background: rgba(255,255,255,0.04);
    border: 1.5px solid rgba(255,255,255,0.1);
    border-radius: 14px;
    color: var(--text, #fff);
    font-size: 16px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    outline: none; transition: all 0.2s ease;
    text-align: center;
    box-sizing: border-box;
  }
  .refer-code-input::placeholder { letter-spacing: 1px; text-transform: none; font-weight: 400; }
  .refer-code-input:focus {
    border-color: rgba(16,185,129,0.6);
    box-shadow: 0 0 0 4px rgba(16,185,129,0.12);
    background: rgba(16,185,129,0.05);
  }
  .refer-btn-apply {
    width: 100%; padding: 15px;
    background: linear-gradient(135deg,#10B981,#059669);
    border: none; border-radius: 14px;
    color: #fff; font-size: 15px; font-weight: 800;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease;
    box-shadow: 0 6px 24px rgba(16,185,129,0.35);
  }
  .refer-btn-apply:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 12px 32px rgba(16,185,129,0.5); }
  .refer-btn-apply:active { transform: scale(0.98); }
  .refer-btn-apply:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .refer-btn-skip {
    width: 100%; padding: 13px;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px; cursor: pointer;
    color: rgba(255,255,255,0.5); font-size: 13px; font-weight: 600;
    transition: all 0.2s ease;
  }
  .refer-btn-skip:hover { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.75); background: rgba(255,255,255,0.04); }
  .refer-modal-close {
    position: absolute; top: 16px; right: 16px;
    width: 32px; height: 32px; border-radius: 50%;
    background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1);
    cursor: pointer; display: grid; place-items: center; color: rgba(255,255,255,0.5);
    transition: all 0.2s ease;
  }
  .refer-modal-close:hover { background: rgba(255,255,255,0.12); color: #fff; }
  .step-dot-sm {
    width: 8px; height: 8px; border-radius: 50%;
    background: rgba(16,185,129,0.3); flex-shrink: 0; margin-top: 6px;
  }
  .success-anim { animation: successPop 0.5s cubic-bezier(.34,1.56,.64,1) both; }
  .fade-in { animation: fadeIn 0.3s ease both; }
`;

const ReferCodeModal = ({ onClose }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [skipLoading, setSkipLoading] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/referral/apply', { code: code.trim() });
      setSuccess(data.message || 'Referral code applied!');
      setTimeout(() => onClose(true), 2200);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setSkipLoading(true);
    try {
      await api.post('/referral/dismiss-prompt');
    } catch (e) {
      // Silently fail — just close the modal
    } finally {
      setSkipLoading(false);
      onClose(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleApply();
  };

  return (
    <>
      <style>{MODAL_CSS}</style>
      <div className="refer-modal-backdrop" onClick={(e) => e.target === e.currentTarget && handleSkip()}>
        <div className="refer-modal-card">
          {/* Decorative orbs */}
          <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', top: -80, right: -60, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(129,140,248,0.07) 0%, transparent 70%)', bottom: -60, left: -40, pointerEvents: 'none' }} />

          {/* Close button */}
          <button className="refer-modal-close" onClick={handleSkip}><X size={14} /></button>

          {success ? (
            /* ── SUCCESS STATE ── */
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div className="success-anim" style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.4)', display: 'grid', placeItems: 'center', margin: '0 auto 20px', color: '#10B981' }}>
                <CheckCircle2 size={32} />
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 10 }}>Referral Recorded! ✅</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.6 }}>{success}</div>
            </div>
          ) : (
            /* ── DEFAULT STATE ── */
            <>
              {/* Icon */}
              <div className="refer-modal-gift">
                <Gift size={32} color="#10B981" />
              </div>

              {/* Title */}
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 8, letterSpacing: '-0.5px' }}>
                  Have a Referral Code?
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13.5, lineHeight: 1.6, maxWidth: 320, margin: '0 auto' }}>
                  If someone referred you to MyClaim, enter their code below to link your account to theirs.
                </div>
              </div>

              {/* Input */}
              <div style={{ marginBottom: 12 }}>
                <input
                  className="refer-code-input"
                  placeholder="Enter code e.g. MC-ABC123"
                  value={code}
                  onChange={e => { setCode(e.target.value); setError(''); }}
                  onKeyDown={handleKeyDown}
                  maxLength={10}
                  autoFocus
                />
              </div>

              {/* Error */}
              {error && (
                <div className="fade-in" style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#EF4444', fontSize: 12.5, fontWeight: 600, marginBottom: 12, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10 }}>
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              {/* Apply button */}
              <button
                className="refer-btn-apply"
                onClick={handleApply}
                disabled={loading || !code.trim()}
                style={{ marginBottom: 10 }}
              >
                {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <><ArrowRight size={16} /> Apply Referral Code</>}
              </button>

              {/* Skip button */}
              <button className="refer-btn-skip" onClick={handleSkip} disabled={skipLoading}>
                {skipLoading ? 'Saving...' : "I don't have a referral code"}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ReferCodeModal;
