import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { ShoppingCart, Zap, Heart, Star, ShieldCheck, Truck, RotateCcw, ArrowLeft } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, loadingItems } = useCart();
  const cartLoading = product ? (loadingItems?.[product.id] || false) : false;
  const { addToWishlist, removeFromWishlist, isInWishlist, loading: wishlistLoading } = useWishlist();
  const { showToast } = useToast();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + `/api/products/${id}`);
      if (!res.ok) throw new Error('Product not found');
      const data = await res.json();
      setProduct(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      showToast('Please login to add to cart', 'warning');
      navigate('/login');
      return;
    }
    try {
      await addToCart(product.id, quantity);
      showToast('Added to cart successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      showToast('Please login to wishlist items', 'warning');
      navigate('/login');
      return;
    }
    try {
      if (inWishlist) {
        await removeFromWishlist(product.id);
        showToast('Removed from wishlist', 'info');
      } else {
        await addToWishlist(product.id);
        showToast('Added to wishlist', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return (
    <div className="page-container" style={{ display: 'flex', gap: '30px', height: '600px' }}>
      <div style={{ width: '40%', backgroundColor: 'var(--bg-surface)', animation: 'pulse 1.5s infinite ease-in-out', borderRadius: 'var(--radius-md)' }}></div>
      <div style={{ flex: 1, backgroundColor: 'var(--bg-surface)', animation: 'pulse 1.5s infinite ease-in-out', borderRadius: 'var(--radius-md)' }}></div>
    </div>
  );
  
  if (error) return (
    <div className="page-container">
      <div style={{ padding: '40px', backgroundColor: '#ffebee', color: 'var(--error)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
        <h3>Error loading product</h3>
        <p>{error}</p>
        <button onClick={() => navigate('/')} className="btn btn-outline" style={{ marginTop: '16px' }}>Back to Home</button>
      </div>
    </div>
  );
  
  if (!product) return null;

  const discount = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100) 
    : 0;

  const inWishlist = isInWishlist(product.id);
  const dummyRating = (3.5 + (product.id % 15) / 10).toFixed(1);
  const dummyReviews = (product.id * 17) % 500 + 12;

  return (
    <div className="page-container" style={{ backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', marginTop: '20px' }}>
      
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '24px', fontWeight: '500' }}>
        <ArrowLeft size={16} /> Back
      </Link>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        
        {/* Left Column: Image & Main Actions */}
        <div style={{ width: '100%', maxWidth: '450px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ 
            border: '1px solid var(--border-subtle)', 
            padding: '40px', 
            borderRadius: 'var(--radius-sm)',
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '450px', 
            position: 'relative' 
          }}>
            <button 
              onClick={handleToggleWishlist}
              disabled={wishlistLoading}
              style={{ 
                position: 'absolute', top: '16px', right: '16px', background: 'var(--bg-surface)', 
                border: '1px solid var(--border-subtle)', borderRadius: '50%', padding: '10px', 
                cursor: 'pointer', display: 'flex', boxShadow: 'var(--shadow-sm)',
                color: inWishlist ? 'var(--error)' : 'var(--text-muted)'
              }}
            >
              <Heart size={20} fill={inWishlist ? 'var(--error)' : 'none'} />
            </button>
            <img 
              src={product.image_url || 'https://via.placeholder.com/400'} 
              alt={product.name} 
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button 
              onClick={handleAddToCart}
              disabled={cartLoading || product.stock === 0}
              className="btn"
              style={{ 
                backgroundColor: product.stock > 0 ? '#ff9f00' : 'var(--bg-body)', 
                color: product.stock > 0 ? '#fff' : 'var(--text-muted)', 
                padding: '16px',
                fontSize: '1.1rem'
              }}
            >
              <ShoppingCart size={20} /> {cartLoading ? 'Adding...' : 'ADD TO CART'}
            </button>
            
            <button 
              onClick={() => {
                handleAddToCart().then(() => {
                  if (user && product.stock > 0) navigate('/cart');
                });
              }}
              disabled={product.stock === 0}
              className="btn btn-secondary"
              style={{ 
                padding: '16px',
                fontSize: '1.1rem'
              }}
            >
              <Zap size={20} /> BUY NOW
            </button>
          </div>
        </div>

        {/* Right Column: Details */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
            {product.category_name}
          </div>
          
          <h1 style={{ fontSize: '1.8rem', margin: '0 0 12px 0', fontWeight: '500', color: 'var(--text-main)', lineHeight: '1.3' }}>
            {product.name}
          </h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--success)', color: 'var(--text-light)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 'bold' }}>
              {dummyRating} <Star size={14} fill="white" />
            </div>
            <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: '500' }}>{dummyReviews} Ratings & Reviews</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '32px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: '700', lineHeight: '1' }}>₹{product.price}</span>
            {product.original_price && (
              <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginBottom: '6px' }}>
                ₹{product.original_price}
              </span>
            )}
            {discount > 0 && (
              <span style={{ fontSize: '1.2rem', color: 'var(--success)', fontWeight: '700', marginBottom: '6px' }}>
                {discount}% off
              </span>
            )}
          </div>

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>Quantity:</span>
              <select 
                value={quantity} 
                onChange={(e) => setQuantity(Number(e.target.value))}
                style={{ 
                  padding: '10px 16px', 
                  fontSize: '1rem', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                {[...Array(Math.min(product.stock, 5)).keys()].map(n => (
                  <option key={n + 1} value={n + 1}>{n + 1}</option>
                ))}
              </select>
            </div>
          )}

          {/* Trust Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', padding: '24px 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', marginBottom: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
              <ShieldCheck size={32} color="var(--primary)" />
              <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>1 Year Warranty</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
              <RotateCcw size={32} color="var(--primary)" />
              <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>7 Days Replacement</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
              <Truck size={32} color="var(--primary)" />
              <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Free Delivery</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: product.stock > 0 ? 'var(--success)' : 'var(--error)', fontWeight: '700', fontSize: '1.2rem' }}>
            {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
          </div>

          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', fontWeight: '600' }}>Product Description</h3>
            <p style={{ lineHeight: '1.8', color: 'var(--text-main)', whiteSpace: 'pre-line', fontSize: '0.95rem' }}>
              {product.description}
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
