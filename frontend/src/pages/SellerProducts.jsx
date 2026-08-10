import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Plus, ExternalLink } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/seller/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + `/api/seller/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to delete product');
      
      showToast('Product deleted successfully', 'success');
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return <span style={{ color: 'var(--error)', fontWeight: '600' }}>Out of Stock</span>;
    if (stock <= 10) return <span style={{ color: 'var(--secondary)', fontWeight: '600' }}>Low Stock ({stock})</span>;
    return <span style={{ color: 'var(--success)', fontWeight: '600' }}>In Stock ({stock})</span>;
  };

  if (loading) {
    return <div className="page-container" style={{ textAlign: 'center', padding: '60px' }}>Loading products...</div>;
  }

  return (
    <div className="page-container">
      <div className="card" style={{ padding: '24px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Manage Products</h1>
            <p style={{ color: 'var(--text-muted)' }}>View and edit all products you are currently selling.</p>
          </div>
          <Link to="/seller/products/new" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Add New Product
          </Link>
        </div>

        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--bg-body)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📦</div>
            <h3 style={{ marginBottom: '8px' }}>No products yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>You haven't listed any products for sale.</p>
            <Link to="/seller/products/new" className="btn btn-primary">Start Selling</Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '16px', width: '80px' }}>Image</th>
                  <th style={{ padding: '16px' }}>Product Details</th>
                  <th style={{ padding: '16px' }}>Category</th>
                  <th style={{ padding: '16px' }}>Price</th>
                  <th style={{ padding: '16px' }}>Stock Status</th>
                  <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ width: '60px', height: '60px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <img src={product.image_url || 'https://via.placeholder.com/60'} alt={product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>{product.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID: {product.id}</div>
                    </td>
                    <td style={{ padding: '16px' }}>{product.category_name}</td>
                    <td style={{ padding: '16px', fontWeight: '500' }}>₹{product.price}</td>
                    <td style={{ padding: '16px' }}>{getStockStatus(product.stock)}</td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <Link to={`/products/${product.id}`} className="btn btn-outline" style={{ padding: '8px', border: 'none', color: 'var(--text-muted)' }} title="View on store">
                          <ExternalLink size={18} />
                        </Link>
                        <Link to={`/seller/products/${product.id}/edit`} className="btn btn-outline" style={{ padding: '8px', border: 'none', color: 'var(--primary)' }} title="Edit">
                          <Edit size={18} />
                        </Link>
                        <button onClick={() => handleDelete(product.id)} className="btn btn-outline" style={{ padding: '8px', border: 'none', color: 'var(--error)' }} title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default SellerProducts;
