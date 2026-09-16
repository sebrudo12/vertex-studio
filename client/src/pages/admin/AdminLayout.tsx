import React from 'react';
import { NavLink, Outlet, Navigate, Link } from 'react-router-dom';
import { Shield, LayoutDashboard, Package, Users, ShoppingCart, Key, MessageSquare, Star, Download, Settings, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="p-20 text-center text-gray-500">Verifying admin credentials...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const adminNav = [
    { name: 'Analytics & Overview', path: '/admin', icon: LayoutDashboard, end: true },
    { name: 'Product Manager', path: '/admin/products', icon: Package },
    { name: 'User Manager', path: '/admin/users', icon: Users },
    { name: 'Order Registry', path: '/admin/orders', icon: ShoppingCart },
    { name: 'License Registry', path: '/admin/licenses', icon: Key },
    { name: 'Support Tickets', path: '/admin/tickets', icon: MessageSquare },
    { name: 'Review Moderation', path: '/admin/reviews', icon: Star },
    { name: 'Download Audit Log', path: '/admin/downloads', icon: Download },
    { name: 'Platform Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Top Admin Notice */}
      <div className="mb-6 flex items-center justify-between p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Vertex Studio Administration Panel
            </h2>
            <p className="text-[11px] text-gray-400">
              Logged in as <strong className="text-white">{user?.username}</strong> ({user?.email})
            </p>
          </div>
        </div>

        <Link
          to="/dashboard"
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Customer Dashboard</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-2">
          <div className="p-3 rounded-2xl bg-dark-850/80 border border-white/5 space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-9">
          <Outlet />
        </div>

      </div>

    </div>
  );
};
