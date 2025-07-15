import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiCalendar, FiArrowRight, FiAlertCircle } from 'react-icons/fi';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // If registration is successful, automatically log the user in
      const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        navigate('/login');
        return;
      }

      // Store auth data and redirect
      localStorage.setItem('token', loginData.token);
      localStorage.setItem('user', JSON.stringify(loginData.user));
      window.dispatchEvent(new Event('storage'));
      navigate('/', { replace: true });

    } catch (err) {
      console.error('Registration error:', err);
      
      let errorMessage = err.message || 'Registration failed. Please try again.';
      
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
        <h2 className="glass-title">Create Account</h2>
        <p className="glass-subtitle">Join our community</p>
        
        {error && (
          <div className="error-message">
            <FiAlertCircle className="error-icon" />
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="name-fields">
            <div className={`glass-input-group ${error && !formData.firstName ? 'error' : ''}`}>
              <FiUser className="glass-icon" />
              <input
                type="text"
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                autoComplete="given-name"
                aria-label="First name"
                required
              />
            </div>
            
            <div className={`glass-input-group ${error && !formData.lastName ? 'error' : ''}`}>
              <FiUser className="glass-icon" />
              <input
                type="text"
                name="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                autoComplete="family-name"
                aria-label="Last name"
                required
              />
            </div>
          </div>
          
          <div className={`glass-input-group ${error && (!formData.email || error.includes('email')) ? 'error' : ''}`}>
            <FiMail className="glass-icon" />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              aria-label="Email address"
              required
            />
          </div>
          
          <div className={`glass-input-group ${error && (!formData.password || error.includes('Password')) ? 'error' : ''}`}>
            <FiLock className="glass-icon" />
            <input
              type="password"
              name="password"
              placeholder="Password (min 8 characters)"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              aria-label="Password"
              minLength="8"
              required
            />
          </div>
          
          <div className={`glass-input-group ${error && (!formData.confirmPassword || error.includes('match')) ? 'error' : ''}`}>
            <FiLock className="glass-icon" />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              aria-label="Confirm password"
              minLength="8"
              required
            />
          </div>
          
          <div className="terms-checkbox">
            <input 
              type="checkbox" 
              id="terms" 
              required 
              aria-label="Agree to terms and conditions"
            />
            <label htmlFor="terms">
              I agree to the <Link to="/terms" className="inline-link">Terms of Service</Link> and <Link to="/privacy" className="inline-link">Privacy Policy</Link>
            </label>
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
                Creating Account...
              </span>
            ) : (
              <>
                Sign Up <FiArrowRight className="arrow-icon" />
              </>
            )}
          </button>
        </form>
        
        <div className="glass-footer">
          <span>Already have an account? </span>
          <Link to="/login" className="glass-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;