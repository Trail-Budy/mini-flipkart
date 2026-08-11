import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', description: '' });
  
  const { showToast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/admin/categories', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showToast('Category name is required', 'warning');
      return;
    }

    try {
      const url = (import.meta.env.VITE_API_URL || '') + (editingId ? `/api/admin/categories/${editingId}` : '/api/admin/categories');
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        credentials: 'include',
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save category');
      }
      
      showToast(editingId ? 'Category updated successfully' : 'Category created successfully', 'success');
      
      setIsAdding(false);
      setEditingId(null);
      setFormData({ name: '', description: '' });
      fetchCategories();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the category "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + `/api/admin/categories/${id}`, {
        credentials: 'include',
        method: 'DELETE'
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete category');
      }
      
      showToast('Category deleted successfully', 'success');
      fetchCategories();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const startEditing = (category) => {
    setEditingId(category.id);
    setFormData({ name: category.name, description: category.description || '' });
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ name: '', description: '' });
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading categories...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '4px' }}>Manage Categories</h1>
          <p style={{ color: 'var(--text-muted)' }}>Organize products into categories</p>
        </div>
        {!isAdding && !editingId && (
          <button 
            onClick={() => { setIsAdding(true); setFormData({ name: '', description: '' }); }}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
          >
            <Plus size={18} /> Add Category
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>
            {editingId ? 'Edit Category' : 'Create New Category'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Electronics"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Description (Optional)</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief description of this category..."
                rows="3"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', outline: 'none', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button onClick={handleSave} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Save size={16} /> Save Category
              </button>
              <button onClick={cancelEdit} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <X size={16} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-subtle)' }}>
              <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem', width: '80px' }}>ID</th>
              <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Category Name</th>
              <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Products</th>
              <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No categories found.</td>
              </tr>
            ) : (
              categories.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '16px', color: 'var(--text-muted)' }}>#{c.id}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>{c.name}</div>
                    {c.description && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.description}</div>}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '500',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6'
                    }}>
                      {c.product_count} items
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                      <button 
                        onClick={() => startEditing(c)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                        title="Edit Category"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(c.id, c.name)}
                        style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '4px' }}
                        title="Delete Category"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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

export default AdminCategories;
