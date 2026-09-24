import React, { useState } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';

export const SettingsPage = () => {
  const { user, updateUserProfile, language, setLanguage, addToast } = useHealthWallet();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security' | 'preferences'

  // Exact reference fields from Panel 9
  const [formData, setFormData] = useState({
    fullName: user?.fullName || 'Kavin',
    dob: user?.dob || '1998-03-12',
    gender: user?.gender || 'Male',
    phone: user?.phone || '+91 98765 43210',
    email: user?.email || 'kavin@example.com',
    address: user?.address || 'Chennai, Tamil Nadu'
  });

  const handleSave = (e) => {
    e.preventDefault();
    updateUserProfile({
      fullName: formData.fullName,
      dob: formData.dob,
      gender: formData.gender,
      phone: formData.phone,
      email: formData.email,
      address: formData.address
    });
    addToast('Changes saved successfully', 'success');
  };

  return (
    <div>
      {/* 1. Tabs matching Panel 9 Reference UI */}
      <div className="hw-tabs" style={{ marginBottom: '28px' }}>
        <button
          type="button"
          className={`hw-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <span>Profile</span>
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

      {/* 2. Form Section matching Panel 9 Reference Layout */}
      {activeTab === 'profile' && (
        <div className="hw-card" style={{ maxWidth: '840px' }}>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '32px', marginBottom: '24px' }}>
              {/* Left Column: Avatar & Change Photo link (Panel 9 Reference) */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '10px' }}>
                <div
                  style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    background: '#dbeafe',
                    color: '#1e40af',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '36px',
                    fontWeight: 700,
                    marginBottom: '8px'
                  }}
                >
                  👨
                </div>

                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--hw-primary)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  onClick={() => addToast('Select photo to upload', 'info')}
                >
                  Change Photo
                </button>
              </div>

              {/* Right Column: Form Inputs (Panel 9 Reference) */}
              <div>
                {/* Full Name */}
                <div className="hw-form-group">
                  <label className="hw-label">Full Name</label>
                  <input
                    type="text"
                    className="hw-input"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>

                {/* Date of Birth & Gender */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="hw-form-group">
                    <label className="hw-label">Date of Birth</label>
                    <input
                      type="date"
                      className="hw-input"
                      value={formData.dob}
                      onChange={e => setFormData({ ...formData, dob: e.target.value })}
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
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="hw-form-group">
                  <label className="hw-label">Mobile Number</label>
                  <input
                    type="tel"
                    className="hw-input"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                {/* Email */}
                <div className="hw-form-group">
                  <label className="hw-label">Email</label>
                  <input
                    type="email"
                    className="hw-input"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                {/* Address */}
                <div className="hw-form-group">
                  <label className="hw-label">Address</label>
                  <input
                    type="text"
                    className="hw-input"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Save Changes Button (Panel 9 Reference) */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--hw-border)' }}>
              <button
                type="submit"
                className="hw-btn hw-btn-primary hw-btn-lg"
                style={{ padding: '10px 28px' }}
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
              <span className="hw-badge hw-badge-green">Active</span>
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
