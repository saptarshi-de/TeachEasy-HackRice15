import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

const ApplicationHistory = () => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch application history
  const fetchApplications = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const response = await axios.get('/api/applications/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(response.data.applications);
    } catch (err) {
      setError('Failed to load application history');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch application statistics
  const fetchStats = async () => {
    if (!isAuthenticated) return;
    
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get('/api/applications/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchApplications();
      fetchStats();
    }
  }, [isAuthenticated]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied': return 'text-blue-600 bg-blue-100';
      case 'Under Review': return 'text-yellow-600 bg-yellow-100';
      case 'Approved': return 'text-green-600 bg-green-100';
      case 'Rejected': return 'text-red-600 bg-red-100';
      case 'Withdrawn': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <div className="container">
          <div className="empty-container">
            <h3>Please log in to view your application history</h3>
            <p>You need to be logged in to track your scholarship applications.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="mt-4 text-gray-600">Loading application history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="container">
          <div className="empty-container">
            <h3>Error Loading Applications</h3>
            <p>{error}</p>
            <button onClick={fetchApplications} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="container">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Application History</h1>
          <p className="text-gray-600">Track your scholarship applications and their status</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="card-body text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total || 0}</div>
              <div className="text-sm text-gray-600">Total Applications</div>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <div className="text-2xl font-bold text-green-600">{stats.approved || 0}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.underReview || 0}</div>
              <div className="text-sm text-gray-600">Under Review</div>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatAmount(stats.totalAwarded || 0)}
              </div>
              <div className="text-sm text-gray-600">Total Awarded</div>
            </div>
          </div>
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <div className="card">
            <div className="card-body text-center">
              <h3 className="text-xl font-semibold mb-2">No Applications Yet</h3>
              <p className="text-gray-600 mb-4">
                You haven't applied for any scholarships yet. Start by browsing available opportunities!
              </p>
              <a href="/dashboard" className="btn btn-primary">
                Browse Scholarships
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div key={application._id} className="card">
                <div className="card-body">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">
                        {application.scholarshipId?.title || 'Unknown Scholarship'}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        {application.scholarshipId?.organization || 'Unknown Organization'}
                      </p>
                      {application.scholarshipId?.amount && (
                        <p className="text-sm text-gray-500">
                          Amount: {formatAmount(application.scholarshipId.amount.min)} - {formatAmount(application.scholarshipId.amount.max)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        Applied: {formatDate(application.appliedAt)}
                      </p>
                    </div>
                  </div>

                  {application.notes && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-1">Notes:</h4>
                      <p className="text-sm text-gray-600">{application.notes}</p>
                    </div>
                  )}

                  {application.documentsSubmitted && application.documentsSubmitted.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-1">Documents Submitted:</h4>
                      <div className="flex flex-wrap gap-2">
                        {application.documentsSubmitted.map((doc, index) => (
                          <span key={index} className="badge badge-primary">{doc}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {application.result && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-2">Result:</h4>
                      {application.result.amountAwarded && (
                        <p className="text-green-600 font-semibold">
                          Awarded: {formatAmount(application.result.amountAwarded)}
                        </p>
                      )}
                      {application.result.rejectionReason && (
                        <p className="text-red-600">
                          Reason: {application.result.rejectionReason}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <a
                      href={application.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                    >
                      View Application
                    </a>
                    <div className="text-sm text-gray-500">
                      {application.scholarshipId?.application?.deadline && (
                        <span>
                          Deadline: {formatDate(application.scholarshipId.application.deadline)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationHistory;
