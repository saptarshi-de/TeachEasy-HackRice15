import React from 'react';
import { Link } from 'react-router-dom';

const ScholarshipCard = ({ scholarship, onBookmark, isBookmarked }) => {
  const formatAmount = (min, max) => {
    if (min === max) {
      return `$${min.toLocaleString()}`;
    }
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  const formatDeadline = (deadline) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Expired';
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getDeadlineClass = (deadline) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'text-gray-500';
    if (diffDays <= 7) return 'text-red-600';
    if (diffDays <= 30) return 'text-yellow-600';
    return 'text-gray-600';
  };

  // Note: AI matching removed for project reorganization

  const getStatusColor = (status) => {
    if (status.includes('Expired')) return '#F44336';
    if (status.includes('Deadline Approaching')) return '#FF5722';
    if (status.includes('Apply Soon')) return '#FF9800';
    if (status.includes('Open')) return '#4CAF50';
    return '#9E9E9E';
  };

  return (
    <div className="scholarship-card">
      <div className="scholarship-card-header">
        <h3 className="scholarship-title">{scholarship.title}</h3>
        <p className="scholarship-organization">
          {scholarship.organization}
          {scholarship.source && (
            <span className="scholarship-source"> • {scholarship.source}</span>
          )}
        </p>
        <div className="scholarship-amount">
          {scholarship.amount.display || formatAmount(scholarship.amount.min, scholarship.amount.max)}
        </div>
        
        {/* Note: AI matching removed for project reorganization */}
        
        {/* Grant Status - Only show the calculated status */}
        {scholarship.status && (
          <div className="grant-status">
            <span 
              className="status-badge"
              style={{ backgroundColor: getStatusColor(scholarship.status) }}
            >
              {scholarship.status}
            </span>
            {scholarship.daysUntilDeadline && (
              <span className="days-until">
                {scholarship.daysUntilDeadline} days left
              </span>
            )}
          </div>
        )}
        
        {/* Deadline Info - Only show if no calculated status */}
        {!scholarship.status && scholarship.application && scholarship.application.deadline && (
          <p className={`scholarship-deadline ${getDeadlineClass(scholarship.application.deadline)}`}>
            {formatDeadline(scholarship.application.deadline)}
          </p>
        )}
      </div>
      
      <div className="scholarship-card-body">
        <p className="scholarship-description">{scholarship.description}</p>
        
        {scholarship.tags && scholarship.tags.length > 0 && (
          <div className="scholarship-tags">
            {scholarship.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="badge badge-primary">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <div className="scholarship-card-footer">
        <div className="scholarship-actions">
          <Link 
            to={`/scholarship/${scholarship._id}`}
            className="btn btn-outline-primary btn-sm"
          >
            View Details
          </Link>
          
          {scholarship.application && scholarship.application.applicationUrl && (
            <a
              href={scholarship.application.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm apply-btn"
            >
              Apply Now
            </a>
          )}
        </div>
        
        <button
          onClick={() => onBookmark(scholarship._id)}
          className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
          title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          <span>{isBookmarked ? '★' : '☆'}</span>
        </button>
      </div>
    </div>
  );
};

export default ScholarshipCard;
