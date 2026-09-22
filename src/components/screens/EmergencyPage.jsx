import React, { useState } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import { Modal } from '../common/Modal';
import {
  SirenIcon,
  MapPinIcon,
  DropletIcon,
  AlertTriangleIcon,
  PhoneIcon,
  CheckCircleIcon
} from '../common/Icons';

export const EmergencyPage = () => {
  const { user, emergencyState, activateEmergency, cancelEmergency, addToast } = useHealthWallet();

  const [isAlertSent, setIsAlertSent] = useState(emergencyState.isActive);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  const handleSendAlert = () => {
    setIsAlertSent(true);
    activateEmergency();
    addToast('Emergency alert broadcast to hospitals and emergency contacts', 'danger');
  };

  const handleDeactivate = () => {
    setIsAlertSent(false);
    cancelEmergency();
    setShowDeactivateModal(false);
    addToast('Emergency alert deactivated', 'info');
  };

  return (
    <div>
      {/* 1. Header Banner matching Panel 6 of Reference UI */}
      <div
        className="hw-card"
        style={{
          background: 'linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%)',
          border: '1px solid #fecaca',
          borderRadius: '14px',
          padding: '28px',
          textAlign: 'center',
          marginBottom: '24px'
        }}
      >
        {/* Siren / Bell Icon inside circle */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#ffffff',
            color: 'var(--hw-danger)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            boxShadow: '0 2px 8px rgba(220, 38, 38, 0.15)'
          }}
        >
          <SirenIcon size={26} />
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#991b1b', margin: '0 0 4px 0' }}>
          Emergency Assistance
        </h1>

        <p style={{ fontSize: '13px', color: 'var(--hw-text-body)', margin: '0 0 20px 0' }}>
          Get help quickly in medical emergencies.
        </p>

        {/* Primary Action Button: Send Emergency Alert */}
        {!isAlertSent ? (
          <button
            type="button"
            className="hw-btn hw-btn-danger hw-btn-lg"
            onClick={handleSendAlert}
            style={{ padding: '12px 32px', fontSize: '15px' }}
          >
            Send Emergency Alert
          </button>
        ) : (
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <span className="hw-badge hw-badge-danger" style={{ padding: '6px 16px', fontSize: '13px', fontWeight: 700 }}>
              ● ALERT BROADCAST ACTIVE
            </span>
            <button
              type="button"
              className="hw-btn hw-btn-secondary hw-btn-sm"
              onClick={() => setShowDeactivateModal(true)}
              style={{ color: 'var(--hw-danger)', marginTop: '4px' }}
            >
              Cancel / Deactivate Alert
            </button>
          </div>
        )}
      </div>

      {/* 2. Four Info Cards matching Panel 6 Reference Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px', marginBottom: '24px' }}>
        {/* Card 1: Current Location */}
        <div className="hw-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '18px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MapPinIcon size={20} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>
              Current Location
            </div>
            <strong style={{ fontSize: '15px', color: 'var(--hw-text-main)', display: 'block', margin: '2px 0 2px 0' }}>
              Available
            </strong>
            <span style={{ fontSize: '12px', color: 'var(--hw-text-muted)' }}>
              Chennai, Tamil Nadu (Auto-detected)
            </span>
          </div>
        </div>

        {/* Card 2: Blood Group */}
        <div className="hw-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '18px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <DropletIcon size={20} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>
              Blood Group
            </div>
            <strong style={{ fontSize: '24px', color: 'var(--hw-danger)', display: 'block', lineHeight: 1.1, marginTop: '2px' }}>
              {user.bloodGroup}
            </strong>
          </div>
        </div>

        {/* Card 3: Allergies */}
        <div className="hw-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '18px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangleIcon size={20} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>
              Allergies
            </div>
            <strong style={{ fontSize: '15px', color: 'var(--hw-text-main)', display: 'block', margin: '2px 0 2px 0' }}>
              Penicillin, Dust
            </strong>
          </div>
        </div>

        {/* Card 4: Emergency Contact */}
        <div className="hw-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '18px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <PhoneIcon size={20} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>
              Emergency Contact
            </div>
            <strong style={{ fontSize: '15px', color: 'var(--hw-text-main)', display: 'block', margin: '2px 0 2px 0' }}>
              +91 98765 43210
            </strong>
          </div>
        </div>
      </div>

      {/* 3. Bottom Green/Teal Alert Box matching Panel 6 Reference UI */}
      <div
        style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '10px',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#065f46',
          fontSize: '13px',
          fontWeight: 500
        }}
      >
        <CheckCircleIcon size={18} color="#059669" />
        <span>Your health information will be shared with nearby hospitals and your emergency contacts.</span>
      </div>

      {/* Deactivate Modal */}
      {showDeactivateModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowDeactivateModal(false)}
          title="Deactivate Emergency Alert"
          footer={
            <>
              <button
                type="button"
                className="hw-btn hw-btn-secondary"
                onClick={() => setShowDeactivateModal(false)}
              >
                Keep Alert Active
              </button>
              <button
                type="button"
                className="hw-btn hw-btn-danger"
                onClick={handleDeactivate}
              >
                Deactivate Alert
              </button>
            </>
          }
        >
          <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0 }}>
            Are you sure you want to deactivate the emergency alert? A stand-down notification will be sent to emergency contacts.
          </p>
        </Modal>
      )}
    </div>
  );
};
