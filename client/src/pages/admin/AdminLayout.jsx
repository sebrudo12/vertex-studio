import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, Users, ShieldCheck, Receipt, Tag, Key, Ticket, Star, BarChart3, Settings, LogOut, Home } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { VertexLogo } from "@/components/VertexLogo";

const LINKS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/admins", label: "Admins", icon: ShieldCheck },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/orders", label: "Orders", icon: Receipt },
  { to: "/admin/coupons", label: "Coupons", icon: Tag },
  { to: "/admin/licenses", label: "Licenses", icon: Key },
  { to: "/admin/tickets", label: "Tickets", icon: Ticket },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout() {
  const { logout, settings } = useAuth();
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-[#080808] flex flex-col lg:flex-row">
      <aside className="lg:w-60 lg:min-h-screen border-b lg:border-b-0 lg:border-r border-white/10 bg-[#0a0a0c] flex lg:flex-col">
        <div className="hidden lg:flex items-center gap-2 p-5 border-b border-white/10">
          <VertexLogo logo={settings?.logo} size={26} showText={false} />
          <span className="font-display font-bold text-xs uppercase tracking-widest text-muted-foreground">Admin</span>
        </div>
        <nav className="flex lg:flex-col gap-1 p-3 overflow-x-auto flex-1">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} data-testid={`admin-nav-${l.label.toLowerCase()}`}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                isActive ? "bg-white text-black" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}>
              <l.icon className="h-4 w-4" /> {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden lg:block p-3 border-t border-white/10 space-y-1">
          <button onClick={() => nav("/")} className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-white hover:bg-white/5"><Home className="h-4 w-4" /> Back to site</button>
          <button onClick={() => { logout(); nav("/"); }} data-testid="admin-logout" className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-white/5"><LogOut className="h-4 w-4" /> Logout</button>
        </div>
      </aside>
      <main className="flex-1 p-5 sm:p-8"><Outlet /></main>
    </div>
  );
}
