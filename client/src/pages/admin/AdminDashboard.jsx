import { useEffect, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";
import { DollarSign, ShoppingCart, Users, Package, Key, Download, Ticket, Star, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

function KPI({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-card p-5">
      <div className="flex items-center justify-between"><span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span><Icon className="h-4 w-4 text-muted-foreground" /></div>
      <div className="mt-2 font-display font-black text-2xl tabular-nums">{value}</div>
    </div>
  );
}

export default function AdminDashboard() {
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
      console.error("Failed to load admin analytics:", err);
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
        <p className="text-sm text-muted-foreground font-mono">Cargando métricas de Vertex Studio...</p>
      </div>
    );
  }

  if (error && !a) {
    return (
      <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 text-center max-w-md mx-auto my-12 space-y-4">
        <AlertTriangle className="h-10 w-10 text-red-400 mx-auto" />
        <h2 className="font-display font-bold text-lg text-white">Error al cargar el panel</h2>
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
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Admin</p>
        <h1 className="font-display font-black text-2xl">Overview</h1>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI icon={DollarSign} label="Revenue" value={`€${a.revenue.toFixed(2)}`} />
        <KPI icon={ShoppingCart} label="Orders" value={a.orders} />
        <KPI icon={Users} label="Users" value={a.users} />
        <KPI icon={Package} label="Products" value={a.products} />
        <KPI icon={Key} label="Active Licenses" value={a.active_licenses} />
        <KPI icon={Download} label="Downloads" value={a.downloads} />
        <KPI icon={Ticket} label="Open Tickets" value={a.open_tickets} />
        <KPI icon={Star} label="Pending Reviews" value={a.pending_reviews} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-card p-6">
          <h2 className="font-display font-bold mb-4">Revenue (7 days)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={a.revenue_by_day}>
              <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fff" stopOpacity={0.4} /><stop offset="100%" stopColor="#fff" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ background: "#0b0b10", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
              <Area type="monotone" dataKey="revenue" stroke="#fff" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl border border-white/10 bg-card p-6">
          <h2 className="font-display font-bold mb-4">Top Products</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={a.top_products}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ background: "#0b0b10", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
              <Bar dataKey="sales" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
