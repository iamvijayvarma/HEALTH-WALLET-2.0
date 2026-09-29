import React, { useState } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import { Modal } from '../common/Modal';
import {
  UsersIcon,
  PlusIcon,
  LockIcon,
  ShieldIcon,
  ClockIcon,
  TrashIcon
} from '../common/Icons';
import { requestOtp, verifyOtp } from '../../services/familyOtpService';

const RELATIONSHIPS = [
  'Father',
  'Mother',
  'Spouse',
  'Son',
  'Daughter',
  'Brother',
  'Sister',
  'Grandparent',
  'Other'
];

const maskMobileNumber = (mobile) => {
  if (!mobile) return '';
  const digits = mobile.replace(/\D/g, '');
  if (digits.length >= 10) {
    return `+91 ${digits.slice(0, 5)} •••••`;
  }
  return `+91 ${digits}`;
};

export const FamilyHealthPage = () => {
  const {
    user,
    healthRecords = [],
    medicines = [],
    familyMembers = [],
    familyAuditLogs = [],
    addFamilyMember,
    createFamilyConsentRequest,
    grantFamilyConsent,
    updateFamilyPermissions,
    revokeFamilyConsent,
    removeFamilyMember,
    hasFamilyPermission,
    addToast
  } = useHealthWallet();

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addStep, setAddStep] = useState(1); // 1: Details, 2: OTP, 3: Consent Request

  // Add form fields
  const [addName, setAddName] = useState('');
  const [addMobile, setAddMobile] = useState('');
  const [addRelationship, setAddRelationship] = useState('Father');
  const [addOtpCode, setAddOtpCode] = useState('');
  const [otpDevMessage, setOtpDevMessage] = useState('');
  const [addErrors, setAddErrors] = useState({});

  // Permissions state for consent request
  const [requestedPermissions, setRequestedPermissions] = useState({
    health_records: true,
    medicines: true,
    emergency: false
  });

  // Action modals
  const [viewAccessMember, setViewAccessMember] = useState(null);
  const [accessTab, setAccessTab] = useState('records'); // 'records' | 'medicines' | 'emergency'
  const [managePermMember, setManagePermMember] = useState(null);
  const [editPerms, setEditPerms] = useState({});
  const [simulateConsentMember, setSimulateConsentMember] = useState(null);
  const [revokeConsentMember, setRevokeConsentMember] = useState(null);
  const [deleteMember, setDeleteMember] = useState(null);

  // Summary counts
  const totalCount = familyMembers.length;
  const linkedCount = familyMembers.filter(m => m.consentStatus === 'granted').length;
  const pendingCount = familyMembers.filter(m => m.consentStatus === 'pending').length;

  // Active medicines for emergency access preview
  const activeMedicines = medicines.filter(m => (m.status || 'Active') === 'Active');
  const primaryContact = user?.emergencyContacts?.[0];

  // -------------------------------------------------------------
  // Add Member Workflow Handlers
  // -------------------------------------------------------------
  const handleOpenAdd = () => {
    setAddStep(1);
    setAddName('');
    setAddMobile('');
    setAddRelationship('Father');
    setAddOtpCode('');
    setOtpDevMessage('');
    setAddErrors({});
    setRequestedPermissions({
      health_records: true,
      medicines: true,
      emergency: false
    });
    setShowAddModal(true);
  };

  const handleStep1Continue = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!addName.trim()) errors.name = 'Full name is required.';
    const cleanMobile = addMobile.replace(/\D/g, '');
    if (!cleanMobile) {
      errors.mobile = 'Mobile number is required.';
    } else if (cleanMobile.length !== 10) {
      errors.mobile = 'Mobile number must be exactly 10 digits.';
    }

    if (Object.keys(errors).length > 0) {
      setAddErrors(errors);
      return;
    }

    setAddErrors({});
    const res = await requestOtp(cleanMobile);
    setOtpDevMessage(res.message);
    setAddOtpCode(res.otp); // Pre-fill development code for frictionless prototype testing
    setAddStep(2);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!addOtpCode.trim()) {
      setAddErrors({ otp: 'Please enter the 6-digit OTP.' });
      return;
    }

    const res = await verifyOtp(addMobile, addOtpCode.trim());
    if (!res.success) {
      setAddErrors({ otp: res.message });
      return;
    }

    setAddErrors({});
    addToast('Mobile number verified successfully.', 'success');
    // Advance to Consent Request (Requirement 4: DO NOT immediately grant access)
    setAddStep(3);
  };

  const handleSendConsentRequest = (e) => {
    e.preventDefault();
    addFamilyMember({
      name: addName,
      mobileNumber: addMobile.replace(/\D/g, ''),
      relationship: addRelationship,
      otpStatus: 'verified',
      consentStatus: 'pending',
      permissions: requestedPermissions
    });

    setShowAddModal(false);
    addToast('Consent request created.', 'info');
  };

  // -------------------------------------------------------------
  // Manage Permissions Handler
  // -------------------------------------------------------------
  const handleOpenManagePermissions = (member) => {
    setManagePermMember(member);
    setEditPerms({
      health_records: Boolean(member.permissions?.health_records),
      medicines: Boolean(member.permissions?.medicines),
      emergency: Boolean(member.permissions?.emergency)
    });
  };

  const handleSavePermissions = () => {
    if (managePermMember) {
      updateFamilyPermissions(managePermMember.id, editPerms);
      setManagePermMember(null);
    }
  };

  // -------------------------------------------------------------
  // Consent Simulation & Revocation Handlers
  // -------------------------------------------------------------
  const handleSimulateConsentApproval = () => {
    if (simulateConsentMember) {
      grantFamilyConsent(simulateConsentMember.id);
      setSimulateConsentMember(null);
    }
  };

  const handleConfirmRevoke = () => {
    if (revokeConsentMember) {
      revokeFamilyConsent(revokeConsentMember.id);
      setRevokeConsentMember(null);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteMember) {
      removeFamilyMember(deleteMember.id);
      setDeleteMember(null);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* 1. Header & Summary (Requirement 1) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 4px 0' }}>
            Family Health
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0 }}>
            Connect family members with consent-based access to relevant health information.
          </p>
        </div>

        <button
          type="button"
          className="hw-btn hw-btn-primary"
          onClick={handleOpenAdd}
          style={{ padding: '8px 20px', gap: '8px' }}
        >
          <PlusIcon size={16} />
          <span>+ Add Family Member</span>
        </button>
      </div>

      {/* Summary Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="hw-card" style={{ padding: '18px 20px', background: '#ffffff' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>
            Family Members
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--hw-text-main)', marginTop: '4px' }}>
            {totalCount}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)', marginTop: '2px' }}>
            Network members registered
          </div>
        </div>

        <div className="hw-card" style={{ padding: '18px 20px', background: '#ffffff' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#047857', textTransform: 'uppercase' }}>
            Linked
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#047857', marginTop: '4px' }}>
            {linkedCount}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)', marginTop: '2px' }}>
            Active authorized consent
          </div>
        </div>

        <div className="hw-card" style={{ padding: '18px 20px', background: '#ffffff' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#d97706', textTransform: 'uppercase' }}>
            Pending Consent
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
            {pendingCount}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)', marginTop: '2px' }}>
            Awaiting member verification
          </div>
        </div>
      </div>

      {/* 2. Family Members Grid / Empty State (Requirements 9, 18) */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--hw-text-main)', margin: 0 }}>
            Connected Family Members
          </h2>
        </div>

        {familyMembers.length === 0 ? (
          <div
            className="hw-card"
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid var(--hw-border)'
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
              <UsersIcon size={26} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--hw-text-main)', margin: '0 0 6px 0' }}>
              Your family health network is empty.
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: '0 0 18px 0', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
              Add a family member to manage consent-based health information sharing.
            </p>
            <button
              type="button"
              className="hw-btn hw-btn-primary"
              onClick={handleOpenAdd}
            >
              Add Family Member
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
            {familyMembers.map((member) => {
              const isGranted = member.consentStatus === 'granted';
              const isPending = member.consentStatus === 'pending';
              const isRevoked = member.consentStatus === 'revoked';

              return (
                <div
                  key={member.id}
                  className="hw-card"
                  style={{
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid var(--hw-border)',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}
                >
                  <div>
                    {/* Header: Avatar, Name, Relationship, Status Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '50%',
                            background: isGranted ? '#ecfdf5' : '#f1f5f9',
                            color: isGranted ? '#059669' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            fontWeight: 700,
                            flexShrink: 0
                          }}
                        >
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--hw-text-main)', margin: 0 }}>
                              {member.name}
                            </h3>
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 600,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: '#f1f5f9',
                                color: '#475569'
                              }}
                            >
                              {member.relationship}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)', marginTop: '2px' }}>
                            {maskMobileNumber(member.mobileNumber)}
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {isGranted && (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: '#ecfdf5',
                              color: '#047857',
                              border: '1px solid #a7f3d0',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            🟢 Consent Granted
                          </span>
                        )}
                        {isPending && (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: '#fffbeb',
                              color: '#d97706',
                              border: '1px solid #fde68a',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            🟡 Consent Pending
                          </span>
                        )}
                        {isRevoked && (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: '#fef2f2',
                              color: '#b91c1c',
                              border: '1px solid #fecaca',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            🔴 Consent Revoked
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Permissions Summary Block */}
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '12px', fontSize: '12px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--hw-text-main)', marginBottom: '6px' }}>
                        Authorized Access:
                      </div>

                      {isGranted ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '4px', background: member.permissions?.health_records ? '#dcfce7' : '#f1f5f9', color: member.permissions?.health_records ? '#15803d' : '#94a3b8', fontWeight: 500 }}>
                            {member.permissions?.health_records ? '✓' : '✕'} Health Records
                          </span>
                          <span style={{ padding: '2px 8px', borderRadius: '4px', background: member.permissions?.medicines ? '#dcfce7' : '#f1f5f9', color: member.permissions?.medicines ? '#15803d' : '#94a3b8', fontWeight: 500 }}>
                            {member.permissions?.medicines ? '✓' : '✕'} Medicines
                          </span>
                          <span style={{ padding: '2px 8px', borderRadius: '4px', background: member.permissions?.emergency ? '#dcfce7' : '#f1f5f9', color: member.permissions?.emergency ? '#15803d' : '#94a3b8', fontWeight: 500 }}>
                            {member.permissions?.emergency ? '✓' : '✕'} Emergency Info
                          </span>
                        </div>
                      ) : isPending ? (
                        <div style={{ color: '#d97706' }}>
                          Permissions pending family member authorization.
                        </div>
                      ) : (
                        <div style={{ color: '#94a3b8' }}>
                          All access permissions revoked.
                        </div>
                      )}

                      <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', marginTop: '8px' }}>
                        {isGranted && member.linkedAt ? `Linked: ${member.linkedAt}` : `Updated: ${member.consentUpdatedAt || 'Recently'}`}
                      </div>
                    </div>
                  </div>

                  {/* Actions (Requirement 9) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--hw-border)' }}>
                    {isGranted && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="hw-btn hw-btn-primary hw-btn-sm"
                          style={{ flex: 1, justifyContent: 'center' }}
                          onClick={() => {
                            setViewAccessMember(member);
                            setAccessTab('records');
                          }}
                        >
                          View Access
                        </button>
                        <button
                          type="button"
                          className="hw-btn hw-btn-secondary hw-btn-sm"
                          style={{ flex: 1, justifyContent: 'center' }}
                          onClick={() => handleOpenManagePermissions(member)}
                        >
                          Manage Permissions
                        </button>
                        <button
                          type="button"
                          className="hw-btn hw-btn-danger hw-btn-sm"
                          style={{ padding: '6px 12px' }}
                          onClick={() => setRevokeConsentMember(member)}
                          title="Revoke access"
                        >
                          Revoke
                        </button>
                      </div>
                    )}

                    {isPending && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="hw-btn hw-btn-secondary hw-btn-sm"
                          style={{ flex: 1, justifyContent: 'center' }}
                          onClick={() => {
                            setViewAccessMember(member);
                            setAccessTab('records');
                          }}
                        >
                          View Request
                        </button>
                        <button
                          type="button"
                          className="hw-btn hw-btn-green hw-btn-sm"
                          style={{ flex: 1.3, justifyContent: 'center' }}
                          onClick={() => setSimulateConsentMember(member)}
                        >
                          Simulate Consent Approval
                        </button>
                      </div>
                    )}

                    {isRevoked && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="hw-btn hw-btn-secondary hw-btn-sm"
                          style={{ flex: 1, justifyContent: 'center' }}
                          onClick={() => {
                            createFamilyConsentRequest(member.id, {
                              health_records: true,
                              medicines: true,
                              emergency: false
                            });
                          }}
                        >
                          Re-Request Consent
                        </button>
                        <button
                          type="button"
                          className="hw-btn hw-btn-ghost hw-btn-sm"
                          style={{ color: 'var(--hw-danger)', padding: '6px 10px' }}
                          onClick={() => setDeleteMember(member)}
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Family Access Audit Log Section (Requirement 17) */}
      <div className="hw-card" style={{ padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <ClockIcon size={18} style={{ color: 'var(--hw-primary, #1e56a0)' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--hw-text-main)', margin: 0 }}>
            Family Access Audit Log
          </h2>
        </div>

        {familyAuditLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px', color: 'var(--hw-text-muted)', fontSize: '13px' }}>
            No audit records logged yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--hw-border)', textAlign: 'left', color: 'var(--hw-text-muted)' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Timestamp</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Family Member</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Event Type</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {familyAuditLogs.slice(0, 10).map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--hw-border)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--hw-text-muted)', whiteSpace: 'nowrap' }}>
                      {log.timestamp}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--hw-text-main)' }}>
                      {log.familyMemberName}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background:
                            log.eventType.includes('Granted') ? '#ecfdf5' :
                            log.eventType.includes('Revoked') ? '#fef2f2' :
                            log.eventType.includes('Requested') ? '#fffbeb' : '#f1f5f9',
                          color:
                            log.eventType.includes('Granted') ? '#047857' :
                            log.eventType.includes('Revoked') ? '#b91c1c' :
                            log.eventType.includes('Requested') ? '#d97706' : '#475569'
                        }}
                      >
                        {log.eventType}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--hw-text-body)' }}>
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Security & Privacy Notice (Requirement 19, 22) */}
      <div
        style={{
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
            Consent &amp; Privacy Architecture
          </div>
          <div>
            OTP verification confirms the family member&apos;s mobile identity, while explicit consent controls what health information can be accessed. Access is strictly permission-scoped and can be modified or revoked at any time.
          </div>
          <div style={{ marginTop: '4px', fontSize: '11px', color: '#94a3b8' }}>
            Development Mode Notice: OTP verification and consent approvals are currently simulated for prototype testing. Production deployment requires real identity verification and institutional consent backends.
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ADD FAMILY MEMBER MULTI-STEP MODAL                                       */}
      {/* ========================================================================= */}
      {showAddModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowAddModal(false)}
          title={
            addStep === 1 ? 'Add Family Member' :
            addStep === 2 ? 'Verify Mobile Number' :
            'Request Health Access Consent'
          }
          footer={
            addStep === 1 ? (
              <>
                <button
                  type="button"
                  className="hw-btn hw-btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="hw-btn hw-btn-primary"
                  onClick={handleStep1Continue}
                >
                  Continue
                </button>
              </>
            ) : addStep === 2 ? (
              <>
                <button
                  type="button"
                  className="hw-btn hw-btn-secondary"
                  onClick={() => setAddStep(1)}
                >
                  Change Number
                </button>
                <button
                  type="button"
                  className="hw-btn hw-btn-primary"
                  onClick={handleVerifyOtp}
                >
                  Verify OTP
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="hw-btn hw-btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="hw-btn hw-btn-primary"
                  onClick={handleSendConsentRequest}
                >
                  Send Consent Request
                </button>
              </>
            )
          }
        >
          {/* STEP 1: Details */}
          {addStep === 1 && (
            <form onSubmit={handleStep1Continue}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="hw-form-group">
                  <label className="hw-label hw-label-required">Full Name</label>
                  <input
                    type="text"
                    className={`hw-input ${addErrors.name ? 'hw-input-error' : ''}`}
                    placeholder="e.g. Ramesh Kumar"
                    value={addName}
                    onChange={(e) => {
                      setAddName(e.target.value);
                      if (addErrors.name) setAddErrors({ ...addErrors, name: null });
                    }}
                  />
                  {addErrors.name && (
                    <span style={{ fontSize: '11px', color: 'var(--hw-danger)', marginTop: '4px', display: 'block' }}>
                      {addErrors.name}
                    </span>
                  )}
                </div>

                <div className="hw-form-group">
                  <label className="hw-label hw-label-required">Mobile Number (10 digits)</label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ padding: '8px 12px', background: '#f1f5f9', border: '1px solid var(--hw-border)', borderRight: 'none', borderRadius: '6px 0 0 6px', fontSize: '13px', color: 'var(--hw-text-muted)' }}>
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      className={`hw-input ${addErrors.mobile ? 'hw-input-error' : ''}`}
                      style={{ borderRadius: '0 6px 6px 0' }}
                      placeholder="9840123456"
                      value={addMobile}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setAddMobile(val);
                        if (addErrors.mobile) setAddErrors({ ...addErrors, mobile: null });
                      }}
                    />
                  </div>
                  {addErrors.mobile && (
                    <span style={{ fontSize: '11px', color: 'var(--hw-danger)', marginTop: '4px', display: 'block' }}>
                      {addErrors.mobile}
                    </span>
                  )}
                </div>

                <div className="hw-form-group">
                  <label className="hw-label hw-label-required">Relationship</label>
                  <select
                    className="hw-select"
                    value={addRelationship}
                    onChange={(e) => setAddRelationship(e.target.value)}
                  >
                    {RELATIONSHIPS.map(rel => (
                      <option key={rel} value={rel}>{rel}</option>
                    ))}
                  </select>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', background: '#f8fafc', padding: '8px 10px', borderRadius: '6px' }}>
                  Privacy Notice: Mobile number will only be used for family verification and consent requests.
                </div>
              </div>
            </form>
          )}

          {/* STEP 2: Mobile / OTP Verification (Requirement 3) */}
          {addStep === 2 && (
            <form onSubmit={handleVerifyOtp}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '13px', color: 'var(--hw-text-main)', margin: 0 }}>
                  Enter the verification code associated with this family member.
                </p>

                <div style={{ padding: '10px 14px', background: 'var(--hw-primary-light, #eef5fc)', borderRadius: '8px', border: '1px solid var(--hw-primary-border, #bfdbfe)', fontSize: '13px' }}>
                  <strong>Verifying:</strong> {addName} ({addRelationship}) • +91 {addMobile}
                </div>

                {/* Development Mode Notice */}
                <div style={{ padding: '10px 12px', background: '#fffbeb', borderRadius: '6px', border: '1px solid #fef3c7', fontSize: '12px', color: '#92400e' }}>
                  <strong>Development Mode:</strong> {otpDevMessage || 'Use Development OTP: 123456'}
                </div>

                <div className="hw-form-group">
                  <label className="hw-label hw-label-required">6-Digit Verification Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    className={`hw-input ${addErrors.otp ? 'hw-input-error' : ''}`}
                    style={{ fontSize: '18px', letterSpacing: '4px', textAlign: 'center' }}
                    value={addOtpCode}
                    onChange={(e) => {
                      setAddOtpCode(e.target.value.replace(/\D/g, ''));
                      if (addErrors.otp) setAddErrors({ ...addErrors, otp: null });
                    }}
                    placeholder="123456"
                  />
                  {addErrors.otp && (
                    <span style={{ fontSize: '11px', color: 'var(--hw-danger)', marginTop: '4px', display: 'block' }}>
                      {addErrors.otp}
                    </span>
                  )}
                </div>
              </div>
            </form>
          )}

          {/* STEP 3: Consent Request (Requirement 4) */}
          {addStep === 3 && (
            <form onSubmit={handleSendConsentRequest}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--hw-border)', fontSize: '13px' }}>
                  <div><strong>Family Member:</strong> {addName}</div>
                  <div style={{ color: 'var(--hw-text-muted)', fontSize: '12px', marginTop: '2px' }}>
                    {addRelationship} • {maskMobileNumber(addMobile)} • Verified Identity
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--hw-text-main)', display: 'block', marginBottom: '8px' }}>
                    Requested Access Permissions:
                  </label>
                  <p style={{ fontSize: '12px', color: 'var(--hw-text-muted)', margin: '0 0 12px 0' }}>
                    Select which health information categories you are requesting to share.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer', padding: '10px', background: '#ffffff', border: '1px solid var(--hw-border)', borderRadius: '8px' }}>
                      <input
                        type="checkbox"
                        checked={requestedPermissions.health_records}
                        onChange={(e) => setRequestedPermissions({ ...requestedPermissions, health_records: e.target.checked })}
                      />
                      <div>
                        <strong>Health Records</strong>
                        <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)' }}>Lab reports, diagnostic scans, and clinical notes</div>
                      </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer', padding: '10px', background: '#ffffff', border: '1px solid var(--hw-border)', borderRadius: '8px' }}>
                      <input
                        type="checkbox"
                        checked={requestedPermissions.medicines}
                        onChange={(e) => setRequestedPermissions({ ...requestedPermissions, medicines: e.target.checked })}
                      />
                      <div>
                        <strong>Medicines</strong>
                        <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)' }}>Active prescriptions, dosage schedules, and adherence logs</div>
                      </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer', padding: '10px', background: '#ffffff', border: '1px solid var(--hw-border)', borderRadius: '8px' }}>
                      <input
                        type="checkbox"
                        checked={requestedPermissions.emergency}
                        onChange={(e) => setRequestedPermissions({ ...requestedPermissions, emergency: e.target.checked })}
                      />
                      <div>
                        <strong>Emergency Information</strong>
                        <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)' }}>Blood group, allergies, critical medications, emergency contacts</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)', background: '#fffbeb', padding: '10px 12px', borderRadius: '6px', border: '1px solid #fef3c7' }}>
                  <strong>Consent Notice:</strong> Health data will remain strictly inaccessible until the family member approves this request.
                </div>
              </div>
            </form>
          )}
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MANAGE PERMISSIONS MODAL (Requirement 7)                                  */}
      {/* ========================================================================= */}
      {managePermMember && (
        <Modal
          isOpen={true}
          onClose={() => setManagePermMember(null)}
          title={`Manage Permissions: ${managePermMember.name}`}
          footer={
            <>
              <button
                type="button"
                className="hw-btn hw-btn-secondary"
                onClick={() => setManagePermMember(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="hw-btn hw-btn-primary"
                onClick={handleSavePermissions}
              >
                Save Permissions
              </button>
            </>
          }
        >
          <div>
            <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', marginBottom: '16px' }}>
              Configure categories of health information accessible by <strong>{managePermMember.name}</strong> ({managePermMember.relationship}).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Health Records */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--hw-text-main)' }}>Health Records</div>
                  <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)' }}>Diagnostic tests, laboratory reports, scans</div>
                </div>
                <select
                  className="hw-select"
                  style={{ width: '130px' }}
                  value={editPerms.health_records ? 'allowed' : 'not_allowed'}
                  onChange={(e) => setEditPerms({ ...editPerms, health_records: e.target.value === 'allowed' })}
                >
                  <option value="allowed">Allowed</option>
                  <option value="not_allowed">Not Allowed</option>
                </select>
              </div>

              {/* Medicines */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--hw-text-main)' }}>Medicines</div>
                  <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)' }}>Active prescriptions and daily dosage schedules</div>
                </div>
                <select
                  className="hw-select"
                  style={{ width: '130px' }}
                  value={editPerms.medicines ? 'allowed' : 'not_allowed'}
                  onChange={(e) => setEditPerms({ ...editPerms, medicines: e.target.value === 'allowed' })}
                >
                  <option value="allowed">Allowed</option>
                  <option value="not_allowed">Not Allowed</option>
                </select>
              </div>

              {/* Emergency Information */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--hw-text-main)' }}>Emergency Information</div>
                  <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)' }}>Blood group, allergies, critical medicines</div>
                </div>
                <select
                  className="hw-select"
                  style={{ width: '130px' }}
                  value={editPerms.emergency ? 'allowed' : 'not_allowed'}
                  onChange={(e) => setEditPerms({ ...editPerms, emergency: e.target.value === 'allowed' })}
                >
                  <option value="allowed">Allowed</option>
                  <option value="not_allowed">Not Allowed</option>
                </select>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* SIMULATE CONSENT APPROVAL MODAL (Requirement 6)                          */}
      {/* ========================================================================= */}
      {simulateConsentMember && (
        <Modal
          isOpen={true}
          onClose={() => setSimulateConsentMember(null)}
          title="Simulate Consent Approval"
          footer={
            <>
              <button
                type="button"
                className="hw-btn hw-btn-secondary"
                onClick={() => setSimulateConsentMember(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="hw-btn hw-btn-green"
                onClick={handleSimulateConsentApproval}
              >
                Simulate Approval
              </button>
            </>
          }
        >
          <div>
            <div style={{ padding: '10px 12px', background: '#fffbeb', borderRadius: '6px', border: '1px solid #fef3c7', fontSize: '12px', color: '#92400e', marginBottom: '14px' }}>
              <strong>Development Mode:</strong> In production, the family member receives a secure approval notification on their Health Wallet app or SMS portal. For prototype demonstration, you can simulate approval now.
            </div>

            <p style={{ fontSize: '13px', color: 'var(--hw-text-main)', margin: '0 0 12px 0' }}>
              Simulate <strong>{simulateConsentMember.name}</strong> approving the requested health access permissions:
            </p>

            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
              <div><strong>Relationship:</strong> {simulateConsentMember.relationship}</div>
              <div><strong>Mobile:</strong> {maskMobileNumber(simulateConsentMember.mobileNumber)}</div>
              <div style={{ marginTop: '6px' }}>
                <strong>Requested:</strong>{' '}
                {Object.entries(simulateConsentMember.permissions || {})
                  .filter(([, v]) => v)
                  .map(([k]) => k.replace('_', ' '))
                  .join(', ') || 'Standard permissions'}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* VIEW ACCESS MODAL (Permission-Based Access Preview, Requirement 8, 14-16)  */}
      {/* ========================================================================= */}
      {viewAccessMember && (
        <Modal
          isOpen={true}
          onClose={() => setViewAccessMember(null)}
          title={`${viewAccessMember.name}'s Health Access View`}
          footer={
            <button
              type="button"
              className="hw-btn hw-btn-secondary"
              onClick={() => setViewAccessMember(null)}
            >
              Close
            </button>
          }
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--hw-border)', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--hw-text-main)' }}>
                  {viewAccessMember.name} ({viewAccessMember.relationship})
                </div>
                <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)' }}>
                  Status: <strong>{viewAccessMember.consentStatus === 'granted' ? 'Consent Granted' : 'Pending Consent'}</strong>
                </div>
              </div>

              {/* Sub-tabs */}
              <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '6px' }}>
                <button
                  type="button"
                  className="hw-btn hw-btn-ghost hw-btn-sm"
                  style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    background: accessTab === 'records' ? '#ffffff' : 'transparent',
                    boxShadow: accessTab === 'records' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                  }}
                  onClick={() => setAccessTab('records')}
                >
                  Records
                </button>
                <button
                  type="button"
                  className="hw-btn hw-btn-ghost hw-btn-sm"
                  style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    background: accessTab === 'medicines' ? '#ffffff' : 'transparent',
                    boxShadow: accessTab === 'medicines' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                  }}
                  onClick={() => setAccessTab('medicines')}
                >
                  Medicines
                </button>
                <button
                  type="button"
                  className="hw-btn hw-btn-ghost hw-btn-sm"
                  style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    background: accessTab === 'emergency' ? '#ffffff' : 'transparent',
                    boxShadow: accessTab === 'emergency' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                  }}
                  onClick={() => setAccessTab('emergency')}
                >
                  Emergency
                </button>
              </div>
            </div>

            {/* TAB: Health Records */}
            {accessTab === 'records' && (
              <div>
                {hasFamilyPermission(viewAccessMember.id, 'health_records') ? (
                  <div>
                    <div style={{ fontSize: '12px', color: '#047857', marginBottom: '12px', fontWeight: 600 }}>
                      ✓ Health Records Access Authorized ({healthRecords.length} records available)
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                      {healthRecords.slice(0, 4).map((rec) => (
                        <div key={rec.id} style={{ padding: '10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--hw-text-main)' }}>{rec.title}</div>
                          <div style={{ color: 'var(--hw-text-muted)' }}>{rec.hospital} • {rec.date}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '32px 16px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <LockIcon size={24} style={{ color: '#94a3b8', marginBottom: '8px' }} />
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--hw-text-main)' }}>
                      Health Records Access Not Granted
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)', marginTop: '4px' }}>
                      Access not granted. Medical records remain securely hidden from this member.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: Medicines */}
            {accessTab === 'medicines' && (
              <div>
                {hasFamilyPermission(viewAccessMember.id, 'medicines') ? (
                  <div>
                    <div style={{ fontSize: '12px', color: '#047857', marginBottom: '12px', fontWeight: 600 }}>
                      ✓ Medicine Access Authorized ({activeMedicines.length} active prescriptions)
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                      {activeMedicines.map((med) => (
                        <div key={med.id} style={{ padding: '10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--hw-text-main)' }}>{med.name} ({med.dosage})</div>
                          <div style={{ color: 'var(--hw-text-muted)' }}>Frequency: {med.frequency} • Prescribed by: {med.prescribedBy || 'Physician'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '32px 16px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <LockIcon size={24} style={{ color: '#94a3b8', marginBottom: '8px' }} />
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--hw-text-main)' }}>
                      Medicine access not granted.
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)', marginTop: '4px' }}>
                      Medication information is protected and hidden from this member.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: Emergency */}
            {accessTab === 'emergency' && (
              <div>
                {hasFamilyPermission(viewAccessMember.id, 'emergency') ? (
                  <div>
                    <div style={{ fontSize: '12px', color: '#047857', marginBottom: '12px', fontWeight: 600 }}>
                      ✓ Emergency Information Authorized
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                      <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <div style={{ color: 'var(--hw-text-muted)' }}>Blood Group</div>
                        <strong style={{ fontSize: '14px', color: 'var(--hw-danger)' }}>{user.bloodGroup}</strong>
                      </div>
                      <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <div style={{ color: 'var(--hw-text-muted)' }}>Allergies</div>
                        <strong style={{ fontSize: '12px', color: 'var(--hw-text-main)' }}>
                          {user.allergies && user.allergies.length > 0 ? user.allergies.join(', ') : 'None recorded'}
                        </strong>
                      </div>
                      <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', gridColumn: '1 / -1' }}>
                        <div style={{ color: 'var(--hw-text-muted)' }}>Primary Emergency Contact</div>
                        <strong style={{ fontSize: '13px', color: 'var(--hw-text-main)' }}>
                          {primaryContact ? `${primaryContact.name} (${primaryContact.relationship}): ${primaryContact.phone}` : 'Not available'}
                        </strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '32px 16px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <LockIcon size={24} style={{ color: '#94a3b8', marginBottom: '8px' }} />
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--hw-text-main)' }}>
                      Emergency Information Access Not Granted
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)', marginTop: '4px' }}>
                      Emergency health parameters are not authorized for this member.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* REVOKE CONSENT CONFIRMATION MODAL (Requirement 10)                        */}
      {/* ========================================================================= */}
      {revokeConsentMember && (
        <Modal
          isOpen={true}
          onClose={() => setRevokeConsentMember(null)}
          title="Revoke Family Health Access?"
          footer={
            <>
              <button
                type="button"
                className="hw-btn hw-btn-secondary"
                onClick={() => setRevokeConsentMember(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="hw-btn hw-btn-danger"
                onClick={handleConfirmRevoke}
              >
                Revoke Access
              </button>
            </>
          }
        >
          <div>
            <p style={{ fontSize: '14px', color: 'var(--hw-text-main)', margin: '0 0 12px 0' }}>
              This will immediately remove the selected family member&apos;s access to your shared health information.
            </p>
            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
              <strong>{revokeConsentMember.name}</strong> ({revokeConsentMember.relationship}) • {maskMobileNumber(revokeConsentMember.mobileNumber)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)', marginTop: '12px' }}>
              Their consent status will become <strong>Consent Revoked</strong> and all permission categories will be disabled.
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* DELETE MEMBER MODAL                                                       */}
      {/* ========================================================================= */}
      {deleteMember && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteMember(null)}
          title="Remove Family Member?"
          footer={
            <>
              <button
                type="button"
                className="hw-btn hw-btn-secondary"
                onClick={() => setDeleteMember(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="hw-btn hw-btn-danger"
                onClick={handleConfirmDelete}
              >
                Remove
              </button>
            </>
          }
        >
          <p style={{ fontSize: '13px', color: 'var(--hw-text-main)', margin: 0 }}>
            Are you sure you want to remove <strong>{deleteMember.name}</strong> from your family network?
          </p>
        </Modal>
      )}
    </div>
  );
};
