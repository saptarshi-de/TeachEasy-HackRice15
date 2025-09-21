import React, { useState } from 'react';
import axios from 'axios';
import './ApplicationConfirmationModal.css';

const ApplicationConfirmationModal = ({ 
  isOpen, 
  onClose, 
  scholarship, 
  onApplicationSubmitted,
  userId 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !scholarship) return null;

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      const actualUserId = userId || 'anonymous';
      console.log('Submitting application with userId:', actualUserId, 'scholarshipId:', scholarship._id);
      const response = await axios.post('/api/applications', {
        userId: actualUserId,
        scholarshipId: scholarship._id,
        notes: notes.trim()
      });

      if (response.data.success) {
        // Mark as applied in localStorage
        localStorage.setItem(`applied_${scholarship._id}`, 'true');
        
        onApplicationSubmitted(response.data.application);
        onClose();
        setNotes('');
      } else {
        setError(response.data.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setError(error.response?.data?.error || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setNotes('');
      setError('');
    }
  };

  const handleDidNotApply = () => {
    // Mark that they clicked apply but didn't actually apply
    localStorage.setItem(`clicked_apply_${scholarship._id}`, 'false');
    onClose();
    setNotes('');
    setError('');
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Confirm Application</h2>
          <button 
            className="close-btn" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="scholarship-preview">
            <h3>{scholarship.title}</h3>
            <p className="organization">{scholarship.organization}</p>
            <div className="amount">
              {scholarship.amount?.display || `$${scholarship.amount?.min?.toLocaleString()} - $${scholarship.amount?.max?.toLocaleString()}`}
            </div>
          </div>

          <div className="confirmation-message">
            <p>Did you apply to this scholarship opportunity?</p>
            <p className="sub-text">
              If yes, we'll add it to your "My Applications" section for tracking.
            </p>
          </div>

          <div className="notes-section">
            <label htmlFor="notes">Add notes (optional):</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about your application..."
              rows="3"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button 
            className="btn-cancel" 
            onClick={handleDidNotApply}
            disabled={isSubmitting}
          >
            No, I didn't apply
          </button>
          <button 
            className="btn-confirm" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Yes, I Applied'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationConfirmationModal;
