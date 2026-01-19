import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supportAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';
import {
  MessageSquare,
  Plus,
  ArrowLeft,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';

const SupportRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    projectId: '',
    orderId: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await supportAPI.getUserRequests();
      setRequests(response.data.supportRequests);
    } catch (error) {
      toast.error('Failed to load support requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await supportAPI.create(formData);
      toast.success('Support request submitted successfully');
      setShowModal(false);
      setFormData({ subject: '', message: '', projectId: '', orderId: '' });
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit support request');
    }
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

  const getStatusConfig = (status) => {
    const configs = {
      open: {
        color: 'bg-primary-blue/10 text-primary-blue border-primary-blue/20',
        icon: AlertCircle,
        label: 'Open'
      },
      in_progress: {
        color: 'bg-primary-blue-light/10 text-primary-blue-light border-primary-blue-light/20',
        icon: Clock,
        label: 'In Progress'
      },
      resolved: {
        color: 'bg-primary-green/10 text-primary-green border-primary-green/20',
        icon: CheckCircle,
        label: 'Resolved'
      },
      closed: {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: XCircle,
        label: 'Closed'
      }
    };
    return configs[status] || configs.open;
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                <MessageSquare size={32} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Support Requests</h1>
                <p className="text-gray-100">Manage your support requests and track their status</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold py-3 px-6 rounded-lg transition-all inline-flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>New Request</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {requests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="text-gray-400" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-primary-blue mb-2">No Support Requests</h2>
            <p className="text-gray-600 mb-6">You haven't submitted any support requests yet.</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center space-x-2 bg-primary-green hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              <Plus size={20} />
              <span>Create Support Request</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => {
              const statusConfig = getStatusConfig(request.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={request.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h2 className="text-xl font-bold text-primary-blue">
                            {request.subject}
                          </h2>
                          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
                            <StatusIcon size={14} />
                            <span>{statusConfig.label}</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar size={16} />
                            <span>{formatDate(request.createdAt)}</span>
                          </div>
                          {request.project && (
                            <div className="flex items-center space-x-1">
                              <FileText size={16} />
                              <span>{request.project.title}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-gray-700 whitespace-pre-wrap">{request.message}</p>
                    </div>

                    {request.response && (
                      <div className="mt-4 bg-primary-green/10 rounded-lg p-4 border border-primary-green/20">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="text-primary-green" size={18} />
                          <span className="font-semibold text-primary-green">Admin Response</span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{request.response}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Support Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-primary-blue">New Support Request</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ subject: '', message: '', projectId: '', orderId: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    placeholder="What do you need help with?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    placeholder="Describe your issue or question in detail..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ subject: '', message: '', projectId: '', orderId: '' });
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary-green hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportRequests;
