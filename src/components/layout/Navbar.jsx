import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UserAvatar from '../common/UserAvatar';
import logo from '../../assets/logo.png';
import {
  Menu,
  X,
  Home,
  FolderKanban,
  LayoutDashboard,
  ShieldCheck,
  LogIn,
  UserPlus,
  LogOut,
  ChevronDown,
  UserRound,
  ArrowRight
} from 'lucide-react';

const desktopNavClass = ({ isActive }) =>
  `inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
    isActive
      ? 'bg-primary-blue text-white shadow-sm shadow-primary-blue/20'
      : 'text-gray-600 hover:bg-primary-blue/5 hover:text-primary-blue'
  }`;

const dropdownNavClass = ({ isActive }) =>
  `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-primary-blue/10 text-primary-blue'
      : 'text-gray-700 hover:bg-primary-blue/5 hover:text-primary-blue'
  }`;

const mobileNavClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-primary-blue/10 text-primary-blue'
      : 'text-gray-700 hover:bg-gray-100 hover:text-primary-blue'
  }`;

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);

  const [isScrolled, setIsScrolled] = useState(() => window.scrollY > 8);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!userMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [userMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setMobileMenuOpen(false);
      setUserMenuOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    navigate('/');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 h-16 border-b backdrop-blur-xl transition-all duration-300 ${
        isScrolled
          ? 'border-primary-blue/10 bg-white/90 shadow-[0_12px_32px_-16px_rgba(12,57,104,0.35)]'
          : 'border-white/40 bg-white/70'
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary-blue/15 to-transparent" />

      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2 lg:gap-4">
          <Link
            to="/"
            aria-label="ProjectAid home"
            className="group -mx-1 flex items-center rounded-xl px-1 py-1 transition-colors hover:bg-primary-blue/5"
          >
            {logoFailed ? (
              <span className="text-lg font-extrabold tracking-tight text-primary-blue">
                Project<span className="text-primary-green">Aid</span>
              </span>
            ) : (
              <img
                src={logo}
                alt="ProjectAid"
                className="h-10 w-auto max-w-[168px] object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                onError={() => setLogoFailed(true)}
              />
            )}
          </Link>

          <div className="ml-1 hidden items-center gap-1 rounded-full border border-primary-blue/10 bg-white/60 p-1 shadow-sm md:flex">
            <NavLink to="/" end className={desktopNavClass}>
              <Home size={15} />
              Home
            </NavLink>
            <NavLink to="/projects" className={desktopNavClass}>
              <FolderKanban size={15} />
              Projects
            </NavLink>
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <NavLink
                to="/dashboard"
                end
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-blue text-white shadow-sm shadow-primary-blue/20'
                      : 'text-primary-blue hover:bg-primary-blue/5'
                  }`
                }
              >
                <LayoutDashboard size={16} />
                Dashboard
              </NavLink>

              {isAdmin() && (
                <Link
                  to="/admin"
                  aria-label="Admin console"
                  title="Admin console"
                  className="hidden h-10 w-10 items-center justify-center rounded-full border border-primary-blue/10 bg-white/70 text-primary-blue shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-blue/25 hover:bg-white hover:shadow-md lg:inline-flex"
                >
                  <ShieldCheck size={18} />
                </Link>
              )}

              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((open) => !open)}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  className="flex items-center gap-2 rounded-full p-1 pr-1.5 transition-colors hover:bg-primary-blue/5"
                >
                  <UserAvatar user={user} size={32} />
                  <span className="hidden max-w-[110px] truncate text-sm font-semibold text-primary-blue lg:block">
                    {user.name?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown
                    size={15}
                    className={`text-gray-400 transition-transform duration-200 ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {userMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-60 origin-top-right animate-fade-in-down overflow-hidden rounded-2xl border border-primary-blue/10 bg-white/95 p-1.5 shadow-xl shadow-primary-blue/10 backdrop-blur-xl"
                  >
                    <div className="px-3 py-2.5">
                      <p className="truncate text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="truncate text-xs text-gray-500">{user.email}</p>
                    </div>

                    <div className="my-1 h-px bg-gray-100" />

                    <NavLink to="/dashboard/profile" className={dropdownNavClass} role="menuitem">
                      <UserRound size={16} />
                      My profile
                    </NavLink>
                    {isAdmin() && (
                      <NavLink to="/admin" className={dropdownNavClass} role="menuitem">
                        <ShieldCheck size={16} />
                        Admin console
                      </NavLink>
                    )}

                    <div className="my-1 h-px bg-gray-100" />

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-4 py-2 text-sm font-semibold text-primary-blue transition-colors hover:bg-primary-blue/5"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="group inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary-green to-[#6DB32C] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary-green/25 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-green/30"
              >
                Get started
                <ArrowRight
                  size={15}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-primary-blue/10 bg-white/70 text-primary-blue transition-colors hover:bg-primary-blue/5 md:hidden"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-16 z-40 bg-primary-blue/10 backdrop-blur-[2px] md:hidden"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />

          <div
            id="mobile-navigation"
            className="absolute inset-x-3 top-[4.5rem] z-50 max-h-[calc(100dvh-5.5rem)] animate-fade-in-down overflow-y-auto overscroll-contain rounded-3xl border border-primary-blue/10 bg-white p-3 shadow-2xl shadow-primary-blue/20 md:hidden"
          >
            {user ? (
              <>
                <div className="mb-2 flex items-center gap-3 rounded-2xl bg-gradient-to-br from-primary-blue to-primary-blue-light p-3.5 text-white">
                  <UserAvatar user={user} size={40} className="ring-2 ring-white/40" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-white/75">{user.email}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <NavLink to="/" end onClick={closeMobileMenu} className={mobileNavClass}>
                    <Home size={17} />
                    Home
                  </NavLink>
                  <NavLink to="/projects" onClick={closeMobileMenu} className={mobileNavClass}>
                    <FolderKanban size={17} />
                    Projects
                  </NavLink>
                  <NavLink to="/dashboard" end onClick={closeMobileMenu} className={mobileNavClass}>
                    <LayoutDashboard size={17} />
                    Dashboard
                  </NavLink>
                  {isAdmin() && (
                    <NavLink to="/admin" onClick={closeMobileMenu} className={mobileNavClass}>
                      <ShieldCheck size={17} />
                      Admin console
                    </NavLink>
                  )}
                  <NavLink
                    to="/dashboard/profile"
                    onClick={closeMobileMenu}
                    className={mobileNavClass}
                  >
                    <UserRound size={17} />
                    My profile
                  </NavLink>
                </div>

                <div className="my-2 h-px bg-gray-100" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 px-3.5 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut size={17} />
                  Log out
                </button>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <NavLink to="/" end onClick={closeMobileMenu} className={mobileNavClass}>
                    <Home size={17} />
                    Home
                  </NavLink>
                  <NavLink to="/projects" onClick={closeMobileMenu} className={mobileNavClass}>
                    <FolderKanban size={17} />
                    Projects
                  </NavLink>
                </div>

                <div className="my-2 h-px bg-gray-100" />

                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center gap-2 rounded-xl border border-primary-blue/15 px-4 py-3 text-sm font-semibold text-primary-blue transition-colors hover:bg-primary-blue/5"
                  >
                    <LogIn size={17} />
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary-green px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary-green/25 transition-colors hover:bg-primary-green/90"
                  >
                    <UserPlus size={17} />
                    Create account
                  </Link>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
