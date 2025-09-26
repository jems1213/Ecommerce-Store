import React, { useState } from 'react';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) {
      setStatus('Vul een geldig emailadres in');
      return;
    }
    setStatus('Bedankt voor je inschrijving!');
    setEmail('');
    setTimeout(() => setStatus(''), 4000);
  };

  return (
    <footer className="rewild-footer" role="contentinfo">
      <div className="rewild-footer__container">
        <div className="rewild-row">

          <section className="rw-col rw-newsletter" aria-labelledby="rw-newsletter-title">
            <h2 id="rw-newsletter-title" className="rw-heading">SneakerHub Nieuwsbrief</h2>
            <form className="rw-newsletter-form" onSubmit={handleSubscribe}>
              <label htmlFor="rw-email" className="sr-only">Emailadres</label>
              <input
                id="rw-email"
                type="email"
                name="EMAIL"
                placeholder="Typ hier je emailadres."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rw-input"
              />
              <button type="submit" className="rw-button">Inschrijven</button>

              <label className="sr-only" style={{display:'none'}}>
                Leave this field empty if you're human:
                <input type="text" name="_mc4wp_honeypot" tabIndex="-1" autoComplete="off" />
              </label>
              <input type="hidden" name="_mc4wp_timestamp" value={String(Math.floor(Date.now()/1000))} />
              <input type="hidden" name="_mc4wp_form_id" value="4293" />
              <input type="hidden" name="_mc4wp_form_element_id" value="mc4wp-form-1" />
            </form>
            {status && <div className="rw-status" role="status">{status}</div>}
          </section>

          <section className="rw-col rw-affiliations" aria-labelledby="rw-affiliations-title">
            <h2 id="rw-affiliations-title" className="rw-heading">Affiliaties</h2>
            <div className="rw-logos">
              <a href="https://www.vvkr.nl/" target="_blank" rel="noopener noreferrer"><img src="https://re-wild.nl/wp-content/uploads/2018/09/2-copy.png" alt="VVKR" /></a>
              <a href="https://www.vzr-garant.nl/" target="_blank" rel="noopener noreferrer"><img src="https://re-wild.nl/wp-content/uploads/2025/03/VZR-garant_RGB-e1741811185770.png" alt="VZR Garant" /></a>
            </div>
          </section>

          <section className="rw-col rw-partners" aria-labelledby="rw-partners-title">
            <h2 id="rw-partners-title" className="rw-heading">Partners & Merken</h2>
            <div className="rw-logos rw-partner-logos">
              <a href="https://rab.equipment/eu/" target="_blank" rel="noopener noreferrer"><img src="https://re-wild.nl/wp-content/uploads/2019/02/rabcc.png" alt="Rab" /></a>
              <a href="https://lowealpine.com/eu/" target="_blank" rel="noopener noreferrer"><img src="https://re-wild.nl/wp-content/uploads/2019/02/loew.png" alt="Lowe Alpine" /></a>
            </div>
          </section>

          <section className="rw-col rw-more" aria-labelledby="rw-more-title">
            <h2 id="rw-more-title" className="rw-heading">Explore SneakerHub</h2>
            <ul className="rw-links">
              <li><a href="/about">About SneakerHub</a></li>
              <li><a href="/blog">Blog & Culture</a></li>
              <li><a href="/contact">Contact Us</a></li>
            </ul>

            <ul className="rw-socials" aria-label="Social links">
              <li><a href="https://www.facebook.com/rewildwildernisreizen" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebookF /></a></li>
              <li><a href="https://www.instagram.com/rewildnl/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a></li>
              <li><a href="https://vimeo.com/user74250131" target="_blank" rel="noopener noreferrer" aria-label="Vimeo"><FaTwitter /></a></li>
              <li><a href="https://www.youtube.com/@RewildWildernisreizen/" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><FaYoutube /></a></li>
            </ul>
          </section>

        </div>

        <hr className="rw-divider" />

        <div className="rewild-footer__bottom">
          <div className="rewild-footer__bottom-inner">
            <div className="rw-copy">© Rewild {new Date().getFullYear()}. All Rights Reserved.</div>
            <div className="rw-bottom-links">
              <a href="/terms">Terms</a>
              <a href="/privacy">Privacy</a>
              <a href="/sitemap">Sitemap</a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
