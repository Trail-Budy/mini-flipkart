import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingCart, Heart, Star } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist, loading: wishlistLoading } = useWishlist();
  const { addToCart, loading: cartLoading } = useCart();
  const { showToast } = useToast();

  const handleAddToCart = async (item) => {
    try {
      await addToCart(item.product_id, 1);
      await removeFromWishlist(item.product_id);
      showToast('Moved to cart', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
      showToast('Removed from wishlist', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ padding: '60px 40px', textAlign: 'center', width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/mywishlist-empty_39f7a5.png" alt="Empty Wishlist" style={{ width: '250px', marginBottom: '24px' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Empty Wishlist</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>You have no items in your wishlist. Start adding!</p>
          <Link to="/" className="btn btn-primary" style={{ padding: '12px 32px' }}>Shop Now</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Heart fill="var(--error)" color="var(--error)" size={24} /> My Wishlist ({wishlistItems.length})
        </div>
        
        <div>
          {wishlistItems.map((item) => (
            <div key={item.product_id} style={{ 
              display: 'flex', 
              padding: '24px', 
              borderBottom: '1px solid var(--border-subtle)',
              gap: '24px',
              position: 'relative'
            }}>
              
              <Link to={`/products/${item.product_id}`} style={{ width: '120px', height: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img 
                  src={item.product_image || 'https://via.placeholder.com/120'} 
                  alt={item.product_name} 
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              </Link>
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Link to={`/products/${item.product_id}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', fontWeight: '500', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.product_name}
                  </h3>
                </Link>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>₹{item.product_price}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--success)', color: 'var(--text-light)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    4.5 <Star size={12} fill="white" />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <button 
                    onClick={() => handleRemove(item.product_id)}
                    disabled={wishlistLoading}
                    className="btn btn-outline"
                    style={{ padding: '8px 24px', color: 'var(--text-muted)', border: 'none', fontWeight: '600', textTransform: 'uppercase' }}
                  >
                    <Trash2 size={16} /> Remove
                  </button>
                  
                  <button 
                    onClick={() => handleAddToCart(item)}
                    disabled={cartLoading}
                    className="btn btn-secondary"
                    style={{ padding: '8px 24px', fontWeight: '600', textTransform: 'uppercase' }}
                  >
                    <ShoppingCart size={16} /> Add to Cart
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
