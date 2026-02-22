import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Modal, Spinner, Alert, Form, InputGroup, ButtonGroup } from 'react-bootstrap';
import AdminNavbar from './AdminNavbar';
import './admin.css';

const API_BASE = "https://campuskitchen-production.up.railway.app";

const AdminPhotos = () => {
  const [photos, setPhotos] = useState([]);
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState(new Set());
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month, year
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  useEffect(() => {
    filterPhotos();
  }, [searchTerm, photos, dateFilter]);

  const fetchPhotos = async () => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/admin/photos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch photos');
      const data = await response.json();
      setPhotos(data);
      setFilteredPhotos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterPhotos = () => {
    let filtered = photos;

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(photo => {
        const photoDate = new Date(photo.date);
        
        switch(dateFilter) {
          case 'today':
            return photoDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return photoDate >= weekAgo;
          case 'month':
            return photoDate.getMonth() === now.getMonth() && 
                   photoDate.getFullYear() === now.getFullYear();
          case 'year':
            return photoDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(photo =>
        photo.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photo.studentId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPhotos(filtered);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewPhoto = (photo) => {
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cleanup Photo - ${photo.studentName} (${photo.studentId})</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              background: #1a1a1a;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              font-family: Arial, sans-serif;
            }
            .info {
              background: white;
              padding: 15px 30px;
              border-radius: 8px;
              margin-bottom: 20px;
              text-align: center;
            }
            .info h2 {
              margin: 0 0 5px 0;
              color: #333;
            }
            .info p {
              margin: 5px 0;
              color: #666;
            }
            img {
              max-width: 95vw;
              max-height: 85vh;
              object-fit: contain;
              border-radius: 8px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            }
          </style>
        </head>
        <body>
          <div class="info">
            <h2>${photo.studentName}</h2>
            <p><strong>ID:</strong> ${photo.studentId} | <strong>Date:</strong> ${formatDate(photo.date)} | <strong>Time:</strong> ${photo.timeSlot}</p>
          </div>
          <img src="${API_BASE}${photo.photoUrl}" alt="Cleanup Photo - ${photo.studentName}">
        </body>
      </html>
    `);
    newWindow.document.close();
  };

  const togglePhotoSelection = (photoId) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId);
    } else {
      newSelected.add(photoId);
    }
    setSelectedPhotos(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedPhotos.size === filteredPhotos.length) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(filteredPhotos.map(p => p.id)));
    }
  };

  const downloadSelectedPhotos = async () => {
    if (selectedPhotos.size === 0) {
      setError('Please select at least one photo to download');
      return;
    }

    // Create a zip file would require a library, so we'll download individually
    const selectedPhotoObjects = filteredPhotos.filter(p => selectedPhotos.has(p.id));
    
    for (const photo of selectedPhotoObjects) {
      try {
        const response = await fetch(`${API_BASE}${photo.photoUrl}`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${photo.studentName}_${photo.studentId}_${new Date(photo.date).toISOString().split('T')[0]}.jpg`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Small delay between downloads to avoid browser blocking
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (err) {
        console.error('Download failed for:', photo.studentName, err);
      }
    }
    
    setSuccess(`Downloaded ${selectedPhotos.size} photo(s) successfully!`);
  };

  const handleDeleteConfirm = () => {
    if (selectedPhotos.size === 0) {
      setError('Please select at least one photo to delete');
      return;
    }
    setShowDeleteModal(true);
  };

  const deleteSelectedPhotos = async () => {
    setDeleting(true);
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/admin/photos/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          photoIds: Array.from(selectedPhotos)
        })
      });

      if (!response.ok) throw new Error('Failed to delete photos');
      
      setSuccess(`Successfully deleted ${selectedPhotos.size} photo(s)`);
      setSelectedPhotos(new Set());
      setShowDeleteModal(false);
      fetchPhotos(); // Refresh the list
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
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
              <h2>Cleanup Photos</h2>
              <p className="text-muted mb-0">View all uploaded kitchen cleanup photos</p>
            </div>
            <Badge bg="success" pill style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
              {filteredPhotos.length} Photos
            </Badge>
          </div>

          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

          <Card className="mb-4">
            <Card.Body>
              <Row className="g-3">
                <Col md={6}>
                  <InputGroup>
                    <InputGroup.Text>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.35-4.35"/>
                      </svg>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search by student name or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={6}>
                  <div className="d-flex gap-2 align-items-center">
                    <span className="text-muted small">Filter by Date:</span>
                    <ButtonGroup size="sm">
                      <Button 
                        variant={dateFilter === 'all' ? 'success' : 'outline-secondary'}
                        onClick={() => setDateFilter('all')}
                      >
                        All
                      </Button>
                      <Button 
                        variant={dateFilter === 'today' ? 'success' : 'outline-secondary'}
                        onClick={() => setDateFilter('today')}
                      >
                        Today
                      </Button>
                      <Button 
                        variant={dateFilter === 'week' ? 'success' : 'outline-secondary'}
                        onClick={() => setDateFilter('week')}
                      >
                        This Week
                      </Button>
                      <Button 
                        variant={dateFilter === 'month' ? 'success' : 'outline-secondary'}
                        onClick={() => setDateFilter('month')}
                      >
                        This Month
                      </Button>
                      <Button 
                        variant={dateFilter === 'year' ? 'success' : 'outline-secondary'}
                        onClick={() => setDateFilter('year')}
                      >
                        This Year
                      </Button>
                    </ButtonGroup>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {filteredPhotos.length > 0 && (
            <Card className="mb-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex gap-2 align-items-center">
                    <Form.Check
                      type="checkbox"
                      label={`Select All (${selectedPhotos.size}/${filteredPhotos.length})`}
                      checked={selectedPhotos.size === filteredPhotos.length && filteredPhotos.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={selectedPhotos.size === 0}
                      onClick={downloadSelectedPhotos}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-1">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Download Selected ({selectedPhotos.size})
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={selectedPhotos.size === 0}
                      onClick={handleDeleteConfirm}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-1">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                      Delete Selected ({selectedPhotos.size})
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}

          {filteredPhotos.length > 0 ? (
            <div className="photo-grid">
              {filteredPhotos.map((photo) => (
                <Card key={photo.id} className="photo-card" style={{ position: 'relative' }}>
                  <Form.Check
                    type="checkbox"
                    checked={selectedPhotos.has(photo.id)}
                    onChange={() => togglePhotoSelection(photo.id)}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      zIndex: 10,
                      transform: 'scale(1.3)'
                    }}
                  />
                  <div style={{ position: 'relative' }}>
                    <Card.Img
                      variant="top"
                      src={`${API_BASE}${photo.photoUrl}`}
                      className="photo-card-img"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleViewPhoto(photo)}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem'
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-1">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      View Full
                    </div>
                  </div>
                  <Card.Body>
                    <div className="d-flex align-items-start mb-2">
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          background: '#10b981',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.875rem',
                          marginRight: '0.75rem',
                          flexShrink: 0
                        }}
                      >
                        {photo.studentName.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="fw-bold text-truncate">{photo.studentName}</div>
                        <small className="text-muted">ID: {photo.studentId}</small>
                      </div>
                    </div>

                    <div className="mb-2">
                      <small className="text-muted d-block">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-1">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        {formatDate(photo.date)}
                      </small>
                      <small className="text-muted d-block">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-1">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        {photo.timeSlot}
                      </small>
                    </div>

                    <Badge
                      bg={photo.status === 'completed' ? 'success' : 'primary'}
                      className="w-100"
                      style={{ padding: '0.375rem' }}
                    >
                      {photo.status === 'completed' ? 'Completed' : 'Active'}
                    </Badge>
                  </Card.Body>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <Card.Body>
                <div className="empty-state">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <p>No cleanup photos found</p>
                </div>
              </Card.Body>
            </Card>
          )}
        </Container>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning" className="mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <strong>Warning:</strong> This action cannot be undone!
          </Alert>
          <p>Are you sure you want to delete <strong>{selectedPhotos.size}</strong> selected photo(s)?</p>
          <p className="text-muted mb-0">The photos will be permanently removed from the server.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteSelectedPhotos} disabled={deleting}>
            {deleting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              'Delete Photos'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AdminPhotos;