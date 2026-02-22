import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import AdminNavbar from './AdminNavbar';
import './admin.css';

const API_BASE = "https://campuskitchen-production.up.railway.app";

const AdminProfile = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    adminId: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId');
      
      if (!token || !userId) {
        setError('No authentication found. Please login again.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/get_admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: userId })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      
      setProfileData({
        name: data.name || '',
        email: data.email || '',
        adminId: data.adminId || ''
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Fetch profile error:', err);
      setError(err.message || 'Failed to load profile');
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUpdateLoading(true);

    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE}/update_admin_profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email
        })
      });

      const data = await response.json();

      if (data.data === 'error') {
        throw new Error(data.msg || 'Failed to update profile');
      }

      // ✅ UPDATE SESSIONSTORAGE WITH CORRECT KEY
      sessionStorage.setItem('userName', profileData.name);
      
      // ✅ DISPATCH CUSTOM EVENT TO UPDATE NAVBAR IN REAL-TIME
      window.dispatchEvent(new Event('profileUpdated'));

      setSuccess(data.msg || 'Profile updated successfully!');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      setTimeout(() => setError(''), 5000);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All password fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);

    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE}/change_pass`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          curr: passwordData.currentPassword,
          pass: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to change password');
      }

      setPasswordSuccess(data.message || 'Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => setPasswordSuccess(''), 5000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
      setTimeout(() => setPasswordError(''), 5000);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <div className="admin-container">
          <Container>
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading profile...</p>
            </div>
          </Container>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div className="admin-container">
        <Container>
          <div className="mb-4">
            <h2>Admin Profile</h2>
            <p className="text-muted">Manage your account settings and password</p>
          </div>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Row>
            {/* Profile Information */}
            <Col lg={6}>
              <Card className="mb-4">
                <Card.Body>
                  <h4 className="mb-4">Profile Information</h4>
                  
                  {success && (
                    <Alert variant="success" dismissible onClose={() => setSuccess('')}>
                      {success}
                    </Alert>
                  )}

                  <Form onSubmit={handleUpdateProfile}>
                    <Form.Group className="mb-3">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={profileData.email}
                        disabled
                        style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                      />
                      <Form.Text className="text-muted">
                        Email cannot be changed
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Admin ID</Form.Label>
                      <Form.Control
                        type="text"
                        value={profileData.adminId}
                        disabled
                        style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                      />
                      <Form.Text className="text-muted">
                        Admin ID cannot be changed
                      </Form.Text>
                    </Form.Group>

                    <Button
                      variant="success"
                      type="submit"
                      disabled={updateLoading}
                      className="btn-custom-primary"
                    >
                      {updateLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Updating...
                        </>
                      ) : (
                        'Update Profile'
                      )}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>

            {/* Change Password */}
            <Col lg={6}>
              <Card className="mb-4">
                <Card.Body>
                  <h4 className="mb-4">Change Password</h4>

                  {passwordError && (
                    <Alert variant="danger" dismissible onClose={() => setPasswordError('')}>
                      {passwordError}
                    </Alert>
                  )}

                  {passwordSuccess && (
                    <Alert variant="success" dismissible onClose={() => setPasswordSuccess('')}>
                      {passwordSuccess}
                    </Alert>
                  )}

                  <Form onSubmit={handleChangePassword}>
                    <Form.Group className="mb-3">
                      <Form.Label>Current Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter current password"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password"
                        required
                      />
                      <Form.Text className="text-muted">
                        Must be at least 6 characters
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Confirm New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm new password"
                        required
                      />
                    </Form.Group>

                    <Button
                      variant="success"
                      type="submit"
                      disabled={passwordLoading}
                      className="btn-custom-primary"
                    >
                      {passwordLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Changing...
                        </>
                      ) : (
                        'Change Password'
                      )}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default AdminProfile;