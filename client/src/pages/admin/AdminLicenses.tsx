import React, { useState, useEffect } from 'react';
import { Key, ShieldAlert, ShieldCheck, Plus, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminLicenses: React.FC = () => {
  const { showToast } = useToast();
  const [licenses, setLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual license modal
  const [modalOpen, setModalOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [targetProductId, setTargetProductId] = useState<string>('');
  const [targetIp, setTargetIp] = useState<string>('');

  const load = async () => {
    try {
      const res = await api.get('/admin/licenses');
      setLicenses(res.data.licenses || []);
    } catch (err) {
      console.error('Failed to load admin licenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggleLicense = async (lic: any) => {
    const nextStatus = lic.status === 'active' ? 'revoked' : 'active';
    try {
      await api.put(`/admin/licenses/${lic.id}/status`, { status: nextStatus });
      showToast(`License marked as ${nextStatus}`, 'info');
      load();
    } catch {
      showToast('Failed to update license status', 'error');
    }
  };

  const openManualModal = async () => {
    try {
      const [uRes, pRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/products')
      ]);
      setUsers(uRes.data.users || []);
      setProducts(pRes.data.products || []);
      if (uRes.data.users?.length > 0) setTargetUserId(uRes.data.users[0].id.toString());
      if (pRes.data.products?.length > 0) setTargetProductId(pRes.data.products[0].id.toString());
      setModalOpen(true);
    } catch {
      showToast('Failed to prepare license generator', 'error');
    }
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/licenses/create', {
        userId: parseInt(targetUserId, 10),
        productId: parseInt(targetProductId, 10),
        boundServerIp: targetIp.trim() || null,
      });
      showToast('Manual license created successfully!', 'success');
      setModalOpen(false);
      load();
    } catch {
      showToast('Failed to generate license', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white font-display">License Registry</h2>
          <p className="text-xs text-gray-400 mt-1">Control all FiveM license keys, view bound server IPs, or revoke access.</p>
        </div>

        <button
          onClick={openManualModal}
          className="px-4 py-2 rounded-xl text-xs font-bold text-black bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Manual License</span>
        </button>
      </div>

      <div className="rounded-2xl bg-dark-850/80 border border-white/5 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-dark-900 border-b border-white/5 text-gray-400 uppercase font-semibold">
            <tr>
              <th className="p-4">License Key</th>
              <th className="p-4">Product</th>
              <th className="p-4">Owner</th>
              <th className="p-4">Bound Server IP</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-300">
            {licenses.map((lic) => (
              <tr key={lic.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-mono font-extrabold text-[var(--brand-primary)]">
                  {lic.license_key}
                </td>
                <td className="p-4 font-bold text-white">{lic.product_title}</td>
                <td className="p-4">
                  <div className="text-white">{lic.username}</div>
                  <div className="text-[10px] text-gray-500">{lic.email}</div>
                </td>
                <td className="p-4 font-mono text-gray-400">
                  {lic.bound_server_ip || 'Auto-bind on first use'}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    lic.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {lic.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleToggleLicense(lic)}
                    className={`px-2.5 py-1 rounded text-[10px] font-semibold ${
                      lic.status === 'active'
                        ? 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                    }`}
                  >
                    {lic.status === 'active' ? 'Revoke' : 'Reactivate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Manual License Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-dark-900 border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Generate Manual License</h3>

            <form onSubmit={handleCreateManual} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-300 font-semibold block mb-1">Assign to User</label>
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-dark-800 border border-white/10 text-white"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.username} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-gray-300 font-semibold block mb-1">Resource Product</label>
                <select
                  value={targetProductId}
                  onChange={(e) => setTargetProductId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-dark-800 border border-white/10 text-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-gray-300 font-semibold block mb-1">Pre-bind Server IP (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 192.168.1.1:30120"
                  value={targetIp}
                  onChange={(e) => setTargetIp(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-dark-800 border border-white/10 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-black bg-[var(--brand-primary)]"
                >
                  Issue License
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
