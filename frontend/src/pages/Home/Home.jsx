import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import './Home.css';



function Home() {

  const navigate = useNavigate();

  const handleGetStarted = () => {

    const user = localStorage.getItem("user");

    if (user) {
      // User is logged in
      navigate("/dashboard");
    } else {
      // User is not logged in
      navigate("/login");
    }
  };

  return (
    <div className="home-container">
      {/* Top Capsule Floating Navbar */}
      <Navbar />


      {/* Hero Section matching screenshot */}
      <section className="hero-section">
        {/* Announcement Pill Badge */}
        <div className="announcement-pill-wrapper">
          <a href="#features" className="announcement-pill">
            <span>Explore how we help grow brands.</span>

          </a>
        </div>

        {/* Hero Title */}
        <h1 className="hero-title">
          Connect. Call. Learn.<br />
          All in One Place
        </h1>

        {/* Hero Subtitle */}
        <p className="hero-subtitle">
          Stay connected with the people who matter. Start video calls, meet your friends, and build meaningful connections all in one place.
        </p>

        {/* Dual Call-to-Action Buttons */}
        <div className="hero-actions">
         

          <button
            type="button"
            onClick={handleGetStarted}
            className="btn-hero-primary"
          >
            Get Started
          </button>
          {/* <a href="#ai-chatbot" className="btn-hero-secondary" >
            Learn More <span className="btn-arrow">&rsaquo;</span>
          </a> */}
        </div>
      </section>








      {/* Footer */}
      <footer className="footer-section">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="4" r="2.8" />
                <circle cx="12" cy="20" r="2.8" />
                <circle cx="4" cy="12" r="2.8" />
                <circle cx="20" cy="12" r="2.8" />
              </svg>
              <span>ConnectX</span>
            </div>
            <p className="footer-desc">
              Next-generation AI features and autonomous chatbot platform for modern enterprises.
            </p>
          </div>

          <div className="footer-links-grid">
            <div className="footer-col">
              <h4>Product</h4>
              <a href="#ai-chatbot">AI Chatbot</a>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#docs">API Docs</a>
            </div>
            <div className="footer-col">
              <h4>Solutions</h4>
              <a href="#support">Customer Support</a>
              <a href="#analytics">Sales Copilot</a>
              <a href="#automation">Workflow Automation</a>
              <a href="#rag">Enterprise RAG</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="#about">About</a>
              <a href="#careers">Careers</a>
              <a href="#privacy">Privacy</a>
              <a href="#terms">Terms</a>
            </div>
          </div>
        </div>


      </footer>
    </div>
  );
}

export default Home;