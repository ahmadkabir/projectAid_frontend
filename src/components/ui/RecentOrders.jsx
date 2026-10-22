import { Link } from 'react-router-dom';
import StatusBadge from '../admin/StatusBadge';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'N/A';
  }
};

const RecentOrders = ({ orders }) => {
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-8 text-admin-muted">
        <p>No recent orders</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="admin-table min-w-full">
        <thead>
          <tr>
            <th scope="col">Order ID</th>
            <th scope="col">User</th>
            <th scope="col">Amount</th>
            <th scope="col">Status</th>
            <th scope="col">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.slice(0, 5).map((order) => (
            <tr key={order.id}>
              <td className="font-semibold text-admin-blue whitespace-nowrap">
                <Link to="/admin/orders" className="hover:underline">
                  #{order.id}
                </Link>
              </td>
              <td className="whitespace-nowrap">{order.user?.name || 'N/A'}</td>
              <td className="whitespace-nowrap font-semibold">
                ₦{parseFloat(order.totalAmount || 0).toFixed(2)}
              </td>
              <td className="whitespace-nowrap">
                <StatusBadge status={order.status} />
              </td>
              <td className="whitespace-nowrap text-admin-muted">{formatDate(order.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length > 5 && (
        <div className="mt-4 text-center">
          <Link
            to="/admin/orders"
            className="text-admin-blue hover:text-admin-blue-hover font-medium text-sm"
          >
            View all orders →
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentOrders;
