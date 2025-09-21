import React, { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import ScholarshipCard from '../components/ScholarshipCard';
import FilterSidebar from '../components/FilterSidebar';

const Dashboard = () => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [filters, setFilters] = useState({
    minAmount: '',
    maxAmount: '',
    gradeLevels: [],
    subjects: [],
    fundingTypes: []
  });

  // Fetch scholarships with filtering and pagination
  const fetchScholarships = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        sortBy,
        sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(filters.minAmount && { minAmount: filters.minAmount }),
        ...(filters.maxAmount && { maxAmount: filters.maxAmount }),
        ...(filters.gradeLevels.length > 0 && { gradeLevels: filters.gradeLevels.join(',') }),
        ...(filters.subjects.length > 0 && { subjects: filters.subjects.join(',') }),
        ...(filters.fundingTypes.length > 0 && { fundingTypes: filters.fundingTypes.join(',') })
      });

      console.log('Fetching scholarships with params:', params.toString());
      const response = await axios.get(`/api/scholarships?${params}`);
      console.log('Scholarships API Response:', response.data);
      
      // Handle the response safely
      if (response.data && response.data.scholarships) {
        setScholarships(response.data.scholarships);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalItems(response.data.pagination?.totalItems || 0);
      } else {
        console.error('Unexpected API response format:', response.data);
        setScholarships([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (err) {
      setError('Failed to fetch scholarships. Please try again.');
      console.error('Error fetching scholarships:', err);
      console.error('Error response:', err.response?.data);
      setScholarships([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortBy, sortOrder, searchTerm, filters]);

  // Fetch user's bookmarks
  const fetchBookmarks = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get(`/api/users/${user.sub}/bookmarks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Bookmarks API Response:', response.data);
      
      // Handle the response safely
      if (Array.isArray(response.data)) {
        const bookmarkIds = new Set(response.data.map(scholarship => scholarship._id));
        setBookmarkedIds(bookmarkIds);
      } else {
        console.error('Unexpected bookmarks response format:', response.data);
        setBookmarkedIds(new Set());
      }
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      console.error('Error response:', err.response?.data);
      setBookmarkedIds(new Set());
    }
  }, [isAuthenticated, getAccessTokenSilently, user?.sub]);

  // Handle bookmark toggle
  const handleBookmark = async (scholarshipId) => {
    if (!isAuthenticated) return;
    
    try {
      const token = await getAccessTokenSilently();
      const isBookmarked = bookmarkedIds.has(scholarshipId);
      
      if (isBookmarked) {
        await axios.delete(`/api/users/${user.sub}/bookmarks/${scholarshipId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`/api/users/${user.sub}/bookmarks/${scholarshipId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      // Update local state
      const newBookmarkedIds = new Set(bookmarkedIds);
      if (isBookmarked) {
        newBookmarkedIds.delete(scholarshipId);
      } else {
        newBookmarkedIds.add(scholarshipId);
      }
      setBookmarkedIds(newBookmarkedIds);
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when search changes
  };

  // Handle sort
  const handleSort = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1); // Reset to first page when sort changes
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load data on component mount and when dependencies change
  useEffect(() => {
    fetchScholarships();
    fetchBookmarks();
  }, [fetchScholarships, fetchBookmarks]);

  // Show loading state
  if (loading && scholarships.length === 0) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading scholarships...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>🎓 Scholarship Dashboard</h1>
        <p>Discover and apply for educational opportunities</p>
      </div>

      <div className="dashboard-content">
        <FilterSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          onSort={handleSort}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />

        <div className="scholarships-section">
          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={fetchScholarships} className="retry-btn">
                Try Again
              </button>
            </div>
          )}

          <div className="results-header">
            <h2>
              {totalItems > 0 ? `${totalItems} scholarships found` : 'No scholarships found'}
            </h2>
            {searchTerm && (
              <p className="search-term">Search results for: "{searchTerm}"</p>
            )}
          </div>

          {scholarships.length > 0 ? (
            <>
              <div className="scholarships-grid">
                {scholarships.map((scholarship) => (
                  <ScholarshipCard
                    key={scholarship._id}
                    scholarship={scholarship}
                    isBookmarked={bookmarkedIds.has(scholarship._id)}
                    onBookmark={handleBookmark}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    Previous
                  </button>
                  
                  <div className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            !loading && (
              <div className="no-results">
                <h3>No scholarships found</h3>
                <p>Try adjusting your search criteria or filters</p>
                <button onClick={() => {
                  setSearchTerm('');
                  setFilters({
                    minAmount: '',
                    maxAmount: '',
                    gradeLevels: [],
                    subjects: [],
                    fundingTypes: []
                  });
                  setCurrentPage(1);
                }} className="clear-filters-btn">
                  Clear All Filters
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
