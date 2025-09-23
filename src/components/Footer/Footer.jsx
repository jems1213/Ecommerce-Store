import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) {
      setStatus('Please enter a valid email address');
      return;
    }
    setStatus('Thanks for subscribing!');
    setEmail('');
    setTimeout(() => setStatus(''), 4000);
  };

  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-container footer-grid">

          <div className="footer-col footer-brand">
            <Link to="/" className="footer-logo brand-link">Puma-like Shop</Link>
            <p className="brand-desc">Premium footwear and apparel — performance and style in every step.</p>

            <div className="brand-contact" aria-label="Contact information">
              <div className="contact-item"><FaMapMarkerAlt className="contact-icon" /> <span>123 Sneaker St, Footwear City</span></div>
              <div className="contact-item"><FaPhoneAlt className="contact-icon" /> <span>+1 (555) 123-4567</span></div>
              <div className="contact-item"><FaEnvelope className="contact-icon" /> <span>support@yourcompany.com</span></div>
            </div>

            <div className="socials" aria-label="Social links">
              <a aria-label="Facebook" href="#"><FaFacebookF /></a>
              <a aria-label="Instagram" href="#"><FaInstagram /></a>
              <a aria-label="Twitter" href="#"><FaTwitter /></a>
              <a aria-label="YouTube" href="#"><FaYoutube /></a>
            </div>
          </div>

          <nav className="footer-col footer-links" aria-label="Footer navigation">
            <div className="footer-column">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/shop">Shop</Link></li>
                <li><Link to="/new-arrivals">New Arrivals</Link></li>
                <li><Link to="/collections">Collections</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Support</h4>
              <ul>
                <li><Link to="/help">Help Center</Link></li>
                <li><Link to="/shipping">Shipping</Link></li>
                <li><Link to="/returns">Returns</Link></li>
                <li><Link to="/size-guide">Size Guide</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Account</h4>
              <ul>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
                <li><Link to="/orders">Orders</Link></li>
                <li><Link to="/wishlist">Wishlist</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Policies</h4>
              <ul>
                <li><Link to="/terms">Terms</Link></li>
                <li><Link to="/privacy">Privacy</Link></li>
                <li><Link to="/sitemap">Sitemap</Link></li>
              </ul>
            </div>
          </nav>

          <div className="footer-col footer-newsletter">
            <h4>Newsletter</h4>
            <p className="newsletter-desc">Get release alerts, early access and member-only deals.</p>
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <label htmlFor="footer-email" className="sr-only">Email address</label>
              <input
                id="footer-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn-subscribe">Subscribe</button>
            </form>
            {status && <div className="newsletter-status" role="status">{status}</div>}
          </div>

        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-container footer-bottom-row">
          <div className="copyright">© {new Date().getFullYear()} Puma-like Shop. All rights reserved.</div>
          <div className="footer-links-inline">
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/sitemap">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
