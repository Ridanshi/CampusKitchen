import React, { useState, useEffect, useRef } from 'react';
import './PhotoUpload.css';
import Navbar from './Navbar';
import Footer from './Footer';

const PhotoUpload = () => {
    const [activeBooking, setActiveBooking] = useState(null);
    const [uploadedPhotos, setUploadedPhotos] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [view, setView] = useState('upload');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [photoToDelete, setPhotoToDelete] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchActiveBooking();
        fetchUploadedPhotos();
        
        const interval = setInterval(fetchActiveBooking, 10000);
        return () => clearInterval(interval);
    }, []);

    const getAuthToken = () => {
        const possibleKeys = ['token', 'authToken', 'auth_token', 'accessToken'];
        
        for (const key of possibleKeys) {
            const token = sessionStorage.getItem(key);
            if (token) {
                console.log(`Found token with key: ${key}`);
                return token;
            }
        }
        
        console.error('No authentication token found in sessionStorage');
        console.log('Available keys:', Object.keys(sessionStorage));
        return null;
    };

    const fetchActiveBooking = async () => {
        try {
            const token = getAuthToken();
            
            if (!token) {
                console.error('Cannot fetch active booking: No token');
                setActiveBooking(null);
                return;
            }

            const response = await fetch('http://localhost:5000/api/bookings/active-upload', {
                method: 'GET',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Active booking response status:', response.status);

            if (response.status === 403 || response.status === 401) {
                console.error('Authentication failed - token may be invalid');
                setActiveBooking(null);
                return;
            }

            if (!response.ok) {
                console.error('Failed to fetch active booking:', response.status);
                setActiveBooking(null);
                return;
            }

            const data = await response.json();
            console.log('Active booking data:', data);

            if (data.booking && data.booking.id) {
                setActiveBooking(data.booking);
            } else {
                setActiveBooking(null);
            }
        } catch (err) {
            console.error('Error fetching active booking:', err);
            setActiveBooking(null);
        }
    };
    
    const fetchUploadedPhotos = async () => {
        try {
            const token = getAuthToken();
            
            if (!token) {
                console.error('Cannot fetch photos: No token');
                return;
            }

            const response = await fetch('http://localhost:5000/api/my-photos', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.error('Failed to fetch photos:', response.status);
                return;
            }

            const data = await response.json();
            setUploadedPhotos(data);
        } catch (err) {
            console.error('Error fetching photos:', err);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                return;
            }

            setSelectedFile(file);
            setError(null);

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !activeBooking) {
            setError('No file selected or no active booking');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const token = getAuthToken();
            
            if (!token) {
                setError('Authentication required. Please log in again.');
                setUploading(false);
                return;
            }

            const formData = new FormData();
            formData.append('photo', selectedFile);

            const response = await fetch(
                `http://localhost:5000/api/upload-cleanup/${activeBooking.id}`,
                { 
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData 
                }
            );

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            setUploadSuccess(true);
            setSelectedFile(null);
            setPreviewUrl(null);

            setTimeout(() => {
                fetchActiveBooking();
                fetchUploadedPhotos();
                setUploadSuccess(false);
            }, 2000);
        } catch (err) {
            console.error(err);
            setError('Failed to upload photo. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            const event = { target: { files: [file] } };
            handleFileSelect(event);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDeletePhoto = async (photoId) => {
        try {
            const token = getAuthToken();
            
            if (!token) {
                setError('Authentication required. Please log in again.');
                return;
            }

            const response = await fetch(
                `http://localhost:5000/api/delete-cleanup/${photoId}`,
                { 
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Delete failed');
            }

            setShowDeleteModal(false);
            setPhotoToDelete(null);
            fetchUploadedPhotos();
            fetchActiveBooking();
            
        } catch (err) {
            console.error(err);
            alert('Failed to delete photo. Please try again.');
            setShowDeleteModal(false);
        }
    };

    const openDeleteModal = (photoId) => {
        setPhotoToDelete(photoId);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setPhotoToDelete(null);
    };

    // Check if photo can be edited (within 30 mins of booking end time)
    const canEditPhoto = (photo) => {
        if (!photo.bookingEndTime) return false;
        
        const endTime = new Date(photo.bookingEndTime);
        const editDeadline = new Date(endTime.getTime() + 30 * 60000); // 30 minutes after end
        const now = new Date();
        
        return now < editDeadline;
    };

    return (
        <div className="photo-upload-container">
            <Navbar />

            <div className="photo-upload-content">
                <div className="photo-upload-header">
                    <div className="header-content">
                        <h1 className="page-title">Kitchen Cleanup Photos</h1>
                        <p className="page-subtitle">Document your cleanup to complete your booking</p>
                    </div>

                    <div className="view-toggle">
                        <button
                            className={`toggle-btn ${view === 'upload' ? 'active' : ''}`}
                            onClick={() => setView('upload')}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" />
                                <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" />
                                <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            Upload
                        </button>
                        <button
                            className={`toggle-btn ${view === 'gallery' ? 'active' : ''}`}
                            onClick={() => setView('gallery')}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" />
                                <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" />
                                <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" />
                                <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            Gallery ({uploadedPhotos.length})
                        </button>
                    </div>
                </div>

                {view === 'upload' ? (
                    <div className="upload-section">
                        {activeBooking ? (
                            <>
                                <div className="active-booking-banner">
                                    <div className="banner-content">
                                        <h3>Active Booking</h3>
                                        <p>{new Date(activeBooking.date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric'
                                        })} • {activeBooking.time}</p>
                                    </div>
                                    <div className="banner-status">In Progress</div>
                                </div>

                                <div className="upload-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                                    <div className="upload-header">
                                        <div>
                                            <h3>Upload Cleanup Photo</h3>
                                            <p>You can upload multiple photos during your booking session</p>
                                        </div>
                                    </div>

                                    <div
                                        className="upload-dropzone"
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {previewUrl ? (
                                            <div className="preview-container">
                                                <img src={previewUrl} alt="Preview" className="preview-image" />
                                                <button
                                                    className="remove-preview"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreviewUrl(null);
                                                        setSelectedFile(null);
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="dropzone-content">
                                                <p className="dropzone-text">Drop your photo here</p>
                                                <p className="dropzone-subtext">or click to browse</p>
                                                <span className="file-requirements">PNG, JPG up to 10MB</span>
                                            </div>
                                        )}
                                    </div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        style={{ display: 'none' }}
                                    />

                                    {error && (
                                        <div className="error-message">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" />
                                                <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" />
                                            </svg>
                                            {error}
                                        </div>
                                    )}

                                    {uploadSuccess && (
                                        <div className="success-message">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" />
                                                <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="2" />
                                            </svg>
                                            Photo uploaded successfully!
                                        </div>
                                    )}

                                    <button
                                        className="upload-button"
                                        onClick={handleUpload}
                                        disabled={!selectedFile || uploading}
                                    >
                                        {uploading ? (
                                            <>
                                                <span className="spinner"></span>
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" />
                                                    <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" />
                                                    <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" />
                                                </svg>
                                                Upload Photo
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="no-active-booking">
                                <h2>No Active Booking</h2>
                                <p>You don't have any active bookings right now. The upload feature will be available during your booking time.</p>
                                <button
                                    className="view-gallery-btn"
                                    onClick={() => setView('gallery')}
                                >
                                    View Past Photos
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="gallery-section">
                        {uploadedPhotos.length > 0 ? (
                            <div className="photo-grid">
                                {uploadedPhotos.map((photo) => (
                                    <div key={photo.id} className="photo-card">
                                        <div className="photo-image-container">
                                            <img
                                                src={`http://localhost:5000${photo.photoUrl}`}
                                                alt={`Cleanup from ${photo.date}`}
                                                className="photo-image"
                                            />
                                            <div className="photo-overlay">
                                                <button
                                                    className="view-full-btn"
                                                    onClick={() => window.open(`http://localhost:5000${photo.photoUrl}`, '_blank')}
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                                                        <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" />
                                                    </svg>
                                                    View Full Size
                                                </button>
                                            </div>
                                        </div>
                                        <div className="photo-info">
                                            <div className="photo-date">{photo.date}</div>
                                            <div className="photo-time">{photo.timeSlot}</div>
                                            <div className={`photo-status status-${photo.status}`}>
                                                {photo.status === 'completed' && '✓ Completed'}
                                                {photo.status === 'ongoing' && '🔵 Ongoing'}
                                                {photo.status === 'grace-period' && '⏳ Grace Period'}
                                                {photo.status === 'upcoming' && 'Upcoming'}
                                            </div>
                                            
                                            {canEditPhoto(photo) && (
                                                <div className="photo-actions">
                                                    <button
                                                        className="delete-photo-btn"
                                                        onClick={() => openDeleteModal(photo.id)}
                                                        title="Delete photo"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                            <polyline points="3 6 5 6 21 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-gallery">
                                <h2>No Photos Yet</h2>
                                <p>Your cleanup photos will appear here after you complete bookings.</p>
                                <button
                                    className="view-gallery-btn"
                                    onClick={() => setView('upload')}
                                >
                                    Upload Your First Photo
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-overlay" onClick={closeDeleteModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Delete Photo?</h2>
                            <p>Are you sure you want to delete this cleanup photo? This action cannot be undone.</p>
                        </div>
                        <div className="modal-actions">
                            <button className="modal-btn cancel-btn" onClick={closeDeleteModal}>
                                Cancel
                            </button>
                            <button className="modal-btn delete-btn" onClick={() => handleDeletePhoto(photoToDelete)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <polyline points="3 6 5 6 21 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Delete Photo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default PhotoUpload;