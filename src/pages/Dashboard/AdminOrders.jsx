import { useState, useEffect, useMemo, useCallback } from 'react';
import { ordersAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Search, Calendar, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';

const formatCurrency = (value) => {
  const amount = parseFloat(value || 0);
  return `₦${amount.toFixed(2)}`;
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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
  }, [page, limit, search, startDate, endDate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const resetFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const totalPages = useMemo(() => Math.ceil(total / limit) || 1, [total]);

  const currentRange = useMemo(() => {
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);
    return total === 0 ? '0' : `${start}-${end}`;
  }, [page, total]);

  const renderStatusBadge = (status) => {
    const map = {
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700'
    };
    const color = map[status] || 'bg-gray-100 text-gray-700';
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${color}`}>
        {status || 'unknown'}
      </span>
    );
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-primary-blue">Orders</h1>
        <p className="text-gray-600">Manage purchases made across the platform</p>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="card p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">Search</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by project, email, transaction ID"
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">Start Date</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">End Date</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="btn-primary"
            disabled={fetching}
          >
            {fetching ? 'Searching...' : 'Apply Filters'}
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className="btn-outline"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Order ID', 'User', 'Project', 'Type', 'Amount', 'Status', 'Date', 'Actions'].map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const firstItem = order.items?.[0];
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-primary-blue">#{order.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{order.user?.name || 'N/A'}</p>
                        <p className="text-gray-500 text-xs">{order.user?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        {firstItem?.project?.title || 'N/A'}
                      </td>
                      <td className="px-4 py-3 capitalize">
                        {firstItem?.itemType || 'N/A'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        {renderStatusBadge(order.status)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {format(new Date(order.createdAt), 'PPp')}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center space-x-1 text-primary-blue hover:text-primary-green"
                        >
                          <Eye size={16} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {orders.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 text-sm text-gray-600 gap-3">
            <p>Showing {currentRange} of {total} orders</p>
            <div className="flex items-center gap-2">
              <button
                className="btn-outline flex items-center gap-1"
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <span className="font-semibold">Page {page} of {totalPages}</span>
              <button
                className="btn-outline flex items-center gap-1"
                disabled={page === totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-primary-blue"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold text-primary-blue mb-2">Order Details</h2>
            <p className="text-gray-500 mb-6">Order #{selectedOrder.id}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p><span className="font-semibold text-gray-700">User:</span> {selectedOrder.user?.name} ({selectedOrder.user?.email})</p>
                <p><span className="font-semibold text-gray-700">Status:</span> {renderStatusBadge(selectedOrder.status)}</p>
                <p><span className="font-semibold text-gray-700">Transaction ID:</span> {selectedOrder.transactionId || 'N/A'}</p>
                <p><span className="font-semibold text-gray-700">Date:</span> {format(new Date(selectedOrder.createdAt), 'PPpp')}</p>
              </div>
              <div className="space-y-2">
                <p><span className="font-semibold text-gray-700">Total:</span> {formatCurrency(selectedOrder.totalAmount)}</p>
                <p><span className="font-semibold text-gray-700">Payment Method:</span> {selectedOrder.paymentMethod || 'N/A'}</p>
                <p><span className="font-semibold text-gray-700">Items:</span> {selectedOrder.items?.length || 0}</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-primary-blue mb-3">Purchased Items</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="font-semibold text-gray-900">{item.project?.title || 'Project removed'}</p>
                    <p className="text-xs text-gray-500">{item.project?.category?.name || 'Uncategorized'}</p>
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
