import React from 'react';
import './Footer.css';
import logo from '../../assets/kmrl-logo.jpeg';

// Footer with SVG icons, gradient background, and logo image
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" role="contentinfo" aria-label="Kochi Metro footer">
      <div className="footer-deco" aria-hidden="true" style={{backgroundImage:`url(${logo})`}} />

      <div className="footer-inner">
        <div className="footer-column footer-brand">
          <img src={logo} alt="Kochi Metro logo" className="footer-logo" />
          <div className="brand-text">
            <h3>Kochi Metro Rail Limited</h3>
            <p className="muted">Official website & contact</p>
            <a className="site-link" href="https://kochimetro.org" target="_blank" rel="noopener noreferrer">kochimetro.org</a>
            <a className="email-link" href="mailto:info@kochimetro.org">info@kochimetro.org</a>
          </div>
        </div>

        <div className="footer-column footer-social">
          <h4>Follow us</h4>
          <div className="social-grid">
            <a href="https://www.linkedin.com/company/kochi-metro-rail-ltd" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Kochi Metro on LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor" className="icon"><path d="M19 3A2 2 0 0 1 21 5v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.5 17V10.5H6V17h2.5zM7.25 9.5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5zM18 17v-4.1c0-2.2-1.4-3.1-2.2-3.1-.9 0-1.8.5-2.1 1v-.9H11.5V17h2.5v-3.5c0-.8.1-1.6 1.1-1.6.9 0 1 1 1 1.6V17H18z"/></svg>
              <span>LinkedIn</span>
            </a>

            <a href="https://x.com/MetroRailKochi/" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Kochi Metro on X">
              <svg viewBox="0 0 24 24" fill="currentColor" className="icon"><path d="M22 5.92c-.61.27-1.26.45-1.95.53.7-.42 1.24-1.08 1.5-1.87-.66.39-1.4.68-2.18.84C18.7 4.47 17.78 4 16.78 4c-1.67 0-3.02 1.35-3.02 3.02 0 .24.03.47.08.69C10.11 7.54 7.08 6.07 5.1 3.9c-.27.46-.43.99-.43 1.56 0 1.07.54 2.02 1.36 2.58-.5-.02-.97-.15-1.38-.38v.04c0 1.47 1.05 2.7 2.45 2.98-.25.07-.51.11-.78.11-.19 0-.38-.02-.56-.06.38 1.19 1.49 2.06 2.81 2.09-1.03.8-2.33 1.28-3.73 1.28-.24 0-.47-.01-.7-.04 1.33.85 2.92 1.35 4.63 1.35 5.55 0 8.59-4.6 8.59-8.59 0-.13 0-.26-.01-.39.59-.43 1.1-.97 1.5-1.6-.54.24-1.12.4-1.72.47z"/></svg>
              <span>X</span>
            </a>

            <a href="https://www.facebook.com/KochiMetroRail/" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Kochi Metro on Facebook">
              <svg viewBox="0 0 24 24" fill="currentColor" className="icon"><path d="M22 12.07C22 6.48 17.52 2 12 2S2 6.48 2 12.07C2 17.1 5.66 21.2 10.44 21.95v-6.99H8.08v-2.89h2.36V9.41c0-2.33 1.39-3.61 3.52-3.61 1.02 0 2.08.18 2.08.18v2.29h-1.17c-1.15 0-1.51.72-1.51 1.46v1.75h2.57l-.41 2.89h-2.16v6.99C18.34 21.2 22 17.1 22 12.07z"/></svg>
              <span>Facebook</span>
            </a>

            <a href="https://www.instagram.com/kochimetrorail/" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Kochi Metro on Instagram">
              <svg viewBox="0 0 24 24" fill="currentColor" className="icon"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm8 3a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"/></svg>
              <span>Instagram</span>
            </a>
          </div>
        </div>

        <div className="footer-column footer-links">
          <h4>Quick links</h4>
          <ul>
            <li><a href="https://kochimetro.org" target="_blank" rel="noopener noreferrer">About Kochi Metro</a></li>
            <li><a href="mailto:info@kochimetro.org">Contact support</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <small>© {year} Kochi Metro Rail Limited. All rights reserved.</small>
      </div>
    </footer>
  );
}
