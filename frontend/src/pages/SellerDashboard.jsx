import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, TrendingUp, IndianRupee, Layers, PlusCircle, LayoutDashboard, ShoppingCart } from 'lucide-react';

const SellerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total_products: 0, total_stock: 0, total_orders: 0, estimated_sales: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/seller/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="page-container" style={{ textAlign: 'center', padding: '60px' }}>Loading dashboard...</div>;
  }

  return (
    <div className="page-container flex-col-to-row">
      
      {/* Seller Sidebar */}
      <div style={{ width: '100%', maxWidth: '280px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="card" style={{ padding: '0' }}>
          <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--primary)', color: 'white', borderTopLeftRadius: 'var(--radius-md)', borderTopRightRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Seller Central</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '4px' }}>Manage your business</div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Link to="/seller" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--primary)', backgroundColor: 'var(--bg-subtle)', fontWeight: '600', textDecoration: 'none', borderLeft: '4px solid var(--primary)' }}>
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            
            <Link to="/seller/products" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)', textDecoration: 'none', borderBottom: '1px solid var(--border-subtle)', borderLeft: '4px solid transparent' }}>
              <Package size={18} /> My Products
            </Link>
            
            <Link to="/seller/products/new" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)', textDecoration: 'none', borderBottom: '1px solid var(--border-subtle)', borderLeft: '4px solid transparent' }}>
              <PlusCircle size={18} /> Add Product
            </Link>
            
            <Link to="/seller/orders" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)', textDecoration: 'none', borderLeft: '4px solid transparent' }}>
              <ShoppingCart size={18} /> Customer Orders
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="card" style={{ padding: '24px', backgroundColor: '#e3f2fd', border: 'none' }}>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '8px' }}>Welcome back, Seller</h1>
          <p style={{ color: 'var(--text-main)', opacity: 0.8 }}>Here's what's happening with your store today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2" style={{ gap: '20px' }}>
          
          <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(40, 116, 240, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={28} color="var(--primary)" />
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Total Products</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{stats.total_products}</div>
            </div>
          </div>

          <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(56, 142, 60, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={28} color="var(--success)" />
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Total Stock</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{stats.total_stock}</div>
            </div>
          </div>

          <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(251, 100, 27, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingCart size={28} color="var(--secondary)" />
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Total Orders</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{stats.total_orders}</div>
            </div>
          </div>

          <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(0, 150, 136, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IndianRupee size={28} color="#009688" />
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Estimated Sales</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                {stats.total_orders > 0 ? `₹${stats.estimated_sales}` : 'N/A'}
              </div>
            </div>
          </div>

        </div>

        {/* Quick Actions */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>Quick Actions</h2>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/seller/products/new" className="btn btn-primary" style={{ padding: '12px 24px' }}>Add Product</Link>
            <Link to="/seller/products" className="btn btn-outline" style={{ padding: '12px 24px' }}>Manage Products</Link>
            <Link to="/seller/orders" className="btn btn-outline" style={{ padding: '12px 24px' }}>View Orders</Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SellerDashboard;
