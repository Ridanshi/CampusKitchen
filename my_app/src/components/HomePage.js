import React, { useState } from 'react';
import { Calendar, Clock, Camera, Shield, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const API_URL = 'https://campuskitchen-production.up.railway.app/api';

const HomePage = () => {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    studentId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const features = [
    {
      icon: Calendar,
      title: 'Easy Booking',
      description: 'Book your preferred time slot with just a few clicks',
      colorClass: 'blue'
    },
    {
      icon: Clock,
      title: '1-Hour Sessions',
      description: 'Each booking gives you a full hour of kitchen access',
      colorClass: 'emerald'
    },
    {
      icon: Camera,
      title: 'Photo Verification',
      description: 'Quick photo upload ensures kitchen stays clean for everyone',
      colorClass: 'purple'
    },
    {
      icon: Shield,
      title: 'Fair Access',
      description: 'Equal opportunity booking system for all students',
      colorClass: 'orange'
    }
  ];

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setError('');
    setSuccess('');
    setShowPassword(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validation
      if (authMode === 'register') {
        if (!formData.name || !formData.email || !formData.password || !formData.studentId) {
          throw new Error('All fields are required');
        }
      } else {
        if (!formData.email || !formData.password) {
          throw new Error('Email and password are required');
        }
      }

      const endpoint = authMode === 'login'
        ? `${API_URL}/auth/login`
        : `${API_URL}/auth/register`;

      const payload = authMode === 'login'
        ? { email: formData.email, password: formData.password }
        : {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          studentId: formData.studentId
        };

      console.log('Sending request to:', endpoint);
      console.log('Payload:', payload);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Store token and user data
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('userId', data.user.id);
      sessionStorage.setItem('userName', data.user.name);
      sessionStorage.setItem('userEmail', data.user.email);
      sessionStorage.setItem('userRole', data.user.role);

      // ✅ Instant redirect based on user role
      if (data.user.role === 'admin') {
        console.log('Admin detected, redirecting to admin dashboard');
        window.location.href = '/admin/dashboard';
      } else {
        console.log('Student detected, redirecting to client home');
        window.location.href = '/client/clienthome';
      }

    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="homepage-container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-logo">
            <div className="logo-icon">
              <Calendar style={{ width: '20px', height: '20px' }} />
            </div>
            <span className="logo-text">Campus Kitchen</span>
          </div>

          <div className="navbar-auth">
            <button onClick={() => openAuthModal('login')} className="btn-login">
              Login
            </button>
            <button onClick={() => openAuthModal('register')} className="btn-signup">
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-badge">
          <span className="pulse-dot"></span>
          <span>Student Kitchen Booking System</span>
        </div>

        <h1 className="hero-title">
          Cook Your Way, <span className="highlight">On Your Schedule</span>
        </h1>

        <p className="hero-description">
          Reserve your spot in the campus kitchen with our simple booking system. One-hour slots, easy photo verification, and fair access for all students.
        </p>

        <div className="hero-buttons">
          <button className="btn-primary">
            <Calendar style={{ width: '20px', height: '20px' }} />
            <span>Book Kitchen Now</span>
          </button>
          <button className="btn-secondary">
            <span>📋</span>
            <span>View Guidelines</span>
          </button>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="how-it-works">
        <div className="how-it-works-content">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Simple steps to get cooking</p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="feature-card">
                  <div className={`feature-icon ${feature.colorClass}`}>
                    <Icon style={{ width: '28px', height: '28px' }} />
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button onClick={() => setShowAuthModal(false)} className="modal-close">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="modal-header">
              <div className="modal-icon-wrapper">
                <Calendar className="modal-icon" style={{ width: '24px', height: '24px' }} />
              </div>
              <h2 className="modal-title">
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="modal-subtitle">
                {authMode === 'login'
                  ? 'Login to access your bookings'
                  : 'Sign up to start booking the kitchen'}
              </p>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {success && (
              <div className="success-message">
                {success}
              </div>
            )}

            <div className="modal-form">
              {authMode === 'register' && (
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="John Doe"
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="student@university.edu"
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-input password-input"
                    placeholder="Enter Password"
                    style={{ paddingRight: '45px' }}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0',
                      display: 'block',
                      width: '20px',
                      height: '20px',
                      color: '#9CA3AF'
                    }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Forgot Password Link - RIGHT ALIGNED */}
                {authMode === 'login' && (
                  <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAuthModal(false);
                        navigate('/forgot-password');
                      }}
                      className="forgot-password-link"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>

              {authMode === 'register' && (
                <div className="form-group">
                  <label className="form-label">Student ID</label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="STU123456"
                  />
                </div>
              )}

              <button
                onClick={handleSubmit}
                className="btn-submit"
                style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {authMode === 'login' ? 'Login' : 'Create Account'}
              </button>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                  setError('');
                  setSuccess('');
                  setShowPassword(false);
                }}
                className="btn-switch"
              >
                {authMode === 'login'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Login'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;