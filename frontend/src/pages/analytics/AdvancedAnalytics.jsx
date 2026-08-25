import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { Download, Activity, Clock, Target, Users, AlertTriangle } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import api from '../../services/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const AdvancedAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('7d');
  const [data, setData] = useState({
    tickets: [],
    users: [],
    statusData: [],
    priorityData: [],
    serviceData: []
  });
  
  const reportRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ticketsRes, usersRes] = await Promise.all([
        api.get('/tickets'),
        api.get('/users')
      ]);

      const tickets = ticketsRes.data;
      const users = usersRes.data;

      // Compute Status Distribution
      const statusCounts = tickets.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
      }, {});
      const statusData = Object.keys(statusCounts).map(key => ({
        name: key.replace('_', ' ').toUpperCase(),
        value: statusCounts[key]
      }));

      // Compute Priority Distribution
      const priorityCounts = tickets.reduce((acc, t) => {
        const p = t.priority || 'medium';
        acc[p] = (acc[p] || 0) + 1;
        return acc;
      }, {});
      const priorityData = Object.keys(priorityCounts).map(key => ({
        name: key.toUpperCase(),
        value: priorityCounts[key]
      }));

      // Compute Service/Category Distribution
      const serviceCounts = tickets.reduce((acc, t) => {
        const s = t.service || 'Other';
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      }, {});
      const serviceData = Object.keys(serviceCounts).map(key => ({
        name: key,
        value: serviceCounts[key]
      })).sort((a, b) => b.value - a.value).slice(0, 5); // Top 5 services

      setData({
        tickets,
        users,
        statusData,
        priorityData,
        serviceData
      });
    } catch (err) {
      console.error('Failed to fetch analytics data', err);
    } finally {
      setLoading(false);
    }
  };

  const trendData = useMemo(() => {
    if (!data.tickets || data.tickets.length === 0) return [];
    const trendMap = {};
    const today = new Date();
    
    if (timeFilter === '7d' || timeFilter === '30d') {
      const days = timeFilter === '7d' ? 7 : 30;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        trendMap[d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })] = 0;
      }
      
      data.tickets.forEach(t => {
        const tDate = new Date(t.createdAt);
        const dStr = tDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (trendMap[dStr] !== undefined) {
          trendMap[dStr]++;
        }
      });
      
      return Object.keys(trendMap).map(key => ({
        date: key,
        tickets: trendMap[key]
      }));
    } else if (timeFilter === 'monthly') {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        trendMap[d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })] = 0;
      }
      
      data.tickets.forEach(t => {
        const tDate = new Date(t.createdAt);
        const mStr = tDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        if (trendMap[mStr] !== undefined) {
          trendMap[mStr]++;
        }
      });
      
      return Object.keys(trendMap).map(key => ({
        date: key,
        tickets: trendMap[key]
      }));
    }
    return [];
  }, [data.tickets, timeFilter]);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    
    try {
      // Add a brief loading class or state if needed
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Enterprise_Analytics_Report.pdf');
    } catch (err) {
      console.error('Failed to export PDF', err);
      alert('Failed to generate PDF. Check console for details.');
    }
  };

  const calculateSLAAdherence = () => {
    if (data.tickets.length === 0) return 100;
    const now = new Date();
    let breached = 0;
    data.tickets.forEach(t => {
      if (t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed' && t.status !== 'closed') {
        breached++;
      }
    });
    return Math.round(((data.tickets.length - breached) / data.tickets.length) * 100);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg)' }}>
        <div className="spin" style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--blue)', borderRadius: '50%' }}></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', background: 'var(--bg)', minHeight: '100vh' }}>
      
      {/* Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, color: 'var(--text)', letterSpacing: '-0.5px' }}>Advanced Analytics</h1>
          <p style={{ color: 'var(--text-light)', marginTop: '8px', fontSize: '14px' }}>Real-time metrics, SLA tracking, and workload distribution.</p>
        </div>
        <button 
          onClick={handleExportPDF}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--blue)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}
        >
          <Download size={18} /> Export PDF Report
        </button>
      </div>

      {/* Report Container (for PDF rendering) */}
      <div ref={reportRef} style={{ background: 'var(--bg)', padding: '20px', borderRadius: '16px' }}>
        
        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
          <div style={{ background: 'var(--card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--blue)', padding: '10px', borderRadius: '10px' }}><Activity size={20} /></div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Volume</div>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text)' }}>{data.tickets.length}</div>
          </div>
          
          <div style={{ background: 'var(--card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--green)', padding: '10px', borderRadius: '10px' }}><Target size={20} /></div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1px' }}>SLA Adherence</div>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text)' }}>{calculateSLAAdherence()}%</div>
          </div>

          <div style={{ background: 'var(--card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '10px', borderRadius: '10px' }}><Clock size={20} /></div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1px' }}>Pending</div>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text)' }}>{data.tickets.filter(t => t.status === 'active' || t.status === 'in_process').length}</div>
          </div>

          <div style={{ background: 'var(--card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '10px', borderRadius: '10px' }}><Users size={20} /></div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Clients</div>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text)' }}>{data.users.filter(u => u.role === 'client').length}</div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
          
          <div style={{ background: 'var(--card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                Ticket Volume Trend {timeFilter === '7d' ? '(Last 7 Days)' : timeFilter === '30d' ? '(Last 30 Days)' : '(Monthly)'}
              </h3>
              <select 
                value={timeFilter} 
                onChange={(e) => setTimeFilter(e.target.value)}
                style={{ 
                  background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', 
                  padding: '6px 12px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', outline: 'none'
                }}
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="monthly">Monthly (12 Months)</option>
              </select>
            </div>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--blue)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--text-light)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-light)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
                  <Area type="monotone" dataKey="tickets" stroke="var(--blue)" strokeWidth={3} fillOpacity={1} fill="url(#colorTickets)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ background: 'var(--card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '24px', color: 'var(--text)' }}>Status Distribution</h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Charts Row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          <div style={{ background: 'var(--card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '24px', color: 'var(--text)' }}>Top Services Requested</h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.serviceData} layout="vertical" margin={{ left: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                  <XAxis type="number" stroke="var(--text-light)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="var(--text-light)" fontSize={11} tickLine={false} axisLine={false} width={100} />
                  <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }} cursor={{ fill: 'var(--sidebar-hover)' }} />
                  <Bar dataKey="value" fill="var(--green)" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ background: 'var(--card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '24px', color: 'var(--text)' }}>Priority Breakdown</h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.priorityData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--text-light)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-light)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }} cursor={{ fill: 'var(--sidebar-hover)' }} />
                  <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={40}>
                    {data.priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === 'URGENT' ? '#ef4444' : entry.name === 'HIGH' ? '#f59e0b' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdvancedAnalytics;
