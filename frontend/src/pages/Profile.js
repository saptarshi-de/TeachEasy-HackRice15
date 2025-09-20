import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState({
    schoolName: '',
    schoolRegion: '',
    gradeLevel: [],
    subjects: [],
    fundingNeeds: [],
    resumeUrl: '',
    preferences: {
      maxAmount: 10000,
      minAmount: 0
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const response = await axios.get(`/api/users/profile/${user.sub}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        // Profile doesn't exist yet, use default values
        setProfile(prev => ({
          ...prev,
          email: user.email,
          name: user.name
        }));
      } else {
        setError('Failed to load profile. Please try again.');
        console.error('Error fetching profile:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Save profile
  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const token = await getAccessTokenSilently();
      await axios.post('/api/users/profile', {
        auth0Id: user.sub,
        email: user.email,
        name: user.name,
        ...profile
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save profile. Please try again.');
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle array field changes (checkboxes)
  const handleArrayChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  // Load profile on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <div>Please log in to view your profile.</div>;
  }

  if (loading) {
    return <div className="p-6"><div className="spinner"></div></div>;
  }

  const regions = ['North', 'South', 'East', 'West', 'Central', 'Northeast', 'Northwest', 'Southeast', 'Southwest'];
  const gradeLevels = ['Pre-K', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'College', 'Adult Education'];
  const subjects = ['Mathematics', 'Science', 'English/Language Arts', 'Social Studies', 'History', 'Art', 'Music', 'Physical Education', 'Foreign Language', 'Computer Science', 'Special Education', 'ESL/ELL', 'Reading', 'Writing'];
  const fundingNeeds = ['Classroom Supplies', 'Technology Equipment', 'Books and Materials', 'Professional Development', 'Field Trips', 'Special Programs', 'Student Support', 'Classroom Furniture', 'STEM Materials'];

  return (
    <div className="p-6">
      <div className="container">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
          <p className="text-gray-600">
            Tell us about your teaching context to get personalized recommendations.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <form onSubmit={saveProfile} className="profile-form">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                Profile saved successfully!
              </div>
            )}

            {/* Basic Information */}
            <div className="card mb-6">
              <div className="card-header">
                <h2 className="text-xl font-semibold">Basic Information</h2>
              </div>
              <div className="card-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="form-input bg-gray-50"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      value={user.name}
                      disabled
                      className="form-input bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* School Information */}
            <div className="card mb-6">
              <div className="card-header">
                <h2 className="text-xl font-semibold">School Information</h2>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">School Name *</label>
                  <input
                    type="text"
                    value={profile.schoolName}
                    onChange={(e) => handleInputChange('schoolName', e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">School Region *</label>
                  <select
                    value={profile.schoolRegion}
                    onChange={(e) => handleInputChange('schoolRegion', e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="">Select a region</option>
                    {regions.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Teaching Information */}
            <div className="card mb-6">
              <div className="card-header">
                <h2 className="text-xl font-semibold">Teaching Information</h2>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Grade Levels * (Select all that apply)</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {gradeLevels.map(grade => (
                      <label key={grade} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={profile.gradeLevel.includes(grade)}
                          onChange={() => handleArrayChange('gradeLevel', grade)}
                        />
                        <span className="text-sm">{grade}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Subjects * (Select all that apply)</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {subjects.map(subject => (
                      <label key={subject} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={profile.subjects.includes(subject)}
                          onChange={() => handleArrayChange('subjects', subject)}
                        />
                        <span className="text-sm">{subject}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Funding Needs */}
            <div className="card mb-6">
              <div className="card-header">
                <h2 className="text-xl font-semibold">Funding Needs</h2>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">What do you need funding for? * (Select all that apply)</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {fundingNeeds.map(need => (
                      <label key={need} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={profile.fundingNeeds.includes(need)}
                          onChange={() => handleArrayChange('fundingNeeds', need)}
                        />
                        <span className="text-sm">{need}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Minimum Amount ($)</label>
                    <input
                      type="number"
                      value={profile.preferences.minAmount}
                      onChange={(e) => handleInputChange('preferences', {
                        ...profile.preferences,
                        minAmount: parseFloat(e.target.value) || 0
                      })}
                      className="form-input"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Maximum Amount ($)</label>
                    <input
                      type="number"
                      value={profile.preferences.maxAmount}
                      onChange={(e) => handleInputChange('preferences', {
                        ...profile.preferences,
                        maxAmount: parseFloat(e.target.value) || 10000
                      })}
                      className="form-input"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Resume Upload */}
            <div className="card mb-6">
              <div className="card-header">
                <h2 className="text-xl font-semibold">Resume/CV (Optional)</h2>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Resume URL</label>
                  <input
                    type="url"
                    value={profile.resumeUrl}
                    onChange={(e) => handleInputChange('resumeUrl', e.target.value)}
                    className="form-input"
                    placeholder="https://example.com/your-resume.pdf"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Upload your resume to a file sharing service and paste the link here.
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? (
                  <>
                    <div className="spinner"></div>
                    Saving...
                  </>
                ) : (
                  'Save Profile'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
