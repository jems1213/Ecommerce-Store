import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { API_BASE } from '../../utils/apiClient';
import AddressForm from './AddressForm';
import PaymentForm from './PaymentForm';
import { FiUser, FiShoppingBag, FiSettings, FiHeart, FiMapPin, FiCreditCard, FiLogOut } from 'react-icons/fi';
import './Account.css';

const Account = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!token && !storedUser) {
        navigate('/login');
        setLoading(false);
        return;
      }

      // Try to fetch the authoritative user info from backend. If it fails
      // but we have a cached user, use the cached copy and continue.
      let serverUser = null;
      try {
        const meRes = await api.get('/api/auth/me', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        if (meRes?.data?.status === 'success') {
          serverUser = meRes.data.user;
          setUser(serverUser);
          localStorage.setItem('user', JSON.stringify(serverUser));
        } else {
          throw new Error('Invalid session response');
        }
      } catch (err) {
        console.warn('Failed to fetch /api/auth/me:', err?.message || err);
        // fallback to cached user if present
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
          } catch (e) {
            console.error('Failed to parse cached user', e);
            handleLogout();
            setLoading(false);
            return;
          }
        } else {
          // no token and no cached user -> force login
          handleLogout();
          setLoading(false);
          return;
        }
      }

      // Fetch related account data but tolerate partial failures
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const results = await Promise.allSettled([
          api.get('/api/orders', { headers }),
          api.get('/api/addresses', { headers }),
          api.get('/api/payment-methods', { headers }),
          api.get('/api/wishlist', { headers })
        ]);

        // Orders
        if (results[0].status === 'fulfilled') {
          const r = results[0].value;
          if (r?.data?.status === 'success') setOrders(r.data.data.orders || []);
        } else {
          console.warn('Orders fetch failed:', results[0].reason);
        }

        // Addresses
        if (results[1].status === 'fulfilled') {
          const r = results[1].value;
          if (r?.data?.status === 'success') setAddresses(r.data.data.addresses || []);
        } else {
          console.warn('Addresses fetch failed:', results[1].reason);
        }

        // Payments
        if (results[2].status === 'fulfilled') {
          const r = results[2].value;
          if (r?.data?.status === 'success') setPaymentMethods(r.data.data.paymentMethods || []);
        } else {
          console.warn('Payment methods fetch failed:', results[2].reason);
        }

        // Wishlist
        if (results[3].status === 'fulfilled') {
          const r = results[3].value;
          if (r?.data?.status === 'success') setWishlist(r.data.data.wishlist || []);
        } else {
          console.warn('Wishlist fetch failed:', results[3].reason);
        }
      } catch (err) {
        console.error('Unexpected error fetching account sub-resources:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.dispatchEvent(new Event('storage'));
  };

  // Modal state for add/edit
  const [addressModal, setAddressModal] = React.useState({ open: false, data: null });
  const [paymentModal, setPaymentModal] = React.useState({ open: false, data: null });

  // Address modal controls
  const openAddAddress = () => setAddressModal({ open: true, data: null });
  const openEditAddress = (addr) => setAddressModal({ open: true, data: addr });
  const closeAddressModal = () => setAddressModal({ open: false, data: null });

  const buildUrl = (path) => {
    try { return API_BASE ? API_BASE.replace(/\/$/, '') + path : path; } catch (e) { return path; }
  };

  const saveAddress = async (payload) => {
    try {
      const token = localStorage.getItem('token');
      if (addressModal.data && (addressModal.data._id || addressModal.data.id)) {
        const id = addressModal.data._id || addressModal.data.id;
        const res = await api.put(buildUrl(`/api/addresses/${id}`), payload, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.status === 'success') {
          setAddresses(prev => prev.map(a => (a._id === id || a.id === id) ? res.data.data.address : a));
        }
      } else {
        const res = await api.post(buildUrl('/api/addresses'), payload, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.status === 'success') {
          setAddresses(prev => [...prev, res.data.data.address]);
        }
      }
    } catch (err) {
      console.error('Save address failed', err);
      alert('Failed to save address');
    } finally {
      closeAddressModal();
    }
  };

  const deleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await api.delete(buildUrl(`/api/addresses/${id}`), { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.status === 'success') {
        setAddresses(prev => prev.filter(a => a._id !== id && a.id !== id));
      }
    } catch (err) {
      console.error('Delete address failed', err);
      alert('Failed to delete address.');
    }
  };

  // Payment modal controls
  const openAddPayment = () => setPaymentModal({ open: true, data: null });
  const openEditPayment = (pm) => setPaymentModal({ open: true, data: pm });
  const closePaymentModal = () => setPaymentModal({ open: false, data: null });

  const savePayment = async (payload) => {
    try {
      const token = localStorage.getItem('token');
      if (paymentModal.data && (paymentModal.data._id || paymentModal.data.id)) {
        const id = paymentModal.data._id || paymentModal.data.id;
        const res = await api.put(buildUrl(`/api/payment-methods/${id}`), payload, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.status === 'success') {
          setPaymentMethods(prev => prev.map(p => (p._id === id || p.id === id) ? res.data.data.paymentMethod : p));
        }
      } else {
        const res = await api.post(buildUrl('/api/payment-methods'), payload, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.status === 'success') {
          setPaymentMethods(prev => [...prev, res.data.data.paymentMethod]);
        }
      }
    } catch (err) {
      console.error('Save payment failed', err);
      alert('Failed to save card');
    } finally {
      closePaymentModal();
    }
  };

  const deletePayment = async (id) => {
    if (!window.confirm('Remove this card?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await api.delete(buildUrl(`/api/payment-methods/${id}`), { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.status === 'success') {
        setPaymentMethods(prev => prev.filter(p => p._id !== id && p.id !== id));
      }
    } catch (err) {
      console.error('Delete payment failed', err);
      alert('Failed to remove card.');
    }
  };

  if (loading) {
    return (
      <div className="account-loading">
        <div className="spinner"></div>
        <p>Loading your account...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="account-error">
        <p>Unable to load account data</p>
        <button 
          className="retry-btn"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
        <button 
          className="logout-btn"
          onClick={handleLogout}
        >
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="account-container">
      <div className="account-sidebar">
        <div className="user-summary">
          <img 
            src={user.avatar || 'https://www.gravatar.com/avatar/?d=mp'} 
            alt="User" 
            className="user-avatar"
          />
          <h3>{user.firstName} {user.lastName}</h3>
          <p>{user.email}</p>
        </div>

        <nav className="account-nav">
          <button 
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <FiUser className="nav-icon" /> Profile
          </button>
          <button 
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <FiShoppingBag className="nav-icon" /> My Orders
          </button>
          <button 
            className={`nav-item ${activeTab === 'wishlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('wishlist')}
          >
            <FiHeart className="nav-icon" /> Wishlist
          </button>
          <button 
            className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
            onClick={() => setActiveTab('addresses')}
          >
            <FiMapPin className="nav-icon" /> Addresses
          </button>
          <button 
            className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            <FiCreditCard className="nav-icon" /> Payment Methods
          </button>
          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <FiSettings className="nav-icon" /> Settings
          </button>
          <button 
            className="nav-item logout" 
            onClick={handleLogout}
          >
            <FiLogOut className="nav-icon" /> Logout
          </button>
        </nav>
      </div>

      <div className="account-content">
        {activeTab === 'profile' && <ProfileTab user={user} />}
        {activeTab === 'orders' && <OrdersTab orders={orders} />}
        {activeTab === 'wishlist' && <WishlistTab wishlist={wishlist} />}
        {activeTab === 'addresses' && <AddressesTab addresses={addresses} onAdd={openAddAddress} onEdit={openEditAddress} onDelete={deleteAddress} />}
        {activeTab === 'payments' && <PaymentsTab paymentMethods={paymentMethods} onAdd={openAddPayment} onEdit={openEditPayment} onDelete={deletePayment} />}
        {activeTab === 'settings' && <SettingsTab user={user} onUpdateUser={setUser} />}
      </div>

      {/* Modals */}
      {addressModal.open && (
        <AddressForm
          initial={addressModal.data || {}}
          onCancel={() => setAddressModal({ open: false, data: null })}
          onSave={saveAddress}
        />
      )}

      {paymentModal.open && (
        <PaymentForm
          initial={paymentModal.data || {}}
          onCancel={() => setPaymentModal({ open: false, data: null })}
          onSave={savePayment}
        />
      )}
    </div>
  );
};

// Tab Components
const ProfileTab = ({ user }) => (
  <div className="tab-content">
    <h2>Profile Information</h2>
    <div className="profile-card">
      <div className="avatar-container">
        <img 
          src={user.avatar || 'https://www.gravatar.com/avatar/?d=mp'} 
          alt="User" 
          className="profile-avatar"
        />
        <button className="edit-avatar">Change Photo</button>
      </div>
      
      <div className="profile-details">
        <div className="detail-row">
          <label>First Name</label>
          <p>{user.firstName}</p>
        </div>
        <div className="detail-row">
          <label>Last Name</label>
          <p>{user.lastName}</p>
        </div>
        <div className="detail-row">
          <label>Email</label>
          <p>{user.email}</p>
        </div>
        <div className="detail-row">
          <label>Member Since</label>
          <p>{new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  </div>
);

const OrdersTab = ({ orders }) => (
  <div className="tab-content">
    <h2>Order History</h2>
    {orders.length === 0 ? (
      <div className="empty-state">
        <p>You haven't placed any orders yet.</p>
        <button className="primary-btn" onClick={() => window.location.href = '/shop'}>Start Shopping</button>
      </div>
    ) : (
      <div className="orders-list">
        {orders.map(order => (
          <div key={order._id || order.id} className="order-card">
            <div className="order-header">
              <span className="order-id">Order #{order._id || order.id}</span>
              <span className={`status ${order.status?.toLowerCase()}`}>{order.status}</span>
            </div>
            <div className="order-details">
              <div>
                <span className="detail-label">Date</span>
                <span>{new Date(order.createdAt || order.date).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="detail-label">Items</span>
                <span>{(order.items || []).length}</span>
              </div>
              <div>
                <span className="detail-label">Total</span>
                <span>${(order.total || 0).toFixed(2)}</span>
              </div>
            </div>
            <button className="view-order-btn">View Details</button>
          </div>
        ))}
      </div>
    )}
  </div>
);

const WishlistTab = ({ wishlist }) => (
  <div className="tab-content">
    <h2>Your Wishlist</h2>
    {wishlist.length === 0 ? (
      <div className="empty-state">
        <p>Your wishlist is currently empty.</p>
        <button className="primary-btn" onClick={() => window.location.href = '/shop'}>Browse Products</button>
      </div>
    ) : (
      <div className="wishlist-grid">
        {wishlist.map(item => (
          <div key={item._id || item.id} className="wishlist-card">
            <img src={item.images?.[0] || '/src/assets/default-shoe.svg'} alt={item.name} />
            <div className="wishlist-info">
              <h4>{item.name}</h4>
              <p>${item.price?.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const AddressesTab = ({ addresses, onAdd, onEdit, onDelete }) => (
  <div className="tab-content">
    <div className="section-header">
      <h2>Saved Addresses</h2>
      <button className="primary-btn" onClick={onAdd}>Add New Address</button>
    </div>

    <div className="addresses-grid">
      {addresses.map(address => (
        <div key={address._id || address.id} className={`address-card ${address.isDefault ? 'default' : ''}`}>
          <div className="address-header">
            <h3>{address.type}</h3>
            {address.isDefault && <span className="default-badge">Default</span>}
          </div>
          <p>{address.street}</p>
          <p>{address.city}, {address.state} {address.zip}</p>
          <div className="address-actions">
            <button className="edit-btn" onClick={() => onEdit(address)}>Edit</button>
            {!address.isDefault && <button className="delete-btn" onClick={() => onDelete(address._id || address.id)}>Delete</button>}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PaymentsTab = ({ paymentMethods, onAdd, onEdit, onDelete }) => (
  <div className="tab-content">
    <div className="section-header">
      <h2>Payment Methods</h2>
      <button className="primary-btn" onClick={onAdd}>Add New Card</button>
    </div>

    <div className="payments-list">
      {paymentMethods.map(payment => (
        <div key={payment._id || payment.id} className={`payment-card ${payment.isDefault ? 'default' : ''}`}>
          <div className="payment-header">
            <div className="card-type">{payment.type}</div>
            {payment.isDefault && <span className="default-badge">Default</span>}
          </div>
          <div className="card-number">•••• •••• •••• {payment.last4}</div>
          <div className="card-expiry">Expires {payment.expiry}</div>
          <div className="payment-actions">
            <button className="edit-btn" onClick={() => onEdit(payment)}>Edit</button>
            {!payment.isDefault && <button className="delete-btn" onClick={() => onDelete(payment._id || payment.id)}>Delete</button>}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SettingsTab = ({ user, onUpdateUser }) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        alert('New password and confirm password do not match');
        return;
      }

      const token = localStorage.getItem('token');
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      };

      if (formData.currentPassword && formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      const res = await api.put('/api/auth/update', payload, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data.status === 'success') {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        onUpdateUser(res.data.user);
        alert('Profile updated successfully');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  return (
    <div className="tab-content">
      <h2>Account Settings</h2>
      
      <form className="settings-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Change Password</h3>
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Enter current password"
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              minLength="8"
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              minLength="8"
            />
          </div>
        </div>

        <button type="submit" className="save-btn">Save Changes</button>
      </form>
    </div>
  );
};

export default Account;
