import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { SkeletonCartItem } from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';

const Cart = () => {
  const navigate = useNavigate();
  const { updateQuantity, removeFromCart, clearCart } = useCart();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState('0.00');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/cart');
      if (!res.ok) throw new Error('Failed to fetch cart');
      const data = await res.json();
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity, currentStock) => {
    if (newQuantity < 1) return;
    if (newQuantity > currentStock) {
      showToast(`Only ${currentStock} items available in stock`, 'warning');
      return;
    }
    
    try {
      await updateQuantity(productId, newQuantity);
      fetchCart();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
      fetchCart();
      showToast('Item removed from cart', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return (
    <div className="page-container" style={{ display: 'flex', gap: '20px' }}>
      <div className="card" style={{ flex: '1 1 65%', padding: '24px' }}>
        <SkeletonCartItem />
        <SkeletonCartItem />
      </div>
      <div className="card" style={{ flex: '1 1 35%', height: '300px', backgroundColor: 'var(--bg-surface)' }}></div>
    </div>
  );

  if (error) return (
    <div className="page-container">
      <div style={{ padding: '40px', backgroundColor: '#ffebee', color: 'var(--error)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
        <h3>Failed to load cart</h3>
        <p>{error}</p>
        <button onClick={fetchCart} className="btn btn-outline" style={{ marginTop: '16px' }}>Try Again</button>
      </div>
    </div>
  );

  if (items.length === 0) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ padding: '60px 40px', textAlign: 'center', width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src="https://rukminim2.flixcart.com/www/800/800/promos/16/05/2019/d438a32e-765a-4d8b-b4a6-520b560971e8.png?q=90" alt="Empty Cart" style={{ width: '250px', marginBottom: '24px' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Your cart is empty!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Add items to it now.</p>
          <Link to="/" className="btn btn-primary" style={{ padding: '12px 32px' }}>Shop Now</Link>
        </div>
      </div>
    );
  }

  // Calculate discount (dummy 15% discount for UI presentation if no original price)
  const discountAmount = Math.round(Number(total) * 0.15);
  const deliveryCharges = Number(total) > 500 ? 'Free' : 40;
  const finalTotal = Number(total) + (deliveryCharges === 'Free' ? 0 : deliveryCharges);

  return (
    <div className="page-container flex-col-to-row-lg">
      
      {/* Left Column: Cart Items */}
      <div style={{ flex: '1 1 65%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShoppingBag size={20} color="var(--primary)" /> My Cart ({items.length})</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer' }}><MapPin size={16} /> Deliver to</span>
          </div>

          <div>
            {items.map((item) => (
              <div key={item.product_id} style={{ display: 'flex', padding: '24px', borderBottom: '1px solid var(--border-subtle)', gap: '24px', flexWrap: 'wrap' }}>
                
                {/* Image & Qty Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <Link to={`/products/${item.product_id}`} style={{ width: '110px', height: '110px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img 
                      src={item.image_url || 'https://via.placeholder.com/110'} 
                      alt={item.product_name} 
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  </Link>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button 
                      onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1, item.stock)}
                      disabled={item.quantity <= 1}
                      style={{ 
                        width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--border-color)', 
                        background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer' 
                      }}
                    ><Minus size={14} /></button>
                    
                    <div style={{ width: '40px', height: '28px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '500' }}>
                      {item.quantity}
                    </div>
                    
                    <button 
                      onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1, item.stock)}
                      disabled={item.quantity >= item.stock}
                      style={{ 
                        width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--border-color)', 
                        background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: item.quantity >= item.stock ? 'not-allowed' : 'pointer' 
                      }}
                    ><Plus size={14} /></button>
                  </div>
                </div>
                
                {/* Product Details */}
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <Link to={`/products/${item.product_id}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', fontWeight: '500' }}>{item.product_name}</h3>
                  </Link>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>Seller: Mini Retail</div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>₹{item.price}</span>
                    <span style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: '600' }}>15% Off 2 offers applied</span>
                  </div>

                  <div style={{ display: 'flex', gap: '24px', marginTop: '24px' }}>
                    <button 
                      onClick={() => handleRemove(item.product_id)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-main)', fontWeight: '600', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}
                    >
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', backgroundColor: 'var(--bg-surface)' }}>
            <button 
              onClick={() => navigate('/checkout')}
              className="btn btn-secondary"
              style={{ padding: '16px 40px', fontSize: '1.1rem', textTransform: 'uppercase', borderRadius: '2px', boxShadow: 'var(--shadow-sm)' }}
            >
              Place Order
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Price Details */}
      <div style={{ flex: '1 1 35%', minWidth: '300px' }}>
        <div className="card" style={{ position: 'sticky', top: '90px' }}>
          <div className="card-header" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '1rem' }}>
            Price Details
          </div>
          
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
              <span>Price ({items.length} items)</span>
              <span>₹{total}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
              <span>Discount</span>
              <span style={{ color: 'var(--success)' }}>- ₹{discountAmount}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
              <span>Delivery Charges</span>
              <span style={{ color: 'var(--success)' }}>{deliveryCharges === 'Free' ? 'Free' : `₹${deliveryCharges}`}</span>
            </div>
            
            <div style={{ borderTop: '1px dashed var(--border-color)', margin: '4px 0' }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '700' }}>
              <span>Total Amount</span>
              <span>₹{finalTotal}</span>
            </div>
            
            <div style={{ borderTop: '1px dashed var(--border-color)', margin: '4px 0' }}></div>
            
            <div style={{ color: 'var(--success)', fontWeight: '600', fontSize: '0.95rem' }}>
              You will save ₹{discountAmount} on this order
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '24px', padding: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <div style={{ width: '32px', height: '32px', flexShrink: 0, backgroundImage: 'url(https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/shield_b33c0c.svg)' }}></div>
          Safe and Secure Payments. Easy returns. 100% Authentic products.
        </div>
      </div>
      
    </div>
  );
};

// Reusable MapPin since it wasn't imported properly above in original
const MapPin = ({size}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;

export default Cart;
