import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminOrders: React.FC = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRefund = async (orderId: number) => {
    if (!confirm('Are you sure you want to refund this order and revoke all associated licenses?')) return;
    try {
      await api.post(`/admin/orders/${orderId}/refund`);
      showToast('Order refunded and licenses revoked', 'info');
      load();
    } catch {
      showToast('Failed to refund order', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white font-display">Order Registry</h2>
        <p className="text-xs text-gray-400 mt-1">Review customer transactions, items, payment IDs, and issue refunds.</p>
      </div>

      <div className="rounded-2xl bg-dark-850/80 border border-white/5 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-dark-900 border-b border-white/5 text-gray-400 uppercase font-semibold">
            <tr>
              <th className="p-4">Order #</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Items</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Method</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-300">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-mono font-bold text-white">{o.order_number}</td>
                <td className="p-4">
                  <div className="font-semibold text-white">{o.username}</div>
                  <div className="text-[10px] text-gray-500">{o.customer_email}</div>
                </td>
                <td className="p-4">{o.items?.map((i: any) => i.title).join(', ') || 'Item'}</td>
                <td className="p-4 font-bold text-white">€{parseFloat(o.total_amount).toFixed(2)}</td>
                <td className="p-4 uppercase font-mono text-[10px] text-gray-400">{o.payment_method}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    o.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {o.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {o.status === 'completed' && (
                    <button
                      onClick={() => handleRefund(o.id)}
                      className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[10px] font-semibold"
                    >
                      Refund & Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
