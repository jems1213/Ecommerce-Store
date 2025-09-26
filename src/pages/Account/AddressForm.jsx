import React, { useState, useEffect } from 'react';
import './Account.css';

const AddressForm = ({ initial = {}, onCancel, onSave }) => {
  const [form, setForm] = useState({
    type: initial.type || 'Home',
    street: initial.street || '',
    city: initial.city || '',
    state: initial.state || '',
    zip: initial.zip || '',
    country: initial.country || 'USA',
    phone: initial.phone || '',
    isDefault: !!initial.isDefault
  });

  useEffect(() => {
    setForm({
      type: initial.type || 'Home',
      street: initial.street || '',
      city: initial.city || '',
      state: initial.state || '',
      zip: initial.zip || '',
      country: initial.country || 'USA',
      phone: initial.phone || '',
      isDefault: !!initial.isDefault
    });
  }, [initial]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation
    if (!form.street || !form.city || !form.state || !form.zip || !form.phone) {
      alert('Please fill required fields');
      return;
    }
    onSave(form);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{initial._id ? 'Edit Address' : 'Add Address'}</h3>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <select name="type" value={form.type} onChange={handleChange}>
                <option>Home</option>
                <option>Work</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Street</label>
            <input name="street" value={form.street} onChange={handleChange} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input name="city" value={form.city} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>State</label>
              <input name="state" value={form.state} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>ZIP</label>
              <input name="zip" value={form.zip} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Country</label>
              <input name="country" value={form.country} onChange={handleChange} />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="save-btn">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressForm;
