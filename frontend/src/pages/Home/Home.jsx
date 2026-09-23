import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import './Home.css';

const PRESET_CONVERSATIONS = {
  support: {
    title: "Customer Support Agent",
    prompt: "A customer wants a refund for order #CX-9482 due to a delayed shipment. How should we handle it?",
    thought: "Checked store policy: Shipments delayed > 48h qualify for instant full refund + 15% discount credit.",
    reply: "Hello! I've verified order **#CX-9482**. Because the shipment was delayed past our 48-hour guarantee window, I've processed an **instant full refund of $149.00** back to the original payment method.\n\nI have also credited a **15% courtesy discount voucher (CODE: VIP-RESOLVE)** to their account. A confirmation email has been dispatched.",
    actions: ["Refund $149.00 Issued", "Voucher Sent", "Ticket Closed"]
  },
  analytics: {
    title: "Data & Sales Copilot",
    prompt: "What is our customer churn rate this month and which cohort has the highest drop-off?",
    thought: "Querying PostgreSQL data warehouse... analyzing 14,200 active subscriptions for September.",
    reply: "Our September churn rate is **2.1%** (down 0.4% MoM 🎉). The highest drop-off cohort is **freemium users who haven't set up API integrations within 7 days** (6.8% churn).\n\n**Recommendation**: Activate automated in-app guided onboarding for API keys to reduce drop-off by an estimated 32%.",
    actions: ["Export CSV", "Trigger Automated Campaign", "View Cohort Chart"]
  },
  automation: {
    title: "Autonomous Workflows",
    prompt: "Sync newly closed CRM deals with Stripe and notify the engineering channel on Slack.",
    thought: "Connecting HubSpot CRM -> Stripe Billing API -> Slack Webhook #eng-alerts.",
    reply: "Workflow executed successfully! **3 new enterprise deals ($42,000 ARR)** were synced with Stripe Billing invoices and notified to **#eng-alerts** with transaction receipt links.",
    actions: ["HubSpot Synced", "Stripe Invoice Generated", "Slack Notification Sent"]
  },
  rag: {
    title: "Internal Knowledge Q&A",
    prompt: "What are our compliance guidelines for storing European customer data under GDPR?",
    thought: "Searching internal vector store: [compliance_handbook_v3.pdf] chunk #82-89.",
    reply: "According to Section 4.2 of our **Security & Compliance Handbook**, all EU resident data must be stored in our `eu-central-1` (Frankfurt) AWS region with AES-256 encryption at rest and TLS 1.3 in transit. Data retention is strictly limited to 90 days after account deactivation unless explicitly opted-in.",
    actions: ["View PDF Source", "Copy Citation", "Verify Audit Log"]
  }
};

function Home() {
  const [activeTab, setActiveTab] = useState('support');
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'user',
      text: PRESET_CONVERSATIONS.support.prompt
    },
    {
      role: 'assistant',
      thought: PRESET_CONVERSATIONS.support.thought,
      text: PRESET_CONVERSATIONS.support.reply,
      actions: PRESET_CONVERSATIONS.support.actions
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef(null);

  const handleSelectPreset = (key) => {
    setActiveTab(key);
    const item = PRESET_CONVERSATIONS[key];
    setIsTyping(true);
    setChatMessages([
      { role: 'user', text: item.prompt }
    ]);

    setTimeout(() => {
      setChatMessages([
        { role: 'user', text: item.prompt },
        {
          role: 'assistant',
          thought: item.thought,
          text: item.reply,
          actions: item.actions
        }
      ]);
      setIsTyping(false);
    }, 450);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!userInput.trim() || isTyping) return;

    const userText = userInput;
    setUserInput('');
    setChatMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          thought: `Synthesizing context from 120+ integrated tools for: "${userText.slice(0, 30)}..."`,
          text: `I've analyzed your request regarding: "${userText}". ConnectX AI has automatically organized the relevant context, initiated the agentic workflow, and verified the solution with 99.8% confidence.`,
          actions: ["Workflow Triggered", "Data Verified", "Automated Task Complete"]
        }
      ]);
      setIsTyping(false);
    }, 600);
  };

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTyping]);

  return (
    <div className="home-container">
      {/* Top Capsule Floating Navbar */}
      <Navbar />

      {/* Background Ambient Glows */}
      <div className="glow-sphere glow-sphere-top" />
      <div className="glow-sphere glow-sphere-center" />

      {/* Hero Section matching screenshot */}
      <section className="hero-section">
        {/* Announcement Pill Badge */}
        <div className="announcement-pill-wrapper">
          <a href="#features" className="announcement-pill">
            <span>Explore how we help grow brands.</span>
            <span className="pill-action">Read more &rarr;</span>
          </a>
        </div>

        {/* Hero Title */}
        <h1 className="hero-title">
          Solutions to Elevate Your<br />
          Business Growth
        </h1>

        {/* Hero Subtitle */}
        <p className="hero-subtitle">
          Unlock potential with tailored strategies designed for success. Simplify challenges,
          maximize results, and stay ahead in the competitive market.
        </p>

        {/* Dual Call-to-Action Buttons */}
        <div className="hero-actions">
          <Link to="/register" className="btn-hero-primary">
            Get Started
          </Link>
          <a href="#ai-chatbot" className="btn-hero-secondary">
            Learn More <span className="btn-arrow">&rsaquo;</span>
          </a>
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

        <div className="footer-bottom">
          <p>© 2026 ConnectX AI Technologies Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;