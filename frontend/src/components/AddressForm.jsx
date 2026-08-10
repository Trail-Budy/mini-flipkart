import { useState, useEffect } from 'react';

const AddressForm = ({ initialData = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India' // Default country
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        full_name: initialData.full_name || '',
        phone: initialData.phone || '',
        address_line1: initialData.address_line1 || '',
        city: initialData.city || '',
        state: initialData.state || '',
        postal_code: initialData.postal_code || '',
        country: initialData.country || 'India'
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ backgroundColor: '#f5faff', padding: '24px', borderRadius: 'var(--radius-sm)' }}>
      
      <div className="grid grid-cols-2" style={{ gap: '16px', marginBottom: '16px' }}>
        <div>
          <input 
            type="text" 
            name="full_name" 
            placeholder="Name" 
            value={formData.full_name} 
            onChange={handleChange} 
            required 
            className="input-field"
          />
        </div>
        <div>
          <input 
            type="text" 
            name="phone" 
            placeholder="10-digit mobile number" 
            value={formData.phone} 
            onChange={handleChange} 
            required 
            className="input-field"
          />
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ gap: '16px', marginBottom: '16px' }}>
        <div>
          <input 
            type="text" 
            name="postal_code" 
            placeholder="Pincode" 
            value={formData.postal_code} 
            onChange={handleChange} 
            required 
            className="input-field"
          />
        </div>
        <div>
          <input 
            type="text" 
            name="city" 
            placeholder="City/District/Town" 
            value={formData.city} 
            onChange={handleChange} 
            required 
            className="input-field"
          />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <textarea 
          name="address_line1" 
          placeholder="Address (Area and Street)" 
          value={formData.address_line1} 
          onChange={handleChange} 
          required 
          className="input-field"
          rows="3"
          style={{ resize: 'none' }}
        ></textarea>
      </div>

      <div className="grid grid-cols-2" style={{ gap: '16px', marginBottom: '24px' }}>
        <div>
          <input 
            type="text" 
            name="state" 
            placeholder="State" 
            value={formData.state} 
            onChange={handleChange} 
            required 
            className="input-field"
          />
        </div>
        <div>
          <input 
            type="text" 
            name="country" 
            placeholder="Country" 
            value={formData.country} 
            onChange={handleChange} 
            required 
            className="input-field"
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <button type="submit" className="btn btn-secondary" style={{ padding: '12px 32px', textTransform: 'uppercase', borderRadius: '2px', backgroundColor: '#fb641b', color: 'white' }}>
          Save and Deliver Here
        </button>
        <button type="button" onClick={onCancel} className="btn btn-outline" style={{ padding: '12px 32px', color: 'var(--primary)', border: 'none', backgroundColor: 'transparent' }}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AddressForm;
