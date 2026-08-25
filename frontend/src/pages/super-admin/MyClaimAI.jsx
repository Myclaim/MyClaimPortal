import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Bot, User, Sparkles, History, Activity, CheckCircle2, 
  Play, Loader2, XCircle, AlertCircle, ArrowRight, PlayCircle, Settings
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';
import './MyClaimAI.css';

const SUGGESTED_PROMPTS = [
  "Show pending claims",
  "Generate business report",
  "Show missing documents",
  "Revenue summary",
  "Employee workload",
  "Partner performance"
];

const INITIAL_AGENT_FLOW = {
  exchange_agent: { label: "Exchange Agent (Orchestrator)", status: "idle" },
  claim_agent: { label: "Claim Agent (Claims Specialist)", status: "idle" },
  document_agent: { label: "Document Agent (Compliance Specialist)", status: "idle" },
  employee_agent: { label: "Employee Agent (Staffing Analyst)", status: "idle" },
  partner_agent: { label: "Partner Agent (Relations Specialist)", status: "idle" },
  finance_agent: { label: "Finance Agent (Billing Analyst)", status: "idle" },
  notification_agent: { label: "Notification Agent (Dispatcher)", status: "idle" },
  reporting_agent: { label: "Reporting Agent (Report Specialist)", status: "idle" }
};

