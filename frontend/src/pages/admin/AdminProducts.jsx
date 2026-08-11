import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { Search, Trash2, Box } from 'lucide-react';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/admin/products', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone unless it is blocked by order history safety.`)) {
      return;
    }

    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + `/api/admin/products/${productId}`, {
        credentials: 'include',
        method: 'DELETE'
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete product');
      }
      
      showToast('Product deleted successfully', 'success');
      fetchProducts(); // Refresh list
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.seller_name && p.seller_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div style={{ padding: '40px' }}>Loading products...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '4px' }}>Manage Products</h1>
          <p style={{ color: 'var(--text-muted)' }}>View and remove items from the platform</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '16px', display: 'flex', gap: '16px', backgroundColor: 'var(--bg-surface)' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by product name or seller..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none' }}
          />
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-subtle)' }}>
              <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem', width: '60px' }}>Image</th>
              <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Product</th>
              <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Category</th>
              <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Seller</th>
              <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Price</th>
              <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Stock</th>
              <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No products found.</td>
              </tr>
            ) : (
              filteredProducts.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      ) : (
                        <Box size={20} color="var(--border-color)" />
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: '500', color: 'var(--text-main)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={p.name}>
                      {p.name}
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {p.category_name || '-'}
                  </td>
                  <td style={{ padding: '16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {p.seller_name || 'System Admin'}
                  </td>
                  <td style={{ padding: '16px', fontWeight: '600' }}>
                    ₹{p.price}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '500',
                      backgroundColor: p.stock > 10 ? 'rgba(16, 185, 129, 0.1)' : p.stock > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: p.stock > 10 ? 'var(--success)' : p.stock > 0 ? '#f59e0b' : 'var(--error)'
                    }}>
                      {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDelete(p.id, p.name)}
                      style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '8px' }}
                      title="Delete Product"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProducts;
