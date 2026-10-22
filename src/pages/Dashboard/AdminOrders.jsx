import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ordersAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import UserAvatar from '../../components/common/UserAvatar';
import StatusBadge from '../../components/admin/StatusBadge';
import Pagination from '../../components/admin/Pagination';
import { useAdminPage } from '../../app/admin/layout/adminPageContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Search, Calendar, Eye, X, MoreHorizontal, RotateCcw } from 'lucide-react';

const formatCurrency = (value) => {
  const amount = parseFloat(value || 0);
  return `₦${amount.toFixed(2)}`;
};

const STATUS_TABS = [
  { value: 'all', label: 'All orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' }
];

// Compact per-row action dropdown (orders currently support viewing details).
const RowMenu = ({ onView }) => {
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
        className="p-2 rounded-lg hover:bg-admin-bg text-admin-muted hover:text-admin-text transition-colors"
        aria-label="Order actions"
        aria-expanded={open}
      >
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl border border-admin-border shadow-lg py-1 z-[100]">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onView();
            }}
            className="w-full px-4 py-2.5 text-left text-sm text-admin-text hover:bg-admin-bg flex items-center gap-2.5 transition-colors"
          >
            <Eye size={16} className="text-admin-muted" />
            View details
          </button>
        </div>
      )}
    </div>
  );
};

