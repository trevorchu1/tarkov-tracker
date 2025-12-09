import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

export default function Home(){
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Escape From Tarkov<br />
            <span className="hero-highlight">Market Tracker</span>
          </h1>
          <p className="hero-description">
            Track prices, compare traders, and optimize your trading strategy.
            Never overpay for items again.
          </p>
          <div className="hero-buttons">
            <Link to="/search" className="hero-button primary">
              Start Searching
            </Link>
            <Link to="/watchlist" className="hero-button secondary">
              View Watchlist
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="features-section">
        <h2 className="features-title">Everything You Need to Trade Smart</h2>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3 className="feature-title">Market Search</h3>
            <p className="feature-description">
              Search thousands of items and instantly compare prices across all traders and the flea market.
            </p>
            <Link to="/search" className="feature-link">
              Try Search →
            </Link>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3 className="feature-title">Watchlist</h3>
            <p className="feature-description">
              Save items with custom notes, priorities, target prices, and quantity tracking.
            </p>
            <Link to="/watchlist" className="feature-link">
              Go to Watchlist →
            </Link>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3 className="feature-title">Trader Comparison</h3>
            <p className="feature-description">
              Compare offers from Prapor, Therapist, Fence, and all other traders in one place.
            </p>
            <Link to="/traders" className="feature-link">
              View Traders →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2 className="cta-title">Ready to Start Trading?</h2>
        <p className="cta-description">
          Join now to track your favorite items and never miss a good deal.
        </p>
        <Link to="/login" className="cta-button">
          Create Free Account
        </Link>
      </section>
    </div>
  );
}
