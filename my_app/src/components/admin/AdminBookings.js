import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Modal, Spinner, Alert, Card } from 'react-bootstrap';
import AdminNavbar from './AdminNavbar';
import * as XLSX from 'xlsx';
import './admin.css';

const API_BASE = "https://campuskitchen-production.up.railway.app";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedCompanions, setSelectedCompanions] = useState([]);
  const [showCompanionsModal, setShowCompanionsModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [filterStatus, bookings]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchBookings = async () => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/admin/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookings(data);
      setFilteredBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    if (filterStatus === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(b => b.status === filterStatus));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      upcoming: { bg: 'primary', text: 'Upcoming' },
      completed: { bg: 'success', text: 'Completed' },
      cancelled: { bg: 'danger', text: 'Cancelled' }
    };
    const badge = badges[status] || badges.upcoming;
    return <Badge bg={badge.bg}>{badge.text}</Badge>;
  };

  const handleViewPhoto = (photoUrl) => {
    setSelectedPhoto(photoUrl);
    setShowPhotoModal(true);
  };

  const handleViewCompanions = (companions, studentName) => {
    setSelectedCompanions({ companions, studentName });
    setShowCompanionsModal(true);
  };

  const exportToExcel = () => {
    try {
      const excelData = filteredBookings.map(booking => {
        // Format companions for Excel
        let companionsText = 'Cooking alone';
        if (booking.companions && booking.companions.length > 0) {
          const filledCompanions = booking.companions.filter(
            c => c.name || c.registrationNumber
          );
          if (filledCompanions.length > 0) {
            companionsText = filledCompanions
              .map(c => `${c.name || 'N/A'} (${c.registrationNumber || 'N/A'})`)
              .join('; ');
          }
        }

        return {
          'Student Name': booking.userId?.name || 'Unknown',
          'Student ID': booking.userId?.studentId || 'N/A',
          'Email': booking.userId?.email || 'N/A',
          'Date': formatDate(booking.date),
          'Time Slot': booking.timeSlot,
          'Companions': companionsText,
          'Equipment': booking.equipment && booking.equipment.length > 0 
            ? booking.equipment.join(', ') 
            : 'None',
          'Status': booking.status.charAt(0).toUpperCase() + booking.status.slice(1),
          'Has Photo': booking.checkOutPhoto ? 'Yes' : 'No',
          'Booking ID': booking._id
        };
      });

      const ws = XLSX.utils.json_to_sheet(excelData);

      const colWidths = [
        { wch: 20 }, 
        { wch: 15 }, 
        { wch: 25 }, 
        { wch: 20 }, 
        { wch: 15 }, 
        { wch: 40 }, 
        { wch: 30 }, 
        { wch: 12 }, 
        { wch: 10 }, 
        { wch: 25 }  
      ];
      ws['!cols'] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Bookings');

      const today = new Date().toISOString().split('T')[0];
      const filename = `kitchen_bookings_${filterStatus}_${today}.xlsx`;

      XLSX.writeFile(wb, filename);

      setSuccess(`Successfully exported ${filteredBookings.length} bookings to Excel!`);
    } catch (err) {
      setError('Failed to export to Excel. Please try again.');
      console.error('Export error:', err);
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
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2>Kitchen Bookings</h2>
              <p className="text-muted mb-0">View and manage all kitchen slot bookings</p>
            </div>
            <div className="d-flex align-items-center gap-3">
              <Badge bg="primary" pill style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                {filteredBookings.length} Bookings
              </Badge>
              <Button variant="success" onClick={exportToExcel}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Export to Excel
              </Button>
            </div>
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
                    All ({bookings.length})
                  </Button>
                  <Button
                    variant={filterStatus === 'upcoming' ? 'success' : 'outline-secondary'}
                    size="sm"
                    onClick={() => setFilterStatus('upcoming')}
                  >
                    Upcoming ({bookings.filter(b => b.status === 'upcoming').length})
                  </Button>
                  <Button
                    variant={filterStatus === 'completed' ? 'success' : 'outline-secondary'}
                    size="sm"
                    onClick={() => setFilterStatus('completed')}
                  >
                    Completed ({bookings.filter(b => b.status === 'completed').length})
                  </Button>
                  <Button
                    variant={filterStatus === 'cancelled' ? 'success' : 'outline-secondary'}
                    size="sm"
                    onClick={() => setFilterStatus('cancelled')}
                  >
                    Cancelled ({bookings.filter(b => b.status === 'cancelled').length})
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="p-0">
              {filteredBookings.length > 0 ? (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Student</th>
                        <th>Date</th>
                        <th>Time Slot</th>
                        <th>Companions</th>
                        <th>Equipment</th>
                        <th>Status</th>
                        <th>Photo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((booking) => {
                        const hasCompanions = booking.companions && 
                          booking.companions.length > 0 && 
                          booking.companions.some(c => c.name || c.registrationNumber);
                        
                        const companionCount = hasCompanions 
                          ? booking.companions.filter(c => c.name || c.registrationNumber).length 
                          : 0;

                        return (
                          <tr key={booking._id}>
                            <td>
                              <div>
                                <div className="fw-bold">{booking.userId?.name || 'Unknown'}</div>
                                <small className="text-muted">{booking.userId?.studentId}</small>
                              </div>
                            </td>
                            <td>{formatDate(booking.date)}</td>
                            <td>
                              <code className="text-primary">{booking.timeSlot}</code>
                            </td>
                            <td>
                              {hasCompanions ? (
                                <Button
                                  size="sm"
                                  variant="outline-info"
                                  onClick={() => handleViewCompanions(
                                    booking.companions,
                                    booking.userId?.name
                                  )}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-1">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                    <circle cx="9" cy="7" r="4"/>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                  </svg>
                                  {companionCount} {companionCount === 1 ? 'Companion' : 'Companions'}
                                </Button>
                              ) : (
                                <span className="text-muted">Cooking alone</span>
                              )}
                            </td>
                            <td>
                              {booking.equipment && booking.equipment.length > 0 ? (
                                <div style={{ maxWidth: '200px' }}>
                                  {booking.equipment.slice(0, 2).map((item, idx) => (
                                    <Badge key={idx} bg="secondary" className="me-1 mb-1">
                                      {item}
                                    </Badge>
                                  ))}
                                  {booking.equipment.length > 2 && (
                                    <Badge bg="secondary">+{booking.equipment.length - 2}</Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted">None</span>
                              )}
                            </td>
                            <td>{getStatusBadge(booking.status)}</td>
                            <td>
                              {booking.checkOutPhoto ? (
                                <Button
                                  size="sm"
                                  variant="outline-success"
                                  onClick={() => handleViewPhoto(booking.checkOutPhoto)}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-1">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                  </svg>
                                  View
                                </Button>
                              ) : (
                                <span className="text-muted">No photo</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="empty-state">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <p>No bookings found</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Container>
      </div>

      {/* Photo Modal */}
      <Modal show={showPhotoModal} onHide={() => setShowPhotoModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Cleanup Photo</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedPhoto && (
            <img
              src={`${API_BASE}${selectedPhoto}`}
              alt="Cleanup"
              style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '8px' }}
            />
          )}
        </Modal.Body>
      </Modal>

      {/* Companions Modal - ANIMATION DISABLED TO PREVENT SHIFTING */}
      <Modal 
        show={showCompanionsModal} 
        onHide={() => setShowCompanionsModal(false)} 
        centered
        animation={false}
        className="companions-modal"
      >
        <Modal.Header closeButton className="companions-modal-header">
          <Modal.Title className="companions-modal-title">
            <div className="companions-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <span>Companions for {selectedCompanions.studentName}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="companions-modal-body">
          {selectedCompanions.companions && selectedCompanions.companions.length > 0 ? (
            <div className="companions-list">
              {selectedCompanions.companions
                .filter(c => c.name || c.registrationNumber)
                .map((companion, index) => (
                  <div key={index} className="companion-card">
                    <div className="companion-card-content">
                      <div className="companion-number">
                        {index + 1}
                      </div>
                      <div className="companion-info">
                        <div className="companion-name">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                          {companion.name || 'Name not provided'}
                        </div>
                        <div className="companion-reg">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                          <span>{companion.registrationNumber || 'Registration not provided'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="companions-empty">
              <div className="companions-empty-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <p className="companions-empty-title">No companions for this booking</p>
              <p className="companions-empty-subtitle">This student is cooking alone</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="companions-modal-footer">
          <Button onClick={() => setShowCompanionsModal(false)} className="companions-close-btn">
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AdminBookings;