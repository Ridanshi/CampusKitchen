import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Top Section */}
        <div className="footer-top">
          <div className="footer-column footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2"/>
                  <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2"/>
                  <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
                </svg>
              </div>
              <span className="footer-logo-text">Campus Kitchen</span>
            </div>
            <p className="footer-description">
              Making campus cooking accessible and organized for all students. Book your slot, cook your meal, and keep our kitchen clean.
            </p>
          </div>

          <div className="footer-column">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              <li><a href="/client/clienthome">Home</a></li>
              <li><a href="/client/booking">Book Kitchen</a></li>
              <li><a href="/client/clientbookings">My Bookings</a></li>
              <li><a href="/client/cleanup-photos">Cleanup Photos</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-heading">Support</h3>
            <ul className="footer-links">
              <li><a href="/client/guidelines">Guidelines</a></li>
              <li><a href="/client/complaints">Report Issue</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#contact">Contact Us</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-heading">Contact</h3>
            <ul className="footer-contact">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <a href="mailto:kitchen@university.edu">kitchen@university.edu</a>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <a href="tel:+1234567890">+1 (234) 567-890</a>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span>Student Center, 3rd Floor</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <p>&copy; {currentYear} Campus Kitchen. All rights reserved.</p>
          </div>
          <div className="footer-bottom-right">
            <a href="#privacy">Privacy Policy</a>
            <span className="divider">•</span>
            <a href="#terms">Terms of Service</a>
            <span className="divider">•</span>
            <a href="#accessibility">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;