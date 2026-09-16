import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Key, Download, Receipt } from "lucide-react";
import api from "@/lib/api";

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-card p-6">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-3 font-display font-black text-3xl tabular-nums">{value}</div>
    </div>
  );
}

export default function Overview() {
  const [s, setS] = useState(null);
  useEffect(() => { api.get("/me/summary").then((r) => setS(r.data)); }, []);
  if (!s) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={ShoppingBag} label="Total Purchases" value={s.orders} />
        <Stat icon={Key} label="Active Licenses" value={s.active_licenses} />
        <Stat icon={Download} label="Available Downloads" value={s.available_downloads} />
        <Stat icon={Receipt} label="Downloads Made" value={s.downloads} />
      </div>

      <div className="rounded-2xl border border-white/10 bg-card p-6">
        <h2 className="font-display font-bold text-lg mb-4">Recent Orders</h2>
        {s.recent_orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders yet. <Link to="/store" className="text-white hover:underline">Browse the store</Link>.</p>
        ) : (
          <div className="space-y-2">
            {s.recent_orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-lg border border-white/10 px-4 py-3">
                <div>
                  <div className="text-sm font-medium">{o.items.map((i) => i.name).join(", ")}</div>
                  <div className="text-xs text-muted-foreground font-mono">{new Date(o.date).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold">€{o.amount.toFixed(2)}</div>
                  <div className="text-xs text-emerald-300">{o.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
