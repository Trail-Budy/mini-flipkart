import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'var(--success)';
      case 'cancelled': return 'var(--error)';
      case 'shipped': return '#2874f0';
      case 'confirmed': return '#ff9f00';
      default: return 'var(--text-muted)'; // pending
    }
  };

  if (loading) return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ height: '60px', backgroundColor: 'var(--bg-surface)', animation: 'pulse 1.5s infinite ease-in-out', borderRadius: 'var(--radius-sm)' }}></div>
      <div style={{ height: '120px', backgroundColor: 'var(--bg-surface)', animation: 'pulse 1.5s infinite ease-in-out', borderRadius: 'var(--radius-sm)' }}></div>
      <div style={{ height: '120px', backgroundColor: 'var(--bg-surface)', animation: 'pulse 1.5s infinite ease-in-out', borderRadius: 'var(--radius-sm)' }}></div>
    </div>
  );
  
  if (error) return (
    <div className="page-container">
      <div style={{ padding: '40px', backgroundColor: '#ffebee', color: 'var(--error)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
        <h3>Error loading orders</h3>
        <p>{error}</p>
        <button onClick={fetchOrders} className="btn btn-outline" style={{ marginTop: '16px' }}>Try Again</button>
      </div>
    </div>
  );

  if (orders.length === 0) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ padding: '60px 40px', textAlign: 'center', width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Package size={80} color="var(--text-muted)" style={{ marginBottom: '24px' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>No Orders Yet</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Looks like you haven't placed any orders.</p>
          <button onClick={() => navigate('/')} className="btn btn-primary" style={{ padding: '12px 32px' }}>Start Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>My Orders</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {orders.map((order) => {
          // If the order has items attached from the join query, display the first one's image
          const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;

          return (
            <Link 
              key={order.id} 
              to={`/orders/${order.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="card" style={{ display: 'flex', padding: '24px', alignItems: 'center', transition: 'box-shadow var(--transition-fast)', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
              >
                
                {/* Visual */}
                <div style={{ width: '80px', height: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginRight: '24px' }}>
                  {firstItem && firstItem.image_url ? (
                    <img src={firstItem.image_url} alt="Product" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  ) : (
                    <Package size={40} color="var(--text-muted)" />
                  )}
                </div>
                
                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '500', marginBottom: '8px' }}>
                    Order ID: OD{String(order.id).padStart(10, '0')}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', gap: '16px' }}>
                    <span>Placed on {new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span>•</span>
                    <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>Total: ₹{order.total_amount}</span>
                  </div>
                </div>

                {/* Status Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '200px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: getStatusColor(order.status) }}></div>
                  <div>
                    <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>{order.status}</div>
                    {order.status === 'delivered' && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Your item has been delivered</div>
                    )}
                  </div>
                </div>
                
                <ChevronRight color="var(--text-muted)" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
