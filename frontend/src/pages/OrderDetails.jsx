import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, CheckCircle, Truck, MapPin } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + `/api/orders/${id}`);
      if (!res.ok) throw new Error('Failed to fetch order details');
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    setCancelling(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + `/api/orders/${id}/cancel`, {
        method: 'PATCH',
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel order');
      
      showToast('Order cancelled successfully', 'success');
      fetchOrderDetails(); // Reload to get updated status
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ height: '200px', backgroundColor: 'var(--bg-surface)', animation: 'pulse 1.5s infinite ease-in-out', borderRadius: 'var(--radius-sm)' }}></div>
      <div style={{ height: '300px', backgroundColor: 'var(--bg-surface)', animation: 'pulse 1.5s infinite ease-in-out', borderRadius: 'var(--radius-sm)' }}></div>
    </div>
  );
  
  if (error || !order) return (
    <div className="page-container">
      <div style={{ padding: '40px', backgroundColor: '#ffebee', color: 'var(--error)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
        <h3>Error loading order</h3>
        <p>{error}</p>
        <button onClick={() => navigate('/orders')} className="btn btn-outline" style={{ marginTop: '16px' }}>Back to Orders</button>
      </div>
    </div>
  );

  const canCancel = order.status === 'pending' || order.status === 'confirmed' || order.status === 'processing';

  return (
    <div className="page-container">
      
      {/* Top Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontWeight: '500' }}>
          <ArrowLeft size={16} /> Back to My Orders
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Delivery Address & Invoice Card */}
        <div className="card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '32px' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} color="var(--primary)" /> Delivery Address
            </h3>
            <div style={{ fontWeight: '600', marginBottom: '8px' }}>{order.address?.full_name}</div>
            <div style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              {order.address?.address_line1}<br/>
              {order.address?.city}, {order.address?.state} - {order.address?.postal_code}<br/>
              <span style={{ fontWeight: '600', display: 'inline-block', marginTop: '8px' }}>Phone Number: {order.address?.phone}</span>
            </div>
          </div>
          
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '4px' }}>Order ID: OD{String(order.id).padStart(10, '0')}</h3>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Placed on {new Date(order.created_at).toLocaleString()}
                </div>
              </div>
              {canCancel && (
                <button 
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  style={{ padding: '10px 24px', backgroundColor: 'transparent', border: '1px solid var(--error)', color: 'var(--error)', fontWeight: '600', borderRadius: '4px', cursor: cancelling ? 'not-allowed' : 'pointer', textTransform: 'uppercase' }}
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}
            </div>
            
            {/* Status Tracking Visual */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
              <div style={{ 
                width: '16px', height: '16px', borderRadius: '50%', 
                backgroundColor: order.status === 'cancelled' ? 'var(--error)' : 'var(--success)' 
              }}></div>
              <div style={{ fontSize: '1.1rem', fontWeight: '600', textTransform: 'capitalize', color: order.status === 'cancelled' ? 'var(--error)' : 'var(--success)' }}>
                {order.status === 'cancelled' ? 'Order Cancelled' : order.status}
              </div>
            </div>
            {order.status === 'cancelled' && (
              <div style={{ marginLeft: '32px', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                You cancelled this order. Any payment made will be refunded within 5-7 business days.
              </div>
            )}
          </div>
        </div>

        {/* Order Items List */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Package size={20} color="var(--primary)" /> Item Details
          </div>
          <div>
            {order.items?.map((item) => (
              <div key={item.id} style={{ display: 'flex', padding: '24px', borderBottom: '1px solid var(--border-subtle)', gap: '24px', flexWrap: 'wrap' }}>
                
                <Link to={`/products/${item.product_id}`} style={{ width: '100px', height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img 
                    src={item.image_url || 'https://via.placeholder.com/100'} 
                    alt={item.product_name} 
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </Link>
                
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <Link to={`/products/${item.product_id}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', fontWeight: '500' }}>{item.product_name}</h3>
                  </Link>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>Seller: Mini Retail</div>
                  <div style={{ display: 'flex', gap: '32px' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Qty: <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{item.quantity}</span></div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Price: <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>₹{item.price}</span></div>
                  </div>
                </div>
                
                <div style={{ minWidth: '150px', textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>₹{item.subtotal}</div>
                </div>

              </div>
            ))}
          </div>
          
          {/* Total Summary */}
          <div style={{ padding: '24px', backgroundColor: 'var(--bg-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ minWidth: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '1rem', color: 'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span>₹{order.total_amount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '1rem', color: 'var(--text-muted)' }}>
                <span>Delivery</span>
                <span style={{ color: 'var(--success)' }}>Free</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', margin: '16px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '700' }}>
                <span>Grand Total</span>
                <span>₹{order.total_amount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
