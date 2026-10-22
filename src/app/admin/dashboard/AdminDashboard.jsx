import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  MessageSquare,
  CalendarDays,
  RefreshCw,
  ArrowUpRight,
  Clock,
  CheckCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const { setAdminPage } = useAdminPage() || {};
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  const fetchAnalytics = async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await analyticsAPI.getDashboard({ dateRange });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      if (silent) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  if (loading) return <Loading />;

  const metrics = [
    {
      title: 'Total Users',
      value: analytics?.totalUsers || 0,
      icon: Users,
      accent: { bg: 'bg-admin-blue/10', fg: 'text-admin-blue' },
      bar: 'from-admin-blue to-admin-blue-hover',
      change: analytics?.userGrowth || 0,
      trend: 'up'
    },
    {
      title: 'Total Projects',
      value: analytics?.totalProjects || 0,
      icon: FolderKanban,
      accent: { bg: 'bg-admin-blue-hover/10', fg: 'text-admin-blue-hover' },
      bar: 'from-admin-blue-hover to-[#7FD3E8]',
      change: analytics?.projectGrowth || 0,
      trend: 'up'
    },
    {
      title: 'Total Orders',
      value: analytics?.totalOrders || 0,
      icon: ShoppingCart,
      accent: { bg: 'bg-admin-pending/10', fg: 'text-admin-pending' },
      bar: 'from-admin-pending to-[#E8AAAA]',
      change: analytics?.orderGrowth || 0,
      trend: 'up'
    },
    {
      title: 'Total Revenue',
      value: `₦${analytics?.totalRevenue?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      accent: { bg: 'bg-admin-success/10', fg: 'text-admin-success' },
      bar: 'from-admin-success to-[#A6D96A]',
      change: analytics?.revenueGrowth || 0,
      trend: 'up'
    }
  ];

  const support = analytics?.supportStats || {};
  const openSupport = support.open || 0;
  const inProgressSupport = support.inProgress || 0;
  const resolvedSupport = support.resolved || 0;
  const totalSupport = openSupport + inProgressSupport + resolvedSupport;
  const resolvedPercent = totalSupport
    ? Math.round((resolvedSupport / totalSupport) * 100)
    : 0;

  return (
    <div className="space-y-5">
      {/* Control bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-admin-muted">
            Performance
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-admin-text">Overview</h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <CalendarDays
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted"
            />
            <label className="sr-only" htmlFor="dashboard-range">Date range</label>
            <select
              id="dashboard-range"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="admin-input w-auto py-2.5 pl-9 pr-8"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            title="Refresh analytics"
            aria-label="Refresh analytics"
            className="admin-btn-ghost h-[42px] w-[42px] px-0"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-admin-text">Revenue trend</h2>
              <p className="mt-0.5 text-xs text-admin-muted">
                Daily revenue for the selected period
              </p>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-admin-blue/10 text-admin-blue">
              <TrendingUp size={17} />
            </span>
          </div>
          <div className="mt-5">
            <RevenueChart data={analytics?.revenueData || []} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-admin-text">Orders overview</h2>
              <p className="mt-0.5 text-xs text-admin-muted">Orders placed and completed</p>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-admin-success/10 text-admin-success">
              <ShoppingCart size={17} />
            </span>
          </div>
          <div className="mt-5">
            <OrdersChart data={analytics?.ordersData || []} />
          </div>
        </div>
      </div>

      {/* Projects & recent orders */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-admin-text">Top projects</h2>
              <p className="mt-0.5 text-xs text-admin-muted">Most purchased projects</p>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-admin-blue/10 text-admin-blue">
              <FolderKanban size={17} />
            </span>
          </div>
          <div className="mt-5">
            <ProjectsChart data={analytics?.topProjects || []} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-admin-text">Recent orders</h2>
              <p className="mt-0.5 text-xs text-admin-muted">Latest activity from customers</p>
            </div>
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-1.5 rounded-full border border-admin-border bg-white px-3 py-1.5 text-xs font-semibold text-admin-text transition-colors hover:bg-admin-bg"
            >
              View all
              <ArrowUpRight size={13} />
            </Link>
          </div>
          <div className="mt-4">
            <RecentOrders orders={analytics?.recentOrders || []} />
          </div>
        </div>
      </div>

      {/* Support pulse */}
      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-admin-text">Support pulse</h2>
            <p className="mt-0.5 text-xs text-admin-muted">
              Open, in-progress, and resolved conversations
            </p>
          </div>
          <Link
            to="/admin/support"
            className="inline-flex items-center gap-1.5 rounded-full border border-admin-border bg-white px-3 py-1.5 text-xs font-semibold text-admin-text transition-colors hover:bg-admin-bg"
          >
            Open inbox
            <ArrowUpRight size={13} />
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SupportStat
            label="Open"
            value={openSupport}
            icon={MessageSquare}
            tone="bg-admin-blue/10 text-admin-blue"
          />
          <SupportStat
            label="In progress"
            value={inProgressSupport}
            icon={Clock}
            tone="bg-admin-pending/10 text-admin-pending"
          />
          <SupportStat
            label="Resolved"
            value={resolvedSupport}
            icon={CheckCircle}
            tone="bg-admin-success/10 text-admin-success"
          />
        </div>

        <div className="mt-5">
          <div className="flex h-2 overflow-hidden rounded-full bg-admin-bg">
            {totalSupport > 0 ? (
              <>
                <span
                  className="h-full bg-admin-blue"
                  style={{ width: `${(openSupport / totalSupport) * 100}%` }}
                />
                <span
                  className="h-full bg-admin-pending"
                  style={{ width: `${(inProgressSupport / totalSupport) * 100}%` }}
                />
                <span
                  className="h-full bg-admin-success"
                  style={{ width: `${(resolvedSupport / totalSupport) * 100}%` }}
                />
              </>
            ) : (
              <span className="h-full w-full bg-admin-border" />
            )}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-admin-muted">
            <span>{totalSupport} total requests</span>
            <span>{resolvedPercent}% resolved</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const SupportStat = ({ label, value, icon: Icon, tone }) => (
  <div className="flex items-center gap-3 rounded-2xl border border-admin-border/70 bg-admin-bg/40 px-3.5 py-3">
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone}`}>
      <Icon size={16} />
    </span>
    <div>
      <p className="text-xs font-medium text-admin-muted">{label}</p>
      <p className="text-xl font-bold tracking-tight text-admin-text">{value}</p>
    </div>
  </div>
);

export default AdminDashboard;
