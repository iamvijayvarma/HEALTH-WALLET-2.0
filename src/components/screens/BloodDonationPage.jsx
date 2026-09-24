import React, { useState } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import { Modal } from '../common/Modal';
import {
  DropletIcon,
  HeartIcon
} from '../common/Icons';

export const BloodDonationPage = () => {
  const { user, requestBloodDonor, addToast, navigate } = useHealthWallet();

  const [activeTab, setActiveTab] = useState('blood'); // 'blood' | 'organ'
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Exact reference items from Panel 7
  const referenceDonors = [
    {
      id: 'don-1',
      name: 'Arun Kumar',
      distance: '2.4 km away',
      lastDonated: '3 months ago',
      bloodGroup: 'O+',
      avatarBg: '#dbeafe',
      avatarColor: '#1e40af'
    },
    {
      id: 'don-2',
      name: 'Priya Sharma',
      distance: '4.1 km away',
      lastDonated: '6 months ago',
      bloodGroup: 'O+',
      avatarBg: '#fce7f3',
      avatarColor: '#be185d'
    },
    {
      id: 'don-3',
      name: 'Vignesh R',
      distance: '5.8 km away',
      lastDonated: '1 month ago',
      bloodGroup: 'O+',
      avatarBg: '#e0e7ff',
      avatarColor: '#4338ca'
    }
  ];

  return (
    <div>
      {/* 1. Tabs matching Panel 7 Reference UI */}
      <div className="hw-tabs" style={{ marginBottom: '24px' }}>
        <button
          type="button"
          className={`hw-tab-btn ${activeTab === 'blood' ? 'active' : ''}`}
          onClick={() => setActiveTab('blood')}
        >
          <span>Blood Donation</span>
        </button>
        <button
          type="button"
          className={`hw-tab-btn ${activeTab === 'organ' ? 'active' : ''}`}
          onClick={() => navigate('organ-donation')}
        >
          <span>Organ Donation</span>
        </button>
      </div>

      {/* 2. Two Large Action Cards Side-by-Side (Panel 7 Reference) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
        {/* Card 1: Need Blood? */}
        <div
          className="hw-card"
          style={{
            background: '#ffffff',
            border: '1px solid var(--hw-border)',
            borderRadius: '14px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <DropletIcon size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 2px 0' }}>
                Need Blood?
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0 }}>
                Find compatible donors near you.
              </p>
            </div>
          </div>

          <div>
            <button
              type="button"
              className="hw-btn hw-btn-danger"
              onClick={() => setShowRequestModal(true)}
              style={{ padding: '8px 22px' }}
            >
              Search Donors
            </button>
          </div>
        </div>

        {/* Card 2: Want to Donate? */}
        <div
          className="hw-card"
          style={{
            background: '#ffffff',
            border: '1px solid var(--hw-border)',
            borderRadius: '14px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <HeartIcon size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 2px 0' }}>
                Want to Donate?
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0 }}>
                Register as a blood donor.
              </p>
            </div>
          </div>

          <div>
            <button
              type="button"
              className="hw-btn hw-btn-green"
              onClick={() => setShowRegisterModal(true)}
              style={{ padding: '8px 22px' }}
            >
              Register Now
            </button>
          </div>
        </div>
      </div>

      {/* 3. Nearby Donors Section (Panel 7 Reference) */}
      <div className="hw-card">
        <div className="hw-card-header">
          <h3 className="hw-card-title">
            Nearby Donors ({user.bloodGroup})
          </h3>
          <button
            type="button"
            className="hw-btn hw-btn-ghost hw-btn-sm"
            style={{ color: 'var(--hw-primary)', fontWeight: 600 }}
            onClick={() => addToast('Showing all regional verified donors', 'info')}
          >
            View All
          </button>
        </div>

        {/* Donor List Rows (Exact Reference Matching) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {referenceDonors.map((donor) => (
            <div
              key={donor.id}
              className="hw-record-row-ref"
              style={{ padding: '14px 18px' }}
            >
              <div className="hw-record-row-left">
                {/* Avatar */}
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: donor.avatarBg,
                    color: donor.avatarColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '14px',
                    flexShrink: 0
                  }}
                >
                  {donor.name.charAt(0)}
                </div>

                <div>
                  <div className="hw-record-name">{donor.name}</div>
                  <div className="hw-record-meta">{donor.distance}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <span style={{ fontSize: '12px', color: 'var(--hw-text-muted)', whiteSpace: 'nowrap' }}>
                  Last donated: {donor.lastDonated}
                </span>

                <button
                  type="button"
                  className="hw-btn hw-btn-primary hw-btn-sm"
                  onClick={() => {
                    requestBloodDonor(donor.name);
                    addToast(`Blood request relayed to ${donor.name}`, 'success');
                  }}
                  style={{ padding: '6px 16px' }}
                >
                  Request
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search Donors Modal */}
      {showRequestModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowRequestModal(false)}
          title="Search Compatible Blood Donors"
          footer={
            <>
              <button
                type="button"
                className="hw-btn hw-btn-secondary"
                onClick={() => setShowRequestModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="hw-btn hw-btn-danger"
                onClick={() => {
                  setShowRequestModal(false);
                  addToast('Blood requirement broadcast initiated', 'danger');
                }}
              >
                Broadcast Request
              </button>
            </>
          }
        >
          <div>
            <div className="hw-form-group">
              <label className="hw-label hw-label-required">Blood Group Required</label>
              <select className="hw-select" defaultValue={user.bloodGroup}>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div className="hw-form-group">
              <label className="hw-label hw-label-required">Hospital Location</label>
              <input type="text" className="hw-input" defaultValue="Apollo Hospital, Chennai" />
            </div>
            <div className="hw-form-group">
              <label className="hw-label hw-label-required">Units Needed</label>
              <input type="number" className="hw-input" defaultValue="2" min="1" max="10" />
            </div>
          </div>
        </Modal>
      )}

      {/* Register Donor Modal */}
      {showRegisterModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowRegisterModal(false)}
          title="Register as Voluntary Blood Donor"
          footer={
            <>
              <button
                type="button"
                className="hw-btn hw-btn-secondary"
                onClick={() => setShowRegisterModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="hw-btn hw-btn-green"
                onClick={() => {
                  setShowRegisterModal(false);
                  addToast('You are registered as a voluntary blood donor', 'success');
                }}
              >
                Confirm Registration
              </button>
            </>
          }
        >
          <div>
            <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', marginBottom: '14px' }}>
              Confirm your willingness to donate during regional emergency blood shortages.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <label style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="checkbox" defaultChecked />
                <span>Age between 18-65 and weight above 45kg</span>
              </label>
              <label style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="checkbox" defaultChecked />
                <span>At least 3 months since last whole blood donation</span>
              </label>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
