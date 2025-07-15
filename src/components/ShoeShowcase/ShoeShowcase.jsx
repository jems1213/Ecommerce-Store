import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { FiArrowLeft, FiShoppingCart, FiHeart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import SizeGuide from '../SizeGuide/SizeGuide';
import './ShoeShowcase.css';

const ShoeShowcase = ({ shoe }) => {
  const [selectedImage, setSelectedImage] = useState(shoe.images[0]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  return (
    <div className="shoe-showcase">
      <Link to="/shop" className="back-button">
        <FiArrowLeft /> Back to Shop
      </Link>

      <div className="showcase-grid">
        <motion.div 
          className="shoe-images"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="main-image">
            <motion.img
              key={selectedImage}
              src={selectedImage}
              alt={shoe.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              exit={{ opacity: 0 }}
            />
          </div>
          <div className="thumbnail-container">
            {shoe.images.map((image, index) => (
              <motion.div
                key={index}
                className={`thumbnail ${selectedImage === image ? 'active' : ''}`}
                onClick={() => setSelectedImage(image)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 * index }}
              >
                <img src={image} alt={`${shoe.name} view ${index + 1}`} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="shoe-details"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="shoe-title">{shoe.name}</h1>
          <p className="shoe-brand">{shoe.brand}</p>
          
          <div className="shoe-price">
            ${shoe.price}
            {shoe.originalPrice && (
              <span className="original-price">${shoe.originalPrice}</span>
            )}
          </div>

          <div className="size-selection">
            <h3>Select Size</h3>
            <div className="size-options">
              {shoe.sizes.map((size) => (
                <motion.button
                  key={size}
                  className={`size-btn ${selectedSize === size ? 'selected' : ''}`}
                  onClick={() => setSelectedSize(size)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {size}
                </motion.button>
              ))}
            </div>
            <button 
              className="size-guide-btn"
              onClick={() => setShowSizeGuide(true)}
            >
              Size Guide
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="add-to-cart-btn"
            disabled={!selectedSize}
          >
            {selectedSize ? 'Add to Cart' : 'Select a Size'}
          </motion.button>

          <div className="action-buttons">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="wishlist-btn"
            >
              <FiHeart /> Add to Wishlist
            </motion.button>
          </div>

          <div className="shoe-description">
            <h3>Description</h3>
            <p>{shoe.description}</p>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showSizeGuide && (
          <SizeGuide onClose={() => setShowSizeGuide(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShoeShowcase;