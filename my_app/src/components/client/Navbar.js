import React, { useState, useEffect } from 'react';
import { Calendar, Home, BookOpen, FileText, AlertCircle, LogOut, Camera } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Get user data from sessionStorage or localStorage
useEffect(() => {
  const getUser = () => {
    // ✅ Read from separate sessionStorage items
    const userName = sessionStorage.getItem('userName');
    const userEmail = sessionStorage.getItem('userEmail');
    const userId = sessionStorage.getItem('userId');
    const userRole = sessionStorage.getItem('userRole');

    if (userName) {
      return {
        name: userName,
        email: userEmail,
        id: userId,
        role: userRole
      };
    }

    // Fallback to old format
    const userData = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (userData) {
      return JSON.parse(userData);
    }

    return null;
  };

  setUser(getUser());
  
  // ✅ LISTEN FOR PROFILE UPDATES - ADD THIS PART
  const handleStorageChange = () => {
    setUser(getUser());
  };
  
  window.addEventListener('storage', handleStorageChange);
  
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
}, []);

  // Check if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Handle logout
  const handleLogout = () => {
    // Clear all auth data
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to home page
    navigate('/');
  };

  return (
    <nav className="booking-navbar">
      <div className="booking-navbar-content">
        <div className="booking-navbar-logo">
          <div className="booking-logo-icon">
            <Calendar className="icon" />
          </div>
          <span className="booking-logo-text">Campus Kitchen</span>
        </div>
        <div className="booking-navbar-links">
          <a 
            href="/client/clienthome" 
            className={`booking-nav-link ${isActive('/client/clienthome') ? 'active' : ''}`}
          >
            <Home className="icon-small" /> Home
          </a>
          <a 
            href="/client/clientbook" 
            className={`booking-nav-link ${isActive('/client/clientbook') ? 'active' : ''}`}
          >
            <Calendar className="icon-small" /> Book Kitchen
          </a>
          <a 
            href="/client/clientbookings" 
            className={`booking-nav-link ${isActive('/client/clientbookings') ? 'active' : ''}`}
          >
            <BookOpen className="icon-small" /> My Bookings
          </a>
          <a 
            href="/client/photoupload" 
            className={`booking-nav-link ${isActive('/client/photoupload') ? 'active' : ''}`}
          >
            <Camera className="icon-small" /> Cleanup Photos
          </a>
          <a 
            href="/client/complaints" 
            className={`booking-nav-link ${isActive('/client/complaints') ? 'active' : ''}`}
          >
            <AlertCircle className="icon-small" /> Complaints
          </a>
          <a 
            href="/client/guidelines" 
            className={`booking-nav-link ${isActive('/client/guidelines') ? 'active' : ''}`}
          >
            <FileText className="icon-small" /> Guidelines
          </a>
        </div>
        <div className="booking-navbar-user">
          <div 
            className="user-avatar" 
            onClick={() => navigate('/client/edit')}
            title="Edit Profile"
          >
            {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
          </div>
          <span className="user-name">{user?.name || 'User'}</span>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut className="icon-small" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;