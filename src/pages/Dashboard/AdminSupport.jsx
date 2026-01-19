import { useState, useEffect } from 'react';
import { supportAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const AdminSupport = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await supportAPI.getAllRequests();
      setRequests(response.data.supportRequests);
    } catch (error) {
      toast.error('Failed to load support requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await supportAPI.update(id, { status });
      toast.success('Status updated successfully');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleRespond = async () => {
    if (!selectedRequest || !responseText.trim()) {
      toast.error('Please enter a response');
      return;
    }

    try {
      await supportAPI.update(selectedRequest.id, {
        status: 'resolved',
        adminResponse: responseText
      });
      toast.success('Response sent successfully');
      setSelectedRequest(null);
      setResponseText('');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to send response');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'text-blue-600 bg-blue-100';
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-100';
      case 'resolved':
        return 'text-primary-green bg-green-100';
      case 'closed':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary-blue">Support Requests</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {requests.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-500 text-lg">No support requests found.</p>
            </div>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className={`card cursor-pointer hover:shadow-xl transition-shadow ${
                  selectedRequest?.id === request.id ? 'border-2 border-primary-blue' : ''
                }`}
                onClick={() => {
                  setSelectedRequest(request);
                  setResponseText(request.adminResponse || '');
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-primary-blue">{request.subject}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                    {request.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">
                  From: {request.user?.name} ({request.user?.email})
                </p>
                <p className="text-gray-600 text-sm mb-2">
                  Project: {request.project?.title}
                </p>
                <p className="text-gray-700 line-clamp-2">{request.message}</p>
                {request.adminResponse && (
                  <div className="mt-2 text-sm text-primary-green">
                    ✓ Responded
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {selectedRequest && (
          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <h2 className="text-xl font-bold mb-4 text-primary-blue">Request Details</h2>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">User:</p>
                <p className="font-semibold">{selectedRequest.user?.name}</p>
                <p className="text-sm text-gray-500">{selectedRequest.user?.email}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Project:</p>
                <p className="font-semibold">{selectedRequest.project?.title}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Subject:</p>
                <p className="font-semibold">{selectedRequest.subject}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Message:</p>
                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                  {selectedRequest.message}
                </p>
              </div>

              {selectedRequest.adminResponse && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Previous Response:</p>
                  <p className="text-gray-700 whitespace-pre-wrap bg-primary-teal p-3 rounded">
                    {selectedRequest.adminResponse}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label className="label">Admin Response</label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="input-field"
                  rows="4"
                  placeholder="Enter your response..."
                />
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleRespond}
                  className="btn-primary w-full"
                >
                  Send Response
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'in_progress')}
                    className="btn-outline text-sm"
                  >
                    Mark In Progress
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'closed')}
                    className="btn-outline text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSupport;
