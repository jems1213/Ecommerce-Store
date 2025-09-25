import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../utils/apiClient';
import { FiUser, FiShoppingBag, FiSettings, FiHeart, FiMapPin, FiCreditCard, FiLogOut } from 'react-icons/fi';
import './Account.css';

const Account = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!token || !storedUser) {
          navigate('/login');
          return;
        }

        // Verify token with backend
        const response = await fetch(`/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Session expired');
        }

        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Load mock data (replace with actual API calls)
        loadMockData();

      } catch (error) {
        console.error('Authentication error:', error);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    const loadMockData = () => {
      // Mock data - replace with real API calls
      setOrders([
        { id: 'ORD-12345', date: new Date().toISOString(), total: 129.99, status: 'Delivered', items: 2 },
        { id: 'ORD-12344', date: new Date(Date.now() - 86400000).toISOString(), total: 89.99, status: 'Shipped', items: 1 }
      ]);
      
      setAddresses([
        { id: 1, type: 'Home', street: '123 Main St', city: 'New York', state: 'NY', zip: '10001', isDefault: true },
        { id: 2, type: 'Work', street: '456 Business Ave', city: 'New York', state: 'NY', zip: '10002', isDefault: false }
      ]);
      
      setPaymentMethods([
        { id: 1, type: 'Visa', last4: '4242', expiry: '12/25', isDefault: true },
        { id: 2, type: 'Mastercard', last4: '5555', expiry: '06/24', isDefault: false }
      ]);
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.dispatchEvent(new Event('storage')); // Notify other tabs/components
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
        {activeTab === 'wishlist' && <WishlistTab />}
        {activeTab === 'addresses' && <AddressesTab addresses={addresses} />}
        {activeTab === 'payments' && <PaymentsTab paymentMethods={paymentMethods} />}
        {activeTab === 'settings' && <SettingsTab user={user} />}
      </div>
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
        <button className="primary-btn">Start Shopping</button>
      </div>
    ) : (
      <div className="orders-list">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <span className="order-id">Order #{order.id}</span>
              <span className={`status ${order.status.toLowerCase()}`}>{order.status}</span>
            </div>
            <div className="order-details">
              <div>
                <span className="detail-label">Date</span>
                <span>{new Date(order.date).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="detail-label">Items</span>
                <span>{order.items}</span>
              </div>
              <div>
                <span className="detail-label">Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
            <button className="view-order-btn">View Details</button>
          </div>
        ))}
      </div>
    )}
  </div>
);

const WishlistTab = () => (
  <div className="tab-content">
    <h2>Your Wishlist</h2>
    <div className="empty-state">
      <p>Your wishlist is currently empty.</p>
      <button className="primary-btn">Browse Products</button>
    </div>
  </div>
);

const AddressesTab = ({ addresses }) => (
  <div className="tab-content">
    <div className="section-header">
      <h2>Saved Addresses</h2>
      <button className="primary-btn">Add New Address</button>
    </div>
    
    <div className="addresses-grid">
      {addresses.map(address => (
        <div key={address.id} className={`address-card ${address.isDefault ? 'default' : ''}`}>
          <div className="address-header">
            <h3>{address.type}</h3>
            {address.isDefault && <span className="default-badge">Default</span>}
          </div>
          <p>{address.street}</p>
          <p>{address.city}, {address.state} {address.zip}</p>
          <div className="address-actions">
            <button className="edit-btn">Edit</button>
            {!address.isDefault && <button className="delete-btn">Delete</button>}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PaymentsTab = ({ paymentMethods }) => (
  <div className="tab-content">
    <div className="section-header">
      <h2>Payment Methods</h2>
      <button className="primary-btn">Add New Card</button>
    </div>
    
    <div className="payments-list">
      {paymentMethods.map(payment => (
        <div key={payment.id} className={`payment-card ${payment.isDefault ? 'default' : ''}`}>
          <div className="payment-header">
            <div className="card-type">{payment.type}</div>
            {payment.isDefault && <span className="default-badge">Default</span>}
          </div>
          <div className="card-number">•••• •••• •••• {payment.last4}</div>
          <div className="card-expiry">Expires {payment.expiry}</div>
          <div className="payment-actions">
            <button className="edit-btn">Edit</button>
            {!payment.isDefault && <button className="delete-btn">Delete</button>}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SettingsTab = ({ user }) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Update failed');
      }

      const data = await response.json();
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.reload();
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
