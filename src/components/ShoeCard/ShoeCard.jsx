import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { FaStar, FaShoppingCart, FaTimes, FaChevronLeft, FaChevronRight, FaHeart, FaEye } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import './ShoeCard.css';
import defaultShoe from '../../assets/default-shoe.svg';

const ShoeCard = ({ shoe }) => {
  const { addToCart } = useCart();

  const {
    _id: id,
    name = 'Unknown Shoe',
    brand = 'Unknown Brand',
    price = 0,
    images = [defaultShoe],
    colors = ['#111827'],
    rating = 0,
    discount = 0,
    isNew = false,
    sizes = [],
    stock = 0,
    description = 'No description available'
  } = shoe || {};

  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedSize, setSelectedSize] = useState(sizes[0] ?? null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const hoverInterval = useRef(null);

  useEffect(() => {
    // Rotate images while hovered (carousel preview)
    if (isHovered && images.length > 1) {
      hoverInterval.current = setInterval(() => {
        setCurrentImageIndex((i) => (i + 1) % images.length);
      }, 900);
    }
    return () => clearInterval(hoverInterval.current);
  }, [isHovered, images.length]);

  useEffect(() => {
    // load wishlist status from localStorage
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
      setIsWishlisted(wishlist.some((item) => item.id === id));
    } catch (e) {
      setIsWishlisted(false);
    }
  }, [id]);

  // Prevent background scroll when quick view is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (showQuickView) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = prev || '';
    }
    return () => { document.body.style.overflow = prev || ''; };
  }, [showQuickView]);

  const finalPrice = discount > 0 ? (price * (1 - discount / 100)).toFixed(2) : price.toFixed(2);

  const handleAddToCart = (e) => {
    e?.stopPropagation();
    const item = {
      id,
      name,
      brand,
      price,
      image: images[0] ?? defaultShoe,
      selectedColor,
      selectedSize,
      quantity: 1,
      finalPrice
    };

    addToCart(item);
  };

  const toggleWishlist = (e) => {
    e?.stopPropagation();
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
      const exists = wishlist.some((it) => it.id === id);
      let updated = [];
      if (exists) updated = wishlist.filter((it) => it.id !== id);
      else updated = [...wishlist, { id, name, price, image: images[0] }];
      localStorage.setItem('wishlist', JSON.stringify(updated));
      setIsWishlisted(!exists);
    } catch (err) {
      // ignore
    }
  };

  return (
    <article
      className="shoe-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      aria-labelledby={`shoe-${id}-name`}
      role="group"
      aria-hidden={showQuickView}
    >
      <div className="card-media">
        {isNew && <span className="badge badge-new">NEW</span>}
        {discount > 0 && <span className="badge badge-discount">-{discount}%</span>}

        <button
          type="button"
          className={`icon-btn wishlist ${isWishlisted ? 'active' : ''}`}
          onClick={toggleWishlist}
          aria-pressed={isWishlisted}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <FaHeart />
        </button>

        <img
          src={images[currentImageIndex] ?? defaultShoe}
          alt={`${brand} ${name}`}
          className="shoe-image"
          onError={(e) => { e.target.src = defaultShoe; }}
        />

        <div className="card-overlay">
          <button
            type="button"
            className="quickview-btn"
            onClick={(e) => { e.stopPropagation(); setShowQuickView(true); }}
            aria-label={`Quick view ${name}`}
          >
            <FaEye /> Quick View
          </button>
        </div>

        {images.length > 1 && (
          <div className="image-dots" aria-hidden>
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`dot ${i === currentImageIndex ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i); }}
                aria-label={`Show image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="card-body">
        <div className="brand-rating">
          <span className="brand">{brand.toUpperCase()}</span>
          <span className="rating" aria-label={`Rating ${rating}`}>
            <FaStar /> {rating.toFixed(1)}
          </span>
        </div>

        <h3 id={`shoe-${id}-name`} className="shoe-name">{name}</h3>

        <div className="selectors">
          <div className="colors" role="tablist" aria-label="Available colors">
            {colors.map((c) => (
              <button
                key={`${id}-${c}`}
                type="button"
                className={`color-swatch ${selectedColor === c ? 'selected' : ''}`}
                style={{ backgroundColor: c }}
                onClick={(e) => { e.stopPropagation(); setSelectedColor(c); }}
                aria-pressed={selectedColor === c}
                title={`Select color ${c}`}
              />
            ))}
          </div>

          <div className="sizes" aria-label="Available sizes">
            {sizes.slice(0, 5).map((s) => (
              <button
                key={`${id}-size-${s}`}
                type="button"
                className={`size-btn ${selectedSize === s ? 'selected' : ''}`}
                onClick={(e) => { e.stopPropagation(); setSelectedSize(s); }}
                aria-pressed={selectedSize === s}
                title={`Select size ${s}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="price-row">
          {discount > 0 && <span className="price-original">₹{price.toFixed(2)}</span>}
          <span className="price-current">₹{finalPrice}</span>
        </div>

        <div className="card-actions">
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="btn primary"
            onClick={handleAddToCart}
            aria-label={`Add ${name} to cart`}
            disabled={stock === 0}
          >
            <FaShoppingCart /> Add to Cart
          </motion.button>

          <button
            type="button"
            className="btn ghost"
            onClick={(e) => { e.stopPropagation(); setShowQuickView(true); }}
            aria-label={`Open quick view for ${name}`}
          >
            <FaEye /> View
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showQuickView && (
          <motion.div
            className="quickview-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQuickView(false)}
            role="dialog"
            aria-modal="true"
            aria-label={`Quick view ${name}`}
          >
            <motion.div
              className="quickview-panel"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-quickview" onClick={() => setShowQuickView(false)} aria-label="Close quick view">
                <FaTimes />
              </button>

              <div className="quickview-content">
                <div className="quickview-media">
                  <img src={images[currentImageIndex] ?? defaultShoe} alt={`${brand} ${name}`} />
                </div>
                <div className="quickview-info">
                  <h2>{name}</h2>
                  <p className="q-brand">{brand}</p>
                  <div className="q-price">
                    {discount > 0 && <span className="price-original">₹{price.toFixed(2)}</span>}
                    <span className="price-current">₹{finalPrice}</span>
                  </div>
                  <p className="q-desc">{description}</p>
                  <div className="q-actions">
                    <button className="btn primary" onClick={handleAddToCart}><FaShoppingCart /> Add to cart</button>
                    <button className="btn ghost" onClick={() => { setShowQuickView(false); setIsHovered(false); }}>Close</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
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
    sizes: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])),
    rating: PropTypes.number,
    discount: PropTypes.number,
    isNew: PropTypes.bool,
    stock: PropTypes.number,
    description: PropTypes.string
  }).isRequired
};

export default ShoeCard;
