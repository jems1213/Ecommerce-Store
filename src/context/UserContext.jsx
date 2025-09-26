import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import api from '../utils/apiClient';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const verifyAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get('/api/auth/me', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        if (res?.data?.status === 'success') {
          setUserData(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        } else {
          if (res?.status === 401 || res?.status === 404) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
          setUserData(null);
        }
      } catch (err) {
        throw err; // let outer catch handle
      }
    } catch (error) {
      console.error('Auth verification error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    verifyAuth();
    
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        verifyAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [verifyAuth]);

  const login = (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUserData(user);
    window.dispatchEvent(new Event('userLoggedIn'));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserData(null);
    window.dispatchEvent(new Event('userLoggedOut'));
  };

  return (
    <UserContext.Provider value={{ 
      userData, 
      isLoading,
      login,
      logout,
      verifyAuth
    }}>
      {!isLoading && children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
