import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import AdminNavbar from './AdminNavbar';
import './admin.css';

function EditAdmin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    adminId: ""
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to continue');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      // Decode token manually
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      console.log('Token payload:', payload);

      const response = await fetch('http://localhost:5000/get_admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: payload.id })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load profile');
      }

      const data = await response.json();
      console.log('Profile data:', data);
      
      setFormData({
        name: data.name || '',
        email: data.email || '',
        adminId: data.adminId || ''
      });

    } catch (err) {
      console.error('Fetch profile error:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/update_admin_profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: formData.name, 
          email: formData.email 
        })
      });

      const data = await response.json();

      if (data.data === 'success') {
        setSuccess('Profile updated successfully!');
        fetchProfile();
      } else {
        setError(data.msg || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update profile');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('All password fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/change_pass', {
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

      if (data.success) {
        setSuccess('Password changed successfully!');
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        setError(data.error || 'Failed to change password');
      }
    } catch (err) {
      console.error('Password change error:', err);
      setError('Failed to change password');
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
              <p className="mt-3">Loading profile...</p>
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
          <h2 className="mb-4">Admin Profile</h2>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert variant="success" dismissible onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          <Row>
            <Col lg={6}>
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Profile Information</h5>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleProfileUpdate}>
                    <Form.Group className="mb-3">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Enter your name"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={formData.email}
                        disabled
                        className="bg-light"
                      />
                      <Form.Text className="text-muted">
                        Email cannot be changed
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Student/Admin ID</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.adminId}
                        disabled
                        className="bg-light"
                      />
                      <Form.Text className="text-muted">
                        ID cannot be changed
                      </Form.Text>
                    </Form.Group>

                    <Button 
                      variant="success" 
                      type="submit"
                      className="w-100 btn-custom-primary"
                    >
                      Update Profile
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Change Password</h5>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handlePasswordChange}>
                    <Form.Group className="mb-3">
                      <Form.Label>Current Password</Form.Label>
                      <Form.Control
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        placeholder="Enter current password"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        placeholder="Enter new password"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Confirm New Password</Form.Label>
                      <Form.Control
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        placeholder="Confirm new password"
                        required
                      />
                    </Form.Group>

                    <Button 
                      variant="success" 
                      type="submit"
                      className="w-100 btn-custom-primary"
                    >
                      Change Password
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
}

export default EditAdmin;