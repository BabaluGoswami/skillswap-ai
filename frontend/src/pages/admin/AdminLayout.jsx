import React, { useState } from 'react';
import { Navigate, Link, useLocation, Outlet } from 'react-router-dom';
import { useApp } from '@context/AppContext.jsx';
import { 
  LayoutDashboard, Users, MessageSquare, ShieldAlert,
  BarChart3, Settings, Menu, ChevronLeft, ChevronRight, GraduationCap 
} from 'lucide-react';

/**
 * Admin Panel Layout Wrapper.
 * Features a collapsible sidebar, theme-aligned colors, and route guard logic.
 */
const AdminLayout = () => {
  const { currentUser } = useApp();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Security Check: Only Administrators allowed
  if (!currentUser || currentUser.role !== 'Admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Reports', path: '/admin/reports', icon: ShieldAlert },
    { name: 'Feedback', path: '/admin/feedback', icon: MessageSquare },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const isLinkActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Sidebar Navigation */}
      <aside 
        className={`bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transition-all duration-300 flex flex-col shrink-0 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header Logo */}
        <div className="h-16 flex items-center px-4.5 border-b border-slate-100 dark:border-slate-800 justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="font-display font-bold text-sm tracking-tight">
                Admin Swap<span className="text-indigo-650">.</span>AI
              </span>
            </div>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer mx-auto"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Sidebar Menu Links */}
        <nav className="flex-1 py-6 px-3 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3.5 px-3 py-3 rounded-2xl font-medium text-sm transition-all group ${
                  active 
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/45 text-indigo-650 dark:text-indigo-400 font-semibold' 
                    : 'text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-150 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-indigo-650 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-550'}`} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Administrative Views Panel */}
      <div className="flex-grow flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-150/40 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md flex items-center px-8 justify-between">
          <h2 className="font-display font-bold text-base tracking-wide text-slate-700 dark:text-slate-300 uppercase">
            Administrative Center
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350 border border-slate-200/50 dark:border-slate-750">
              Session: {currentUser?.name}
            </span>
          </div>
        </header>
        
        <main className="flex-grow p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
