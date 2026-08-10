import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Search, ShieldAlert, CheckCircle, Shield } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + `/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update role');
      }
      
      showToast('Role updated successfully', 'success');
      fetchUsers(); // Refresh data
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) return <div style={{ padding: '40px' }}>Loading users...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '4px' }}>Manage Users</h1>
          <p style={{ color: 'var(--text-muted)' }}>View and manage user roles</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap', backgroundColor: 'var(--bg-surface)' }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none' }}
          />
        </div>
        
        <select 
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'var(--bg-surface)', color: 'var(--text-main)' }}
        >
          <option value="all">All Roles</option>
          <option value="customer">Customers</option>
          <option value="seller">Sellers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-subtle)' }}>
              <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem' }}>ID</th>
              <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem' }}>User</th>
              <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Role</th>
              <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Joined</th>
              <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No users found matching your criteria.</td>
              </tr>
            ) : (
              filteredUsers.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>#{u.id}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: '500', color: 'var(--text-main)', marginBottom: '4px' }}>{u.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.email}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      display: 'inline-block', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase',
                      backgroundColor: u.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : u.role === 'seller' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: u.role === 'admin' ? '#ef4444' : u.role === 'seller' ? '#3b82f6' : '#10b981'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      
                      {u.role !== 'admin' && (
                        <select 
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          value={u.role}
                          style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                        >
                          <option value="customer">Customer</option>
                          <option value="seller">Seller</option>
                        </select>
                      )}

                      {u.role === 'admin' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--error)', fontSize: '0.85rem', fontWeight: '500', padding: '6px 12px' }}>
                          <ShieldAlert size={14} /> Admin
                        </div>
                      )}
                      
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

export default AdminUsers;
