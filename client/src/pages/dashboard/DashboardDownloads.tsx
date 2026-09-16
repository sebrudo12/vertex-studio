import React, { useState, useEffect } from 'react';
import { Download, HardDrive, ShieldCheck, Clock, FileCode } from 'lucide-react';
import api from '../../services/api';
import { DownloadLog } from '../../types';

export const DashboardDownloads: React.FC = () => {
  const [downloads, setDownloads] = useState<any[]>([]);
  const [history, setHistory] = useState<DownloadLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/downloads/my-downloads');
        setDownloads(res.data.availableDownloads || []);
        setHistory(res.data.history || []);
      } catch (err) {
        console.error('Failed to load downloads:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white font-display">Download Center</h2>
        <p className="text-xs text-gray-400 mt-1">
          Download clean, verified resource packages and inspect your download audit trail.
        </p>
      </div>

      {/* Available Downloads List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Available Packages
        </h3>

        {downloads.length === 0 ? (
          <div className="p-8 rounded-2xl bg-dark-850 text-center text-gray-500 text-xs">
            No packages available for download. Purchase a script from the store to unlock downloads.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {downloads.map((d) => (
              <div
                key={d.product_id}
                className="p-4 rounded-xl bg-dark-850/80 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 flex items-center justify-center text-[var(--brand-primary)]">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{d.title}</h4>
                    <p className="text-xs text-gray-400">
                      Package: <span className="font-mono text-gray-300">{d.download_filename}</span> • Version: v{d.version}
                    </p>
                  </div>
                </div>

                <a
                  href={`/api/downloads/${d.product_id}`}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-black bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] flex items-center justify-center gap-2 transition-colors shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Package</span>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Download History Audit Log */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Download Audit Log
        </h3>

        {history.length === 0 ? (
          <div className="p-6 rounded-2xl bg-dark-850 text-center text-gray-500 text-xs">
            No previous download logs recorded yet.
          </div>
        ) : (
          <div className="rounded-2xl bg-dark-850/60 border border-white/5 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-900 border-b border-white/5 text-gray-400 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Resource</th>
                  <th className="p-3.5">Version</th>
                  <th className="p-3.5">IP Address</th>
                  <th className="p-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {history.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3.5 font-bold text-white">{log.product_title}</td>
                    <td className="p-3.5 font-mono">v{log.version}</td>
                    <td className="p-3.5 font-mono text-gray-400">{log.ip_address}</td>
                    <td className="p-3.5 text-gray-500">{log.downloaded_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
