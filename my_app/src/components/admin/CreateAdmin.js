import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Table, Badge } from 'react-bootstrap';
import AdminNavbar from './AdminNavbar';
import './admin.css';

const CreateAdmin = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminId: '' // ✅ Changed from studentId to adminId
  });
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  React.useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch admins');
      const data = await response.json();
      
      // Filter only admins
      const adminUsers = data.filter(user => user.role === 'admin');
      setAdmins(adminUsers);
    } catch (err) {
      console.error('Error fetching admins:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      // ✅ Fixed endpoint to match backend
      const response = await fetch('http://localhost:5000/api/auth/register-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          adminId: formData.adminId // ✅ Changed from studentId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create admin');
      }

      setSuccess(`Admin account created successfully for ${formData.name}!`);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        adminId: '' // ✅ Changed from studentId
      });

      // Refresh admin list
      fetchAdmins();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="admin-container">
        <Container>
          <h2 className="mb-4">Create New Administrator</h2>

          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

          <Row>
            <Col lg={5}>
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Add New Admin</h5>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        placeholder="Enter admin name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="Enter email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Admin ID</Form.Label>
                      <Form.Control
                        type="text"
                        name="adminId"
                        placeholder="Enter admin ID"
                        value={formData.adminId}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        placeholder="Create password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Confirm Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>

                    <Button
                      variant="success"
                      type="submit"
                      className="w-100 btn-custom-primary"
                      disabled={loading}
                    >
                      {loading ? 'Creating Admin...' : 'Create Admin Account'}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={7}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Existing Administrators ({admins.length})</h5>
                </Card.Header>
                <Card.Body className="p-0">
                  {admins.length > 0 ? (
                    <Table responsive hover className="mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Admin ID</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {admins.map((admin) => (
                          <tr key={admin._id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="me-2" style={{
                                  width: '32px',
                                  height: '32px',
                                  background: '#10b981',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  fontSize: '0.875rem'
                                }}>
                                  {admin.name.charAt(0).toUpperCase()}
                                </div>
                                <strong>{admin.name}</strong>
                              </div>
                            </td>
                            <td>{admin.email}</td>
                            <td>
                              {/* ✅ Fixed to show correct ID */}
                              <code className="text-primary">
                                {admin.userId || admin.adminId || admin.studentId || 'N/A'}
                              </code>
                            </td>
                            <td>
                              <Badge bg="success">Active</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="empty-state py-5 text-center">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{margin: '0 auto'}}>
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      <p>No administrators found</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default CreateAdmin;