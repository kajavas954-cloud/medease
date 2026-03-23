import React from 'react';
import './SplashLoader.css';

function SplashLoader() {
  return (
    <div className="splash-overlay">
      <div className="splash-content">
        <svg width="100" height="100" viewBox="0 0 24 24" fill="none" className="splash-logo">
          <path d="M12 2L3 6V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V6L12 2Z" fill="#1abc9c"/>
          <path d="M16 11.5H13V8.5H11V11.5H8V13.5H11V16.5H13V13.5H16V11.5Z" fill="white"/>
        </svg>
        <h1 className="splash-text">MedEase</h1>
        <p className="splashsub">Securing your session...</p>
        <div className="splash-spinner"></div>
      </div>
    </div>
  );
}

export default SplashLoader;
