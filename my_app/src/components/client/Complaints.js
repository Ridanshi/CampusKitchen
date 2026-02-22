import React, { useState, useEffect } from 'react';
import './Complaints.css';
import Navbar from './Navbar';
import Footer from './Footer';

const API_BASE_URL = 'https://campuskitchen-production.up.railway.app';

const Complaints = () => {
  const [activeTab, setActiveTab] = useState('form'); // 'form' or 'myComplaints'
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    description: '',
    urgency: 'medium',
    location: '',
    date: new Date().toISOString().split('T')[0],
    timeSlot: ''
  });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [myComplaints, setMyComplaints] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // Add filter state

  const categories = [
    'Kitchen Cleanliness',
    'Equipment Issue',
    'Damaged Appliances',
    'Missing Equipment',
    'Safety Concern',
    'Previous User Issue',
    'Other'
  ];

  const timeSlots = [
    '08:00-09:00',
    '09:00-10:00',
    '10:00-11:00',
    '11:00-12:00',
    '12:00-13:00',
    '13:00-14:00',
    '14:00-15:00',
    '15:00-16:00',
    '16:00-17:00',
    '17:00-18:00',
    '18:00-19:00',
    '19:00-20:00',
    '20:00-21:00',
    '21:00-22:00'
  ];

  // Fetch user's complaints when viewing My Complaints tab
  useEffect(() => {
    if (activeTab === 'myComplaints') {
      fetchMyComplaints();
    }
  }, [activeTab]);

  const fetchMyComplaints = async () => {
    setComplaintsLoading(true);
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/complaints`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch complaints');
      const data = await response.json();
      setMyComplaints(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch complaints');
    } finally {
      setComplaintsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + photos.length > 5) {
      setError('Maximum 5 photos allowed');
      return;
    }
    setPhotos(prev => [...prev, ...files]);
    setError('');
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.category || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      photos.forEach(photo => {
        formDataToSend.append('photos', photo);
      });

      const response = await fetch('http://localhost:5000/api/complaints', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Failed to submit complaint');
      }

      setSuccess(true);
      setFormData({
        subject: '',
        category: '',
        description: '',
        urgency: 'medium',
        location: '',
        date: new Date().toISOString().split('T')[0],
        timeSlot: ''
      });
      setPhotos([]);

      setTimeout(() => {
        setSuccess(false);
      }, 5000);

    } catch (err) {
      setError(err.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'status-badge-warning', text: 'Pending' },
      'under-review': { class: 'status-badge-info', text: 'Under Review' },
      resolved: { class: 'status-badge-success', text: 'Resolved' },
      dismissed: { class: 'status-badge-secondary', text: 'Dismissed' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const getUrgencyBadge = (urgency) => {
    const urgencyConfig = {
      low: { class: 'urgency-badge-low', text: 'Low' },
      medium: { class: 'urgency-badge-medium', text: 'Medium' },
      high: { class: 'urgency-badge-high', text: 'High' },
      critical: { class: 'urgency-badge-critical', text: 'Critical' }
    };
    const config = urgencyConfig[urgency] || urgencyConfig.medium;
    return <span className={`urgency-badge ${config.class}`}>{config.text}</span>;
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

  // Filter complaints based on status
  const filteredComplaints = statusFilter === 'all' 
    ? myComplaints 
    : myComplaints.filter(c => c.status === statusFilter);

  // Count complaints by status
  const statusCounts = {
    all: myComplaints.length,
    pending: myComplaints.filter(c => c.status === 'pending').length,
    'under-review': myComplaints.filter(c => c.status === 'under-review').length,
    resolved: myComplaints.filter(c => c.status === 'resolved').length,
    dismissed: myComplaints.filter(c => c.status === 'dismissed').length
  };

  return (
    <div className="complaints-page">
      <Navbar />
      <div className="complaints-content">
        <div className="complaints-header">
          <h1 className="page-title">Complaints Management</h1>
          <p className="page-subtitle">Report issues and track your complaints</p>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'form' ? 'active' : ''}`}
            onClick={() => setActiveTab('form')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Submit New Complaint
          </button>
          <button
            className={`tab-button ${activeTab === 'myComplaints' ? 'active' : ''}`}
            onClick={() => setActiveTab('myComplaints')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            My Complaints ({myComplaints.length})
          </button>
        </div>

        {success && (
          <div className="success-message">
            <svg className="success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <h3>Success!</h3>
              <p>{activeTab === 'form' ? "Complaint submitted successfully!" : "Action completed successfully!"}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <p>{error}</p>
          </div>
        )}

        {/* Submit New Complaint Form */}
        {activeTab === 'form' && (
          <div className="complaints-container">
            <form onSubmit={handleSubmit} className="complaint-form">
              <div className="form-section">
                <h2>Issue Details</h2>
                
                <div className="form-group">
                  <label htmlFor="subject">
                    Subject <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Brief summary of the issue"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category">
                      Category <span className="required">*</span>
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="urgency">Urgency Level</label>
                    <select
                      id="urgency"
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleChange}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="date">Date of Issue</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="timeSlot">Time Slot (Optional)</label>
                    <select
                      id="timeSlot"
                      name="timeSlot"
                      value={formData.timeSlot}
                      onChange={handleChange}
                    >
                      <option value="">Select time slot</option>
                      {timeSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="location">Kitchen Location (Optional)</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Building A, 2nd Floor"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">
                    Description <span className="required">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Please provide detailed information about the issue..."
                    rows="6"
                    required
                  />
                  <small className="char-count">{formData.description.length} characters</small>
                </div>
              </div>

              <div className="form-section">
                <h2>Photo Evidence (Optional)</h2>
                <p className="section-subtitle">Upload up to 5 photos to support your complaint</p>
                
                <div className="photo-upload-area">
                  <input
                    type="file"
                    id="photos"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="photos" className="upload-label">
                    <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Click to upload photos</span>
                    <small>PNG, JPG up to 5MB each</small>
                  </label>
                </div>

                {photos.length > 0 && (
                  <div className="photo-preview-grid">
                    {photos.map((photo, index) => (
                      <div key={index} className="photo-preview">
                        <img src={URL.createObjectURL(photo)} alt={`Preview ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-photo"
                          onClick={() => removePhoto(index)}
                          aria-label="Remove photo"
                        >
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Submitting...
                    </>
                  ) : (
                    'Submit Complaint'
                  )}
                </button>
              </div>
            </form>

            <div className="complaints-sidebar">
              <div className="info-card">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <h3>What happens next?</h3>
                <ul>
                  <li>Your complaint will be reviewed within 24 hours</li>
                  <li>You'll receive an email confirmation</li>
                  <li>Our team will investigate the issue</li>
                  <li>Updates will be sent to your email</li>
                </ul>
              </div>

              <div className="info-card emergency">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <h3>Emergency Issues?</h3>
                <p>For urgent safety concerns or emergencies, please contact:</p>
                <a href="tel:+1234567890" className="emergency-link">
                  Campus Security: (123) 456-7890
                </a>
              </div>

              <div className="info-card">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
                <h3>Tips for Filing</h3>
                <ul>
                  <li>Be specific about the issue</li>
                  <li>Include photos when possible</li>
                  <li>Mention the exact location</li>
                  <li>Note the date and time if relevant</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* My Complaints List */}
        {activeTab === 'myComplaints' && (
          <div className="my-complaints-section">
            {/* Filter Buttons */}
            <div className="filter-container">
              <span className="filter-label">Filter by Status:</span>
              <div className="filter-buttons">
                <button
                  className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('all')}
                >
                  All ({statusCounts.all})
                </button>
                <button
                  className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('pending')}
                >
                  Pending ({statusCounts.pending})
                </button>
                <button
                  className={`filter-btn ${statusFilter === 'under-review' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('under-review')}
                >
                  Under Review ({statusCounts['under-review']})
                </button>
                <button
                  className={`filter-btn ${statusFilter === 'resolved' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('resolved')}
                >
                  Resolved ({statusCounts.resolved})
                </button>
              </div>
            </div>

            {complaintsLoading ? (
              <div className="loading-container">
                <div className="spinner-large"></div>
                <p>Loading your complaints...</p>
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
                <h3>No Complaints Found</h3>
                <p>
                  {statusFilter === 'all' 
                    ? "You haven't submitted any complaints yet" 
                    : `No ${statusFilter.replace('-', ' ')} complaints found`}
                </p>
                {statusFilter === 'all' && (
                  <button className="btn-submit" onClick={() => setActiveTab('form')}>
                    Submit Your First Complaint
                  </button>
                )}
                {statusFilter !== 'all' && (
                  <button className="btn-submit" onClick={() => setStatusFilter('all')}>
                    View All Complaints
                  </button>
                )}
              </div>
            ) : (
              <div className="complaints-grid">
                {filteredComplaints.map((complaint) => (
                  <div key={complaint._id || complaint.id} className="complaint-card">
                    <div className="complaint-card-header">
                      <div>
                        <h3 className="complaint-subject">{complaint.subject}</h3>
                        <p className="complaint-category">{complaint.category}</p>
                      </div>
                      <div className="complaint-badges">
                        {getUrgencyBadge(complaint.urgency)}
                        {getStatusBadge(complaint.status)}
                      </div>
                    </div>

                    <div className="complaint-card-body">
                      <p className="complaint-description">{complaint.description}</p>
                      
                      {complaint.location && (
                        <div className="complaint-meta">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          <span>{complaint.location}</span>
                        </div>
                      )}

                      <div className="complaint-meta">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span>Submitted on {formatDate(complaint.createdAt)}</span>
                      </div>

                      {complaint.photos && complaint.photos.length > 0 && (
                        <div className="complaint-meta">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                          <span>{complaint.photos.length} photo(s) attached</span>
                        </div>
                      )}

                      {complaint.adminResponse && (
                        <div className="admin-response">
                          <h4>Admin Response:</h4>
                          <p>{complaint.adminResponse}</p>
                        </div>
                      )}
                    </div>

                    <div className="complaint-card-actions">
                      <button
                        className="btn-view"
                        onClick={() => handleViewComplaint(complaint)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal for viewing complaint details */}
      {showModal && selectedComplaint && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Complaint Details</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="complaint-detail-section">
                <h3>{selectedComplaint.subject}</h3>
                <div className="complaint-badges">
                  {getUrgencyBadge(selectedComplaint.urgency)}
                  {getStatusBadge(selectedComplaint.status)}
                  <span className="category-badge">{selectedComplaint.category}</span>
                </div>
              </div>

              <div className="complaint-detail-section">
                <h4>Description</h4>
                <p>{selectedComplaint.description}</p>
              </div>

              {selectedComplaint.location && (
                <div className="complaint-detail-section">
                  <h4>Location</h4>
                  <p>{selectedComplaint.location}</p>
                </div>
              )}

              <div className="complaint-detail-section">
                <h4>Date & Time</h4>
                <p>
                  {formatDate(selectedComplaint.date)}
                  {selectedComplaint.timeSlot && ` • ${selectedComplaint.timeSlot}`}
                </p>
              </div>

              {selectedComplaint.photos && selectedComplaint.photos.length > 0 && (
                <div className="complaint-detail-section">
                  <h4>Attached Photos</h4>
                  <div className="modal-photo-grid">
                    {selectedComplaint.photos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={`${API_BASE_URL}${photo}`}
                        alt={`Evidence ${idx + 1}`}
                        className="modal-photo"
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedComplaint.adminResponse && (
                <div className="complaint-detail-section admin-response-section">
                  <h4>Admin Response</h4>
                  <p>{selectedComplaint.adminResponse}</p>
                </div>
              )}

              {selectedComplaint.resolvedAt && (
                <div className="complaint-detail-section">
                  <h4>Resolved At</h4>
                  <p>{formatDate(selectedComplaint.resolvedAt)}</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Complaints;