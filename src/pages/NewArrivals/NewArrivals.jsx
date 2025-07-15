import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiHeart, FiShare2, FiChevronRight, FiClock, FiTruck } from 'react-icons/fi';
import './NewArrivals.css';

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  // Simulate API fetch
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      // In a real app, you would fetch from your API
      const mockProducts = [
        {
          id: 1,
          name: 'Executive Leather Oxford',
          category: 'dress',
          price: 249.99,
          discount: 0,
          rating: 4.8,
          colors: ['#000000', '#2c3e50', '#7f8c8d'],
          sizes: ['8', '9', '10', '11', '12'],
          image: 'data:image/jpeg;base64,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',
          description: 'Premium full-grain leather oxford with cushioned insole for all-day comfort.',
          features: ['Goodyear welt', 'Cushioned footbed', 'Slip-resistant sole'],
          isNew: true,
          releaseDate: '2023-10-15',
          stock: 15
        },
        {
          id: 2,
          name: 'Performance Running Pro',
          category: 'running',
          price: 159.99,
          discount: 10,
          rating: 4.6,
          colors: ['#e74c3c', '#3498db', '#2ecc71'],
          sizes: ['7', '8', '9', '10', '11'],
          image: 'https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/32682452/2025/2/13/27ef4773-873c-4e96-b4c9-20500c8395df1739430817914-Puma-Galaxis-Pro-Mens-Performance-Boost-Running-Shoes-926173-1.jpg',
          description: 'High-performance running shoe with responsive cushioning and breathable mesh.',
          features: ['Energy-return midsole', 'Breathable upper', 'Durable outsole'],
          isNew: true,
          releaseDate: '2023-10-10',
          stock: 22
        },
        // Add 14 more products...
      ];
      
      setTimeout(() => {
        setProducts(mockProducts);
        setLoading(false);
      }, 1000);
    };

    fetchProducts();
  }, []);

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'discounted') return product.discount > 0;
    return product.category === activeFilter;
  }).sort((a, b) => {
    if (sortOption === 'newest') return new Date(b.releaseDate) - new Date(a.releaseDate);
    if (sortOption === 'price-high') return b.price - a.price;
    if (sortOption === 'price-low') return a.price - b.price;
    if (sortOption === 'rating') return b.rating - a.rating;
    return 0;
  });

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

 
  const closeQuickView = () => {
    setQuickViewOpen(false);
  };

  const addToWishlist = (productId) => {
    // In a real app, this would call your API
    console.log(`Added product ${productId} to wishlist`);
  };

  const shareProduct = (product) => {
    // In a real app, this would use the Web Share API or social media links
    console.log(`Sharing product: ${product.name}`);
  };

  return (
    <div className="new-arrivals">
      {/* Hero Section */}
      <div className="arrivals-hero">
        <div className="hero-content">
          <h1>New Arrivals</h1>
          <p>Discover our latest premium footwear collection for the season</p>
        </div>
      </div>

      {/* Controls Section */}
      <div className="arrivals-controls">
        <div className="controls-left">
          <h2>Curated Selection</h2>
          <p>{filteredProducts.length} items available</p>
        </div>
        
        <div className="controls-right">
          <div className="filter-control">
            <label htmlFor="category-filter">Filter:</label>
            <select 
              id="category-filter"
              value={activeFilter}
              onChange={(e) => {
                setActiveFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Products</option>
              <option value="dress">Dress Shoes</option>
              <option value="running">Running</option>
              <option value="casual">Casual</option>
              <option value="discounted">Discounted</option>
            </select>
          </div>

          <div className="sort-control">
            <label htmlFor="sort-option">Sort by:</label>
            <select 
              id="sort-option"
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="newest">Newest First</option>
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="loading-grid">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="product-skeleton">
              <div className="skeleton-image"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text-sm"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="products-grid">
            {currentProducts.map((product) => (
              <motion.div 
                key={product.id}
                className="product-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5 }}
              >
                <div className="product-badges">
                  {product.isNew && <span className="badge-new">New</span>}
                  {product.discount > 0 && (
                    <span className="badge-discount">-{product.discount}%</span>
                  )}
                </div>

                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                  <div className="product-actions">
                    <button 
                      className="action-btn wishlist"
                      onClick={() => addToWishlist(product.id)}
                      aria-label="Add to wishlist"
                    >
                      <FiHeart />
                    </button>
                    <button 
                      className="action-btn share"
                      onClick={() => shareProduct(product)}
                      aria-label="Share product"
                    >
                      <FiShare2 />
                    </button>
                    
                  </div>
                </div>

                <div className="product-info">
                  <h3>{product.name}</h3>
                  <div className="product-meta">
                    <div className="product-rating">
                      <FiStar className="star-icon" />
                      <span>{product.rating}</span>
                    </div>
                    <div className="product-colors">
                      {product.colors.map((color, index) => (
                        <span 
                          key={index}
                          className="color-swatch"
                          style={{ backgroundColor: color }}
                          aria-label={`Color option ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="product-pricing">
                    {product.discount > 0 ? (
                      <>
                        <span className="original-price">${product.price.toFixed(2)}</span>
                        <span className="discounted-price">
                          ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="price">${product.price.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-controls">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
                >
                  {index + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Value Propositions */}
      <div className="value-props">
        <div className="prop-card">
          <FiTruck className="prop-icon" />
          <h3>Free Express Shipping</h3>
          <p>On all orders over $100</p>
        </div>
        <div className="prop-card">
          <FiClock className="prop-icon" />
          <h3>Extended Returns</h3>
          <p>60-day return policy</p>
        </div>
        <div className="prop-card">
          <FiStar className="prop-icon" />
          <h3>Premium Quality</h3>
          <p>Crafted with premium materials</p>
        </div>
      </div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewOpen && selectedProduct && (
          <ProductQuickView 
            product={selectedProduct}
            onClose={closeQuickView}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default NewArrivals;