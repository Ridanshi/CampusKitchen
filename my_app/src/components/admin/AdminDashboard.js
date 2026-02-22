import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import AdminNavbar from './AdminNavbar';
import './admin.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      
      // Fetch main stats
      const statsRes = await fetch('http://localhost:5000/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!statsRes.ok) throw new Error('Failed to fetch stats');
      const statsData = await statsRes.json();

      // Fetch complaints count
      const complaintsRes = await fetch('http://localhost:5000/api/admin/complaints', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const complaintsData = await complaintsRes.json();

      // Fetch photos count
      const photosRes = await fetch('http://localhost:5000/api/admin/photos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const photosData = await photosRes.json();

      setStats({
        ...statsData,
        totalComplaints: complaintsData.length,
        totalPhotos: photosData.length,
        pendingComplaints: complaintsData.filter(c => c.status === 'pending').length
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <div className="loading-container">
          <Spinner animation="border" variant="success" />
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
            <h2>Dashboard Overview</h2>
            <p className="text-muted">Welcome to Campus Kitchen Admin Panel</p>
          </div>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon primary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div className="stat-label">Total Users</div>
              <div className="stat-value">{stats?.totalUsers || 0}</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon success">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div className="stat-label">Total Bookings</div>
              <div className="stat-value">{stats?.totalBookings || 0}</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon warning">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div className="stat-label">Complaints</div>
              <div className="stat-value">{stats?.totalComplaints || 0}</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon danger">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
              <div className="stat-label">Cleanup Photos</div>
              <div className="stat-value">{stats?.totalPhotos || 0}</div>
            </div>
          </div>

          <Row className="mt-4">
            <Col md={6}>
              <Card className="mb-3">
                <Card.Body>
                  <h5>Booking Statistics</h5>
                  <hr />
                  <div className="d-flex justify-content-between mb-2">
                    <span>Upcoming Bookings:</span>
                    <strong className="text-primary">{stats?.upcomingBookings || 0}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Completed Bookings:</span>
                    <strong className="text-success">{stats?.completedBookings || 0}</strong>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="mb-3">
                <Card.Body>
                  <h5>Complaint Statistics</h5>
                  <hr />
                  <div className="d-flex justify-content-between mb-2">
                    <span>Pending Complaints:</span>
                    <strong className="text-warning">{stats?.pendingComplaints || 0}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Total Complaints:</span>
                    <strong>{stats?.totalComplaints || 0}</strong>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default AdminDashboard;