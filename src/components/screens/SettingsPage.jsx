import React, { useState } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import { getHealthWalletId, maskAadhaar } from '../../utils/userHelpers';
import {
  CopyIcon,
  CheckIcon,
  ShieldIcon,
  DropletIcon,
  PhoneIcon,
  UserIcon
} from '../common/Icons';

export const SettingsPage = () => {
  const { user, healthWalletId: contextHealthWalletId, updateUserProfile, language, setLanguage, addToast } = useHealthWallet();
  const healthWalletId = getHealthWalletId(user) || contextHealthWalletId;

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security' | 'preferences'
  const [copied, setCopied] = useState(false);

  // Form State reflecting the complete user data model
  const [formData, setFormData] = useState({
    fullName: user?.fullName || 'Vijay',
    dob: user?.dob || user?.dateOfBirth || '1998-03-12',
    gender: user?.gender || 'Male',
    mobileNumber: user?.mobileNumber || user?.phone?.replace(/\D/g, '').slice(-10) || '9876543210',
    email: user?.email || 'vijay@gov-health.org',
    state: user?.state || 'Tamil Nadu',
    district: user?.district || 'Chennai',
    address: user?.address || '42, Pantheon Road, Egmore, Chennai, Tamil Nadu - 600008',
    bloodGroup: user?.bloodGroup || 'O+',
    allergies: Array.isArray(user?.allergies) ? user.allergies.join(', ') : (user?.allergies || ''),
    criticalConditions: Array.isArray(user?.criticalConditions)
      ? user.criticalConditions.join(', ')
      : (user?.criticalConditions || (Array.isArray(user?.chronicConditions) ? user.chronicConditions.join(', ') : (user?.chronicConditions || ''))),
    emergencyContactName: user?.emergencyContact?.name || user?.emergencyContacts?.[0]?.name || 'Rajendran R',
    emergencyContactMobile: user?.emergencyContact?.mobile || user?.emergencyContacts?.[0]?.phone?.replace(/\D/g, '').slice(-10) || '9840123456',
    emergencyContactRelationship: user?.emergencyContact?.relationship || user?.emergencyContacts?.[0]?.relationship || 'Father'
  });

  const handleCopyId = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(healthWalletId);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = healthWalletId;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      addToast('Health Wallet ID copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const cleanMobile = formData.mobileNumber.replace(/\D/g, '').slice(0, 10);
    const cleanEmMobile = formData.emergencyContactMobile.replace(/\D/g, '').slice(0, 10);

    const allergiesArr = formData.allergies
      ? formData.allergies.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const conditionsArr = formData.criticalConditions
      ? formData.criticalConditions.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    updateUserProfile({
      fullName: formData.fullName,
      dob: formData.dob,
      dateOfBirth: formData.dob,
      gender: formData.gender,
      mobileNumber: cleanMobile,
      phone: `+91 ${cleanMobile}`,
      email: formData.email,
      state: formData.state,
      district: formData.district,
      address: formData.address,
      bloodGroup: formData.bloodGroup,
      allergies: allergiesArr,
      criticalConditions: conditionsArr,
      chronicConditions: conditionsArr,
      emergencyContact: {
        name: formData.emergencyContactName,
        mobile: cleanEmMobile,
        relationship: formData.emergencyContactRelationship
      }
    });

    addToast('Profile changes saved successfully', 'success');
  };

  return (
    <div>
      {/* 1. Tabs */}
      <div className="hw-tabs" style={{ marginBottom: '28px' }}>
        <button
          type="button"
          className={`hw-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <span>Profile & Identity</span>
        </button>
        <button
          type="button"
          className={`hw-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <span>Security</span>
        </button>
        <button
          type="button"
          className={`hw-tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          <span>Preferences</span>
        </button>
      </div>

      {/* 2. Profile & Identity Form Section */}
      {activeTab === 'profile' && (
        <div style={{ maxWidth: '880px' }}>
          <form onSubmit={handleSave}>
            {/* Top Identity Cards: Health Wallet ID + Masked Aadhaar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              
              {/* Health Wallet ID Card */}
              <div
                className="hw-card"
                style={{
                  backgroundColor: 'var(--hw-primary-light, #eff6ff)',
                  border: '1.5px solid var(--hw-primary-border, #bfdbfe)',
                  borderRadius: '12px',
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <ShieldIcon size={16} color="var(--hw-primary)" />
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: 'var(--hw-primary, #1e56a0)'
                      }}
                    >
                      Health Wallet ID (Unified)
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '20px',
                      fontWeight: 800,
                      color: 'var(--hw-text-main, #0f172a)',
                      letterSpacing: '0.04em',
                      fontFamily: 'var(--hw-font-mono, monospace)'
                    }}
                  >
                    {healthWalletId}
                  </span>
                  <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', marginTop: '2px' }}>
                    Shared across Profile, Dashboard, Offline Pass & SOS
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyId}
                  aria-label="Copy Health Wallet ID"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '8px 14px',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--hw-primary-border, #bfdbfe)',
                    borderRadius: '8px',
                    color: copied ? 'var(--hw-green, #10b981)' : 'var(--hw-primary, #1e56a0)',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {copied ? (
                    <>
                      <CheckIcon size={14} color="var(--hw-green, #10b981)" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon size={14} color="var(--hw-primary, #1e56a0)" />
                      <span>Copy ID</span>
                    </>
                  )}
                </button>
              </div>

              {/* Aadhaar Reference Card (Masked: XXXX XXXX 1234) */}
              <div
                className="hw-card"
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
                      Aadhaar Reference
                    </span>
                    <span style={{ fontSize: '10px', background: '#f1f5f9', color: '#475569', padding: '1px 6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                      Masked Identity
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: 'var(--hw-text-main)',
                      letterSpacing: '0.08em',
                      fontFamily: 'var(--hw-font-mono, monospace)'
                    }}
                  >
                    {maskAadhaar(user?.aadhaarNumber)}
                  </span>
                  <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', marginTop: '2px' }}>
                    Stored identity reference. Never displayed in full.
                  </div>
                </div>

                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                    fontSize: '16px'
                  }}
                  title="Masked Aadhaar Identity"
                >
                  🔒
                </div>
              </div>
            </div>

            {/* Main Information Groups */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Group 1: Personal Information */}
              <div className="hw-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                  <UserIcon size={18} color="var(--hw-primary)" />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--hw-text-main)' }}>
                    Personal Information
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div className="hw-form-group">
                    <label className="hw-label">Full Name</label>
                    <input
                      type="text"
                      className="hw-input"
                      value={formData.fullName}
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="hw-form-group">
                    <label className="hw-label">Date of Birth</label>
                    <input
                      type="date"
                      className="hw-input"
                      value={formData.dob}
                      onChange={e => setFormData({ ...formData, dob: e.target.value })}
                      required
                    />
                  </div>

                  <div className="hw-form-group">
                    <label className="hw-label">Gender</label>
                    <select
                      className="hw-select"
                      value={formData.gender}
                      onChange={e => setFormData({ ...formData, gender: e.target.value })}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other / Non-Binary</option>
                    </select>
                  </div>

                  <div className="hw-form-group">
                    <label className="hw-label">Mobile Number</label>
                    <input
                      type="tel"
                      className="hw-input"
                      maxLength={10}
                      value={formData.mobileNumber}
                      onChange={e => setFormData({ ...formData, mobileNumber: e.target.value.replace(/\D/g, '') })}
                      required
                    />
                  </div>

                  <div className="hw-form-group">
                    <label className="hw-label">Email Address</label>
                    <input
                      type="email"
                      className="hw-input"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="hw-form-group">
                    <label className="hw-label">State</label>
                    <input
                      type="text"
                      className="hw-input"
                      value={formData.state}
                      onChange={e => setFormData({ ...formData, state: e.target.value })}
                      required
                    />
                  </div>

                  <div className="hw-form-group">
                    <label className="hw-label">District</label>
                    <input
                      type="text"
                      className="hw-input"
                      value={formData.district}
                      onChange={e => setFormData({ ...formData, district: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="hw-form-group" style={{ margin: 0 }}>
                  <label className="hw-label">Residential Address</label>
                  <input
                    type="text"
                    className="hw-input"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Group 2: Health Profile */}
              <div className="hw-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                  <DropletIcon size={18} color="var(--hw-danger)" />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--hw-text-main)' }}>
                    Health Profile
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="hw-form-group">
                    <label className="hw-label">Blood Group</label>
                    <select
                      className="hw-select"
                      value={formData.bloodGroup}
                      onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div className="hw-form-group">
                    <label className="hw-label">Known Allergies (Comma separated)</label>
                    <input
                      type="text"
                      className="hw-input"
                      value={formData.allergies}
                      onChange={e => setFormData({ ...formData, allergies: e.target.value })}
                      placeholder="e.g. Penicillin, Dust Mites"
                    />
                  </div>
                </div>

                <div className="hw-form-group" style={{ margin: 0 }}>
                  <label className="hw-label">Critical Medical Conditions</label>
                  <input
                    type="text"
                    className="hw-input"
                    value={formData.criticalConditions}
                    onChange={e => setFormData({ ...formData, criticalConditions: e.target.value })}
                    placeholder="e.g. Asthma, Hypertension, Diabetes"
                  />
                </div>
              </div>

              {/* Group 3: Primary Emergency Contact */}
              <div className="hw-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                  <PhoneIcon size={18} color="var(--hw-primary)" />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--hw-text-main)' }}>
                    Primary Emergency Contact
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div className="hw-form-group">
                    <label className="hw-label">Contact Person Name</label>
                    <input
                      type="text"
                      className="hw-input"
                      value={formData.emergencyContactName}
                      onChange={e => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="hw-form-group">
                    <label className="hw-label">Mobile Number</label>
                    <input
                      type="tel"
                      className="hw-input"
                      maxLength={10}
                      value={formData.emergencyContactMobile}
                      onChange={e => setFormData({ ...formData, emergencyContactMobile: e.target.value.replace(/\D/g, '') })}
                      required
                    />
                  </div>

                  <div className="hw-form-group">
                    <label className="hw-label">Relationship</label>
                    <select
                      className="hw-select"
                      value={formData.emergencyContactRelationship}
                      onChange={e => setFormData({ ...formData, emergencyContactRelationship: e.target.value })}
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Child">Child</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Friend">Friend</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Save Changes Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                type="submit"
                className="hw-btn hw-btn-primary hw-btn-lg"
                style={{ padding: '11px 32px', fontWeight: 700 }}
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="hw-card" style={{ maxWidth: '840px' }}>
          <h3 className="hw-card-title" style={{ marginBottom: '16px' }}>Account Security</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid var(--hw-border)' }}>
              <div>
                <strong style={{ fontSize: '14px', color: 'var(--hw-text-main)' }}>Change Password</strong>
                <p style={{ fontSize: '12px', color: 'var(--hw-text-muted)', margin: 0 }}>Update your account password</p>
              </div>
              <button
                type="button"
                className="hw-btn hw-btn-secondary hw-btn-sm"
                onClick={() => addToast('Password update modal', 'info')}
              >
                Update
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '14px', color: 'var(--hw-text-main)' }}>Two-Factor Authentication</strong>
                <p style={{ fontSize: '12px', color: 'var(--hw-text-muted)', margin: 0 }}>SMS verification for secure sign-in</p>
              </div>
              <span className="hw-badge hw-badge-green" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>Active</span>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="hw-card" style={{ maxWidth: '840px' }}>
          <h3 className="hw-card-title" style={{ marginBottom: '16px' }}>Language & Preferences</h3>
          <div className="hw-form-group">
            <label className="hw-label">Language</label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                className={`hw-btn ${language === 'en' ? 'hw-btn-primary' : 'hw-btn-secondary'}`}
                onClick={() => setLanguage('en')}
              >
                English
              </button>
              <button
                type="button"
                className={`hw-btn ${language === 'ta' ? 'hw-btn-primary' : 'hw-btn-secondary'}`}
                onClick={() => setLanguage('ta')}
              >
                தமிழ்
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
