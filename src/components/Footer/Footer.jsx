import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import logoSrc from '../../assets/default-shoe.svg';
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
    // use navigate for client-side routing
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
        <div className="sh-top">
          <div className="sh-brand">
            <img src={logoSrc} alt="SneakerHub" className="sh-logo" />
            <h3 className="sh-title">SneakerHub</h3>
          </div>

          <nav className="sh-nav" aria-label="Footer navigation">
            {menu.map(item => (
              <button
                key={item.label}
                className="sh-nav-btn"
                onClick={() => handleNavigate(item.to)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="sh-newsletter">
            <form className="sh-news-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email for newsletter"
                className="sh-input"
              />
              <button type="submit" className="sh-cta">Subscribe</button>
            </form>
            {status && <div className="sh-status">{status}</div>}
          </div>
        </div>

        <div className="sh-bottom">
          <div className="sh-copy">© SneakerHub {new Date().getFullYear()}</div>
          <div className="sh-socials">
            <button className="sh-icon" onClick={() => window.open('https://facebook.com', '_blank')} aria-label="Facebook"><FaFacebookF /></button>
            <button className="sh-icon" onClick={() => window.open('https://instagram.com', '_blank')} aria-label="Instagram"><FaInstagram /></button>
            <button className="sh-icon" onClick={() => window.open('https://twitter.com', '_blank')} aria-label="Twitter"><FaTwitter /></button>
            <button className="sh-icon" onClick={() => window.open('https://youtube.com', '_blank')} aria-label="YouTube"><FaYoutube /></button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
