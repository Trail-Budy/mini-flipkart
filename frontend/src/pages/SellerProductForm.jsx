import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Save } from 'lucide-react';

const SellerProductForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    price: '',
    original_price: '',
    stock: '',
    image_url: ''
  });

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
        if (!isEditMode && data.length > 0) {
          setFormData(prev => ({ ...prev, category_id: data[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchProduct = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + `/api/products/${id}`);
      if (!res.ok) {
        showToast('Product not found or access denied', 'error');
        navigate('/seller/products');
        return;
      }
      const data = await res.json();
      setFormData({
        name: data.name || '',
        description: data.description || '',
        category_id: data.category_id || '',
        price: data.price || '',
        original_price: data.original_price || '',
        stock: data.stock || 0,
        image_url: data.image_url || ''
      });
    } catch (err) {
      showToast('Failed to load product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Basic validation handled by HTML5, but we ensure numbers are parsed properly
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        stock: parseInt(formData.stock, 10),
        category_id: parseInt(formData.category_id, 10)
      };

      const url = isEditMode ? `/api/seller/products/${id}` : '/api/seller/products';
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save product');
      }

      showToast(`Product ${isEditMode ? 'updated' : 'created'} successfully`, 'success');
      navigate('/seller/products');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="page-container" style={{ textAlign: 'center', padding: '60px' }}>Loading product details...</div>;
  }

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      
      <div style={{ marginBottom: '20px' }}>
        <Link to="/seller/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: '500' }}>
          <ArrowLeft size={16} /> Back to Products
        </Link>
      </div>

      <div className="card">
        <div className="card-header" style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="input-group">
            <label className="input-label">Product Name *</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Description *</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="input-field"
              rows="4"
              placeholder="Detailed product description..."
              style={{ resize: 'vertical' }}
            ></textarea>
          </div>

          <div className="grid grid-cols-2">
            <div className="input-group">
              <label className="input-label">Category *</label>
              <select 
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="" disabled>Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Available Stock *</label>
              <input 
                type="number" 
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                min="0"
                step="1"
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2">
            <div className="input-group">
              <label className="input-label">Selling Price (₹) *</label>
              <input 
                type="number" 
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="1"
                step="0.01"
                className="input-field"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Original Price (₹) (Optional)</label>
              <input 
                type="number" 
                name="original_price"
                value={formData.original_price}
                onChange={handleChange}
                min="1"
                step="0.01"
                className="input-field"
                placeholder="For discount strikethrough"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Image URL</label>
            <input 
              type="url" 
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              className="input-field"
              placeholder="https://example.com/image.jpg"
            />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Make sure this is a direct link to an image file (e.g. ends in .jpg, .png, .webp), not a link to a webpage.
            </div>
            {formData.image_url && (
              <div style={{ marginTop: '12px', width: '100px', height: '100px', border: '1px solid var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                <img src={formData.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=Invalid+URL'; }} />
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '24px', display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
            <Link to="/seller/products" className="btn btn-outline" style={{ padding: '12px 24px' }}>
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={saving}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 32px' }}
            >
              <Save size={18} /> {saving ? 'Saving...' : 'Save Product'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default SellerProductForm;
