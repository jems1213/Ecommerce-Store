import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { FaStar, FaShoppingCart, FaHeart } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import './ShoeCard.css';

// Fallback images provided by user (used when a product has no images)
const FALLBACK_IMAGES = [
  'https://tse1.mm.bing.net/th/id/OIP.nrNwU3ChW26n4PCm4J-qPwHaFG?pid=Api&P=0&h=180',
  'https://tse4.mm.bing.net/th/id/OIP.d-7UFbAaPsT2y3dYpaKm1AHaFb?pid=Api&P=0&h=180',
  'https://tse4.mm.bing.net/th/id/OIP.0TZK6up-zDy3BDDFEGWUGQHaE8?pid=Api&P=0&h=180',
  'https://tse3.mm.bing.net/th/id/OIP.9PDaEcWYxhPbrNEoLd380QHaGR?pid=Api&P=0&h=180',
  'https://tse1.mm.bing.net/th/id/OIP.ol8ONAu84a2wZE8gAyMnvwHaHa?pid=Api&P=0&h=180',
  'https://tse2.mm.bing.net/th/id/OIP.hm02wr_Ih4mCog4P0_lsCwHaDx?pid=Api&P=0&h=180'
];

const hexToRgba = (hex, alpha = 1) => {
  if (!hex) return `rgba(17,24,39,${alpha})`;
  const h = hex.replace('#', '');
  const bigint = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const makeGradient = (base) => {
  const mid = hexToRgba(base, 0.06);
  const light = hexToRgba('#ffffff', 0);
  return `linear-gradient(135deg, ${hexToRgba(base, 0.18)} 0%, ${mid} 40%, ${light} 75%)`;
};

const ShoeCard = ({ shoe, variant = 'modern' }) => {
  const { addToCart } = useCart();

  const {
    _id: id,
    name = 'Unknown Shoe',
    brand = 'Unknown Brand',
    price = 0,
    images = [],
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
  const [isWishlisted, setIsWishlisted] = useState(false);
  const hoverInterval = useRef(null);

  const safeImages = (Array.isArray(images) && images.length) ? images : FALLBACK_IMAGES;

  useEffect(() => {
    if (isHovered && images.length > 1) {
      hoverInterval.current = setInterval(() => {
        setCurrentImageIndex((i) => (i + 1) % images.length);
      }, 900);
    }
    return () => clearInterval(hoverInterval.current);
  }, [isHovered, images.length]);

  useEffect(() => {
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
      setIsWishlisted(wishlist.some((item) => item.id === id));
    } catch (e) {
      setIsWishlisted(false);
    }
  }, [id]);

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

  const tagText = (shoe?.tagline || shoe?.category || 'Unisex Low Top Shoe').toString().toUpperCase();

  const cardGradient = makeGradient(selectedColor || colors[0]);

  const renderModern = () => (
    <>
      <div className="card-media">
        <div className="card-gradient" aria-hidden />
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
                style={{ '--swatch-color': c }}
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
        </div>
      </div>
    </>
  );

  const renderClassic = () => (
    <>
      <div className="card-media classic-media">
        <div className="card-gradient" aria-hidden />
        {isNew && <span className="badge badge-new">NEW</span>}
        {discount > 0 && <span className="badge badge-discount">-{discount}%</span>}

        <button
          type="button"
          className={`icon-btn wishlist left ${isWishlisted ? 'active' : ''}`}
          onClick={toggleWishlist}
          aria-pressed={isWishlisted}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <FaHeart />
        </button>

        <div className="image-stack">
          <img
            src={images[0] ?? defaultShoe}
            alt={`${brand} ${name}`}
            className="shoe-image base"
            onError={(e) => { e.target.src = defaultShoe; }}
          />
          <img
            src={images[1] ?? images[0] ?? defaultShoe}
            alt={`${brand} ${name} alt view`}
            className="shoe-image hover"
            onError={(e) => { e.target.src = defaultShoe; }}
          />
        </div>

        <button
          type="button"
          className="quickview-inline"
          onClick={handleAddToCart}
          aria-label={`Open quick view and add ${name} to cart`}
        >
          <span>Add to Cart</span>
          <FaShoppingCart />
        </button>
      </div>

      <div className="classic-body">
        <a className="product-link" href="#" aria-label={name} onClick={(e) => e.preventDefault()}>
          <span className="product-title" id={`shoe-${id}-name`}>{name}</span>
        </a>

        <div className="classic-price-row">
          <span className="price-current">₹{finalPrice}</span>
          {discount > 0 && <span className="price-original">₹{price.toFixed(2)}</span>}
        </div>

        <div className="product-tagline">{tagText}</div>

        <div className="classic-swatches">
          {colors.slice(0, 5).map((c) => (
            <button
              key={`${id}-classic-${c}`}
              type="button"
              className={`swatch-dot ${selectedColor === c ? 'selected' : ''}`}
              style={{ '--swatch-color': c }}
              onClick={(e) => { e.stopPropagation(); setSelectedColor(c); }}
              aria-pressed={selectedColor === c}
              title={`Select color ${c}`}
            />
          ))}
        </div>
      </div>
    </>
  );

  return (
    <article
      className={`shoe-card ${variant === 'classic' ? 'shoe-card--classic' : ''}`}
      onMouseEnter={() => {
        // immediately show second image on hover if available and start carousel
        if (images.length > 1) setCurrentImageIndex(1);
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        // restore primary image when hover ends
        setIsHovered(false);
        setCurrentImageIndex(0);
      }}
      onFocus={() => {
        if (images.length > 1) setCurrentImageIndex(1);
        setIsHovered(true);
      }}
      onBlur={() => {
        setIsHovered(false);
        setCurrentImageIndex(0);
      }}
      tabIndex={0}
      aria-labelledby={`shoe-${id}-name`}
      role="group"
      style={{ '--card-gradient': cardGradient }}
    >
      {variant === 'classic' ? renderClassic() : renderModern()}
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
    description: PropTypes.string,
    tagline: PropTypes.string,
    category: PropTypes.string
  }).isRequired,
  variant: PropTypes.oneOf(['modern', 'classic'])
};

export default ShoeCard;
