import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';
import {
  ShoppingCart,
  Download,
  FileText,
  Package,
  CheckCircle,
  Clock,
  ArrowLeft,
  Calendar
} from 'lucide-react';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getUserOrders();
      setOrders(response.data.orders);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (filename, type, isDirectPath = false) => {
    if (!filename) return;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';
    const normalized = filename.startsWith('/') ? filename.slice(1) : filename;
    const url = isDirectPath ? `${baseUrl}/${normalized}` : `${baseUrl}/uploads/${type}/${filename}`;
    window.open(url, '_blank');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
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
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: Package }
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
      {/* Header */}
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
              <p className="text-gray-100">View your purchase history and download projects</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
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
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h2 className="text-xl font-bold text-primary-blue">
                          Order #{order.id}
                        </h2>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar size={16} />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-2xl font-bold text-primary-blue">
                        ₦{parseFloat(order.totalAmount || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-primary-blue mb-4">Items</h3>
                  <div className="space-y-4">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
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
                                <p className="text-sm text-gray-600 capitalize">
                                  {item.itemType?.replace('_', ' ')}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 ml-11">
                              {item.project?.description?.substring(0, 100)}...
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Price</p>
                              <p className="font-bold text-primary-blue">
                                ₦{parseFloat(item.price || 0).toFixed(2)}
                              </p>
                            </div>
                            {order.status === 'completed' && (
                              <div className="flex flex-col gap-2">
                                {item.itemType === 'documentation' && (
                                  <div className="flex flex-col gap-2">
                                    {item.project?.documentationFile && (
                                      <button
                                        onClick={() => downloadFile(item.project.documentationFile, 'documentation')}
                                        className="inline-flex items-center space-x-2 bg-primary-green hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                                      >
                                        <Download size={16} />
                                        <span>Download Docs</span>
                                      </button>
                                    )}
                                    {(item.project?.documentFiles || []).map((file) => (
                                      <button
                                        key={file.id}
                                        onClick={() => downloadFile(file.filePath, null, true)}
                                        className="inline-flex items-center space-x-2 bg-primary-blue hover:bg-primary-blue-light text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                                      >
                                        <Download size={16} />
                                        <span>{file.fileType?.toUpperCase()}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                                {item.itemType === 'software' && item.project?.softwareFile && (
                                  <button
                                    onClick={() => downloadFile(item.project.softwareFile, 'software')}
                                    className="inline-flex items-center space-x-2 bg-primary-blue hover:bg-primary-blue-light text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                                  >
                                    <Download size={16} />
                                    <span>Download Code</span>
                                  </button>
                                )}
                                {item.itemType === 'full_project' && (
                                  <div className="flex flex-col gap-2">
                                    {item.project?.documentationFile && (
                                      <button
                                        onClick={() => downloadFile(item.project.documentationFile, 'documentation')}
                                        className="inline-flex items-center space-x-2 bg-primary-green hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                                      >
                                        <Download size={16} />
                                        <span>Docs</span>
                                      </button>
                                    )}
                                    {(item.project?.documentFiles || []).map((file) => (
                                      <button
                                        key={file.id}
                                        onClick={() => downloadFile(file.filePath, null, true)}
                                        className="inline-flex items-center space-x-2 bg-primary-blue hover:bg-primary-blue-light text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                                      >
                                        <Download size={16} />
                                        <span>{file.fileType?.toUpperCase()}</span>
                                      </button>
                                    ))}
                                    {item.project?.softwareFile && (
                                      <button
                                        onClick={() => downloadFile(item.project.softwareFile, 'software')}
                                        className="inline-flex items-center space-x-2 bg-primary-blue hover:bg-primary-blue-light text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                                      >
                                        <Download size={16} />
                                        <span>Code</span>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
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
        )}
      </div>
    </div>
  );
};

export default MyOrders;
