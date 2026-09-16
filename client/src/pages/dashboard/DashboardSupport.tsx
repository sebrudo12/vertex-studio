import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Send, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { Ticket, TicketMessage } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const DashboardSupport: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);

  // New ticket modal
  const [modalOpen, setModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'purchase' | 'installation' | 'bug' | 'license' | 'general'>('general');
  const [initialMsg, setInitialMsg] = useState('');
  const [creating, setCreating] = useState(false);

  const loadTickets = async () => {
    try {
      const res = await api.get('/tickets');
      setTickets(res.data.tickets || []);
      if (!selectedTicket && res.data.tickets?.length > 0) {
        loadTicketThread(res.data.tickets[0].id);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTicketThread = async (ticketId: number) => {
    try {
      const res = await api.get(`/tickets/${ticketId}`);
      setSelectedTicket(res.data.ticket);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Failed to load ticket thread:', err);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !initialMsg.trim()) return;

    setCreating(true);
    try {
      await api.post('/tickets', {
        subject: subject.trim(),
        category,
        message: initialMsg.trim(),
      });
      showToast('Support ticket opened successfully!', 'success');
      setModalOpen(false);
      setSubject('');
      setInitialMsg('');
      loadTickets();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to open ticket', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    try {
      await api.post(`/tickets/${selectedTicket.id}/messages`, {
        message: replyText.trim(),
      });
      setReplyText('');
      loadTicketThread(selectedTicket.id);
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to send reply', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white font-display">Support Tickets</h2>
          <p className="text-xs text-gray-400 mt-1">
            Communicate with Vertex Studio technicians regarding your resources.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold text-black bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] flex items-center gap-1.5 shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Ticket</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        
        {/* Left Tickets List */}
        <div className="lg:col-span-5 space-y-2">
          {loading ? (
            <div className="text-center py-20 text-gray-500 text-xs">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="p-8 rounded-2xl bg-dark-850 text-center text-gray-500 text-xs">
              No tickets open. Click "New Ticket" to get help.
            </div>
          ) : (
            tickets.map((t) => (
              <button
                key={t.id}
                onClick={() => loadTicketThread(t.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedTicket?.id === t.id
                    ? 'bg-dark-800 border-[var(--brand-primary)]/40 shadow-lg'
                    : 'bg-dark-850/70 border-white/5 hover:border-white/10'
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
                <div className="text-[11px] text-gray-500 mt-1 capitalize">{t.category} • {t.updated_at}</div>
              </button>
            ))
          )}
        </div>

        {/* Right Conversation Thread */}
        <div className="lg:col-span-7 rounded-2xl bg-dark-850/60 border border-white/5 flex flex-col justify-between overflow-hidden">
          {selectedTicket ? (
            <>
              {/* Header */}
              <div className="p-4 bg-dark-900 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedTicket.subject}</h3>
                  <span className="text-[10px] text-gray-400">
                    Category: {selectedTicket.category} • Priority: {selectedTicket.priority}
                  </span>
                </div>
                <span className="text-xs font-mono text-[var(--brand-primary)]">
                  {selectedTicket.ticket_number}
                </span>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[380px]">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.is_staff ? 'items-start' : 'items-end'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        m.is_staff
                          ? 'bg-dark-800 text-gray-200 border border-cyan-500/20'
                          : 'bg-[var(--brand-primary)] text-black font-medium'
                      }`}
                    >
                      <div className="text-[10px] font-bold opacity-70 mb-1">
                        {m.is_staff ? '⚡ Vertex Support Staff' : user?.username}
                      </div>
                      <p className="whitespace-pre-line">{m.message}</p>
                    </div>
                    <span className="text-[9px] text-gray-500 mt-1 px-1">{m.created_at}</span>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendMessage} className="p-3 bg-dark-900 border-t border-white/5 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl bg-dark-800 border border-white/10 text-xs text-white focus:outline-none focus:border-[var(--brand-primary)]"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-[var(--brand-primary)] text-black hover:bg-[var(--brand-hover)] transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 text-xs py-24">
              Select a ticket to read and reply.
            </div>
          )}
        </div>

      </div>

      {/* New Ticket Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-dark-900 border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl animate-scale-in">
            <h3 className="text-base font-bold text-white">Open Support Ticket</h3>

            <form onSubmit={handleCreateTicket} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-300 font-semibold">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Issue installing Vertex Mechanics"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-dark-800 border border-white/10 text-xs text-white focus:outline-none focus:border-[var(--brand-primary)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-300 font-semibold">Category</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-dark-800 border border-white/10 text-xs text-white focus:outline-none"
                >
                  <option value="general">General Inquiry</option>
                  <option value="installation">Installation Assistance</option>
                  <option value="bug">Bug Report</option>
                  <option value="license">License Issue</option>
                  <option value="purchase">Purchase Inquiry</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-300 font-semibold">Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the issue or request in detail..."
                  value={initialMsg}
                  onChange={(e) => setInitialMsg(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-dark-800 border border-white/10 text-xs text-white focus:outline-none focus:border-[var(--brand-primary)]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-black bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] disabled:opacity-50"
                >
                  {creating ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
