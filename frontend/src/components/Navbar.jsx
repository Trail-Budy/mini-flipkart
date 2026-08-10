import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, Heart, Search, Menu, Package, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowDropdown(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header style={{ 
      backgroundColor: 'var(--primary)', 
      color: 'var(--text-light)', 
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: 'var(--shadow-md)'
    }}>
      <div className="page-container" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
        
        {/* Logo */}
        <Link to="/" style={{ color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <div style={{ fontStyle: 'italic', fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.5px' }}>
            Mini<span style={{ color: '#ffe500' }}>Flipkart</span>
          </div>
        </Link>
        
        {/* Search Bar */}
        <div className="desktop-only" style={{ flex: 1, maxWidth: '600px' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', width: '100%', position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Search for products, brands and more" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px 16px 10px 44px', 
                borderRadius: 'var(--radius-sm)', 
                border: 'none',
                fontSize: '0.95rem',
                outline: 'none',
                boxShadow: 'var(--shadow-sm)'
              }} 
            />
            <button type="submit" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex' }}>
              <Search size={20} />
            </button>
          </form>
        </div>
        
        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexShrink: 0 }}>
          {user ? (
            <>
              {/* Account Dropdown Trigger */}
              <div 
                style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                onMouseEnter={() => setShowDropdown(true)}
                onMouseLeave={() => setShowDropdown(false)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                  <User size={20} />
                  <span>{user.name.split(' ')[0]}</span>
                </div>
                
                {showDropdown && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    paddingTop: '10px',
                    width: '200px'
                  }}>
                    <div style={{ 
                      backgroundColor: 'var(--bg-surface)', 
                      borderRadius: 'var(--radius-sm)', 
                      boxShadow: 'var(--shadow-hover)', 
                      overflow: 'hidden',
                      color: 'var(--text-main)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <Link to="/account" className="account-dropdown-item" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)', textDecoration: 'none', borderBottom: '1px solid var(--border-subtle)' }}><User size={16}/> My Profile</Link>
                      {(user?.role === 'seller' || user?.role === 'admin') && (
                        <Link to={user.role === 'admin' ? "/admin" : "/seller"} className="account-dropdown-item" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--primary)', textDecoration: 'none', borderBottom: '1px solid var(--border-subtle)' }}>
                          {user.role === 'admin' ? <ShieldCheck size={16} /> : <LayoutDashboard size={16} />}
                          {user.role === 'admin' ? 'Admin Dashboard' : 'Seller Dashboard'}
                        </Link>
                      )}
                      <Link to="/orders" className="account-dropdown-item" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)', textDecoration: 'none', borderBottom: '1px solid var(--border-subtle)' }}><Package size={16}/> Orders</Link>
                      <Link to="/wishlist" className="account-dropdown-item" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)', textDecoration: 'none', borderBottom: '1px solid var(--border-subtle)' }}><Heart size={16}/> Wishlist</Link>
                      <button onClick={handleLogout} className="account-dropdown-item" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontSize: '1rem', textAlign: 'left' }}><LogOut size={16}/> Logout</button>
                    </div>
                  </div>
                )}
              </div>
              
              <Link to="/cart" style={{ color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '8px', position: 'relative', fontWeight: '500' }}>
                <ShoppingCart size={22} />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span style={{ 
                    position: 'absolute', 
                    top: '-8px', 
                    left: '12px', 
                    backgroundColor: 'var(--secondary)', 
                    color: 'var(--text-light)', 
                    fontSize: '0.7rem', 
                    height: '18px',
                    minWidth: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    padding: '0 4px'
                  }}>
                    {cartCount}
                  </span>
                )}
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" style={{ 
                color: 'var(--primary)', 
                backgroundColor: 'var(--bg-surface)', 
                padding: '6px 24px', 
                borderRadius: 'var(--radius-sm)', 
                fontWeight: '600',
                border: '1px solid var(--border-subtle)'
              }}>Login</Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Search Bar (Only visible on small screens) */}
      <div className="mobile-only" style={{ padding: '10px 20px', backgroundColor: 'var(--primary-dark)' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', width: '100%', position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Search for products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px 12px 8px 36px', 
              borderRadius: 'var(--radius-sm)', 
              border: 'none',
              fontSize: '0.9rem',
              outline: 'none'
            }} 
          />
          <button type="submit" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex' }}>
            <Search size={16} />
          </button>
        </form>
      </div>

      <style>{`
        .account-dropdown-item:hover {
          background-color: var(--bg-body);
        }
      `}</style>
    </header>
  );
};

export default Navbar;
