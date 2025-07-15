import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiX, FiPlus, FiMinus, FiArrowLeft, FiLock } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './Cart.css';

const Cart = () => {
  const { 
    cartItems, 
    cartTotal, 
    removeFromCart, 
    updateQuantity, 
    clearCart,
    isAuthenticated,
    user
  } = useCart();
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const shipping = cartItems.length > 0 ? 15 : 0;
  const total = cartTotal + shipping;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    navigate('/checkout');
  };

  if (!isAuthenticated) {
    return (
      <motion.div 
        className="cart-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container">
          <div className="cart-header">
            <Link to="/shop" className="back-link">
              <FiArrowLeft /> Continue Shopping
            </Link>
            <h1>Your Cart</h1>
          </div>

          <motion.div 
            className="auth-required"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <FiLock size={48} />
            <h2>Authentication Required</h2>
            <p>Please login to view and manage your cart</p>
            <div className="auth-buttons">
              <button 
                className="login-btn"
                onClick={() => navigate('/login', { state: { from: '/cart' } })}
              >
                Login
              </button>
              <button 
                className="signup-btn"
                onClick={() => navigate('/signup', { state: { from: '/cart' } })}
              >
                Create Account
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="cart-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container">
        <div className="cart-header">
          <Link to="/shop" className="back-link">
            <FiArrowLeft /> Continue Shopping
          </Link>
          <h1>Your Cart</h1>
          {cartItems.length > 0 && (
            <div className="cart-count">{cartItems.length} items</div>
          )}
        </div>

        {cartItems.length === 0 ? (
          <motion.div 
            className="empty-cart"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <FiShoppingBag size={48} />
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything to your cart yet</p>
            <Link to="/shop" className="shop-btn">
              Browse Products
            </Link>
          </motion.div>
        ) : (
          <div className="cart-container">
            <motion.div 
              className="cart-items"
              layout
            >
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                    className="cart-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    layout
                  >
                    <div className="item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="item-details">
                      <h3>{item.brand}</h3>
                      <h2>{item.name}</h2>
                      {item.selectedSize && <p>Size: {item.selectedSize}</p>}
                      {item.selectedColor && (
                        <p>Color: <span className="color-display" style={{ backgroundColor: item.selectedColor }} /></p>
                      )}
                      <div className="item-price">₹{item.price.toFixed(2)}</div>
                    </div>
                    <div className="item-quantity">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <FiMinus />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <FiPlus />
                      </button>
                    </div>
                    <div className="item-total">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                    <button 
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <FiX />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            <motion.div 
              className="cart-summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>₹{shipping.toFixed(2)}</span>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <button 
                className="checkout-btn"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>
              <button className="clear-cart-btn" onClick={clearCart}>
                Clear Cart
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Cart;