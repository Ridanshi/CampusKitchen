import React, { useState } from 'react';
import './Guidelines.css';
import Navbar from './Navbar';
import Footer from './Footer';

const Guidelines = () => {
    const [activeTab, setActiveTab] = useState('kitchen');

    return (
        <div className="guidelines-container">
            <Navbar />

            <div className="guidelines-content">
                <div className="guidelines-header">
                    <h1 className="page-title">Guidelines</h1>
                    <p className="page-subtitle">Everything you need to know about using our campus kitchen</p>
                </div>

                <div className="guidelines-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'kitchen' ? 'active' : ''}`}
                        onClick={() => setActiveTab('kitchen')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
                            <path d="M7 2v20"/>
                            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
                        </svg>
                        Kitchen Usage
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'website' ? 'active' : ''}`}
                        onClick={() => setActiveTab('website')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                            <line x1="8" y1="21" x2="16" y2="21"/>
                            <line x1="12" y1="17" x2="12" y2="21"/>
                        </svg>
                        Website Guide
                    </button>
                </div>

                {activeTab === 'kitchen' ? (
                    <div className="guidelines-section">
                        {/* Kitchen Rules */}
                        <div className="guideline-card">
                            <div className="card-header">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                </svg>
                                <h2>Kitchen Rules</h2>
                            </div>
                            <div className="guideline-list">
                                <div className="guideline-item">
                                    <div className="item-number">1</div>
                                    <div className="item-content">
                                        <h3>Book in Advance</h3>
                                        <p>Always book your time slot at least 2 hours before use. Walk-ins are not permitted.</p>
                                    </div>
                                </div>
                                <div className="guideline-item">
                                    <div className="item-number">2</div>
                                    <div className="item-content">
                                        <h3>Arrive On Time</h3>
                                        <p>Please arrive within 15 minutes of your booking start time. Late arrivals may forfeit their slot.</p>
                                    </div>
                                </div>
                                <div className="guideline-item">
                                    <div className="item-number">3</div>
                                    <div className="item-content">
                                        <h3>One Booking Per Day</h3>
                                        <p>Students can book only one time slot per day to ensure fair access for everyone.</p>
                                    </div>
                                </div>
                                <div className="guideline-item">
                                    <div className="item-number">4</div>
                                    <div className="item-content">
                                        <h3>Bring Your Own Supplies</h3>
                                        <p>You must bring all ingredients, spices, and consumables. Only cooking equipment is provided.</p>
                                    </div>
                                </div>
                                <div className="guideline-item">
                                    <div className="item-number">5</div>
                                    <div className="item-content">
                                        <h3>No Food Storage</h3>
                                        <p>Kitchen does not have storage facilities. Take all your food and belongings with you.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Safety Guidelines */}
                        <div className="guideline-card">
                            <div className="card-header">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="12" y1="8" x2="12" y2="12"/>
                                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                                <h2>Safety Guidelines</h2>
                            </div>
                            <div className="guideline-list">
                                <div className="guideline-item">
                                    <div className="item-icon safety">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                            <path d="M2 17l10 5 10-5"/>
                                            <path d="M2 12l10 5 10-5"/>
                                        </svg>
                                    </div>
                                    <div className="item-content">
                                        <p>Never leave cooking unattended, especially when using stoves or ovens</p>
                                    </div>
                                </div>
                                <div className="guideline-item">
                                    <div className="item-icon safety">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                            <path d="M2 17l10 5 10-5"/>
                                            <path d="M2 12l10 5 10-5"/>
                                        </svg>
                                    </div>
                                    <div className="item-content">
                                        <p>Use oven mitts when handling hot cookware and keep pot handles turned inward</p>
                                    </div>
                                </div>
                                <div className="guideline-item">
                                    <div className="item-icon safety">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                            <path d="M2 17l10 5 10-5"/>
                                            <path d="M2 12l10 5 10-5"/>
                                        </svg>
                                    </div>
                                    <div className="item-content">
                                        <p>Know the location of fire extinguishers and first aid kit (marked clearly in kitchen)</p>
                                    </div>
                                </div>
                                <div className="guideline-item">
                                    <div className="item-icon safety">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                            <path d="M2 17l10 5 10-5"/>
                                            <path d="M2 12l10 5 10-5"/>
                                        </svg>
                                    </div>
                                    <div className="item-content">
                                        <p>Report any equipment malfunction or safety hazards immediately</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cleanup Requirements */}
                        <div className="guideline-card">
                            <div className="card-header">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 11l3 3L22 4"/>
                                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                                </svg>
                                <h2>Cleanup Requirements</h2>
                            </div>
                            <div className="cleanup-requirements">
                                <div className="requirement-item">
                                    <div className="requirement-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 11l3 3L22 4"/>
                                        </svg>
                                    </div>
                                    <span>Wash all dishes, utensils, and cookware used</span>
                                </div>
                                <div className="requirement-item">
                                    <div className="requirement-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 11l3 3L22 4"/>
                                        </svg>
                                    </div>
                                    <span>Wipe down all countertops and surfaces</span>
                                </div>
                                <div className="requirement-item">
                                    <div className="requirement-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 11l3 3L22 4"/>
                                        </svg>
                                    </div>
                                    <span>Clean stove, oven, and any appliances used</span>
                                </div>
                                <div className="requirement-item">
                                    <div className="requirement-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 11l3 3L22 4"/>
                                        </svg>
                                    </div>
                                    <span>Sweep the floor and dispose of any spills</span>
                                </div>
                                {/* <div className="requirement-item">
                                    <div className="requirement-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 11l3 3L22 4"/>
                                        </svg>
                                    </div>
                                    <span>Take out trash if bins are full</span>
                                </div> */}
                                <div className="requirement-item">
                                    <div className="requirement-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 11l3 3L22 4"/>
                                        </svg>
                                    </div>
                                    <span>Return all equipment to designated storage areas</span>
                                </div>
                            </div>
                            <div className="cleanup-note">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="17 8 12 3 7 8"/>
                                    <line x1="12" y1="3" x2="12" y2="15"/>
                                </svg>
                                <p><strong>Upload a photo</strong> of the clean kitchen before leaving. This is mandatory to complete your booking.</p>
                            </div>
                        </div>

                        {/* Equipment Available */}
                        <div className="guideline-card">
                            <div className="card-header">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                    <line x1="9" y1="9" x2="15" y2="15"/>
                                    <line x1="15" y1="9" x2="9" y2="15"/>
                                </svg>
                                <h2>Available Equipment</h2>
                            </div>
                            <div className="equipment-grid">
                                <div className="equipment-item">
                                    <h4>Cooking</h4>
                                    <ul>
                                        <li>Gas stove (4 burners)</li>
                                        <li>Electric oven</li>
                                        <li>Microwave</li>
                                        <li>Induction cooktop</li>
                                    </ul>
                                </div>
                                <div className="equipment-item">
                                    <h4>Cookware</h4>
                                    <ul>
                                        <li>Pots and pans (various sizes)</li>
                                        <li>Baking trays</li>
                                        <li>Mixing bowls</li>
                                        <li>Pressure cooker</li>
                                    </ul>
                                </div>
                                <div className="equipment-item">
                                    <h4>Utensils</h4>
                                    <ul>
                                        <li>Knives and cutting boards</li>
                                        <li>Spatulas and ladles</li>
                                        <li>Measuring cups/spoons</li>
                                        <li>Serving utensils</li>
                                    </ul>
                                </div>
                                <div className="equipment-item">
                                    <h4>Appliances</h4>
                                    <ul>
                                        <li>Blender/mixer</li>
                                        <li>Toaster</li>
                                        <li>Electric kettle</li>
                                        <li>Rice cooker</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="guidelines-section">
                        {/* How to Book */}
                        <div className="guideline-card">
                            <div className="card-header">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                    <line x1="16" y1="2" x2="16" y2="6"/>
                                    <line x1="8" y1="2" x2="8" y2="6"/>
                                    <line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                                <h2>How to Book Kitchen</h2>
                            </div>
                            <div className="step-by-step">
                                <div className="step-item">
                                    <div className="step-number">1</div>
                                    <div className="step-content">
                                        <h3>Select Date</h3>
                                        <p>Go to "Book Kitchen" and choose your preferred date from the calendar. Green dates have availability.</p>
                                    </div>
                                </div>
                                <div className="step-item">
                                    <div className="step-number">2</div>
                                    <div className="step-content">
                                        <h3>Choose Time Slot</h3>
                                        <p>Select an available time slot (1-hour duration). Available slots are shown in white, booked slots in gray.</p>
                                    </div>
                                </div>
                                <div className="step-item">
                                    <div className="step-number">3</div>
                                    <div className="step-content">
                                        <h3>Select Equipment (Optional)</h3>
                                        <p>Choose any special equipment you need. All basic cookware is always available.</p>
                                    </div>
                                </div>
                                <div className="step-item">
                                    <div className="step-number">4</div>
                                    <div className="step-content">
                                        <h3>Confirm Booking</h3>
                                        <p>Review your details and click "Confirm Booking". You'll receive a confirmation message.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Managing Bookings */}
                        <div className="guideline-card">
                            <div className="card-header">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                    <line x1="16" y1="13" x2="8" y2="13"/>
                                    <line x1="16" y1="17" x2="8" y2="17"/>
                                    <polyline points="10 9 9 9 8 9"/>
                                </svg>
                                <h2>Managing Your Bookings</h2>
                            </div>
                            <div className="guideline-list">
                                <div className="guideline-item">
                                    <div className="item-icon website">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"/>
                                            <polyline points="12 6 12 12 16 14"/>
                                        </svg>
                                    </div>
                                    <div className="item-content">
                                        <h3>View Bookings</h3>
                                        <p>Go to "My Bookings" to see all upcoming and past bookings with their status.</p>
                                    </div>
                                </div>
                                <div className="guideline-item">
                                    <div className="item-icon website">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"/>
                                            <line x1="15" y1="9" x2="9" y2="15"/>
                                            <line x1="9" y1="9" x2="15" y2="15"/>
                                        </svg>
                                    </div>
                                    <div className="item-content">
                                        <h3>Cancel Booking</h3>
                                        <p>Cancel bookings at least 2 hours in advance from the "My Bookings" page.</p>
                                    </div>
                                </div>
                                <div className="guideline-item">
                                    <div className="item-icon website">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                        </svg>
                                    </div>
                                    <div className="item-content">
                                        <h3>Booking Restrictions</h3>
                                        <p>One active booking per day. You can book again after completing your current booking.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Photo Upload Guide */}
                        <div className="guideline-card">
                            <div className="card-header">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                    <circle cx="8.5" cy="8.5" r="1.5"/>
                                    <polyline points="21 15 16 10 5 21"/>
                                </svg>
                                <h2>Uploading Cleanup Photos</h2>
                            </div>
                            <div className="step-by-step">
                                <div className="step-item">
                                    <div className="step-number">1</div>
                                    <div className="step-content">
                                        <h3>During Your Booking</h3>
                                        <p>The upload feature becomes active during your booked time slot and remains active for 30 minutes after.</p>
                                    </div>
                                </div>
                                <div className="step-item">
                                    <div className="step-number">2</div>
                                    <div className="step-content">
                                        <h3>Clean the Kitchen</h3>
                                        <p>Follow the cleanup checklist. Make sure the kitchen is in the same condition as you found it.</p>
                                    </div>
                                </div>
                                <div className="step-item">
                                    <div className="step-number">3</div>
                                    <div className="step-content">
                                        <h3>Take Photo</h3>
                                        <p>Take a clear photo showing the clean kitchen. Multiple photos can be uploaded if needed.</p>
                                    </div>
                                </div>
                                <div className="step-item">
                                    <div className="step-number">4</div>
                                    <div className="step-content">
                                        <h3>Upload & Complete</h3>
                                        <p>Go to "Cleanup Photos", click Upload, and submit your photo. Your booking is now complete!</p>
                                    </div>
                                </div>
                            </div>
                            <div className="info-box">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="12" y1="16" x2="12" y2="12"/>
                                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                                </svg>
                                <p>Photos can be deleted or replaced within 30 minutes of upload. After that, they're permanently saved.</p>
                            </div>
                        </div>

                        {/* Complaints */}
                        <div className="guideline-card">
                            <div className="card-header">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                    <line x1="12" y1="9" x2="12" y2="13"/>
                                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                                </svg>
                                <h2>Reporting Issues</h2>
                            </div>
                            <div className="guideline-list">
                                <div className="guideline-item">
                                    <div className="item-content">
                                        <h3>When to Report</h3>
                                        <p>Report cleanliness issues, equipment malfunctions, safety concerns, or any violations of kitchen rules.</p>
                                    </div>
                                </div>
                                <div className="guideline-item">
                                    <div className="item-content">
                                        <h3>How to Report</h3>
                                        <p>Go to "Complaints", fill in the details, select urgency level, and attach photos if applicable. Admin will review promptly.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Management */}
                        <div className="guideline-card">
                            <div className="card-header">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                                <h2>Account Management</h2>
                            </div>
                            <div className="guideline-list">
                                <div className="guideline-item">
                                    <div className="item-content">
                                        <h3>Profile Settings</h3>
                                        <p>Click your name in the top-right corner to update your profile information and change password.</p>
                                    </div>
                                </div>
                                <div className="guideline-item">
                                    <div className="item-content">
                                        <h3>Student ID Management</h3>
                                        <p>You can update your Student ID from your profile settings. Click your name in the top-right corner to access profile settings.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default Guidelines;