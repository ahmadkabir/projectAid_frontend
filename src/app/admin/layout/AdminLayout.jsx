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
  ChevronDown,
  ChevronRight,
  ArrowUpRight
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
        className="flex items-center gap-2 rounded-full p-1 pr-1.5 transition-colors hover:bg-admin-bg sm:gap-3 sm:pr-2.5"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-admin-blue/10">
          <UserAvatar user={user} size={36} />
        </span>
        <span className="hidden max-w-[160px] flex-col items-start leading-tight md:flex">
          <span className="w-full truncate text-sm font-semibold text-admin-text">
            {user?.name || 'Admin'}
          </span>
          <span className="w-full truncate text-xs text-admin-muted">{user?.email}</span>
        </span>
        <ChevronDown
          size={16}
          className={`text-admin-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-[100] mt-2 w-60 origin-top-right animate-fade-in-down overflow-hidden rounded-2xl border border-admin-border bg-white p-1.5 shadow-xl shadow-admin-blue/10"
        >
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-admin-text">{user?.name}</p>
            <p className="truncate text-xs text-admin-muted">{user?.email}</p>
            <span className="mt-2 inline-flex items-center rounded-full bg-admin-blue/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-admin-blue">
              {user?.role || 'admin'}
            </span>
          </div>

          <div className="my-1 h-px bg-admin-border" />

          <Link
            to="/"
            onClick={() => setOpen(false)}
            role="menuitem"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-admin-text transition-colors hover:bg-admin-bg"
          >
            <Home size={16} className="text-admin-muted" />
            View site
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-admin-pending transition-colors hover:bg-admin-pending/10"
          >
            <LogOut size={16} />
            Log out
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
      <div className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between bg-[#082B4D] px-4 text-white shadow-lg lg:hidden">
        <div className="flex items-center gap-2.5">
          <span className="rounded-xl bg-white px-2.5 py-1.5 shadow-sm">
            <img
              src={logo}
              alt="ProjectAid"
              className="h-6 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
            Admin
          </span>
        </div>
        <button
          type="button"
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="rounded-xl p-2 transition-colors hover:bg-white/10"
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-14 z-40 flex h-[calc(100vh-3.5rem)] w-[264px] flex-col overflow-hidden bg-gradient-to-b from-[#0B3760] via-[#082B4D] to-[#061F38] text-white shadow-2xl transition-transform duration-300 lg:top-0 lg:h-screen ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />
        <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-primary-blue-light/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-52 w-52 rounded-full bg-primary-green/10 blur-3xl" />

        <div className="relative flex h-full flex-col">
          {/* Brand */}
          <div className="hidden px-4 pb-5 pt-5 lg:block">
            <Link
              to="/admin"
              className="block w-full rounded-2xl bg-white p-3 shadow-lg shadow-black/10 transition-transform hover:scale-[1.02]"
            >
              <img
                src={logo}
                alt="ProjectAid"
                className="h-auto w-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </Link>
            <div className="mt-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-green shadow-[0_0_8px_rgba(130,197,58,0.8)]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
                Admin workspace
              </span>
            </div>
          </div>

          {/* Mobile drawer header */}
          <div className="border-b border-white/10 px-4 py-3 lg:hidden">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              Navigation
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3.5 py-4">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
              Main menu
            </p>
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={closeSidebar}
                      aria-current={active ? 'page' : undefined}
                      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                        active
                          ? 'bg-white/[0.09] font-semibold text-white ring-1 ring-white/10'
                          : 'font-medium text-white/60 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                          active
                            ? 'bg-primary-green text-[#082B4D] shadow-[0_4px_12px_rgba(130,197,58,0.3)]'
                            : 'bg-white/[0.06] text-white/55 group-hover:bg-white/10 group-hover:text-white'
                        }`}
                      >
                        <Icon size={16} />
                      </span>
                      <span className="flex-1">{item.label}</span>
                      {active && <ChevronRight size={14} className="text-white/35" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sidebar footer */}
          <div className="relative border-t border-white/10 px-3.5 py-4">
            <Link
              to="/"
              onClick={closeSidebar}
              className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
            >
              <span className="inline-flex items-center gap-3">
                <Home size={17} />
                View site
              </span>
              <ArrowUpRight
                size={15}
                className="opacity-40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
              />
            </Link>

            <div className="mt-2 flex items-center gap-2.5 rounded-2xl bg-white/[0.06] p-2.5 ring-1 ring-white/10">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10">
                <UserAvatar user={user} size={32} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">
                  {user?.name || 'Admin'}
                </p>
                <p className="truncate text-[10px] text-white/45">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={onLogout}
                title="Log out"
                aria-label="Log out"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-red-400/10 hover:text-red-300"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 top-14 z-30 bg-[#04182B]/50 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Content */}
      <div className="pt-14 lg:pl-[264px] lg:pt-0">
        <header className="sticky top-14 z-20 flex h-16 items-center justify-between gap-4 border-b border-admin-border/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:top-0 lg:px-8">
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold text-admin-text sm:text-lg">
              {page.title}
            </h1>
            {page.subtitle && (
              <p className="truncate text-xs text-admin-muted">{page.subtitle}</p>
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
