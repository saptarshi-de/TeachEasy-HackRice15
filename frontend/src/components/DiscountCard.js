import React from 'react';
import './DiscountCard.css';

const DiscountCard = ({ discount }) => {
  const getDiscountTypeColor = (type) => {
    switch (type) {
      case 'Percentage':
        return '#28a745';
      case 'Fixed Amount':
        return '#17a2b8';
      case 'Free Shipping':
        return '#D2B48C';
      case 'Buy One Get One':
        return '#fd7e14';
      case 'Special Offer':
        return '#dc3545';
      case 'Membership Benefit':
        return '#6c757d';
      default:
        return '#6c757d';
    }
  };

  const getCategoryIcon = (category) => {
    return '';
  };


  const handleVisitWebsite = () => {
    window.open(discount.website, '_blank', 'noopener,noreferrer');
  };

  const handleCopyPromoCode = () => {
    if (discount.promoCode) {
      navigator.clipboard.writeText(discount.promoCode);
      // You could add a toast notification here
      alert(`Promo code "${discount.promoCode}" copied to clipboard!`);
    }
  };

  return (
    <div className="discount-card">
      {/* Header with company and category */}
      <div className="discount-header">
        <div className="discount-company">
          <span className="category-icon">{getCategoryIcon(discount.category)}</span>
          <span className="company-name">{discount.company}</span>
        </div>
        <div className="discount-source">
          <span className="source-badge">{discount.source}</span>
        </div>
      </div>

      {/* Discount title and description */}
      <div className="discount-content">
        <h3 className="discount-title">{discount.title}</h3>
        <p className="discount-description">{discount.description}</p>
      </div>

      {/* Discount value and type */}
      <div className="discount-value-section">
        <div 
          className="discount-value"
          style={{ backgroundColor: getDiscountTypeColor(discount.discountType) }}
        >
          {discount.discountValue}
        </div>
        <div className="discount-type">{discount.discountType}</div>
      </div>

      {/* Requirements */}
      {discount.requirements && (
        <div className="discount-requirements">
          {discount.requirements.teacherId && (
            <span className="requirement-badge teacher-id">Teacher ID Required</span>
          )}
          {discount.requirements.membership !== 'None' && (
            <span className="requirement-badge membership">
              {discount.requirements.membership} Membership
            </span>
          )}
          {discount.requirements.minimumSpend && (
            <span className="requirement-badge minimum-spend">
              Min. ${discount.requirements.minimumSpend}
            </span>
          )}
        </div>
      )}

      {/* Promo code */}
      {discount.promoCode && (
        <div className="promo-code-section">
          <div className="promo-code-label">Promo Code:</div>
          <div className="promo-code-container">
            <span className="promo-code">{discount.promoCode}</span>
            <button 
              className="copy-code-btn"
              onClick={handleCopyPromoCode}
              title="Copy promo code"
            >
              Copy
            </button>
          </div>
        </div>
      )}


      {/* Action buttons */}
      <div className="discount-actions">
        <button 
          className="visit-website-btn"
          onClick={handleVisitWebsite}
        >
          Visit Website
        </button>
      </div>

      {/* Tags */}
      {discount.tags && discount.tags.length > 0 && (
        <div className="discount-tags">
          {discount.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="discount-tag">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiscountCard;
