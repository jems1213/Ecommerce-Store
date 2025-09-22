import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import ShoeCard from '../../components/ShoeCard/ShoeCard';
import './Collection.css';
import api, { API_BASE } from '../../utils/apiClient';

const Collection = () => {
  const [filter, setFilter] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [sortOption, setSortOption] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [shoes, setShoes] = useState([]);
  const [showFilters, setShowFilters] = useState(true); // Default to true for desktop

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
          search: searchQuery
        };

        const response = await api.get('/api/shoes', { params });
        const res = response?.data;
        let fetched = [];
        if (Array.isArray(res)) fetched = res;
        else if (Array.isArray(res?.data)) fetched = res.data;
        else if (Array.isArray(res?.data?.shoes)) fetched = res.data.shoes;
        else if (Array.isArray(res?.shoes)) fetched = res.shoes;
        else fetched = [];
        setShoes(fetched);
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

    return () => clearTimeout(debounceTimer);
  }, [filter, priceRange, sortOption, searchQuery]);

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const resetFilters = () => {
    setFilter('all');
    setPriceRange([0, 200]);
    setSortOption('featured');
    setSearchQuery('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="shop-page"
    >
      <div className="shop-header">
        <h1> Collection  Premium Footwear</h1>
        <p className="shop-subtitle">Find your perfect pair from our collection</p>
        
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search shoes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg className="search-icon" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </div>

        <button 
          className="filter-toggle"
          onClick={toggleFilters}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ marginLeft: '8px', transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        {showFilters && (
          <div className="shop-controls">
            <div className="filters">
              <h3>Filter by Brand</h3>
              <div className="filter-buttons">
                {['all', 'nike', 'adidas', 'reebok', 'puma'].map((brand) => (
                  <motion.button
                    key={brand}
                    className={`filter-btn ${filter === brand ? 'active' : ''}`}
                    onClick={() => setFilter(brand)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {brand === 'all' ? 'All Brands' : brand.charAt(0).toUpperCase() + brand.slice(1)}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="sort-filter">
              <div className="price-filter">
                <h3>Price Range</h3>
                <div className="price-range">
                  <span>${priceRange[0]}</span>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="range-slider"
                  />
                  <span>${priceRange[1]}</span>
                </div>
                <div className="price-range">
                  <span></span>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="range-slider"
                  />
                  <span></span>
                </div>
              </div>

              <div className="sort-options">
                <h3>Sort by</h3>
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
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading shoes...</p>
        </div>
      ) : shoes.length > 0 ? (
        <motion.div className="shoe-grid" layout>
          {shoes.map((shoe) => (
            <ShoeCard 
              key={shoe._id} 
              shoe={shoe}
            />
          ))}
        </motion.div>
      ) : (
        <div className="no-results">
          <div className="no-results-content">
            <h3>No shoes found</h3>
            <p>Try adjusting your search filters</p>
            <button className="reset-btn" onClick={resetFilters}>
              Reset All Filters
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Collection;
