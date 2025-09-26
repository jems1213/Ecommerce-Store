import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const menu = [
    { label: 'New Arrivals', to: '/new-arrivals' },
    { label: 'New', to: '/new' },
    { label: 'Shop', to: '/shop' },
    { label: 'Collections', to: '/collections' },
    { label: 'Help', to: '/help' }
  ];

  const handleNavigate = (to) => {
    navigate(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) {
      setStatus('Please enter a valid email');
      return;
    }
    setStatus('Subscribed — check your inbox');
    setEmail('');
    setTimeout(() => setStatus(''), 4000);
  };

  return (
    <footer className="sh-footer" role="contentinfo">
      <div className="sh-inner">
        <div className="sh-grid">

          <div className="sh-section sh-brand">
            <img src={logoSrc} alt="SneakerHub" className="sh-logo" />
            <div>
              <h3 className="sh-brand-title"><span className="sh-emoji" aria-hidden>👟</span> SneakerHub</h3>
              <p className="sh-brand-desc">Your destination for curated sneakers — new drops, classics and exclusive collabs.</p>
            </div>
          </div>

          <div className="sh-section sh-links">
            <h4 className="sh-heading">Explore</h4>
            <ul className="sh-list" aria-label="Explore links">
              {menu.map(item => (
                <li key={item.label}>
                  <button className="sh-link-btn" type="button" onClick={() => handleNavigate(item.to)}>{item.label}</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="sh-section sh-account">
            <h4 className="sh-heading">Account</h4>
            <ul className="sh-list">
              <li><button className="sh-link-btn" onClick={() => handleNavigate('/account')}>My Account</button></li>
              <li><button className="sh-link-btn" onClick={() => handleNavigate('/orders')}>My Orders</button></li>
              <li><button className="sh-link-btn" onClick={() => handleNavigate('/wishlist')}>Wishlist</button></li>
              <li><button className="sh-link-btn" onClick={() => handleNavigate('/cart')}>Cart</button></li>
            </ul>
          </div>

          <div className="sh-section sh-newsletter">
            <h4 className="sh-heading">Stay in the loop</h4>
            <p className="sh-news-desc">Sign up for release alerts, early access and special offers.</p>
            <form className="sh-news-form" onSubmit={handleSubscribe}>
              <input
                className="sh-input"
                aria-label="Email for newsletter"
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="sh-cta">Subscribe</button>
            </form>
            {status && <div className="sh-status" role="status">{status}</div>}

            <div className="sh-socials">
              <button className="sh-icon" onClick={() => window.open('https://facebook.com', '_blank')} aria-label="Facebook"><FaFacebookF /></button>
              <button className="sh-icon" onClick={() => window.open('https://instagram.com', '_blank')} aria-label="Instagram"><FaInstagram /></button>
              <button className="sh-icon" onClick={() => window.open('https://twitter.com', '_blank')} aria-label="Twitter"><FaTwitter /></button>
              <button className="sh-icon" onClick={() => window.open('https://youtube.com', '_blank')} aria-label="YouTube"><FaYoutube /></button>
            </div>
          </div>

        </div>

        <div className="sh-bottom"> 
          <div className="sh-copy">© SneakerHub {new Date().getFullYear()} — All rights reserved.</div>
          <div className="sh-footer-links">
            <button className="sh-small-link" onClick={() => handleNavigate('/terms')}>Terms</button>
            <button className="sh-small-link" onClick={() => handleNavigate('/privacy')}>Privacy</button>
            <button className="sh-small-link" onClick={() => handleNavigate('/sitemap')}>Sitemap</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
