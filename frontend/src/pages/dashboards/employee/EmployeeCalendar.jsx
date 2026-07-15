import { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Clock, AlertTriangle, CalendarDays, CheckCircle2,
  Flag
} from 'lucide-react';
import api from '../../../services/api';

const CSS = `
  .cal-page { display: block; padding-bottom: 40px; }
  .cal-topbar { padding: 20px 32px; border-bottom: 1px solid var(--border); background: var(--card);
    display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 50; }
  
  .cal-body { padding: 24px 32px; max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }
  
  /* Widgets */
  .cal-widgets { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .cal-widget { background: var(--card); border: 1px solid var(--border); border-radius: 12px;
    padding: 18px 20px; display: flex; align-items: center; gap: 14px; transition: 0.2s; }
  .cal-widget:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); border-color: var(--border-hover); }
  .cal-widget-icon { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
  .cal-widget-title { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
  .cal-widget-val { font-size: 24px; font-weight: 850; line-height: 1; }
  
  /* Calendar Layout */
  .cal-container { display: flex; gap: 24px; align-items: flex-start; }
  .cal-main { flex: 1; background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 24px; }
  
  .cal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  .cal-nav-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px;
    border: 1px solid var(--border); background: var(--bg); color: var(--text); cursor: pointer; transition: 0.2s; }
  .cal-nav-btn:hover { background: var(--bg-secondary); }
  
  .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
  .cal-day-header { text-align: center; font-size: 12px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; padding-bottom: 8px; }
  
  .cal-day { min-height: 100px; border: 1px solid var(--border); border-radius: 8px; padding: 6px; 
    transition: 0.2s; cursor: pointer; display: flex; flex-direction: column; background: var(--bg); }
  .cal-day:hover { border-color: var(--accent-green); box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
  .cal-day.active { border-color: var(--accent-green); background: rgba(34,197,94,0.05); }
  .cal-day.empty { visibility: hidden; }
  .cal-day-num { font-size: 13px; font-weight: 700; color: var(--text-muted); text-align: right; margin-bottom: 6px; }
  .cal-day.today .cal-day-num { color: #fff; background: var(--accent-green); width: 20px; height: 20px;
    display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; align-self: flex-end; }
  
  .cal-events { display: flex; flex-direction: column; gap: 4px; flex: 1; overflow-y: auto; }
  .cal-event-dot { font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; alignItems: center; gap: 4px; }
  
  /* Sidebar */
  .cal-sidebar { width: 340px; display: flex; flex-direction: column; gap: 16px; }
  .cal-side-card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
  .cal-side-header { font-size: 15px; font-weight: 800; color: var(--text); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
  
  .cal-task-item { padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); margin-bottom: 8px; position: relative; }
  .cal-task-item:last-child { margin-bottom: 0; }
  .cal-task-item.overdue { border-left: 3px solid #ef4444; }
`;

