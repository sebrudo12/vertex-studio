import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminSettings: React.FC = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState({
    resources: '50+',
    customers: '1,000+',
    positiveFeedback: '99%',
    support: '24/7',
  });

  const [discord, setDiscord] = useState({
    serverName: 'Vertex Studio Official',
    inviteUrl: 'https://discord.gg/vertexstudio',
    onlineCount: 428,
    totalMembers: 4890,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/admin/settings');
        const s = res.data.settings;
        if (s.site_stats) setStats(s.site_stats);
        if (s.discord_widget) setDiscord(s.discord_widget);
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    }
    load();
  }, []);

  const handleSaveStats = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/admin/settings/site_stats', {
        value: stats,
        description: 'Homepage dynamic stats counters',
      });
      showToast('Hero statistics updated!', 'success');
    } catch {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDiscord = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/admin/settings/discord_widget', {
        value: discord,
        description: 'Discord widget settings',
      });
      showToast('Discord settings updated!', 'success');
    } catch {
      showToast('Failed to save discord settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-white font-display">Platform Settings</h2>
        <p className="text-xs text-gray-400 mt-1">Configure live homepage statistics, Discord community numbers, and payment settings.</p>
      </div>

      {/* Hero Stats */}
      <form onSubmit={handleSaveStats} className="p-6 rounded-2xl bg-dark-850/80 border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Homepage Statistics</h3>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-gray-300 font-semibold block mb-1">Resources Count</label>
            <input
              type="text"
              value={stats.resources}
              onChange={(e) => setStats({ ...stats, resources: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-dark-900 border border-white/10 text-white"
            />
          </div>
          <div>
            <label className="text-gray-300 font-semibold block mb-1">Customers Count</label>
            <input
              type="text"
              value={stats.customers}
              onChange={(e) => setStats({ ...stats, customers: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-dark-900 border border-white/10 text-white"
            />
          </div>
          <div>
            <label className="text-gray-300 font-semibold block mb-1">Feedback Metric</label>
            <input
              type="text"
              value={stats.positiveFeedback}
              onChange={(e) => setStats({ ...stats, positiveFeedback: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-dark-900 border border-white/10 text-white"
            />
          </div>
          <div>
            <label className="text-gray-300 font-semibold block mb-1">Support Tag</label>
            <input
              type="text"
              value={stats.support}
              onChange={(e) => setStats({ ...stats, support: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-dark-900 border border-white/10 text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 rounded-xl text-xs font-bold text-black bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] flex items-center gap-1.5 transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Statistics</span>
        </button>
      </form>

      {/* Discord Widget */}
      <form onSubmit={handleSaveDiscord} className="p-6 rounded-2xl bg-dark-850/80 border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Discord Widget Integration</h3>

        <div className="space-y-3 text-xs">
          <div>
            <label className="text-gray-300 font-semibold block mb-1">Discord Community Name</label>
            <input
              type="text"
              value={discord.serverName}
              onChange={(e) => setDiscord({ ...discord, serverName: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-dark-900 border border-white/10 text-white"
            />
          </div>
          <div>
            <label className="text-gray-300 font-semibold block mb-1">Discord Permanent Invite URL</label>
            <input
              type="text"
              value={discord.inviteUrl}
              onChange={(e) => setDiscord({ ...discord, inviteUrl: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-dark-900 border border-white/10 text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-300 font-semibold block mb-1">Online Counter</label>
              <input
                type="number"
                value={discord.onlineCount}
                onChange={(e) => setDiscord({ ...discord, onlineCount: parseInt(e.target.value, 10) || 0 })}
                className="w-full p-2.5 rounded-xl bg-dark-900 border border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-gray-300 font-semibold block mb-1">Total Members</label>
              <input
                type="number"
                value={discord.totalMembers}
                onChange={(e) => setDiscord({ ...discord, totalMembers: parseInt(e.target.value, 10) || 0 })}
                className="w-full p-2.5 rounded-xl bg-dark-900 border border-white/10 text-white"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#5865F2] hover:bg-[#4752C4] flex items-center gap-1.5 transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Discord Settings</span>
        </button>
      </form>
    </div>
  );
};
