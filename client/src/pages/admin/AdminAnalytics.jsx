import { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import api from "@/lib/api";

import { Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const COLORS = ["#ffffff", "#cbd5e1", "#94a3b8", "#64748b", "#475569", "#334155"];

export default function AdminAnalytics() {
  const [a, setA] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/admin/analytics");
      setA(res.data);
    } catch (err) {
      console.error("Failed to load analytics:", err);
      setError(err.response?.data?.error || err.message || "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading && !a) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-white/60" />
        <p className="text-sm text-muted-foreground font-mono">Cargando análisis detallados...</p>
      </div>
    );
  }

  if (error && !a) {
    return (
      <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 text-center max-w-md mx-auto my-12 space-y-4">
        <AlertTriangle className="h-10 w-10 text-red-400 mx-auto" />
        <h2 className="font-display font-bold text-lg text-white">Error al cargar estadísticas</h2>
        <p className="text-xs text-muted-foreground">{error}</p>
        <Button onClick={fetchAnalytics} variant="outline" className="border-white/20 hover:bg-white/10 text-white text-xs">
          <RefreshCw className="h-3.5 w-3.5 mr-2" /> Reintentar
        </Button>
      </div>
    );
  }

  if (!a) return null;

  return (
    <div className="space-y-6">
      <h1 className="font-display font-black text-2xl">Analytics</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[["Revenue", `€${a.revenue.toFixed(2)}`], ["Orders", a.orders], ["Users", a.users], ["Downloads", a.downloads],
          ["Active Licenses", a.active_licenses], ["Products", a.products], ["Open Tickets", a.open_tickets], ["Pending Reviews", a.pending_reviews]
        ].map(([l, v]) => (
          <div key={l} className="rounded-2xl border border-white/10 bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{l}</div>
            <div className="mt-2 font-display font-black text-2xl tabular-nums">{v}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-card p-6">
          <h2 className="font-display font-bold mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={a.revenue_by_day}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} /><YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ background: "#0b0b10", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="revenue" stroke="#fff" strokeWidth={2} dot={{ fill: "#fff", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl border border-white/10 bg-card p-6">
          <h2 className="font-display font-bold mb-4">Sales Distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={a.top_products.filter((p) => p.sales > 0)} dataKey="sales" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {a.top_products.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0b0b10", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          {a.top_products.every((p) => !p.sales) && <p className="text-xs text-muted-foreground text-center -mt-8">No sales data yet</p>}
        </div>
      </div>
    </div>
  );
}
