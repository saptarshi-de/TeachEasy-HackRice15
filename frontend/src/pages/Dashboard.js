import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FilterSidebar from '../components/FilterSidebar';
import ScholarshipCard from '../components/ScholarshipCard';
import Loading from '../components/Loading';

const Dashboard = () => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('deadline');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  
  const [filters, setFilters] = useState({
    minAmount: '',
    maxAmount: '',
    gradeLevels: [],
    subjects: [],
    fundingTypes: []
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Fetch scholarships
  const fetchScholarships = async () => {
    try {
      setLoading(true);
      setError(null);

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

      const response = await axios.get(`/api/scholarships?${params}`);
      setScholarships(response.data.scholarships);
      setTotalPages(response.data.pagination.totalPages);
      setTotalItems(response.data.pagination.totalItems);
    } catch (err) {
      setError('Failed to fetch scholarships. Please try again.');
      console.error('Error fetching scholarships:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's bookmarks
  const fetchBookmarks = async () => {
    if (!isAuthenticated) return;
    
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get(`/api/users/${user.sub}/bookmarks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const bookmarkIds = new Set(response.data.map(scholarship => scholarship._id));
      setBookmarkedIds(bookmarkIds);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
    }
  };

  // Handle bookmark toggle
  const handleBookmark = async (scholarshipId) => {
    if (!isAuthenticated) return;

    try {
      const token = await getAccessTokenSilently();
      const isBookmarked = bookmarkedIds.has(scholarshipId);
      
      if (isBookmarked) {
        await axios.delete(`/api/scholarships/${scholarshipId}/bookmark`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { auth0Id: user.sub }
        });
        setBookmarkedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(scholarshipId);
          return newSet;
        });
      } else {
        await axios.post(`/api/scholarships/${scholarshipId}/bookmark`, 
          { auth0Id: user.sub },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBookmarkedIds(prev => new Set([...prev, scholarshipId]));
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      minAmount: '',
      maxAmount: '',
      gradeLevels: [],
      subjects: [],
      fundingTypes: []
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    const [field, order] = e.target.value.split('-');
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1);
  };

  // Load data on component mount and when dependencies change
  useEffect(() => {
    if (isAuthenticated) {
      fetchScholarships();
      fetchBookmarks();
    }
  }, [isAuthenticated, currentPage, sortBy, sortOrder, filters, searchTerm]);

  if (!isAuthenticated) {
    return <Loading />;
  }

  return (
    <div className="p-6">
      <div className="container">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Your Next Opportunity</h1>
          <p className="text-gray-600">
            Discover scholarships and grants tailored to your teaching needs.
          </p>
        </div>

        <div className="dashboard-layout">
          {/* Filter Sidebar */}
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />

          {/* Main Content */}
          <div>
            {/* Search and Sort */}
            <div className="mb-6">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search scholarships, organizations, or keywords..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="search-input"
                />
                <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <div className="results-header">
                <div className="results-count">
                  {loading ? 'Loading...' : `${totalItems} opportunities found`}
                </div>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={handleSortChange}
                  className="sort-select"
                >
                  <option value="deadline-asc">Deadline: Earliest First</option>
                  <option value="deadline-desc">Deadline: Latest First</option>
                  <option value="amount-desc">Amount: Highest First</option>
                  <option value="amount-asc">Amount: Lowest First</option>
                  <option value="popularity-desc">Most Popular</option>
                  <option value="createdAt-desc">Newest First</option>
                </select>
              </div>
            </div>

            {/* Results */}
            {loading ? (
              <Loading />
            ) : error ? (
              <div className="empty-container">
                <h3>Error Loading Opportunities</h3>
                <p>{error}</p>
                <button onClick={fetchScholarships} className="btn btn-primary">
                  Try Again
                </button>
              </div>
            ) : scholarships.length === 0 ? (
              <div className="empty-container">
                <h3>No Opportunities Found</h3>
                <p>Try adjusting your filters or search terms to find more opportunities.</p>
                <button onClick={handleClearFilters} className="btn btn-primary">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {scholarships.map(scholarship => (
                    <ScholarshipCard
                      key={scholarship._id}
                      scholarship={scholarship}
                      onBookmark={handleBookmark}
                      isBookmarked={bookmarkedIds.has(scholarship._id)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="btn btn-outline btn-sm"
                    >
                      Previous
                    </button>
                    
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="btn btn-outline btn-sm"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
