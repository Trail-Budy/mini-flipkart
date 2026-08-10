import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { Users, Package, ShoppingCart, IndianRupee, AlertTriangle, Box } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/admin/stats');
      if (!res.ok) throw new Error('Failed to load admin statistics');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>Loading dashboard...</div>;
  }

  if (!stats) {
    return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--error)' }}>Failed to load data.</div>;
  }

  const statCards = [
    { title: 'Total Revenue', value: `₹${Number(stats.total_revenue).toLocaleString()}`, icon: IndianRupee, color: '#10b981' },
    { title: 'Total Orders', value: stats.total_orders, icon: ShoppingCart, color: '#3b82f6' },
    { title: 'Total Products', value: stats.total_products, icon: Package, color: '#8b5cf6' },
    { title: 'Total Users', value: stats.total_users, icon: Users, color: '#f59e0b' },
    { title: 'Pending Orders', value: stats.pending_orders, icon: AlertTriangle, color: '#ef4444' },
    { title: 'Low Stock Products', value: stats.low_stock_products, icon: Box, color: '#f97316' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '8px', color: 'var(--text-main)' }}>Platform Overview</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Welcome to the admin dashboard. Here is what's happening on your platform today.</p>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-md)', backgroundColor: `${card.color}15`, display: 'flex', justifyContent: 'center', alignItems: 'center', color: card.color }}>
                <Icon size={28} />
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px', fontWeight: '500' }}>{card.title}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)' }}>{card.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <h2 style={{ fontSize: '1.3rem', marginBottom: '16px', color: 'var(--text-main)' }}>Quick Actions</h2>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <Link to="/admin/users" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Users size={16} /> Manage Users
        </Link>
        <Link to="/admin/products" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Package size={16} /> Manage Products
        </Link>
        <Link to="/admin/orders" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingCart size={16} /> Manage Orders
        </Link>
      </div>

    </div>
  );
};

export default AdminDashboard;
