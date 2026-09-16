import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Users, Key, Download, MessageSquare, TrendingUp, Sparkles } from 'lucide-react';
import api from '../../services/api';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/admin/analytics');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-gray-500 text-xs">Loading analytics...</div>;
  }

  const metrics = data?.metrics || {
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    activeLicenses: 0,
    totalDownloads: 0,
    openTickets: 0,
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white font-display">System Overview & Analytics</h2>
        <p className="text-xs text-gray-400 mt-1">Real-time metrics from your live MySQL database.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-dark-850/80 border border-white/5 space-y-1">
          <span className="text-[11px] text-gray-400 font-semibold uppercase">Total Gross Revenue</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-display">
            €{metrics.totalRevenue.toFixed(2)}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-dark-850/80 border border-white/5 space-y-1">
          <span className="text-[11px] text-gray-400 font-semibold uppercase">Completed Orders</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            {metrics.totalOrders}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-dark-850/80 border border-white/5 space-y-1">
          <span className="text-[11px] text-gray-400 font-semibold uppercase">Registered Users</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            {metrics.totalUsers}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-dark-850/80 border border-white/5 space-y-1">
          <span className="text-[11px] text-gray-400 font-semibold uppercase">Active Licenses</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[var(--brand-primary)] font-display">
            {metrics.activeLicenses}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-dark-850/80 border border-white/5 space-y-1">
          <span className="text-[11px] text-gray-400 font-semibold uppercase">Total Downloads</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-display">
            {metrics.totalDownloads}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-dark-850/80 border border-white/5 space-y-1">
          <span className="text-[11px] text-gray-400 font-semibold uppercase">Open Support Tickets</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-display">
            {metrics.openTickets}
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="p-6 rounded-2xl bg-dark-850/80 border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Top Selling Resources</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/5 text-gray-400 uppercase font-semibold">
              <tr>
                <th className="pb-3">Resource</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Sales</th>
                <th className="pb-3 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {data?.topProducts?.map((p: any) => (
                <tr key={p.id}>
                  <td className="py-3 font-bold text-white">{p.title}</td>
                  <td className="py-3">{p.category}</td>
                  <td className="py-3">€{parseFloat(p.price).toFixed(2)}</td>
                  <td className="py-3 font-mono">{p.sales_count || 0}</td>
                  <td className="py-3 text-right font-bold text-emerald-400">
                    €{parseFloat(p.product_revenue || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="p-6 rounded-2xl bg-dark-850/80 border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Transactions</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/5 text-gray-400 uppercase font-semibold">
              <tr>
                <th className="pb-3">Order #</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Total</th>
                <th className="pb-3">Gateway</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {data?.recentOrders?.map((ord: any) => (
                <tr key={ord.id}>
                  <td className="py-3 font-mono font-bold text-white">{ord.order_number}</td>
                  <td className="py-3">{ord.username} ({ord.customer_email})</td>
                  <td className="py-3 font-bold text-white">€{parseFloat(ord.total_amount).toFixed(2)}</td>
                  <td className="py-3 uppercase text-gray-400">{ord.payment_method}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3 text-right text-gray-500">{ord.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