const PRIORITY_COLORS = { urgent: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#3b82f6' };

const EmployeeCalendar = () => {
  const [tasks, setTasks] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      // Get all employee tickets
      const { data } = await api.get('/tickets');
      setTasks(data);
    } catch (err) {
      console.error(err);
    }
  };

  // ── Date Logic ──────────────────────────────────────────────
  const today = new Date();
  today.setHours(0,0,0,0);

  const getStartOfWeek = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    return new Date(date.setDate(diff));
  };
  
  const getEndOfWeek = (start) => {
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end;
  };

  const isOverdue = (task) => {
    if (!task.dueDate || task.status === 'completed' || task.status === 'closed') return false;
    const due = new Date(task.dueDate);
    due.setHours(0,0,0,0);
    return due < today;
  };

  const getRemainingDays = (task) => {
    if (!task.dueDate) return 'No due date';
    const due = new Date(task.dueDate);
    due.setHours(0,0,0,0);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    return `${diffDays} days left`;
  };

  // ── Derived Stats ──────────────────────────────────────────
  const stats = useMemo(() => {
    const todayStr = today.toISOString().split('T')[0];
    const weekStart = getStartOfWeek(today);
    const weekEnd = getEndOfWeek(weekStart);
    weekStart.setHours(0,0,0,0);
    weekEnd.setHours(23,59,59,999);

    let tToday = 0;
    let tUpcoming = 0;
    let tWeek = 0;
    let tOverdue = 0;

    tasks.forEach(t => {
      if (t.status === 'completed' || t.status === 'closed') return;
      
      if (isOverdue(t)) tOverdue++;

      if (t.dueDate) {
        const due = new Date(t.dueDate);
        due.setHours(0,0,0,0);
        const dueStr = due.toISOString().split('T')[0];
        
        if (dueStr === todayStr) tToday++;
        if (due > today) tUpcoming++;
        if (due >= weekStart && due <= weekEnd) tWeek++;
      }
    });

    return { today: tToday, upcoming: tUpcoming, week: tWeek, overdue: tOverdue };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks]);

  // ── Calendar Grid Logic ────────────────────────────────────
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Adjust so Monday is 0
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const monthTasks = useMemo(() => {
    const map = {};
    tasks.forEach(t => {
      if (t.status === 'completed' || t.status === 'closed' || !t.dueDate) return;
      const due = new Date(t.dueDate);
      if (due.getFullYear() === year && due.getMonth() === month) {
        const d = due.getDate();
        if (!map[d]) map[d] = [];
        map[d].push(t);
      }
    });
    return map;
  }, [tasks, year, month]);

  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return [];
    return tasks.filter(t => {
      if (t.status === 'completed' || t.status === 'closed' || !t.dueDate) return false;
      const due = new Date(t.dueDate);
      return due.getFullYear() === selectedDate.getFullYear() && 
             due.getMonth() === selectedDate.getMonth() && 
             due.getDate() === selectedDate.getDate();
    });
  }, [tasks, selectedDate]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const isToday = (d) => year === today.getFullYear() && month === today.getMonth() && d === today.getDate();
  const isSelected = (d) => selectedDate && year === selectedDate.getFullYear() && month === selectedDate.getMonth() && d === selectedDate.getDate();

  return (
    <div className="page active cal-page">
      <style>{CSS}</style>

      {/* Topbar */}
      <div className="cal-topbar">
        <div>
          <div style={{ fontSize: 22, fontWeight: 850, color: 'var(--text)', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: 10 }}>
            Work Calendar
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Track task due dates and overdue items
          </div>
        </div>
      </div>

      <div className="cal-body">
        
        {/* Widgets */}
        <div className="cal-widgets">
          <div className="cal-widget">
            <div className="cal-widget-icon" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}><CalendarDays size={20} /></div>
            <div>
              <div className="cal-widget-title">Due Today</div>
              <div className="cal-widget-val" style={{ color: '#22c55e' }}>{stats.today}</div>
            </div>
          </div>
          <div className="cal-widget">
            <div className="cal-widget-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}><Clock size={20} /></div>
            <div>
              <div className="cal-widget-title">This Week</div>
              <div className="cal-widget-val" style={{ color: '#3b82f6' }}>{stats.week}</div>
            </div>
          </div>
          <div className="cal-widget">
            <div className="cal-widget-icon" style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7' }}><CheckCircle2 size={20} /></div>
            <div>
              <div className="cal-widget-title">Upcoming</div>
              <div className="cal-widget-val" style={{ color: '#a855f7' }}>{stats.upcoming}</div>
            </div>
          </div>
          <div className="cal-widget" style={{ borderColor: stats.overdue > 0 ? '#ef4444' : 'var(--border)' }}>
            <div className="cal-widget-icon" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}><AlertTriangle size={20} /></div>
            <div>
              <div className="cal-widget-title">Overdue Tasks</div>
              <div className="cal-widget-val" style={{ color: '#ef4444' }}>{stats.overdue}</div>
            </div>
          </div>
        </div>

        <div className="cal-container">
          {/* Main Calendar Grid */}
          <div className="cal-main">
            <div className="cal-header">
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="cal-nav-btn" onClick={prevMonth}><ChevronLeft size={18} /></button>
                <button className="cal-nav-btn" onClick={() => setCurrentDate(new Date())} style={{ width: 'auto', padding: '0 12px', fontSize: 13, fontWeight: 700 }}>Today</button>
                <button className="cal-nav-btn" onClick={nextMonth}><ChevronRight size={18} /></button>
              </div>
            </div>
            
            <div className="cal-grid">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="cal-day-header">{day}</div>
              ))}
              
              {/* Empty cells for padding */}
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="cal-day empty"></div>
              ))}

              {/* Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const d = i + 1;
                const isT = isToday(d);
                const isS = isSelected(d);
                const dayTasks = monthTasks[d] || [];
                
                return (
                  <div 
                    key={d} 
                    className={`cal-day ${isT ? 'today' : ''} ${isS ? 'active' : ''}`}
                    onClick={() => setSelectedDate(new Date(year, month, d))}
                  >
                    <div className="cal-day-num">{d}</div>
                    <div className="cal-events">
                      {dayTasks.map(t => {
                        const od = isOverdue(t);
                        const c = PRIORITY_COLORS[t.priority] || '#94a3b8';
                        return (
                          <div 
                            key={t._id} 
                            className="cal-event-dot" 
                            style={{ 
                              background: od ? 'rgba(239,68,68,0.1)' : `${c}15`, 
                              color: od ? '#ef4444' : c,
                              borderLeft: `2px solid ${od ? '#ef4444' : c}`
                            }}
                          >
                            {od && <AlertTriangle size={8} />} {t.ticketId || 'Task'}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="cal-sidebar">
            <div className="cal-side-card">
              <div className="cal-side-header">
                <CalendarIcon size={18} color="var(--accent-green)" />
                Tasks for {selectedDate.toLocaleString('default', { day: 'numeric', month: 'short' })}
              </div>
              
              {selectedDateTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>
                  No active tasks due on this date.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {selectedDateTasks.map(t => {
                    const od = isOverdue(t);
                    return (
                      <div key={t._id} className={`cal-task-item ${od ? 'overdue' : ''}`}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 800, fontFamily: 'monospace', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 4 }}>
                            #{t.ticketId || new Date(t.createdAt).getTime()}
                          </span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: PRIORITY_COLORS[t.priority], display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Flag size={10} /> {t.priority?.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 8, lineHeight: 1.3 }}>
                          {t.subject || t.service}
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11.5, color: 'var(--text-muted)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>Created:</span> 
                            <span style={{ fontWeight: 600 }}>{new Date(t.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>Remaining:</span> 
                            <span style={{ fontWeight: 700, color: od ? '#ef4444' : 'var(--text)' }}>{getRemainingDays(t)}</span>
                          </div>
                        </div>
                        
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EmployeeCalendar;
