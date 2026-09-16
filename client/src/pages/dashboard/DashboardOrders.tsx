import React, { useState, useEffect } from 'react';
import { ShoppingCart, FileText, CheckCircle, ExternalLink, X, Printer } from 'lucide-react';
import api from '../../services/api';
import { Order } from '../../types';

export const DashboardOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/orders/my-orders');
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white font-display">Order History</h2>
        <p className="text-xs text-gray-400 mt-1">
          Review previous transactions, download receipts, and inspect order items.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="p-10 rounded-2xl bg-dark-850 text-center text-gray-500 text-xs">
          No order records found.
        </div>
      ) : (
        <div className="rounded-2xl bg-dark-850/80 border border-white/5 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-dark-900 border-b border-white/5 text-gray-400 uppercase font-semibold">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Items</th>
                <th className="p-4">Date</th>
                <th className="p-4">Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono font-bold text-white">{ord.order_number}</td>
                  <td className="p-4">
                    {ord.items?.map((i) => i.product_title).join(', ') || 'Script Bundle'}
                  </td>
                  <td className="p-4 text-gray-400">{ord.created_at}</td>
                  <td className="p-4 font-bold text-white">€{parseFloat(ord.total_amount as string).toFixed(2)}</td>
                  <td className="p-4 uppercase text-gray-400 font-medium">{ord.payment_method}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 uppercase border border-emerald-500/20">
                      {ord.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(ord)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-dark-900 border border-white/10 rounded-2xl p-6 space-y-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h3 className="text-base font-bold text-white font-display">Invoice Details</h3>
                <span className="text-xs font-mono text-gray-400">{selectedOrder.order_number}</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Customer:</span>
                <span className="text-white font-medium">{selectedOrder.customer_email}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Transaction ID:</span>
                <span className="text-white font-mono">{selectedOrder.transaction_id}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Date:</span>
                <span className="text-white">{selectedOrder.created_at}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Payment Provider:</span>
                <span className="text-white uppercase">{selectedOrder.payment_method}</span>
              </div>
            </div>

            <div className="border-t border-b border-white/5 py-4 space-y-2 text-xs">
              <span className="font-bold text-gray-300 uppercase tracking-wider block mb-2">
                Purchased Items
              </span>
              {selectedOrder.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-gray-300">
                  <span>{item.product_title}</span>
                  <span className="font-bold text-white">€{parseFloat(item.price as string).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-sm font-bold text-white">
              <span>Total Paid:</span>
              <span className="text-lg text-[var(--brand-primary)]">
                €{parseFloat(selectedOrder.total_amount as string).toFixed(2)}
              </span>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
