import { useState, useEffect, useRef } from 'react';

const BOT_NAME = 'MyClaim Assistant';
const BOT_AVATAR = '🤖';

const QUICK_REPLIES = [
  'How do I recover IEPF shares?',
  'What documents are needed?',
  'How long does recovery take?',
  'Is there any upfront fee?',
  'NRI claim process?',
];

const BOT_RESPONSES = {
  'how do i recover iepf shares': `Great question! To recover shares from IEPF:\n\n1. Identify your unclaimed shares\n2. File IEPF-5 form online\n3. Submit physical documents to the company's RTA\n4. IEPF authority reviews & transfers\n\nWe handle this entire process for you! Would you like a free consultation? 😊`,
  'what documents are needed': `Typically you'll need:\n\n📄 PAN Card\n📄 Aadhaar Card\n📄 Bank passbook / cancelled cheque\n📄 Original share certificates (if any)\n📄 Death certificate (for transmission)\n\nOur team will guide you with the exact list for your specific case!`,
  'how long does recovery take': `Timeline depends on the type of claim:\n\n⏱ Unclaimed Dividends: 30-60 days\n⏱ IEPF Share Claims: 60-90 days\n⏱ Transmission cases: 45-75 days\n\nWe keep you updated at every step. Complex cases may take longer.`,
  'is there any upfront fee': `No upfront fees! 🎉\n\nWe work on a **success-fee model** — you pay only when we successfully recover your funds.\n\nNo recovery = No fee. Completely risk-free for you!`,
  'nri claim process': `We've served clients in 6+ countries! 🌍\n\nFor NRIs, the entire process can be done:\n✅ Remotely via email & video calls\n✅ No need to visit India in most cases\n✅ Special NRI documentation handled\n\nCall or WhatsApp us at +91 85110 00454`,
};

function getBotReply(text) {
  const lower = text.toLowerCase().trim();
  for (const key of Object.keys(BOT_RESPONSES)) {
    if (lower.includes(key) || key.includes(lower)) return BOT_RESPONSES[key];
  }
  return `Thanks for reaching out! 😊\n\nFor personalized assistance, please:\n📞 Call: +91 85110 00454\n💬 WhatsApp: +91 85110 00454\n📧 Email: info@myclaimindia.com\n\nOur recovery experts will get back to you within 24 hours!`;
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-[#2FBF71] flex items-center justify-center text-xs flex-shrink-0">M</div>
      <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: `👋 Hello! I'm the **MyClaim India Assistant**.\n\nI can help you with questions about recovering unclaimed shares, dividends, IEPF claims, and more.\n\nHow can I help you today?`,
      time: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [quickRepliesUsed, setQuickRepliesUsed] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Show attention bubble after 3s
    const t = setTimeout(() => setShowBubble(true), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (open) {
      setShowBubble(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const userMsg = { from: 'user', text: text.trim(), time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setQuickRepliesUsed(true);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const reply = getBotReply(text);
      setMessages(prev => [...prev, { from: 'bot', text: reply, time: new Date() }]);
    }, 1200 + Math.random() * 600);
  };

  const formatText = (text) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line.split('**').map((part, j) =>
          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
        )}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  const formatTime = (date) => date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2">
        {/* Attention bubble */}
        {showBubble && !open && (
          <div
            className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-2.5 shadow-lg text-sm font-medium text-slate-700 max-w-[200px] leading-snug cursor-pointer animate-bounce-slow"
            onClick={() => setOpen(true)}
            style={{ animation: 'fadeInUp 0.4s ease' }}
          >
            💬 Have a query? Ask us!
            <div className="absolute -bottom-2 left-4 w-3 h-3 bg-white border-b border-r border-slate-200 rotate-45" />
          </div>
        )}

        <button
          onClick={() => setOpen(o => !o)}
          id="chatbot-toggle"
          aria-label="Open MyClaim Chat Assistant"
          className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#2FBF71] to-emerald-600 text-white shadow-xl shadow-emerald-500/30 flex items-center justify-center hover:scale-110 transition-transform duration-300"
        >
          {open ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          )}
          {/* unread dot */}
          {!open && (
            <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </button>
      </div>

      {/* Chat Window */}
      <div
        className="fixed bottom-24 left-6 z-50 w-[340px] sm:w-[380px] bg-white rounded-3xl shadow-2xl shadow-slate-900/20 border border-slate-200/80 flex flex-col overflow-hidden"
        style={{
          maxHeight: '560px',
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2FBF71] to-emerald-600 px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold text-white border-2 border-white/40">
            M
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-sm">{BOT_NAME}</p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
              <span className="text-white/80 text-xs">Online · Typically replies instantly</span>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#F8F9FB]" style={{ minHeight: 0 }}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex items-end gap-2 ${msg.from === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.from === 'bot' && (
                <div className="w-7 h-7 rounded-full bg-[#2FBF71] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">M</div>
              )}
              <div className={`max-w-[80%] ${msg.from === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.from === 'user'
                  ? 'bg-[#2FBF71] text-white rounded-br-sm'
                  : 'bg-white text-slate-700 border border-slate-200 rounded-bl-sm shadow-sm'
                }`}>
                  {formatText(msg.text)}
                </div>
                <span className="text-[10px] text-slate-400 px-1">{formatTime(msg.time)}</span>
              </div>
            </div>
          ))}
          {typing && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {!quickRepliesUsed && (
          <div className="px-4 py-2 bg-[#F8F9FB] border-t border-slate-200/60 flex gap-2 overflow-x-auto no-scrollbar">
            {QUICK_REPLIES.map(qr => (
              <button
                key={qr}
                onClick={() => sendMessage(qr)}
                className="flex-shrink-0 text-xs bg-white border border-[#2FBF71]/40 text-[#2FBF71] font-semibold px-3 py-2 rounded-full hover:bg-emerald-50 transition-colors whitespace-nowrap"
              >
                {qr}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-4 py-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            placeholder="Type your question..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-sm text-[#1C1C1C] placeholder-slate-400 outline-none focus:border-[#2FBF71] focus:ring-2 focus:ring-[#2FBF71]/10 transition"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-full bg-[#2FBF71] disabled:bg-slate-200 text-white flex items-center justify-center transition-colors flex-shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 rotate-90">
              <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </div>

        {/* Footer brand */}
        <div className="text-center py-2 bg-white border-t border-slate-100">
          <p className="text-[10px] text-slate-400">Powered by <span className="font-bold text-[#2FBF71]">MyClaim India</span></p>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}
