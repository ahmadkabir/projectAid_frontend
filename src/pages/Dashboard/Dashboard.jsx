import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ordersAPI, supportAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import UserAvatar from '../../components/common/UserAvatar';
import {
  ShoppingCart,
  MessageSquare,
  Package,
  ArrowRight,
  ArrowUpRight,
  Search,
  UserRound,
  Sparkles
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
      const completedOrders = orders.filter((order) => order.status === 'completed');

      // Count downloaded projects (completed orders with items)
      const downloadedProjects = completedOrders.reduce((count, order) => {
        return count + (order.items?.length || 0);
      }, 0);

      // Count active support requests (open or in_progress)
      const activeSupport = (supportRes.data?.supportRequests || []).filter(
        (req) => req.status === 'open' || req.status === 'in_progress'
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

  const firstName = user?.name?.split(' ')[0] || 'Student';
  const roleLabel = (user?.role || 'student').toLowerCase();

  return (
    <div className="min-h-screen bg-[#EEF3F8] pb-16">
      {/* Hero */}
      <section className="relative -mt-24 overflow-hidden md:-mt-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-blue via-[#0D4278] to-primary-blue-light" />
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />
        <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full border border-white/10" />
        <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full border border-white/10" />
        <div className="absolute -bottom-32 left-1/4 h-64 w-64 rounded-full bg-primary-green/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6 md:pb-28 md:pt-28 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-primary-green">
                <Sparkles size={13} />
                Dashboard
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
                Welcome back, {firstName}.
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
                Here is what is happening with your projects, orders, and support requests.
              </p>
            </div>

            <Link
              to="/projects"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-primary-blue shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
            >
              <Search size={17} />
              Browse projects
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="relative z-10 mx-auto -mt-14 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={ShoppingCart}
            value={stats.totalOrders}
            label="Total orders"
            description="All your purchases"
            to="/dashboard/orders"
            accent="from-primary-blue to-primary-blue-light"
            iconClass="bg-primary-blue/10 text-primary-blue"
          />
          <StatCard
            icon={Package}
            value={stats.downloadedProjects}
            label="Downloaded projects"
            description="Projects you own"
            to="/dashboard/orders"
            accent="from-primary-green to-[#A6D96A]"
            iconClass="bg-primary-green/15 text-[#5D9626]"
          />
          <StatCard
            icon={MessageSquare}
            value={stats.activeSupport}
            label="Active support"
            description="Open requests"
            to="/dashboard/support"
            accent="from-primary-blue-light to-primary-teal"
            iconClass="bg-primary-blue-light/10 text-primary-blue-light"
          />
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto mt-8 grid max-w-6xl grid-cols-1 gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="space-y-6 lg:col-span-2">
          {/* Workspace */}
          <section className="rounded-[1.75rem] border border-white bg-white p-5 shadow-[0_18px_50px_-30px_rgba(12,57,104,0.35)] md:p-7">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-primary-blue">Your workspace</h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  Jump back into the things you use most.
                </p>
              </div>
              <span className="hidden rounded-full bg-gray-50 px-3 py-1 text-[11px] font-semibold text-gray-500 sm:inline-flex">
                3 shortcuts
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                to="/dashboard/orders"
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-blue to-[#082744] p-5 text-white shadow-lg shadow-primary-blue/15 transition-transform hover:-translate-y-0.5"
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                    backgroundSize: '18px 18px'
                  }}
                />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                      <ShoppingCart size={18} />
                    </span>
                    <ArrowUpRight
                      size={18}
                      className="text-white/40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
                    />
                  </div>
                  <h3 className="mt-5 font-semibold">My orders</h3>
                  <p className="mt-1 text-xs leading-5 text-white/60">
                    {stats.totalOrders > 0
                      ? `${stats.totalOrders} order${stats.totalOrders === 1 ? '' : 's'} in your history`
                      : 'Your purchase history will appear here'}
                  </p>
                  <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-primary-green">
                    View orders
                  </p>
                </div>
              </Link>

              <Link
                to="/dashboard/support"
                className="group rounded-2xl border border-gray-200/80 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-primary-blue/20 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-green/10 text-[#5D9626]">
                    <MessageSquare size={18} />
                  </span>
                  {stats.activeSupport > 0 ? (
                    <span className="rounded-full bg-primary-green/10 px-2.5 py-1 text-[11px] font-bold text-[#5D9626]">
                      {stats.activeSupport} active
                    </span>
                  ) : (
                    <ArrowUpRight
                      size={18}
                      className="text-gray-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary-blue"
                    />
                  )}
                </div>
                <h3 className="mt-5 font-semibold text-primary-blue">Support requests</h3>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  {stats.activeSupport > 0
                    ? 'You have open requests waiting for a reply.'
                    : 'Need help? Start a conversation with the team.'}
                </p>
                <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-primary-blue/60">
                  Manage support
                </p>
              </Link>

              <Link
                to="/projects"
                className="group flex flex-col justify-between gap-4 rounded-2xl border border-primary-green/20 bg-primary-green/[0.06] p-5 transition-all hover:-translate-y-0.5 hover:border-primary-green/40 sm:col-span-2 sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-green text-white shadow-md shadow-primary-green/25">
                    <Search size={19} />
                  </span>
                  <div>
                    <h3 className="font-semibold text-primary-blue">Find your next project</h3>
                    <p className="mt-0.5 text-xs leading-5 text-gray-500">
                      Explore documentation, source code, and software projects.
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5D9626]">
                  Browse catalog
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            </div>
          </section>

          {/* Quick actions */}
          {stats.totalOrders > 0 && (
            <section className="rounded-[1.75rem] border border-white bg-white p-5 shadow-[0_18px_50px_-30px_rgba(12,57,104,0.35)] md:p-7">
              <h2 className="text-lg font-bold text-primary-blue">Quick actions</h2>
              <p className="mt-0.5 text-sm text-gray-500">The next steps, one click away.</p>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <QuickActionCard
                  title="Download latest project"
                  description="Get your most recent purchase"
                  link="/dashboard/orders"
                  icon={Package}
                />
                <QuickActionCard
                  title="Request support"
                  description="Need help with a project?"
                  link="/dashboard/support"
                  icon={MessageSquare}
                />
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-[1.75rem] border border-white bg-white p-5 shadow-[0_18px_50px_-30px_rgba(12,57,104,0.35)]">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary-blue/5">
                <UserAvatar user={user} size={44} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-primary-blue">
                  {user?.name || 'Student'}
                </p>
                <p className="truncate text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-[#EEF3F8] px-3 py-2.5">
              <span className="text-xs font-medium text-gray-500">Account type</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold capitalize text-primary-blue shadow-sm">
                <UserRound size={12} />
                {roleLabel}
              </span>
            </div>

            <Link
              to="/dashboard/profile"
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-semibold text-gray-600 transition-colors hover:border-primary-blue/20 hover:text-primary-blue"
            >
              Manage profile
              <ArrowUpRight size={14} />
            </Link>
          </section>

          <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-primary-blue to-[#082744] p-5 text-white shadow-xl shadow-primary-blue/20">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                backgroundSize: '18px 18px'
              }}
            />
            <div className="relative">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-green text-[#082744] shadow-md shadow-primary-green/20">
                <MessageSquare size={18} />
              </span>
              <h2 className="mt-4 text-lg font-bold">Need a hand?</h2>
              <p className="mt-1 text-sm leading-6 text-white/65">
                Send us a message and the support team will help you get unstuck.
              </p>
              <Link
                to="/dashboard/support"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-primary-blue transition-transform hover:-translate-y-0.5"
              >
                Get support
                <ArrowRight size={14} />
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, value, label, description, to, accent, iconClass }) => (
  <Link
    to={to}
    className="group relative overflow-hidden rounded-[1.5rem] border border-white bg-white p-5 shadow-[0_16px_44px_-32px_rgba(12,57,104,0.45)] transition-all hover:-translate-y-1 hover:shadow-[0_22px_50px_-30px_rgba(12,57,104,0.45)]"
  >
    <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
    <div className="flex items-start justify-between">
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}>
        <Icon size={20} />
      </span>
      <ArrowUpRight
        size={17}
        className="text-gray-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary-blue"
      />
    </div>
    <p className="mt-4 text-3xl font-bold tracking-tight text-primary-blue">{value}</p>
    <p className="mt-0.5 text-sm font-semibold text-gray-700">{label}</p>
    <p className="mt-1 text-xs text-gray-400">{description}</p>
  </Link>
);

const QuickActionCard = ({ title, description, link, icon: Icon }) => (
  <Link
    to={link}
    className="group flex items-center gap-3 rounded-2xl border border-gray-200/80 bg-gray-50/50 p-4 transition-all hover:border-primary-blue/20 hover:bg-white hover:shadow-md"
  >
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-blue/10 text-primary-blue">
      <Icon size={16} />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-semibold text-primary-blue">{title}</span>
      <span className="block text-xs text-gray-500">{description}</span>
    </span>
    <ArrowRight
      size={16}
      className="shrink-0 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-primary-blue"
    />
  </Link>
);

export default Dashboard;
