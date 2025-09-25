import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { API_BASE } from '../../utils/apiClient';
import axios from 'axios';
import { FiUser, FiLock, FiArrowRight, FiAlertCircle } from 'react-icons/fi';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!credentials.email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (!credentials.password) {
      setError('Password is required');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      // Primary attempt: use configured api instance
      let res = null;
      try {
        res = await api.post('/api/auth/login', {
          email: credentials.email.trim(),
          password: credentials.password
        });
      } catch (primaryErr) {
        // If primary attempt returned 404, try absolute origin fallback
        const status = primaryErr?.response?.status;
        const cfgUrl = primaryErr?.config?.url || '/api/auth/login';
        console.warn('Primary login attempt failed', { status, url: cfgUrl, err: primaryErr });

        if (status === 404) {
          try {
            const absolute = `${window.location.origin}/api/auth/login`;
            res = await axios.post(absolute, {
              email: credentials.email.trim(),
              password: credentials.password
            }, { headers: { 'Content-Type': 'application/json' } });
          } catch (fallbackErr) {
            console.warn('Fallback absolute login attempt failed', fallbackErr);
            throw fallbackErr;
          }
        } else {
          // rethrow non-404 to outer catch
          throw primaryErr;
        }
      }

      const data = res.data;

      // Handle a couple of response shapes
      const token = data?.token || data?.data?.token;
      const user = data?.user || data?.data?.user;

      if (!token) {
        const msg = data?.message || 'Authentication token missing in response';
        throw new Error(msg);
      }
      if (!user || !user.email) throw new Error('User data incomplete in response');

      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Update app state
      window.dispatchEvent(new Event('storage'));
      navigate('/', { replace: true });

    } catch (err) {
      console.error('Login error:', err);
      
      let errorMessage = err.message || 'Login failed. Please try again.';
      
      if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Please check your connection.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-container">
      <div className="glass-card">
        <h2 className="glass-title">Welcome Back</h2>
        <p className="glass-subtitle">Sign in to continue</p>
        
        {error && (
          <div className="error-message">
            <FiAlertCircle className="error-icon" />
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className={`glass-input-group ${error && !credentials.email ? 'error' : ''}`}>
            <FiUser className="glass-icon" />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={credentials.email}
              onChange={handleChange}
              required
              autoComplete="username"
              aria-label="Email address"
            />
          </div>
          
          <div className={`glass-input-group ${error && !credentials.password ? 'error' : ''}`}>
            <FiLock className="glass-icon" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              required
              minLength="8"
              autoComplete="current-password"
              aria-label="Password"
            />
          </div>
          
          <div className="form-options">
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>
          
          <button 
            type="submit" 
            className="glass-button"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <span className="button-loading">
                <span className="spinner"></span>
                Signing In...
              </span>
            ) : (
              <>
                Sign In <FiArrowRight className="arrow-icon" />
              </>
            )}
          </button>
        </form>
        
        <div className="glass-footer">
          <span>New here? </span>
          <Link to="/register" className="glass-link">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
