import React, { useState, useEffect } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  AlertTriangleIcon,
  SirenIcon,
  MapPinIcon,
  PhoneIcon,
  DropletIcon,
  PillIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  XIcon
} from '../common/Icons';

export const EmergencyPage = () => {
  const {
    user,
    medicines,
    emergencyState,
    activateEmergency,
    cancelEmergency,
    addToast
  } = useHealthWallet();

  const [countdown, setCountdown] = useState(null);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivatePin, setDeactivatePin] = useState('');

  // Countdown effect
  useEffect(() => {
    let timer;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCountdown(null);
      activateEmergency();
    }
    return () => clearTimeout(timer);
  }, [countdown, activateEmergency]);

  const handleStartEmergencyCountdown = () => {
    setCountdown(5);
  };

  const handleCancelCountdown = () => {
    setCountdown(null);
    addToast('Emergency dispatch cancelled', 'info');
  };

  const handleConfirmDeactivation = () => {
    cancelEmergency();
    setShowDeactivateModal(false);
    setDeactivatePin('');
  };

  return (
    <div>
      {/* ACTIVE EMERGENCY RED ALERT BANNER */}
      {emergencyState.isActive && (
        <div className="hw-emergency-active-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#ffffff', color: 'var(--hw-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SirenIcon size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 2px 0', letterSpacing: '0.02em' }}>
                EMERGENCY ALERT BROADCAST ACTIVE
              </h2>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>
                Activated at {emergencyState.activatedAt} • Location beacon & trauma summary relayed to emergency services.
              </div>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowDeactivateModal(true)}
            style={{ fontWeight: 700, color: 'var(--hw-danger)' }}
          >
            Deactivate Alert (Stand Down)
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="hw-page-header">
        <div className="hw-page-header-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ color: emergencyState.isActive ? 'var(--hw-danger)' : 'var(--hw-text-main)' }}>
              Emergency Center
            </h1>
            {emergencyState.isActive ? (
              <span className="hw-badge hw-badge-danger" style={{ fontWeight: 800 }}>LIVE ALERT</span>
            ) : (
              <span className="hw-badge hw-badge-green">Standby Ready</span>
            )}
          </div>
          <p>Instant triage profile, GPS location capture, and pre-authorized family notifications.</p>
        </div>
      </div>

      {/* COUNTDOWN OVERLAY IF IN PROGRESS */}
      {countdown !== null && (
        <div className="hw-card" style={{ background: '#fef2f2', border: '2px solid var(--hw-danger)', textAlign: 'center', padding: '32px', marginBottom: '24px' }}>
          <div style={{ color: 'var(--hw-danger)', marginBottom: '12px' }}>
            <SirenIcon size={40} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--hw-danger)', margin: '0 0 8px 0' }}>
            Dispatching Emergency Alert in {countdown}s...
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--hw-text-body)', maxWidth: '480px', margin: '0 auto 20px auto' }}>
            Press Cancel immediately if triggered accidentally. Otherwise, emergency services and next-of-kin will be dispatched.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
            <Button variant="secondary" size="lg" onClick={handleCancelCountdown}>
              Cancel Countdown
            </Button>
            <Button variant="danger" size="lg" onClick={() => { setCountdown(null); activateEmergency(); }}>
              Dispatch Immediately Now
            </Button>
          </div>
        </div>
      )}

      {/* Primary Action Button (If Not Active & Not Counting Down) */}
      {!emergencyState.isActive && countdown === null && (
        <div
          className="hw-card"
          style={{
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            border: '2px solid #ef4444',
            padding: '32px',
            textAlign: 'center',
            marginBottom: '28px',
            boxShadow: '0 4px 14px rgba(220, 38, 38, 0.15)'
          }}
        >
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ffffff', color: 'var(--hw-danger)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 2px 8px rgba(220, 38, 38, 0.2)' }}>
            <AlertTriangleIcon size={32} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#991b1b', margin: '0 0 8px 0' }}>
            Activate Medical Emergency
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--hw-text-body)', maxWidth: '520px', margin: '0 auto 24px auto', lineHeight: '1.6' }}>
            Locks your live location, broadcasts vital triage specs (Blood Group, Drug Allergies) to 108 Command, and triggers SMS alerts to family.
          </p>
          <Button
            variant="danger"
            size="lg"
            icon={SirenIcon}
            onClick={handleStartEmergencyCountdown}
            style={{ fontSize: '16px', padding: '14px 32px' }}
          >
            ACTIVATE EMERGENCY ALERT
          </Button>
        </div>
      )}

      {/* Triage Profile Grid for First Responders */}
      <div className="hw-grid-2" style={{ marginBottom: '28px' }}>
        {/* Current Location Card */}
        <div className="hw-card" style={{ borderLeft: '4px solid var(--hw-primary)' }}>
          <div className="hw-card-header">
            <h3 className="hw-card-title">
              <MapPinIcon size={18} color="var(--hw-primary)" />
              <span>Current GPS Location</span>
            </h3>
            <span className="hw-badge hw-badge-teal">
              <CheckCircleIcon size={11} /> Auto-Detected
            </span>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ fontSize: '14px', color: 'var(--hw-text-main)' }}>
              {emergencyState.locationAddress}
            </strong>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)', fontFamily: 'var(--hw-font-mono)' }}>
            Coordinates: {emergencyState.locationCoordinates}
          </div>
        </div>

        {/* Blood Group & Critical Allergies Card */}
        <div className="hw-card" style={{ borderLeft: '4px solid var(--hw-danger)' }}>
          <div className="hw-card-header">
            <h3 className="hw-card-title" style={{ color: '#991b1b' }}>
              <DropletIcon size={18} color="var(--hw-danger)" />
              <span>Trauma Triage Summary</span>
            </h3>
            <span className="hw-badge hw-badge-danger">High Priority</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '14px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>Blood Group</div>
              <strong style={{ fontSize: '26px', color: 'var(--hw-danger)' }}>{user.bloodGroup}</strong>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>Known Severe Allergies</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                {user.allergies.map((allergy, i) => (
                  <span key={i} className="hw-badge hw-badge-danger" style={{ fontSize: '12px', fontWeight: 600 }}>
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Critical Medicines & Emergency Contacts */}
      <div className="hw-grid-2" style={{ marginBottom: '28px' }}>
        {/* Critical Medicines */}
        <div className="hw-card">
          <div className="hw-card-header">
            <h3 className="hw-card-title">
              <PillIcon size={18} color="var(--hw-teal)" />
              <span>Active Critical Medications</span>
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {medicines.map((m) => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--hw-bg)', borderRadius: '6px', fontSize: '13px' }}>
                <div>
                  <strong style={{ color: 'var(--hw-text-main)' }}>{m.name}</strong>
                  <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)' }}>{m.dosage} • {m.timing}</div>
                </div>
                <span className="hw-badge hw-badge-neutral">{m.category}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pre-Authorized Emergency Contacts */}
        <div className="hw-card">
          <div className="hw-card-header">
            <h3 className="hw-card-title">
              <PhoneIcon size={18} color="var(--hw-primary)" />
              <span>Authorized Emergency Contacts</span>
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {user.emergencyContacts.map((contact) => (
              <div key={contact.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', border: '1px solid var(--hw-border)', borderRadius: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ fontSize: '14px', color: 'var(--hw-text-main)' }}>{contact.name}</strong>
                    <span className="hw-badge hw-badge-primary" style={{ fontSize: '10px' }}>{contact.priority}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)' }}>
                    {contact.relationship} • {contact.phone}
                  </div>
                </div>

                <a
                  href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                  className="hw-btn hw-btn-secondary hw-btn-sm"
                  style={{ textDecoration: 'none' }}
                  onClick={() => addToast(`Calling ${contact.name}`, 'info')}
                >
                  <PhoneIcon size={14} />
                  <span>Call</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency Audit / Activity Log */}
      <div className="hw-card">
        <div className="hw-card-header">
          <h3 className="hw-card-title">
            <ClockIcon size={18} color="var(--hw-primary)" />
            <span>Emergency Access & Dispatch Activity Log</span>
          </h3>
          <span style={{ fontSize: '11px', color: 'var(--hw-text-muted)' }}>Immutable Audit Trail</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {emergencyState.auditLogs.map((log, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--hw-bg)', borderRadius: '6px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ClockIcon size={14} color="var(--hw-text-muted)" />
                <span style={{ fontWeight: 600, color: 'var(--hw-text-main)' }}>{log.event}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--hw-text-muted)' }}>
                <span>Entity: <strong>{log.entity}</strong></span>
                <span>{log.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deactivate PIN Modal */}
      {showDeactivateModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowDeactivateModal(false)}
          title="Deactivate Emergency State"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowDeactivateModal(false)}>
                Keep Emergency Active
              </Button>
              <Button variant="danger" onClick={handleConfirmDeactivation}>
                Confirm Stand Down
              </Button>
            </>
          }
        >
          <div>
            <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', marginBottom: '16px' }}>
              To confirm that you are safe and cancel hospital dispatch, confirm your 4-digit citizen security PIN:
            </p>

            <div className="hw-form-group">
              <label className="hw-label hw-label-required">Security PIN</label>
              <input
                type="password"
                maxLength={4}
                className="hw-input"
                placeholder="••••"
                value={deactivatePin}
                onChange={(e) => setDeactivatePin(e.target.value)}
                style={{ letterSpacing: '8px', fontSize: '20px', textAlign: 'center', maxWidth: '160px', margin: '0 auto' }}
              />
            </div>

            <div className="hw-alert hw-alert-info" style={{ marginTop: '16px' }}>
              <span style={{ fontSize: '12px' }}>
                Deactivation will send an immediate "All Clear" stand down notification to 108 Emergency and your contacts.
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
