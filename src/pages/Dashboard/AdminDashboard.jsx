import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary-blue">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/admin/projects" className="card hover:scale-105 transition-transform">
          <div className="text-4xl mb-4">📚</div>
          <h2 className="text-xl font-bold mb-2 text-primary-blue">Projects</h2>
          <p className="text-gray-600">Manage projects</p>
        </Link>

        <Link to="/admin/orders" className="card hover:scale-105 transition-transform">
          <div className="text-4xl mb-4">📦</div>
          <h2 className="text-xl font-bold mb-2 text-primary-blue">Orders</h2>
          <p className="text-gray-600">View all orders</p>
        </Link>

        <Link to="/admin/users" className="card hover:scale-105 transition-transform">
          <div className="text-4xl mb-4">👥</div>
          <h2 className="text-xl font-bold mb-2 text-primary-blue">Users</h2>
          <p className="text-gray-600">Manage users</p>
        </Link>

        <Link to="/admin/support" className="card hover:scale-105 transition-transform">
          <div className="text-4xl mb-4">🛠️</div>
          <h2 className="text-xl font-bold mb-2 text-primary-blue">Support</h2>
          <p className="text-gray-600">Handle support requests</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
