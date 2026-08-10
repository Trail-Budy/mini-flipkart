import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, Heart, LogOut, ShieldCheck, MapPin, Trash2, LayoutDashboard } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import AddressForm from '../components/AddressForm';

const Account = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
    navigate('/login');
  };

  useEffect(() => {
    if (activeTab === 'addresses') {
      fetchAddresses();
    }
  }, [activeTab]);

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/addresses');
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    } finally {
      setLoadingAddresses(false);
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
      
      showToast('Address added successfully', 'success');
      setShowAddressForm(false);
      fetchAddresses();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    // In a real app, we would call a DELETE /api/addresses/:id endpoint.
    // For now, since we only have GET and POST, we will just show a toast indicating it's not implemented yet
    // or we can implement the delete endpoint if needed.
    showToast('Delete address is not yet supported in the backend API', 'info');
  };

  return (
    <div className="page-container flex-col-to-row">
      
      {/* Sidebar */}
      <div style={{ width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px' }}>
          <div style={{ width: '50px', height: '50px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hello,</div>
            <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{user?.name}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '0' }}>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.5px' }}>
              <User size={18} color="var(--primary)" /> Account Settings
            </div>
            <div 
              onClick={() => setActiveTab('profile')}
              style={{ padding: '8px 0 8px 34px', color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-main)', fontWeight: activeTab === 'profile' ? '500' : 'normal', cursor: 'pointer', backgroundColor: activeTab === 'profile' ? 'var(--bg-subtle)' : 'transparent' }}
            >
              Profile Information
            </div>
            <div 
              onClick={() => setActiveTab('addresses')}
              style={{ padding: '8px 0 8px 34px', color: activeTab === 'addresses' ? 'var(--primary)' : 'var(--text-main)', fontWeight: activeTab === 'addresses' ? '500' : 'normal', cursor: 'pointer', backgroundColor: activeTab === 'addresses' ? 'var(--bg-subtle)' : 'transparent' }}
            >
              Manage Addresses
            </div>
          </div>
          
          {(user?.role === 'seller' || user?.role === 'admin') && (
            <>
              <div style={{ borderTop: '1px solid var(--border-subtle)' }}></div>
              <Link to={user.role === 'admin' ? "/admin" : "/seller"} style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--primary)', textDecoration: 'none' }}>
                {user.role === 'admin' ? <ShieldCheck size={18} /> : <LayoutDashboard size={18} />}
                <span style={{ fontWeight: '600', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.5px' }}>{user.role === 'admin' ? 'Admin Dashboard' : 'Seller Dashboard'}</span>
              </Link>
            </>
          )}

          <div style={{ borderTop: '1px solid var(--border-subtle)' }}></div>

          <Link to="/orders" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-main)', textDecoration: 'none' }}>
            <Package size={18} color="var(--primary)" /> 
            <span style={{ fontWeight: '600', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.5px' }}>My Orders</span>
          </Link>
          
          <div style={{ borderTop: '1px solid var(--border-subtle)' }}></div>

          <Link to="/wishlist" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-main)', textDecoration: 'none' }}>
            <Heart size={18} color="var(--primary)" /> 
            <span style={{ fontWeight: '600', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.5px' }}>My Wishlist</span>
          </Link>

          <div style={{ borderTop: '1px solid var(--border-subtle)' }}></div>

          <div 
            onClick={handleLogout}
            style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-main)', cursor: 'pointer' }}
          >
            <LogOut size={18} color="var(--primary)" /> 
            <span style={{ fontWeight: '600', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.5px' }}>Logout</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="card" style={{ flex: 1, padding: '32px' }}>
        
        {activeTab === 'profile' ? (
          <>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '32px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
              Profile Information
            </h2>

            <div className="grid grid-cols-2" style={{ maxWidth: '600px', gap: '32px' }}>
              <div>
                <label className="input-label">Full Name</label>
                <input type="text" className="input-field" value={user?.name || ''} readOnly style={{ backgroundColor: 'var(--bg-body)' }} />
              </div>
              
              <div>
                <label className="input-label">Email Address</label>
                <input type="email" className="input-field" value={user?.email || ''} readOnly style={{ backgroundColor: 'var(--bg-body)' }} />
              </div>
              
              <div>
                <label className="input-label">Account Role</label>
                <input type="text" className="input-field" value={user?.role?.toUpperCase() || ''} readOnly style={{ backgroundColor: 'var(--bg-body)', fontWeight: '600' }} />
              </div>
            </div>
            
            <div style={{ marginTop: '40px', padding: '24px', backgroundColor: '#e3f2fd', borderRadius: 'var(--radius-sm)', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <ShieldCheck size={32} color="var(--primary)" style={{ flexShrink: 0 }} />
              <div>
                <h4 style={{ color: 'var(--primary)', marginBottom: '8px' }}>Secure Account</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                  Your account is protected with enterprise-grade security. We never share your personal details or purchase history with third-party data brokers.
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
              Manage Addresses
            </h2>

            {showAddressForm ? (
              <div style={{ backgroundColor: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '16px', textTransform: 'uppercase', fontWeight: '500' }}>Add a New Address</h3>
                <AddressForm onSubmit={handleAddAddress} onCancel={() => setShowAddressForm(false)} />
              </div>
            ) : (
              <div>
                <button 
                  onClick={() => setShowAddressForm(true)}
                  style={{ width: '100%', padding: '16px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}
                >
                  <span style={{ fontSize: '1.2rem' }}>+</span> ADD A NEW ADDRESS
                </button>
                
                {loadingAddresses ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading addresses...</div>
                ) : addresses.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--bg-body)', borderRadius: 'var(--radius-sm)' }}>
                    No addresses found. Add one above.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {addresses.map(addr => (
                      <div key={addr.id} style={{ padding: '20px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                          <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{addr.full_name}</span>
                          <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{addr.phone}</span>
                        </div>
                        <div style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                          {addr.address_line1}, {addr.city}, {addr.state} - <span style={{ fontWeight: '600' }}>{addr.postal_code}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Account;
