import { Link } from 'react-router-dom';

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
      <div className="text-center py-8 text-gray-500">
        <p>No recent orders</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.slice(0, 5).map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-primary-blue">
                <Link to={`/admin/orders/${order.id}`}>#{order.id}</Link>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {order.user?.name || 'N/A'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                ₦{parseFloat(order.totalAmount || 0).toFixed(2)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    order.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {order.status}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {formatDate(order.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length > 5 && (
        <div className="mt-4 text-center">
          <Link
            to="/admin/orders"
            className="text-primary-blue hover:text-primary-blue-light font-medium"
          >
            View all orders →
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentOrders;
