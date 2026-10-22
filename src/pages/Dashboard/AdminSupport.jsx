import { useState, useEffect } from 'react';
import { supportAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import StatusBadge from '../../components/admin/StatusBadge';
import { useAdminPage } from '../../app/admin/layout/adminPageContext';
import toast from 'react-hot-toast';

const AdminSupport = () => {
  const { setAdminPage } = useAdminPage() || {};
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  // Publish the dynamic record count to the AdminLayout header
  useEffect(() => {
    if (!setAdminPage) return;
    setAdminPage('Support', loading
      ? 'Loading requests…'
      : `${requests.length} request${requests.length === 1 ? '' : 's'} found`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests, loading, setAdminPage]);

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

  if (loading) return <Loading />;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {requests.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-admin-muted text-lg">No support requests found.</p>
            </div>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className={`card cursor-pointer transition-all ${
                  selectedRequest?.id === request.id ? 'ring-2 ring-admin-blue' : 'hover:shadow-md'
                }`}
                onClick={() => {
                  setSelectedRequest(request);
                  setResponseText(request.adminResponse || '');
                }}
              >
                <div className="flex justify-between items-start mb-2 gap-3">
                  <h3 className="text-base font-bold text-admin-text">{request.subject}</h3>
                  <StatusBadge status={request.status} />
                </div>
                <p className="text-admin-muted text-sm mb-1">
                  From: {request.user?.name} ({request.user?.email})
                </p>
                <p className="text-admin-muted text-sm mb-2">
                  Project: {request.project?.title}
                </p>
                <p className="text-admin-text text-sm line-clamp-2">{request.message}</p>
                {request.adminResponse && (
                  <div className="mt-2 text-sm font-medium text-admin-success">
                    ✓ Responded
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {selectedRequest && (
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h2 className="text-lg font-bold mb-4 text-admin-text">Request Details</h2>
              
              <div className="mb-4">
                <p className="admin-label">User</p>
                <p className="font-semibold text-admin-text">{selectedRequest.user?.name}</p>
                <p className="text-sm text-admin-muted">{selectedRequest.user?.email}</p>
              </div>

              <div className="mb-4">
                <p className="admin-label">Project</p>
                <p className="font-semibold text-admin-text">{selectedRequest.project?.title}</p>
              </div>

              <div className="mb-4">
                <p className="admin-label">Subject</p>
                <p className="font-semibold text-admin-text">{selectedRequest.subject}</p>
              </div>

              <div className="mb-4">
                <p className="admin-label">Message</p>
                <p className="text-admin-text text-sm whitespace-pre-wrap bg-admin-bg p-3 rounded-xl border border-admin-border">
                  {selectedRequest.message}
                </p>
              </div>

              {selectedRequest.adminResponse && (
                <div className="mb-4">
                  <p className="admin-label">Previous Response</p>
                  <p className="text-admin-text text-sm whitespace-pre-wrap bg-admin-success/10 p-3 rounded-xl border border-admin-success/20">
                    {selectedRequest.adminResponse}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label className="admin-label" htmlFor="admin-response">Admin Response</label>
                <textarea
                  id="admin-response"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="admin-input"
                  rows="4"
                  placeholder="Enter your response..."
                />
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleRespond}
                  className="admin-btn w-full"
                >
                  Send Response
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'in_progress')}
                    className="admin-btn-ghost text-xs"
                  >
                    Mark In Progress
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'closed')}
                    className="admin-btn-ghost text-xs"
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
