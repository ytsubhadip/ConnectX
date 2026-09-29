import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import API from "../../service/API";
import "./Dashboard.css";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [documentCount, setDocumentCount] = useState(0);

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (err) {
      console.error("Error reading user data", err);
    }
  }, []);

  const userId = user?.id;
  const userName = user?.name || "User";
  const userEmail = user?.email || "";

  useEffect(() => {
    if (!userId) return;

    // Fetch wallet balance
    API.get("/api/subscription/wallet")
      .then((res) => {
        if (res.data?.wallet_ballance !== undefined) {
          setBalance(res.data.wallet_ballance);
        }
      })
      .catch((err) => console.log("Failed to load wallet balance:", err));

    // Fetch documents count
    API.get("/api/document/")
      .then((res) => {
        if (res.data?.documents) {
          setDocumentCount(res.data.documents.length);
        }
      })
      .catch((err) => console.log("Failed to load documents:", err));
  }, [userId]);

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-container">
        {/* Welcome Section */}
        <header className="dashboard-welcome">
          <div className="welcome-text">
            <h1>
              Welcome back, <span className="highlight-name">{userName}</span>
            </h1>
            <p>
              Here is a quick overview of your workspace and all available tools.
            </p>
          </div>
          {userEmail && (
            <div className="user-email-chip">
              <span className="status-dot"></span>
              {userEmail}
            </div>
          )}
        </header>

        {/* Quick Stats Grid */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon wallet-stat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M7 15h0M2 10h20" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Wallet Balance</span>
              <strong className="stat-value">
                {balance} <span className="stat-unit">Credits</span>
              </strong>
            </div>
            <Link to="/subscription" className="stat-quick-link">
              + Top up
            </Link>
          </div>



          <div className="stat-card">
            <div className="stat-icon doc-stat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Saved Documents</span>
              <strong className="stat-value">
                {documentCount} <span className="stat-unit">PDFs</span>
              </strong>
            </div>
            <Link to="/document" className="stat-quick-link">
              + Upload
            </Link>
          </div>

          <div className="stat-card">
            <div className="stat-icon profile-stat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Account Status</span>
              <strong className="stat-value">Active</strong>
            </div>
            <Link to="/profile" className="stat-quick-link">
              View
            </Link>
          </div>
        </section>

        {/* All Available User Pages & Sections */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Explore ConnectX</h2>
            <p>Choose a feature to get started.</p>
          </div>

          <div className="features-grid">
            {/* 1. Document Chat */}
            <Link to="/document" className="feature-card">
              <div className="feature-icon doc-bg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>
              <div className="feature-body">
                <h3>My Documents & Chat</h3>
                <p>Upload PDF documents, view pages, and chat interactively with AI about your files.</p>
              </div>
              <div className="feature-footer">
                <span>Go to Documents</span>
                <span className="arrow">&rarr;</span>
              </div>
            </Link>

            {/* connect with friend */}

            <Link to="/connections" className="feature-card">
              <div className="feature-icon wallet-bg">
                👥
              </div>
              <div className="feature-body">
                <h3>Connect People</h3>
                <p>Discover people, send connection requests,
            and manage your connections.</p>
              </div>
              <div className="feature-footer">
                <span>Manage Connections</span>
                <span className="arrow">&rarr;</span>
              </div>
            </Link>

            {/* 3. Wallet History */}
            <Link to="/wallet" className="feature-card">
              <div className="feature-icon wallet-bg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M7 15h0M2 10h20" />
                </svg>
              </div>
              <div className="feature-body">
                <h3>Wallet History</h3>
                <p>View your complete credit transaction history, purchases, and deduction records.</p>
              </div>
              <div className="feature-footer">
                <span>View Transactions</span>
                <span className="arrow">&rarr;</span>
              </div>
            </Link>


          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;