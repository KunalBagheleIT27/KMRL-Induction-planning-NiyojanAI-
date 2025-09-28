import React from 'react';
import './Footer.css';

// Assumptions:
// - Official website: https://kochimetro.org
// - Contact email: info@kochimetro.org
// These can be changed in the component props or by editing the file.

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-inner">
        <div className="footer-column footer-brand">
          <h3>Kochi Metro Rail</h3>
          <p>
            Official website: <a href="https://kochimetro.org" target="_blank" rel="noopener noreferrer">kochimetro.org</a>
          </p>
          <p>
            Contact: <a href="mailto:info@kochimetro.org">info@kochimetro.org</a>
          </p>
        </div>

        <div className="footer-column footer-links">
          <h4>Follow us</h4>
          <ul>
            <li>
              <a href="https://www.linkedin.com/company/kochi-metro-rail-ltd" target="_blank" rel="noopener noreferrer" aria-label="Kochi Metro on LinkedIn">🔗 LinkedIn</a>
            </li>
            <li>
              <a href="https://x.com/MetroRailKochi/" target="_blank" rel="noopener noreferrer" aria-label="Kochi Metro on X">🐦 X</a>
            </li>
            <li>
              <a href="https://www.facebook.com/KochiMetroRail/" target="_blank" rel="noopener noreferrer" aria-label="Kochi Metro on Facebook">📘 Facebook</a>
            </li>
            <li>
              <a href="https://www.instagram.com/kochimetrorail/" target="_blank" rel="noopener noreferrer" aria-label="Kochi Metro on Instagram">📸 Instagram</a>
            </li>
          </ul>
        </div>

        <div className="footer-column footer-legal">
          <h4>Useful</h4>
          <ul>
            <li>
              <a href="https://kochimetro.org" target="_blank" rel="noopener noreferrer">About Kochi Metro</a>
            </li>
            <li>
              <a href="mailto:info@kochimetro.org">Email Support</a>
            </li>
            <li>
              <a href="https://github.com/KunalBagheleIT27/KMRL-Induction-planning-NiyojanAI-" target="_blank" rel="noopener noreferrer">Project Repo</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <small>© {year} Kochi Metro Rail Limited. All rights reserved.</small>
      </div>
    </footer>
  );
}
