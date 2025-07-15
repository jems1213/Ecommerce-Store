import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiShoppingCart, FiHeart, FiShare2 } from 'react-icons/fi';
import ShoeShowcase from '../../components/ShoeShowcase/ShoeShowcase';
import SizeGuide from '../../components/SizeGuide/SizeGuide';
// import SimilarProducts from '../../components/SimilarProducts/SimilarProducts';
import './Product.css';

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // In a real app, you would fetch this data based on the ID
  const shoe = {
    id: 1,
    name: "Air Max 270",
    brand: "Nike",
    price: 150,
    originalPrice: 180,
    discount: 17,
    isNew: true,
    images: [
      "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/skwgyqrbfzhu6uyeh0gg/air-max-270-mens-shoes-KkLcGR.png",
      "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/awjogtdc5d4emt6u3wtl/air-max-270-mens-shoes-KkLcGR.png",
      "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/ikrylzbtzbhzetwep04m/air-max-270-mens-shoes-KkLcGR.png"
    ],
    sizes: ["7", "8", "9", "10", "11"],
    colors: ["black", "white", "red"],
    description: "The Nike Air Max 270 delivers a bold look inspired by Air Max icons with the brand's largest heel Air unit yet for unbelievable comfort all day.",
    features: [
      "Breathable mesh upper",
      "Max Air cushioning",
      "Rubber outsole for traction",
      "Lightweight design"
    ]
  };

  const similarProducts = [
    // Array of similar products would go here
  ];

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size first");
      return;
    }
    // Add to cart logic would go here
    alert(`Added ${shoe.name} (Size: ${selectedSize}) to cart`);
  };

  const handleImageChange = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="product-page"
    >
      <div className="container">
        <button 
          className="back-button"
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft /> Back to Shop
        </button>

        <div className="product-grid">
          {/* Image Gallery */}
          <motion.div 
            className="product-gallery"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="main-image-container">
              <motion.img
                key={currentImageIndex}
                src={shoe.images[currentImageIndex]}
                alt={shoe.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="thumbnail-container">
              {shoe.images.map((image, index) => (
                <motion.div
                  key={index}
                  className={`thumbnail ${currentImageIndex === index ? 'active' : ''}`}
                  onClick={() => handleImageChange(index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img src={image} alt={`${shoe.name} view ${index + 1}`} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Product Details */}
          <motion.div 
            className="product-details"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="product-header">
              <h1 className="product-title">{shoe.name}</h1>
              <p className="product-brand">{shoe.brand}</p>
              {shoe.isNew && <span className="new-badge">NEW</span>}
            </div>

            <div className="price-container">
              <span className="current-price">${shoe.price}</span>
              {shoe.originalPrice && (
                <span className="original-price">${shoe.originalPrice}</span>
              )}
              {shoe.discount && (
                <span className="discount-badge">-{shoe.discount}% OFF</span>
              )}
            </div>

            <div className="color-options">
              <h3>Color: <span>{shoe.colors.join(', ')}</span></h3>
              <div className="color-selector">
                {shoe.colors.map((color, index) => (
                  <div 
                    key={index}
                    className="color-circle"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="size-selection">
              <div className="size-header">
                <h3>Select Size</h3>
                <button 
                  className="size-guide-btn"
                  onClick={() => setShowSizeGuide(true)}
                >
                  Size Guide
                </button>
              </div>
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
            </div>

            <div className="product-actions">
              <motion.button
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiShoppingCart /> Add to Cart
              </motion.button>
              <div className="secondary-actions">
                <motion.button
                  className="wishlist-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiHeart /> Wishlist
                </motion.button>
                <motion.button
                  className="share-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiShare2 /> Share
                </motion.button>
              </div>
            </div>

            <div className="product-description">
              <h3>Description</h3>
              <p>{shoe.description}</p>
            </div>

            <div className="product-features">
              <h3>Features</h3>
              <ul>
                {shoe.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Similar Products */}
        <SimilarProducts products={similarProducts} />

        {/* Size Guide Modal */}
        <AnimatePresence>
          {showSizeGuide && (
            <SizeGuide onClose={() => setShowSizeGuide(false)} />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Product;