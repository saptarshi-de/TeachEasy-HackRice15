import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DiscountCard from './DiscountCard';
import './FeaturedDiscounts.css';

const FeaturedDiscounts = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeaturedDiscounts();
  }, []);

  const fetchFeaturedDiscounts = async () => {
    try {
      const response = await fetch('/api/discounts/featured?limit=6');
      const data = await response.json();

      if (data.success) {
        setDiscounts(data.discounts);
      } else {
        setError(data.message || 'Failed to fetch featured discounts');
      }
    } catch (err) {
      setError('Failed to fetch featured discounts');
      console.error('Error fetching featured discounts:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="featured-discounts">
        <div className="featured-discounts-header">
          <h2>🎁 Teacher Discounts & Savings</h2>
          <p>Exclusive deals and discounts available to educators</p>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading discounts...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="featured-discounts">
        <div className="featured-discounts-header">
          <h2>🎁 Teacher Discounts & Savings</h2>
          <p>Exclusive deals and discounts available to educators</p>
        </div>
        <div className="error-message">
          <p>Unable to load discounts at this time.</p>
        </div>
      </section>
    );
  }

  if (discounts.length === 0) {
    return (
      <section className="featured-discounts">
        <div className="featured-discounts-header">
          <h2>🎁 Teacher Discounts & Savings</h2>
          <p>Exclusive deals and discounts available to educators</p>
        </div>
        <div className="no-discounts">
          <p>No featured discounts available at this time.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="featured-discounts">
      <div className="featured-discounts-header">
        <h2>🎁 Teacher Discounts & Savings</h2>
        <p>Exclusive deals and discounts available to educators</p>
        <Link to="/discounts" className="view-all-btn">
          View All Discounts →
        </Link>
      </div>

      <div className="featured-discounts-grid">
        {discounts.slice(0, 3).map((discount) => (
          <DiscountCard 
            key={discount._id} 
            discount={discount} 
          />
        ))}
      </div>

      {discounts.length > 3 && (
        <div className="view-more-container">
          <Link to="/discounts" className="view-more-btn">
            View {discounts.length - 3} More Discounts
          </Link>
        </div>
      )}
    </section>
  );
};

export default FeaturedDiscounts;
