import React, { useState, useEffect } from 'react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../utils/apiClient';
import { 
  FiCheck, 
  FiArrowRight, 
  FiLoader, 
  FiMapPin, 
  FiCopy, 
  FiExternalLink,
  FiShoppingBag,
  FiHome,
  FiCreditCard,
  FiDollarSign
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import './Checkout.css';

const CheckoutForm = ({ cart = [], total = 0, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'IN',
    phone: '' 
  });
  const [activeStep, setActiveStep] = useState(1);
  const [upiId] = useState(`merchant${Math.floor(100000 + Math.random() * 900000)}@upi`); 
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedShipping = localStorage.getItem('shippingInfo');
    if (savedShipping) {
      setShippingInfo(JSON.parse(savedShipping));
    }
  }, []);

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => {
      const newInfo = { ...prev, [name]: value };
      localStorage.setItem('shippingInfo', JSON.stringify(newInfo));
      return newInfo;
    });
    if (error) setError(null);
  };

  const validateShipping = () => {
    const requiredFields = ['name', 'address', 'city', 'state', 'zip', 'phone'];
    const missingFields = requiredFields.filter(field => !shippingInfo[field]);
    
    if (missingFields.length > 0) {
      setError(`Please fill in: ${missingFields.join(', ')}`);
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(shippingInfo.phone)) {
      setError('Please enter a valid 10-digit Indian phone number (starts with 6-9)');
      return false;
    }

    return true;
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (validateShipping()) {
      setActiveStep(2);
      setError(null); 
    }
  };

  const createOrder = async (paymentStatus = 'pending') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in.');
      }

      const validCartItems = cart.filter(item => {
        const isValidObjectIdFormat = typeof item.id === 'string' && item.id.length === 24 && /^[0-9a-fA-F]+$/.test(item.id);
        if (!isValidObjectIdFormat) {
          console.error(`Invalid item ID: ${item.id}`);
          return false;
        }
        return true;
      });

      if (validCartItems.length === 0 && cart.length > 0) {
        throw new Error('No valid items found in cart to place an order.');
      }

      const orderData = {
        items: validCartItems.map(item => ({
          shoeId: item.id, 
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.selectedSize,
          color: item.selectedColor,
          image: item.images?.[0] || ''
        })),
        total: total,
        shippingInfo,
        paymentMethod,
        paymentStatus
      };

      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      return await response.json();
    } catch (err) {
      console.error('Order creation error:', err);
      setError(err.message || 'Failed to create order. Please try again.');
      throw err;
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!cart?.length) {
        throw new Error('Your cart is empty. Please add items before proceeding.');
      }

      const { data } = await createOrder(paymentMethod === 'upi' ? 'pending' : 'pending');
      setOrderDetails(data.order);
      
      if (paymentMethod === 'upi') {
        setActiveStep(2.5);
      } else { 
        onSuccess?.(data.order);
        setActiveStep(3); 
      }
    } catch (err) {
      // Error is already handled in createOrder
    } finally {
      setLoading(false);
    }
  };

  const verifyUpiPayment = async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in.');
      }

      const response = await fetch(`${API_BASE}/api/orders/${orderDetails._id}/verify-payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ paymentStatus: 'completed' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Payment verification failed');
      }

      const { data } = await response.json();
      setPaymentVerified(true);
      setOrderDetails(data.order);
      
      setTimeout(() => {
        onSuccess?.(data.order);
        setActiveStep(3);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Payment verification failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const openUpiApp = () => {
    alert(`Simulating UPI payment to ${upiId} for ₹${total.toFixed(2)}`);
  };

  const displayTotal = paymentMethod === 'cod' ? (total + 50).toFixed(2) : total.toFixed(2);

  return (
    <motion.div 
      className="checkout-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="checkout-steps">
        {[1, 2, 3].map((step) => (
          <div key={step} className={`step ${activeStep >= step ? 'active' : ''}`}>
            <div className="step-number">{step}</div>
            <div className="step-title">
              {step === 1 ? 'Shipping' : step === 2 ? 'Payment' : 'Confirmation'}
            </div>
          </div>
        ))}
      </div>

      {activeStep === 1 && (
        <motion.form 
          onSubmit={handleShippingSubmit} 
          className="shipping-form"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="section-title">
            <FiMapPin className="icon" /> Shipping Information
          </h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={shippingInfo.name}
              onChange={handleShippingChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel" 
              id="phone"
              name="phone"
              value={shippingInfo.phone}
              onChange={handleShippingChange}
              pattern="[0-9]{10}" 
              title="10-digit Indian phone number"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={shippingInfo.address}
              onChange={handleShippingChange}
              required
              rows="3"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={shippingInfo.city}
                onChange={handleShippingChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="state">State</label>
              <input
                type="text"
                id="state"
                name="state"
                value={shippingInfo.state}
                onChange={handleShippingChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="zip">ZIP Code</label>
              <input
                type="text"
                id="zip"
                name="zip"
                value={shippingInfo.zip}
                onChange={handleShippingChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="country">Country</label>
              <select
                id="country"
                name="country"
                value={shippingInfo.country}
                onChange={handleShippingChange}
                required
              >
                <option value="IN">India</option>
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
              </select>
            </div>
          </div>
          
          <button type="submit" className="continue-btn">
            Continue to Payment <FiArrowRight className="icon" />
          </button>
        </motion.form>
      )}

      {activeStep === 2 && (
        <motion.form 
          onSubmit={handlePaymentSubmit} 
          className="payment-form"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="section-title">Payment Method</h2>
          
          <div className="payment-methods">
            <div className="payment-method">
              <input
                type="radio"
                id="upi"
                name="paymentMethod"
                value="upi"
                checked={paymentMethod === 'upi'}
                onChange={() => setPaymentMethod('upi')}
              />
              <label htmlFor="upi">
                <FiCreditCard /> UPI Payment
              </label>
            </div>
            <div className="payment-method">
              <input
                type="radio"
                id="cod"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={() => setPaymentMethod('cod')}
              />
              <label htmlFor="cod">
                <FiDollarSign /> Cash on Delivery
              </label>
            </div>
          </div>

          {paymentMethod === 'upi' && (
            <div className="upi-payment-section">
              <h3>Pay via UPI</h3>
              <p>Complete payment using any UPI app</p>
            </div>
          )}

          {paymentMethod === 'cod' && (
            <div className="cod-payment-section">
              <h3>Cash on Delivery</h3>
              <p>Pay when your order arrives</p>
              <div className="cod-note">
                <p>Note: An additional ₹50 will be charged for COD orders</p>
              </div>
            </div>
          )}

          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-items">
              {cart.map((item) => (
                <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="summary-item">
                  <div className="item-info">
                    <span className="item-name">{item.name}</span>
                    {item.selectedSize && <span className="item-size">Size: {item.selectedSize}</span>}
                    {item.selectedColor && (
                      <span className="item-color">
                        Color: <span className="color-swatch" style={{ backgroundColor: item.selectedColor }} />
                      </span>
                    )}
                  </div>
                  <div className="item-quantity-price">
                    <span className="item-quantity">x{item.quantity}</span>
                    <span className="item-price">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="summary-total">
              <span>Subtotal</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            {paymentMethod === 'cod' && (
              <div className="summary-cod-fee">
                <span>COD Fee</span>
                <span>+ ₹50.00</span>
              </div>
            )}
            <div className="summary-final-total">
              <span>Total Payable</span>
              <span>₹{displayTotal}</span>
            </div>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <motion.button 
            type="submit" 
            className="pay-btn"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <FiLoader className="spinner icon" /> Processing...
              </>
            ) : paymentMethod === 'cod' ? (
              'Place Order'
            ) : (
              `Pay ₹${displayTotal}`
            )}
          </motion.button>
        </motion.form>
      )}

      {activeStep === 2.5 && (
        <motion.div 
          className="upi-payment-container"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          <h2>Complete UPI Payment</h2>
          <div className="upi-payment-box">
            <div className="merchant-info">
              <p>Merchant: ShopEase</p>
              <p>Amount: ₹{displayTotal}</p> 
              <p>Order ID: {orderDetails?._id?.slice(-8).toUpperCase()}</p>
            </div>
            
            <div className="upi-id-display">
              <p>Send payment to:</p>
              <div className="upi-id-wrapper">
                <span className="upi-id">{upiId}</span>
                <button 
                  onClick={() => copyToClipboard(upiId)}
                  className="copy-btn"
                  aria-label="Copy UPI ID"
                >
                  <FiCopy />
                </button>
              </div>
            </div>

            <div className="payment-actions">
              <button 
                onClick={openUpiApp}
                className="open-upi-btn"
              >
                Open UPI App <FiExternalLink />
              </button>
              
              {!paymentVerified ? (
                <button 
                  onClick={verifyUpiPayment}
                  className="verify-payment-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FiLoader className="spinner" /> Verifying...
                    </>
                  ) : (
                    'I have made payment'
                  )}
                </button>
              ) : (
                <div className="payment-success">
                  <FiCheck className="success-icon" />
                  Payment Verified!
                </div>
              )}
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
        </motion.div>
      )}

      {activeStep === 3 && (
        <motion.div 
          className="confirmation"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          <div className="confirmation-icon">
            <FiCheck />
          </div>
          <h2>Order Confirmed!</h2>
          <p>Thank you for your purchase. Your order has been received and is being processed.</p>
          
          <div className="order-details">
            <p><strong>Order ID:</strong> {orderDetails?._id?.slice(-8).toUpperCase()}</p>
            <p><strong>Payment Method:</strong> {orderDetails?.paymentMethod === 'upi' ? 'UPI' : 'Cash on Delivery'}</p>
            <p><strong>Total Amount:</strong> ₹{orderDetails?.total?.toFixed(2)}</p>
          </div>

          <div className="confirmation-actions">
            <motion.button 
              onClick={() => navigate('/orders')} 
              className="view-orders-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiShoppingBag /> View My Orders
            </motion.button>
            <motion.button 
              onClick={() => navigate('/')} 
              className="continue-shopping-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiHome /> Back to Home
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [orderComplete, setOrderComplete] = useState(false);
  const navigate = useNavigate();

  const handleOrderSuccess = (orderData) => {
    clearCart();
    setOrderComplete(true);
    localStorage.setItem('lastOrder', JSON.stringify(orderData));
    localStorage.removeItem('shippingInfo');
  };

  if (!cartItems?.length && !orderComplete) {
    return (
      <motion.div 
        className="empty-cart-redirect"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="empty-message">
          <h2>Your cart is empty</h2>
          <p>Please add some items to your cart before checking out</p>
          <motion.button
            onClick={() => navigate('/shop')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Continue Shopping
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="checkout-page">
      <CheckoutForm 
        cart={cartItems} 
        total={cartTotal} 
        onSuccess={handleOrderSuccess} 
      />
    </div>
  );
};

export default Checkout;
