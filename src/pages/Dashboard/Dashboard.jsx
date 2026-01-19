import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ordersAPI, supportAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import {
  ShoppingCart,
  FileText,
  MessageSquare,
  Package,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  Clock,
  Search
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    downloadedProjects: 0,
    activeSupport: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch orders and support requests in parallel
      const [ordersRes, supportRes] = await Promise.all([
        ordersAPI.getUserOrders().catch(() => ({ data: { orders: [] } })),
        supportAPI.getUserRequests().catch(() => ({ data: { supportRequests: [] } }))
      ]);

      const orders = ordersRes.data?.orders || [];
      const completedOrders = orders.filter(order => order.status === 'completed');
      
      // Count downloaded projects (completed orders with items)
      const downloadedProjects = completedOrders.reduce((count, order) => {
        return count + (order.items?.length || 0);
      }, 0);

      // Count active support requests (open or in_progress)
      const activeSupport = (supportRes.data?.supportRequests || []).filter(
        req => req.status === 'open' || req.status === 'in_progress'
      ).length;

      setStats({
        totalOrders: orders.length,
        downloadedProjects,
        activeSupport
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-primary-blue to-primary-blue-light text-white -mt-24 md:-mt-28 pt-24 md:pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Welcome back, {user?.name || 'Student'} 👋
              </h1>
              <p className="text-gray-100 text-lg">
                Manage your projects, orders, and support requests
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link
                to="/projects"
                className="inline-flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                <Search size={20} />
                <span>Browse Projects</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={ShoppingCart}
            value={stats.totalOrders}
            label="Total Orders"
            color="bg-primary-blue"
            description="All your purchases"
          />
          <StatCard
            icon={Package}
            value={stats.downloadedProjects}
            label="Downloaded Projects"
            color="bg-primary-green"
            description="Projects you own"
          />
          <StatCard
            icon={MessageSquare}
            value={stats.activeSupport}
            label="Active Support"
            color="bg-primary-blue-light"
            description="Open requests"
          />
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ActionCard
            icon={ShoppingCart}
            title="My Orders"
            description="View your purchase history and download purchased projects"
            actionText="View Orders"
            actionLink="/dashboard/orders"
            color="from-primary-blue to-primary-blue-light"
            stat={stats.totalOrders > 0 ? `${stats.totalOrders} orders` : 'No orders yet'}
          />
          
          <ActionCard
            icon={MessageSquare}
            title="Support Requests"
            description="Manage your support requests and track their status"
            actionText="Manage Support"
            actionLink="/dashboard/support"
            color="from-primary-blue-light to-primary-blue"
            stat={stats.activeSupport > 0 ? `${stats.activeSupport} active` : 'No active requests'}
            badge={stats.activeSupport > 0 ? stats.activeSupport : null}
          />
          
          <ActionCard
            icon={Search}
            title="Browse Projects"
            description="Discover new projects with complete documentation and source code"
            actionText="Browse Now"
            actionLink="/projects"
            color="from-primary-green to-primary-green"
            stat="Explore catalog"
            highlight={true}
          />
        </div>

        {/* Quick Actions */}
        {stats.totalOrders > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-primary-blue mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <QuickActionCard
                title="Download Latest Project"
                description="Get your most recent purchase"
                link="/dashboard/orders"
                icon={Package}
              />
              <QuickActionCard
                title="Request Support"
                description="Need help with a project?"
                link="/dashboard/support"
                icon={MessageSquare}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, value, label, color, description }) => (
  <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <p className="text-3xl font-bold text-primary-blue mb-1">{value}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <div className={`${color} p-4 rounded-xl`}>
        <Icon className="text-white" size={28} />
      </div>
    </div>
  </div>
);

// Action Card Component
const ActionCard = ({ 
  icon: Icon, 
  title, 
  description, 
  actionText, 
  actionLink, 
  color,
  stat,
  badge,
  highlight = false
}) => (
  <div className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-2 ${
    highlight ? 'border-primary-green' : 'border-gray-100 hover:border-primary-blue/30'
  } overflow-hidden`}>
    <div className={`bg-gradient-to-br ${color} p-6 text-white`}>
      <div className="flex items-center justify-between mb-4">
        <Icon size={32} />
        {badge && (
          <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-xl font-bold mb-1">{title}</h3>
      <p className="text-white/90 text-sm">{stat}</p>
    </div>
    <div className="p-6">
      <p className="text-gray-600 mb-4 text-sm leading-relaxed">{description}</p>
      <Link
        to={actionLink}
        className="inline-flex items-center space-x-2 w-full justify-center bg-primary-blue hover:bg-primary-blue-light text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        <span>{actionText}</span>
        <ArrowRight size={18} />
      </Link>
    </div>
  </div>
);

// Quick Action Card Component
const QuickActionCard = ({ title, description, link, icon: Icon }) => (
  <Link
    to={link}
    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-6 border border-gray-100 hover:border-primary-blue/30 group"
  >
    <div className="flex items-center space-x-4">
      <div className="bg-primary-blue/10 p-3 rounded-lg group-hover:bg-primary-blue/20 transition-colors">
        <Icon className="text-primary-blue" size={24} />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-primary-blue mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <ArrowRight className="text-gray-400 group-hover:text-primary-blue group-hover:translate-x-1 transition-all" size={20} />
    </div>
  </Link>
);

export default Dashboard;
