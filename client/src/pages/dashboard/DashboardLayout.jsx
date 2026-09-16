import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, Download, Key, Receipt, FileText, LifeBuoy, Settings, LogOut, Home } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { VertexLogo } from "@/components/VertexLogo";

const LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/products", label: "My Products", icon: Package },
  { to: "/dashboard/downloads", label: "Downloads", icon: Download },
  { to: "/dashboard/licenses", label: "Licenses", icon: Key },
  { to: "/dashboard/orders", label: "Orders", icon: Receipt },
  { to: "/dashboard/invoices", label: "Invoices", icon: FileText },
  { to: "/dashboard/support", label: "Support", icon: LifeBuoy },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout() {
  const { user, logout, settings } = useAuth();
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col lg:flex-row">
      <aside className="lg:w-64 lg:min-h-screen border-b lg:border-b-0 lg:border-r border-white/10 bg-[#0a0a0c] flex lg:flex-col">
        <div className="hidden lg:block p-5 border-b border-white/10"><VertexLogo logo={settings?.logo} size={28} /></div>
        <nav className="flex lg:flex-col gap-1 p-3 overflow-x-auto lg:overflow-visible flex-1">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} data-testid={`dash-nav-${l.label.replace(/\s+/g, "-").toLowerCase()}`}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                isActive ? "bg-white text-black" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}>
              <l.icon className="h-4 w-4" /> {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden lg:block p-3 border-t border-white/10 space-y-1">
          <button onClick={() => nav("/")} className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-white hover:bg-white/5">
            <Home className="h-4 w-4" /> Back to site
          </button>
          <button onClick={() => { logout(); nav("/"); }} data-testid="dash-logout" className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-white/5">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-5 sm:p-8">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Welcome back</p>
          <h1 className="font-display font-black text-2xl">{user?.name}</h1>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
