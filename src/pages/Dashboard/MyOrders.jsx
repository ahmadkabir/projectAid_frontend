import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ordersAPI,
  downloadProjectFile,
  downloadWatermarkedPdf,
  fetchWatermarkedPdfUrl
} from '../../services/api';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/admin/Pagination';
import toast from 'react-hot-toast';
import {
  ShoppingCart,
  Download,
  Package,
  CheckCircle,
  Clock,
  ArrowLeft,
  Calendar,
  Lock,
  Eye,
  FileText,
  CreditCard,
  X,
  Loader2
} from 'lucide-react';

const PAGE_SIZE = 5;

const itemTypeLabel = (itemType) => {
  if (itemType === 'documentation') return 'Documentation';
  if (itemType === 'software') return 'Software';
  if (itemType === 'full') return 'Full project (documentation + software)';
  return itemType;
};

const fileLabel = (file) => {
  if (file.category === 'software') return `Software installer (${file.fileType?.toUpperCase() || 'ZIP'})`;
  if (file.category === 'guide') return `User guide (${file.fileType?.toUpperCase() || 'PDF'})`;
  return `Documentation (${file.fileType?.toUpperCase() || 'PDF'})`;
};

const isPdfViewable = (file) => file.category !== 'software';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [viewer, setViewer] = useState(null);
  const [openingFileId, setOpeningFileId] = useState(null);
  const [payingOrderId, setPayingOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Release the PDF object URL when the viewer closes or the page unmounts.
  useEffect(() => () => {
    if (viewer?.url) window.URL.revokeObjectURL(viewer.url);
  }, [viewer]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getUserOrders();
      setOrders(response.data.orders || []);
      setPage(1);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async (orderId) => {
    setPayingOrderId(orderId);
    try {
      const response = await ordersAPI.initializePayment(orderId);
      if (!response.data.authorizationUrl) {
        throw new Error('Paystack did not return a checkout URL');
      }
      sessionStorage.setItem('paymentReturnTo', '/dashboard/orders');
      window.location.assign(response.data.authorizationUrl);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Unable to start payment');
      setPayingOrderId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedOrders = useMemo(
    () => orders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [orders, currentPage]
  );

  const openViewer = async (file, title) => {
    try {
      setOpeningFileId(file.id);
      const url = await fetchWatermarkedPdfUrl(file);
      if (!url) return;
      setViewer((existing) => {
        if (existing?.url) window.URL.revokeObjectURL(existing.url);
        return { url, title, file };
      });
    } finally {
      setOpeningFileId(null);
    }
  };

  const closeViewer = () => {
    setViewer((existing) => {
      if (existing?.url) window.URL.revokeObjectURL(existing.url);
      return null;
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-primary-blue-light/10 text-primary-blue-light', icon: Clock },
      completed: { color: 'bg-primary-green/10 text-primary-green', icon: CheckCircle },
      failed: { color: 'bg-gray-100 text-gray-800', icon: Package }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <Icon size={14} />
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  if (loading) return <Loading />;

  return (
    <div className="bg-gray-50">
      <div className="bg-gradient-to-r from-primary-blue to-primary-blue-light text-white -mt-24 md:-mt-28 pt-24 md:pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
              <ShoppingCart size={32} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">My Orders</h1>
              <p className="text-gray-100">View your purchase history and download the files you bought</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="text-gray-400" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-primary-blue mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">You haven't made any purchases yet.</p>
            <Link
              to="/projects"
              className="inline-flex items-center space-x-2 bg-primary-green hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              <span>Browse Projects</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {pagedOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h2 className="text-xl font-bold text-primary-blue">Order #{order.id}</h2>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar size={16} />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="text-2xl font-bold text-primary-blue">
                            ₦{parseFloat(order.totalAmount || 0).toFixed(2)}
                          </p>
                        </div>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handlePayNow(order.id)}
                            disabled={payingOrderId === order.id}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary-green px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-wait disabled:opacity-70"
                          >
                            {payingOrderId === order.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <CreditCard size={16} />
                            )}
                            Pay now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-primary-blue mb-4">Items</h3>
                    <div className="space-y-4">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 md:flex-row md:items-center md:justify-between"
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className="bg-primary-blue/10 p-2 rounded-lg">
                                  <Package className="text-primary-blue" size={20} />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-primary-blue">
                                    {item.project?.title || 'Project'}
                                  </h4>
                                  <p className="text-sm text-gray-600">{itemTypeLabel(item.itemType)}</p>
                                </div>
                              </div>
                              <p className="text-sm text-gray-500 ml-11">
                                {item.project?.description?.substring(0, 100)}...
                              </p>
                            </div>

                            <div className="flex items-start gap-4 md:items-center">
                              <div className="text-right">
                                <p className="text-sm text-gray-600">Price</p>
                                <p className="font-bold text-primary-blue">₦{parseFloat(item.price || 0).toFixed(2)}</p>
                              </div>

                              {order.status === 'completed' ? (
                                <div className="flex flex-col gap-2">
                                  {(item.downloadableFiles || []).length === 0 && (
                                    <span className="text-sm text-gray-500">No files available</span>
                                  )}
                                  {(item.downloadableFiles || []).map((file) => (
                                    <div key={file.id} className="flex flex-col gap-1">
                                      <span className="text-xs font-semibold text-gray-500">
                                        {fileLabel(file)}
                                      </span>
                                      <div className="flex flex-wrap items-center gap-2">
                                        {isPdfViewable(file) && (
                                          <>
                                            <button
                                              onClick={() => openViewer(file, item.project?.title)}
                                              disabled={openingFileId === file.id}
                                              className="inline-flex items-center space-x-2 bg-white border-2 border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-wait"
                                            >
                                              {openingFileId === file.id ? (
                                                <Loader2 size={16} className="animate-spin" />
                                              ) : (
                                                <Eye size={16} />
                                              )}
                                              <span>View PDF</span>
                                            </button>
                                            <button
                                              onClick={() => downloadWatermarkedPdf(file, item.project?.title)}
                                              className="inline-flex items-center space-x-2 bg-primary-green hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                                            >
                                              <FileText size={16} />
                                              <span>Download PDF</span>
                                            </button>
                                          </>
                                        )}
                                        <button
                                          onClick={() => downloadProjectFile(file)}
                                          className="inline-flex items-center space-x-2 bg-primary-blue hover:bg-primary-blue-light text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                                        >
                                          <Download size={16} />
                                          <span>{file.category === 'software' ? 'Download' : 'Original file'}</span>
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-2 text-sm text-gray-500">
                                  <Lock size={16} /> Unlocks after payment
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">No items in this order</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                total={orders.length}
                limit={PAGE_SIZE}
                onPageChange={setPage}
                label="orders"
              />
            </div>
          </>
        )}
      </div>

      {viewer && (
        <div className="fixed inset-0 z-50 bg-black/60 p-3 sm:p-6 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-gray-200">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Watermarked preview</p>
                <h2 className="font-bold text-primary-blue truncate">{viewer.title || 'Document'}</h2>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => downloadWatermarkedPdf(viewer.file, viewer.title)}
                  className="inline-flex items-center space-x-2 bg-primary-green hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Download PDF</span>
                </button>
                <button
                  onClick={closeViewer}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                  aria-label="Close preview"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <iframe
              src={viewer.url}
              title={`PDF preview of ${viewer.title || 'document'}`}
              className="flex-1 w-full border-0 bg-gray-100"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
