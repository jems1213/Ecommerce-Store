import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  FiMenu,
  FiX,
  FiShoppingBag,
  FiUser,
  FiSearch,
  FiHeart,
  FiLogOut,
  FiChevronDown,
  FiChevronUp,
  FiChevronRight,
  FiHelpCircle,
  FiGift,
  FiClock,
  FiShield
} from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, clearCart } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [user, setUser] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const searchContainerRef = useRef(null);
  const userDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Enhanced user state management
  useEffect(() => {
    const updateUserState = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        setUser(null);
      }
    };

    // Initial check
    updateUserState();

    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        updateUserState();
      }
    };

    // Listen for custom events
    const handleUserEvent = () => updateUserState();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLoggedIn', handleUserEvent);
    window.addEventListener('userLoggedOut', handleUserEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLoggedIn', handleUserEvent);
      window.removeEventListener('userLoggedOut', handleUserEvent);
    };
  }, []);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const mainCategories = [
    { name: 'New Arrivals', path: '/new-arrivals', featured: true },
    { name: 'Shop', path: '/shop', megaMenu: true },
  ];

  const collections = [
    { name: 'Running', path: '/collections/running', icon: <FiClock /> },
    { name: 'Basketball', path: '/collections/basketball', icon: <FiShield /> },
    { name: 'Lifestyle', path: '/collections/lifestyle' },
    { name: 'Limited Edition', path: '/collections/limited', featured: true },
  ];

  const helpLinks = [
    { name: 'Contact Us', path: '/contact' },
    { name: 'FAQs', path: '/faqs' },
    { name: 'Shipping', path: '/shipping' },
    { name: 'Returns', path: '/returns' },
  ];

  useEffect(() => {
    const getWishlistCount = () => {
      try {
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        return wishlist.length;
      } catch (error) {
        console.error('Error reading wishlist from localStorage:', error);
        return 0;
      }
    };

    setWishlistCount(getWishlistCount());

    const handleWishlistUpdate = () => {
      setWishlistCount(getWishlistCount());
    };

    window.addEventListener('storage', handleWishlistUpdate);
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);

    const intervalId = setInterval(handleWishlistUpdate, 2000);

    return () => {
      window.removeEventListener('storage', handleWishlistUpdate);
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSearchOpen(false);
        setSearchQuery('');
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setSearchOpen(false);
    setUserDropdownOpen(false);
    setMobileSubmenuOpen(null);
    
    // Force user state update on route change
    const userData = localStorage.getItem('user');
    setUser(userData ? JSON.parse(userData) : null);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      setUserDropdownOpen(false);
      setIsOpen(false);
      setShowLogoutConfirm(false);
      
      // Clear the cart
      if (typeof clearCart === 'function') {
        clearCart();
      } else {
        console.error('clearCart is not a function');
      }
      
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('userLoggedOut'));
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleMobileSubmenu = (menu) => {
    setMobileSubmenuOpen(mobileSubmenuOpen === menu ? null : menu);
  };

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'scrolled' : ''} ${isOpen ? 'menu-open' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 120, damping: 20 }}
    >
      {/* Top Announcement Bar */}
      <motion.div
        className="announcement-bar"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p>✨ Free shipping on all orders over $50 | Use code: SNEAKER10</p>
      </motion.div>

      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={() => setIsOpen(false)}>
          <motion.span
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="logo-icon">👟</span> 𝓢𝓷𝓮𝓪𝓴𝓮𝓻𝓗𝓾𝓫
          </motion.span>
        </Link>

        {/* Desktop Navigation */}
        <div className="desktop-nav">
          <ul className="nav-links">
            {mainCategories.map((category) => (
              <li
                key={category.name}
                className={`nav-item ${category.megaMenu ? 'mega-menu-trigger' : ''}`}
              >
                <Link
                  to={category.path}
                  className={`nav-link ${location.pathname.startsWith(category.path) ? 'active' : ''}`}
                >
                  {category.name}
                  {category.featured && <span className="featured-badge">New</span>}
                </Link>
              </li>
            ))}

            <li className="nav-item">
              <Link
                to="/collections"
                className={`nav-link ${location.pathname.startsWith('/collections') ? 'active' : ''}`}
              >
                Collections
              </Link>
            </li>

            <li className="nav-item">
              <Link
                to="/help"
                className={`nav-link ${location.pathname.startsWith('/help') ? 'active' : ''}`}
              >
                Help
              </Link>
            </li>
          </ul>
        </div>

        {/* Desktop Icons */}
        <div className="desktop-icons">
          {/* Wishlist Icon with Count */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
          >
            <Link to="/wishlist" className="icon-link" aria-label="View wishlist">
              <FiHeart />
              {wishlistCount > 0 && (
                <span className="icon-badge">{wishlistCount}</span>
              )}
            </Link>
          </motion.div>

          {/* Cart Icon with Count */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
          >
            <Link to="/cart" className="icon-link" aria-label="View shopping bag">
              <FiShoppingBag />
              {cartCount > 0 && (
                <span className="icon-badge">{cartCount}</span>
              )}
            </Link>
          </motion.div>

          {/* User Account */}
          <motion.div
            className="user-container"
            ref={userDropdownRef}
          >
            {user ? (
              <div className="user-logged-in">
                <motion.button
                  className="user-button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-expanded={userDropdownOpen}
                  aria-label="User menu"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="user-avatar" />
                  ) : (
                    <div className="user-avatar-fallback">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="user-name">{user.firstName?.split(' ')[0]}</span>
                  {userDropdownOpen ? <FiChevronUp /> : <FiChevronDown />}
                </motion.button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      className="user-dropdown-menu"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <div className="user-info">
                        <p className="welcome">Welcome back,</p>
                        <h4>{user.firstName?.split(' ')[0]}</h4>
                        <p className="user-email">{user.email}</p>
                      </div>
                      <div className="dropdown-divider"></div>
                      <Link to="/account" className="dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                        <FiUser /> My Account
                      </Link>
                      <Link to="/orders" className="dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                        <FiClock /> My Orders
                      </Link>
                      <Link to="/wishlist" className="dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                        <FiHeart /> My Wishlist ({wishlistCount})
                      </Link>
                      <div className="dropdown-divider"></div>
                      <button
                        className="dropdown-item logout"
                        onClick={() => setShowLogoutConfirm(true)}
                      >
                        <FiLogOut /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
              >
                <Link to="/login" className="icon-link signin-link" aria-label="Sign in">
                  <FiUser />
                  <span>Sign In</span>
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          className="mobile-menu-button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          whileTap={{ scale: 0.9 }}
        >
          <AnimatePresence mode='wait'>
            <motion.div
              key={isOpen ? "x" : "menu"}
              initial={{ rotate: isOpen ? -90 : 0, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: isOpen ? 90 : -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isOpen ? <FiX size={24} /> : (
                <>
                  <FiMenu size={24} />
                  {cartCount > 0 && (
                    <span className="mobile-cart-badge">{cartCount}</span>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                className="mobile-menu-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                className="mobile-menu"
                ref={mobileMenuRef}
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <div className="mobile-menu-header">
                  <button className="mobile-close" onClick={() => setIsOpen(false)} aria-label="Close menu">
                    <FiX size={20} />
                  </button>
                  <Link to="/" className="mobile-logo" onClick={() => setIsOpen(false)}>
                    <span className="logo-icon">👟</span>
                    <span className="mobile-brand">SneakerHub</span>
                  </Link>
                </div>

                {/* Larger Search */}
                <motion.form
                  className="mobile-search-form large"
                  onSubmit={handleSearch}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <input
                    type="text"
                    placeholder="Search for shoes, brands, styles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" aria-label="Search">
                    <FiSearch />
                  </button>
                </motion.form>

                <div className="mobile-content">
                  {/* Mobile Navigation Links */}
                  <div className="mobile-nav-links-section">
                    {mainCategories.map((category) => (
                      <Link
                        key={category.name}
                        to={category.path}
                        className="mobile-nav-link"
                        onClick={() => setIsOpen(false)}
                      >
                        {category.name}
                        {category.featured && <span className="mobile-featured-badge">New</span>}
                      </Link>
                    ))}

                    <Link to="/collections" className="mobile-nav-link" onClick={() => setIsOpen(false)}>
                      Collections
                    </Link>

                    <Link to="/help" className="mobile-nav-link" onClick={() => setIsOpen(false)}>
                      Help
                    </Link>
                  </div>

                  {/* Mobile Auth Section */}
                  <div className="mobile-auth-section">
                    {user ? (
                      <>
                        <div className="mobile-user-card">
                          <div className="mobile-user-left">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="mobile-user-avatar" />
                            ) : (
                              <div className="mobile-user-avatar-fallback">
                                {user.name?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="mobile-user-right">
                            <p className="welcome small">Welcome back</p>
                            <h4 className="mobile-user-name">{user.name?.split(' ')[0]}</h4>
                            <p className="mobile-user-email">{user.email}</p>
                          </div>
                        </div>

                        <div className="mobile-auth-links-group">
                          <Link to="/account" className="mobile-auth-link" onClick={() => setIsOpen(false)}>
                            <FiUser /> My Account
                          </Link>
                          <Link to="/orders" className="mobile-auth-link" onClick={() => setIsOpen(false)}>
                            <FiClock /> My Orders
                          </Link>
                          <Link to="/wishlist" className="mobile-auth-link" onClick={() => setIsOpen(false)}>
                            <FiHeart /> My Wishlist <span className="wishlist-badge">{wishlistCount}</span>
                          </Link>
                        </div>

                        <button
                          className="mobile-auth-link logout"
                          onClick={() => setShowLogoutConfirm(true)}
                        >
                          <FiLogOut /> Sign Out
                        </button>
                      </>
                    ) : (
                      <div className="mobile-auth-links-group">
                        <Link to="/login" className="mobile-auth-link primary" onClick={() => setIsOpen(false)}>
                          Sign In
                        </Link>
                        <Link to="/register" className="mobile-auth-link secondary" onClick={() => setIsOpen(false)}>
                          Create Account
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Mobile Promo */}
                  <div className="mobile-promo">
                    <FiGift className="promo-icon" />
                    <div>
                      <p className="promo-title">Member Exclusive</p>
                      <p className="promo-text">Free shipping on all orders</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <>
            <motion.div
              className="logout-confirm-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
            />
            <motion.div
              className="logout-confirm-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <h3>Confirm Logout</h3>
              <p>Are you sure you want to sign out?</p>
              <div className="logout-confirm-buttons">
                <button
                  className="cancel-button"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className="confirm-button"
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
