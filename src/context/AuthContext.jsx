import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import api, { API_BASE } from '../utils/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          // prefer api instance which may proxy or handle base
          let res;
          try {
            res = await api.get('/api/auth/me');
          } catch (e) {
            const base = API_BASE || window.location.origin;
            const absolute = `${base.replace(/\/$/, '')}/api/auth/me`;
            res = await axios.get(absolute);
          }

          setUser(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user));

          const event = new CustomEvent('userLoggedIn', { detail: res.data.user });
          window.dispatchEvent(event);
        } catch (err) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (credentials) => {
    try {
      // try using api instance which knows base/proxy
      let res;
      try {
        res = await api.post('/api/auth/login', credentials);
      } catch (primaryErr) {
        const isNetworkError = !primaryErr.response;
        const isServerError = primaryErr.response && primaryErr.response.status >= 500;
        const status = primaryErr.response?.status;

        if (status === 404 || isNetworkError || isServerError) {
          const base = API_BASE || window.location.origin;
          const absolute = `${base.replace(/\/$/, '')}/api/auth/login`;
          res = await axios.post(absolute, credentials, { headers: { 'Content-Type': 'application/json' } });
        } else {
          throw primaryErr;
        }
      }

      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

      // fetch user
      let userRes;
      try {
        userRes = await api.get('/api/auth/me');
      } catch (e) {
        const base = API_BASE || window.location.origin;
        const absolute = `${base.replace(/\/$/, '')}/api/auth/me`;
        userRes = await axios.get(absolute);
      }

      setUser(userRes.data.user);
      localStorage.setItem('user', JSON.stringify(userRes.data.user));

      // Dispatch event with user data
      const event = new CustomEvent('userLoggedIn', { detail: userRes.data.user });
      window.dispatchEvent(event);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    window.dispatchEvent(new Event('userLoggedOut'));
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout,
      setUser
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
