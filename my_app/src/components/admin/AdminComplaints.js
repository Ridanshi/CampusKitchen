import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Modal, Form, Spinner, Alert, Card } from 'react-bootstrap';
import AdminNavbar from './AdminNavbar';
import './admin.css';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    filterComplaints();
  }, [filterStatus, complaints]);

  const fetchComplaints = async () => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/complaints', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch complaints');
      const data = await response.json();
      setComplaints(data);
      setFilteredComplaints(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterComplaints = () => {
    if (filterStatus === 'all') {
      setFilteredComplaints(complaints);
    } else {
      setFilteredComplaints(complaints.filter(c => c.status === filterStatus));
    }
  };

  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setAdminResponse(complaint.adminResponse || '');
    setNewStatus(complaint.status);
    setShowModal(true);
  };

  const handleUpdateComplaint = async () => {
    if (!selectedComplaint) return;

    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/complaints/${selectedComplaint._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          adminResponse: adminResponse
        })
      });

      if (!response.ok) throw new Error('Failed to update complaint');

      setSuccess('Complaint updated successfully!');
      setShowModal(false);
      fetchComplaints();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'warning', text: 'Pending' },
      'under-review': { bg: 'info', text: 'Under Review' },
      resolved: { bg: 'success', text: 'Resolved' },
      dismissed: { bg: 'secondary', text: 'Dismissed' }
    };
    const badge = badges[status] || badges.pending;
    return <Badge bg={badge.bg}>{badge.text}</Badge>;
  };

  const getUrgencyBadge = (urgency) => {
    const badges = {
      low: { bg: 'secondary', text: 'Low' },
      medium: { bg: 'info', text: 'Medium' },
      high: { bg: 'warning', text: 'High' },
      critical: { bg: 'danger', text: 'Critical' }
    };
    const badge = badges[urgency] || badges.medium;
    return <Badge bg={badge.bg}>{badge.text}</Badge>;
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
              <h2>Complaints Management</h2>
              <p className="text-muted mb-0">View and respond to student complaints</p>
            </div>
            <Badge bg="warning" pill style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
              {complaints.filter(c => c.status === 'pending').length} Pending
            </Badge>
          </div>

          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex gap-3 align-items-center flex-wrap">
                <span className="fw-bold text-muted">Filter by Status:</span>
                <div className="btn-group" role="group">
                  <Button
                    variant={filterStatus === 'all' ? 'success' : 'outline-secondary'}
                    size="sm"
                    onClick={() => setFilterStatus('all')}
                  >
                    All ({complaints.length})
                  </Button>
                  <Button
                    variant={filterStatus === 'pending' ? 'success' : 'outline-secondary'}
                    size="sm"
                    onClick={() => setFilterStatus('pending')}
                  >
                    Pending ({complaints.filter(c => c.status === 'pending').length})
                  </Button>
                  <Button
                    variant={filterStatus === 'under-review' ? 'success' : 'outline-secondary'}
                    size="sm"
                    onClick={() => setFilterStatus('under-review')}
                  >
                    Under Review ({complaints.filter(c => c.status === 'under-review').length})
                  </Button>
                  <Button
                    variant={filterStatus === 'resolved' ? 'success' : 'outline-secondary'}
                    size="sm"
                    onClick={() => setFilterStatus('resolved')}
                  >
                    Resolved ({complaints.filter(c => c.status === 'resolved').length})
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="p-0">
              {filteredComplaints.length > 0 ? (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Student</th>
                        <th>Subject</th>
                        <th>Category</th>
                        <th>Urgency</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredComplaints.map((complaint) => (
                        <tr key={complaint._id}>
                          <td>
                            <div>
                              <div className="fw-bold">{complaint.userId?.name || 'Unknown'}</div>
                              <small className="text-muted">{complaint.userId?.email}</small>
                            </div>
                          </td>
                          <td>
                            <div style={{ maxWidth: '200px' }}>
                              <div className="fw-bold text-truncate">{complaint.subject}</div>
                            </div>
                          </td>
                          <td>
                            <Badge bg="secondary">{complaint.category}</Badge>
                          </td>
                          <td>{getUrgencyBadge(complaint.urgency)}</td>
                          <td>{getStatusBadge(complaint.status)}</td>
                          <td>
                            <small className="text-muted">{formatDate(complaint.createdAt)}</small>
                          </td>
                          <td>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => handleViewComplaint(complaint)}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="empty-state">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <p>No complaints found</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Container>
      </div>

     {/* Complaint Details Modal */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        size="lg" 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        dialogClassName="centered-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Complaint Details</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '50vh', overflowY: 'auto' }}>
          {selectedComplaint && (
            <>
              <div className="mb-3">
                <h5>{selectedComplaint.subject}</h5>
                <div className="d-flex gap-2 mb-3">
                  <Badge bg="secondary">{selectedComplaint.category}</Badge>
                  {getUrgencyBadge(selectedComplaint.urgency)}
                  {getStatusBadge(selectedComplaint.status)}
                </div>
              </div>

              <div className="mb-3">
                <strong>Student:</strong> {selectedComplaint.userId?.name} ({selectedComplaint.userId?.email})
              </div>

              <div className="mb-3">
                <strong>Date:</strong> {formatDate(selectedComplaint.date)}
              </div>

              {selectedComplaint.location && (
                <div className="mb-3">
                  <strong>Location:</strong> {selectedComplaint.location}
                </div>
              )}

              {selectedComplaint.timeSlot && (
                <div className="mb-3">
                  <strong>Time Slot:</strong> <code>{selectedComplaint.timeSlot}</code>
                </div>
              )}

              <div className="mb-3">
                <strong>Description:</strong>
                <div className="p-3 bg-light rounded mt-2">{selectedComplaint.description}</div>
              </div>

              {selectedComplaint.photos && selectedComplaint.photos.length > 0 && (
                <div className="mb-3">
                  <strong>Photos:</strong>
                  <div className="d-flex gap-2 mt-2 flex-wrap">
                    {selectedComplaint.photos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={`http://localhost:5000${photo}`}
                        alt={`Evidence ${idx + 1}`}
                        style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <hr />

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label><strong>Update Status</strong></Form.Label>
                  <Form.Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="under-review">Under Review</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label><strong>Admin Response</strong></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    placeholder="Enter your response to the student..."
                  />
                </Form.Group>
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button
            variant="success"
            onClick={handleUpdateComplaint}
            disabled={updating}
            className="btn-custom-primary"
          >
            {updating ? 'Updating...' : 'Update Complaint'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AdminComplaints;