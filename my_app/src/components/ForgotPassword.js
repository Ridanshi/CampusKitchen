import React, { useState } from 'react';
import { Calendar, ArrowLeft, Check, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';
import Footer from './client/Footer';


const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Reset Form, 2: Success
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!email || !studentId || !newPassword || !confirmPassword) {
        throw new Error('All fields are required');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      if (newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const response = await fetch('http://localhost:5000/api/auth/reset-password-studentid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, studentId, newPassword, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setStep(2); // Move to success step
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      {/* Navigation Bar */}
      <nav className="forgot-navbar">
        <div className="forgot-navbar-content">
          <div className="forgot-navbar-logo">
            <div className="forgot-logo-icon">
              <Calendar style={{ width: '20px', height: '20px' }} />
            </div>
            <span className="forgot-logo-text">Campus Kitchen</span>
          </div>

          <button onClick={() => navigate('/')} className="forgot-btn-back">
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="forgot-container">
        <div className="forgot-content">
          {step === 1 && (
            <>
              {/* Reset Password Form */}
              <div className="forgot-icon-wrapper">
                <Lock className="forgot-icon" size={48} />
              </div>

              <h1 className="forgot-title">Reset Password</h1>
              <p className="forgot-description">
                Enter your email and student ID to verify your identity and create a new password.
              </p>

              {error && <div className="forgot-error">{error}</div>}

              <form onSubmit={handleResetPassword} className="forgot-form">
                <div className="forgot-form-group">
                  <label className="forgot-form-label">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="forgot-form-input"
                    placeholder="student@university.edu"
                    disabled={loading}
                  />
                </div>

                <div className="forgot-form-group">
                  <label className="forgot-form-label">Student/Admin ID</label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="forgot-form-input"
                    placeholder="STU12345 or ADM001"
                    disabled={loading}
                  />
                </div>

                <div className="forgot-form-group">
                  <label className="forgot-form-label">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="forgot-form-input"
                    placeholder="Enter new password"
                    disabled={loading}
                  />
                </div>

                <div className="forgot-form-group">
                  <label className="forgot-form-label">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="forgot-form-input"
                    placeholder="Confirm new password"
                    disabled={loading}
                  />
                </div>

                <button type="submit" className="forgot-btn-submit" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="forgot-spinner"></div>
                      <span>Resetting Password...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={20} />
                      <span>Reset Password</span>
                    </>
                  )}
                </button>
              </form>

              <div className="forgot-footer">
                <button onClick={() => navigate('/')} className="forgot-link">
                  Remember your password? <strong>Sign In</strong>
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* Success */}
              <div className="forgot-success-icon">
                <Check size={48} />
              </div>

              <h1 className="forgot-title">Password Reset Successful!</h1>
              <p className="forgot-description">
                Your password has been successfully reset. You can now log in with your new password.
              </p>

              <div className="forgot-success-info">
                <div className="forgot-info-item">
                  <span className="forgot-info-emoji">✅</span>
                  <div>
                    <h3>All set!</h3>
                    <p>Your password is now secure</p>
                  </div>
                </div>

                <div className="forgot-info-item">
                  <span className="forgot-info-emoji">🔒</span>
                  <div>
                    <h3>Account secured</h3>
                    <p>You can now access your account</p>
                  </div>
                </div>
              </div>

              <button onClick={() => navigate('/')} className="forgot-btn-submit">
                <ArrowLeft size={20} />
                <span>Go to Login</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      {/* <footer className="forgot-page-footer">
        <div className="forgot-footer-content">
          <p className="forgot-footer-text">
            © 2024 Campus Kitchen. All rights reserved.
          </p>
          <div className="forgot-footer-links">
            <button onClick={() => navigate('/privacy')} className="forgot-footer-link">
              Privacy Policy
            </button>
            <span className="forgot-footer-separator">•</span>
            <button onClick={() => navigate('/terms')} className="forgot-footer-link">
              Terms of Service
            </button>
            <span className="forgot-footer-separator">•</span>
            <button onClick={() => navigate('/contact')} className="forgot-footer-link">
              Contact Support
            </button>
          </div>
        </div>
      </footer> */}
      <Footer/>
    </div>
  );
};

export default ForgotPassword;