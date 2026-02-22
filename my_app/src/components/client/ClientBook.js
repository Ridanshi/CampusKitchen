import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ChefHat, CheckCircle, ArrowLeft, ArrowRight, Users, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ClientBook.css';
import Navbar from './Navbar';
import Footer from './Footer';
import { LoadingSpinner } from './LoadingSpinner';

const BookingPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [companions, setCompanions] = useState([{ name: '', registrationNumber: '' }]);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dateAvailability, setDateAvailability] = useState({});
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showActiveBookingDialog, setShowActiveBookingDialog] = useState(false);
  const [activeBookingDetails, setActiveBookingDetails] = useState(null);

  const getAuthToken = () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found in sessionStorage');
    }
    return token;
  };

  const getUser = () => {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  };

  const API_BASE_URL = 'https://campuskitchen-production.up.railway.app';

  useEffect(() => {
    const token = getAuthToken();
    const userData = getUser();

    if (!token) {
      setError('Please log in to book a kitchen slot');
    } else {
      setUser(userData);
    }
  }, []);

  useEffect(() => {
    fetchDateAvailability();
  }, [currentMonth]);

  const fetchDateAvailability = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        setError('Authentication required. Please log in.');
        setLoading(false);
        return;
      }

      const month = currentMonth.getMonth();
      const year = currentMonth.getFullYear();

      const response = await fetch(
        `${API_BASE_URL}/api/availability?month=${month}&year=${year}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json();
        setError('Session expired. Please log in again.');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch availability');
      }

      const data = await response.json();
      setDateAvailability(data);
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError(err.message || 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSlots = async (date) => {
    try {
      setError(null);

      const token = getAuthToken();
      if (!token) {
        setError('Authentication required. Please log in.');
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/timeslots?date=${date.toISOString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 401 || response.status === 403) {
        setError('Session expired. Please log in again.');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch time slots');
      }

      const data = await response.json();
      setTimeSlots(data);
    } catch (err) {
      console.error('Error fetching time slots:', err);
      setError(err.message || 'Failed to load time slots');
    }
  };

  const equipment = [
    { id: 'stove', name: 'Stove/Burner' },
    { id: 'oven', name: 'Oven' },
    { id: 'microwave', name: 'Microwave' },
    { id: 'refrigerator', name: 'Refrigerator' },
    { id: 'utensils', name: 'Utensils & Pans' },
    { id: 'kettle', name: 'Electric Kettle' },
    { id: 'toaster', name: 'Toaster' },
  ];

  const steps = [
    { number: 1, label: 'Select Date', icon: Calendar },
    { number: 2, label: 'Choose Time', icon: Clock },
    { number: 3, label: 'Companions', icon: Users },
    { number: 4, label: 'Equipment', icon: ChefHat },
    { number: 5, label: 'Confirm', icon: CheckCircle },
  ];

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const handleDateSelect = (day) => {
    if (!day || !dateAvailability[day] || dateAvailability[day] === 'full' || dateAvailability[day] === 'past') return;
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(selected);
    setSelectedTime(null);
    setTimeout(() => fetchTimeSlots(selected), 0);
  };

  const handleTimeSelect = (slot) => {
    if (!slot.available) return;
    setSelectedTime(slot);
  };

  const addCompanion = () => {
    setCompanions([...companions, { name: '', registrationNumber: '' }]);
  };

  const removeCompanion = (index) => {
    if (companions.length > 1) {
      setCompanions(companions.filter((_, i) => i !== index));
    }
  };

  const updateCompanion = (index, field, value) => {
    const updated = companions.map((companion, i) =>
      i === index ? { ...companion, [field]: value } : companion
    );
    setCompanions(updated);
  };

  const toggleEquipment = (equipmentId) => {
    setSelectedEquipment(prev =>
      prev.includes(equipmentId)
        ? prev.filter(id => id !== equipmentId)
        : [...prev, equipmentId]
    );
  };

  const validateCompanions = () => {
    // Check if any companion has incomplete information
    for (let i = 0; i < companions.length; i++) {
      const c = companions[i];
      const hasName = c.name.trim().length > 0;
      const hasRegNo = c.registrationNumber.trim().length > 0;

      // If one field is filled but not the other, it's invalid
      if (hasName && !hasRegNo) {
        return { valid: false, message: `Please provide registration number for ${c.name || 'Companion ' + (i + 1)}` };
      }
      if (hasRegNo && !hasName) {
        return { valid: false, message: `Please provide name for companion with registration number ${c.registrationNumber}` };
      }
    }

    return { valid: true, message: '' };
  };

  const handleContinue = () => {
    if (currentStep === 1 && selectedDate) {
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedTime) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Validate companions before continuing
      const validation = validateCompanions();
      if (!validation.valid) {
        setError(validation.message);
        return;
      }
      setError(null);
      setCurrentStep(4);
    } else if (currentStep === 4) {
      setCurrentStep(5);
    } else if (currentStep === 5) {
      handleConfirmBooking();
    }
  };


  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirmBooking = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();

      // Filter out empty companions
      const filledCompanions = companions.filter(c => c.name.trim() || c.registrationNumber.trim());

      const bookingData = {
        date: selectedDate.toISOString(),
        timeSlot: selectedTime.time,
        equipment: selectedEquipment,
        companions: filledCompanions
      };

      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      const errorData = await response.json();

      if (!response.ok) {
        setLoading(false);

        if (errorData.hasActiveBooking) {
          setActiveBookingDetails(errorData.activeBooking);
          setShowActiveBookingDialog(true);
          return;
        }

        setError(errorData.error || 'Failed to create booking');
        return;
      }

      setShowSuccessDialog(true);

    } catch (err) {
      console.error('Error confirming booking:', err);
      setError(err.message || 'Failed to confirm booking');
    } finally {
      setLoading(false);
    }
  };

  const changeMonth = (offset) => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
    setCurrentMonth(newMonth);
  };

  const canContinue = () => {
    if (currentStep === 1) return selectedDate !== null;
    if (currentStep === 2) return selectedTime !== null;
    return true;
  };

  return (
    <div className="booking-page">
      <Navbar />

      <div className="booking-container">
        {error && (
          <div style={{
            padding: '12px',
            marginBottom: '20px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '8px',
            border: '1px solid #fcc'
          }}>
            {error}
          </div>
        )}

        <div className="booking-header">
          <h1 className="booking-title">Book Kitchen</h1>
          <p className="booking-subtitle">Reserve your cooking time in a few simple steps</p>
        </div>

        {/* Progress Stepper */}
        <div className="progress-stepper">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep >= step.number;
            const isCurrent = currentStep === step.number;

            return (
              <React.Fragment key={step.number}>
                <div className="progress-step">
                  <div className={`progress-circle ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}>
                    <StepIcon className="icon" />
                  </div>
                  <span className={`progress-label ${isActive ? 'active' : ''}`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`progress-line ${currentStep > step.number ? 'active' : ''}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="booking-content-card">
          {loading && <LoadingSpinner text="Loading availability..." />}

          {!loading && (
            <>
              {/* Step 1: Date Selection */}
              {currentStep === 1 && (
                <div className="step-content">
                  <div className="step-header">
                    <Calendar className="step-icon" />
                    <h2 className="step-title">Select a Date</h2>
                  </div>

                  <div className="calendar-wrapper">
                    <div className="calendar-header">
                      <button onClick={() => changeMonth(-1)} className="calendar-nav-btn">
                        <ArrowLeft className="icon" />
                      </button>
                      <h3 className="calendar-month">
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h3>
                      <button onClick={() => changeMonth(1)} className="calendar-nav-btn">
                        <ArrowRight className="icon" />
                      </button>
                    </div>

                    <div className="calendar-grid">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="calendar-day-header">{day}</div>
                      ))}
                      {getDaysInMonth().map((day, index) => {
                        if (!day) return <div key={`empty-${index}`} className="calendar-day-empty" />;

                        const availability = dateAvailability[day];
                        const isSelected = selectedDate?.getDate() === day;
                        const isPast = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) < new Date().setHours(0, 0, 0, 0);

                        let className = 'calendar-day';
                        if (isPast) className += ' past';
                        else if (availability === 'past') className += ' past';
                        else if (isSelected) className += ' selected';
                        else if (availability === 'available') className += ' available';
                        else if (availability === 'filling') className += ' filling';
                        else if (availability === 'full') className += ' full';

                        return (
                          <button
                            key={day}
                            onClick={() => handleDateSelect(day)}
                            disabled={isPast || availability === 'full' || availability === 'past'}
                            className={className}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>

                    <div className="calendar-legend">
                      <div className="legend-item">
                        <div className="legend-color available"></div>
                        <span>Available</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color filling"></div>
                        <span>Filling Fast</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color full"></div>
                        <span>Fully Booked</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Time Selection */}
              {currentStep === 2 && (
                <div className="step-content">
                  <div className="step-header">
                    <Clock className="step-icon" />
                    <h2 className="step-title">Choose Your Time Slot</h2>
                  </div>
                  <p className="step-description">
                    Selected date: {selectedDate?.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>

                  <div className="timeslots-grid">
                    {timeSlots.map(slot => (
                      <button
                        key={slot.id}
                        onClick={() => handleTimeSelect(slot)}
                        disabled={!slot.available}
                        className={`timeslot-card ${selectedTime?.id === slot.id ? 'selected' : ''} ${!slot.available ? 'disabled' : ''}`}
                      >
                        <Clock className="timeslot-icon" />
                        <span className="timeslot-time">{slot.time}</span>
                        {slot.available && (
                          <span className="timeslot-status available">
                            <span className="status-dot"></span>
                            Available
                          </span>
                        )}
                        {!slot.available && slot.booked && (
                          <span className="timeslot-status booked">Booked</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Companions */}
              {currentStep === 3 && (
                <div className="step-content">
                  <div className="step-header">
                    <Users className="step-icon" />
                    <h2 className="step-title">Add Companions</h2>
                  </div>
                  <p className="step-description">
                    Add details of people who will be using the kitchen with you.
                    <strong> Both fields are required if adding a companion.</strong> You can skip this entirely if cooking alone.
                  </p>

                  <div className="companions-container">
                    {companions.map((companion, index) => {
                      const hasName = companion.name.trim().length > 0;
                      const hasRegNo = companion.registrationNumber.trim().length > 0;
                      const isIncomplete = (hasName && !hasRegNo) || (hasRegNo && !hasName);

                      return (
                        <div key={index} className="companion-card" style={{
                          border: isIncomplete ? '2px solid #ef4444' : '1px solid #e5e7eb'
                        }}>
                          <div className="companion-header">
                            <span className="companion-number">Companion {index + 1}</span>
                            {companions.length > 1 && (
                              <button
                                onClick={() => removeCompanion(index)}
                                className="remove-companion-btn"
                                type="button"
                              >
                                <X size={18} />
                              </button>
                            )}
                          </div>
                          <div className="companion-inputs">
                            <input
                              type="text"
                              placeholder="Name *"
                              value={companion.name}
                              onChange={(e) => updateCompanion(index, 'name', e.target.value)}
                              className="companion-input"
                              style={{
                                borderColor: hasName || (!hasName && !hasRegNo) ? '#e5e7eb' : '#ef4444'
                              }}
                            />
                            <input
                              type="text"
                              placeholder="Registration Number *"
                              value={companion.registrationNumber}
                              onChange={(e) => updateCompanion(index, 'registrationNumber', e.target.value)}
                              className="companion-input"
                              style={{
                                borderColor: hasRegNo || (!hasName && !hasRegNo) ? '#e5e7eb' : '#ef4444'
                              }}
                            />
                          </div>
                          {isIncomplete && (
                            <div style={{
                              marginTop: '8px',
                              padding: '8px 12px',
                              backgroundColor: '#fee2e2',
                              borderRadius: '6px',
                              fontSize: '14px',
                              color: '#dc2626'
                            }}>
                              ⚠️ Both fields are required when adding a companion
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <button onClick={addCompanion} className="add-companion-btn" type="button">
                      <Plus size={20} />
                      <span>Add Another Companion</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Equipment Selection */}
              {currentStep === 4 && (
                <div className="step-content">
                  <div className="step-header">
                    <ChefHat className="step-icon" />
                    <h2 className="step-title">What Equipment Will You Use?</h2>
                  </div>
                  <p className="step-description">
                    Select the equipment you plan to use (helps us track maintenance needs)
                  </p>

                  <div className="equipment-grid">
                    {equipment.map(item => (
                      <button
                        key={item.id}
                        onClick={() => toggleEquipment(item.id)}
                        className={`equipment-card ${selectedEquipment.includes(item.id) ? 'selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedEquipment.includes(item.id)}
                          onChange={() => { }}
                          className="equipment-checkbox"
                        />
                        <span className="equipment-name">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Confirmation */}
              {currentStep === 5 && (
                <div className="step-content">
                  <div className="step-header">
                    <CheckCircle className="step-icon" />
                    <h2 className="step-title">Confirm Your Booking</h2>
                  </div>

                  <div className="confirmation-details">
                    <div className="detail-item">
                      <Calendar className="detail-icon" />
                      <div className="detail-content">
                        <div className="detail-label">Date</div>
                        <div className="detail-value">
                          {selectedDate?.toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="detail-item">
                      <Clock className="detail-icon" />
                      <div className="detail-content">
                        <div className="detail-label">Time Slot</div>
                        <div className="detail-value">{selectedTime?.time}</div>
                      </div>
                    </div>

                    <div className="detail-item">
                      <Users className="detail-icon" />
                      <div className="detail-content">
                        <div className="detail-label">Companions</div>
                        <div className="detail-value">
                          {companions.filter(c => c.name.trim() || c.registrationNumber.trim()).length === 0
                            ? 'None'
                            : companions
                              .filter(c => c.name.trim() || c.registrationNumber.trim())
                              .map((c, i) => (
                                <div key={i} style={{ marginBottom: '4px' }}>
                                  {c.name || 'Companion ' + (i + 1)}
                                  {c.registrationNumber && ` (${c.registrationNumber})`}
                                </div>
                              ))}
                        </div>
                      </div>
                    </div>

                    <div className="detail-item">
                      <ChefHat className="detail-icon" />
                      <div className="detail-content">
                        <div className="detail-label">Equipment</div>
                        <div className="detail-value">
                          {selectedEquipment.length > 0
                            ? equipment.filter(e => selectedEquipment.includes(e.id)).map(e => e.name).join(', ')
                            : 'None selected'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="booking-actions">
          <button
            onClick={handleBack}
            className={`action-btn back ${currentStep === 1 ? 'hidden' : ''}`}
            disabled={loading}
          >
            <ArrowLeft className="icon" />
            Back
          </button>

          <button
            onClick={handleContinue}
            disabled={!canContinue() || loading}
            className="action-btn continue"
          >
            {loading ? 'Processing...' : (currentStep === 5 ? 'Confirm Booking' : 'Continue')}
            <ArrowRight className="icon" />
          </button>
        </div>
      </div>

      <Footer />

      {/* Success Dialog */}
      {showSuccessDialog && (
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
            <CheckCircle size={64} color="#10b981" style={{ marginBottom: '16px' }} />
            <h2 style={{ margin: '0 0 12px 0', fontSize: '24px', color: '#1a202c' }}>
              Booking Confirmed!
            </h2>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>
              Your kitchen slot has been successfully booked.
            </p>
            <button
              onClick={() => navigate('/client/clientbookings')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              View My Bookings
            </button>
          </div>
        </div>
      )}

      {/* Active Booking Dialog */}
      {showActiveBookingDialog && activeBookingDetails && (
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
            maxWidth: '450px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Calendar size={32} color="#dc2626" />
            </div>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '24px', color: '#1a202c' }}>
              Active Booking Exists
            </h2>
            <p style={{ color: '#64748b', marginBottom: '20px', lineHeight: '1.6' }}>
              You already have an active booking on{' '}
              <strong style={{ color: '#1a202c' }}>
                {new Date(activeBookingDetails.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </strong>
              {' '}at{' '}
              <strong style={{ color: '#1a202c' }}>{activeBookingDetails.timeSlot}</strong>.
            </p>
            <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>
              Please wait for it to complete or cancel it before making a new booking.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setShowActiveBookingDialog(false);
                  navigate('/client/clientbookings');
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                View My Bookings
              </button>
              <button
                onClick={() => setShowActiveBookingDialog(false)}
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
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;