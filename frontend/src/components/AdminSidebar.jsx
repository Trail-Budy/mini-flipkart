import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Store, Package, Layers, ShoppingCart, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/products', label: 'Products', icon: Package },
    { path: '/admin/categories', label: 'Categories', icon: Layers },
    { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{ 
      width: '260px', 
      backgroundColor: 'var(--bg-surface)', 
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 70px)', // Adjust based on your navbar height
      position: 'sticky',
      top: '70px',
      overflowY: 'auto'
    }} className="desktop-only">
      
      <div style={{ padding: '24px', flex: 1 }}>
        <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '16px', fontWeight: '700' }}>
          Admin Platform
        </h3>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link 
                key={item.path} 
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  color: active ? 'var(--primary)' : 'var(--text-main)',
                  backgroundColor: active ? 'var(--bg-subtle)' : 'transparent',
                  fontWeight: active ? '600' : '500',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s ease, color 0.2s ease'
                }}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div style={{ padding: '24px', borderTop: '1px solid var(--border-subtle)' }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link 
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-main)',
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            <ArrowLeft size={20} />
            Back to Store
          </Link>
          <button 
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--error)',
              backgroundColor: 'transparent',
              border: 'none',
              fontWeight: '500',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left'
            }}
          >
            <LogOut size={20} />
            Logout
          </button>
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
