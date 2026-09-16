import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  useEffect(() => { 
    api.get("/me/orders")
      .then((r) => setOrders(Array.isArray(r.data) ? r.data : []))
      .catch(() => setOrders([])); 
  }, []);

  if (orders.length === 0)
    return <div className="rounded-2xl border border-white/10 bg-card p-10 text-center text-muted-foreground">No orders yet.</div>;

  return (
    <div className="rounded-2xl border border-white/10 bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-muted-foreground">
          <tr>
            <th className="text-left font-medium px-4 py-3">Order</th>
            <th className="text-left font-medium px-4 py-3 hidden sm:table-cell">Items</th>
            <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Method</th>
            <th className="text-left font-medium px-4 py-3">Total</th>
            <th className="text-left font-medium px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {orders.map((o) => {
            const orderIdStr = o.order_number || (o.id !== undefined && o.id !== null ? `ORD-${String(o.id).padStart(4, "0")}` : "-");
            const itemsText = Array.isArray(o.items) && o.items.length > 0 
              ? o.items.map((i) => i.name || i.product_title || "Product").join(", ") 
              : (o.product_title || "-");
            const amountNum = Number(o.amount || o.total_amount || 0);

            return (
              <tr key={o.id} data-testid={`order-${o.id}`}>
                <td className="px-4 py-3 font-mono text-xs text-white">{orderIdStr}</td>
                <td className="px-4 py-3 hidden sm:table-cell">{itemsText}</td>
                <td className="px-4 py-3 hidden md:table-cell capitalize">{o.payment_method || "Direct"}</td>
                <td className="px-4 py-3 font-semibold">€{amountNum.toFixed(2)}</td>
                <td className="px-4 py-3"><span className="text-xs text-emerald-300 capitalize">{o.status}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
