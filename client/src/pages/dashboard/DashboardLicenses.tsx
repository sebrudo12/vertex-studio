import React, { useState, useEffect } from 'react';
import { Key, Copy, Check, Server, Terminal, Shield, Edit3 } from 'lucide-react';
import api from '../../services/api';
import { License } from '../../types';
import { useToast } from '../../context/ToastContext';

export const DashboardLicenses: React.FC = () => {
  const { showToast } = useToast();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Edit server IP modal/form
  const [editingLicId, setEditingLicId] = useState<number | null>(null);
  const [newServerIp, setNewServerIp] = useState<string>('');

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/licenses/my-licenses');
        setLicenses(res.data.licenses || []);
      } catch (err) {
        console.error('Failed to load licenses:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    showToast('License copied to clipboard', 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleUpdateIp = async (licenseId: number) => {
    if (!newServerIp.trim()) return;
    try {
      await api.put(`/licenses/${licenseId}/server-ip`, { serverIp: newServerIp.trim() });
      showToast('Bound server IP updated successfully!', 'success');
      setEditingLicId(null);
      setNewServerIp('');
      
      // Refresh
      const res = await api.get('/licenses/my-licenses');
      setLicenses(res.data.licenses || []);
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to update server IP', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white font-display">License Manager</h2>
        <p className="text-xs text-gray-400 mt-1">
          Manage your FiveM resource licenses and configure authorized server IPs.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading licenses...</div>
      ) : licenses.length === 0 ? (
        <div className="p-10 rounded-2xl bg-dark-850 text-center text-gray-500 text-xs">
          No licenses registered. Purchase scripts from the store to automatically generate licenses.
        </div>
      ) : (
        <div className="space-y-4">
          {licenses.map((lic) => (
            <div
              key={lic.id}
              className="p-6 rounded-2xl bg-dark-850/80 border border-white/5 backdrop-blur-md space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white">{lic.product_title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-sm sm:text-base font-extrabold text-[var(--brand-primary)]">
                      {lic.license_key}
                    </span>
                    <button
                      onClick={() => handleCopy(lic.license_key)}
                      className="p-1 text-gray-400 hover:text-white"
                      title="Copy Key"
                    >
                      {copiedKey === lic.license_key ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                      lic.status === 'active'
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {lic.status}
                  </span>
                </div>
              </div>

              {/* Bound IP Section */}
              <div className="p-4 rounded-xl bg-dark-900 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-gray-300">
                  <Server className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>
                    Bound Server IP:{' '}
                    <strong className="font-mono text-white">
                      {lic.bound_server_ip || 'Any / Auto-bind on first start'}
                    </strong>
                  </span>
                </div>

                {editingLicId === lic.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 192.168.1.50:30120"
                      value={newServerIp}
                      onChange={(e) => setNewServerIp(e.target.value)}
                      className="px-3 py-1 rounded-lg bg-dark-800 border border-white/20 text-xs text-white focus:outline-none"
                    />
                    <button
                      onClick={() => handleUpdateIp(lic.id)}
                      className="px-3 py-1 rounded-lg bg-emerald-500 text-black font-bold"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingLicId(null)}
                      className="px-2 py-1 rounded-lg text-gray-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingLicId(lic.id);
                      setNewServerIp(lic.bound_server_ip || '');
                    }}
                    className="text-[var(--brand-primary)] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Change IP</span>
                  </button>
                )}
              </div>

              {/* FiveM integration snippet */}
              <div className="p-3 rounded-lg bg-black font-mono text-xs text-gray-400 border border-white/5 overflow-x-auto">
                set vertex_license "{lic.license_key}"
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
