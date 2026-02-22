import React from 'react';
import './LoadingSpinner.css';

// ==================== SPINNER LOADING (Default) ====================
export const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

// ==================== DOTS LOADING ====================
export const DotsLoading = () => {
  return (
    <div className="dots-loading">
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
    </div>
  );
};

// ==================== PULSE LOADING ====================
export const PulseLoading = () => {
  return (
    <div className="pulse-loading">
      <div className="pulse-circle"></div>
    </div>
  );
};

// ==================== SKELETON LOADING ====================
export const SkeletonLoading = ({ cards = 3 }) => {
  return (
    <div className="skeleton-container">
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} className="skeleton-card">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text"></div>
        </div>
      ))}
    </div>
  );
};

// ==================== INLINE LOADING ====================
export const InlineLoading = ({ text = 'Loading' }) => {
  return (
    <div className="inline-loading">
      <div className="inline-spinner"></div>
      <span>{text}</span>
    </div>
  );
};

// ==================== FULL PAGE OVERLAY ====================
export const LoadingOverlay = ({ text = 'Loading...' }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner"></div>
      <p className="loading-text">{text}</p>
    </div>
  );
};

// Default export
export default LoadingSpinner;