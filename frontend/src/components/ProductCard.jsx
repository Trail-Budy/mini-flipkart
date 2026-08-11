import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { ShoppingCart, Heart, Star } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { addToCart, loadingItems } = useCart();
  const cartLoading = loadingItems?.[product.id] || false;
  const { addToWishlist, removeFromWishlist, isInWishlist, loading: wishlistLoading } = useWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const discount = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100) 
    : 0;

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = async (e) => {
    e.preventDefault(); 
    if (!user) {
      showToast('Please login to add to cart', 'warning');
      navigate('/login');
      return;
    }
    
    try {
      await addToCart(product.id, 1);
      showToast('Item added to cart', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
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

  // Generate a random stable rating for visual purposes (since DB doesn't have it yet)
  const dummyRating = (3.5 + (product.id % 15) / 10).toFixed(1);
  const dummyReviews = (product.id * 17) % 500 + 12;

  return (
    <div className="card product-card" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      position: 'relative',
      transition: 'all var(--transition-normal)'
    }}>
      
      {/* Wishlist Floating Button */}
      <button 
        onClick={handleToggleWishlist}
        disabled={wishlistLoading}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-full)',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
          boxShadow: 'var(--shadow-sm)',
          color: inWishlist ? 'var(--error)' : 'var(--text-muted)',
          transition: 'transform var(--transition-fast)'
        }}
        className="wishlist-btn"
        title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
      >
        <Heart size={18} fill={inWishlist ? 'var(--error)' : 'none'} />
      </button>

      <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Image Container */}
        <div style={{
          height: '200px',
          padding: '24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'var(--bg-surface)'
        }}>
          <img 
            src={product.image_url || 'https://via.placeholder.com/200'} 
            alt={product.name} 
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', transition: 'transform var(--transition-normal)' }}
            className="product-img"
          />
        </div>
        
        {/* Content */}
        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
            {product.category_name}
          </div>
          
          <h3 style={{
            fontSize: '1rem',
            margin: '0 0 8px 0',
            fontWeight: '500',
            color: 'var(--text-main)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.4',
            flex: 1
          }}>
            {product.name}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--success)', color: 'var(--text-light)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              {dummyRating} <Star size={12} fill="white" />
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>({dummyReviews})</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1' }}>₹{product.price}</span>
            {product.original_price && (
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'line-through', lineHeight: '1.2' }}>
                ₹{product.original_price}
              </span>
            )}
            {discount > 0 && (
              <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: '600', lineHeight: '1.2' }}>
                {discount}% off
              </span>
            )}
          </div>
          
          <div style={{ fontSize: '0.8rem', color: product.stock > 0 ? 'var(--text-muted)' : 'var(--error)', fontWeight: product.stock > 0 ? '400' : '600' }}>
            {product.stock > 0 ? 'Free delivery' : 'Out of Stock'}
          </div>
        </div>
      </Link>

      <div style={{ padding: '0 16px 16px 16px' }}>
        {product.stock > 0 ? (
          <button 
            onClick={handleAddToCart}
            disabled={cartLoading}
            className="btn btn-outline"
            style={{ width: '100%', padding: '8px', fontSize: '0.9rem' }}
          >
            <ShoppingCart size={16} /> {cartLoading ? 'Adding...' : 'Add to Cart'}
          </button>
        ) : (
          <button 
            disabled
            className="btn"
            style={{ width: '100%', padding: '8px', fontSize: '0.9rem', backgroundColor: 'var(--bg-body)', color: 'var(--text-muted)' }}
          >
            Out of Stock
          </button>
        )}
      </div>

      <style>{`
        .product-card:hover {
          box-shadow: var(--shadow-hover);
          transform: translateY(-2px);
        }
        .product-card:hover .product-img {
          transform: scale(1.05);
        }
        .wishlist-btn:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default ProductCard;
