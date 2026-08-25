import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { Shield, Mail, Lock, Loader2, ArrowRight, TrendingUp } from 'lucide-react';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(identifier, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{ 
      minHeight: '100vh', 
      width: '100vw',
      display: 'flex', 
      background: 'var(--bg)',
      fontFamily: "'Sora', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        @keyframes pulse-glow { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.8; } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        
        .login-glass {
          background: var(--card);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--border);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
        }
        
        .login-input {
          background: var(--bg) !important;
          border: 1px solid var(--border) !important;
          color: var(--text) !important;
          transition: all 0.3s ease;
        }
        
        .login-input:focus {
          border-color: #22c55e !important;
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1) !important;
          background: var(--card) !important;
        }

        .auth-blob {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, transparent 70%);
          filter: blur(80px);
          z-index: 0;
          pointer-events: none;
        }

        @media (min-width: 1024px) {
          .login-branding-panel {
            display: flex !important;
          }
        }
        @media (max-width: 640px) {
          .login-glass {
            padding: 32px 24px !important;
            border-radius: 20px !important;
          }
        }
      `}</style>

      {/* Decorative Blobs */}
      <div className="auth-blob" style={{ top: '-10%', right: '-10%', animation: 'float 10s infinite ease-in-out' }}></div>
      <div className="auth-blob" style={{ bottom: '-10%', left: '-10%', animation: 'float 12s infinite ease-in-out reverse', background: 'radial-gradient(circle, rgba(13, 148, 136, 0.1) 0%, transparent 70%)' }}></div>

      {/* Left Pane: Branding & Visuals */}
      <div style={{ 
        flex: 1, 
        display: 'none', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        padding: '80px',
        position: 'relative',
        zIndex: 1,
        background: 'linear-gradient(135deg, rgba(11, 17, 33, 0.95) 0%, rgba(22, 27, 46, 0.8) 100%)',
        borderRight: '1px solid rgba(255,255,255,0.05)'
      }}
      className="login-branding-panel"
      >
        <div style={{ animation: 'slideIn 0.8s ease-out both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '48px' }}>
            <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #0f766e 0%, #22c55e 100%)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(34, 197, 94, 0.3)' }}>
              <Shield size={24} />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 850, color: 'white', letterSpacing: '-1px' }}>IEPF Claims <span style={{ color: '#22c55e' }}>Pro</span></div>
          </div>

          <h1 style={{ fontSize: '56px', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-2px' }}>
             Secure Access to <br/>
             <span style={{ background: 'linear-gradient(90deg, #4ade80, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Asset Recovery</span>
          </h1>
          
          <p style={{ fontSize: '18px', color: '#9ca3af', maxWidth: '480px', lineHeight: 1.6, marginBottom: '48px' }}>
             The definitive enterprise platform for multi-tier IEPF claim processing, monitoring, and legal fulfilment.
          </p>

          <div style={{ display: 'flex', gap: '24px' }}>
             {[
               { val: '₹420Cr+', label: 'Recovered' },
               { val: '98%', label: 'Success Rate' },
               { val: '24/7', label: 'Monitoring' }
             ].map((s, i) => (
               <div key={i}>
                 <div style={{ fontSize: '20px', fontWeight: 800, color: 'white' }}>{s.val}</div>
                 <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', marginTop: '4px' }}>{s.label}</div>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Right Pane: Form */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <div className="login-glass" style={{ 
          width: '100%', 
          maxWidth: '440px', 
          padding: '48px', 
          borderRadius: '32px' 
        }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 850, color: 'var(--text)', marginBottom: '8px' }}>Command Center</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Please authenticate with your secure credentials.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {error && (
              <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#ef4444', fontSize: '13px', fontWeight: 600 }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>Identity (Email or Username)</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input 
                   type="text" 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@myclaim.com or username"
                  className="login-input"
                  style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '14px', fontSize: '15px' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>Access Key</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="login-input"
                  style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '14px', fontSize: '15px' }}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="topbar-btn"
              style={{ padding: '16px', borderRadius: '16px', transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>Initialize Access <ArrowRight size={20} /></>}
            </button>

            <div style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: '12px', marginTop: '16px' }}>
               Verification level: <span style={{ color: '#22c55e', fontWeight: 700 }}>HIGH SECURITY</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
