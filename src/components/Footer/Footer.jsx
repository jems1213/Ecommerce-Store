import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-container">
          <div className="footer-col footer-brand">
            <Link to="/" className="footer-logo">Puma-like Shop</Link>
            <p className="footer-desc">Premium footwear and apparel — performance and style in every step.</p>
            <div className="footer-contact">
              <div className="contact-item"><FaMapMarkerAlt /> 123 Sneaker St, Footwear City</div>
              <div className="contact-item"><FaPhoneAlt /> +1 (555) 123-4567</div>
              <div className="contact-item"><FaEnvelope /> support@yourcompany.com</div>
            </div>
            <div className="socials">
              <a aria-label="Facebook" href="#"><FaFacebookF /></a>
              <a aria-label="Instagram" href="#"><FaInstagram /></a>
              <a aria-label="Twitter" href="#"><FaTwitter /></a>
              <a aria-label="YouTube" href="#"><FaYoutube /></a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Shop</h4>
            <ul>
              <li><Link to="/shop">All Shoes</Link></li>
              <li><Link to="/new-arrivals">New Arrivals</Link></li>
              <li><Link to="/collections">Collections</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/press">Press</Link></li>
              <li><Link to="/investors">Investors</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/shipping">Shipping & Returns</Link></li>
              <li><Link to="/size-guide">Size Guide</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          <div className="footer-col footer-newsletter">
            <div className="newsletter-compact">
              <h4>Stay Updated</h4>
              <p>Subscribe for latest releases & exclusive offers</p>
              <form className="newsletter-compact-form" onSubmit={(e)=>e.preventDefault()}>
                <input type="email" placeholder="Your email address" aria-label="Email" required />
                <button type="submit">Subscribe</button>
              </form>
            </div>

            <div className="payment-logos" aria-hidden>
              <img src="/vite.svg" alt="payment" />
              <img src="/vite.svg" alt="payment" />
              <img src="/vite.svg" alt="payment" />
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-container footer-bottom-row">
          <div>© {new Date().getFullYear()} Puma-like Shop. All rights reserved.</div>
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
