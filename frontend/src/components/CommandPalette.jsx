import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Ticket, User, Briefcase, FileText, ChevronRight } from 'lucide-react';
import api from '../services/api';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ tickets: [], clients: [], partners: [] });
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Keyboard listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch and filter results when query changes
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults({ tickets: [], clients: [], partners: [] });
      return;
    }
    
    // Focus input when opened
    setTimeout(() => inputRef.current?.focus(), 50);

    if (query.trim().length < 2) {
      setResults({ tickets: [], clients: [], partners: [] });
      return;
    }

    const searchData = async () => {
      setLoading(true);
      try {
        const [usersRes, ticketsRes] = await Promise.all([
          api.get('/users'),
          api.get('/tickets')
        ]);
        
        const q = query.toLowerCase();
        
        const allUsers = usersRes.data;
        const clients = allUsers.filter(u => u.role === 'client' && (u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.includes(q)));
        const partners = allUsers.filter(u => (u.role === 'partner' || u.role === 'super_partner') && (u.name?.toLowerCase().includes(q) || u.companyName?.toLowerCase().includes(q)));
        
        const tickets = ticketsRes.data.filter(t => 
          t._id.toLowerCase().includes(q) || 
          t.service?.toLowerCase().includes(q) || 
          t.client?.name?.toLowerCase().includes(q)
        );

        setResults({ 
          tickets: tickets.slice(0, 5), 
          clients: clients.slice(0, 5), 
          partners: partners.slice(0, 5) 
        });
        setSelectedIndex(0);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchData, 300);
    return () => clearTimeout(debounce);
  }, [query, isOpen]);

  // Handle keyboard navigation inside the palette
  const flatResults = [
    ...results.tickets.map(t => ({ type: 'ticket', data: t })),
    ...results.clients.map(c => ({ type: 'client', data: c })),
    ...results.partners.map(p => ({ type: 'partner', data: p }))
  ];

  const handleInputKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < flatResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatResults[selectedIndex]) {
        handleSelect(flatResults[selectedIndex]);
      }
    }
  };

  const handleSelect = (item) => {
    setIsOpen(false);
    if (item.type === 'ticket') {
      navigate('/super-admin/tickets'); // In a real app, you might pass state or open a specific modal
    } else if (item.type === 'client') {
      navigate('/super-admin/clients');
    } else if (item.type === 'partner') {
      navigate('/super-admin'); // Or partner page
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', justifyContent: 'center', paddingTop: '10vh' }} onClick={() => setIsOpen(false)}>
      <div 
        style={{ width: '600px', maxWidth: '90%', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Input Area */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
          <Search size={24} color="var(--blue)" style={{ marginRight: '16px' }} />
          <input 
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search tickets, clients, partners... (Type at least 2 chars)"
            style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '18px', color: 'var(--text)', outline: 'none' }}
          />
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-light)', background: 'var(--sidebar-active)', padding: '4px 8px', borderRadius: '6px' }}>ESC</div>
        </div>

        {/* Results Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
          {query.trim().length < 2 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-light)', fontSize: '14px' }}>
              <div style={{ marginBottom: '12px' }}><Search size={32} style={{ opacity: 0.2 }} /></div>
              Start typing to search across the entire platform
            </div>
          ) : loading ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-light)' }}>
              <div className="spin" style={{ width: '24px', height: '24px', border: '2px solid var(--border)', borderTopColor: 'var(--blue)', borderRadius: '50%', margin: '0 auto' }}></div>
            </div>
          ) : flatResults.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-light)' }}>
              No results found for "{query}"
            </div>
          ) : (
            <div>
              {results.tickets.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ padding: '0 24px', fontSize: '11px', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Tickets</div>
                  {results.tickets.map(t => {
                    const globalIdx = flatResults.findIndex(r => r.type === 'ticket' && r.data._id === t._id);
                    const isSelected = globalIdx === selectedIndex;
                    return (
                      <div 
                        key={t._id} 
                        onClick={() => handleSelect({ type: 'ticket', data: t })}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', background: isSelected ? 'var(--blue)' : 'transparent', color: isSelected ? '#fff' : 'var(--text)', transition: 'background 0.1s' }}
                      >
                        <Ticket size={18} color={isSelected ? '#fff' : 'var(--blue)'} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: 700 }}>#{t.ticketNo || new Date(t.createdAt).getTime()} - {t.service}</div>
                          <div style={{ fontSize: '12px', color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>{t.client?.name} • {t.status}</div>
                        </div>
                        {isSelected && <ChevronRight size={18} />}
                      </div>
                    );
                  })}
                </div>
              )}

              {results.clients.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ padding: '0 24px', fontSize: '11px', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Clients</div>
                  {results.clients.map(c => {
                    const globalIdx = flatResults.findIndex(r => r.type === 'client' && r.data._id === c._id);
                    const isSelected = globalIdx === selectedIndex;
                    return (
                      <div 
                        key={c._id} 
                        onClick={() => handleSelect({ type: 'client', data: c })}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', background: isSelected ? 'var(--blue)' : 'transparent', color: isSelected ? '#fff' : 'var(--text)', transition: 'background 0.1s' }}
                      >
                        <User size={18} color={isSelected ? '#fff' : '#10b981'} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: 700 }}>{c.name}</div>
                          <div style={{ fontSize: '12px', color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>{c.email}</div>
                        </div>
                        {isSelected && <ChevronRight size={18} />}
                      </div>
                    );
                  })}
                </div>
              )}

              {results.partners.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ padding: '0 24px', fontSize: '11px', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Partners</div>
                  {results.partners.map(p => {
                    const globalIdx = flatResults.findIndex(r => r.type === 'partner' && r.data._id === p._id);
                    const isSelected = globalIdx === selectedIndex;
                    return (
                      <div 
                        key={p._id} 
                        onClick={() => handleSelect({ type: 'partner', data: p })}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', background: isSelected ? 'var(--blue)' : 'transparent', color: isSelected ? '#fff' : 'var(--text)', transition: 'background 0.1s' }}
                      >
                        <Briefcase size={18} color={isSelected ? '#fff' : '#f59e0b'} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: 700 }}>{p.name} {p.companyName && `(${p.companyName})`}</div>
                          <div style={{ fontSize: '12px', color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>{p.role.replace('_', ' ').toUpperCase()}</div>
                        </div>
                        {isSelected && <ChevronRight size={18} />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-light)' }}><span style={{ fontWeight: 800, background: 'var(--sidebar-active)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text)' }}>↑↓</span> to navigate</div>
          <div style={{ fontSize: '11px', color: 'var(--text-light)' }}><span style={{ fontWeight: 800, background: 'var(--sidebar-active)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text)' }}>ENTER</span> to select</div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
