import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './ClientHome.css';
import Footer from './Footer';

const API_BASE_URL = 'https://campuskitchen-production.up.railway.app';

const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeBooking, setActiveBooking] = useState(null);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    upcomingCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    fetchUserData();
    fetchStats();
    checkActiveBooking();

    const interval = setInterval(() => {
      setCurrentTime(new Date());
      checkActiveBooking();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Fetch bookings and stats whenever activeBooking changes
    fetchBookings();
    fetchStats();
  }, [activeBooking]);

  const fetchUserData = async () => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const data = await response.json();
      console.log('User data fetched:', data);
      setUser(data);
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/bookings?type=upcoming`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      // Filter out the active booking from upcoming bookings
      let filteredBookings = data;
      if (activeBooking) {
        filteredBookings = data.filter(booking => booking.id !== activeBooking.id);
      }
      
      setUpcomingBookings(filteredBookings.slice(0, 3));
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      
      const upcomingRes = await fetch(`${API_BASE_URL}/api/bookings?type=upcoming`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const historyRes = await fetch(`${API_BASE_URL}/api/bookings?type=history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const upcoming = await upcomingRes.json();
      const history = await historyRes.json();
      
      const completed = history.filter(b => b.status === 'completed').length;
      
      // Filter out active booking from upcoming count
      let upcomingCount = upcoming.length;
      if (activeBooking) {
        const filteredUpcoming = upcoming.filter(b => b.id !== activeBooking.id);
        upcomingCount = filteredUpcoming.length;
      }
      
      setStats({
        totalBookings: upcoming.length + history.length,
        completedBookings: completed,
        upcomingCount: upcomingCount
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const checkActiveBooking = async () => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/bookings/active-qr`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.booking) {
          setActiveBooking(data.booking);
        } else {
          setActiveBooking(null);
        }
      } else {
        setActiveBooking(null);
      }
    } catch (err) {
      console.error('Error checking active booking:', err);
      setActiveBooking(null);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 4) return "It's Late";
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  const getTimeUntilExpiry = () => {
    if (!activeBooking) return null;
    
    const timeSlotEnd = activeBooking.time.split('-')[1];
    const [hours, minutes] = timeSlotEnd.split(':').map(Number);
    const bookingDate = new Date(activeBooking.date);
    const endTime = new Date(bookingDate);
    endTime.setHours(hours + 1, minutes, 0, 0);
    
    const diff = endTime - currentTime;
    const minutesLeft = Math.floor(diff / 60000);
    
    if (minutesLeft < 0) return null;
    if (minutesLeft < 60) return `${minutesLeft} minutes`;
    
    const hoursLeft = Math.floor(minutesLeft / 60);
    const minsLeft = minutesLeft % 60;
    return `${hoursLeft}h ${minsLeft}m`;
  };



  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size should be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('bookingId', activeBooking.id);

      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/bookings/upload-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }

      // Refresh active booking to show uploaded status
      await checkActiveBooking();
      alert('Photo uploaded successfully!');
    } catch (err) {
      setUploadError(err.message);
      console.error('Error uploading photo:', err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const formatBookingDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="homepage">
        <Navbar />
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage">
      {/* Elegant Floating Shapes - Abstract & Sophisticated */}
      <div className="floating-shape shape-1"></div>
      <div className="floating-shape shape-2"></div>
      <div className="floating-shape shape-3"></div>
      <div className="floating-shape shape-4"></div>
      <div className="floating-shape shape-5"></div>
      <div className="floating-shape shape-6"></div>
      
      <Navbar />
      
      <div className="home-container">
        {/* Centered Greeting Section */}
        <div className="centered-greeting">
          <h1>{getGreeting()}, {user?.name?.split(' ')[0] || 'User'}!</h1>
          <p className="greeting-date">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>

        {/* Active Session Section */}
        {activeBooking && (
          <div className="active-booking-card">
            <div className="active-booking-header">
              <div className="pulse-indicator"></div>
              <h2>Active Kitchen Session</h2>
            </div>
            
            <div className="active-session-content">
              <div className="session-info">
                <div className="info-row">
                  <svg className="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <span className="info-label">Time Slot</span>
                    <span className="info-value">{activeBooking.time}</span>
                  </div>
                </div>
                
                <div className="info-row">
                  <svg className="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <span className="info-label">Date</span>
                    <span className="info-value">{formatBookingDate(activeBooking.date)}</span>
                  </div>
                </div>
                
                {getTimeUntilExpiry() && (
                  <div className="expiry-timer">
                    <svg className="timer-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Session expires in {getTimeUntilExpiry()}</span>
                  </div>
                )}
              </div>
              
              <div className="upload-section">
                <h3>📸 Upload Cleanup Photo</h3>
                <p className="upload-description">
                  Clean the kitchen thoroughly and upload a photo to complete your session
                </p>
                
                {!activeBooking.hasUploadedPhoto ? (
                  <>
                    <label className="upload-btn-primary" htmlFor="photo-upload">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '20px', height: '20px' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                    </label>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                      disabled={uploadingPhoto}
                    />
                    
                    {uploadError && (
                      <div className="upload-error">
                        ⚠️ {uploadError}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="upload-success">
                    <svg className="success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Photo uploaded successfully! ✅</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="stats-section">
          <h2>Your Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon stat-green">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-number">{stats.completedBookings}</span>
                <span className="stat-title">Completed</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-blue">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-number">{stats.upcomingCount}</span>
                <span className="stat-title">Upcoming</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-purple">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-number">{stats.totalBookings}</span>
                <span className="stat-title">Total Bookings</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Bookings Preview */}
        {upcomingBookings.length > 0 && (
          <div className="upcoming-preview-section">
            <div className="section-header">
              <h2>Upcoming Bookings</h2>
              <button className="view-all-btn" onClick={() => navigate('/client/clientbookings')}>
                View All
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="bookings-preview-list">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="preview-booking-card">
                  <div className="booking-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="booking-info">
                    <h4>{formatBookingDate(booking.date)}</h4>
                    <p>{booking.time}</p>
                    {booking.equipment && booking.equipment.length > 0 && (
                      <div className="equipment-tags">
                        {booking.equipment.slice(0, 2).map((item, idx) => (
                          <span key={idx} className="equipment-tag">{item}</span>
                        ))}
                        {booking.equipment.length > 2 && (
                          <span className="equipment-tag">+{booking.equipment.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className={`booking-status status-${booking.status}`}>
                    {booking.status === 'in-progress' ? 'In Progress' : 'Upcoming'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kitchen Tips */}
        <div className="tips-section">
          <h2>Kitchen Tips</h2>
          <div className="tips-grid">
            <div className="tip-card">
              <div className="tip-number">1</div>
              <h4>Before You Start</h4>
              <p>Check equipment availability and arrive 5 minutes early to set up</p>
            </div>
            <div className="tip-card">
              <div className="tip-number">2</div>
              <h4>During Cooking</h4>
              <p>Clean as you go to save time and maintain a safe workspace</p>
            </div>
            <div className="tip-card">
              <div className="tip-number">3</div>
              <h4>Before Leaving</h4>
              <p>Ensure all equipment is clean and upload your cleanup photo</p>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="help-section">
          <div className="help-content">
            <h3>Need Help?</h3>
            <p>Contact us for any questions or issues with your bookings</p>
          </div>
          <div className="help-actions">
            <a href="mailto:support@campuskitchen.edu" className="help-btn">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email Support
            </a>
          </div>
        </div>
       
      </div>
       <Footer />
    </div>
  );
};

export default HomePage;