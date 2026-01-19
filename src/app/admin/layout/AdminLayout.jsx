import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
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
  User
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/projects', icon: FolderKanban, label: 'Projects' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/support', icon: MessageSquare, label: 'Support' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white h-16 flex items-center justify-between px-4 shadow-md">
        <div className="flex items-center space-x-3 h-full">
          <img 
            src={logo} 
            alt="ProjectAid Logo" 
            className="h-10 w-auto max-h-10 object-contain"
            onError={(e) => {
              console.error('Logo failed to load');
              e.target.style.display = 'none';
            }}
          />
          <span className="text-sm text-primary-teal font-medium">Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-800 rounded transition-colors"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gray-900 text-white transition-transform duration-300 z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 w-64 shadow-lg`}
        style={{ height: '100vh' }}
      >
        <div className="flex flex-col h-full">
          {/* Logo - Centered */}
          <div className="p-5 border-b border-gray-800">
            <div className="flex flex-col items-center justify-center">
              <img 
                src={logo} 
                alt="ProjectAid Logo" 
                className="h-10 w-auto max-h-10 object-contain"
                onError={(e) => {
                  console.error('Logo failed to load');
                  e.target.style.display = 'none';
                }}
              />
              <p className="text-xs text-primary-teal mt-2 font-medium">Admin Panel</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                        isActive(item.path)
                          ? 'bg-gray-800 text-white shadow-sm'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer Actions */}
          <div className="p-3 border-t border-gray-800 space-y-1">
            <Link
              to="/"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors text-sm"
            >
              <Home size={18} />
              <span>View Site</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-red-600/80 hover:text-white transition-colors text-sm"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Top Navbar - Full Width */}
      <div className="fixed top-0 left-0 right-0 lg:left-64 w-full lg:w-[calc(100%-16rem)] h-16 bg-gray-900 text-white shadow-md z-30">
        <div className="w-full h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-white hidden sm:block">Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex flex-col items-end">
              <p className="text-sm font-medium text-white">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-400 truncate max-w-[200px]">{user?.email}</p>
            </div>
            <div className="md:hidden">
              <div className="flex items-center space-x-2">
                <User size={20} className="text-gray-400" />
                <span className="text-sm font-medium text-white">{user?.name?.split(' ')[0] || 'Admin'}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-red-600/80 hover:text-white transition-colors text-sm"
              title="Logout"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className={`lg:ml-64 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
        <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-20">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
