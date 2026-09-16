import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Download, Key, ShoppingCart, MessageSquare, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menu = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, end: true },
    { name: 'My Products', path: '/dashboard/products', icon: Package },
    { name: 'Downloads', path: '/dashboard/downloads', icon: Download },
    { name: 'Licenses', path: '/dashboard/licenses', icon: Key },
    { name: 'Orders', path: '/dashboard/orders', icon: ShoppingCart },
    { name: 'Support Tickets', path: '/dashboard/support', icon: MessageSquare },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* User Brief Card */}
          <div className="p-5 rounded-2xl bg-dark-850/80 border border-white/5 backdrop-blur-md flex items-center gap-3">
            <img
              src={user?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
              alt={user?.username}
              className="w-12 h-12 rounded-xl object-cover bg-dark-800 border border-white/10"
            />
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate">{user?.username}</h3>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border border-[var(--brand-primary)]/20 uppercase">
                {user?.role}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="p-3 rounded-2xl bg-dark-850/60 border border-white/5 space-y-1">
            {menu.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[var(--brand-primary)] text-black shadow-md shadow-[var(--brand-glow)]'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors pt-2 border-t border-white/5"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Log Out</span>
            </button>
          </div>

        </div>

        {/* Main Content Pane */}
        <div className="lg:col-span-9">
          <Outlet />
        </div>

      </div>
    </div>
  );
};
