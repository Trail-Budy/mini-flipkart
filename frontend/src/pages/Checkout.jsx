import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import AddressForm from '../components/AddressForm';
import { useToast } from '../context/ToastContext';
import { Check } from 'lucide-react';

const Checkout = () => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState('0.00');
  
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const { fetchCartCount } = useCart();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    fetchAddressesAndCart();
  }, []);

  const fetchAddressesAndCart = async () => {
    setLoading(true);
    try {
      const [addressRes, cartRes] = await Promise.all([
        fetch((import.meta.env.VITE_API_URL || '') + '/api/addresses'),
        fetch((import.meta.env.VITE_API_URL || '') + '/api/cart')
      ]);

      if (!addressRes.ok || !cartRes.ok) {
        throw new Error('Failed to load checkout data');
      }

      const addressData = await addressRes.json();
      const cartData = await cartRes.json();

      if (cartData.items.length === 0) {
        navigate('/cart');
        return;
      }

      setAddresses(addressData);
      setCartItems(cartData.items);
      setCartTotal(cartData.total);
      
      if (addressData.length > 0) {
        setSelectedAddressId(addressData[0].id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (formData) => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error('Failed to add address');
      const newAddress = await res.json();
      
      setAddresses([...addresses, newAddress]);
      setSelectedAddressId(newAddress.id);
      setShowAddressForm(false);
      showToast('Address added successfully', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      showToast('Please select a delivery address', 'warning');
      return;
    }

    setPlacingOrder(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address_id: selectedAddressId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');

      showToast('Order placed successfully!', 'success');
      await fetchCartCount();
      navigate(`/orders/${data.id}`);
    } catch (err) {
      showToast(err.message, 'error');
      if (err.message.includes('stock')) {
        setTimeout(() => navigate('/cart'), 2000);
      }
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return <div className="page-container" style={{ textAlign: 'center', padding: '60px' }}>Loading secure checkout...</div>;
  }
  
  if (error) {
    return (
      <div className="page-container">
        <div style={{ padding: '40px', backgroundColor: '#ffebee', color: 'var(--error)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          <h3>Error loading checkout</h3>
          <p>{error}</p>
          <button onClick={() => navigate('/cart')} className="btn btn-outline" style={{ marginTop: '16px' }}>Back to Cart</button>
        </div>
      </div>
    );
  }

  const discountAmount = Math.round(Number(cartTotal) * 0.15);
  const deliveryCharges = Number(cartTotal) > 500 ? 'Free' : 40;
  const finalTotal = Number(cartTotal) + (deliveryCharges === 'Free' ? 0 : deliveryCharges);

  return (
    <div className="page-container flex-col-to-row-lg">
      
      {/* Left Column: Steps */}
      <div style={{ flex: '1 1 65%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Step 1: Login Check */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--primary)', color: 'white', padding: '16px 24px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '1rem', fontWeight: '500' }}>
              <span style={{ backgroundColor: 'white', color: 'var(--primary)', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px', fontSize: '0.85rem' }}>1</span>
              LOGIN <Check size={16} />
            </span>
          </div>
          <div className="card-body" style={{ padding: '16px 24px 16px 64px' }}>
            <span style={{ fontWeight: '500' }}>{user?.name}</span> <span style={{ color: 'var(--text-muted)', marginLeft: '12px' }}>{user?.email}</span>
          </div>
        </div>

        {/* Step 2: Delivery Address */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--primary)', color: 'white', padding: '16px 24px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '1rem', fontWeight: '500' }}>
              <span style={{ backgroundColor: 'white', color: 'var(--primary)', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px', fontSize: '0.85rem' }}>2</span>
              DELIVERY ADDRESS
            </span>
          </div>
          <div className="card-body" style={{ padding: '0' }}>
            {addresses.map(addr => (
              <div 
                key={addr.id} 
                style={{ 
                  padding: '20px 24px', 
                  borderBottom: '1px solid var(--border-subtle)',
                  backgroundColor: selectedAddressId === addr.id ? '#f5faff' : 'var(--bg-surface)',
                  display: 'flex',
                  gap: '16px'
                }}
              >
                <input 
                  type="radio" 
                  name="address" 
                  checked={selectedAddressId === addr.id}
                  onChange={() => setSelectedAddressId(addr.id)}
                  style={{ marginTop: '4px', cursor: 'pointer' }}
                />
                <div>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontWeight: '600' }}>{addr.full_name}</span>
                    <span style={{ marginLeft: '16px', fontWeight: '600' }}>{addr.phone}</span>
                  </div>
                  <div style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    {addr.address_line1}, {addr.city}, {addr.state} - <span style={{ fontWeight: '500' }}>{addr.postal_code}</span>
                  </div>
                  {selectedAddressId === addr.id && (
                    <button 
                      style={{ marginTop: '16px', padding: '12px 32px', backgroundColor: '#fb641b', color: 'white', border: 'none', borderRadius: '2px', textTransform: 'uppercase', fontWeight: '500', cursor: 'pointer' }}
                    >
                      Deliver Here
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
              {showAddressForm ? (
                <AddressForm onSubmit={handleAddAddress} onCancel={() => setShowAddressForm(false)} />
              ) : (
                <button 
                  onClick={() => setShowAddressForm(true)}
                  style={{ color: 'var(--primary)', background: 'none', border: 'none', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <span style={{ fontSize: '1.2rem' }}>+</span> Add a new address
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Step 3: Order Summary */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)', padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '1rem', fontWeight: '500' }}>
              <span style={{ backgroundColor: 'var(--border-subtle)', color: 'var(--primary)', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px', fontSize: '0.85rem' }}>3</span>
              ORDER SUMMARY
            </span>
          </div>
        </div>

        {/* Step 4: Payment Options (Mock) */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)', padding: '16px 24px', borderBottom: 'none' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '1rem', fontWeight: '500' }}>
              <span style={{ backgroundColor: 'var(--border-subtle)', color: 'var(--primary)', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px', fontSize: '0.85rem' }}>4</span>
              PAYMENT OPTIONS
            </span>
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
              <span>Price ({cartItems.length} items)</span>
              <span>₹{cartTotal}</span>
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
              <span>Total Payable</span>
              <span>₹{finalTotal}</span>
            </div>
            
            <div style={{ borderTop: '1px dashed var(--border-color)', margin: '4px 0' }}></div>
            
            <div style={{ color: 'var(--success)', fontWeight: '600', fontSize: '0.95rem' }}>
              Your Total Savings on this order ₹{discountAmount}
            </div>

            <button 
              onClick={handlePlaceOrder}
              disabled={placingOrder || !selectedAddressId}
              style={{ 
                marginTop: '16px', padding: '16px', backgroundColor: '#fb641b', color: 'white', 
                border: 'none', borderRadius: '2px', fontSize: '1.1rem', textTransform: 'uppercase', 
                fontWeight: '500', cursor: (placingOrder || !selectedAddressId) ? 'not-allowed' : 'pointer',
                opacity: (placingOrder || !selectedAddressId) ? 0.7 : 1, boxShadow: 'var(--shadow-sm)'
              }}
            >
              {placingOrder ? 'Processing...' : 'Place Order'}
            </button>
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

export default Checkout;
