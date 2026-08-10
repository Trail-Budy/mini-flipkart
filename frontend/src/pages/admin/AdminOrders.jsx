import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { Search, Eye } from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { showToast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/admin/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + `/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update order status');
      }
      
      showToast('Order status updated', 'success');
      fetchOrders();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toString().includes(searchTerm) || 
                          (o.customer_name && o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
      case 'cancelled': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
      case 'shipped': return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' };
      case 'processing': return { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' };
      default: return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }; // pending
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading orders...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '4px' }}>Manage Orders</h1>
          <p style={{ color: 'var(--text-muted)' }}>View and update customer order fulfillment</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap', backgroundColor: 'var(--bg-surface)' }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by Order ID or Customer Name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none' }}
          />
        </div>
        
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'var(--bg-surface)', color: 'var(--text-main)' }}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-subtle)' }}>
              <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Order ID</th>
              <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Customer</th>
              <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Date</th>
              <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total</th>
              <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Status</th>
              <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No orders found.</td>
              </tr>
            ) : (
              filteredOrders.map(o => {
                const colors = getStatusColor(o.status);
                
                return (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '16px', fontWeight: '600' }}>#{o.id}</td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: '500', color: 'var(--text-main)' }}>{o.customer_name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{o.customer_email}</div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px', fontWeight: '600' }}>
                      ₹{Number(o.total_amount).toLocaleString()}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <select 
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        style={{ 
                          padding: '6px 12px', 
                          borderRadius: '12px', 
                          border: 'none', 
                          fontSize: '0.8rem', 
                          fontWeight: '600',
                          backgroundColor: colors.bg,
                          color: colors.color,
                          outline: 'none',
                          cursor: 'pointer',
                          textTransform: 'uppercase'
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <Link 
                        to={`/admin/orders/${o.id}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', textDecoration: 'none', fontWeight: '500', fontSize: '0.9rem' }}
                      >
                        <Eye size={16} /> View
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
