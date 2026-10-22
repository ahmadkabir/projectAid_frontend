import { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import StatusBadge from '../../components/admin/StatusBadge';
import { useAdminPage } from '../../app/admin/layout/adminPageContext';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const { setAdminPage } = useAdminPage() || {};
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Publish the dynamic record count to the AdminLayout header
  useEffect(() => {
    if (!setAdminPage) return;
    setAdminPage('Users', loading ? 'Loading users…' : `${users.length} user${users.length === 1 ? '' : 's'} found`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, loading, setAdminPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data.users);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await usersAPI.delete(id);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-5">
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table min-w-[720px]">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Role</th>
                <th scope="col">Joined</th>
                <th scope="col" className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-14 text-admin-muted">
                    <p className="font-medium text-admin-text">No users found</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="font-semibold text-admin-text">{user.name}</td>
                    <td className="text-admin-muted">{user.email}</td>
                    <td>
                      <StatusBadge status={user.role} />
                    </td>
                    <td className="text-admin-muted whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg text-admin-pending hover:bg-admin-pending/10 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
