import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  LogOut
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const linkClass =
    'text-primary-blue hover:text-primary-green px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-16 bg-white/90 backdrop-blur-md shadow-sm transition-all duration-300 w-full`}
    >
      <div className="w-full h-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <div className="flex items-center h-full">
            <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity h-full">
              <img 
                src={logo} 
                alt="ProjectAid Logo" 
                className="h-10 w-auto max-h-10 object-contain"
                onError={(e) => {
                  console.error('Logo failed to load');
                  e.target.style.display = 'none';
                }}
              />
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex ml-8 items-center space-x-1 h-full">
              <Link to="/" className={`${linkClass} h-full`}>
                <Home size={16} />
                Home
              </Link>
              <Link to="/projects" className={`${linkClass} h-full`}>
                <FolderKanban size={16} />
                Projects
              </Link>
            </div>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-3 h-full">
            {user ? (
              <>
                {isAdmin() && (
                  <Link to="/admin" className={linkClass}>
                    <ShieldCheck size={16} />
                    Admin
                  </Link>
                )}
                <Link to="/dashboard" className={linkClass}>
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
                <Link
                  to="/dashboard/profile"
                  className={`${linkClass} px-2`}
                  title={`Profile — ${user.name}`}
                  aria-label="Profile"
                >
                  <UserAvatar user={user} size={30} className="border-2 border-primary-blue/30" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-primary-green hover:bg-primary-green/90 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm hover:shadow-md h-9 flex items-center gap-1.5"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={linkClass}>
                  <LogIn size={16} />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-green hover:bg-primary-green/90 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm hover:shadow-md flex items-center gap-1.5"
                >
                  <UserPlus size={16} />
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-primary-blue hover:text-primary-green transition-colors h-full flex items-center"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
            <div className="flex flex-col space-y-1 p-4">
              <Link to="/" onClick={closeMobileMenu} className={linkClass}>
                <Home size={16} />
                Home
              </Link>
              <Link to="/projects" onClick={closeMobileMenu} className={linkClass}>
                <FolderKanban size={16} />
                Projects
              </Link>
              {user ? (
                <>
                  {isAdmin() && (
                    <Link to="/admin" onClick={closeMobileMenu} className={linkClass}>
                      <ShieldCheck size={16} />
                      Admin
                    </Link>
                  )}
                  <Link to="/dashboard" onClick={closeMobileMenu} className={linkClass}>
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>
                  <Link
                    to="/dashboard/profile"
                    onClick={closeMobileMenu}
                    className={linkClass}
                    aria-label="Profile"
                  >
                    <UserAvatar user={user} size={20} />
                    Profile
                  </Link>
                  <div className="px-3 py-2 text-sm text-gray-700 flex items-center gap-2">
                    <span className="font-medium">Hello, {user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-primary-green hover:bg-primary-green/90 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors text-left flex items-center gap-1.5"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={closeMobileMenu} className={linkClass}>
                    <LogIn size={16} />
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="bg-primary-green hover:bg-primary-green/90 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors text-left flex items-center gap-1.5"
                  >
                    <UserPlus size={16} />
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
