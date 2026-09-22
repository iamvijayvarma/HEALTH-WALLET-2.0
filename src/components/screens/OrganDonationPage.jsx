import React, { useState } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  HeartHandshakeIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  DownloadIcon,
  EditIcon,
  TrashIcon,
  AlertTriangleIcon,
  InfoIcon,
  PrinterIcon
} from '../common/Icons';

export const OrganDonationPage = () => {
  const { organPledge, updateOrganPledge, revokeOrganPledge, user, addToast } = useHealthWallet();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);

  // Preference selection state
  const [selectedOrgans, setSelectedOrgans] = useState(organPledge.organsSelected || [
    'Corneas (Eyes)',
    'Kidneys',
    'Liver',
    'Heart',
    'Lungs'
  ]);

  const availableOrgans = [
    'Corneas (Eyes)',
    'Kidneys',
    'Liver',
    'Heart',
    'Lungs',
    'Pancreas',
    'Small Bowel'
  ];

  const availableTissues = [
    'Skin',
    'Bone & Tendons',
    'Heart Valves',
    'Blood Vessels'
  ];

  const [selectedTissues, setSelectedTissues] = useState(organPledge.tissueSelected || ['Skin', 'Bone']);

  const toggleOrgan = (item) => {
    setSelectedOrgans(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const toggleTissue = (item) => {
    setSelectedTissues(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleSavePreferences = () => {
    updateOrganPledge({
      organsSelected: selectedOrgans,
      tissueSelected: selectedTissues
    });
    setShowEditModal(false);
  };

  const handleConfirmRevoke = () => {
    revokeOrganPledge();
    setShowRevokeModal(false);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="hw-page-header">
        <div className="hw-page-header-text">
          <h1>National Organ Donation Registry</h1>
          <p>Official registry of citizen intention to donate organs and tissues.</p>
        </div>
        <div>
          <span className="hw-badge hw-badge-teal">NOTTO Framework Standard</span>
        </div>
      </div>

      {/* Mandatory Public Health Clarification */}
      <div className="hw-alert hw-alert-info" style={{ alignItems: 'center' }}>
        <InfoIcon size={20} />
        <span style={{ fontSize: '13px' }}>
          <strong>Official Declaration:</strong> This is a voluntary intention pledge registry under national public health statutes. This is <strong>not</strong> an organ allocation or commercial exchange system. Organs are allocated strictly by regional clinical waitlists during brainstem death protocols.
        </span>
      </div>

      {/* Registered Status Banner or Registration Trigger */}
      {organPledge.isRegistered ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', marginBottom: '28px' }}>
          {/* Digital Donor Card Display */}
          <div className="hw-card" style={{ background: 'linear-gradient(135deg, #0f4c81 0%, #1e3a8a 100%)', color: '#ffffff', padding: '28px', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
            {/* Background watermark */}
            <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.08 }}>
              <HeartHandshakeIcon size={220} color="#ffffff" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#93c5fd' }}>
                  National Digital Health Mission
                </span>
                <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '2px 0 0 0' }}>
                  Official Organ Donor Card
                </h2>
              </div>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HeartHandshakeIcon size={20} color="#ffffff" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginBottom: '20px', fontSize: '13px' }}>
              <div>
                <div style={{ color: '#bfdbfe', fontSize: '11px' }}>Donor Legal Name</div>
                <strong style={{ fontSize: '16px' }}>{user.fullName}</strong>
                <div style={{ color: '#bfdbfe', fontSize: '11px', marginTop: '8px' }}>Pledge ID</div>
                <div style={{ fontFamily: 'var(--hw-font-mono)', fontSize: '13px', fontWeight: 600 }}>{organPledge.pledgeId}</div>
              </div>

              <div>
                <div style={{ color: '#bfdbfe', fontSize: '11px' }}>Blood Group</div>
                <strong style={{ fontSize: '16px', color: '#fca5a5' }}>{user.bloodGroup}</strong>
                <div style={{ color: '#bfdbfe', fontSize: '11px', marginTop: '8px' }}>Registered Date</div>
                <div>{organPledge.registrationDate}</div>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: '#bfdbfe', marginBottom: '4px' }}>Pledged Organs & Tissues:</div>
              <div style={{ fontSize: '12px', fontWeight: 500, lineHeight: '1.4' }}>
                {organPledge.organsSelected?.join(', ')}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#bfdbfe', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '14px' }}>
              <div>Next of Kin Informed: <strong>{organPledge.nomineeName} ({organPledge.nomineeRelation})</strong></div>
              <span className="hw-badge hw-badge-teal" style={{ background: '#059669', color: '#ffffff', border: 'none' }}>
                Verified Pledge
              </span>
            </div>
          </div>

          {/* Donor Controls & Information */}
          <div className="hw-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="hw-card-header">
                <h3 className="hw-card-title">
                  <ShieldCheckIcon size={18} color="var(--hw-primary)" />
                  <span>Pledge Governance</span>
                </h3>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
                Your decision to pledge organs is completely voluntary and can be altered, amended, or revoked at any time by your own request.
              </p>

              <div style={{ background: 'var(--hw-bg)', padding: '14px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--hw-border)' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--hw-text-main)', marginBottom: '4px' }}>
                  Next of Kin Authorization
                </div>
                <p style={{ fontSize: '12px', color: 'var(--hw-text-muted)', margin: 0 }}>
                  Under statutory transplant rules, your family member <strong>{organPledge.nomineeName}</strong> has been designated to reaffirm your intention in a critical medical event.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Button
                variant="primary"
                fullWidth
                icon={PrinterIcon}
                onClick={() => alert(`Printing official digital organ donor card for ${user.fullName}`)}
              >
                Download Official Donor Certificate
              </Button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <Button
                  variant="secondary"
                  fullWidth
                  size="sm"
                  icon={EditIcon}
                  onClick={() => setShowEditModal(true)}
                >
                  Edit Organ Preferences
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  style={{ color: 'var(--hw-danger)' }}
                  onClick={() => setShowRevokeModal(true)}
                >
                  Revoke
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Not Registered Yet Banner */
        <div className="hw-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--hw-primary-light)', color: 'var(--hw-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <HeartHandshakeIcon size={32} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--hw-text-main)', marginBottom: '8px' }}>
            Register Your Intention to Give Life
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--hw-text-muted)', maxWidth: '520px', margin: '0 auto 24px auto', lineHeight: '1.6' }}>
            One organ donor can save up to eight lives and enhance over seventy-five more through tissue donation. Pledging takes only a minute.
          </p>
          <Button variant="primary" size="lg" icon={HeartHandshakeIcon} onClick={() => setShowEditModal(true)}>
            Register Organ Donation Pledge
          </Button>
        </div>
      )}

      {/* Edit Preferences Modal */}
      {showEditModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowEditModal(false)}
          title="Organ & Tissue Donation Preferences"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSavePreferences}>
                Confirm & Update Pledge
              </Button>
            </>
          }
        >
          <div>
            <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', marginBottom: '16px' }}>
              Select which organs and tissues you voluntarily consent to donate upon brainstem death:
            </p>

            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--hw-primary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Major Organs
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {availableOrgans.map(org => (
                  <label key={org} className="hw-checkbox-label">
                    <input
                      type="checkbox"
                      className="hw-checkbox"
                      checked={selectedOrgans.includes(org)}
                      onChange={() => toggleOrgan(org)}
                    />
                    <span style={{ fontSize: '13px' }}>{org}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--hw-primary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Tissues
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {availableTissues.map(tiss => (
                  <label key={tiss} className="hw-checkbox-label">
                    <input
                      type="checkbox"
                      className="hw-checkbox"
                      checked={selectedTissues.includes(tiss)}
                      onChange={() => toggleTissue(tiss)}
                    />
                    <span style={{ fontSize: '13px' }}>{tiss}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="hw-alert hw-alert-info">
              <span style={{ fontSize: '12px' }}>
                Family consent acknowledgment will be updated. Your pledge is encrypted and linked to your National ABHA ID.
              </span>
            </div>
          </div>
        </Modal>
      )}

      {/* Revoke Confirmation Modal */}
      {showRevokeModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowRevokeModal(false)}
          title="Revoke Organ Donation Pledge"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowRevokeModal(false)}>
                Keep Active Pledge
              </Button>
              <Button variant="danger" onClick={handleConfirmRevoke}>
                Confirm Revocation
              </Button>
            </>
          }
        >
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--hw-danger)', flexShrink: 0 }}>
              <AlertTriangleIcon size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--hw-text-main)', margin: '0 0 6px 0' }}>
                Are you sure you want to revoke your organ donor pledge?
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', lineHeight: '1.5', margin: 0 }}>
                Your record will be safely removed from the National Organ Donation registry. You are free to re-register your voluntary pledge at any future date.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
