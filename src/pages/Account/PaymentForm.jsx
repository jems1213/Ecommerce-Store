import React, { useState, useEffect } from 'react';
import './Account.css';

const PaymentForm = ({ initial = {}, onCancel, onSave }) => {
  const [form, setForm] = useState({
    type: initial.type || 'Visa',
    last4: initial.last4 || '',
    expiry: initial.expiry || '',
    providerId: initial.providerId || '',
    isDefault: !!initial.isDefault
  });

  useEffect(() => {
    setForm({
      type: initial.type || 'Visa',
      last4: initial.last4 || '',
      expiry: initial.expiry || '',
      providerId: initial.providerId || '',
      isDefault: !!initial.isDefault
    });
  }, [initial]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.last4 || form.last4.length !== 4) {
      alert('Enter last 4 digits of card');
      return;
    }
    if (!form.expiry) {
      alert('Enter expiry date');
      return;
    }
    onSave(form);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{initial._id ? 'Edit Card' : 'Add Card'}</h3>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Card Type</label>
              <select name="type" value={form.type} onChange={handleChange}>
                <option>Visa</option>
                <option>Mastercard</option>
                <option>Amex</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Last 4</label>
              <input name="last4" value={form.last4} onChange={handleChange} maxLength={4} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Expiry (MM/YY)</label>
              <input name="expiry" value={form.expiry} onChange={handleChange} placeholder="MM/YY" />
            </div>
            <div className="form-group">
              <label>Provider ID (optional)</label>
              <input name="providerId" value={form.providerId} onChange={handleChange} />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="save-btn">Save Card</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;
