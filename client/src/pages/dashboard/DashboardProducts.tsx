import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Download, FileText, Key, History, Check, Copy } from 'lucide-react';
import api from '../../services/api';
import { License } from '../../types';
import { useToast } from '../../context/ToastContext';

export const DashboardProducts: React.FC = () => {
  const { showToast } = useToast();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/licenses/my-licenses');
        setLicenses(res.data.licenses || []);
      } catch (err) {
        console.error('Failed to load owned products:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    showToast('License copied', 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white font-display">My Purchased Products</h2>
        <p className="text-xs text-gray-400 mt-1">
          Access your owned resources, download packages, copy licenses, and browse documentation.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading your resources...</div>
      ) : licenses.length === 0 ? (
        <div className="p-12 rounded-2xl bg-dark-850 text-center space-y-3">
          <p className="text-sm text-gray-400">You haven't purchased any FiveM resources yet.</p>
          <Link
            to="/store"
            className="inline-block px-4 py-2 rounded-xl text-xs font-bold text-black bg-[var(--brand-primary)]"
          >
            Visit Vertex Store
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {licenses.map((lic) => (
            <div
              key={lic.id}
              className="p-5 rounded-2xl bg-dark-850/80 border border-white/5 backdrop-blur-md flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start gap-3">
                <img
                  src={lic.thumbnail || '/logo.png'}
                  alt={lic.product_title}
                  className="w-16 h-16 rounded-xl object-cover bg-dark-800 border border-white/10 shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">{lic.product_title}</h3>
                  <p className="text-[11px] text-gray-400">Version: v{lic.product_version || '1.0.0'}</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-[var(--brand-primary)]">
                      {lic.license_key}
                    </span>
                    <button
                      onClick={() => handleCopy(lic.license_key)}
                      className="p-1 text-gray-400 hover:text-white"
                      title="Copy Key"
                    >
                      {copiedKey === lic.license_key ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex flex-wrap items-center gap-2">
                <a
                  href={`/api/downloads/${lic.product_id}`}
                  className="flex-1 py-2 px-3 rounded-lg text-xs font-bold text-black bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download ZIP</span>
                </a>

                <Link
                  to={`/documentation/${lic.product_slug}`}
                  className="py-2 px-3 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-white flex items-center gap-1 transition-colors"
                  title="Documentation"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Docs</span>
                </Link>

                <Link
                  to={`/store/${lic.product_slug}`}
                  className="py-2 px-3 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-white flex items-center gap-1 transition-colors"
                  title="Store View"
                >
                  <span>Details</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
