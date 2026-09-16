import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    api.get("/admin/orders")
      .then((r) => setOrders(Array.isArray(r.data) ? r.data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false)); 
  }, []);

  return (
    <div>
      <h1 className="font-display font-black text-2xl mb-6">Orders</h1>
      <div className="rounded-2xl border border-white/10 bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-muted-foreground"><tr>
            <th className="text-left font-medium px-4 py-3">Order ID</th>
            <th className="text-left font-medium px-4 py-3 hidden sm:table-cell">User</th>
            <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Items</th>
            <th className="text-left font-medium px-4 py-3">Method</th>
            <th className="text-left font-medium px-4 py-3">Total</th>
            <th className="text-left font-medium px-4 py-3">Status</th>
          </tr></thead>
          <tbody className="divide-y divide-white/10">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Cargando pedidos...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No hay pedidos registrados todavía.</td></tr>
            ) : (
              orders.map((o) => {
                const orderIdStr = o.order_number || (o.id !== undefined && o.id !== null ? `ORD-${String(o.id).padStart(4, "0")}` : "-");
                const itemsText = Array.isArray(o.items) && o.items.length > 0 
                  ? o.items.map((i) => i.name || i.product_title || "Product").join(", ") 
                  : (o.product_title || "-");
                const amountNum = Number(o.amount || o.total_amount || 0);

                return (
                  <tr key={o.id} data-testid={`admin-order-${o.id}`}>
                    <td className="px-4 py-3 font-mono text-xs text-white">{orderIdStr}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{o.user_email || o.customer_email || "-"}</td>
                    <td className="px-4 py-3 hidden md:table-cell">{itemsText}</td>
                    <td className="px-4 py-3 capitalize">{o.payment_method || "Stripe"}</td>
                    <td className="px-4 py-3 font-semibold">€{amountNum.toFixed(2)}</td>
                    <td className="px-4 py-3"><span className="text-xs text-emerald-300 capitalize">{o.status}</span></td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
