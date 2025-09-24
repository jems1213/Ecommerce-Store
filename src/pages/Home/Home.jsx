import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ShoeCard from '../../components/ShoeCard/ShoeCard';
import Hero from '../../components/Hero/Hero';
import Newsletter from '../../components/Newsletter/Newsletter';
import './Home.css';
import api, { API_BASE } from '../../utils/apiClient';
import defaultShoe from '../../assets/default-shoe.svg';

const Home = () => {
  const [filter, setFilter] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 300]);
  const [sortOption, setSortOption] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [shoes, setShoes] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Frontend-only local shoes (persisted in localStorage)
  const [localShoes, setLocalShoes] = useState([]);
  const [showAddShoeModal, setShowAddShoeModal] = useState(false);
  const [newShoe, setNewShoe] = useState({ name: '', brand: '', price: '', images: '', colors: '', sizes: '', discount: '', isNew: false, description: '' });

  // Fetch shoes from backend
  useEffect(() => {
    const fetchShoes = async () => {
      try {
        setIsLoading(true);
        const params = {
          brand: filter === 'all' ? undefined : filter,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          sort: sortOption,
          search: searchQuery,
          featured: true
        };

        const response = await api.get('/api/shoes', { params });
        const res = response?.data;
        let fetched = [];
        if (Array.isArray(res)) {
          fetched = res;
        } else if (Array.isArray(res?.data)) {
          fetched = res.data;
        } else if (Array.isArray(res?.data?.shoes)) {
          fetched = res.data.shoes;
        } else if (Array.isArray(res?.shoes)) {
          fetched = res.shoes;
        } else {
          fetched = [];
        }
        const storedLocal = JSON.parse(localStorage.getItem('localShoes') || '[]');
        setLocalShoes(storedLocal);
        setShoes([...(storedLocal || []), ...fetched]);
      } catch (error) {
        console.error('Error fetching shoes:', error);
        setShoes([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchShoes();
    }, 500);

    // load local shoes immediately so UI shows them without waiting for API
    try {
      const stored = JSON.parse(localStorage.getItem('localShoes') || '[]');
      if (stored && stored.length) {
        setLocalShoes(stored);
        setShoes(prev => ([...stored, ...prev]));
      }
    } catch (e) {
      // ignore
    }

    return () => clearTimeout(debounceTimer);
  }, [filter, priceRange, sortOption, searchQuery]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="home-page"
    >
      <Hero />

      <div className="shop-section">
        <motion.div 
          className="shop-header"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1>Featured Collection</h1>
          <p className="shop-subtitle">Discover our premium footwear selection</p>
          
          <motion.div 
            className="search-bar"
            whileFocus={{ boxShadow: '0 0 0 2px rgba(44, 62, 80, 0.3)' }}
          >
            <input
              type="text"
              placeholder="Search shoes or brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg className="search-icon" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </motion.div>

          <motion.button
            className="add-shoe-button add-shoe-button--ml"
            onClick={() => setShowAddShoeModal(true)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            + Add Shoe
          </motion.button>

          <motion.button
            className="mobile-filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </motion.button>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                className={`shop-controls ${showFilters ? 'mobile-visible' : ''}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="filters">
                  <h3>Filter by Brand</h3>
                  <div className="filter-buttons">
                    {['all', 'nike', 'adidas', 'reebok', 'puma', 'new balance', 'converse', 'vans', 'asics', 'hoka'].map((brand) => (
                      <motion.button
                        key={brand}
                        className={`filter-btn ${filter === brand ? 'active' : ''}`}
                        onClick={() => setFilter(brand)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {brand === 'all' ? 'All Brands' : brand.charAt(0).toUpperCase() + brand.slice(1)}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="sort-filter">
                  <div className="price-filter">
                    <h3>Price Range: ${priceRange[0]} - ${priceRange[1]}</h3>
                    <div className="range-slider">
                      <input 
                        type="range" 
                        min="0" 
                        max="300" 
                        value={priceRange[0]} 
                        onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                        className="range-input"
                      />
                      <input 
                        type="range" 
                        min="0" 
                        max="300" 
                        value={priceRange[1]} 
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="range-input"
                      />
                    </div>
                  </div>

                  <div className="sort-options">
                    <h3>Sort by:</h3>
                    <select 
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="sort-select"
                    >
                      <option value="featured">Featured</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Top Rated</option>
                      <option value="newest">New Arrivals</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {isLoading ? (
          <motion.div 
            className="loading-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="spinner"></div>
            <p>Loading shoes...</p>
          </motion.div>
        ) : shoes.length > 0 ? (
          <motion.div 
            className="shoe-grid"
            layout
          >
            <AnimatePresence>
              {shoes.map((shoe) => (
                <motion.div
                  key={shoe._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <ShoeCard shoe={shoe} variant="classic" />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            className="no-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="no-results-content">
              <h3>No shoes match your search</h3>
              <p>Try adjusting your filters or search for something else</p>
              <motion.button 
                className="reset-btn"
                onClick={() => {
                  setFilter('all');
                  setPriceRange([0, 300]);
                  setSortOption('featured');
                  setSearchQuery('');
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Reset All Filters
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Add Shoe Modal (frontend-only) */}
      <AnimatePresence>
        {showAddShoeModal && (
          <motion.div className="add-shoe-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddShoeModal(false)}>
            <motion.div className="add-shoe-modal" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <h3>Add Shoe (local only)</h3>
              <div className="add-shoe-form">
                <label>Name</label>
                <input value={newShoe.name} onChange={(e) => setNewShoe(prev => ({ ...prev, name: e.target.value }))} />
                <label>Brand</label>
                <input value={newShoe.brand} onChange={(e) => setNewShoe(prev => ({ ...prev, brand: e.target.value }))} />
                <label>Price</label>
                <input type="number" value={newShoe.price} onChange={(e) => setNewShoe(prev => ({ ...prev, price: parseFloat(e.target.value) || '' }))} />
                <label>Images (comma separated URLs)</label>
                <input value={newShoe.images} onChange={(e) => setNewShoe(prev => ({ ...prev, images: e.target.value }))} placeholder="https://... , https://..." />
                <label>Colors (comma, hex or names)</label>
                <input value={newShoe.colors} onChange={(e) => setNewShoe(prev => ({ ...prev, colors: e.target.value }))} placeholder="#000, #fff" />
                <label>Sizes (comma separated e.g. 6,7,8)</label>
                <input value={newShoe.sizes} onChange={(e) => setNewShoe(prev => ({ ...prev, sizes: e.target.value }))} />
                <label>Discount (%)</label>
                <input type="number" value={newShoe.discount} onChange={(e) => setNewShoe(prev => ({ ...prev, discount: parseInt(e.target.value) || 0 }))} />
                <label>Description</label>
                <textarea value={newShoe.description} onChange={(e) => setNewShoe(prev => ({ ...prev, description: e.target.value }))} />
                <label><input type="checkbox" checked={newShoe.isNew} onChange={(e) => setNewShoe(prev => ({ ...prev, isNew: e.target.checked }))} /> Mark as NEW</label>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button onClick={() => setShowAddShoeModal(false)}>Cancel</button>
                  <button onClick={() => {
                    const id = `local-${Date.now()}`;
                    const imgs = newShoe.images ? newShoe.images.split(',').map(s => s.trim()).filter(Boolean) : [defaultShoe];
                    const cols = newShoe.colors ? newShoe.colors.split(',').map(s => s.trim()).filter(Boolean) : ['#000'];
                    const sz = newShoe.sizes ? newShoe.sizes.split(',').map(s => parseFloat(s.trim())).filter(Boolean) : [];
                    const shoeObj = {
                      _id: id,
                      name: newShoe.name || 'New Shoe',
                      brand: newShoe.brand || 'brand',
                      price: Number(newShoe.price) || 0,
                      images: imgs,
                      colors: cols,
                      sizes: sz,
                      rating: 0,
                      discount: Number(newShoe.discount) || 0,
                      isNew: !!newShoe.isNew,
                      stock: 50,
                      description: newShoe.description || ''
                    };
                    const updated = [shoeObj, ...localShoes];
                    setLocalShoes(updated);
                    localStorage.setItem('localShoes', JSON.stringify(updated));
                    setShoes(prev => [shoeObj, ...prev]);
                    setNewShoe({ name: '', brand: '', price: '', images: '', colors: '', sizes: '', discount: '', isNew: false, description: '' });
                    setShowAddShoeModal(false);
                  }}>Add Shoe</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="new-arrivals-section">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          New Arrivals
        </motion.h2>
        <div className="shoe-grid">
          <AnimatePresence>
            {shoes
              .filter(shoe => shoe.isNew)
              .map(shoe => (
                <motion.div
                  key={shoe._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3 }}
                >
                  <ShoeCard shoe={shoe} variant="classic" />
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </div>

      <Newsletter />
    </motion.div>
  );
};

export default Home;
