import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Form, InputGroup, Spinner, Alert, Card } from 'react-bootstrap';
import AdminNavbar from './AdminNavbar';
import './admin.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, filterRole, users]);

  const fetchUsers = async () => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by role
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => {
        const userId = user.userId || user.studentId || user.adminId || '';
        return (
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          userId.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    setFilteredUsers(filtered);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // ✅ Helper function to get the correct ID
  const getUserId = (user) => {
    return user.userId || user.adminId || user.studentId || 'N/A';
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
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2>Registered Users</h2>
              <p className="text-muted mb-0">Manage all registered students and admins</p>
            </div>
            <Badge bg="success" pill style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
              {filteredUsers.length} Users
            </Badge>
          </div>

          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex gap-3 flex-wrap">
                <InputGroup style={{ maxWidth: '400px' }}>
                  <InputGroup.Text>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search by name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>

                <Form.Select
                  style={{ maxWidth: '200px' }}
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="student">Students Only</option>
                  <option value="admin">Admins Only</option>
                </Form.Select>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="p-0">
              {filteredUsers.length > 0 ? (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Student/Admin ID</th>
                        <th>Role</th>
                        <th>Joined Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div
                                className="me-3"
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  background: user.role === 'admin' ? '#10b981' : '#3b82f6',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  fontSize: '1rem'
                                }}
                              >
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="fw-bold">{user.name}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="text-muted">{user.email}</div>
                          </td>
                          <td>
                            {/* ✅ Fixed to show correct ID based on role */}
                            <code className="text-primary">{getUserId(user)}</code>
                          </td>
                          <td>
                            {user.role === 'admin' ? (
                              <Badge bg="success">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-1">
                                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                  <path d="M2 17l10 5 10-5"/>
                                  <path d="M2 12l10 5 10-5"/>
                                </svg>
                                Admin
                              </Badge>
                            ) : (
                              <Badge bg="primary">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-1">
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                  <circle cx="12" cy="7" r="4"/>
                                </svg>
                                Student
                              </Badge>
                            )}
                          </td>
                          <td>
                            <span className="text-muted">{formatDate(user.createdAt)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="empty-state">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <p>No users found matching your filters</p>
                </div>
              )}
            </Card.Body>
          </Card>

          {filteredUsers.length > 0 && (
            <div className="mt-3 text-muted text-center">
              Showing {filteredUsers.length} of {users.length} total users
            </div>
          )}
        </Container>
      </div>
    </>
  );
};

export default AdminUsers;