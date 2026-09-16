import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, LogOut, LayoutDashboard, Shield, Menu, X, Disc as DiscordIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { AccentPicker } from '../common/AccentPicker';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Store', path: '/store' },
    { name: 'Documentation', path: '/documentation' },
    { name: 'Changelog', path: '/changelog' },
    { name: 'Support', path: '/support' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-dark-950/75 border-b border-white/5 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Vertex Studio"
              className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_0_12px_rgba(255,255,255,0.15)]"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg tracking-widest text-white uppercase group-hover:text-[var(--brand-primary)] transition-colors">
              VERTEX
            </span>
            <span className="text-[10px] tracking-[0.25em] text-gray-400 font-semibold uppercase -mt-1">
              STUDIO
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-dark-850/60 p-1.5 rounded-full border border-white/5 shadow-inner">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive(link.path)
                  ? 'bg-white/10 text-white shadow-sm font-semibold'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <a
            href="https://discord.gg/vertexstudio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium text-[#5865F2] hover:text-white hover:bg-[#5865F2]/20 transition-all duration-200"
          >
            <span>Discord</span>
          </a>
        </nav>

        {/* Right Action Icons & Auth */}
        <div className="hidden md:flex items-center gap-3">
          {/* Accent Switcher */}
          <AccentPicker />

          {/* Cart Trigger */}
          <button
            onClick={openCart}
            className="relative p-2.5 rounded-xl bg-dark-850 hover:bg-dark-800 border border-white/5 hover:border-white/10 text-gray-300 hover:text-white transition-all duration-200"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--brand-primary)] text-black font-extrabold text-[11px] flex items-center justify-center shadow-lg shadow-[var(--brand-glow)] animate-scale-in">
                {totalItems}
              </span>
            )}
          </button>

          {/* User Auth State */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 flex items-center gap-1.5 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </Link>
              )}

              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-dark-850 hover:bg-dark-800 border border-white/5 hover:border-white/10 text-white text-sm font-medium transition-all duration-200"
              >
                <img
                  src={user.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                  alt={user.username}
                  className="w-6 h-6 rounded-full object-cover bg-dark-750 border border-white/10"
                />
                <span className="truncate max-w-[100px]">{user.username}</span>
              </Link>

              <button
                onClick={logout}
                title="Log Out"
                className="p-2.5 rounded-xl bg-dark-850 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 text-gray-400 hover:text-rose-400 transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-black bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] transition-all duration-200 shadow-md shadow-[var(--brand-glow)]"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={openCart}
            className="relative p-2 rounded-lg bg-dark-850 border border-white/5 text-gray-300"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--brand-primary)] text-black text-[10px] font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-dark-850 border border-white/5 text-gray-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-dark-900 border-b border-white/10 px-4 pt-2 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base font-medium ${
                  isActive(link.path)
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <a
              href="https://discord.gg/vertexstudio"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-2 rounded-lg text-base font-medium text-[#5865F2] hover:bg-[#5865F2]/10"
            >
              Join Discord
            </a>
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
            <AccentPicker />
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-semibold"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="p-2 rounded-lg bg-rose-500/10 text-rose-400"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-black bg-[var(--brand-primary)]"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
