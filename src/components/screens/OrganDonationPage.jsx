import React, { useState } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import { Modal } from '../common/Modal';
import {
  HeartHandshakeIcon,
  CheckCircleIcon,
  DownloadIcon,
  EditIcon,
  PrinterIcon
} from '../common/Icons';

export const OrganDonationPage = () => {
  const { organPledge, updateOrganPledge, revokeOrganPledge, user, addToast, navigate } = useHealthWallet();

  const [activeTab, setActiveTab] = useState('organ');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);

  const availableOrgans = ['Corneas (Eyes)', 'Kidneys', 'Liver', 'Heart', 'Lungs'];
  const [selectedOrgans, setSelectedOrgans] = useState(organPledge.organsSelected || availableOrgans);

  const toggleOrgan = (org) => {
    setSelectedOrgans(prev =>
      prev.includes(org) ? prev.filter(o => o !== org) : [...prev, org]
    );
  };

  const handleSavePreferences = () => {
    updateOrganPledge({ organsSelected: selectedOrgans });
    setShowEditModal(false);
    addToast('Donation preferences updated', 'success');
  };

  const handleConfirmRevoke = () => {
    revokeOrganPledge();
    setShowRevokeModal(false);
    addToast('Pledge revoked', 'info');
  };

  return (
    <div>
      {/* 1. Tabs matching Panel 7 Reference UI */}
      <div className="hw-tabs" style={{ marginBottom: '24px' }}>
        <button
          type="button"
          className={`hw-tab-btn ${activeTab === 'blood' ? 'active' : ''}`}
          onClick={() => navigate('blood-donation')}
        >
          <span>Blood Donation</span>
        </button>
        <button
          type="button"
          className={`hw-tab-btn ${activeTab === 'organ' ? 'active' : ''}`}
          onClick={() => setActiveTab('organ')}
        >
          <span>Organ Donation</span>
        </button>
      </div>

      {/* 2. Official Communication Notice */}
      <div className="hw-alert hw-alert-info" style={{ marginBottom: '24px' }}>
        <span style={{ fontSize: '13px' }}>
          <strong>Notice:</strong> This module records donation intention and consent. It is not an organ allocation system. Organs are allocated strictly through medical waitlists in accordance with statutory public health guidelines.
        </span>
      </div>

      {/* 3. Organ Donation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
        {/* Digital Pledge Card */}
        <div
          className="hw-card"
          style={{
            background: 'linear-gradient(135deg, var(--hw-primary) 0%, #1e3a8a 100%)',
            color: '#ffffff',
            borderRadius: '14px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  National Healthcare Registry
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '2px 0 0 0' }}>
                  Digital Organ Donor Card
                </h2>
              </div>
              <HeartHandshakeIcon size={24} color="#ffffff" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px', marginBottom: '18px', fontSize: '13px' }}>
              <div>
                <div style={{ color: '#bfdbfe', fontSize: '11px' }}>Donor Name</div>
                <strong style={{ fontSize: '15px' }}>{user.fullName}</strong>
                <div style={{ color: '#bfdbfe', fontSize: '11px', marginTop: '6px' }}>Pledge ID</div>
                <div style={{ fontFamily: 'var(--hw-font-mono)', fontSize: '12px' }}>{organPledge.pledgeId}</div>
              </div>

              <div>
                <div style={{ color: '#bfdbfe', fontSize: '11px' }}>Blood Group</div>
                <strong style={{ fontSize: '15px', color: '#fca5a5' }}>{user.bloodGroup}</strong>
                <div style={{ color: '#bfdbfe', fontSize: '11px', marginTop: '6px' }}>Date</div>
                <div>{organPledge.registrationDate}</div>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', marginBottom: '16px' }}>
              <div style={{ color: '#bfdbfe', fontSize: '11px', marginBottom: '2px' }}>Pledged Organs:</div>
              <strong>{organPledge.organsSelected?.join(', ')}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '14px', fontSize: '11px', color: '#bfdbfe' }}>
            <span>Next of Kin: <strong>{organPledge.nomineeName}</strong></span>
            <span className="hw-badge hw-badge-green" style={{ background: '#059669', color: '#ffffff', border: 'none' }}>
              Pledge Active
            </span>
          </div>
        </div>

        {/* Management Card */}
        <div className="hw-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 className="hw-card-title" style={{ marginBottom: '12px' }}>Pledge Preferences</h3>
            <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', lineHeight: '1.5', margin: '0 0 16px 0' }}>
              Your organ donation pledge is voluntary and may be modified or revoked at any time.
            </p>

            <div style={{ background: 'var(--hw-bg)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px' }}>
              <div style={{ fontWeight: 600, color: 'var(--hw-text-main)', marginBottom: '4px' }}>Informed Consent</div>
              <p style={{ color: 'var(--hw-text-muted)', margin: 0 }}>
                Next of kin ({organPledge.nomineeName}) is informed of your decision in accordance with statutory guidelines.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              className="hw-btn hw-btn-secondary hw-btn-sm"
              onClick={() => setShowEditModal(true)}
            >
              <EditIcon size={14} />
              <span>Edit Organ Preferences</span>
            </button>

            <button
              type="button"
              className="hw-btn hw-btn-ghost hw-btn-sm"
              onClick={() => setShowRevokeModal(true)}
              style={{ color: 'var(--hw-danger)' }}
            >
              Revoke Intention
            </button>
          </div>
        </div>
      </div>

      {/* Edit Preferences Modal */}
      {showEditModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowEditModal(false)}
          title="Edit Organ Donation Preferences"
          footer={
            <>
              <button
                type="button"
                className="hw-btn hw-btn-secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="hw-btn hw-btn-primary"
                onClick={handleSavePreferences}
              >
                Save Preferences
              </button>
            </>
          }
        >
          <div>
            <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', marginBottom: '14px' }}>
              Select organs you voluntarily consent to pledge:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {availableOrgans.map(org => (
                <label key={org} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedOrgans.includes(org)}
                    onChange={() => toggleOrgan(org)}
                  />
                  <span>{org}</span>
                </label>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Revoke Modal */}
      {showRevokeModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowRevokeModal(false)}
          title="Revoke Organ Donation Intention"
          footer={
            <>
              <button
                type="button"
                className="hw-btn hw-btn-secondary"
                onClick={() => setShowRevokeModal(false)}
              >
                Keep Active
              </button>
              <button
                type="button"
                className="hw-btn hw-btn-danger"
                onClick={handleConfirmRevoke}
              >
                Confirm Revocation
              </button>
            </>
          }
        >
          <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0 }}>
            Are you sure you want to revoke your registered organ donation intention? Your pledge record will be cleared.
          </p>
        </Modal>
      )}
    </div>
  );
};
