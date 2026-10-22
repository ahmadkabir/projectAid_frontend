import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { AdminPageProvider, useAdminPage } from './adminPageContext';
import UserAvatar from '../../../components/common/UserAvatar';
import logo from '../../../assets/logo.png';
import {
  LayoutDashboard,
  FolderKanban,
  ShoppingCart,
  Users,
  MessageSquare,
  BarChart3,
  Menu,
  X,
  LogOut,
  Home,
  ChevronDown
} from 'lucide-react';

// Default header title per admin route (pages may override via useAdminPage).
const getDefaultTitle = (pathname) => {
  if (pathname === '/admin') return 'Dashboard';
  if (pathname.startsWith('/admin/orders')) return 'Orders';
  if (pathname.startsWith('/admin/users')) return 'Users';
  if (pathname.startsWith('/admin/support')) return 'Support';
  if (pathname.startsWith('/admin/analytics')) return 'Analytics';
  if (/^\/admin\/projects\/\d+\/attachments/.test(pathname)) return 'Project Attachments';
  if (/^\/admin\/projects\/\d+\/doc-preview/.test(pathname)) return 'Document Editor';
  if (/^\/admin\/projects\/\d+\/view/.test(pathname)) return 'Project Details';
  if (pathname.startsWith('/admin/projects')) return 'Projects';
  return 'Admin';
};

const AccountMenu = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false);
    };
    const timeoutId = setTimeout(() => document.addEventListener('mousedown', handleClickOutside), 0);
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 sm:gap-3 pl-1.5 sm:pl-2 pr-2 sm:pr-3 py-1.5 rounded-xl hover:bg-admin-bg transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="w-9 h-9 rounded-full bg-admin-blue/10 flex items-center justify-center overflow-hidden ring-2 ring-admin-border">
          <UserAvatar user={user} size={36} />
        </span>
        <span className="hidden md:flex flex-col items-start leading-tight max-w-[160px]">
          <span className="text-sm font-semibold text-admin-text truncate w-full">
            {user?.name || 'Admin'}
          </span>
          <span className="text-xs text-admin-muted truncate w-full">{user?.email}</span>
        </span>
        <ChevronDown size={16} className={`text-admin-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-admin-border shadow-lg py-1.5 z-[100]">
          <div className="px-4 py-2 sm:hidden border-b border-admin-border mb-1">
            <p className="text-sm font-semibold text-admin-text truncate">{user?.name}</p>
            <p className="text-xs text-admin-muted truncate">{user?.email}</p>
          </div>
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="w-full px-4 py-2.5 text-left text-sm text-admin-text hover:bg-admin-bg flex items-center gap-2.5 transition-colors"
          >
            <Home size={16} className="text-admin-muted" />
            View Site
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="w-full px-4 py-2.5 text-left text-sm text-admin-pending hover:bg-admin-pending/10 flex items-center gap-2.5 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

const AdminChrome = ({ children, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { page } = useAdminPage();

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/projects', icon: FolderKanban, label: 'Projects' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/support', icon: MessageSquare, label: 'Support' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' }
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-admin-bg text-admin-text">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-admin-blue text-white flex items-center justify-between px-4 shadow-md">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="ProjectAid Logo"
            className="h-8 w-auto object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <span className="text-sm font-semibold text-white/90">Admin</span>
        </div>
        <button
          type="button"
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="p-2 -mr-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-14 lg:top-0 left-0 z-40 w-[212px] h-[calc(100vh-3.5rem)] lg:h-screen bg-admin-blue text-white flex flex-col transition-transform duration-300 shadow-lg ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Brand */}
        <div className="hidden lg:flex flex-col items-center justify-center px-4 py-5 border-b border-white/15">
          <img
            src={logo}
            alt="ProjectAid Logo"
            className="h-10 w-auto object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <p className="text-xs font-medium text-white/80 mt-2">Admin Panel</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={closeSidebar}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                      active
                        ? 'bg-white text-admin-blue font-semibold shadow-sm'
                        : 'text-white/80 font-medium hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon size={18} className="shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer actions */}
        <div className="px-3 py-3 border-t border-white/15 space-y-1.5">
          <Link
            to="/"
            onClick={closeSidebar}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Home size={18} />
            View Site
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-30" onClick={closeSidebar} />
      )}

      {/* Content */}
      <div className="lg:pl-[212px] pt-14 lg:pt-0">
        <header className="sticky top-14 lg:top-0 z-20 h-16 bg-white border-b border-admin-border flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-admin-text truncate">
              {page.title}
            </h1>
            {page.subtitle && (
              <p className="text-xs text-admin-muted truncate">{page.subtitle}</p>
            )}
          </div>
          <AccountMenu user={user} onLogout={onLogout} />
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AdminPageProvider initialTitle={getDefaultTitle(location.pathname)}>
      <AdminChrome onLogout={handleLogout}>{children}</AdminChrome>
    </AdminPageProvider>
  );
};

export default AdminLayout;
