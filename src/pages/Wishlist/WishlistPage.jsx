import { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaTrash, FaShoppingCart, FaCheck } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './WishlistPage.css';

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [notification, setNotification] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Load wishlist from localStorage on component mount
  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    setWishlistItems(savedWishlist);
  }, []);

  // Get current cart items from localStorage
  const getCartItems = () => {
    return JSON.parse(localStorage.getItem('cart')) || [];
  };

  // Save cart items to localStorage
  const saveCartItems = (items) => {
    localStorage.setItem('cart', JSON.stringify(items));
  };

  // Show notification
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  // Remove item from wishlist
  const removeFromWishlist = (productId) => {
    setIsAnimating(true);
    setTimeout(() => {
      const updatedWishlist = wishlistItems.filter(item => item.id !== productId);
      setWishlistItems(updatedWishlist);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      showNotification('Item removed from wishlist');
      setIsAnimating(false);
    }, 300);
  };

  // Check if item is already in cart
  const isInCart = (productId) => {
    const cartItems = getCartItems();
    return cartItems.some(item => item.id === productId);
  };

  // Move item to cart (fixed version)
  const moveToCart = (product) => {
    const cartItems = getCartItems();
    
    // Check if product already exists in cart
    const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      // If exists, increase quantity
      const updatedCart = [...cartItems];
      updatedCart[existingItemIndex].quantity += 1;
      saveCartItems(updatedCart);
      showNotification('Item quantity increased in cart');
    } else {
      // If new, add to cart with default options
      const newItem = {
        ...product,
        quantity: 1,
        selectedSize: product.sizes?.[0] || 'One Size', // Default size
        selectedColor: product.colors?.[0] || 'Default' // Default color
      };
      saveCartItems([...cartItems, newItem]);
      showNotification('Item added to cart');
    }
    
    // Remove from wishlist
    removeFromWishlist(product.id);
  };

  // Move all items to cart
  const moveAllToCart = () => {
    if (wishlistItems.length === 0) {
      showNotification('Your wishlist is empty');
      return;
    }

    const cartItems = getCartItems();
    let addedCount = 0;

    const updatedCart = [...cartItems];
    const remainingWishlistItems = [...wishlistItems];

    wishlistItems.forEach(item => {
      const existingItemIndex = updatedCart.findIndex(cartItem => cartItem.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Increase quantity if already in cart
        updatedCart[existingItemIndex].quantity += 1;
      } else {
        // Add new item to cart
        updatedCart.push({
          ...item,
          quantity: 1,
          selectedSize: item.sizes?.[0] || 'One Size',
          selectedColor: item.colors?.[0] || 'Default'
        });
        addedCount++;
      }

      // Remove from wishlist
      remainingWishlistItems.splice(remainingWishlistItems.findIndex(w => w.id === item.id), 1);
    });

    saveCartItems(updatedCart);
    setWishlistItems(remainingWishlistItems);
    localStorage.setItem('wishlist', JSON.stringify(remainingWishlistItems));
    showNotification(`${addedCount} items added to cart`);
  };

  return (
    <div className="wishlist-page">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className="notification"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Wishlist Header */}
      <div className="wishlist-header">
        <h1>Your Wishlist</h1>
        <div className="wishlist-meta">
          <p>{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}</p>
          {wishlistItems.length > 0 && (
            <button 
              className="move-all-btn"
              onClick={moveAllToCart}
              disabled={isAnimating}
            >
              <FaShoppingCart /> Move All to Cart
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {wishlistItems.length === 0 ? (
        <div className="empty-wishlist">
          <div className="heart-icon">
            <FaRegHeart className="empty-icon" />
            <FaHeart className="filled-icon" />
          </div>
          <h2>Your wishlist is empty</h2>
          <p>Save your favorite items here for later</p>
          <Link to="/shop" className="shop-btn">Shop Now</Link>
        </div>
      ) : (
        <motion.div 
          className="wishlist-items-container"
          layout
        >
          <AnimatePresence>
            {wishlistItems.map((item) => (
              <motion.div
                key={item.id}
                className="wishlist-item-card"
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <div className="wishlist-item-image-container">
                  <Link to={`/product/${item.id}`}>
                    <img 
                      src={item.image || '/default-shoe.jpg'} 
                      alt={item.name} 
                      className="wishlist-item-image"
                      loading="lazy"
                    />
                  </Link>
                  <button 
                    className="wishlist-remove-btn"
                    onClick={() => removeFromWishlist(item.id)}
                    aria-label="Remove from wishlist"
                    disabled={isAnimating}
                  >
                    <FaTrash />
                  </button>
                  {item.discount && (
                    <span className="discount-badge">-{item.discount}%</span>
                  )}
                </div>
                <div className="wishlist-item-details">
                  <Link to={`/product/${item.id}`} className="product-link">
                    <h3 className="wishlist-item-name">{item.name}</h3>
                  </Link>
                  <p className="wishlist-item-brand">{item.brand}</p>
                  <div className="wishlist-price-section">
                    <span className="wishlist-current-price">₹{item.price.toFixed(2)}</span>
                    {item.originalPrice && (
                      <span className="wishlist-original-price">₹{item.originalPrice.toFixed(2)}</span>
                    )}
                  </div>
                </div>
                <div className="wishlist-item-actions">
                  <button 
                    className={`wishlist-move-to-cart-btn ${isInCart(item.id) ? 'in-cart' : ''}`}
                    onClick={() => moveToCart(item)}
                    disabled={isAnimating}
                  >
                    {isInCart(item.id) ? (
                      <>
                        <FaCheck /> In Cart
                      </>
                    ) : (
                      <>
                        <FaShoppingCart /> Move to Cart
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default WishlistPage;