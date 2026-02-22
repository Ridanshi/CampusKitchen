import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EditProfile.css';
import Navbar from './Navbar';
import Footer from './Footer';
import { LoadingSpinner } from './LoadingSpinner';

const API_BASE_URL = 'https://campuskitchen-production.up.railway.app';

const EditProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const getAuthToken = () => {
    const possibleKeys = ['token', 'authToken', 'auth_token', 'accessToken', 'jwt'];

    for (const key of possibleKeys) {
      const token = sessionStorage.getItem(key);
      if (token) {
        console.log(`Token found with key: ${key}`);
        return token;
      }
    }

    console.log('No token found');
    return null;
  };

  const fetchUserData = async () => {
    try {
      const token = getAuthToken();

      if (!token) {
        console.error('No authentication token found');
        setError('Not logged in');
        setLoading(false);
        return;
      }

      console.log('Fetching user data...');

      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);

        if (response.status === 401 || response.status === 403) {
          setError('session-expired');
        } else {
          setError(`Server error: ${response.status}`);
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('User data received:', data);

      setUserData(data);
      setFormData({
        name: data.name || '',
        studentId: data.studentId || '',
        password: '',
        confirmPassword: ''
      });
      setLoading(false);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(`Network error: ${error.message}`);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (message.text) {
      setMessage({ text: '', type: '' });
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setMessage({ text: 'Name is required', type: 'error' });
      return false;
    }

    if (formData.password || formData.confirmPassword) {
      if (formData.password.length < 6) {
        setMessage({ text: 'Password must be at least 6 characters', type: 'error' });
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setMessage({ text: 'Passwords do not match', type: 'error' });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const token = getAuthToken();
      // ✅ ONLY SEND NAME (Student ID is now locked)
      const updateData = {
        name: formData.name,
        studentId: formData.studentId  // Still send it but backend won't allow changes
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      console.log('Updating profile...');

      const response = await fetch(`${API_BASE_URL}/api/auth/update-profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        setFormData(prev => ({
          ...prev,
          password: '',
          confirmPassword: ''
        }));

        setUserData(data.user);

        // ✅ UPDATE SESSIONSTORAGE TO REFLECT CHANGES IMMEDIATELY IN NAVBAR
        sessionStorage.setItem('userName', data.user.name);
        if (data.user.studentId) {
          sessionStorage.setItem('userStudentId', data.user.studentId);
        }

        // ✅ TRIGGER A STORAGE EVENT TO UPDATE NAVBAR
        window.dispatchEvent(new Event('storage'));
      } else {
        setMessage({ text: data.error || 'Failed to update profile', type: 'error' });
      }
    } catch (error) {
      console.error('Update error:', error);
      setMessage({ text: 'Something went wrong. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  // Show error state if there's an error
  if (error) {
    return (
      <>
        <Navbar />
        <div className="edit-profile-page">
          <div className="edit-profile-container">
            <div className="edit-profile-card">
              <div className="error-state">
                <div className="error-icon">⚠️</div>
                <h2>Unable to Load Profile</h2>
                {error === 'session-expired' ? (
                  <>
                    <p>Your session has expired. Please log in again.</p>
                    <button className="btn-primary" onClick={handleGoToLogin}>
                      Go to Login
                    </button>
                  </>
                ) : error === 'Not logged in' ? (
                  <>
                    <p>You need to be logged in to view this page.</p>
                    <button className="btn-primary" onClick={handleGoToLogin}>
                      Go to Login
                    </button>
                  </>
                ) : (
                  <>
                    <p>{error}</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                      <button className="btn-secondary" onClick={() => window.location.reload()}>
                        Try Again
                      </button>
                      <button className="btn-primary" onClick={handleGoToLogin}>
                        Go to Login
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show loading state
  if (loading && !userData) {
    return (
      <>
        <Navbar />
        <div className="edit-profile-page">
          <div className="edit-profile-container">
            <LoadingSpinner text="Loading profile..." />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="edit-profile-page">
        <div className="edit-profile-container">
          <div className="page-title">
            <h1>Edit Profile</h1>
            <p>Update your personal information</p>
          </div>

          <div className="edit-profile-card">

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="form-group disabled-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userData?.email || ''}
                  disabled
                  className="disabled-input"
                />
                <span className="input-note">Email cannot be changed</span>
              </div>

              <div className="form-group disabled-group">
                <label htmlFor="studentId">Student ID</label>
                <input
                  type="text"
                  id="studentId"
                  name="studentId"
                  value={formData.studentId}
                  disabled
                  className="disabled-input"
                />
                <span className="input-note">Student ID cannot be changed</span>
              </div>

              <div className="password-section">
                <div className="section-header">
                  <h3>Change Password</h3>
                  <span className="optional-badge">Optional</span>
                </div>
                <p className="section-description">Leave blank to keep current password</p>

                <div className="form-group">
                  <label htmlFor="password">New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      minLength="6"
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
                    >
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M12 5C5.63636 5 2 12 2 12C2 12 5.63636 19 12 19C18.3636 19 22 12 22 12C22 12 18.3636 5 12 5Z" stroke="currentColor" strokeWidth="2" />
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M3 3L21 21M12 5C5.63636 5 2 12 2 12C2 12 3.27273 14.3636 5.5 16.5M12 19C18.3636 19 22 12 22 12C22 12 20.7273 9.63636 18.5 7.5" stroke="currentColor" strokeWidth="2" />
                          <path d="M9.87868 9.87868C9.33579 10.4216 9 11.1716 9 12C9 13.6569 10.3431 15 12 15C12.8284 15 13.5784 14.6642 14.1213 14.1213" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      minLength="6"
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex="-1"
                    >
                      {showConfirmPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M12 5C5.63636 5 2 12 2 12C2 12 5.63636 19 12 19C18.3636 19 22 12 22 12C22 12 18.3636 5 12 5Z" stroke="currentColor" strokeWidth="2" />
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M3 3L21 21M12 5C5.63636 5 2 12 2 12C2 12 3.27273 14.3636 5.5 16.5M12 19C18.3636 19 22 12 22 12C22 12 20.7273 9.63636 18.5 7.5" stroke="currentColor" strokeWidth="2" />
                          <path d="M9.87868 9.87868C9.33579 10.4216 9 11.1716 9 12C9 13.6569 10.3431 15 12 15C12.8284 15 13.5784 14.6642 14.1213 14.1213" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {message.text && (
                <div className={`message ${message.type}`}>
                  <span className="message-icon">
                    {message.type === 'success' ? '✓' : '!'}
                  </span>
                  {message.text}
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="btn-spinner"></span>
                      Updating...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default EditProfile;