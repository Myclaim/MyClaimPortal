import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  Search, 
  Bell, 
  ChevronDown, 
  TrendingUp, 
  DollarSign, 
  Briefcase, 
  Clock,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Menu,
  X
} from 'lucide-react';

const EnterpriseDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const stats = [
    { label: 'Total Revenue', value: '$128,430', change: '+12.5%', trend: 'up', icon: DollarSign },
    { label: 'Active Projects', value: '43', change: '+3.2%', trend: 'up', icon: Briefcase },
    { label: 'Total Clients', value: '1,240', change: '-2.4%', trend: 'down', icon: Users },
    { label: 'Pending tasks', value: '18', change: '+5.7%', trend: 'up', icon: Clock },
  ];

  const recentActivity = [
    { id: 1, user: 'Sarah Wilson', action: 'completed the proposal', target: 'Project Alpha', time: '2 hours ago', status: 'success' },
    { id: 2, user: 'James Miller', action: 'added a new client', target: 'Tech Corp', time: '4 hours ago', status: 'info' },
    { id: 3, user: 'Internal System', action: 'generated monthly report', target: 'March 2024', time: '6 hours ago', status: 'warning' },
    { id: 4, user: 'Robert Fox', action: 'rejected the claim', target: 'Ticket #472', time: 'Yesterday', status: 'error' },
  ];

  return (
    <div className="flex h-screen bg-enterprise-bg font-inter text-enterprise-text-primary">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-enterprise-primary to-enterprise-light flex items-center justify-center text-white font-bold">
            G
          </div>
          {isSidebarOpen && <span className="font-bold text-xl tracking-tight">GreenDash</span>}
        </div>

        <nav className="flex-1 px-4 py-4">
          <ul className="space-y-2">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active={true} isOpen={isSidebarOpen} />
            <SidebarItem icon={Users} label="Clients" isOpen={isSidebarOpen} />
            <SidebarItem icon={FileText} label="Claims" isOpen={isSidebarOpen} />
            <SidebarItem icon={Briefcase} label="Projects" isOpen={isSidebarOpen} />
            <SidebarItem icon={Settings} label="Settings" isOpen={isSidebarOpen} />
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-100">
           <button className="flex items-center gap-3 px-4 py-3 w-full text-enterprise-text-secondary hover:bg-gray-50 rounded-xl transition-colors">
             <div className="w-8 h-8 rounded-full bg-gray-200" />
             {isSidebarOpen && (
               <div className="text-left">
                 <p className="text-sm font-semibold text-enterprise-text-primary">Prathmesh K.</p>
                 <p className="text-xs">Admin Account</p>
               </div>
             )}
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg lg:hidden">
              <Menu size={20} />
            </button>
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-enterprise-text-secondary" size={18} />
              <input 
                type="text" 
                placeholder="Search everything..." 
                className="w-full pl-10 pr-4 py-2 bg-enterprise-bg border-none rounded-xl focus:ring-2 focus:ring-enterprise-primary/20 transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-enterprise-text-secondary hover:bg-gray-100 rounded-lg relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-enterprise-error rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-px bg-gray-200 mx-2" />
            <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-xl transition-colors">
              <span className="text-sm font-medium">USD</span>
              <ChevronDown size={16} />
            </button>
            <button className="bg-gradient-to-r from-enterprise-primary to-enterprise-light text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-enterprise-primary/20 hover:opacity-90 transition-opacity">
              Export data
            </button>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Header Section */}
          <div>
            <h1 className="text-2xl font-bold">Enterprise Overview</h1>
            <p className="text-enterprise-text-secondary">Welcome back! Here's what's happening today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <StatCard key={idx} {...stat} />
            ))}
          </div>

          {/* Charts and Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart Section (Placeholder for complex chart) */}
            <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-bold text-lg">Revenue Performance</h3>
                  <p className="text-sm text-enterprise-text-secondary">Monthly growth and projection</p>
                </div>
                <select className="bg-enterprise-bg border-none text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-enterprise-primary/20">
                  <option>Last 6 months</option>
                  <option>Last year</option>
                </select>
              </div>
              
              <div className="h-64 flex items-end justify-between gap-2 px-4">
                {[45, 60, 40, 80, 55, 90, 70].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div 
                      style={{ height: `${height}%` }} 
                      className="w-full bg-gradient-to-t from-enterprise-primary/20 to-enterprise-primary rounded-t-lg transition-all duration-500 group-hover:to-enterprise-light cursor-pointer relative"
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        ${height}k
                      </div>
                    </div>
                    <span className="text-[10px] text-enterprise-text-secondary uppercase font-bold tracking-wider">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Panel */}
            <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 overflow-hidden">
               <div className="flex items-center justify-between mb-6">
                 <h3 className="font-bold text-lg">Recent Activity</h3>
                 <button className="text-xs font-semibold text-enterprise-primary hover:underline">View all</button>
               </div>
               <div className="space-y-6">
                 {recentActivity.map((item) => (
                   <div key={item.id} className="flex gap-4 group cursor-pointer">
                     <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                       item.status === 'success' ? 'bg-enterprise-success' : 
                       item.status === 'error' ? 'bg-enterprise-error' : 
                       item.status === 'warning' ? 'bg-enterprise-warning' : 'bg-enterprise-info'
                     }`} />
                     <div className="flex-1 border-b border-gray-50 pb-4 group-last:border-0">
                       <p className="text-sm font-medium">
                         <span className="text-enterprise-text-primary font-bold">{item.user}</span>
                         {' '}{item.action}
                       </p>
                       <p className="text-xs text-enterprise-text-secondary mt-0.5">{item.target}</p>
                       <p className="text-[10px] text-enterprise-text-secondary mt-2 flex items-center gap-1.5">
                         <Clock size={10} />
                         {item.time}
                       </p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const SidebarItem = ({ icon: Icon, label, active = false, isOpen }) => (
  <li>
    <button className={`
      w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
      ${active ? 'bg-gradient-to-r from-enterprise-primary to-enterprise-light text-white shadow-lg shadow-enterprise-primary/20' : 'text-enterprise-text-secondary hover:bg-gray-50 hover:text-enterprise-primary'}
    `}>
      <Icon size={20} className={active ? 'text-white' : ''} />
      {isOpen && <span className="font-medium text-sm">{label}</span>}
    </button>
  </li>
);

const StatCard = ({ label, value, change, trend, icon: Icon }) => (
    <div className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group">
    <div className="flex items-start justify-between">
      <div className="p-3 bg-enterprise-bg rounded-xl text-enterprise-primary group-hover:bg-enterprise-primary group-hover:text-white transition-colors duration-300">
        <Icon size={24} />
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
        trend === 'up' ? 'text-enterprise-success bg-enterprise-success/10' : 'text-enterprise-error bg-enterprise-error/10'
      }`}>
        {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {change}
      </div>
    </div>
    <div className="mt-4">
      <h4 className="text-enterprise-text-secondary text-sm font-medium">{label}</h4>
      <p className="text-2xl font-bold mt-1 tracking-tight">{value}</p>
    </div>
  </div>
);

export default EnterpriseDashboard;
