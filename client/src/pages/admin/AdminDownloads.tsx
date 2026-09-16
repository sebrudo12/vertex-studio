import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export const AdminDownloads: React.FC = () => {
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/admin/downloads');
        setDownloads(res.data.downloads || []);
      } catch (err) {
        console.error('Failed to load downloads audit log:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white font-display">Download Audit Log</h2>
        <p className="text-xs text-gray-400 mt-1">Full security and fraud audit log tracking every download, user IP, and timestamp.</p>
      </div>

      <div className="rounded-2xl bg-dark-850/80 border border-white/5 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-dark-900 border-b border-white/5 text-gray-400 uppercase font-semibold">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Resource</th>
              <th className="p-4">Version</th>
              <th className="p-4">IP Address</th>
              <th className="p-4">License Key</th>
              <th className="p-4 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-300">
            {downloads.map((d) => (
              <tr key={d.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-white">{d.username}</div>
                  <div className="text-[10px] text-gray-500">{d.email}</div>
                </td>
                <td className="p-4 font-semibold text-white">{d.product_title}</td>
                <td className="p-4 font-mono">v{d.version}</td>
                <td className="p-4 font-mono text-cyan-400">{d.ip_address}</td>
                <td className="p-4 font-mono text-[var(--brand-primary)]">{d.license_key || 'Direct Admin'}</td>
                <td className="p-4 text-right text-gray-500">{d.downloaded_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
