import React, { useState } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import { Modal } from '../common/Modal';
import {
  DropletIcon,
  HeartIcon,
  MapPinIcon,
  SearchIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  ShieldIcon,
  ClockIcon
} from '../common/Icons';
import {
  getCompatibleDonorGroups,
  BLOOD_COMPATIBILITY_MAP
} from '../../utils/bloodCompatibility';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const CONTACT_PREFERENCES = ['Health Wallet In-App', 'Phone Call / SMS', 'Email'];
const URGENCY_LEVELS = ['Emergency', 'Urgent', 'Normal'];

export const BloodDonationPage = () => {
  const {
    user,
    donorProfile,
    bloodRequests = [],
    registerBloodDonor,
    updateDonorAvailability,
    createBloodRequest,
    requestDonor,
    cancelBloodRequest,
    findCompatibleDonors
  } = useHealthWallet();

  // Active top tab: 'find' | 'register' | 'requests'
  const [activeTab, setActiveTab] = useState('find');

  // Search / Request Blood form state
  const [patientName, setPatientName] = useState(user?.fullName || 'Vijay');
  const [bloodGroupRequired, setBloodGroupRequired] = useState(user?.bloodGroup || 'O+');
  const [unitsRequired, setUnitsRequired] = useState(2);
  const [locationQuery, setLocationQuery] = useState('Karur');
  const [urgency, setUrgency] = useState('Urgent');
  const [additionalNote, setAdditionalNote] = useState('');
  const [hasSearched, setHasSearched] = useState(true);

  // Modal states
  const [requestModalDonor, setRequestModalDonor] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Donor Registration form state
  const [regName, setRegName] = useState(donorProfile?.name || user?.fullName || 'Vijay');
  const [regBloodGroup, setRegBloodGroup] = useState(donorProfile?.bloodGroup || user?.bloodGroup || 'O+');
  const [regLocation, setRegLocation] = useState(donorProfile?.location || 'Chennai');
  const [regAvailability, setRegAvailability] = useState(donorProfile?.availability || 'Available');
  const [regContactPref, setRegContactPref] = useState(donorProfile?.contactPreference || 'Health Wallet In-App');

  // Matching Donors calculation
  const compatibleDonors = hasSearched
    ? findCompatibleDonors(bloodGroupRequired, locationQuery)
    : [];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setHasSearched(true);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    registerBloodDonor({
      name: regName,
      bloodGroup: regBloodGroup,
      location: regLocation,
      availability: regAvailability,
      contactPreference: regContactPref
    });
    setIsEditingProfile(false);
  };

  const handleConfirmDonorRequest = () => {
    if (!requestModalDonor) return;

    // Create a persistent blood request if one doesn't exist for this patient/group
    const newReq = createBloodRequest({
      patientName: patientName || 'Patient',
      bloodGroupRequired,
      unitsRequired,
      location: locationQuery,
      urgency,
      additionalNote: additionalNote || `Request prepared for donor ${requestModalDonor.name}`
    });

    // Mark donor as requested on the new blood request
    requestDonor(newReq.id, requestModalDonor);
    setRequestModalDonor(null);
  };

  // Helper for urgency badge styling
  const getUrgencyBadge = (level) => {
    switch (level) {
      case 'Emergency':
        return {
          bg: 'var(--hw-danger-light, #fef2f2)',
          color: 'var(--hw-danger, #dc2626)',
          border: '1px solid var(--hw-danger-border, #fecaca)'
        };
      case 'Urgent':
        return {
          bg: 'var(--hw-warning-light, #fffbeb)',
          color: 'var(--hw-warning-hover, #d97706)',
          border: '1px solid var(--hw-warning-border, #fde68a)'
        };
      default:
        return {
          bg: '#f1f5f9',
          color: '#475569',
          border: '1px solid #cbd5e1'
        };
    }
  };

  // Helper for status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open':
        return { bg: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' };
      case 'Donor Requested':
        return { bg: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' };
      case 'Matched':
        return { bg: '#f3e8ff', color: '#7e22ce', border: '1px solid #e9d5ff' };
      case 'Closed':
        return { bg: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1' };
      case 'Cancelled':
        return { bg: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' };
      default:
        return { bg: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1' };
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* 1. Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 4px 0' }}>
          Blood Donation
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--hw-text-muted)', margin: 0 }}>
          Help connect compatible blood donors with people who need urgent support.
        </p>
      </div>

      {/* 2. Primary Navigation Tabs */}
      <div className="hw-tabs" style={{ marginBottom: '24px' }}>
        <button
          type="button"
          className={`hw-tab-btn ${activeTab === 'find' ? 'active' : ''}`}
          onClick={() => setActiveTab('find')}
        >
          <DropletIcon size={16} style={{ marginRight: '6px' }} />
          <span>Find Blood Donors</span>
        </button>
        <button
          type="button"
          className={`hw-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => setActiveTab('register')}
        >
          <HeartIcon size={16} style={{ marginRight: '6px' }} />
          <span>Register as Donor</span>
        </button>
        <button
          type="button"
          className={`hw-tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <ClockIcon size={16} style={{ marginRight: '6px' }} />
          <span>My Blood Requests ({bloodRequests.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: FIND BLOOD DONORS & REQUEST BLOOD WORKFLOW                        */}
      {/* ========================================================================= */}
      {activeTab === 'find' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Create Blood Request / Search Criteria Form */}
          <div className="hw-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 4px 0' }}>
                  Request Blood & Search Donors
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0 }}>
                  Enter recipient medical details to filter available compatible donors.
                </p>
              </div>

              {/* Simplified RBC Model Pill */}
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: 'var(--hw-primary-light, #eef5fc)',
                  color: 'var(--hw-primary, #1e56a0)',
                  border: '1px solid var(--hw-primary-border, #bfdbfe)'
                }}
              >
                Prototype RBC Compatibility Model
              </div>
            </div>

            <form onSubmit={handleSearchSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                {/* Patient Name */}
                <div className="hw-form-group">
                  <label className="hw-label hw-label-required">Patient Name</label>
                  <input
                    type="text"
                    className="hw-input"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Full name of recipient"
                    required
                  />
                </div>

                {/* Blood Group Required */}
                <div className="hw-form-group">
                  <label className="hw-label hw-label-required">Blood Group Required</label>
                  <select
                    className="hw-select"
                    value={bloodGroupRequired}
                    onChange={(e) => setBloodGroupRequired(e.target.value)}
                    required
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                {/* Units Required */}
                <div className="hw-form-group">
                  <label className="hw-label hw-label-required">Units Required</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="hw-input"
                    value={unitsRequired}
                    onChange={(e) => setUnitsRequired(Number(e.target.value))}
                    required
                  />
                </div>

                {/* Location / City */}
                <div className="hw-form-group">
                  <label className="hw-label hw-label-required">Location / City</label>
                  <input
                    type="text"
                    className="hw-input"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="e.g. Karur, Chennai"
                    required
                  />
                </div>

                {/* Urgency */}
                <div className="hw-form-group">
                  <label className="hw-label hw-label-required">Urgency</label>
                  <select
                    className="hw-select"
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                  >
                    {URGENCY_LEVELS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                {/* Additional Note */}
                <div className="hw-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="hw-label">Additional Note (Hospital / Contact details)</label>
                  <input
                    type="text"
                    className="hw-input"
                    value={additionalNote}
                    onChange={(e) => setAdditionalNote(e.target.value)}
                    placeholder="e.g. Apollo Speciality Hospital, Blood Bank counters"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)' }}>
                  Compatible donor groups for <strong>{bloodGroupRequired}</strong>: {' '}
                  {getCompatibleDonorGroups(bloodGroupRequired).join(', ')}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="submit"
                    className="hw-btn hw-btn-primary"
                    style={{ padding: '8px 24px' }}
                  >
                    <SearchIcon size={16} style={{ marginRight: '6px' }} />
                    Find Compatible Donors
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Results Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 2px 0' }}>
                  Compatible Donors ({compatibleDonors.length})
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0 }}>
                  Filtered by red-blood-cell compatibility &amp; availability. Ranked by location match.
                </p>
              </div>

              {locationQuery && (
                <span style={{ fontSize: '12px', color: 'var(--hw-text-muted)' }}>
                  Prioritizing city: <strong>{locationQuery}</strong>
                </span>
              )}
            </div>

            {/* Empty State: No compatible donors */}
            {compatibleDonors.length === 0 ? (
              <div
                className="hw-card"
                style={{
                  padding: '40px 24px',
                  textAlign: 'center',
                  background: '#ffffff',
                  border: '1px solid var(--hw-border)',
                  borderRadius: '12px'
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: '#f1f5f9',
                    color: '#64748b',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px'
                  }}
                >
                  <DropletIcon size={24} />
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--hw-text-main)', margin: '0 0 6px 0' }}>
                  No compatible donors found.
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0, maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
                  Try expanding the location or checking again later.
                </p>
              </div>
            ) : (
              /* Donor Cards Grid */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {compatibleDonors.map((donor) => {
                  const isExactLocation = locationQuery && donor.location?.toLowerCase().includes(locationQuery.toLowerCase());
                  const isExactGroup = donor.bloodGroup === bloodGroupRequired;

                  return (
                    <div
                      key={donor.id}
                      className="hw-card"
                      style={{
                        padding: '20px',
                        border: '1px solid var(--hw-border)',
                        borderRadius: '12px',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '16px'
                      }}
                    >
                      <div>
                        {/* Header: Name + Blood Group Pill */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div
                              style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '50%',
                                background: 'var(--hw-primary-light, #eef5fc)',
                                color: 'var(--hw-primary, #1e56a0)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '15px',
                                flexShrink: 0
                              }}
                            >
                              {donor.name.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--hw-text-main)' }}>
                                {donor.name}
                              </div>
                              {donor.isDemo && (
                                <span
                                  style={{
                                    fontSize: '10px',
                                    fontWeight: 600,
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    background: '#f1f5f9',
                                    color: '#64748b'
                                  }}
                                >
                                  Development Demo Donor
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Blood Group Pill */}
                          <div
                            style={{
                              background: '#fee2e2',
                              color: '#dc2626',
                              fontWeight: 700,
                              fontSize: '14px',
                              padding: '4px 10px',
                              borderRadius: '8px',
                              border: '1px solid #fecaca'
                            }}
                          >
                            {donor.bloodGroup}
                          </div>
                        </div>

                        {/* Donor Attributes List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--hw-text-body)' }}>
                          {/* Location */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPinIcon size={15} style={{ color: 'var(--hw-text-muted)' }} />
                            <span><strong>Location:</strong> {donor.location}</span>
                            {isExactLocation && (
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 600,
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  background: '#dcfce7',
                                  color: '#15803d'
                                }}
                              >
                                City Match
                              </span>
                            )}
                          </div>

                          {/* Availability */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: donor.availability === 'Available' ? '#10b981' : '#94a3b8'
                              }}
                            />
                            <span><strong>Availability:</strong> {donor.availability}</span>
                          </div>

                          {/* Compatibility Badge */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CheckCircleIcon size={15} style={{ color: '#059669' }} />
                            <span><strong>Match:</strong></span>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                padding: '2px 8px',
                                borderRadius: '6px',
                                background: '#ecfdf5',
                                color: '#047857',
                                border: '1px solid #a7f3d0'
                              }}
                            >
                              {isExactGroup ? 'Exact Group Compatible' : 'Compatible (RBC Model)'}
                            </span>
                          </div>

                          {/* Contact Preference */}
                          <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)', marginTop: '4px' }}>
                            Contact preference: <strong>{donor.contactPreference || 'Health Wallet In-App'}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Request Donor Button */}
                      <div>
                        <button
                          type="button"
                          className="hw-btn hw-btn-primary"
                          style={{ width: '100%', justifyContent: 'center' }}
                          onClick={() => setRequestModalDonor(donor)}
                        >
                          Request Donor
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: REGISTER AS DONOR & MANAGE DONOR STATUS                           */}
      {/* ========================================================================= */}
      {activeTab === 'register' && (
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* If Registered and not actively editing: Display Registered Donor Profile Card */}
          {donorProfile && !isEditingProfile ? (
            <div className="hw-card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: donorProfile.availability === 'Available' ? '#ecfdf5' : '#f1f5f9',
                      color: donorProfile.availability === 'Available' ? '#059669' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '20px'
                    }}
                  >
                    {donorProfile.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--hw-text-main)', margin: 0 }}>
                        {donorProfile.name}
                      </h2>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: donorProfile.availability === 'Available' ? '#ecfdf5' : '#fef2f2',
                          color: donorProfile.availability === 'Available' ? '#047857' : '#b91c1c',
                          border: `1px solid ${donorProfile.availability === 'Available' ? '#a7f3d0' : '#fecaca'}`
                        }}
                      >
                        {donorProfile.availability}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: '4px 0 0 0' }}>
                      Voluntary Donor • Registered {donorProfile.registeredAt}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    background: '#fee2e2',
                    color: '#dc2626',
                    fontWeight: 700,
                    fontSize: '18px',
                    padding: '6px 16px',
                    borderRadius: '10px',
                    border: '1px solid #fecaca'
                  }}
                >
                  {donorProfile.bloodGroup}
                </div>
              </div>

              {/* Profile Details Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  padding: '16px',
                  background: '#f8fafc',
                  borderRadius: '10px',
                  marginBottom: '24px'
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)' }}>Location / City</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--hw-text-main)', marginTop: '2px' }}>
                    {donorProfile.location}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)' }}>Contact Preference</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--hw-text-main)', marginTop: '2px' }}>
                    {donorProfile.contactPreference}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)' }}>Can Donate RBCs To</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--hw-text-main)', marginTop: '2px' }}>
                    {(BLOOD_COMPATIBILITY_MAP[donorProfile.bloodGroup] || []).join(', ')}
                  </div>
                </div>
              </div>

              {/* Donor Status Toggle & Actions (Requirement 9) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', paddingTop: '16px', borderTop: '1px solid var(--hw-border)' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--hw-text-main)' }}>
                    Donation Availability Status
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)' }}>
                    {donorProfile.availability === 'Available'
                      ? 'You are active in donor matching searches.'
                      : 'You are hidden from donor matching results while unavailable.'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  {donorProfile.availability === 'Available' ? (
                    <button
                      type="button"
                      className="hw-btn hw-btn-secondary"
                      onClick={() => updateDonorAvailability('Unavailable')}
                    >
                      Set as Unavailable
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="hw-btn hw-btn-green"
                      onClick={() => updateDonorAvailability('Available')}
                    >
                      Set as Available
                    </button>
                  )}

                  <button
                    type="button"
                    className="hw-btn hw-btn-ghost"
                    onClick={() => {
                      setRegName(donorProfile.name);
                      setRegBloodGroup(donorProfile.bloodGroup);
                      setRegLocation(donorProfile.location);
                      setRegAvailability(donorProfile.availability);
                      setRegContactPref(donorProfile.contactPreference);
                      setIsEditingProfile(true);
                    }}
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Registration Form (or Edit Mode) */
            <div className="hw-card" style={{ padding: '28px' }}>
              {/* Empty state intro if never registered */}
              {!donorProfile && (
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    background: 'var(--hw-primary-light, #eef5fc)',
                    border: '1px solid var(--hw-primary-border, #bfdbfe)',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <HeartIcon size={22} style={{ color: 'var(--hw-primary, #1e56a0)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--hw-text-main)' }}>
                      Register as a donor to help people find compatible blood support.
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)' }}>
                      Voluntary profile saved locally in your Health Wallet. You can toggle availability at any time.
                    </div>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 4px 0' }}>
                  {isEditingProfile ? 'Update Donor Profile' : 'Donor Registration'}
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0 }}>
                  Only necessary contact preference and location details are requested.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  {/* Full Name */}
                  <div className="hw-form-group">
                    <label className="hw-label hw-label-required">Full Name</label>
                    <input
                      type="text"
                      className="hw-input"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Your full name"
                      required
                    />
                  </div>

                  {/* Blood Group */}
                  <div className="hw-form-group">
                    <label className="hw-label hw-label-required">Blood Group</label>
                    <select
                      className="hw-select"
                      value={regBloodGroup}
                      onChange={(e) => setRegBloodGroup(e.target.value)}
                      required
                    >
                      {BLOOD_GROUPS.map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  {/* Location / City */}
                  <div className="hw-form-group">
                    <label className="hw-label hw-label-required">Location / City</label>
                    <input
                      type="text"
                      className="hw-input"
                      value={regLocation}
                      onChange={(e) => setRegLocation(e.target.value)}
                      placeholder="e.g. Chennai, Karur"
                      required
                    />
                  </div>

                  {/* Availability */}
                  <div className="hw-form-group">
                    <label className="hw-label hw-label-required">Availability</label>
                    <select
                      className="hw-select"
                      value={regAvailability}
                      onChange={(e) => setRegAvailability(e.target.value)}
                      required
                    >
                      <option value="Available">Available</option>
                      <option value="Unavailable">Unavailable</option>
                    </select>
                  </div>

                  {/* Contact Preference */}
                  <div className="hw-form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="hw-label hw-label-required">Contact Preference</label>
                    <select
                      className="hw-select"
                      value={regContactPref}
                      onChange={(e) => setRegContactPref(e.target.value)}
                      required
                    >
                      {CONTACT_PREFERENCES.map((cp) => (
                        <option key={cp} value={cp}>{cp}</option>
                      ))}
                    </select>
                    <span style={{ fontSize: '11px', color: 'var(--hw-text-muted)', marginTop: '4px', display: 'block' }}>
                      Privacy notice: Contact details are kept private and only utilized for prepared donor coordination.
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  {isEditingProfile && (
                    <button
                      type="button"
                      className="hw-btn hw-btn-secondary"
                      onClick={() => setIsEditingProfile(false)}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="hw-btn hw-btn-primary"
                    style={{ padding: '8px 24px' }}
                  >
                    {isEditingProfile ? 'Save Changes' : 'Save Donor Profile'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MY BLOOD REQUESTS                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 2px 0' }}>
                My Blood Requests
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0 }}>
                Track active requests and donor matching status.
              </p>
            </div>

            <button
              type="button"
              className="hw-btn hw-btn-primary hw-btn-sm"
              onClick={() => setActiveTab('find')}
            >
              + Create New Request
            </button>
          </div>

          {bloodRequests.length === 0 ? (
            /* Empty State: No blood requests */
            <div
              className="hw-card"
              style={{
                padding: '48px 24px',
                textAlign: 'center',
                background: '#ffffff',
                border: '1px solid var(--hw-border)',
                borderRadius: '12px'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  color: '#64748b',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px'
                }}
              >
                <DropletIcon size={26} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--hw-text-main)', margin: '0 0 6px 0' }}>
                No active blood requests.
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: '0 0 18px 0' }}>
                You have not initiated any blood requirements yet.
              </p>
              <button
                type="button"
                className="hw-btn hw-btn-primary"
                onClick={() => setActiveTab('find')}
              >
                Find Blood Donors
              </button>
            </div>
          ) : (
            /* List of Requests */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {bloodRequests.map((req) => {
                const urgencyStyle = getUrgencyBadge(req.urgency);
                const statusStyle = getStatusBadge(req.status);
                const isOpen = req.status === 'Open' || req.status === 'Donor Requested';

                return (
                  <div
                    key={req.id}
                    className="hw-card"
                    style={{
                      padding: '20px 24px',
                      borderRadius: '12px',
                      border: '1px solid var(--hw-border)',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div
                          style={{
                            background: '#fee2e2',
                            color: '#dc2626',
                            fontWeight: 700,
                            fontSize: '16px',
                            padding: '8px 14px',
                            borderRadius: '10px',
                            border: '1px solid #fecaca'
                          }}
                        >
                          {req.bloodGroupRequired}
                        </div>
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--hw-text-main)' }}>
                            {req.patientName} • {req.unitsRequired} {req.unitsRequired === 1 ? 'Unit' : 'Units'} Needed
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPinIcon size={13} />
                            <span>{req.location}</span>
                            <span>•</span>
                            <ClockIcon size={13} />
                            <span>Created {req.createdAt}</span>
                          </div>
                        </div>
                      </div>

                      {/* Urgency & Status Pills */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '3px 10px',
                            borderRadius: '12px',
                            background: urgencyStyle.bg,
                            color: urgencyStyle.color,
                            border: urgencyStyle.border
                          }}
                        >
                          {req.urgency === 'Emergency' && <AlertTriangleIcon size={12} style={{ marginRight: '4px', verticalAlign: '-1px' }} />}
                          {req.urgency}
                        </span>

                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '3px 10px',
                            borderRadius: '12px',
                            background: statusStyle.bg,
                            color: statusStyle.color,
                            border: statusStyle.border
                          }}
                        >
                          {req.status}
                        </span>
                      </div>
                    </div>

                    {/* Requested Donors and Note */}
                    <div style={{ fontSize: '13px', color: 'var(--hw-text-body)', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', marginBottom: '14px' }}>
                      {req.requestedDonors && req.requestedDonors.length > 0 ? (
                        <div>
                          <strong>Donors Contacted / Prepared:</strong> {req.requestedDonors.join(', ')}
                        </div>
                      ) : (
                        <div>No specific donor requested yet. Available for compatible matching.</div>
                      )}
                      {req.additionalNote && (
                        <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--hw-text-muted)' }}>
                          Note: {req.additionalNote}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      {isOpen && (
                        <button
                          type="button"
                          className="hw-btn hw-btn-danger hw-btn-sm"
                          style={{ padding: '6px 14px' }}
                          onClick={() => cancelBloodRequest(req.id)}
                        >
                          Cancel Request
                        </button>
                      )}
                      <button
                        type="button"
                        className="hw-btn hw-btn-secondary hw-btn-sm"
                        style={{ padding: '6px 14px' }}
                        onClick={() => {
                          setBloodGroupRequired(req.bloodGroupRequired);
                          setLocationQuery(req.location);
                          setPatientName(req.patientName);
                          setUnitsRequired(req.unitsRequired);
                          setActiveTab('find');
                        }}
                      >
                        Search Compatible Donors
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. RED BLOOD CELL COMPATIBILITY REFERENCE (Simplified Model)              */}
      {/* ========================================================================= */}
      <div
        className="hw-card"
        style={{
          marginTop: '32px',
          padding: '20px 24px',
          background: '#ffffff',
          border: '1px solid var(--hw-border)',
          borderRadius: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <ShieldIcon size={18} style={{ color: 'var(--hw-primary, #1e56a0)' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--hw-text-main)', margin: 0 }}>
            Red Blood Cell Compatibility Reference (Simplified Prototype Model)
          </h3>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--hw-text-muted)', margin: '0 0 14px 0' }}>
          Red blood cell donor compatibility used in this simulation engine. O- is the universal donor; AB+ is the universal recipient.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
          {Object.entries(BLOOD_COMPATIBILITY_MAP).map(([donorGroup, recipientList]) => (
            <div
              key={donorGroup}
              style={{
                padding: '8px 10px',
                borderRadius: '8px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontSize: '12px'
              }}
            >
              <div style={{ fontWeight: 700, color: '#dc2626' }}>{donorGroup} can donate to:</div>
              <div style={{ color: 'var(--hw-text-body)', marginTop: '2px', fontWeight: 500 }}>
                {recipientList.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. MEDICAL & PROTOTYPE DISCLAIMER (Requirement 12)                        */}
      {/* ========================================================================= */}
      <div
        style={{
          marginTop: '20px',
          padding: '16px 20px',
          borderRadius: '10px',
          background: '#f8fafc',
          border: '1px solid var(--hw-border)',
          fontSize: '12px',
          color: 'var(--hw-text-muted)',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}
      >
        <ShieldIcon size={18} style={{ color: '#64748b', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div style={{ fontWeight: 600, color: 'var(--hw-text-main)', marginBottom: '2px' }}>
            Medical &amp; Prototype Notice
          </div>
          <div>
            Blood matching shown here is a preliminary donor compatibility aid. Final blood compatibility and transfusion decisions must be verified by qualified healthcare professionals.
          </div>
          <div style={{ marginTop: '4px', fontSize: '11px', color: '#94a3b8' }}>
            Development Prototype Notice: Demo donors and status logs are provided for interface demonstration. No external SMS, WhatsApp, or official hospital blood-bank communication is connected.
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CONFIRM DONOR REQUEST MODAL (Requirement 7)                              */}
      {/* ========================================================================= */}
      {requestModalDonor && (
        <Modal
          isOpen={true}
          onClose={() => setRequestModalDonor(null)}
          title="Prepare Donor Request"
          footer={
            <>
              <button
                type="button"
                className="hw-btn hw-btn-secondary"
                onClick={() => setRequestModalDonor(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="hw-btn hw-btn-primary"
                onClick={handleConfirmDonorRequest}
              >
                Confirm Request
              </button>
            </>
          }
        >
          <div>
            <p style={{ fontSize: '13px', color: 'var(--hw-text-body)', marginBottom: '16px' }}>
              Confirm recording a blood donor request for <strong>{requestModalDonor.name}</strong>.
            </p>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>Recipient / Patient:</strong> {patientName}</div>
              <div><strong>Blood Group Required:</strong> {bloodGroupRequired} ({unitsRequired} {unitsRequired === 1 ? 'Unit' : 'Units'})</div>
              <div><strong>Location:</strong> {locationQuery}</div>
              <div><strong>Urgency:</strong> {urgency}</div>
              <div><strong>Selected Donor:</strong> {requestModalDonor.name} ({requestModalDonor.bloodGroup}, {requestModalDonor.location})</div>
              <div><strong>Contact Channel:</strong> {requestModalDonor.contactPreference}</div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)', background: '#fffbeb', padding: '10px 12px', borderRadius: '6px', border: '1px solid #fef3c7' }}>
              <strong>Notice:</strong> This action creates a persistent donor request in your Health Wallet profile with status <em>&quot;Donor request prepared&quot;</em>. External telecommunication delivery is not integrated in this prototype.
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
