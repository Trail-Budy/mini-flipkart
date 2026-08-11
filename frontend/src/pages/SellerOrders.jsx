import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/seller/orders', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      showToast('Failed to load customer orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + `/api/seller/orders/${orderId}/status`, {
        credentials: 'include',
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');
      
      showToast('Order status updated', 'success');
      
      // Update local state
      setOrders(orders.map(order => 
        order.order_id === orderId ? { ...order, status: newStatus } : order
      ));
      
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return 'var(--success)';
      case 'shipped': return 'var(--primary)';
      case 'processing': return 'var(--secondary)';
      default: return 'var(--text-muted)';
    }
  };

  if (loading) {
    return <div className="page-container" style={{ textAlign: 'center', padding: '60px' }}>Loading orders...</div>;
  }

  return (
    <div className="page-container">
      <div className="card" style={{ padding: '24px' }}>
        
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Customer Orders</h1>
          <p style={{ color: 'var(--text-muted)' }}>View and manage orders containing your products.</p>
        </div>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--bg-body)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📦</div>
            <h3 style={{ marginBottom: '8px' }}>No orders yet</h3>
            <p style={{ color: 'var(--text-muted)' }}>When customers buy your products, they will appear here.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '16px' }}>Order Details</th>
                  <th style={{ padding: '16px' }}>Product</th>
                  <th style={{ padding: '16px' }}>Customer</th>
                  <th style={{ padding: '16px' }}>Amount</th>
                  <th style={{ padding: '16px' }}>Status</th>
                  <th style={{ padding: '16px', textAlign: 'right' }}>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => (
                  <tr key={`${order.order_id}-${idx}`} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>#{order.order_id}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: '500', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: '200px' }}>
                        {order.product_name}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Qty: {order.quantity}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>{order.customer_name}</td>
                    <td style={{ padding: '16px', fontWeight: '600' }}>₹{order.total_amount}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '0.8rem', 
                        fontWeight: '600', 
                        textTransform: 'uppercase',
                        backgroundColor: 'var(--bg-body)',
                        color: getStatusColor(order.status),
                        border: `1px solid ${getStatusColor(order.status)}`
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                        className="input-field"
                        style={{ padding: '8px', width: 'auto', minWidth: '130px' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default SellerOrders;
