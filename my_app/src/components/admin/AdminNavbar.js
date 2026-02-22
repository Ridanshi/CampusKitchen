import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import './admin.css';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminName, setAdminName] = useState(sessionStorage.getItem('userName') || 'Admin');

  // Listen for storage changes to update admin name in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      const newName = sessionStorage.getItem('userName');
      if (newName) {
        setAdminName(newName);
      }
    };

    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event dispatched after profile update
    window.addEventListener('profileUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="admin-navbar">
      <Container fluid>
        <Navbar.Brand href="/admin/dashboard" className="d-flex align-items-center">
          <div className="brand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <span className="ms-2">Campus Kitchen Admin</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="admin-navbar-nav" />
        
        <Navbar.Collapse id="admin-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              onClick={() => navigate('/admin/dashboard')}
              className={isActive('/admin/dashboard') ? 'active' : ''}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              Dashboard
            </Nav.Link>
            
            <Nav.Link 
              onClick={() => navigate('/admin/users')}
              className={isActive('/admin/users') ? 'active' : ''}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Users
            </Nav.Link>
            
            <Nav.Link 
              onClick={() => navigate('/admin/bookings')}
              className={isActive('/admin/bookings') ? 'active' : ''}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Bookings
            </Nav.Link>
            
            <Nav.Link 
              onClick={() => navigate('/admin/complaints')}
              className={isActive('/admin/complaints') ? 'active' : ''}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              Complaints
            </Nav.Link>
            
            <Nav.Link 
              onClick={() => navigate('/admin/photos')}
              className={isActive('/admin/photos') ? 'active' : ''}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              Photos
            </Nav.Link>

            <Nav.Link 
              onClick={() => navigate('/admin/create-admin')}
              className={isActive('/admin/create-admin') ? 'active' : ''}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
              Admins
            </Nav.Link>
          </Nav>
          
          <Nav>
            <NavDropdown 
              title={
                <span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  {adminName}
                </span>
              }
              id="admin-dropdown"
              align="end"
            >
              <NavDropdown.Item onClick={() => navigate('/admin/profile')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Profile
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout} className="text-danger">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar;