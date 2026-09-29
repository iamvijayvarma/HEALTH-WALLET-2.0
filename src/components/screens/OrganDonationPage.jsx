import React, { useState } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import { Modal } from '../common/Modal';
import {
  HeartHandshakeIcon,
  CheckCircleIcon,
  EditIcon,
  AlertTriangleIcon,
  InfoIcon,
  CheckIcon,
  ClockIcon,
  FileTextIcon,
  ShieldIcon,
  XIcon
} from '../common/Icons';

const ORGAN_OPTIONS = [
  'Heart',
  'Liver',
  'Kidneys',
  'Lungs',
  'Pancreas',
  'Eyes / Corneas',
  'Tissues',
  'Other'
];

const CONSENT_TEXT =
  'I voluntarily record my organ donation intent and understand that this application records my stated preference. Actual donation and transplantation are subject to applicable medical, legal, and authorized processes.';

export const OrganDonationPage = () => {
  const {
    organDonation,
    organDonationAuditLogs,
    registerOrganDonationIntent,
    updateOrganDonationPreferences,
    withdrawOrganDonationIntent,
    getOrganDonationStatus,
    user,
    healthWalletId,
    navigate
  } = useHealthWallet();

  const status = getOrganDonationStatus();
  const isRegistered = status === 'Registered';
  const isWithdrawn = status === 'Withdrawn';
  const isNotRegistered = status === 'Not Registered';

  // Local state for initial registration or re-registration form
  const [isRegisteringMode, setIsRegisteringMode] = useState(false);
  const [formOrgans, setFormOrgans] = useState(
    organDonation?.selectedOrgans && organDonation.selectedOrgans.length > 0
      ? organDonation.selectedOrgans
      : ['Heart', 'Liver', 'Kidneys', 'Eyes / Corneas']
  );
  const [consentChecked, setConsentChecked] = useState(false);
  const [showRecentConfirmation, setShowRecentConfirmation] = useState(false);

  // Modal states for managing registration
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSelectedOrgans, setEditSelectedOrgans] = useState([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Form organ toggling
  const handleToggleFormOrgan = (organ) => {
    setFormOrgans((prev) =>
      prev.includes(organ) ? prev.filter((o) => o !== organ) : [...prev, organ]
    );
  };

  const handleSelectAllForm = () => {
    setFormOrgans([...ORGAN_OPTIONS]);
  };

  const handleClearAllForm = () => {
    setFormOrgans([]);
  };

  // Edit modal organ toggling
  const handleOpenEditModal = () => {
    setEditSelectedOrgans(
      organDonation?.selectedOrgans && organDonation.selectedOrgans.length > 0
        ? [...organDonation.selectedOrgans]
        : ['Heart', 'Kidneys']
    );
    setShowEditModal(true);
  };

  const handleToggleEditOrgan = (organ) => {
    setEditSelectedOrgans((prev) =>
      prev.includes(organ) ? prev.filter((o) => o !== organ) : [...prev, organ]
    );
  };

  const handleSelectAllEdit = () => {
    setEditSelectedOrgans([...ORGAN_OPTIONS]);
  };

  const handleClearAllEdit = () => {
    setEditSelectedOrgans([]);
  };

  const handleSaveEditPreferences = () => {
    if (editSelectedOrgans.length === 0) return;
    updateOrganDonationPreferences(editSelectedOrgans);
    setShowEditModal(false);
  };

  // Submit Registration or Re-registration
  const handleRegister = (e) => {
    e.preventDefault();
    if (formOrgans.length === 0 || !consentChecked) return;

    registerOrganDonationIntent(formOrgans);
    setIsRegisteringMode(false);
    setShowRecentConfirmation(true);
    setConsentChecked(false);
  };

  // Confirm Withdrawal
  const handleConfirmWithdraw = () => {
    withdrawOrganDonationIntent();
    setShowWithdrawModal(false);
    setShowRecentConfirmation(false);
  };

  // Start re-registration
  const handleStartReRegister = () => {
    setFormOrgans(
      organDonation?.selectedOrgans && organDonation.selectedOrgans.length > 0
        ? [...organDonation.selectedOrgans]
        : ['Heart', 'Liver', 'Kidneys', 'Eyes / Corneas']
    );
    setConsentChecked(false);
    setIsRegisteringMode(true);
    setShowRecentConfirmation(false);
  };

  // Whether registration form is actively shown (either not registered, or re-registering)
  const isFormActive = isNotRegistered || isRegisteringMode;

  return (
    <div>
      {/* 1. Header & Navigation Tabs */}
      <div className="hw-tabs" style={{ marginBottom: '24px' }}>
        <button
          type="button"
          className="hw-tab-btn"
          onClick={() => navigate('blood-donation')}
        >
          <span>Blood Donation</span>
        </button>
        <button
          type="button"
          className="hw-tab-btn active"
          onClick={() => {}}
        >
          <span>Organ Donation</span>
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--hw-text-main)',
            margin: '0 0 6px 0',
            letterSpacing: '-0.02em'
          }}
        >
          Organ Donation
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--hw-text-muted)', margin: 0 }}>
          Record your voluntary organ donation intent and manage your registration preferences.
        </p>
      </div>

      {/* 2. Mandatory Informational Section */}
      <div
        className="hw-alert hw-alert-info"
        style={{
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          padding: '14px 18px',
          borderRadius: '10px'
        }}
      >
        <div style={{ color: 'var(--hw-primary)', flexShrink: 0, marginTop: '2px' }}>
          <InfoIcon size={18} />
        </div>
        <div style={{ fontSize: '13px', lineHeight: '1.5', color: '#1e3a8a' }}>
          <strong>Notice:</strong> Organ donation registration records your voluntary intent to donate. It is not an organ allocation or transplant matching system. Actual donation and transplantation procedures are governed strictly by authorized medical, legal, and statutory processes.
        </div>
      </div>

      {/* 3. Post-Registration Confirmation Banner (Requirement 5) */}
      {showRecentConfirmation && isRegistered && (
        <div
          className="hw-card"
          style={{
            marginBottom: '24px',
            background: '#ecfdf5',
            border: '1.5px solid #10b981',
            borderRadius: '12px',
            padding: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#059669',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CheckIcon size={20} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#065f46', margin: 0 }}>
                Donation Intent Registered
              </h3>
            </div>
            <button
              type="button"
              className="hw-btn hw-btn-ghost hw-btn-sm"
              onClick={() => setShowRecentConfirmation(false)}
              style={{ color: '#047857' }}
              aria-label="Dismiss banner"
            >
              <XIcon size={16} />
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
              fontSize: '13px',
              color: '#064e3b',
              paddingTop: '6px'
            }}
          >
            <div>
              <span style={{ color: '#047857', fontWeight: 600 }}>Registration Status:</span>
              <div style={{ fontWeight: 700, marginTop: '2px', color: '#065f46' }}>Registered</div>
            </div>
            <div>
              <span style={{ color: '#047857', fontWeight: 600 }}>Registered On:</span>
              <div style={{ marginTop: '2px' }}>{organDonation.registeredAt}</div>
            </div>
            <div>
              <span style={{ color: '#047857', fontWeight: 600 }}>Consent:</span>
              <div style={{ marginTop: '2px' }}>Confirmed (Version {organDonation.consentTextVersion || 'v1.0'})</div>
            </div>
            <div>
              <span style={{ color: '#047857', fontWeight: 600 }}>Selected Preferences:</span>
              <div style={{ marginTop: '2px', fontWeight: 600 }}>
                {organDonation.selectedOrgans?.join(', ')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Active Status Dashboard (when Registered and not actively editing via re-register) */}
      {isRegistered && !isRegisteringMode && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', marginBottom: '24px' }}>
          {/* Main Status & Preferences Card */}
          <div className="hw-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: '#ecfdf5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <HeartHandshakeIcon size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--hw-text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
                      Health Wallet Intent Record
                    </div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '2px 0 0 0', color: 'var(--hw-text-main)' }}>
                      Donation Intent Registered
                    </h2>
                  </div>
                </div>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: '#ecfdf5',
                    color: '#047857',
                    border: '1px solid #a7f3d0',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  <CheckCircleIcon size={14} />
                  <span>Registered</span>
                </span>
              </div>

              {/* Donor Meta Details */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '12px',
                  padding: '12px 14px',
                  background: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '18px',
                  fontSize: '12px'
                }}
              >
                <div>
                  <div style={{ color: 'var(--hw-text-muted)', marginBottom: '2px' }}>Donor Name</div>
                  <div style={{ fontWeight: 600, color: 'var(--hw-text-main)' }}>{user?.fullName || 'Vijay'}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--hw-text-muted)', marginBottom: '2px' }}>Health Wallet ID</div>
                  <div style={{ fontFamily: 'var(--hw-font-mono)', fontWeight: 600, color: 'var(--hw-text-main)' }}>
                    {healthWalletId}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--hw-text-muted)', marginBottom: '2px' }}>Registered On</div>
                  <div style={{ color: 'var(--hw-text-main)' }}>{organDonation.registeredAt || '15 Feb 2026'}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--hw-text-muted)', marginBottom: '2px' }}>Consent Status</div>
                  <div style={{ color: '#047857', fontWeight: 600 }}>Confirmed (v1.0)</div>
                </div>
                {organDonation.updatedAt && (
                  <div>
                    <div style={{ color: 'var(--hw-text-muted)', marginBottom: '2px' }}>Last Updated</div>
                    <div style={{ color: 'var(--hw-text-main)' }}>{organDonation.updatedAt}</div>
                  </div>
                )}
              </div>

              {/* Selected Preferences Display */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--hw-text-main)', marginBottom: '10px' }}>
                  Selected Organs & Tissues:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                  {organDonation.selectedOrgans && organDonation.selectedOrgans.length > 0 ? (
                    organDonation.selectedOrgans.map((organ) => (
                      <span
                        key={organ}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: '#eff6ff',
                          color: 'var(--hw-primary)',
                          border: '1px solid #bfdbfe',
                          fontSize: '13px',
                          fontWeight: 600
                        }}
                      >
                        <CheckIcon size={14} />
                        <span>{organ}</span>
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '13px', color: 'var(--hw-text-muted)' }}>None selected</span>
                  )}
                </div>
              </div>
            </div>

            {/* Management Actions */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '16px',
                borderTop: '1px solid var(--hw-border)',
                marginTop: '12px'
              }}
            >
              <button
                type="button"
                className="hw-btn hw-btn-secondary"
                onClick={handleOpenEditModal}
              >
                <EditIcon size={15} />
                <span>Edit Preferences</span>
              </button>

              <button
                type="button"
                className="hw-btn hw-btn-ghost"
                style={{ color: 'var(--hw-danger)', fontSize: '13px' }}
                onClick={() => setShowWithdrawModal(true)}
              >
                Withdraw Intent
              </button>
            </div>
          </div>

          {/* Side Info & Consent Confirmation Card */}
          <div className="hw-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 className="hw-card-title" style={{ marginBottom: '12px' }}>
                Voluntary Consent Recorded
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                Your intent to donate is stored securely in your Health Wallet. You can edit your preferences or withdraw your intention at any time.
              </p>

              <div
                style={{
                  background: 'var(--hw-bg)',
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid var(--hw-border)',
                  marginBottom: '16px',
                  fontSize: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--hw-text-main)', marginBottom: '6px' }}>
                  <ShieldIcon size={16} color="var(--hw-primary)" />
                  <span>Stated Intent Declaration</span>
                </div>
                <p style={{ color: 'var(--hw-text-muted)', margin: 0, lineHeight: '1.5', fontStyle: 'italic' }}>
                  "{CONSENT_TEXT}"
                </p>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)', borderTop: '1px solid var(--hw-border)', paddingTop: '12px' }}>
              Statutory processes govern actual medical evaluation and organ matching at appropriate times.
            </div>
          </div>
        </div>
      )}

      {/* 5. Withdrawn State Notice (when Withdrawn and not currently in re-registration mode) */}
      {isWithdrawn && !isRegisteringMode && (
        <div
          className="hw-card"
          style={{
            marginBottom: '24px',
            border: '1px solid #fde68a',
            background: '#fffdf5',
            padding: '24px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: '#fef3c7',
                    color: '#92400e',
                    fontSize: '12px',
                    fontWeight: 700
                  }}
                >
                  <AlertTriangleIcon size={14} />
                  Status: Withdrawn
                </span>
                <span style={{ fontSize: '12px', color: 'var(--hw-text-muted)' }}>
                  Withdrawn on {organDonation.withdrawnAt || 'Recent'}
                </span>
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 6px 0' }}>
                Donation Intent Withdrawn
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: '0 0 12px 0', maxWidth: '640px' }}>
                Your organ donation intent in Health Wallet is currently marked as Withdrawn. Historical registration timestamps and audit trail events have been preserved. You can register your intent again whenever you wish.
              </p>
            </div>

            <button
              type="button"
              className="hw-btn hw-btn-primary"
              onClick={handleStartReRegister}
            >
              <HeartHandshakeIcon size={16} />
              <span>Register Again</span>
            </button>
          </div>
        </div>
      )}

      {/* 6. Empty State Banner (when Not Registered and not form active) */}
      {isNotRegistered && !isRegisteringMode && (
        <div
          className="hw-card"
          style={{
            marginBottom: '24px',
            textAlign: 'center',
            padding: '32px 24px',
            border: '1px dashed var(--hw-border-strong)'
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--hw-primary-light, #eff6ff)',
              color: 'var(--hw-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px auto'
            }}
          >
            <HeartHandshakeIcon size={24} />
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 6px 0' }}>
            Donation intent not registered
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: '0 auto 20px auto', maxWidth: '520px' }}>
            Record your voluntary organ donation preferences in your Health Wallet.
          </p>
          <button
            type="button"
            className="hw-btn hw-btn-primary"
            onClick={() => setIsRegisteringMode(true)}
          >
            Register Donation Intent
          </button>
        </div>
      )}

      {/* 7. Registration / Re-Registration Form Section */}
      {isFormActive && (
        <div className="hw-card" style={{ marginBottom: '24px' }}>
          <div className="hw-card-header" style={{ marginBottom: '16px' }}>
            <div>
              <h2 className="hw-card-title" style={{ fontSize: '18px' }}>
                {isWithdrawn ? 'Register Donation Intent Again' : 'Register Donation Intent'}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: '4px 0 0 0' }}>
                Select the organs/tissues you wish to include in your donation intent.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="hw-btn hw-btn-ghost hw-btn-sm"
                onClick={handleSelectAllForm}
                style={{ fontSize: '12px' }}
              >
                Select All
              </button>
              <button
                type="button"
                className="hw-btn hw-btn-ghost hw-btn-sm"
                onClick={handleClearAllForm}
                style={{ fontSize: '12px' }}
              >
                Clear All
              </button>
            </div>
          </div>

          <form onSubmit={handleRegister}>
            {/* Organ Options Checkboxes (Touch-friendly responsive grid) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '12px',
                marginBottom: '20px'
              }}
            >
              {ORGAN_OPTIONS.map((organ) => {
                const isChecked = formOrgans.includes(organ);
                return (
                  <div
                    key={organ}
                    onClick={() => handleToggleFormOrgan(organ)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: isChecked ? '1.5px solid var(--hw-primary)' : '1px solid var(--hw-border)',
                      background: isChecked ? 'var(--hw-primary-light, #eff6ff)' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // event handled by container
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: 'var(--hw-primary)',
                        cursor: 'pointer'
                      }}
                      aria-label={organ}
                    />
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: isChecked ? 600 : 500,
                        color: isChecked ? 'var(--hw-primary)' : 'var(--hw-text-main)'
                      }}
                    >
                      {organ}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Validation note for organs */}
            {formOrgans.length === 0 && (
              <div style={{ fontSize: '12px', color: 'var(--hw-danger)', marginBottom: '14px' }}>
                * At least one organ or tissue selection is required.
              </div>
            )}

            {/* Mandatory Consent Box (Requirement 4) */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '20px'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--hw-text-muted)', marginBottom: '8px', letterSpacing: '0.04em' }}>
                Mandatory Consent Declaration
              </div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: 'var(--hw-text-main)',
                  lineHeight: '1.5'
                }}
              >
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: 'var(--hw-primary)',
                    marginTop: '2px',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                />
                <span>
                  {CONSENT_TEXT}
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="submit"
                className="hw-btn hw-btn-primary"
                disabled={formOrgans.length === 0 || !consentChecked}
              >
                <HeartHandshakeIcon size={16} />
                <span>Register Donation Intent</span>
              </button>

              {isRegisteringMode && (isRegistered || isWithdrawn) && (
                <button
                  type="button"
                  className="hw-btn hw-btn-secondary"
                  onClick={() => setIsRegisteringMode(false)}
                >
                  Cancel
                </button>
              )}
            </div>

            {(!consentChecked || formOrgans.length === 0) && (
              <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', marginTop: '8px' }}>
                The registration button remains disabled until you choose at least one organ/tissue and confirm voluntary consent.
              </div>
            )}
          </form>
        </div>
      )}

      {/* 8. Informational Card: Why register your donation intent? (Requirement 2) */}
      <div className="hw-card" style={{ marginBottom: '24px' }}>
        <h3 className="hw-card-title" style={{ fontSize: '16px', marginBottom: '12px' }}>
          Why register your donation intent?
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ color: 'var(--hw-primary)', flexShrink: 0, marginTop: '2px' }}>
              <CheckCircleIcon size={18} />
            </div>
            <div>
              <strong style={{ fontSize: '13px', color: 'var(--hw-text-main)' }}>Recorded in your Health Wallet</strong>
              <p style={{ fontSize: '12px', color: 'var(--hw-text-muted)', margin: '2px 0 0 0' }}>
                Your decision can be securely recorded alongside your emergency health information.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ color: 'var(--hw-primary)', flexShrink: 0, marginTop: '2px' }}>
              <EditIcon size={18} />
            </div>
            <div>
              <strong style={{ fontSize: '13px', color: 'var(--hw-text-main)' }}>Preferences Reviewed Anytime</strong>
              <p style={{ fontSize: '12px', color: 'var(--hw-text-muted)', margin: '2px 0 0 0' }}>
                Your preferences can be updated or withdrawn whenever your personal decisions evolve.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ color: 'var(--hw-primary)', flexShrink: 0, marginTop: '2px' }}>
              <ShieldIcon size={18} />
            </div>
            <div>
              <strong style={{ fontSize: '13px', color: 'var(--hw-text-main)' }}>Voluntary Intent Only</strong>
              <p style={{ fontSize: '12px', color: 'var(--hw-text-muted)', margin: '2px 0 0 0' }}>
                Registration strictly represents voluntary intent and does not provide medical or legal guarantees.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ color: 'var(--hw-primary)', flexShrink: 0, marginTop: '2px' }}>
              <FileTextIcon size={18} />
            </div>
            <div>
              <strong style={{ fontSize: '13px', color: 'var(--hw-text-main)' }}>Governed by Statutory Processes</strong>
              <p style={{ fontSize: '12px', color: 'var(--hw-text-muted)', margin: '2px 0 0 0' }}>
                Actual donation and transplant decisions remain governed by applicable medical, legal, and authorized transplant frameworks.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 9. Audit Log Section (Requirement 12) */}
      <div className="hw-card">
        <div className="hw-card-header" style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClockIcon size={16} color="var(--hw-primary)" />
            <h3 className="hw-card-title" style={{ fontSize: '15px', margin: 0 }}>
              Organ Donation Audit Log
            </h3>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--hw-text-muted)' }}>
            Tamper-evident record of donation intent events
          </span>
        </div>

        {organDonationAuditLogs && organDonationAuditLogs.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--hw-border)', textAlign: 'left', color: 'var(--hw-text-muted)' }}>
                  <th style={{ padding: '8px 10px', fontWeight: 600 }}>Event ID</th>
                  <th style={{ padding: '8px 10px', fontWeight: 600 }}>Event Type</th>
                  <th style={{ padding: '8px 10px', fontWeight: 600 }}>Timestamp</th>
                  <th style={{ padding: '8px 10px', fontWeight: 600 }}>Health Wallet ID</th>
                  <th style={{ padding: '8px 10px', fontWeight: 600 }}>Selected Preferences</th>
                </tr>
              </thead>
              <tbody>
                {organDonationAuditLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', fontFamily: 'var(--hw-font-mono)', color: 'var(--hw-text-muted)' }}>
                      {log.id}
                    </td>
                    <td style={{ padding: '10px', fontWeight: 600, color: 'var(--hw-text-main)' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          background:
                            log.eventType.includes('withdrawn') || log.eventType.includes('Withdrawn')
                              ? '#fef2f2'
                              : log.eventType.includes('registered') || log.eventType.includes('Registered')
                              ? '#ecfdf5'
                              : '#eff6ff',
                          color:
                            log.eventType.includes('withdrawn') || log.eventType.includes('Withdrawn')
                              ? '#dc2626'
                              : log.eventType.includes('registered') || log.eventType.includes('Registered')
                              ? '#047857'
                              : 'var(--hw-primary)',
                          border: '1px solid transparent'
                        }}
                      >
                        {log.eventType}
                      </span>
                    </td>
                    <td style={{ padding: '10px', color: 'var(--hw-text-muted)', whiteSpace: 'nowrap' }}>
                      {log.timestamp}
                    </td>
                    <td style={{ padding: '10px', fontFamily: 'var(--hw-font-mono)', color: 'var(--hw-text-main)' }}>
                      {log.healthWalletId || healthWalletId}
                    </td>
                    <td style={{ padding: '10px', color: 'var(--hw-text-main)' }}>
                      {Array.isArray(log.selectedOrgans) && log.selectedOrgans.length > 0
                        ? log.selectedOrgans.join(', ')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ fontSize: '13px', color: 'var(--hw-text-muted)', textAlign: 'center', padding: '16px' }}>
            No organ donation audit events recorded yet.
          </div>
        )}
      </div>

      {/* 10. Edit Preferences Modal (Requirement 9) */}
      {showEditModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowEditModal(false)}
          title="Edit Organ Donation Preferences"
          maxWidth="560px"
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
                onClick={handleSaveEditPreferences}
                disabled={editSelectedOrgans.length === 0}
              >
                Save Preferences
              </button>
            </>
          }
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: 'var(--hw-text-muted)' }}>
                Select organs you wish to include:
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="hw-btn hw-btn-ghost hw-btn-sm"
                  onClick={handleSelectAllEdit}
                  style={{ fontSize: '11px', padding: '2px 6px' }}
                >
                  Select All
                </button>
                <button
                  type="button"
                  className="hw-btn hw-btn-ghost hw-btn-sm"
                  onClick={handleClearAllEdit}
                  style={{ fontSize: '11px', padding: '2px 6px' }}
                >
                  Clear All
                </button>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
                marginBottom: '16px'
              }}
            >
              {ORGAN_OPTIONS.map((organ) => {
                const isChecked = editSelectedOrgans.includes(organ);
                return (
                  <label
                    key={organ}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: isChecked ? '1px solid var(--hw-primary)' : '1px solid var(--hw-border)',
                      background: isChecked ? 'var(--hw-primary-light, #eff6ff)' : '#ffffff',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: isChecked ? 600 : 400
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleEditOrgan(organ)}
                      style={{ accentColor: 'var(--hw-primary)', cursor: 'pointer' }}
                    />
                    <span>{organ}</span>
                  </label>
                );
              })}
            </div>

            {editSelectedOrgans.length === 0 && (
              <div style={{ fontSize: '12px', color: 'var(--hw-danger)', margin: '4px 0 0 0' }}>
                * At least one selection is required to maintain registration.
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* 11. Withdraw Confirmation Modal (Requirement 10) */}
      {showWithdrawModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowWithdrawModal(false)}
          title="Withdraw Donation Intent?"
          maxWidth="480px"
          footer={
            <>
              <button
                type="button"
                className="hw-btn hw-btn-secondary"
                onClick={() => setShowWithdrawModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="hw-btn hw-btn-danger"
                onClick={handleConfirmWithdraw}
              >
                Withdraw Intent
              </button>
            </>
          }
        >
          <div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div style={{ color: 'var(--hw-danger)', marginTop: '2px', flexShrink: 0 }}>
                <AlertTriangleIcon size={24} />
              </div>
              <div>
                <p style={{ fontSize: '14px', color: 'var(--hw-text-main)', margin: '0 0 8px 0', fontWeight: 600 }}>
                  This will change your Health Wallet donation intent status to Withdrawn.
                </p>
                <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0, lineHeight: '1.5' }}>
                  Your historical registration details and audit log will not be deleted. You can re-register your voluntary intent at any time.
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
