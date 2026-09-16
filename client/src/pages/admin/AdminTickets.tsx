import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { Ticket, TicketMessage } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminTickets: React.FC = () => {
  const { showToast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);

  const loadTickets = async () => {
    try {
      const res = await api.get('/tickets');
      setTickets(res.data.tickets || []);
      if (!selectedTicket && res.data.tickets?.length > 0) {
        loadThread(res.data.tickets[0].id);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadThread = async (id: number) => {
    try {
      const res = await api.get(`/tickets/${id}`);
      setSelectedTicket(res.data.ticket);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Failed to load ticket thread:', err);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    try {
      await api.post(`/tickets/${selectedTicket.id}/messages`, { message: replyText.trim() });
      setReplyText('');
      loadThread(selectedTicket.id);
      loadTickets();
      showToast('Reply sent as staff', 'success');
    } catch {
      showToast('Failed to reply', 'error');
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedTicket) return;
    try {
      await api.put(`/tickets/${selectedTicket.id}/status`, { status });
      showToast(`Ticket status updated to ${status}`, 'info');
      loadThread(selectedTicket.id);
      loadTickets();
    } catch {
      showToast('Failed to update ticket status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white font-display">Support Ticket Inbox</h2>
        <p className="text-xs text-gray-400 mt-1">Provide technical assistance, resolve customer inquiries, and close tickets.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        {/* Tickets List */}
        <div className="lg:col-span-5 space-y-2">
          {tickets.map((t) => (
            <button
              key={t.id}
              onClick={() => loadThread(t.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedTicket?.id === t.id
                  ? 'bg-dark-850 border-rose-500/40 shadow-lg'
                  : 'bg-dark-850/60 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-gray-400">{t.ticket_number}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    t.status === 'open'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : t.status === 'pending'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {t.status}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white truncate">{t.subject}</h4>
              <div className="text-[11px] text-gray-400 mt-1">
                From: <strong>{t.username}</strong> ({t.category})
              </div>
            </button>
          ))}
        </div>

        {/* Thread View */}
        <div className="lg:col-span-7 rounded-2xl bg-dark-850/70 border border-white/5 flex flex-col justify-between overflow-hidden">
          {selectedTicket ? (
            <>
              <div className="p-4 bg-dark-900 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedTicket.subject}</h3>
                  <span className="text-[10px] text-gray-400">
                    User: {selectedTicket.username} ({selectedTicket.email})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-dark-800 border border-white/10 text-xs text-white"
                  >
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[380px]">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.is_staff ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        m.is_staff
                          ? 'bg-rose-500/20 text-rose-100 border border-rose-500/30'
                          : 'bg-dark-800 text-gray-200 border border-white/10'
                      }`}
                    >
                      <div className="text-[10px] font-bold opacity-70 mb-1">
                        {m.is_staff ? '🛡️ Staff Response' : m.username}
                      </div>
                      <p className="whitespace-pre-line">{m.message}</p>
                    </div>
                    <span className="text-[9px] text-gray-500 mt-1 px-1">{m.created_at}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleReply} className="p-3 bg-dark-900 border-t border-white/5 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Reply to customer as staff..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl bg-dark-800 border border-white/10 text-xs text-white focus:outline-none focus:border-rose-500"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="p-20 text-center text-gray-500 text-xs">Select a ticket to inspect.</div>
          )}
        </div>
      </div>
    </div>
  );
};
