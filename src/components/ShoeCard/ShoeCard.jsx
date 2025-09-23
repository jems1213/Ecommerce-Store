import React, { useState, useEffect } from 'react';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { FaStar, FaShoppingCart, FaTimes, FaChevronLeft, FaChevronRight, FaHeart } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import './ShoeCard.css';
import defaultShoe from '../../assets/default-shoe.svg';
import shoe2 from '../../assets/hero-shoe2.svg';

const ShoeCard = ({ shoe }) => {
  const { addToCart, cartItems } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  
  const {
    _id: id,
    name = 'Unknown Shoe',
    brand = 'Unknown Brand',
    price = 0,
    images = [defaultShoe],
    colors = ['#000000'],
    rating = 0,
    discount = 0,
    isNew = false,
    sizes = [],
    stock = 0,
    description = 'No description available'
  } = shoe || {};

  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    setIsWishlisted(wishlist.some(item => item.id === id));
  }, [id]);

  const showCartNotification = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const handleAddToCart = () => {
    const cartItem = {
      id, 
      name,
      brand,
      price,
      image: images[0],
      selectedColor: selectedColor || colors[0],
      selectedSize: selectedSize || sizes[0],
      quantity,
      finalPrice: discount > 0 ? (price * (1 - discount / 100)).toFixed(2) : price.toFixed(2)
    };
    
    const result = addToCart(cartItem);
    
    if (result.success) {
      showCartNotification(`${name} added to cart!`);
      setShowPopup(false);
    } else {
      showCartNotification(result.message || "Couldn't add item to cart");
    }
  };

  const toggleWishlist = (e) => {
    e?.stopPropagation();
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const updatedWishlist = isWishlisted
      ? wishlist.filter(item => item.id !== id)
      : [...wishlist, {
          id, name, brand, price,
          originalPrice: discount > 0 ? price : null,
          image: images[0], color: selectedColor,
          size: selectedSize, discount, rating
        }];
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    setIsWishlisted(!isWishlisted);
    
    showCartNotification(
      isWishlisted 
        ? `${name} removed from wishlist` 
        : `${name} added to wishlist!`
    );
  };

  const finalPrice = discount > 0 ? (price * (1 - discount / 100)).toFixed(2) : price.toFixed(2);

  return (
    <>
      <motion.div
        className="shoe-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.3 }}
        onClick={() => setShowPopup(true)}
      >
        <div className="card-header">
          <div className="card-badges">
            {isNew && <span className="badge new">NEW</span>}
            {discount > 0 && <span className="badge discount">-{discount}%</span>}
          </div>
          <button
            type="button"
            className={`favorite-btn ${isWishlisted ? 'wishlisted' : ''}`}
            onClick={toggleWishlist}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={isWishlisted}
            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <FaHeart />
          </button>
        </div>

        <div className="shoe-image-container">
          <img
            src={images[currentImageIndex] || defaultShoe}
            alt={`${brand} ${name}`}
            className="shoe-image"
            onError={(e) => e.target.src = defaultShoe}
          />
          {images.length > 1 && (
            <div className="image-nav">
              <button className="nav-button prev" onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length); }}>
                <FaChevronLeft />
              </button>
              <button className="nav-button next" onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev + 1) % images.length); }}>
                <FaChevronRight />
              </button>
            </div>
          )}
        </div>

        <div className="shoe-details">
          <div className="brand-rating">
            <span className="brand">{brand.toUpperCase()}</span>
            <div className="rating">
              <FaStar className="star-icon" />
              <span>{rating.toFixed(1)}</span>
            </div>
          </div>

          <h3 className="shoe-name">{name}</h3>

          <div className="color-options">
            {colors.map((color) => (
              <button
                key={`${id}-${color}`}
                type="button"
                className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={(e) => { e.stopPropagation(); setSelectedColor(color); }}
                aria-label={`Select color ${color}`}
                aria-pressed={selectedColor === color}
                title={`Select color ${color}`}
              />
            ))}
          </div>

          <div className="price-container">
            {discount > 0 && <span className="original-price">₹{price.toFixed(2)}</span>}
            <span className="current-price">₹{finalPrice}</span>
          </div>

          <motion.button
            type="button"
            className="add-to-cart-btn1"
            onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}
            whileTap={{ scale: 0.95 }}
            aria-label={`Add ${name} to cart`}
          >
            <FaShoppingCart className="cart-icon" />
            <span className="add-text">Add to Cart</span>
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showPopup && (
          <motion.div
            className="shoe-popup-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPopup(false)}
          >
            <motion.div
              className="shoe-popup-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-popup" onClick={() => setShowPopup(false)} aria-label="Close popup">
                <FaTimes />
              </button>

              <div className="popup-image-section">
                <div className="main-image-container">
                  <img
                    src={images[currentImageIndex] || defaultShoe}
                    alt={`${brand} ${name}`}
                    className="popup-main-image"
                    onError={(e) => e.target.src = defaultShoe}
                  />
                  {images.length > 1 && (
                    <div className="popup-image-nav">
                      <button className="nav-button prev" onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length); }}>
                        <FaChevronLeft />
                      </button>
                      <button className="nav-button next" onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev + 1) % images.length); }}>
                        <FaChevronRight />
                      </button>
                    </div>
                  )}
                </div>
                <div className="thumbnail-container">
                  {images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className={`thumbnail ${currentImageIndex === index ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              </div>

              <div className="popup-details-section">
                <div className="popup-header">
                  <h2>{name}</h2>
                  <div className="popup-brand-rating">
                    <span className="brand">{brand.toUpperCase()}</span>
                    <div className="rating">
                      <FaStar className="star-icon" />
                      <span>{rating.toFixed(1)} ({Math.floor(rating * 20)} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="popup-price-section">
                  {discount > 0 && <span className="original-price">₹{price.toFixed(2)}</span>}
                  <span className="current-price">₹{finalPrice}</span>
                  {discount > 0 && <span className="badge discount">Save {discount}%</span>}
                </div>

                <p className="popup-description">{description}</p>

                <div className="popup-options">
                  <div className="option-group">
                    <h4>Color:</h4>
                    <div className="color-options">
                      {colors.map((color) => (
                        <button
                          key={`popup-${id}-${color}`}
                          type="button"
                          className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                          style={{ backgroundColor: color }}
                          onClick={() => setSelectedColor(color)}
                          aria-label={`Select color ${color}`}
                          aria-pressed={selectedColor === color}
                        />
                      ))}
                    </div>
                  </div>

                  {sizes.length > 0 && (
                    <div className="option-group">
                      <h4>Size:</h4>
                      <div className="size-options">
                        {sizes.map((size) => (
                          <button
                            key={`popup-${id}-${size}`}
                            type="button"
                            className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                            onClick={() => setSelectedSize(size)}
                            aria-pressed={selectedSize === size}
                            aria-label={`Select size ${size}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="option-group">
                    <h4>Quantity:</h4>
                    <div className="quantity-selector">
                      <button onClick={() => setQuantity(prev => Math.max(1, prev - 1))} disabled={quantity <= 1}>
                        -
                      </button>
                      <span>{quantity}</span>
                      <button onClick={() => setQuantity(prev => prev + 1)} disabled={quantity >= stock}>
                        +
                      </button>
                    </div>
                    {stock > 0 && <p className="stock-info">{stock} available</p>}
                  </div>
                </div>

                <div className="popup-actions">
                  <button className={`favorite-btn popup-btn ${isWishlisted ? 'wishlisted' : ''}`} onClick={toggleWishlist}>
                    <FaHeart className="favorite-icon" />
                    {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                  </button>
                  <motion.button
                    className="add-to-cart-btn popup-btn"
                    onClick={handleAddToCart}
                    whileTap={{ scale: 0.95 }}
                    disabled={stock === 0}
                  >
                    <FaShoppingCart className="cart-icon" />
                    {stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            className="notification-toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {notificationMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

ShoeCard.propTypes = {
  shoe: PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
    brand: PropTypes.string,
    price: PropTypes.number,
    images: PropTypes.arrayOf(PropTypes.string),
    colors: PropTypes.arrayOf(PropTypes.string),
    sizes: PropTypes.arrayOf(PropTypes.number),
    rating: PropTypes.number,
    discount: PropTypes.number,
    isNew: PropTypes.bool,
    stock: PropTypes.number,
    description: PropTypes.string
  }).isRequired
};

export default ShoeCard;
