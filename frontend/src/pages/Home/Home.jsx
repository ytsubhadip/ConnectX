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

      {/* Interactive AI Chatbot Showcase Section */}
      <section id="ai-chatbot" className="chatbot-showcase-section">
        <div className="section-header">
          <div className="section-badge">Next-Gen Conversational Intelligence</div>
          <h2 className="section-title">Experience the ConnectX AI Chatbot</h2>
          <p className="section-subtitle">
            Not just canned responses. ConnectX AI reasons, accesses deep real-time knowledge,
            and executes multi-step workflows for your business.
          </p>
        </div>

        {/* Interactive Chatbot Mockup Window */}
        <div className="chatbot-window">
          {/* Window Header */}
          <div className="chat-window-topbar">
            <div className="window-dots">
              <span className="dot dot-red" />
              <span className="dot dot-yellow" />
              <span className="dot dot-green" />
            </div>

            <div className="bot-status-pill">
              <span className="pulse-indicator" />
              <span className="status-title">ConnectX AI 4.5 Turbo</span>
              <span className="status-tag">⚡ 160ms</span>
            </div>

            <div className="topbar-actions">
              <span className="context-chip">128k Context</span>
            </div>
          </div>

          {/* Preset Selector Tabs */}
          <div className="chat-preset-bar">
            <span className="preset-label">Preset Modes:</span>
            <button
              className={`preset-btn ${activeTab === 'support' ? 'active' : ''}`}
              onClick={() => handleSelectPreset('support')}
            >
              🎧 Customer Support
            </button>
            <button
              className={`preset-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => handleSelectPreset('analytics')}
            >
              📊 Data & Insights
            </button>
            <button
              className={`preset-btn ${activeTab === 'automation' ? 'active' : ''}`}
              onClick={() => handleSelectPreset('automation')}
            >
              ⚡ Autonomous Workflow
            </button>
            <button
              className={`preset-btn ${activeTab === 'rag' ? 'active' : ''}`}
              onClick={() => handleSelectPreset('rag')}
            >
              📚 Knowledge Base Q&A
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="chat-messages-container">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`chat-bubble-row ${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="bot-avatar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="4" r="2.8" />
                      <circle cx="12" cy="20" r="2.8" />
                      <circle cx="4" cy="12" r="2.8" />
                      <circle cx="20" cy="12" r="2.8" />
                    </svg>
                  </div>
                )}

                <div className={`chat-bubble ${msg.role}`}>
                  {msg.thought && (
                    <div className="thought-box">
                      <span className="thought-icon">🧠</span>
                      <span className="thought-text">{msg.thought}</span>
                    </div>
                  )}

                  <div className="bubble-text">
                    {msg.text.split('\n\n').map((para, pIdx) => (
                      <p key={pIdx}>{para}</p>
                    ))}
                  </div>

                  {msg.actions && msg.actions.length > 0 && (
                    <div className="bubble-actions">
                      {msg.actions.map((act, aIdx) => (
                        <span key={aIdx} className="action-pill">
                          ✓ {act}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="chat-bubble-row assistant">
                <div className="bot-avatar">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="4" r="2.8" />
                    <circle cx="12" cy="20" r="2.8" />
                    <circle cx="4" cy="12" r="2.8" />
                    <circle cx="20" cy="12" r="2.8" />
                  </svg>
                </div>
                <div className="chat-bubble assistant typing-bubble">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Interactive Chat Input */}
          <form className="chat-input-bar" onSubmit={handleSendMessage}>
            <input
              type="text"
              className="chat-text-input"
              placeholder="Ask ConnectX AI anything or test your own prompt..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
            <button type="submit" className="chat-send-btn" disabled={!userInput.trim() || isTyping}>
              <span>Send</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>
        </div>
      </section>

      {/* AI Features Grid */}
      <section id="features" className="features-section">
        <div className="section-header">
          <div className="section-badge">Core AI Capabilities</div>
          <h2 className="section-title">Built for Scalable Intelligence</h2>
          <p className="section-subtitle">
            Everything your team needs to deploy, manage, and scale conversational AI assistants.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3>Contextual Multi-Turn Memory</h3>
            <p>
              ConnectX remembers user preferences, historical interactions, and brand guidelines across sessions with zero hallucination.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <h3>Knowledge Base Ingestion (RAG)</h3>
            <p>
              Sync PDFs, Notion docs, Zendesk tickets, or live database endpoints. Your AI bot speaks with your organization's exact knowledge.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h3>Autonomous Tool Calling</h3>
            <p>
              Trigger API webhooks, schedule calendars, query CRMs, and perform live database mutations directly from natural conversational commands.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3>Enterprise Privacy & Isolation</h3>
            <p>
              SOC-2 compliant infrastructure. Your customer conversations and proprietary data are never used to train public LLM models.
            </p>
          </div>
        </div>
      </section>

      {/* Trust & Metrics Strip */}
      <section className="metrics-strip">
        <div className="metric-item">
          <div className="metric-number">99.4%</div>
          <div className="metric-label">Resolution Accuracy</div>
        </div>
        <div className="metric-item">
          <div className="metric-number">&lt; 180ms</div>
          <div className="metric-label">Ultra-Low Latency</div>
        </div>
        <div className="metric-item">
          <div className="metric-number">12M+</div>
          <div className="metric-label">Monthly AI Interactions</div>
        </div>
        <div className="metric-item">
          <div className="metric-number">99.99%</div>
          <div className="metric-label">Enterprise Uptime SLA</div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="cta-banner-section">
        <div className="cta-banner-content">
          <h2>Ready to transform your workflow with ConnectX AI?</h2>
          <p>Deploy your custom intelligent chatbot in under 5 minutes.</p>
          <div className="cta-banner-actions">
            <Link to="/register" className="btn-hero-primary">
              Get Started for Free
            </Link>
            <Link to="/login" className="btn-hero-secondary">
              Talk to Sales &rsaquo;
            </Link>
          </div>
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