import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../../services/api';
import Loading from '../../../components/common/Loading';
import MetricCard from '../../../components/ui/MetricCard';
import RevenueChart from '../../../components/charts/RevenueChart';
import OrdersChart from '../../../components/charts/OrdersChart';
import ProjectsChart from '../../../components/charts/ProjectsChart';
import RecentOrders from '../../../components/ui/RecentOrders';
import {
  Users,
  FolderKanban,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Package,
  MessageSquare
} from 'lucide-react';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d'); // 7d, 30d, 90d, all

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getDashboard({ dateRange });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  const metrics = [
    {
      title: 'Total Users',
      value: analytics?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: analytics?.userGrowth || 0,
      trend: 'up'
    },
    {
      title: 'Total Projects',
      value: analytics?.totalProjects || 0,
      icon: FolderKanban,
      color: 'bg-green-500',
      change: analytics?.projectGrowth || 0,
      trend: 'up'
    },
    {
      title: 'Total Orders',
      value: analytics?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'bg-purple-500',
      change: analytics?.orderGrowth || 0,
      trend: 'up'
    },
    {
      title: 'Total Revenue',
      value: `₦${analytics?.totalRevenue?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'bg-primary-green',
      change: analytics?.revenueGrowth || 0,
      trend: 'up'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-blue">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold text-primary-blue mb-4">Revenue Trend</h2>
          <RevenueChart data={analytics?.revenueData || []} />
        </div>
        <div className="card">
          <h2 className="text-xl font-bold text-primary-blue mb-4">Orders Overview</h2>
          <OrdersChart data={analytics?.ordersData || []} />
        </div>
      </div>

      {/* Projects & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold text-primary-blue mb-4">Top Projects</h2>
          <ProjectsChart data={analytics?.topProjects || []} />
        </div>
        <div className="card">
          <h2 className="text-xl font-bold text-primary-blue mb-4">Recent Orders</h2>
          <RecentOrders orders={analytics?.recentOrders || []} />
        </div>
      </div>

      {/* Support Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Open Support</p>
              <p className="text-3xl font-bold text-primary-blue mt-2">
                {analytics?.supportStats?.open || 0}
              </p>
            </div>
            <div className="p-3 bg-primary-blue/10 rounded-full">
              <MessageSquare className="text-primary-blue" size={24} />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-primary-blue-light mt-2">
                {analytics?.supportStats?.inProgress || 0}
              </p>
            </div>
            <div className="p-3 bg-primary-blue-light/10 rounded-full">
              <TrendingUp className="text-primary-blue-light" size={24} />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Resolved</p>
              <p className="text-3xl font-bold text-primary-green mt-2">
                {analytics?.supportStats?.resolved || 0}
              </p>
            </div>
            <div className="p-3 bg-primary-green/10 rounded-full">
              <Package className="text-primary-green" size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
