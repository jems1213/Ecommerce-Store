import { createContext, useContext, useState, useEffect } from 'react';
import { isValidObjectId } from 'mongoose'; // Assuming you have mongoose/similar utility or a custom check

const CartContext = createContext();

// Helper function to validate MongoDB ObjectId
// You might need to install 'bson' or implement a simpler regex check if mongoose isn't available on frontend
// For frontend, a simple regex is often sufficient.
const isValidMongoId = (id) => {
  if (!id || typeof id !== 'string') {
    return false;
  }
  // MongoDB ObjectId is a 24-character hexadecimal string
  return /^[0-9a-fA-F]{24}$/.test(id);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const getCartKey = (specificUser = null) => {
    const currentUser = specificUser || user;
    if (currentUser?.email) {
      return `cart-${currentUser.email}`;
    }
    let sessionId = localStorage.getItem('guest_session');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('guest_session', sessionId);
    }
    return `guest-cart-${sessionId}`;
  };

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const authStatus = !!token;
    setIsAuthenticated(authStatus);
    return authStatus;
  };

  const addToCart = (item) => {
    // Ensure item.id is a string, and validate it immediately.
    // If it's not a valid ID (e.g., 'undefined' string), reject it.
    const processedItem = { ...item, id: String(item.id) }; 

    if (!isValidMongoId(processedItem.id)) {
      console.error(`
        CartContext Error: Attempted to add item with invalid ID "${processedItem.id}".
        Item "${processedItem.name}" was not added to cart.
        Please ensure that the 'id' property passed to 'addToCart'
        is the actual 24-character hexadecimal MongoDB '_id' string received from your database.
      `);
      return { success: false, message: "Invalid item ID" };
    }

    setCartItems(prevItems => {
      const existingItem = prevItems.find(
        cartItem => cartItem.id === processedItem.id &&
                      cartItem.selectedSize === processedItem.selectedSize &&
                      cartItem.selectedColor === processedItem.selectedColor
      );

      return existingItem
        ? prevItems.map(cartItem =>
            cartItem.id === processedItem.id &&
            cartItem.selectedSize === processedItem.selectedSize &&
            cartItem.selectedColor === processedItem.selectedColor
              ? { ...cartItem, quantity: cartItem.quantity + processedItem.quantity }
              : cartItem
          )
        : [...prevItems, processedItem];
    });
    return { success: true };
  };

  const removeFromCart = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    const cartKey = getCartKey();
    setCartItems([]);
    localStorage.removeItem(cartKey);
  };

  const mergeCarts = (userEmail, guestCart) => {
    const userCartKey = `cart-${userEmail}`;
    const userCart = JSON.parse(localStorage.getItem(userCartKey)) || [];

    const mergedCart = [...userCart];
    guestCart.forEach(guestItem => {
      const processedGuestItem = { ...guestItem, id: String(guestItem.id) };

      if (!isValidMongoId(processedGuestItem.id)) {
        console.error(`
          CartContext Error (Merge): Guest item ID "${processedGuestItem.id}" is invalid.
          Item "${processedGuestItem.name}" will be skipped during cart merge.
        `);
        return; // Skip this invalid item
      }

      const existingItem = mergedCart.find(item => 
        item.id === processedGuestItem.id &&
        item.selectedSize === processedGuestItem.selectedSize &&
        item.selectedColor === processedGuestItem.selectedColor
      );
      existingItem ? existingItem.quantity += processedGuestItem.quantity : mergedCart.push(processedGuestItem);
    });

    localStorage.setItem(userCartKey, JSON.stringify(mergedCart));
    setCartItems(mergedCart);
    
    // Clean up guest cart
    const guestSession = localStorage.getItem('guest_session');
    if (guestSession) {
      localStorage.removeItem(`guest-cart-${guestSession}`);
      localStorage.removeItem('guest_session');
    }
  };

  useEffect(() => {
    const handleUserChange = (event) => {
      const userData = event?.detail || JSON.parse(localStorage.getItem('user'));
      setUser(userData);
      const authStatus = checkAuth();
      
      // Merge carts when user logs in
      if (authStatus && userData?.email) {
        const guestCartKey = getCartKey();
        const guestCart = JSON.parse(localStorage.getItem(guestCartKey)) || [];
        if (guestCart.length > 0) {
          mergeCarts(userData.email, guestCart);
        }
      }
    };

    // Initial load
    handleUserChange();
    
    // Event listeners
    window.addEventListener('userLoggedIn', handleUserChange);
    window.addEventListener('userLoggedOut', () => {
      setUser(null);
      setIsAuthenticated(false);
    });
    window.addEventListener('storage', handleUserChange);

    return () => {
      window.removeEventListener('userLoggedIn', handleUserChange);
      window.removeEventListener('userLoggedOut', handleUserChange);
      window.removeEventListener('storage', handleUserChange);
    };
  }, []);

  useEffect(() => {
    const cartKey = getCartKey();
    const savedCart = localStorage.getItem(cartKey);
    // When loading from storage, filter out any invalid IDs *immediately*
    const loadedItems = savedCart ? JSON.parse(savedCart) : [];
    const validLoadedItems = loadedItems.filter(item => {
      if (!isValidMongoId(item.id)) {
        console.warn(`CartContext Warning: Removing item "${item.name}" with invalid ID "${item.id}" from loaded cart.`);
        return false;
      }
      return true;
    });
    setCartItems(validLoadedItems);
  }, [user]); // Depend on user to reload cart when user changes

  useEffect(() => {
    const cartKey = getCartKey();
    if (cartItems.length > 0) {
      localStorage.setItem(cartKey, JSON.stringify(cartItems));
    } else {
      localStorage.removeItem(cartKey);
    }
  }, [cartItems, user]); // Depend on cartItems and user to save cart

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isAuthenticated,
        user
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};