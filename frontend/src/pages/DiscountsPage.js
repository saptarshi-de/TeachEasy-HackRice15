import React, { useState, useEffect } from 'react';
import DiscountCard from '../components/DiscountCard';
import DiscountFilter from '../components/DiscountFilter';
import './DiscountsPage.css';

const DiscountsPage = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [filters, setFilters] = useState({
    category: '',
    company: '',
    source: '',
    status: 'Active',
    featured: '',
    search: ''
  });

  useEffect(() => {
    fetchDiscounts();
  }, [pagination.currentPage]);

  const fetchDiscounts = async (newFilters = filters, page = 1) => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...newFilters
      });

      // Remove empty parameters
      Object.keys(params).forEach(key => {
        if (!params.get(key)) {
          params.delete(key);
        }
      });

      const response = await fetch(`/api/discounts?${params}`);
      const data = await response.json();

      if (data.success) {
        setDiscounts(data.discounts);
        setPagination(data.pagination);
      } else {
        setError(data.message || 'Failed to fetch discounts');
      }
    } catch (err) {
      setError('Failed to fetch discounts. Please try again.');
      console.error('Error fetching discounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchDiscounts(newFilters, 1);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    fetchDiscounts(filters, newPage);
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const { currentPage, totalPages } = pagination;

    // Previous button
    pages.push(
      <button
        key="prev"
        className={`page-btn ${!pagination.hasPrevPage ? 'disabled' : ''}`}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={!pagination.hasPrevPage}
      >
        ← Previous
      </button>
    );

    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          className="page-btn"
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className="ellipsis">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`page-btn ${i === currentPage ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis2" className="ellipsis">...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          className="page-btn"
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        className={`page-btn ${!pagination.hasNextPage ? 'disabled' : ''}`}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={!pagination.hasNextPage}
      >
        Next →
      </button>
    );

    return <div className="pagination">{pages}</div>;
  };

  if (error) {
    return (
      <div className="discounts-page">
        <div className="error-message">
          <h2>⚠️ Error Loading Discounts</h2>
          <p>{error}</p>
          <button 
            className="retry-btn"
            onClick={() => fetchDiscounts()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="discounts-page">
      <div className="discounts-header">
        <h1>Teacher Discounts & Savings</h1>
        <p className="discounts-subtitle">
          Discover exclusive discounts and deals available to educators
        </p>
      </div>

      <DiscountFilter 
        onFilterChange={handleFilterChange}
        loading={loading}
      />

      <div className="discounts-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading discounts...</p>
          </div>
        ) : (
          <>
            <div className="discounts-stats">
              <div className="stat-item">
                <span className="stat-number">{pagination.totalItems}</span>
                <span className="stat-label">Discounts Found</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{pagination.currentPage}</span>
                <span className="stat-label">Page {pagination.currentPage} of {pagination.totalPages}</span>
              </div>
            </div>

            {discounts.length > 0 ? (
              <>
                <div className="discounts-grid">
                  {discounts.map((discount) => (
                    <DiscountCard 
                      key={discount._id} 
                      discount={discount} 
                    />
                  ))}
                </div>

                {renderPagination()}
              </>
            ) : (
              <div className="no-discounts">
                <div className="no-discounts-icon">🔍</div>
                <h3>No discounts found</h3>
                <p>Try adjusting your filters to see more results.</p>
                <button 
                  className="clear-filters-btn"
                  onClick={() => handleFilterChange({
                    category: '',
                    company: '',
                    source: '',
                    status: 'Active',
                    featured: '',
                    search: ''
                  })}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DiscountsPage;
