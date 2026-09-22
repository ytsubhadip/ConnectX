import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <header className="navbar-wrapper">
      <nav className="capsule-nav">
        {/* Left Side: Brand Logo & Links */}
        <div className="nav-left">
          <Link to="/" className="nav-logo" aria-label="ConnectX Home">
            <svg className="logo-sparkle" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              {/* 4 dots arranged in diamond/cross pattern matching screenshot */}
              <circle cx="12" cy="4" r="2.8" />
              <circle cx="12" cy="20" r="2.8" />
              <circle cx="4" cy="12" r="2.8" />
              <circle cx="20" cy="12" r="2.8" />
            </svg>
            <span className="logo-text">ConnectX</span>
          </Link>

          <div className="nav-links">
            {/* <a href="#features" className="nav-link">Products</a>
            <a href="#ai-chatbot" className="nav-link">AI Chatbot</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <a href="#docs" className="nav-link">Docs</a> */}
          </div>
        </div>

        {/* Right Side: Contact & Glowing Get Started */}
        <div className="nav-right">
          <Link to="/login" className="btn-contact">Login</Link>
          <Link to="/register" className="btn-get-started-glow">Get Started</Link>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;