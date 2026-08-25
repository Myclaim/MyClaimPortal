import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Users, Shield, Server, Activity, ArrowUpRight, Zap, Folder, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import './Overview.css';

// Animated Number Counter Hook
const useCountUp = (end, duration = 1500) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutQuart
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(ease * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return count;
};

// Formatter for currency
const formatCurrency = (val) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
  return `₹${val.toLocaleString('en-IN')}`;
};

const SuperAdminOverview = () => {
  const dashboardRef = useRef(null);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    managers: 0,
    personnel: 0,
    revenue: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [activeChartIndex, setActiveChartIndex] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/dashboard');
        
        const users = data.users || {};
        const total = Object.values(users).reduce((a, b) => a + b, 0);
        const managers = (users.admin || 0) + (users.super_admin || 0);
        const personnel = (users.employee || 0) + (users.partner || 0) + (users.super_partner || 0);
        
        // Calculate revenue from proposals (assuming 1.5Cr per proposal as per backend logic)
        const revenue = (data.proposals?.total || 0) * 15000000;

        setMetrics({
          totalUsers: total,
          managers: managers,
          personnel: personnel,
          revenue: revenue
        });

        if (data.activity && data.activity.length > 0) {
          setRecentActivity(data.activity.slice(0, 5).map(a => ({
            id: a._id,
            action: a.action,
            status: a.action.toLowerCase().includes('failed') || a.action.toLowerCase().includes('blocked') ? 'alert' : 'success',
            time: new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })));
        }

        if (data.productivity && data.productivity.length > 0) {
          setChartData(data.productivity.map(p => ({
            label: p.label.split(' ')[0], // Use first word for chart label
            val: p.val
          })));
        } else {
          // Fallback or empty state for charts if backend doesn't provide
          setChartData([]);
        }
      } catch (e) {
        console.error("Failed to load metrics", e);
      }
    };
    load();
  }, []);

  // Spotlight Effect
  const handleMouseMove = (e) => {
    if (!dashboardRef.current) return;
    const rect = dashboardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    dashboardRef.current.style.setProperty('--mouse-x', `${x}px`);
    dashboardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  // Animated values
  const animatedRevenue = useCountUp(metrics.revenue, 1500);
  const animatedUsers = useCountUp(metrics.totalUsers, 1500);
  const animatedManagers = useCountUp(metrics.managers, 1500);
  const animatedPersonnel = useCountUp(metrics.personnel, 1500);



  return (
    <div 
      className="super-admin-dashboard" 
      ref={dashboardRef}
      onMouseMove={handleMouseMove}
    >
      <div className="dashboard-spotlight"></div>
      
      <div className="dashboard-content">
        
        {/* HERO SECTION */}
        <div className="hero-header animate-1">
          <div>
            <div className="welcome-text">
              Welcome back, Super Admin <span className="wave-emoji">👋</span>
            </div>
            <h1 className="hero-title">Global Control Center</h1>
          </div>
          <Link to="/super-admin/users" style={{ textDecoration: 'none' }}>
            <button className="cta-button">
              <Shield size={16} /> Manage Access
            </button>
          </Link>
        </div>

        <div className="hero-kpi animate-2" style={{ marginBottom: '48px' }}>
          <div className="kpi-block">
            <div className="kpi-value">{formatCurrency(animatedRevenue)}</div>
            <div className="kpi-label">Total Enterprise Value Overseen</div>
          </div>
          
          <div className="hero-graph-container">
            <div className="hero-graph">
              <svg viewBox="0 0 200 50">
                <path d="M 0 40 Q 30 40, 50 25 T 100 30 T 150 15 T 200 5" />
              </svg>
              <div className="graph-dot"></div>
            </div>
          </div>
        </div>

        {/* METRICS CARDS */}
        <div className="metric-grid animate-3">
          <div className="metric-card">
            <div className="metric-header">
              <div className="metric-icon icon-pulse">
                <Server size={20} strokeWidth={2.5} />
              </div>
              <ArrowUpRight size={18} color="var(--accent-color)" strokeWidth={2.5} />
            </div>
            <div className="metric-value">
              {animatedUsers}
              {metrics.totalUsers === 0 && <span className="metric-empty-badge">System Ready</span>}
            </div>
            <div className="metric-title">Total Enterprise Oversight</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-header">
              <div className="metric-icon icon-up">
                <Users size={20} strokeWidth={2.5} />
              </div>
              <Activity size={18} color="var(--text-secondary)" strokeWidth={2.5} />
            </div>
            <div className="metric-value">
              {animatedManagers}
              {metrics.managers === 0 && <span className="metric-empty-badge">Node Idle</span>}
            </div>
            <div className="metric-title">Operational Managers</div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <div className="metric-icon icon-float">
                <Folder size={20} strokeWidth={2.5} />
              </div>
              <Zap size={18} color="#eab308" strokeWidth={2.5} />
            </div>
            <div className="metric-value">
              {animatedPersonnel}
              {metrics.personnel === 0 && <span className="metric-empty-badge">Awaiting Ops</span>}
            </div>
            <div className="metric-title">Total Personnel</div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="dashboard-grid-2">
          
          {/* Revenue / Analytics Chart */}
          <div className="panel animate-4">
            <div className="panel-header">
              <div className="panel-title">
                System Activity & Throughput
                <div className="live-indicator"></div>
              </div>
            </div>
            <div className="chart-container">
              {chartData.map((col, idx) => (
                <div 
                  key={idx} 
                  className="chart-col"
                  onClick={() => setActiveChartIndex(activeChartIndex === idx ? null : idx)}
                >
                  <div className="chart-bar-track">
                    <div 
                      className="chart-bar-fill"
                      style={{ 
                        height: `${col.val}%`,
                        animationDelay: `${0.8 + (idx * 0.1)}s` 
                      }}
                    ></div>
                    {activeChartIndex === idx && (
                      <div className="chart-tooltip animate-fade">
                        {col.val}%
                      </div>
                    )}
                  </div>
                  <div className="chart-label">
                    <span>{col.label}</span>
                    <span className="chart-label-val">{col.val}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Global Network Activity */}
          <div className="panel animate-5">
            <div className="panel-header">
              <div className="panel-title">
                Live Operations Log
                <div className="live-indicator"></div>
              </div>
              <Activity size={16} color="var(--accent-color)" />
            </div>
            <div className="activity-list">
              {recentActivity.map((log, idx) => (
                <div key={log.id} className="activity-item">
                  <div className={`status-indicator ${log.status === 'success' ? 'status-success' : 'status-alert'}`}></div>
                  <div className="activity-content">
                    <div className="activity-text">{log.action}</div>
                    <div className="activity-time">{log.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-secondary">View Master Audit Logs</button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SuperAdminOverview;
