import React, { useState } from "react";
import "./Footer.css";

const Footer = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  return (
    <footer className="footer-global fade-in-scroll">
      <div className="footer-content">
        <div className="footer-section brand-section">
          <div className="footer-brand-title-wrap" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
            <div className="footer-brand-logo">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 6V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V6L12 2Z" fill="#1abc9c"/>
                <path d="M16 11.5H13V8.5H11V11.5H8V13.5H11V16.5H13V13.5H16V11.5Z" fill="white"/>
              </svg>
            </div>
            <h2 className="footer-logo" style={{ margin: 0 }}>MedEase</h2>
          </div>
          <p className="footer-tagline">Your trusted online pharmacy suite, delivering health and wellness directly to your doorstep with absolute digital precision.</p>
        </div>

        <div className="footer-section px-pad">
          <h3>Subscribe</h3>
          <p>Get the latest medical updates and offers.</p>
          <div className="subscribe-box">
            <input type="email" placeholder="Enter your email" disabled={isSubscribed} />
            <button 
              className={isSubscribed ? "btn-subscribed" : ""}
              onClick={() => setIsSubscribed(true)}
              disabled={isSubscribed}
            >
              {isSubscribed ? "✓ Subscribed" : "Subscribe"}
            </button>
          </div>
        </div>
        
        <div className="footer-section">
          <h3>Download MedEase</h3>
          <p>We will be available soon on Play Store and App Store</p>
          <div className="download-buttons">
            <button className="store-btn disabled" disabled>
              <div className="store-icon-wrapper">▶</div>
              <div className="store-text">
                <span className="store-sub">Get it on</span>
                <span className="store-main">Google Play</span>
              </div>
              <span className="coming-soon">Soon</span>
            </button>
            <button className="store-btn disabled" disabled>
              <div className="store-icon-wrapper">🍎</div>
              <div className="store-text">
                <span className="store-sub">Download on the</span>
                <span className="store-main">App Store</span>
              </div>
              <span className="coming-soon">Soon</span>
            </button>
          </div>
        </div>

        <div className="footer-section contact-section">
          <h3>Contact Us</h3>
          <ul className="contact-list">
             <li><span className="contact-icon">✉️</span> support@medease.com</li>
             <li><span className="contact-icon">📞</span> +1 800 123 4567</li>
             <li><span className="contact-icon">📍</span> 123 Health Ave, Wellness City</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} MedEase. All Rights Reserved. Designed for your health.</p>
      </div>
    </footer>
  );
};

export default Footer;
