import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, MapPin, Package, Clock, ShieldCheck, User } from 'lucide-react';

const AdminOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + `/api/admin/orders/${id}`);
      if (!res.ok) throw new Error('Failed to fetch order details');
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      showToast(err.message, 'error');
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + `/api/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order status');
      
      showToast('Order status updated', 'success');
      setOrder({ ...order, status: newStatus });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading order details...</div>;
  if (!order) return <div style={{ padding: '40px', color: 'var(--error)' }}>Order not found</div>;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <button onClick={() => navigate('/admin/orders')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', marginBottom: '16px' }}>
          <ArrowLeft size={16} /> Back to Orders
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '4px' }}>Order #{order.id}</h1>
            <p style={{ color: 'var(--text-muted)' }}>Placed on {new Date(order.created_at).toLocaleString()}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: '500' }}>Update Status:</span>
            <select 
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', outline: 'none', textTransform: 'uppercase', fontWeight: '600' }}
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Customer Info */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="var(--primary)" /> Customer Details
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-main)' }}>
            <div><strong>Name:</strong> {order.customer_name}</div>
            <div><strong>Email:</strong> {order.customer_email}</div>
            <div><strong>User ID:</strong> #{order.user_id}</div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={18} color="var(--primary)" /> Delivery Address
          </h3>
          {order.address ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-main)', lineHeight: '1.5' }}>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>{order.address.full_name}</div>
              <div>{order.address.address_line1}</div>
              {order.address.address_line2 && <div>{order.address.address_line2}</div>}
              <div>{order.address.city}, {order.address.state} {order.address.postal_code}</div>
              <div>{order.address.country}</div>
              <div style={{ marginTop: '8px' }}><strong>Phone:</strong> {order.address.phone}</div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)' }}>Address details unavailable</div>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={18} color="var(--primary)" /> Order Items
          </h3>
        </div>
        
        <div>
          {order.items && order.items.map(item => (
            <div key={item.id} style={{ display: 'flex', padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', gap: '20px', alignItems: 'center' }}>
              <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                {item.image_url ? (
                  <img src={item.image_url} alt={item.product_name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <Package size={24} color="var(--text-muted)" />
                )}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '500', color: 'var(--text-main)', marginBottom: '4px' }}>{item.product_name}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Seller: {item.seller_name || 'System Admin'} | Product ID: #{item.product_id}
                </div>
              </div>
              
              <div style={{ textAlign: 'center', minWidth: '80px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Qty</div>
                <div style={{ fontWeight: '600' }}>{item.quantity}</div>
              </div>
              
              <div style={{ textAlign: 'right', minWidth: '100px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Price</div>
                <div style={{ fontWeight: '600' }}>₹{Number(item.price).toLocaleString()}</div>
              </div>
              
              <div style={{ textAlign: 'right', minWidth: '100px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Subtotal</div>
                <div style={{ fontWeight: '700', color: 'var(--primary)' }}>₹{Number(item.subtotal).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'flex-end', backgroundColor: 'var(--bg-subtle)' }}>
          <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Subtotal</span>
              <span>₹{Number(order.total_amount).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Delivery</span>
              <span style={{ color: 'var(--success)' }}>Free</span>
            </div>
            <div style={{ borderTop: '1px dashed var(--border-color)', margin: '4px 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>
              <span>Total</span>
              <span>₹{Number(order.total_amount).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
