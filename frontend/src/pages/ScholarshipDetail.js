import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

const ScholarshipDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);

  // Fetch scholarship details
  const fetchScholarship = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/scholarships/${id}`);
      setScholarship(response.data);
    } catch (err) {
      setError('Failed to load scholarship details. Please try again.');
      console.error('Error fetching scholarship:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check if scholarship is bookmarked
  const checkBookmarkStatus = async () => {
    if (!isAuthenticated) return;
    
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get(`/api/users/${user.sub}/bookmarks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const isBooked = response.data.some(item => item._id === id);
      setIsBookmarked(isBooked);
    } catch (err) {
      console.error('Error checking bookmark status:', err);
    }
  };

  // Toggle bookmark
  const toggleBookmark = async () => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    try {
      setBookmarking(true);
      const token = await getAccessTokenSilently();
      
      if (isBookmarked) {
        await axios.delete(`/api/scholarships/${id}/bookmark`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { auth0Id: user.sub }
        });
        setIsBookmarked(false);
      } else {
        await axios.post(`/api/scholarships/${id}/bookmark`, 
          { auth0Id: user.sub },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    } finally {
      setBookmarking(false);
    }
  };

  // Add to view history
  const addToHistory = async () => {
    if (!isAuthenticated) return;
    
    try {
      const token = await getAccessTokenSilently();
      await axios.post(`/api/users/${user.sub}/history`, 
        { scholarshipId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Error adding to history:', err);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchScholarship();
    checkBookmarkStatus();
  }, [id]);

  // Add to history when scholarship loads
  useEffect(() => {
    if (scholarship && isAuthenticated) {
      addToHistory();
    }
  }, [scholarship, isAuthenticated]);

  const formatAmount = (min, max) => {
    if (min === max) {
      return `$${min.toLocaleString()}`;
    }
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  const formatDeadline = (deadline) => {
    const date = new Date(deadline);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    if (status.includes('Expired')) return '#F44336';
    if (status.includes('Deadline Approaching')) return '#FF5722';
    if (status.includes('Apply Soon')) return '#FF9800';
    if (status.includes('Open')) return '#4CAF50';
    return '#9E9E9E';
  };

  const getStatusInfo = (scholarship) => {
    if (scholarship.status) {
      return {
        text: scholarship.status,
        class: 'text-white',
        style: { backgroundColor: getStatusColor(scholarship.status) },
        daysLeft: scholarship.daysUntilDeadline
      };
    }
    
    // Fallback to old calculation if no status field
    const date = new Date(scholarship.application.deadline);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Expired', class: 'text-red-600', style: {} };
    if (diffDays === 0) return { text: 'Due today', class: 'text-red-600', style: {} };
    if (diffDays === 1) return { text: 'Due tomorrow', class: 'text-red-600', style: {} };
    if (diffDays <= 7) return { text: `Due in ${diffDays} days`, class: 'text-yellow-600', style: {} };
    return { text: `Due in ${diffDays} days`, class: 'text-green-600', style: {} };
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="mt-4 text-gray-600">Loading scholarship details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !scholarship) {
    return (
      <div className="p-6">
        <div className="container">
          <div className="empty-container">
            <h3>Scholarship Not Found</h3>
            <p>{error || 'The scholarship you\'re looking for doesn\'t exist or has been removed.'}</p>
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(scholarship);

  return (
    <div className="p-6">
      <div className="container">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-secondary mb-6"
        >
          ← Back to Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{scholarship.title}</h1>
                    <p className="text-lg text-gray-600">
                      {scholarship.organization}
                      {scholarship.source && (
                        <span className="text-sm text-gray-500 ml-2">• {scholarship.source}</span>
                      )}
                    </p>
                    {scholarship.matchLevel && (
                      <div className="mt-2">
                        <span 
                          className="px-2 py-1 rounded text-xs font-medium text-white"
                          style={{
                            backgroundColor: scholarship.matchLevel === 'High' ? '#4CAF50' :
                                           scholarship.matchLevel === 'Medium' ? '#FF9800' :
                                           scholarship.matchLevel === 'Low' ? '#FFC107' : '#9E9E9E'
                          }}
                        >
                          {scholarship.matchLevel} Match
                        </span>
                        {scholarship.overallScore && (
                          <span className="ml-2 text-xs text-gray-600">
                            Score: {(scholarship.overallScore * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {scholarship.amount.display || formatAmount(scholarship.amount.min, scholarship.amount.max)}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span 
                        className="px-2 py-1 rounded text-xs font-medium text-white"
                        style={statusInfo.style}
                      >
                        {statusInfo.text}
                      </span>
                      {statusInfo.daysLeft && (
                        <span className="text-xs text-gray-600">
                          {statusInfo.daysLeft} days left
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {scholarship.tags && scholarship.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {scholarship.tags.map((tag, index) => (
                      <span key={index} className="badge badge-primary">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="card-body">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Description</h2>
                  <p className="text-gray-700 leading-relaxed">{scholarship.description}</p>
                </div>

                {scholarship.eligibility.requirements && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-3">Requirements</h2>
                    <p className="text-gray-700 leading-relaxed">{scholarship.eligibility.requirements}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Eligibility */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Eligibility</h3>
                    <div className="space-y-2">
                      {scholarship.eligibility.gradeLevels && scholarship.eligibility.gradeLevels.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-600">Grade Levels:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {scholarship.eligibility.gradeLevels.map((grade, index) => (
                              <span key={index} className="badge badge-primary">{grade}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {scholarship.eligibility.subjects && scholarship.eligibility.subjects.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-600">Subjects:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {scholarship.eligibility.subjects.map((subject, index) => (
                              <span key={index} className="badge badge-primary">{subject}</span>
                            ))}
                          </div>
                        </div>
                      )}


                      {scholarship.eligibility.fundingTypes && scholarship.eligibility.fundingTypes.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-600">Funding Types:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {scholarship.eligibility.fundingTypes.map((type, index) => (
                              <span key={index} className="badge badge-primary">{type}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Application Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Application Details</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-gray-600">Deadline:</span>
                        <span className="ml-2">{formatDeadline(scholarship.application.deadline)}</span>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-600">Application Method:</span>
                        <span className="ml-2">{scholarship.application.applicationMethod}</span>
                      </div>

                      {scholarship.application.documentsRequired && scholarship.application.documentsRequired.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-600">Required Documents:</span>
                          <ul className="list-disc list-inside mt-1 text-sm text-gray-700">
                            {scholarship.application.documentsRequired.map((doc, index) => (
                              <li key={index}>{doc}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <div className="flex justify-between items-center">
                  <button
                    onClick={toggleBookmark}
                    disabled={bookmarking}
                    className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
                  >
                    {bookmarking ? (
                      <div className="spinner"></div>
                    ) : (
                      <span>{isBookmarked ? '★' : '☆'}</span>
                    )}
                    {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </button>

                  {scholarship.application && scholarship.application.applicationUrl && (
                    <a
                      href={scholarship.application.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-lg apply-now-btn"
                    >
                      Apply Now
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            {(scholarship.contact.email || scholarship.contact.phone) && (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                </div>
                <div className="card-body">
                  {scholarship.contact.email && (
                    <div className="mb-2">
                      <span className="font-medium text-gray-600">Email:</span>
                      <a 
                        href={`mailto:${scholarship.contact.email}`}
                        className="ml-2 text-blue-600 hover:underline"
                      >
                        {scholarship.contact.email}
                      </a>
                    </div>
                  )}
                  {scholarship.contact.phone && (
                    <div>
                      <span className="font-medium text-gray-600">Phone:</span>
                      <a 
                        href={`tel:${scholarship.contact.phone}`}
                        className="ml-2 text-blue-600 hover:underline"
                      >
                        {scholarship.contact.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Organization Website */}
            {scholarship.website && (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold">Organization</h3>
                </div>
                <div className="card-body">
                  <a
                    href={scholarship.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline w-full"
                  >
                    Visit Website
                  </a>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold">Quick Stats</h3>
              </div>
              <div className="card-body">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Views:</span>
                    <span>{scholarship.viewCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bookmarks:</span>
                    <span>{scholarship.bookmarkCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Difficulty:</span>
                    <span className="capitalize">{scholarship.difficulty || 'Medium'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipDetail;
