import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, ChevronRight, Check } from 'lucide-react';
import api from '../../services/api';
import TaskDrawer from '../../components/modals/TaskDrawer';

export default function TasksView({ client }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/ticket-tasks?client=${client._id}`);
      setTasks(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (client?._id) fetchTasks();
  }, [client]);

  const handleOpenDrawer = (task = null) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'Claim': 
        return 'bg-sky-500/15 text-sky-400 border border-sky-500/30';
      case 'Service': 
        return 'bg-teal-500/15 text-teal-400 border border-teal-500/30';
      case 'Store': 
        return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
      default: 
        return 'bg-slate-700/30 text-slate-300 border border-slate-600/30';
    }
  };

  const columns = [
    { id: 'Active', title: 'Active' },
    { id: 'Pending', title: 'Pending' },
    { id: 'Completed', title: 'Completed' }
  ];

  const getTasksByColumn = (status) => {
    return tasks.filter(t => (t.boardColumn || t.status || 'Active') === status);
  };

  return (
    <div className="bg-[#141518] rounded-2xl overflow-hidden shadow-xl border border-[#202226]">
      <div className="p-6 border-b border-[#202226] flex justify-between items-center bg-[#16171a]">
        <div>
          <h2 className="text-lg font-bold text-[#f1f3f7] m-0">Client Tasks</h2>
          <p className="text-xs text-[#8c919c] mt-1 m-0">Manage operational tasks assigned for this client</p>
        </div>
        <button 
          onClick={() => handleOpenDrawer(null)}
          className="bg-[#1d72f2] hover:bg-[#1a64d4] text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-transform active:scale-95"
        >
          <Plus size={16} /> Add Task
        </button>
      </div>

      <div className="p-6 overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center text-[#8c919c]">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="p-10 text-center text-[#5e6370] flex flex-col items-center">
            <CheckCircle2 size={40} className="opacity-30 mb-4" />
            <div className="text-base font-semibold text-[#8c919c] mb-2">No tasks found</div>
            <div>Create a task to get started tracking work for this client.</div>
          </div>
        ) : (
          <div className="flex gap-5 min-w-max">
            {columns.map((column) => {
              const columnTasks = getTasksByColumn(column.id);
              return (
                <div key={column.id} className="w-[330px] flex flex-col">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[#f1f3f7] text-xs uppercase tracking-wider">{column.title}</h3>
                      <span className="bg-[#25272e] text-[#8c919c] text-xs font-bold py-0.5 px-2 rounded-full">
                        {columnTasks.length}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-h-[200px] rounded-2xl p-2 bg-[#16171a] border border-[#202226]">
                    {columnTasks.map((task) => (
                      <div
                        key={task._id}
                        onClick={() => handleOpenDrawer(task)}
                        className="mb-3 p-3.5 rounded-xl border border-[#282a32] bg-[#1c1d22] text-[#f1f3f7] shadow-sm cursor-pointer transition-all hover:border-blue-500/50 hover:shadow-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${getTypeBadge(task.type)}`}>
                            {task.type || 'Service'}
                          </span>
                          <div 
                            className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold shadow-sm"
                            title={task.assignedTo?.name || 'Unassigned'}
                          >
                            {task.assignedTo?.name ? task.assignedTo.name.charAt(0).toUpperCase() : '?'}
                          </div>
                        </div>

                        <h4 className="font-bold text-[#f1f3f7] text-xs mb-2 leading-snug">
                          {task.mainHeading || task.description || task.ticket?.subject || 'Task'}
                        </h4>

                        <div className="my-2 p-2 bg-[#141518] rounded-lg border border-[#24262e] text-[10px] space-y-1">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-extrabold text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded text-[9px] shrink-0">👤 Assigned To</span>
                            <span className="font-semibold text-[#e1e4ea] truncate">{task.assignedTo?.name || 'Unassigned'}</span>
                          </div>
                          {task.ticket?.ticketNo && (
                            <div className="text-[9px] text-blue-400 font-mono font-semibold truncate pt-1 border-t border-[#24262e]">
                              🎫 TIC #{task.ticket.ticketNo}
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-[#24262e] text-[10px] text-[#737885]">
                          <span>Init: {task.dateInitiated ? new Date(task.dateInitiated).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '-'}</span>
                          {task.dateCompleted && (
                            <span className="text-emerald-400 font-bold">Done: {new Date(task.dateCompleted).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {columnTasks.length === 0 && (
                      <div className="text-center py-6 text-[11px] text-[#5e6370]">
                        No tasks
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isDrawerOpen && (
        <TaskDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          task={selectedTask}
          defaultClientId={client._id}
          onSave={fetchTasks}
        />
      )}
    </div>
  );
}
