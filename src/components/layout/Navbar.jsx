import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';
import { Menu, X } from 'lucide-react';

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
              <Link
                to="/"
                className="text-primary-blue hover:text-primary-green px-3 py-2 rounded-md text-sm font-medium transition-colors h-full flex items-center"
              >
                Home
              </Link>
              <Link
                to="/projects"
                className="text-primary-blue hover:text-primary-green px-3 py-2 rounded-md text-sm font-medium transition-colors h-full flex items-center"
              >
                Projects
              </Link>
            </div>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-3 h-full">
            {user ? (
              <>
                {isAdmin() && (
                  <Link
                    to="/admin"
                    className="text-primary-blue hover:text-primary-green px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="text-primary-blue hover:text-primary-green px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/dashboard/profile"
                  className="text-primary-blue hover:text-primary-green px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Profile
                </Link>
                <span className="text-gray-700 text-sm font-medium">Hello, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-primary-green hover:bg-primary-green/90 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm hover:shadow-md h-9 flex items-center"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-primary-blue hover:text-primary-green px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-green hover:bg-primary-green/90 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm hover:shadow-md"
                >
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
              <Link
                to="/"
                onClick={closeMobileMenu}
                className="text-primary-blue hover:text-primary-green px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                to="/projects"
                onClick={closeMobileMenu}
                className="text-primary-blue hover:text-primary-green px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Projects
              </Link>
              {user ? (
                <>
                  {isAdmin() && (
                    <Link
                      to="/admin"
                      onClick={closeMobileMenu}
                      className="text-primary-blue hover:text-primary-green px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    to="/dashboard"
                    onClick={closeMobileMenu}
                    className="text-primary-blue hover:text-primary-green px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/dashboard/profile"
                    onClick={closeMobileMenu}
                    className="text-primary-blue hover:text-primary-green px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Profile
                  </Link>
                  <div className="px-3 py-2 text-sm text-gray-700">
                    Hello, {user.name}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-primary-green hover:bg-primary-green/90 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="text-primary-blue hover:text-primary-green px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="bg-primary-green hover:bg-primary-green/90 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors text-left"
                  >
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
