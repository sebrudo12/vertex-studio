import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Download, Key, ShoppingBag, ArrowRight, Copy, Check } from 'lucide-react';
import api from '../../services/api';
import { Order, License } from '../../types';
import { useToast } from '../../context/ToastContext';

export const DashboardOverview: React.FC = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [downloadsCount, setDownloadsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [ordRes, licRes, downRes] = await Promise.all([
          api.get('/orders/my-orders'),
          api.get('/licenses/my-licenses'),
          api.get('/downloads/my-downloads'),
        ]);
        setOrders(ordRes.data.orders || []);
        setLicenses(licRes.data.licenses || []);
        setDownloadsCount(downRes.data.availableDownloads?.length || 0);
      } catch (err) {
        console.error('Failed to load dashboard overview data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    showToast('License key copied to clipboard', 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-8">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-dark-850/80 border border-white/5 space-y-1">
          <span className="text-xs text-gray-400 font-semibold uppercase">Total Purchases</span>
          <div className="text-3xl font-extrabold text-white font-display">{orders.length}</div>
        </div>

        <div className="p-6 rounded-2xl bg-dark-850/80 border border-white/5 space-y-1">
          <span className="text-xs text-gray-400 font-semibold uppercase">Active Licenses</span>
          <div className="text-3xl font-extrabold text-[var(--brand-primary)] font-display">
            {licenses.filter((l) => l.status === 'active').length}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-dark-850/80 border border-white/5 space-y-1">
          <span className="text-xs text-gray-400 font-semibold uppercase">Available Downloads</span>
          <div className="text-3xl font-extrabold text-emerald-400 font-display">
            {downloadsCount}
          </div>
        </div>
      </div>

      {/* Active Licenses Preview */}
      <div className="p-6 rounded-2xl bg-dark-850/80 border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Your Active Licenses
          </h3>
          <Link
            to="/dashboard/licenses"
            className="text-xs text-[var(--brand-primary)] hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Manage All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {licenses.length === 0 ? (
          <p className="text-xs text-gray-500 py-4 text-center">No active licenses yet.</p>
        ) : (
          <div className="space-y-3">
            {licenses.slice(0, 3).map((lic) => (
              <div
                key={lic.id}
                className="p-3.5 rounded-xl bg-dark-900 border border-white/5 flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{lic.product_title}</h4>
                  <span className="font-mono text-xs font-semibold text-[var(--brand-primary)]">
                    {lic.license_key}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(lic.license_key)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                  title="Copy License"
                >
                  {copiedKey === lic.license_key ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="p-6 rounded-2xl bg-dark-850/80 border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Recent Orders
          </h3>
          <Link
            to="/dashboard/orders"
            className="text-xs text-[var(--brand-primary)] hover:underline flex items-center gap-1 font-semibold"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="text-xs text-gray-500 py-4 text-center">No recent purchases found.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {orders.slice(0, 4).map((ord) => (
              <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-mono font-bold text-white">{ord.order_number}</div>
                  <div className="text-gray-400 text-[11px]">{ord.created_at}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white">€{parseFloat(ord.total_amount as string).toFixed(2)}</div>
                  <span className="text-[10px] uppercase font-semibold text-emerald-400">
                    {ord.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
