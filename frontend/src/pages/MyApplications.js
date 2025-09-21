import React, { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import './MyApplications.css';

const MyApplications = () => {
  const { user, isAuthenticated } = useAuth0();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    underReview: 0,
    approved: 0,
    rejected: 0
  });

  const userId = user?.sub || user?.email || 'anonymous';
  
  // Debug logging
  console.log('MyApplications - user:', user);
  console.log('MyApplications - userId:', userId);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching applications for userId:', userId);
      const response = await axios.get(`/api/applications/user/${userId}?status=${filter === 'all' ? '' : filter}`);
      console.log('Applications response:', response.data);
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError(`Failed to load applications: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  }, [userId, filter]);

  const fetchStats = useCallback(async () => {
    try {
      console.log('Fetching stats for userId:', userId);
      const response = await axios.get(`/api/applications/stats/${userId}`);
      console.log('Stats response:', response.data);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [userId]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchApplications();
      fetchStats();
    }
  }, [isAuthenticated, userId, fetchApplications, fetchStats]);

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await axios.put(`/api/applications/${applicationId}`, { status: newStatus });
      fetchApplications();
      fetchStats();
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update application status');
    }
  };

  const handleDeleteApplication = async (applicationId) => {
    if (window.confirm('Are you sure you want to remove this application?')) {
      try {
        await axios.delete(`/api/applications/${applicationId}`);
        fetchApplications();
        fetchStats();
      } catch (error) {
        console.error('Error deleting application:', error);
        setError('Failed to delete application');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Under Review': return '#3b82f6';
      case 'Approved': return '#10b981';
      case 'Rejected': return '#ef4444';
      case 'Pending Documents': return '#f59e0b';
      case 'Submitted': return '#D2B48C';
      default: return '#6b7280';
    }
  };

  const getDeadlineStatus = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Expired', color: '#ef4444' };
    if (diffDays === 0) return { text: 'Due Today', color: '#f59e0b' };
    if (diffDays <= 7) return { text: `${diffDays} days left`, color: '#f59e0b' };
    return { text: `${diffDays} days left`, color: '#10b981' };
  };

  if (!isAuthenticated) {
    return (
      <div className="my-applications-container">
        <div className="auth-required">
          <h2>My Applications</h2>
          <p>Please sign in to view your applications.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="my-applications-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-applications-container">
      <div className="applications-header">
        <h1>My Applications</h1>
        <p>Track your scholarship applications and their status</p>
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Applications</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.underReview}</div>
          <div className="stat-label">Under Review</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.approved}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.rejected}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All ({stats.total})
          </button>
          <button 
            className={filter === 'Under Review' ? 'active' : ''}
            onClick={() => setFilter('Under Review')}
          >
            Under Review ({stats.underReview})
          </button>
          <button 
            className={filter === 'Approved' ? 'active' : ''}
            onClick={() => setFilter('Approved')}
          >
            Approved ({stats.approved})
          </button>
          <button 
            className={filter === 'Rejected' ? 'active' : ''}
            onClick={() => setFilter('Rejected')}
          >
            Rejected ({stats.rejected})
          </button>
        </div>
      </div>

      <div className="applications-list">
        {applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">No Applications</div>
            <h3>No applications yet</h3>
            <p>Start applying to scholarships to track your progress here.</p>
            <a href="/" className="btn btn-primary">Browse Scholarships</a>
          </div>
        ) : (
          applications.map((application) => {
            const deadlineStatus = getDeadlineStatus(application.deadline);
            return (
              <div key={application._id} className="application-card">
                <div className="application-header">
                  <h3 className="application-title">{application.scholarshipTitle}</h3>
                  <div className="application-actions">
                    <select
                      value={application.status}
                      onChange={(e) => handleStatusUpdate(application._id, e.target.value)}
                      className="status-select"
                      style={{ borderColor: getStatusColor(application.status) }}
                    >
                      <option value="Under Review">Under Review</option>
                      <option value="Submitted">Submitted</option>
                      <option value="Pending Documents">Pending Documents</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                    <button
                      onClick={() => handleDeleteApplication(application._id)}
                      className="delete-btn"
                      title="Remove application"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="application-details">
                  <div className="detail-row">
                    <span className="detail-label">Organization:</span>
                    <span className="detail-value">{application.organization}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Amount:</span>
                    <span className="detail-value">{application.amount.display}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Applied:</span>
                    <span className="detail-value">{formatDate(application.appliedAt)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Deadline:</span>
                    <span 
                      className="detail-value"
                      style={{ color: deadlineStatus.color }}
                    >
                      {formatDate(application.deadline)} ({deadlineStatus.text})
                    </span>
                  </div>
                </div>

                {application.notes && (
                  <div className="application-notes">
                    <strong>Notes:</strong> {application.notes}
                  </div>
                )}

                <div className="application-footer">
                  <a
                    href={application.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary btn-sm"
                  >
                    View Application
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MyApplications;
