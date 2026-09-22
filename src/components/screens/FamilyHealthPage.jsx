import React, { useState } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import { Modal } from '../common/Modal';
import {
  UsersIcon,
  PlusIcon,
  LockIcon,
  PhoneIcon,
  CheckCircleIcon
} from '../common/Icons';

export const FamilyHealthPage = () => {
  const { familyMembers, addFamilyMember, addToast } = useHealthWallet();

  const [selectedMember, setSelectedMember] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addStep, setAddStep] = useState(1);

  // Exact reference items from Panel 5
  const referenceMembers = [
    {
      id: 'fam-kavin',
      name: 'Kavin (You)',
      relationship: 'Self',
      age: 28,
      bloodGroup: 'O+',
      recordsCount: 12,
      avatarBg: '#dbeafe',
      avatarColor: '#1e40af',
      gender: 'Male'
    },
    {
      id: 'fam-father',
      name: 'Father',
      relationship: 'Father',
      age: 56,
      bloodGroup: 'B+',
      recordsCount: 8,
      avatarBg: '#ffedd5',
      avatarColor: '#c2410c',
      gender: 'Male'
    },
    {
      id: 'fam-mother',
      name: 'Mother',
      relationship: 'Mother',
      age: 52,
      bloodGroup: 'O+',
      recordsCount: 10,
      avatarBg: '#fef3c7',
      avatarColor: '#b45309',
      gender: 'Female'
    },
    {
      id: 'fam-sister',
      name: 'Sister',
      relationship: 'Sister',
      age: 24,
      bloodGroup: 'A+',
      recordsCount: 6,
      avatarBg: '#ede9fe',
      avatarColor: '#6d28d9',
      gender: 'Female'
    }
  ];

  const [newMember, setNewMember] = useState({
    name: '',
    relationship: 'Parent',
    age: '',
    bloodGroup: 'B+',
    phone: ''
  });

  const handleStartAdd = () => {
    setAddStep(1);
    setShowAddModal(true);
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!newMember.name || !newMember.phone) return;
    setAddStep(2);
    addToast(`Authorization OTP sent to ${newMember.phone}`, 'info');
  };

  const handleConfirmAdd = () => {
    addFamilyMember({
      name: newMember.name,
      relationship: newMember.relationship,
      age: parseInt(newMember.age, 10) || 30,
      bloodGroup: newMember.bloodGroup,
      recordsCount: 0
    });
    setShowAddModal(false);
    addToast(`${newMember.name} added to Family Members`, 'success');
  };

  return (
    <div>
      {/* 1. Header matching Panel 5 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 4px 0' }}>
            Family Members
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0 }}>
            Manage your family's health profiles.
          </p>
        </div>

        <button
          type="button"
          className="hw-btn hw-btn-primary"
          onClick={handleStartAdd}
        >
          <PlusIcon size={16} />
          <span>Add Family Member</span>
        </button>
      </div>

      {/* 2. Grid of 4 Family Cards (Panel 5 Reference) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        {referenceMembers.map((member) => (
          <div key={member.id} className="hw-family-card-ref">
            <div className="hw-family-card-header">
              {/* Illustrated Avatar Circle */}
              <div
                className="hw-family-avatar"
                style={{ background: member.avatarBg, color: member.avatarColor }}
              >
                {member.gender === 'Male' ? '👨' : '👩'}
              </div>

              <div>
                <div className="hw-family-name">{member.name}</div>
                <div className="hw-family-meta">
                  <div>{member.age} years</div>
                  <div>Blood Group: <strong>{member.bloodGroup}</strong></div>
                  <div>Records: <strong>{member.recordsCount}</strong></div>
                </div>
              </div>
            </div>

            {/* Blue View Profile Button */}
            <button
              type="button"
              className="hw-btn hw-btn-primary hw-btn-block"
              onClick={() => setSelectedMember(member)}
            >
              View Profile
            </button>
          </div>
        ))}
      </div>

      {/* Member Details Modal */}
      {selectedMember && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedMember(null)}
          title={`${selectedMember.name}'s Health Profile`}
          footer={
            <button
              type="button"
              className="hw-btn hw-btn-secondary"
              onClick={() => setSelectedMember(null)}
            >
              Close
            </button>
          }
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--hw-border)', marginBottom: '16px' }}>
              <div
                className="hw-family-avatar"
                style={{ background: selectedMember.avatarBg, color: selectedMember.avatarColor, width: '60px', height: '60px', fontSize: '24px' }}
              >
                {selectedMember.gender === 'Male' ? '👨' : '👩'}
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{selectedMember.name}</h3>
                <div style={{ fontSize: '13px', color: 'var(--hw-text-muted)' }}>
                  {selectedMember.relationship} • {selectedMember.age} years old
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--hw-bg)', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>Blood Group</div>
                <strong style={{ fontSize: '16px', color: 'var(--hw-danger)' }}>{selectedMember.bloodGroup}</strong>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>Medical Records</div>
                <strong style={{ fontSize: '16px', color: 'var(--hw-primary)' }}>{selectedMember.recordsCount} Files</strong>
              </div>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--hw-text-muted)', margin: 0 }}>
              Access authorized via family consent. Diagnostic records, medication schedules, and emergency alerts are securely linked.
            </p>
          </div>
        </Modal>
      )}

      {/* Add Family Member Modal */}
      {showAddModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowAddModal(false)}
          title="Add Family Member"
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
                  onClick={handleSendOtp}
                >
                  Send OTP Verification
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="hw-btn hw-btn-secondary"
                  onClick={() => setAddStep(1)}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="hw-btn hw-btn-primary"
                  onClick={handleConfirmAdd}
                >
                  Confirm & Link Member
                </button>
              </>
            )
          }
        >
          {addStep === 1 ? (
            <form onSubmit={handleSendOtp}>
              <div className="hw-form-group">
                <label className="hw-label hw-label-required">Full Name</label>
                <input
                  type="text"
                  className="hw-input"
                  placeholder="e.g. Anand Rajan"
                  value={newMember.name}
                  onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="hw-form-group">
                  <label className="hw-label hw-label-required">Relationship</label>
                  <select
                    className="hw-select"
                    value={newMember.relationship}
                    onChange={e => setNewMember({ ...newMember, relationship: e.target.value })}
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Sister">Sister</option>
                    <option value="Brother">Brother</option>
                    <option value="Child">Child</option>
                  </select>
                </div>

                <div className="hw-form-group">
                  <label className="hw-label hw-label-required">Age</label>
                  <input
                    type="number"
                    className="hw-input"
                    placeholder="e.g. 54"
                    value={newMember.age}
                    onChange={e => setNewMember({ ...newMember, age: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="hw-form-group">
                  <label className="hw-label hw-label-required">Blood Group</label>
                  <select
                    className="hw-select"
                    value={newMember.bloodGroup}
                    onChange={e => setNewMember({ ...newMember, bloodGroup: e.target.value })}
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div className="hw-form-group">
                  <label className="hw-label hw-label-required">Mobile Number</label>
                  <input
                    type="tel"
                    className="hw-input"
                    placeholder="10-digit number"
                    value={newMember.phone}
                    onChange={e => setNewMember({ ...newMember, phone: e.target.value })}
                    required
                  />
                </div>
              </div>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--hw-primary-light)', color: 'var(--hw-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <LockIcon size={22} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 6px 0' }}>Enter Consent OTP</h3>
              <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', marginBottom: '16px' }}>
                Enter the 6-digit approval code sent to <strong>+91 {newMember.phone}</strong>
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {['5', '8', '2', '1', '9', '4'].map((d, i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    defaultValue={d}
                    style={{ width: '40px', height: '44px', textAlign: 'center', fontSize: '18px', fontWeight: 700, borderRadius: '8px', border: '1px solid var(--hw-border)', outline: 'none' }}
                  />
                ))}
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
