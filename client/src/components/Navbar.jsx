import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Menu, X, LayoutDashboard, LogOut, Shield, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { VertexLogo } from "@/components/VertexLogo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/store", label: "Store" },
  { to: "/documentation", label: "Documentation" },
  { to: "/changelog", label: "Changelog" },
  { to: "/support", label: "Support" },
];

export function Navbar() {
  const { user, logout, settings } = useAuth();
  const { count } = useCart();
  const nav = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const discord = settings?.discord?.invite || "#";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080808]/80 backdrop-blur-xl">
      <div className="vx-container flex h-16 items-center justify-between gap-4">
        <VertexLogo logo={settings?.logo} size={30} />

        <nav className="hidden lg:flex items-center gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              data-testid={`nav-${l.label.toLowerCase()}`}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                loc.pathname === l.to ? "text-white" : "text-muted-foreground hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <a href={discord} target="_blank" rel="noreferrer" data-testid="nav-discord"
             className="px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-white transition-colors">
            Discord
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/checkout" data-testid="nav-cart" className="relative p-2 rounded-md hover:bg-white/5 transition-colors">
            <ShoppingCart className="h-5 w-5 text-muted-foreground hover:text-white" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-white text-[10px] font-bold text-black flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>

          {user === null ? null : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button data-testid="nav-user-menu" className="flex items-center gap-2 rounded-full border border-white/10 pl-1 pr-3 py-1 hover:border-white/30 transition-colors">
                  <span className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                    {user.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : <User className="h-4 w-4" />}
                  </span>
                  <span className="text-sm font-medium max-w-[90px] truncate hidden sm:block">{user.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 glass border-white/10">
                <DropdownMenuItem data-testid="menu-dashboard" onClick={() => nav("/dashboard")} className="cursor-pointer">
                  <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <DropdownMenuItem data-testid="menu-admin" onClick={() => nav("/admin")} className="cursor-pointer">
                    <Shield className="h-4 w-4 mr-2" /> Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem data-testid="menu-logout" onClick={() => { logout(); nav("/"); }} className="cursor-pointer text-red-400">
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" data-testid="nav-login">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm" data-testid="nav-getstarted"
                className="bg-white text-black hover:bg-white/90 font-semibold btn-shine">
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          )}

          <button data-testid="mobile-menu-toggle" className="lg:hidden p-2 rounded-md hover:bg-white/5" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden border-t border-white/10 bg-[#080808]">
            <div className="vx-container py-4 flex flex-col gap-1">
              {LINKS.map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setOpen(false)} data-testid={`mobile-nav-${l.label.toLowerCase()}`}
                  className="px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5">
                  {l.label}
                </Link>
              ))}
              {!user && (
                <div className="flex gap-2 pt-2">
                  <Button asChild variant="outline" className="flex-1" onClick={() => setOpen(false)}><Link to="/login">Login</Link></Button>
                  <Button asChild className="flex-1 bg-white text-black" onClick={() => setOpen(false)}><Link to="/register">Get Started</Link></Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
