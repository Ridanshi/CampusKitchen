import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ArrowLeft, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './MyBookings.css';
import Navbar from './Navbar';
import Footer from './Footer';

const MyBookings = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('upcoming');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const [upcomingCount, setUpcomingCount] = useState(0);
    const [historyCount, setHistoryCount] = useState(0);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState(null);

    // API base URL
    const API_BASE_URL = 'http://localhost:5000';

    // Get token from sessionStorage
    const getAuthToken = () => {
        return sessionStorage.getItem('token');
    };

    // Get user data from sessionStorage
    const getUser = () => {
        const userData = sessionStorage.getItem('user');
        if (userData) {
            return JSON.parse(userData);
        }
        return null;
    };

    useEffect(() => {
        const userData = getUser();
        setUser(userData);
        fetchCounts();
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [activeTab]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError('');

            const token = getAuthToken();
            if (!token) {
                setError('Please log in to view bookings');
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/bookings?type=${activeTab}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401 || response.status === 403) {
                setError('Session expired. Please log in again.');
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user');
                setLoading(false);
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch bookings');
            }

            const data = await response.json();
            console.log('Fetched bookings:', data);
            setBookings(data);
        } catch (err) {
            console.error('Error fetching bookings:', err);
            setError(err.message || 'Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const fetchCounts = async () => {
        try {
            const token = getAuthToken();
            if (!token) return;

            const upcomingResponse = await fetch(`${API_BASE_URL}/api/bookings?type=upcoming`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (upcomingResponse.ok) {
                const upcomingData = await upcomingResponse.json();
                setUpcomingCount(upcomingData.length);
            }

            const historyResponse = await fetch(`${API_BASE_URL}/api/bookings?type=history`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (historyResponse.ok) {
                const historyData = await historyResponse.json();
                setHistoryCount(historyData.length);
            }
        } catch (err) {
            console.error('Error fetching counts:', err);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        setBookingToCancel(bookingId);
        setShowCancelDialog(true);
    };

    const confirmCancelBooking = async () => {
        try {
            const token = getAuthToken();

            const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingToCancel}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to cancel booking');
            }

            setBookings(bookings.filter(b => b.id !== bookingToCancel));
            setUpcomingCount(prev => prev - 1);
            setHistoryCount(prev => prev + 1);

            setShowCancelDialog(false);
            setBookingToCancel(null);
        } catch (err) {
            console.error('Error cancelling booking:', err);
            alert(`Error: ${err.message}`);
            setShowCancelDialog(false);
            setBookingToCancel(null);
        }
    };

    const handleNewBooking = () => {
        navigate('/client/clientbook');
    };

    // Helper to check if booking is ongoing
    const isBookingOngoing = (booking) => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        const [startTime, endTime] = booking.time.split('-');
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        
        const currentTimeInMinutes = currentHour * 60 + currentMinute;
        const startTimeInMinutes = startHour * 60 + startMinute;
        const endTimeInMinutes = endHour * 60 + endMinute;
        
        // Check if booking is today
        const bookingDate = new Date(booking.date);
        const isToday = bookingDate.toDateString() === now.toDateString();
        
        return isToday && currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes;
    };

    // Helper to get status badge color
    const getStatusColor = (status) => {
        switch (status) {
            case 'upcoming': return 'status-upcoming';
            case 'ongoing': return 'status-ongoing';
            case 'completed': return 'status-completed';
            case 'cancelled': return 'status-cancelled';
            default: return '';
        }
    };

    // Helper to get status display text
    const getStatusText = (status) => {
        switch (status) {
            case 'upcoming': return 'Upcoming';
            case 'ongoing': return 'Ongoing';
            case 'completed': return 'Completed';
            case 'cancelled': return 'Cancelled';
            default: return status;
        }
    };

    return (
        <div className="my-bookings-page">
            <Navbar />

            <div className="bookings-container">
                {error && (
                    <div style={{
                        padding: '12px',
                        marginTop: '20px',
                        marginBottom: '20px',
                        backgroundColor: '#fee',
                        color: '#c33',
                        borderRadius: '8px',
                        border: '1px solid #fcc'
                    }}>
                        {error}
                    </div>
                )}

                <div className="bookings-header">
                    <div className="bookings-header-left">
                        <h1 className="bookings-title">My Bookings</h1>
                        <p className="bookings-subtitle">Manage your kitchen reservations</p>
                    </div>
                    <button className="new-booking-btn" onClick={handleNewBooking}>
                        <Plus className="icon-small" />
                        <span>New Booking</span>
                    </button>
                </div>

                <div className="bookings-tabs">
                    <button
                        className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
                        onClick={() => setActiveTab('upcoming')}
                    >
                        <Calendar className="tab-icon" />
                        <span>Upcoming ({upcomingCount})</span>
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        <Clock className="tab-icon" />
                        <span>History ({historyCount})</span>
                    </button>
                </div>

                <div className="bookings-content">
                    {loading ? (
                        <div className="bookings-loading">
                            <div className="loading-spinner"></div>
                            <p>Loading bookings...</p>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="bookings-empty">
                            <div className="empty-icon">
                                <Calendar className="calendar-large" />
                            </div>
                            <h3 className="empty-title">No {activeTab === 'upcoming' ? 'Upcoming' : 'Past'} Bookings</h3>
                            <p className="empty-description">
                                {activeTab === 'upcoming'
                                    ? "You haven't booked any kitchen slots yet"
                                    : "You don't have any booking history yet"}
                            </p>
                            {activeTab === 'upcoming' && (
                                <button className="book-first-slot-btn" onClick={handleNewBooking}>
                                    Book Your Slot Now!
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="bookings-list">
                            {bookings.map(booking => {
                                const isOngoing = isBookingOngoing(booking);
                                
                                return (
                                    <div key={booking.id} className={`booking-card ${activeTab === 'history' ? 'history-card' : ''}`}>
                                        <div className="booking-card-content">
                                            <div className="booking-info">
                                                <div className="booking-date">
                                                    <Calendar className="booking-icon" />
                                                    <span>{booking.date}</span>
                                                </div>
                                                <div className="booking-time">
                                                    <Clock className="booking-icon" />
                                                    <span>{booking.time}</span>
                                                </div>
                                                {booking.equipment && booking.equipment.length > 0 && (
                                                    <div className="booking-equipment">
                                                        <span style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px', display: 'block' }}>
                                                            Equipment: {booking.equipment.join(', ')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            {activeTab === 'upcoming' && !isOngoing && (
                                                <button
                                                    className="cancel-btn"
                                                    onClick={() => handleCancelBooking(booking.id)}
                                                >
                                                    <X className="icon-small" />
                                                    <span>Cancel</span>
                                                </button>
                                            )}
                                            {activeTab === 'upcoming' && isOngoing && (
                                                <div className={`booking-status ${getStatusColor('ongoing')}`}>
                                                    <span className="status-dot"></span>
                                                    <span>{getStatusText('ongoing')}</span>
                                                </div>
                                            )}
                                            {activeTab === 'history' && (
                                                <div className={`booking-status ${getStatusColor(booking.status)}`}>
                                                    <span className="status-dot"></span>
                                                    <span>{getStatusText(booking.status)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            < Footer />
            {/* <footer className="bookings-footer">
                <div className="footer-content">
                    <div className="footer-left">
                        <Calendar className="footer-icon" />
                        <span>Campus Kitchen Booking</span>
                    </div>
                    <div className="footer-right">
                        © 2025 Student Services. All rights reserved.
                    </div>
                </div>
            </footer> */}

            {showCancelDialog && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '32px',
                        maxWidth: '400px',
                        textAlign: 'center',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}>
                        <h2 style={{ margin: '0 0 12px 0', fontSize: '24px', color: '#1a202c' }}>
                            Cancel Booking?
                        </h2>
                        <p style={{ color: '#64748b', marginBottom: '24px' }}>
                            Are you sure you want to cancel this booking? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={() => {
                                    setShowCancelDialog(false);
                                    setBookingToCancel(null);
                                }}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#f3f4f6',
                                    color: '#374151',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Keep Booking
                            </button>
                            <button
                                onClick={confirmCancelBooking}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Yes, Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyBookings;