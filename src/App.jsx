import { AnimatePresence } from 'framer-motion';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation
} from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { UserProvider } from './context/UserContext';
import { AuthProvider } from './context/AuthContext';// ✅ Import UserProvider

import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Shop from './pages/Shop/Shop';
// import Product from './pages/Product/Product';
import Cart from './pages/Cart/Cart';
import Collection from './pages/Collection/Collection';
import HelpCenter from './pages/HelpCenter/HelpCenter';
import NewArrivals from './pages/NewArrivals/NewArrivals';
import WishlistPage from './pages/Wishlist/WishlistPage';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import React, { useEffect } from 'react';
import Account from './pages/Account/Account';
import Checkout from './pages/Checkout/Checkout';
import Orders from './pages/Orders/Orders';

// ScrollToTop component to scroll on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
};

function App() {
  return (
    <React.StrictMode>
      <Router>
        <AuthProvider>
          <UserProvider>
            <CartProvider>
              <ScrollToTop />
              <Navbar />

              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/account" element={<Account />} />

                  <Route path="/register" element={<Register />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders" element={<Orders />} />
                  
                  <Route path="/shop" element={<Shop />} />
                  {/* <Route path="/product/:id" element={<Product />} /> */}
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/collections" element={<Collection />} />
                  <Route path="/help" element={<HelpCenter />} />
                  <Route path="/new-arrivals" element={<NewArrivals />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                </Routes>
              </AnimatePresence>
            </CartProvider>
          </UserProvider>
        </AuthProvider>
      </Router>
    </React.StrictMode>
  );
}

export default App;
