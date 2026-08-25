import { useState, useEffect } from 'react';
import {
  Activity, Clock, CheckCircle, FileText, Loader2, Play
} from 'lucide-react';
import api from '../../../services/api';

// ============================================================
// EMPLOYEE ACTIVITY LOG
// Role: Employee only
// Scope: View only their own activity.
// ============================================================

const CSS = `
  .ea-page { display: block; }
  .ea-topbar { padding: 20px 32px; border-bottom: 1px solid var(--border); background: var(--card);
    display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
    position: sticky; top: 0; z-index: 50; backdrop-filter: blur(12px); }
  .ea-body { padding: 28px 32px; max-width: 800px; margin: 0 auto; }

  .ea-timeline { position: relative; padding-left: 32px; }
  .ea-timeline::before { content: ''; position: absolute; left: 15px; top: 0; bottom: 0; width: 2px; background: var(--border); }
  
  .ea-item { position: relative; margin-bottom: 24px; }
  .ea-item:last-child { margin-bottom: 0; }
  
  .ea-icon-wrap { position: absolute; left: -32px; top: 0; width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; background: var(--card);
    border: 2px solid var(--border); z-index: 2; transform: translateX(-50%); }
    
  .ea-card { background: var(--card); border: 1px solid var(--border); border-radius: 12px;
    padding: 20px; transition: all 0.2s; }
  .ea-card:hover { border-color: var(--accent-green); box-shadow: 0 4px 12px rgba(0,0,0,0.05); transform: translateY(-2px); }

  @keyframes eaFadeIn { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes spin { to { transform: rotate(360deg) } }
`;

const getIconForAction = (action) => {
  const lower = (action || '').toLowerCase();
  if (lower.includes('started') || lower.includes('begin')) return { icon: Play, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' };
  if (lower.includes('document') || lower.includes('upload')) return { icon: FileText, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' };
  if (lower.includes('complet') || lower.includes('finish') || lower.includes('marked as completed')) return { icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.1)' };
  if (lower.includes('progress') || lower.includes('note') || lower.includes('comment')) return { icon: Clock, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' };
  return { icon: Activity, color: 'var(--text-muted)', bg: 'var(--bg)' };
};

const EmployeeActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        // Using dashboard endpoint as it already safely returns ONLY this employee's activity
        const { data } = await api.get('/dashboard/employee');
        setActivities(data.recentActivity || []);
      } catch (err) {
        console.error('Error fetching activity log:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  return (
    <div className="page active ea-page">
      <style>{CSS}</style>

      {/* Topbar */}
      <div className="ea-topbar">
        <div style={{ flex: '0 0 auto' }}>
          <div style={{ fontSize: 22, fontWeight: 850, color: 'var(--text)', letterSpacing: '-0.5px' }}>Activity Log</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Track your recent actions, uploads, and progress updates
          </div>
        </div>
      </div>

      <div className="ea-body">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-green)', margin: '0 auto' }} />
            <div style={{ marginTop: 12, fontSize: 14, fontWeight: 600 }}>Loading activity timeline…</div>
          </div>
        ) : activities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, color: 'var(--text-muted)' }}>
            <Activity size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
            <div style={{ fontSize: 15, fontWeight: 700 }}>No activity yet</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>
              Your actions like starting tasks and uploading documents will appear here.
            </div>
          </div>
        ) : (
          <div className="ea-timeline">
            {activities.map((act, i) => {
              const { icon: Icon, color, bg } = getIconForAction(act.action);
              return (
                <div key={act._id || i} className="ea-item" style={{ animation: `eaFadeIn 0.4s ease ${i * 0.05}s both` }}>
                  <div className="ea-icon-wrap" style={{ borderColor: color, background: bg, color }}>
                    <Icon size={14} strokeWidth={2.5} />
                  </div>
                  <div className="ea-card">
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text)', lineHeight: 1.4 }}>
                      {act.action}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={12} />
                      {new Date(act.createdAt).toLocaleString('en-GB', { 
                        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', 
                        hour: '2-digit', minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeActivity;
