import React, { useState, useEffect, useCallback } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import { Modal } from '../common/Modal';
import {
  SirenIcon,
  MapPinIcon,
  DropletIcon,
  AlertTriangleIcon,
  PhoneIcon,
  PillIcon,
  ClockIcon,
  CheckCircleIcon,
  ShieldIcon,
  RefreshIcon
} from '../common/Icons';

export const EmergencyPage = () => {
  const {
    user,
    healthWalletId,
    medicines = [],
    emergencyMode,
    emergencyHistory = [],
    activateEmergency,
    cancelEmergency,
    prepareEmergencyAlert,
    addToast
  } = useHealthWallet();

  const isEmergencyActive = !!emergencyMode?.isActive;

  // Dialog Modals State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  // Reason for Emergency State
  const [selectedReason, setSelectedReason] = useState('Medical Emergency');
  const [otherReasonText, setOtherReasonText] = useState('');

  // Location Fetching State
  const [locationState, setLocationState] = useState({
    status: 'idle', // 'idle' | 'Getting Location...' | 'Location Available' | 'Location Unavailable'
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null,
    errorMessage: null
  });

  // Current live timestamp
  const [currentDateTime, setCurrentDateTime] = useState(() =>
    new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  );

  // Update live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(
        new Date().toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      );
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Real Geolocation Fetcher
  const fetchCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationState({
        status: 'Location Unavailable',
        latitude: null,
        longitude: null,
        accuracy: null,
        timestamp: null,
        errorMessage: 'Geolocation is not supported by your browser.'
      });
      return;
    }

    setLocationState(prev => ({
      ...prev,
      status: 'Getting Location...',
      errorMessage: null
    }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = position.coords;
        const ts = new Date(position.timestamp).toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });

        setLocationState({
          status: 'Location Available',
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: Math.round(coords.accuracy),
          timestamp: ts,
          errorMessage: null
        });
      },
      (error) => {
        console.warn('Geolocation access error:', error.message);
        setLocationState({
          status: 'Location Unavailable',
          latitude: null,
          longitude: null,
          accuracy: null,
          timestamp: null,
          errorMessage: 'Location unavailable. Please enable location access to include your current location.'
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  // Fetch location when Emergency Mode is active
  useEffect(() => {
    let timer;
    if (isEmergencyActive && locationState.status === 'idle') {
      timer = setTimeout(() => {
        fetchCurrentLocation();
      }, 0);
    }
    return () => clearTimeout(timer);
  }, [isEmergencyActive, locationState.status, fetchCurrentLocation]);

  // Activate Emergency Confirmation Handler
  const handleConfirmActivation = () => {
    const finalReason = selectedReason === 'Other' && otherReasonText.trim()
      ? otherReasonText.trim()
      : selectedReason;

    activateEmergency(finalReason, locationState);
    setShowConfirmModal(false);
    fetchCurrentLocation();
  };

  // Prepare Emergency Alert Handler
  const handlePrepareAlert = () => {
    prepareEmergencyAlert({
      reason: emergencyMode?.reason || selectedReason,
      locationAvailability: locationState.status === 'Location Available' ? 'Location Available' : 'Location Unavailable'
    });
    addToast('Emergency alert prepared for authorized communication.', 'info');
  };

  // Deactivate Stand-down Handler
  const handleConfirmDeactivate = () => {
    cancelEmergency();
    setShowDeactivateModal(false);
    setLocationState({
      status: 'idle',
      latitude: null,
      longitude: null,
      accuracy: null,
      timestamp: null,
      errorMessage: null
    });
  };

  // Format critical medicines
  const criticalMedicinesList = medicines && medicines.length > 0
    ? medicines.map(m => `${m.name} (${m.dosage || 'Daily'})`).join(', ')
    : 'None recorded';

  // Primary Emergency Contact
  const primaryContact = user?.emergencyContacts?.[0];
  const contactDisplay = primaryContact
    ? `${primaryContact.name} (${primaryContact.relationship}): ${primaryContact.phone}`
    : 'Not available';

  // Allergies
  const allergiesDisplay = user?.allergies && user.allergies.length > 0
    ? user.allergies.join(', ')
    : 'None recorded';

  // Chronic conditions
  const conditionsDisplay = user?.chronicConditions && user.chronicConditions.length > 0
    ? user.chronicConditions.join(', ')
    : 'None reported';

  return (
    <div>
      {/* 1. Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 4px 0' }}>
          Emergency Mode
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0 }}>
          Quickly access critical health information and prepare an emergency alert.
        </p>
      </div>

      {/* 2. Prominent Emergency Mode Card */}
      <div
        className="hw-card"
        style={{
          border: isEmergencyActive ? '1.5px solid var(--hw-danger-border, #fca5a5)' : '1px solid var(--hw-border)',
          borderRadius: '14px',
          padding: '24px 28px',
          marginBottom: '28px',
          backgroundColor: '#ffffff',
          boxShadow: isEmergencyActive ? '0 4px 20px rgba(220, 38, 38, 0.08)' : 'var(--hw-shadow-xs)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: isEmergencyActive ? 'var(--hw-danger-light, #fee2e2)' : 'var(--hw-primary-light, #eef5fc)',
                color: isEmergencyActive ? 'var(--hw-danger, #dc2626)' : 'var(--hw-primary, #1e56a0)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <SirenIcon size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--hw-text-main)', margin: 0 }}>
                  Emergency Mode Status
                </h2>
                {isEmergencyActive ? (
                  <span className="hw-badge hw-badge-danger" style={{ padding: '3px 10px', fontSize: '11px', fontWeight: 700 }}>
                    ● EMERGENCY ACTIVE
                  </span>
                ) : (
                  <span className="hw-badge hw-badge-neutral" style={{ padding: '3px 10px', fontSize: '11px' }}>
                    Standby (Inactive)
                  </span>
                )}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0, maxWidth: '520px', lineHeight: '1.4' }}>
                {isEmergencyActive
                  ? `Activated on ${emergencyMode?.activatedAt || currentDateTime} • Reason: ${emergencyMode?.reason || 'Medical Emergency'}`
                  : 'Activate emergency mode to compile your emergency health profile and verify your location for healthcare responders.'}
              </p>
            </div>
          </div>

          <div>
            {!isEmergencyActive ? (
              <button
                type="button"
                id="btn-activate-emergency"
                className="hw-btn hw-btn-danger hw-btn-lg"
                onClick={() => setShowConfirmModal(true)}
                style={{ padding: '12px 28px', fontSize: '14px', fontWeight: 700, gap: '8px' }}
              >
                <SirenIcon size={18} />
                <span>Activate Emergency Mode</span>
              </button>
            ) : (
              <button
                type="button"
                className="hw-btn hw-btn-secondary hw-btn-md"
                onClick={() => setShowDeactivateModal(true)}
                style={{ color: 'var(--hw-danger)', border: '1px solid var(--hw-danger-border, #fca5a5)' }}
              >
                Deactivate Emergency Mode
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 3. EMERGENCY PROFILE (Visible when Active)                         */}
      {/* ================================================================= */}
      {isEmergencyActive && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 2px 0' }}>
              Critical Emergency Health Profile
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--hw-text-muted)', margin: 0 }}>
              Essential survival and triage metrics compiled for authorized emergency responders.
            </p>
          </div>

          <div className="hw-emergency-profile-grid">
            {/* Card 1: Health Wallet ID */}
            <div className="hw-emergency-field-card">
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--hw-primary-light, #eef5fc)', color: 'var(--hw-primary, #1e56a0)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ShieldIcon size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>
                  Health Wallet ID
                </div>
                <strong style={{ fontSize: '18px', color: 'var(--hw-primary)', display: 'block', margin: '2px 0 0 0', letterSpacing: '0.04em' }}>
                  {healthWalletId}
                </strong>
                <span style={{ fontSize: '11px', color: 'var(--hw-text-muted)' }}>
                  Name: {user?.fullName || 'Vijay Rajan'}
                </span>
              </div>
            </div>

            {/* Card 2: Blood Group */}
            <div className="hw-emergency-field-card">
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--hw-danger-light, #fee2e2)', color: 'var(--hw-danger, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <DropletIcon size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>
                  Blood Group
                </div>
                <strong style={{ fontSize: '20px', color: 'var(--hw-danger)', display: 'block', lineHeight: 1.2, margin: '2px 0 0 0' }}>
                  {user?.bloodGroup || 'Not available'}
                </strong>
                <span style={{ fontSize: '11px', color: 'var(--hw-text-muted)' }}>
                  Universal donor verified
                </span>
              </div>
            </div>

            {/* Card 3: Allergies */}
            <div className="hw-emergency-field-card">
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangleIcon size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>
                  Allergies
                </div>
                <strong style={{ fontSize: '14px', color: 'var(--hw-text-main)', display: 'block', margin: '2px 0 0 0' }}>
                  {allergiesDisplay}
                </strong>
                <span style={{ fontSize: '11px', color: 'var(--hw-text-muted)' }}>
                  High-alert drug & substance sensitivities
                </span>
              </div>
            </div>

            {/* Card 4: Critical Medicines */}
            <div className="hw-emergency-field-card">
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <PillIcon size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>
                  Critical Medicines
                </div>
                <strong style={{ fontSize: '13px', color: 'var(--hw-text-main)', display: 'block', margin: '2px 0 0 0' }}>
                  {criticalMedicinesList}
                </strong>
                <span style={{ fontSize: '11px', color: 'var(--hw-text-muted)' }}>
                  Current active prescriptions
                </span>
              </div>
            </div>

            {/* Card 5: Emergency Contact */}
            <div className="hw-emergency-field-card">
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <PhoneIcon size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>
                  Emergency Contact
                </div>
                <strong style={{ fontSize: '13px', color: 'var(--hw-text-main)', display: 'block', margin: '2px 0 0 0' }}>
                  {contactDisplay}
                </strong>
                <span style={{ fontSize: '11px', color: 'var(--hw-text-muted)' }}>
                  Primary family point of contact
                </span>
              </div>
            </div>

            {/* Card 6: Critical Health Information */}
            <div className="hw-emergency-field-card">
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f0fdfa', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ClockIcon size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>
                  Critical Health Conditions
                </div>
                <strong style={{ fontSize: '13px', color: 'var(--hw-text-main)', display: 'block', margin: '2px 0 0 0' }}>
                  {conditionsDisplay}
                </strong>
                <span style={{ fontSize: '11px', color: 'var(--hw-text-muted)' }}>
                  As of {currentDateTime}
                </span>
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* 4. EMERGENCY LOCATION                                           */}
          {/* =============================================================== */}
          <div className="hw-card" style={{ padding: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPinIcon size={18} color="var(--hw-primary)" />
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--hw-text-main)', margin: 0 }}>
                  Emergency Location
                </h3>
              </div>

              {/* Location Status Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {locationState.status === 'Getting Location...' && (
                  <span className="hw-badge hw-badge-amber" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d97706', animation: 'hwSpin 1s infinite' }} />
                    <span>Getting Location...</span>
                  </span>
                )}
                {locationState.status === 'Location Available' && (
                  <span className="hw-badge hw-badge-teal" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircleIcon size={12} color="var(--hw-teal, #0d9488)" />
                    <span>Location Available</span>
                  </span>
                )}
                {locationState.status === 'Location Unavailable' && (
                  <span className="hw-badge hw-badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangleIcon size={12} color="var(--hw-danger)" />
                    <span>Location Unavailable</span>
                  </span>
                )}

                <button
                  type="button"
                  className="hw-btn hw-btn-ghost hw-btn-sm"
                  onClick={fetchCurrentLocation}
                  style={{ fontSize: '12px', gap: '4px', color: 'var(--hw-primary)' }}
                >
                  <RefreshIcon size={12} />
                  <span>Update Location</span>
                </button>
              </div>
            </div>

            {/* Location Data Output */}
            {locationState.status === 'Location Available' ? (
              <div style={{ background: 'var(--hw-bg)', borderRadius: '8px', padding: '14px 16px', border: '1px solid var(--hw-border)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>Latitude</div>
                    <strong style={{ fontSize: '13px', color: 'var(--hw-text-main)', fontFamily: 'Consolas, monospace' }}>
                      {locationState.latitude !== null ? `${locationState.latitude.toFixed(6)}°` : '—'}
                    </strong>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>Longitude</div>
                    <strong style={{ fontSize: '13px', color: 'var(--hw-text-main)', fontFamily: 'Consolas, monospace' }}>
                      {locationState.longitude !== null ? `${locationState.longitude.toFixed(6)}°` : '—'}
                    </strong>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>Accuracy</div>
                    <strong style={{ fontSize: '13px', color: 'var(--hw-text-main)' }}>
                      {locationState.accuracy !== null ? `±${locationState.accuracy} meters` : 'Standard GPS'}
                    </strong>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>Captured Timestamp</div>
                    <strong style={{ fontSize: '13px', color: 'var(--hw-text-main)' }}>
                      {locationState.timestamp || currentDateTime}
                    </strong>
                  </div>
                </div>
              </div>
            ) : locationState.status === 'Location Unavailable' ? (
              <div style={{ background: 'var(--hw-danger-light, #fef2f2)', border: '1px solid var(--hw-danger-border, #fecaca)', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#991b1b' }}>
                {locationState.errorMessage || 'Location unavailable. Please enable location access to include your current location.'}
              </div>
            ) : (
              <div style={{ background: 'var(--hw-bg)', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: 'var(--hw-text-muted)' }}>
                Waiting to retrieve device coordinates...
              </div>
            )}
          </div>

          {/* =============================================================== */}
          {/* 5. EMERGENCY ALERT PREPARATION SUMMARY                          */}
          {/* =============================================================== */}
          <div className="hw-card" style={{ padding: '22px', marginBottom: '28px', border: '1px solid var(--hw-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 2px 0' }}>
                  Emergency Alert
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--hw-text-muted)', margin: 0 }}>
                  Structured alert payload prepared from your verified Health Wallet.
                </p>
              </div>

              {emergencyMode?.alertPrepared && (
                <span className="hw-badge hw-badge-teal" style={{ padding: '4px 12px', fontSize: '12px', fontWeight: 700 }}>
                  ✓ Emergency Alert Prepared
                </span>
              )}
            </div>

            {/* Alert Summary Table / List */}
            <div style={{ background: 'var(--hw-bg)', border: '1px solid var(--hw-border)', borderRadius: '8px', padding: '14px 18px', marginBottom: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: 'var(--hw-text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Health Wallet ID</span>
                  <strong style={{ color: 'var(--hw-text-main)' }}>{healthWalletId}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--hw-text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Blood Group</span>
                  <strong style={{ color: 'var(--hw-danger)' }}>{user?.bloodGroup || 'Not available'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--hw-text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Allergies</span>
                  <strong style={{ color: 'var(--hw-text-main)' }}>{allergiesDisplay}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--hw-text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Critical Medicines</span>
                  <strong style={{ color: 'var(--hw-text-main)' }}>{medicines.length > 0 ? 'Available' : 'None recorded'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--hw-text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Emergency Contact</span>
                  <strong style={{ color: 'var(--hw-text-main)' }}>{primaryContact ? 'Available' : 'Not available'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--hw-text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Location</span>
                  <strong style={{ color: locationState.status === 'Location Available' ? 'var(--hw-teal, #0d9488)' : 'var(--hw-danger)' }}>
                    {locationState.status === 'Location Available' ? 'Available' : 'Unavailable'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--hw-text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Timestamp</span>
                  <strong style={{ color: 'var(--hw-text-main)' }}>{emergencyMode?.activatedAt || currentDateTime}</strong>
                </div>
              </div>
            </div>

            {/* Preparation Action / Notice */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              {!emergencyMode?.alertPrepared ? (
                <button
                  type="button"
                  id="btn-prepare-alert"
                  className="hw-btn hw-btn-danger hw-btn-lg"
                  onClick={handlePrepareAlert}
                  style={{ padding: '12px 32px', fontSize: '14px', fontWeight: 700 }}
                >
                  Prepare Emergency Alert
                </button>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--hw-teal, #0d9488)', fontWeight: 700, fontSize: '15px' }}>
                    <CheckCircleIcon size={18} />
                    <span>Emergency Alert Prepared</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)', marginTop: '4px', maxWidth: '440px', lineHeight: '1.4' }}>
                    Notification delivery requires an authorized emergency communication service.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 6. AUDIT LOG & EMERGENCY ACCESS HISTORY                           */}
      {/* ================================================================= */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '14px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 2px 0' }}>
            Emergency Activity & Access History
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--hw-text-muted)', margin: 0 }}>
            Tamper-evident audit log of emergency activations and emergency communication events.
          </p>
        </div>

        {emergencyHistory.length === 0 ? (
          <div className="hw-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--hw-text-muted)', fontSize: '13px' }}>
            No emergency events recorded.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {emergencyHistory.map((evt) => (
              <div key={evt.id} className="hw-emergency-audit-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: evt.eventType.includes('Activated') ? 'var(--hw-danger-light, #fee2e2)' : 'var(--hw-primary-light, #eef5fc)',
                      color: evt.eventType.includes('Activated') ? 'var(--hw-danger, #dc2626)' : 'var(--hw-primary, #1e56a0)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <SirenIcon size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--hw-text-main)' }}>
                      {evt.eventType}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)', marginTop: '2px' }}>
                      Reason: <strong>{evt.reason || 'Emergency assistance'}</strong> • Location: <strong>{evt.locationAvailability || 'Available'}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--hw-text-main)' }}>
                    {evt.timestamp}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)' }}>
                    ID: {evt.healthWalletId}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. Data Safety Footnote */}
      <div
        style={{
          background: 'var(--hw-bg)',
          border: '1px solid var(--hw-border)',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '12px',
          color: 'var(--hw-text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <ShieldIcon size={16} color="var(--hw-primary)" />
        <span>
          <strong>Data Safety Notice:</strong> Emergency Mode exposes only critical survival parameters (Blood group, allergies, active medicines, emergency contact). Full clinical documents and medical records remain protected. Designed with privacy-conscious healthcare architecture.
        </span>
      </div>

      {/* ================================================================= */}
      {/* 8. CONFIRMATION MODAL                                             */}
      {/* ================================================================= */}
      {showConfirmModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowConfirmModal(false)}
          title="Activate Emergency Mode?"
          footer={
            <>
              <button
                type="button"
                className="hw-btn hw-btn-secondary"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-emergency"
                className="hw-btn hw-btn-danger"
                onClick={handleConfirmActivation}
                style={{ padding: '8px 24px', fontWeight: 700 }}
              >
                Continue
              </button>
            </>
          }
        >
          <div>
            <p style={{ fontSize: '13px', color: 'var(--hw-text-main)', margin: '0 0 16px 0', lineHeight: '1.5' }}>
              This will prepare your emergency health profile and location information for authorized emergency communication.
            </p>

            {/* Reason for Emergency Selection */}
            <div className="hw-form-group">
              <label className="hw-label" style={{ fontWeight: 600, marginBottom: '6px' }}>
                Reason for Emergency
              </label>
              <select
                className="hw-select"
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
              >
                <option value="Accident">Accident</option>
                <option value="Medical Emergency">Medical Emergency</option>
                <option value="Unconscious / Unable to Respond">Unconscious / Unable to Respond</option>
                <option value="Severe Injury">Severe Injury</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Text input if 'Other' is selected */}
            {selectedReason === 'Other' && (
              <div className="hw-form-group" style={{ marginTop: '10px' }}>
                <label className="hw-label">Specify Reason</label>
                <input
                  type="text"
                  className="hw-input"
                  placeholder="e.g. Sudden chest pain, breathing difficulty..."
                  value={otherReasonText}
                  onChange={(e) => setOtherReasonText(e.target.value)}
                />
              </div>
            )}

            <div style={{ marginTop: '14px', fontSize: '11px', color: 'var(--hw-text-muted)' }}>
              Emergency access is logged in your permanent health audit trail.
            </div>
          </div>
        </Modal>
      )}

      {/* ================================================================= */}
      {/* 9. DEACTIVATE CONFIRMATION MODAL                                  */}
      {/* ================================================================= */}
      {showDeactivateModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowDeactivateModal(false)}
          title="Deactivate Emergency Mode?"
          footer={
            <>
              <button
                type="button"
                className="hw-btn hw-btn-secondary"
                onClick={() => setShowDeactivateModal(false)}
              >
                Keep Emergency Mode Active
              </button>
              <button
                type="button"
                className="hw-btn hw-btn-danger"
                onClick={handleConfirmDeactivate}
              >
                Deactivate Mode
              </button>
            </>
          }
        >
          <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0, lineHeight: '1.5' }}>
            Are you sure you want to stand down Emergency Mode? Your emergency profile will return to standby, and an audit log entry will be recorded.
          </p>
        </Modal>
      )}
    </div>
  );
};