const MyClaimAI = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [agentFlow, setAgentFlow] = useState(INITIAL_AGENT_FLOW);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [activeTab, setActiveTab] = useState('activity'); // activity | future
  const messagesEndRef = useRef(null);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('myclaim_ai_history');
    if (savedHistory) {
      try {
        setMessages(JSON.parse(savedHistory));
      } catch (err) {
        console.error("Failed to load conversation history:", err);
      }
    } else {
      // Default welcome message
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: "Welcome to MyClaim AI OS Workspace. How is business today? You can choose a suggested prompt below or type your custom query.",
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, []);

  // Save history to localStorage
  const saveHistory = (updatedMessages) => {
    localStorage.setItem('myclaim_ai_history', JSON.stringify(updatedMessages));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Simulate Agent execution flow based on query intent
  const startAgentFlowSimulation = (query) => {
    setAgentFlow(INITIAL_AGENT_FLOW);
    
    // Determine which agents are expected to run
    const lowerQuery = query.toLowerCase();
    const targets = ["exchange_agent"];
    
    if (lowerQuery.includes("claim") || lowerQuery.includes("business")) {
      targets.push("claim_agent");
    }
    if (lowerQuery.includes("document") || lowerQuery.includes("missing")) {
      targets.push("document_agent");
    }
    if (lowerQuery.includes("employee") || lowerQuery.includes("workload")) {
      targets.push("employee_agent");
    }
    if (lowerQuery.includes("partner")) {
      targets.push("partner_agent");
    }
    if (lowerQuery.includes("finance") || lowerQuery.includes("revenue") || lowerQuery.includes("report") || lowerQuery.includes("business")) {
      targets.push("finance_agent");
    }
    if (lowerQuery.includes("notification") || lowerQuery.includes("alert") || lowerQuery.includes("send")) {
      targets.push("notification_agent");
    }
    if (lowerQuery.includes("report") || lowerQuery.includes("business")) {
      targets.push("reporting_agent");
    }
    
    setSelectedAgents(targets);

    // Initial state: Exchange Agent running
    setAgentFlow(prev => ({
      ...prev,
      exchange_agent: { ...prev.exchange_agent, status: 'running' }
    }));

    // Cascade effect for simulation
    let delay = 1500;
    
    targets.forEach((agent, index) => {
      if (agent === "exchange_agent") return;
      
      setTimeout(() => {
        setAgentFlow(prev => {
          const updated = { ...prev };
          // Previous agent completed
          const prevAgent = targets[index - 1];
          if (prevAgent) {
            updated[prevAgent] = { ...updated[prevAgent], status: 'completed' };
          }
          // Current agent running
          updated[agent] = { ...updated[agent], status: 'running' };
          return updated;
        });
      }, delay);
      
      delay += 2500;
    });
  };

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    saveHistory(newMessages);
    setInput('');
    setLoading(true);

    // Start UI simulation for agent steps
    startAgentFlowSimulation(query);

    try {
      // POST payload to Express AI gateway
      const { data } = await api.post('/ai/chat', { message: query });
      
      // All running agents completed successfully
      setAgentFlow(prev => {
        const completedFlow = { ...prev };
        Object.keys(completedFlow).forEach(key => {
          if (completedFlow[key].status === 'running') {
            completedFlow[key].status = 'completed';
          }
        });
        // Wrap exchange agent back to merge response
        completedFlow.exchange_agent = { ...completedFlow.exchange_agent, status: 'completed' };
        return completedFlow;
      });

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer || "Query processed successfully.",
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      saveHistory(finalMessages);
    } catch (err) {
      console.error("AI chat failed:", err);
      
      // Mark active running agents as failed
      setAgentFlow(prev => {
        const failedFlow = { ...prev };
        Object.keys(failedFlow).forEach(key => {
          if (failedFlow[key].status === 'running') {
            failedFlow[key].status = 'failed';
          }
        });
        return failedFlow;
      });

      const errorMessage = err.response?.data?.error || "AI OS execution encountered a connection error.";
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${errorMessage}\n\nDetails: ${err.response?.data?.details || err.message}`,
        timestamp: new Date().toISOString(),
        isError: true
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      saveHistory(finalMessages);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear chat history?")) {
      const defaultWelcome = [
        {
          id: 'welcome',
          role: 'assistant',
          content: "Welcome to MyClaim AI OS Workspace. How is business today? You can choose a suggested prompt below or type your custom query.",
          timestamp: new Date().toISOString()
        }
      ];
      setMessages(defaultWelcome);
      saveHistory(defaultWelcome);
      setAgentFlow(INITIAL_AGENT_FLOW);
      setSelectedAgents([]);
    }
  };

  // Structured response cards parser
  const renderMessageContent = (msg) => {
    const content = msg.content;
    
    // Highlight metrics from markdown responses
    const pendingMatch = content.match(/Pending Claims:\s*(\$?\d+[\d,]*)/i);
    const completedMatch = content.match(/Completed Claims:\s*(\$?\d+[\d,]*)/i);
    const rejectedMatch = content.match(/Rejected Claims:\s*(\$?\d+[\d,]*)/i);
    const revenueMatch = content.match(/Revenue:\s*(\$?[\d,]+)/i) || content.match(/Today's Revenue:\s*(\$?[\d,]+)/i);
    const leadsMatch = content.match(/Leads:\s*(\d+)/i) || content.match(/New Leads:\s*(\d+)/i);
    const docsMatch = content.match(/Documents:\s*(\d+)/i) || content.match(/Missing Documents:\s*(\d+)/i);

    const hasMetrics = pendingMatch || revenueMatch || leadsMatch;

    if (hasMetrics && msg.role === 'assistant') {
      const pending = pendingMatch ? pendingMatch[1] : null;
      const completed = completedMatch ? completedMatch[1] : null;
      const rejected = rejectedMatch ? rejectedMatch[1] : null;
      const revenue = revenueMatch ? revenueMatch[1] : null;
      const leads = leadsMatch ? leadsMatch[1] : null;
      const docs = docsMatch ? docsMatch[1] : null;

      return (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-1">
            {pending && (
              <div className="bg-slate-950/40 border border-yellow-500/10 p-3 rounded-lg flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Pending Claims</span>
                <span className="text-xl font-bold text-yellow-500 mt-1">{pending}</span>
              </div>
            )}
            {completed && (
              <div className="bg-slate-950/40 border border-green-500/10 p-3 rounded-lg flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Completed Claims</span>
                <span className="text-xl font-bold text-green-500 mt-1">{completed}</span>
              </div>
            )}
            {rejected && (
              <div className="bg-slate-950/40 border border-red-500/10 p-3 rounded-lg flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Rejected Claims</span>
                <span className="text-xl font-bold text-red-500 mt-1">{rejected}</span>
              </div>
            )}
            {revenue && (
              <div className="bg-slate-950/40 border border-emerald-500/10 p-3 rounded-lg flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Today's Revenue</span>
                <span className="text-xl font-bold text-emerald-400 mt-1">{revenue}</span>
              </div>
            )}
            {leads && (
              <div className="bg-slate-950/40 border border-blue-500/10 p-3 rounded-lg flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">New Leads</span>
                <span className="text-xl font-bold text-blue-400 mt-1">{leads}</span>
              </div>
            )}
            {docs && (
              <div className="bg-slate-950/40 border border-indigo-500/10 p-3 rounded-lg flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Missing Docs</span>
                <span className="text-xl font-bold text-indigo-400 mt-1">{docs}</span>
              </div>
            )}
          </div>
          <div className="text-[13.5px] leading-relaxed whitespace-pre-line text-slate-300 font-light border-t border-slate-800/50 pt-3">
            {content}
          </div>
        </div>
      );
    }

    return (
      <div className={`text-[13.5px] leading-relaxed whitespace-pre-line ${msg.isError ? 'text-red-400 font-medium' : 'text-slate-300 font-light'}`}>
        {content}
      </div>
    );
  };

  return (
    <div className="ai-workspace">
      <div className="ai-container">
        
        {/* LEFT PANEL: Conversation History */}
        <div className="ai-sidebar glass-panel">
          <div className="flex items-center gap-2 mb-6">
            <History size={16} className="text-emerald-500" />
            <span className="text-xs font-bold text-slate-400 tracking-wider">CONVERSATION HISTORY</span>
          </div>
          <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
            {messages.filter(m => m.role === 'user').map((msg) => (
              <button
                key={msg.id}
                onClick={() => handleSend(msg.content)}
                className="w-full text-left p-3 rounded-xl bg-slate-900/30 border border-slate-800/40 hover:bg-emerald-500/5 hover:border-emerald-500/25 transition text-xs text-slate-300 truncate"
              >
                {msg.content}
              </button>
            ))}
            {messages.filter(m => m.role === 'user').length === 0 && (
              <div className="text-xs text-slate-500 text-center py-8">
                No past chat history
              </div>
            )}
          </div>
          <button
            onClick={clearHistory}
            className="w-full py-2 bg-red-950/20 border border-red-900/30 hover:bg-red-950/40 text-red-400 text-xs rounded-xl transition mt-4"
          >
            Clear History
          </button>
        </div>

        {/* MIDDLE PANEL: Chat Interface */}
        <div className="ai-chat-interface">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-800/60 bg-slate-950/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
                <Sparkles size={18} className="text-emerald-400" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-slate-100">MyClaim AI OS</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Gateway Local Connected</span>
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-500 font-semibold">
              ROLE: SUPER ADMIN
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`message-bubble ${msg.role === 'user' ? 'message-user' : 'message-assistant'}`}
              >
                <div className="flex items-center gap-2 px-1">
                  {msg.role === 'user' ? (
                    <>
                      <span className="text-[10px] text-slate-500 font-semibold">YOU</span>
                      <User size={10} className="text-slate-500" />
                    </>
                  ) : (
                    <>
                      <Bot size={10} className="text-emerald-500" />
                      <span className="text-[10px] text-emerald-500 font-semibold">AI OS AGENT</span>
                    </>
                  )}
                  <span className="text-[9px] text-slate-600 font-semibold">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="message-content">
                  {renderMessageContent(msg)}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="message-bubble message-assistant">
                <div className="flex items-center gap-2 px-1">
                  <Bot size={10} className="text-emerald-500" />
                  <span className="text-[10px] text-emerald-500 font-semibold">AI OS AGENT</span>
                </div>
                <div className="message-content bg-slate-950/20 border border-slate-900 p-4 rounded-xl flex items-center gap-3">
                  <Loader2 size={16} className="text-emerald-500 animate-spin" />
                  <span className="text-xs text-slate-400 font-light">CrewAI is executing agent logic...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts */}
          {!loading && messages.length <= 1 && (
            <div className="suggested-prompts-grid">
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="prompt-pill"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Chat Input */}
          <div className="chat-input-container">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="chat-input-wrapper"
            >
              <input
                type="text"
                placeholder="Ask MyClaim AI OS something... (e.g. 'Show pending claims')"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="chat-text-input"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="send-button"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT PANEL: Agent Flow & Future Ready Design */}
        <div className="ai-details-panel glass-panel">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-800/80 mb-6 gap-2">
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 pb-3 text-xs font-bold tracking-wider text-center transition ${activeTab === 'activity' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-slate-500'}`}
            >
              AGENT ACTIVITY
            </button>
            <button
              onClick={() => setActiveTab('future')}
              className={`flex-1 pb-3 text-xs font-bold tracking-wider text-center transition ${activeTab === 'future' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-slate-500'}`}
            >
              AUTOMATIONS (WIP)
            </button>
          </div>

          {/* Tab Content: Agent Activity Flow map */}
          {activeTab === 'activity' && (
            <div className="flex-1 flex flex-col gap-6">
              <div>
                <h3 className="text-xs font-bold text-slate-300 mb-1">EXECUTION FLOW CHART</h3>
                <p className="text-[10px] text-slate-500">Visual mapping of active CrewAI agents coordinating response.</p>
              </div>

              <div className="agent-flow-map">
                {Object.keys(agentFlow).map((key) => {
                  const agent = agentFlow[key];
                  const isSelected = selectedAgents.includes(key);
                  
                  // Hide if this agent is not part of the current workflow selection
                  if (selectedAgents.length > 0 && !isSelected) return null;
                  
                  return (
                    <div 
                      key={key} 
                      className={`agent-node ${agent.status === 'running' ? 'active border-emerald-500/20' : ''}`}
                    >
                      <div className="agent-node-dot" />
                      <div className="flex-1">
                        <div className="font-semibold text-slate-200">{agent.label}</div>
                      </div>
                      <span className={`status-badge status-${agent.status}`}>
                        {agent.status}
                      </span>
                    </div>
                  );
                })}
                {selectedAgents.length === 0 && (
                  <div className="text-xs text-slate-500 text-center py-10 border border-dashed border-slate-800 rounded-xl">
                    Submit a query to inspect agent execution flow.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab Content: Future Ready Design Placeholder sections */}
          {activeTab === 'future' && (
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
              <div>
                <h3 className="text-xs font-bold text-slate-300 mb-1">FUTURE READY OS MODULES</h3>
                <p className="text-[10px] text-slate-500">Pre-designed control structures for automations and workflows.</p>
              </div>

              {/* Actions Section */}
              <div className="p-4 rounded-xl border border-slate-800/40 bg-slate-950/20 opacity-50 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Action triggers</span>
                  <Settings size={14} className="text-slate-500" />
                </div>
                <p className="text-[11px] text-slate-500">Automate direct backend operations directly from natural language instruction.</p>
                <div className="mt-3 flex gap-2">
                  <span className="text-[10px] bg-slate-800/50 text-slate-400 px-2 py-1 rounded">Approve Claim</span>
                  <span className="text-[10px] bg-slate-800/50 text-slate-400 px-2 py-1 rounded">Reject Doc</span>
                </div>
              </div>

              {/* Workflows Section */}
              <div className="p-4 rounded-xl border border-slate-800/40 bg-slate-950/20 opacity-50 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">AI Workflows</span>
                  <PlayCircle size={14} className="text-slate-500" />
                </div>
                <p className="text-[11px] text-slate-500">Sequence complex operations across multiple departments and human-in-the-loop steps.</p>
                <div className="mt-3 text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                  <span>IEPF Recovery Process Flow</span>
                  <ArrowRight size={10} />
                </div>
              </div>

              {/* Notifications Section */}
              <div className="p-4 rounded-xl border border-slate-800/40 bg-slate-950/20 opacity-50 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Alert Automations</span>
                  <Activity size={14} className="text-slate-500" />
                </div>
                <p className="text-[11px] text-slate-500">Subscribe agents to background events (cron or webhooks) to compile and alert stakeholders.</p>
                <div className="mt-3 text-[10px] text-slate-400 font-semibold">
                  Hourly Claims Health Alert Dispatch
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MyClaimAI;
