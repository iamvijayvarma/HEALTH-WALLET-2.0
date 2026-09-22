import React, { useState } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  UserIcon,
  ShieldCheckIcon,
  LockIcon,
  GlobeIcon,
  BellIcon,
  PhoneIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  EditIcon
} from '../common/Icons';

export const SettingsPage = () => {
  const {
    user,
    updateUserProfile,
    accessAuditLogs,
    language,
    setLanguage,
    addToast
  } = useHealthWallet();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'emergency' | 'consent' | 'audit' | 'preferences'

  // Editable Profile Form State
  const [profileForm, setProfileForm] = useState({
    fullName: user.fullName,
    dob: user.dob,
    gender: user.gender,
    phone: user.phone,
    email: user.email,
    address: user.address,
    bloodGroup: user.bloodGroup,
    allergies: user.allergies.join(', ')
  });

  // Consent Toggles State
  const [consents, setConsents] = useState({
    abdmFederation: true,
    emergencyTriageAccess: true,
    familyProxyViewing: true,
    researchAnonymizedData: false
  });

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateUserProfile({
      fullName: profileForm.fullName,
      dob: profileForm.dob,
      gender: profileForm.gender,
      phone: profileForm.phone,
      email: profileForm.email,
      address: profileForm.address,
      bloodGroup: profileForm.bloodGroup,
      allergies: profileForm.allergies.split(',').map(s => s.trim())
    });
  };

  const handleToggleConsent = (key) => {
    setConsents(prev => {
      const next = { ...prev, [key]: !prev[key] };
      addToast('Consent preference updated in National Health Directory', 'info');
      return next;
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="hw-page-header">
        <div className="hw-page-header-text">
          <h1>Profile & Account Settings</h1>
          <p>Manage personal credentials, consent policies, emergency contacts, and access audits.</p>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="hw-tabs">
        <button
          type="button"
          className={`hw-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <UserIcon size={16} />
          <span>Personal & Health Profile</span>
        </button>

        <button
          type="button"
          className={`hw-tab-btn ${activeTab === 'emergency' ? 'active' : ''}`}
          onClick={() => setActiveTab('emergency')}
        >
          <PhoneIcon size={16} />
          <span>Emergency Contacts</span>
        </button>

        <button
          type="button"
          className={`hw-tab-btn ${activeTab === 'consent' ? 'active' : ''}`}
          onClick={() => setActiveTab('consent')}
        >
          <ShieldCheckIcon size={16} />
          <span>Consent & Privacy</span>
        </button>

        <button
          type="button"
          className={`hw-tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          <ClockIcon size={16} />
          <span>Access Audit Log</span>
        </button>

        <button
          type="button"
          className={`hw-tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          <GlobeIcon size={16} />
          <span>Language & Security</span>
        </button>
      </div>

      {/* TAB 1: Profile & Health Details */}
      {activeTab === 'profile' && (
        <div className="hw-card" style={{ maxWidth: '800px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid var(--hw-border)' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--hw-primary) 0%, #1e3a8a 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                fontWeight: 700
              }}
            >
              {profileForm.fullName.charAt(0)}
            </div>

            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 4px 0' }}>
                {profileForm.fullName}
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)', marginBottom: '8px' }}>
                Health Wallet ID: <strong>{user.id}</strong> • ABHA: {user.abhaNumber}
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={EditIcon}
                onClick={() => addToast('Profile photo update simulation', 'info')}
              >
                Change Photo
              </Button>
            </div>
          </div>

          <form onSubmit={handleProfileSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="hw-form-group">
                <label className="hw-label hw-label-required">Full Legal Name</label>
                <input
                  type="text"
                  className="hw-input"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="hw-form-group">
                <label className="hw-label hw-label-required">Date of Birth</label>
                <input
                  type="date"
                  className="hw-input"
                  value={profileForm.dob}
                  onChange={(e) => setProfileForm({ ...profileForm, dob: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="hw-form-group">
                <label className="hw-label hw-label-required">Gender</label>
                <select
                  className="hw-select"
                  value={profileForm.gender}
                  onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="hw-form-group">
                <label className="hw-label hw-label-required">Emergency Blood Group</label>
                <select
                  className="hw-select"
                  value={profileForm.bloodGroup}
                  onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="hw-form-group">
                <label className="hw-label hw-label-required">Mobile Number</label>
                <input
                  type="tel"
                  className="hw-input"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  required
                />
              </div>

              <div className="hw-form-group">
                <label className="hw-label">Registered Email</label>
                <input
                  type="email"
                  className="hw-input"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                />
              </div>
            </div>

            <div className="hw-form-group">
              <label className="hw-label">Residential Address</label>
              <input
                type="text"
                className="hw-input"
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
              />
            </div>

            <div className="hw-form-group">
              <label className="hw-label">Active Documented Allergies</label>
              <input
                type="text"
                className="hw-input"
                value={profileForm.allergies}
                onChange={(e) => setProfileForm({ ...profileForm, allergies: e.target.value })}
              />
              <span className="hw-form-hint">Comma separated values (e.g. Penicillin, Shellfish, Dust)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <Button variant="primary" size="lg" type="submit">
                Save Profile Changes
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Emergency Contacts */}
      {activeTab === 'emergency' && (
        <div className="hw-card" style={{ maxWidth: '800px' }}>
          <div className="hw-card-header">
            <h3 className="hw-card-title">
              <PhoneIcon size={18} color="var(--hw-primary)" />
              <span>Registered Emergency Contacts</span>
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {user.emergencyContacts.map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', border: '1px solid var(--hw-border)', borderRadius: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '15px', color: 'var(--hw-text-main)' }}>{c.name}</strong>
                    <span className="hw-badge hw-badge-primary">{c.priority}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)', marginTop: '2px' }}>
                    Relationship: <strong>{c.relationship}</strong> • Phone: {c.phone}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button variant="secondary" size="sm" onClick={() => addToast(`Contact priority updated for ${c.name}`, 'info')}>
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button variant="secondary" icon={UserIcon} onClick={() => addToast('Add new emergency contact dialog', 'info')}>
            + Add Another Emergency Contact
          </Button>
        </div>
      )}

      {/* TAB 3: Consent & Privacy */}
      {activeTab === 'consent' && (
        <div className="hw-card" style={{ maxWidth: '800px' }}>
          <div className="hw-card-header">
            <h3 className="hw-card-title">
              <ShieldCheckIcon size={18} color="var(--hw-primary)" />
              <span>National Health Privacy & Consent Manager</span>
            </h3>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', marginBottom: '24px', lineHeight: '1.5' }}>
            You hold total sovereignty over your health data. Healthcare providers cannot access or link your diagnostic history without your verified OTP or active consent grant.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '16px', borderBottom: '1px solid var(--hw-border)' }}>
              <div>
                <strong style={{ fontSize: '14px', color: 'var(--hw-text-main)' }}>National ABDM Diagnostic Record Federation</strong>
                <p style={{ fontSize: '12px', color: 'var(--hw-text-muted)', margin: '4px 0 0 0', maxWidth: '580px' }}>
                  Allows authorized NABL laboratories and accredited hospitals to push digitally signed reports directly into your Health Wallet.
                </p>
              </div>
              <label className="hw-checkbox-label">
                <input
                  type="checkbox"
                  className="hw-checkbox"
                  checked={consents.abdmFederation}
                  onChange={() => handleToggleConsent('abdmFederation')}
                />
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '16px', borderBottom: '1px solid var(--hw-border)' }}>
              <div>
                <strong style={{ fontSize: '14px', color: 'var(--hw-text-main)' }}>Emergency Medical Triage Disclosure</strong>
                <p style={{ fontSize: '12px', color: 'var(--hw-text-muted)', margin: '4px 0 0 0', maxWidth: '580px' }}>
                  Permits registered 108 ambulance paramedics to view your Blood Group and Drug Allergies via cryptographically signed offline pass during trauma triage.
                </p>
              </div>
              <label className="hw-checkbox-label">
                <input
                  type="checkbox"
                  className="hw-checkbox"
                  checked={consents.emergencyTriageAccess}
                  onChange={() => handleToggleConsent('emergencyTriageAccess')}
                />
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '16px', borderBottom: '1px solid var(--hw-border)' }}>
              <div>
                <strong style={{ fontSize: '14px', color: 'var(--hw-text-main)' }}>Family Circle Proxy Viewing</strong>
                <p style={{ fontSize: '12px', color: 'var(--hw-text-muted)', margin: '4px 0 0 0', maxWidth: '580px' }}>
                  Allows linked family members (Father, Mother) to monitor medication adherence and emergency alerts.
                </p>
              </div>
              <label className="hw-checkbox-label">
                <input
                  type="checkbox"
                  className="hw-checkbox"
                  checked={consents.familyProxyViewing}
                  onChange={() => handleToggleConsent('familyProxyViewing')}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Access Audit Log */}
      {activeTab === 'audit' && (
        <div className="hw-card" style={{ maxWidth: '900px' }}>
          <div className="hw-card-header">
            <h3 className="hw-card-title">
              <ClockIcon size={18} color="var(--hw-primary)" />
              <span>Immutable Medical Access History</span>
            </h3>
            <span className="hw-badge hw-badge-teal">Compliant with DPDP Act</span>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', marginBottom: '16px' }}>
            Every instance of any healthcare provider, laboratory, or paramedic accessing or updating your health profile is recorded here.
          </p>

          <div className="hw-table-container">
            <table className="hw-table">
              <thead>
                <tr>
                  <th>Healthcare Entity</th>
                  <th>Action / Record</th>
                  <th>Timestamp</th>
                  <th>Authorization Type</th>
                </tr>
              </thead>
              <tbody>
                {accessAuditLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: 600, color: 'var(--hw-text-main)' }}>{log.entity}</td>
                    <td>{log.action}</td>
                    <td style={{ fontSize: '12px', color: 'var(--hw-text-muted)' }}>{log.timestamp}</td>
                    <td>
                      <span className="hw-badge hw-badge-neutral">{log.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: Preferences & Language */}
      {activeTab === 'preferences' && (
        <div className="hw-card" style={{ maxWidth: '800px' }}>
          <div className="hw-card-header">
            <h3 className="hw-card-title">
              <GlobeIcon size={18} color="var(--hw-primary)" />
              <span>Language & Accessibility Preferences</span>
            </h3>
          </div>

          <div className="hw-form-group" style={{ marginBottom: '24px' }}>
            <label className="hw-label">Preferred Platform Language</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {[
                { code: 'en', label: 'English' },
                { code: 'ta', label: 'தமிழ் (Tamil)' },
                { code: 'hi', label: 'हिन्दी (Hindi)' },
                { code: 'te', label: 'తెలుగు (Telugu)' }
              ].map(l => (
                <button
                  key={l.code}
                  type="button"
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: language === l.code ? '2px solid var(--hw-primary)' : '1px solid var(--hw-border)',
                    backgroundColor: language === l.code ? 'var(--hw-primary-light)' : '#ffffff',
                    color: language === l.code ? 'var(--hw-primary)' : 'var(--hw-text-main)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                  onClick={() => setLanguage(l.code)}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="hw-card-header" style={{ marginTop: '32px' }}>
            <h3 className="hw-card-title">
              <LockIcon size={18} color="var(--hw-primary)" />
              <span>Security & Device Authentication</span>
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '13px', color: 'var(--hw-text-main)' }}>4-Digit Emergency Deactivation PIN</strong>
                <p style={{ fontSize: '12px', color: 'var(--hw-text-muted)', margin: 0 }}>Used to verify identity when cancelling an emergency alert.</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => addToast('PIN update dialog', 'info')}>
                Update PIN
              </Button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--hw-border)' }}>
              <div>
                <strong style={{ fontSize: '13px', color: 'var(--hw-text-main)' }}>Sign Out of All Other Devices</strong>
                <p style={{ fontSize: '12px', color: 'var(--hw-text-muted)', margin: 0 }}>Terminates active browser and mobile sessions.</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => addToast('Active remote sessions invalidated', 'success')}>
                Revoke Other Sessions
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