const AdminOrders = () => {
  const { setAdminPage } = useAdminPage() || {};
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [fetching, setFetching] = useState(false);

  const limit = 10;

  const fetchOrders = useCallback(async () => {
    try {
      setFetching(true);
      const response = await ordersAPI.getAllOrders({
        page,
        limit,
        search: search.trim() || undefined,
        status: statusTab !== 'all' ? statusTab : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });

      if (response.data?.success) {
        setOrders(response.data.orders || []);
        setTotal(response.data.total || 0);
      } else {
        setOrders([]);
        setTotal(0);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load orders');
      setOrders([]);
      setTotal(0);
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, [page, limit, search, statusTab, startDate, endDate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Publish the dynamic record count to the AdminLayout header
  useEffect(() => {
    if (!setAdminPage) return;
    setAdminPage('Orders', loading ? 'Loading orders…' : `${total} order${total === 1 ? '' : 's'} found`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, loading, setAdminPage]);

  const handleStatusTab = (value) => {
    setStatusTab(value);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleDateChange = (field, value) => {
    // Reject invalid ranges instead of firing a bad request
    if (field === 'start' && value && endDate && value > endDate) {
      return toast.error('Start date must be on or before the end date');
    }
    if (field === 'end' && value && startDate && value < startDate) {
      return toast.error('End date must be on or before the start date');
    }

    if (field === 'start') setStartDate(value);
    else setEndDate(value);
    setPage(1);
  };

  const resetFilters = () => {
    setSearch('');
    setStatusTab('all');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const totalPages = useMemo(() => Math.ceil(total / limit) || 1, [total]);

  if (loading) return <Loading />;

  return (
    <div className="space-y-5">
      {/* Status tabs + filters */}
      <div className="card p-4 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div className="space-y-1.5">
          <span className="admin-label">Order status</span>
          <div className="inline-flex flex-wrap items-center gap-1 bg-admin-bg rounded-xl p-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleStatusTab(tab.value)}
                aria-pressed={statusTab === tab.value}
                className={`admin-tab ${statusTab === tab.value ? 'admin-tab-active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="space-y-1.5">
            <label className="admin-label" htmlFor="orders-search">Search</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted pointer-events-none" />
              <input
                id="orders-search"
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Project, email, transaction ID"
                className="admin-input pl-9 sm:w-64"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="admin-label" htmlFor="orders-start-date">Start date</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted pointer-events-none" />
              <input
                id="orders-start-date"
                type="date"
                value={startDate}
                onChange={(e) => handleDateChange('start', e.target.value)}
                className="admin-input pl-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="admin-label" htmlFor="orders-end-date">End date</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted pointer-events-none" />
              <input
                id="orders-end-date"
                type="date"
                value={endDate}
                onChange={(e) => handleDateChange('end', e.target.value)}
                className="admin-input pl-9"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="admin-btn-ghost h-[42px]"
            title="Reset all filters"
          >
            <RotateCcw size={15} />
            Reset
          </button>
        </div>
      </div>

      {/* Orders table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table min-w-[860px]">
            <thead>
              <tr>
                <th scope="col">Order ID</th>
                <th scope="col">Customer</th>
                <th scope="col">Project</th>
                <th scope="col">Type</th>
                <th scope="col">Amount</th>
                <th scope="col">Status</th>
                <th scope="col">Order date</th>
                <th scope="col" className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-14 text-admin-muted">
                    <p className="font-medium text-admin-text">No orders found</p>
                    <p className="text-xs mt-1">Try adjusting the status tab, dates or search.</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const firstItem = order.items?.[0];
                  const orderDate = new Date(order.createdAt);
                  return (
                    <tr key={order.id}>
                      <td className="font-semibold text-admin-blue">#{order.id}</td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-full bg-admin-blue/10 flex items-center justify-center overflow-hidden shrink-0">
                            <UserAvatar user={order.user} size={32} />
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-admin-text truncate">{order.user?.name || 'N/A'}</p>
                            <p className="text-xs text-admin-muted truncate">{order.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-[220px] truncate">{firstItem?.project?.title || 'N/A'}</td>
                      <td className="capitalize">{firstItem?.itemType || 'N/A'}</td>
                      <td className="font-semibold whitespace-nowrap">{formatCurrency(order.totalAmount)}</td>
                      <td>
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="whitespace-nowrap">
                        <p>{format(orderDate, 'dd MMM yyyy')}</p>
                        <p className="text-xs text-admin-muted">{format(orderDate, 'HH:mm')}</p>
                      </td>
                      <td className="text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 rounded-lg text-admin-blue hover:bg-admin-blue/10 transition-colors"
                            aria-label={`View order #${order.id}`}
                            title="View details"
                          >
                            <Eye size={17} />
                          </button>
                          <RowMenu onView={() => setSelectedOrder(order)} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPageChange={setPage}
          label="orders"
        />
      </div>

      {/* Order details modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-admin-muted hover:text-admin-text hover:bg-admin-bg transition-colors"
              aria-label="Close order details"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-admin-text mb-1">Order Details</h2>
            <p className="text-sm text-admin-muted mb-6">Order #{selectedOrder.id}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p><span className="font-semibold text-admin-text">User:</span> {selectedOrder.user?.name} ({selectedOrder.user?.email})</p>
                <p className="flex items-center gap-2"><span className="font-semibold text-admin-text">Status:</span> <StatusBadge status={selectedOrder.status} /></p>
                <p><span className="font-semibold text-admin-text">Transaction ID:</span> {selectedOrder.transactionId || 'N/A'}</p>
                <p><span className="font-semibold text-admin-text">Date:</span> {format(new Date(selectedOrder.createdAt), 'PPpp')}</p>
              </div>
              <div className="space-y-2">
                <p><span className="font-semibold text-admin-text">Total:</span> {formatCurrency(selectedOrder.totalAmount)}</p>
                <p><span className="font-semibold text-admin-text">Payment Method:</span> {selectedOrder.paymentMethod || 'N/A'}</p>
                <p><span className="font-semibold text-admin-text">Items:</span> {selectedOrder.items?.length || 0}</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-base font-bold text-admin-text mb-3">Purchased Items</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="p-3 bg-admin-bg rounded-xl border border-admin-border">
                    <p className="font-semibold text-admin-text">{item.project?.title || 'Project removed'}</p>
                    <p className="text-xs text-admin-muted">{item.project?.category?.name || 'Uncategorized'}</p>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="capitalize">{item.itemType}</span>
                      <span className="font-semibold">{formatCurrency(item.price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
