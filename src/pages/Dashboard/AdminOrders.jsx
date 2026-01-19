import { useState, useEffect } from 'react';
import { ordersAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getAllOrders();
      setOrders(response.data.orders);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary-blue">All Orders</h1>

      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500 text-lg">No orders found.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-primary-blue">
                    Order #{order.id}
                  </h2>
                  <p className="text-gray-600">
                    User: <span className="font-semibold">{order.user?.name}</span> ({order.user?.email})
                  </p>
                  <p className="text-gray-600">
                    Date: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600">
                    Status: <span className={`font-semibold ${
                      order.status === 'completed' ? 'text-primary-green' : 
                      order.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </p>
                  <p className="text-gray-600">
                    Total: <span className="font-bold text-primary-blue">₦{order.totalAmount}</span>
                  </p>
                  {order.transactionId && (
                    <p className="text-gray-600 text-sm">
                      Transaction ID: {order.transactionId}
                    </p>
                  )}
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-bold mb-3">Items:</h3>
                  {order.items.map((item) => (
                    <div key={item.id} className="mb-2 p-3 bg-gray-50 rounded-lg">
                      <p className="font-semibold text-primary-blue">
                        {item.project.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        Type: {item.itemType.charAt(0).toUpperCase() + item.itemType.slice(1)} - ₦{item.price}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
