import React, { useState, useEffect } from 'react';
import { Users, Shield, UserX, UserCheck } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminUsers: React.FC = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Failed to load admin users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggleStatus = async (user: any) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      await api.put(`/admin/users/${user.id}/status`, { status: nextStatus });
      showToast(`User marked as ${nextStatus}`, 'info');
      load();
    } catch {
      showToast('Failed to change user status', 'error');
    }
  };

  const handleToggleRole = async (user: any) => {
    const nextRole = user.role === 'admin' ? 'customer' : 'admin';
    try {
      await api.put(`/admin/users/${user.id}/role`, { role: nextRole });
      showToast(`User role changed to ${nextRole}`, 'info');
      load();
    } catch {
      showToast('Failed to change user role', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white font-display">User Directory</h2>
        <p className="text-xs text-gray-400 mt-1">Manage registered FiveM server owners, ban/suspend accounts, and assign admin roles.</p>
      </div>

      <div className="rounded-2xl bg-dark-850/80 border border-white/5 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-dark-900 border-b border-white/5 text-gray-400 uppercase font-semibold">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Purchases</th>
              <th className="p-4">Licenses</th>
              <th className="p-4">Joined</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-300">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=u'} alt={u.username} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <div className="font-bold text-white">{u.username}</div>
                      <div className="text-[10px] text-gray-500">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    u.role === 'admin' ? 'bg-rose-500/20 text-rose-300' : 'bg-white/5 text-gray-400'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {u.status}
                  </span>
                </td>
                <td className="p-4 font-mono font-bold">{u.orders_count || 0}</td>
                <td className="p-4 font-mono font-bold text-[var(--brand-primary)]">{u.licenses_count || 0}</td>
                <td className="p-4 text-gray-500">{u.created_at}</td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => handleToggleRole(u)}
                    className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-semibold text-gray-300"
                  >
                    {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                  </button>
                  <button
                    onClick={() => handleToggleStatus(u)}
                    className={`px-2 py-1 rounded text-[10px] font-semibold ${
                      u.status === 'active' ? 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                    }`}
                  >
                    {u.status === 'active' ? 'Suspend' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
