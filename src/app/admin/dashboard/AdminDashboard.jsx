import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../../services/api';
import Loading from '../../../components/common/Loading';
import MetricCard from '../../../components/ui/MetricCard';
import RevenueChart from '../../../components/charts/RevenueChart';
import OrdersChart from '../../../components/charts/OrdersChart';
import ProjectsChart from '../../../components/charts/ProjectsChart';
import RecentOrders from '../../../components/ui/RecentOrders';
import { useAdminPage } from '../layout/adminPageContext';
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
  const { setAdminPage } = useAdminPage() || {};
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d'); // 7d, 30d, 90d, all

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  // Publish a dynamic subtitle to the AdminLayout header
  useEffect(() => {
    if (!setAdminPage) return;
    setAdminPage('Dashboard', loading
      ? 'Loading analytics…'
      : `${analytics?.totalUsers || 0} users · ${analytics?.totalOrders || 0} orders · ₦${(analytics?.totalRevenue || 0).toFixed(2)} revenue`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analytics, loading, setAdminPage]);

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
      accent: { bg: 'bg-admin-blue/10', fg: 'text-admin-blue' },
      change: analytics?.userGrowth || 0,
      trend: 'up'
    },
    {
      title: 'Total Projects',
      value: analytics?.totalProjects || 0,
      icon: FolderKanban,
      accent: { bg: 'bg-admin-success/10', fg: 'text-admin-success' },
      change: analytics?.projectGrowth || 0,
      trend: 'up'
    },
    {
      title: 'Total Orders',
      value: analytics?.totalOrders || 0,
      icon: ShoppingCart,
      accent: { bg: 'bg-admin-pending/10', fg: 'text-admin-pending' },
      change: analytics?.orderGrowth || 0,
      trend: 'up'
    },
    {
      title: 'Total Revenue',
      value: `₦${analytics?.totalRevenue?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      accent: { bg: 'bg-admin-success/10', fg: 'text-admin-success' },
      change: analytics?.revenueGrowth || 0,
      trend: 'up'
    }
  ];

  return (
    <div className="space-y-5">
      {/* Date range control (page title/count live in the layout header) */}
      <div className="flex justify-end">
        <label className="sr-only" htmlFor="dashboard-range">Date range</label>
        <select
          id="dashboard-range"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="admin-input w-auto"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <h2 className="text-base font-bold text-admin-text mb-4">Revenue Trend</h2>
          <RevenueChart data={analytics?.revenueData || []} />
        </div>
        <div className="card">
          <h2 className="text-base font-bold text-admin-text mb-4">Orders Overview</h2>
          <OrdersChart data={analytics?.ordersData || []} />
        </div>
      </div>

      {/* Projects & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <h2 className="text-base font-bold text-admin-text mb-4">Top Projects</h2>
          <ProjectsChart data={analytics?.topProjects || []} />
        </div>
        <div className="card">
          <h2 className="text-base font-bold text-admin-text mb-4">Recent Orders</h2>
          <RecentOrders orders={analytics?.recentOrders || []} />
        </div>
      </div>

      {/* Support Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-admin-muted">Open Support</p>
              <p className="text-3xl font-bold text-admin-text mt-2">
                {analytics?.supportStats?.open || 0}
              </p>
            </div>
            <div className="p-3 bg-admin-blue/10 rounded-xl">
              <MessageSquare className="text-admin-blue" size={24} />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-admin-muted">In Progress</p>
              <p className="text-3xl font-bold text-admin-text mt-2">
                {analytics?.supportStats?.inProgress || 0}
              </p>
            </div>
            <div className="p-3 bg-admin-pending/10 rounded-xl">
              <TrendingUp className="text-admin-pending" size={24} />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-admin-muted">Resolved</p>
              <p className="text-3xl font-bold text-admin-text mt-2">
                {analytics?.supportStats?.resolved || 0}
              </p>
            </div>
            <div className="p-3 bg-admin-success/10 rounded-xl">
              <Package className="text-admin-success" size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
