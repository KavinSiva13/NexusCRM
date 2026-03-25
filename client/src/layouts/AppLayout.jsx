import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, UserCheck, CheckSquare, BarChart3,
  LogOut, Menu, X, Bell, ChevronDown, Zap, Settings
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/leads', icon: Users, label: 'Leads' },
  { path: '/customers', icon: UserCheck, label: 'Customers' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/reports', icon: BarChart3, label: 'Reports' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display text-lg font-bold text-white">NexusCRM</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-widest px-3 mb-3">Main Menu</div>
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-widest px-3 mt-6 mb-3">System</div>
          <button className="sidebar-link w-full">
            <Settings size={18} />
            Settings
          </button>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
            <div className="w-9 h-9 rounded-lg bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-400 font-semibold text-sm font-mono">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{user?.role}</p>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors" title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white p-1">
            <Menu size={22} />
          </button>

          <div className="flex-1" />

          <button className="relative text-slate-400 hover:text-white transition-colors p-2">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary-500 rounded-full" />
          </button>

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-400 font-semibold text-xs font-mono">
                {initials}
              </div>
              <span className="text-sm text-slate-300 font-medium hidden sm:block">{user?.name}</span>
              <ChevronDown size={14} className="text-slate-500" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 card py-1 shadow-xl animate-slide-up">
                <div className="px-4 py-2 border-b border-slate-800">
                  <p className="text-sm font-medium text-slate-200">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-slate-800 transition-colors"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
