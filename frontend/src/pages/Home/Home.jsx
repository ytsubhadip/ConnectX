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








      
    </div>
  );
}

export default Home;