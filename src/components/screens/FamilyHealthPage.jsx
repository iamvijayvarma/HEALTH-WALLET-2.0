import React, { useState } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  UsersIcon,
  PlusIcon,
  PhoneIcon,
  ShieldCheckIcon,
  FileTextIcon,
  LockIcon,
  CheckCircleIcon,
  EyeIcon,
  UserIcon
} from '../common/Icons';

export const FamilyHealthPage = () => {
  const { familyMembers, addFamilyMember, addToast } = useHealthWallet();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [addStep, setAddStep] = useState(1); // 1: Details, 2: OTP Consent

  const [newMember, setNewMember] = useState({
    name: '',
    relationship: 'Parent',
    age: '',
    bloodGroup: 'B+',
    phone: '',
    permissionScope: 'Full Access'
  });

  const handleStartAdd = () => {
    setAddStep(1);
    setShowAddModal(true);
  };

  const handleSendOtpConsent = (e) => {
    e.preventDefault();
    if (!newMember.name || !newMember.phone) return;
    setAddStep(2);
    addToast(`Consent authorization OTP sent to ${newMember.phone}`, 'info');
  };

  const handleConfirmAddMember = () => {
    addFamilyMember({
      name: newMember.name,
      relationship: newMember.relationship,
      age: parseInt(newMember.age, 10) || 30,
      bloodGroup: newMember.bloodGroup,
      phone: newMember.phone,
      permissionScope: newMember.permissionScope,
      conditions: ['Baseline vitals linked']
    });
    setShowAddModal(false);
    setNewMember({
      name: '',
      relationship: 'Parent',
      age: '',
      bloodGroup: 'B+',
      phone: '',
      permissionScope: 'Full Access'
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="hw-page-header">
        <div className="hw-page-header-text">
          <h1>Family Health Members</h1>
          <p>Manage family members' health profiles, share emergency access, and track care records.</p>
        </div>
        <Button variant="primary" icon={PlusIcon} onClick={handleStartAdd}>
          Add Family Member
        </Button>
      </div>

      {/* Permission & Privacy Badge Notice */}
      <div className="hw-alert hw-alert-info" style={{ alignItems: 'center' }}>
        <ShieldCheckIcon size={20} />
        <span style={{ fontSize: '13px' }}>
          <strong>Consent-Governed Family Circles:</strong> Family linking requires explicit OTP authentication from the member's registered mobile number under ABDM public health standards.
        </span>
      </div>

      {/* Family Member Cards Grid */}
      <div className="hw-grid-2" style={{ marginBottom: '28px' }}>
        {familyMembers.map((member) => (
          <div key={member.id} className="hw-card hw-card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      backgroundColor: member.avatarColor || 'var(--hw-primary)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '18px'
                    }}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 2px 0' }}>
                      {member.name}
                    </h3>
                    <span style={{ fontSize: '12px', color: 'var(--hw-text-muted)' }}>
                      {member.relationship} • {member.age} years
                    </span>
                  </div>
                </div>

                <span className="hw-badge hw-badge-teal">
                  <CheckCircleIcon size={11} /> Linked
                </span>
              </div>

              {/* Vitals Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', background: 'var(--hw-bg)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>Blood Group</div>
                  <strong style={{ fontSize: '15px', color: 'var(--hw-danger)' }}>{member.bloodGroup}</strong>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>Medical Records</div>
                  <strong style={{ fontSize: '15px', color: 'var(--hw-primary)' }}>{member.recordsCount} Files</strong>
                </div>
              </div>

              {/* Conditions tag */}
              {member.conditions && member.conditions.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {member.conditions.map((cond, i) => (
                    <span key={i} className="hw-badge hw-badge-neutral" style={{ fontSize: '11px' }}>
                      {cond}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Button
              variant="secondary"
              fullWidth
              size="sm"
              icon={EyeIcon}
              onClick={() => setSelectedMember(member)}
            >
              View Member Health Profile
            </Button>
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
            <Button variant="secondary" onClick={() => setSelectedMember(null)}>
              Close
            </Button>
          }
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--hw-border)' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: selectedMember.avatarColor || 'var(--hw-primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '20px'
                }}
              >
                {selectedMember.name.charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--hw-text-main)', margin: 0 }}>
                  {selectedMember.name}
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)' }}>
                  Relationship: {selectedMember.relationship} • Age: {selectedMember.age} • Blood Group: {selectedMember.bloodGroup}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--hw-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Active Health Conditions
              </h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {selectedMember.conditions?.map((c, i) => (
                  <span key={i} className="hw-badge hw-badge-warning" style={{ fontSize: '12px', padding: '4px 10px' }}>
                    {c}
                  </span>
                )) || <span>No active conditions</span>}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--hw-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Access Permissions & Scope
              </h4>
              <div style={{ background: 'var(--hw-bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--hw-border)', fontSize: '12px', color: 'var(--hw-text-body)' }}>
                <strong>Authorized Permission:</strong> Diagnostic reports, daily medication schedules, and emergency responder triage access are authorized under verified family proxy consent.
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Family Member Modal (2 Steps) */}
      {showAddModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowAddModal(false)}
          title="Link Family Member"
          footer={
            addStep === 1 ? (
              <>
                <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSendOtpConsent}>
                  Proceed to OTP Consent
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" onClick={() => setAddStep(1)}>
                  Back
                </Button>
                <Button variant="primary" onClick={handleConfirmAddMember}>
                  Verify OTP & Link Member
                </Button>
              </>
            )
          }
        >
          {addStep === 1 ? (
            <form onSubmit={handleSendOtpConsent}>
              <div className="hw-form-group">
                <label className="hw-label hw-label-required">Family Member Legal Name</label>
                <input
                  type="text"
                  className="hw-input"
                  placeholder="e.g. Meera Rajan"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="hw-form-group">
                  <label className="hw-label hw-label-required">Relationship</label>
                  <select
                    className="hw-select"
                    value={newMember.relationship}
                    onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value })}
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Sister">Sister</option>
                    <option value="Brother">Brother</option>
                    <option value="Child">Child / Dependent</option>
                  </select>
                </div>

                <div className="hw-form-group">
                  <label className="hw-label hw-label-required">Age</label>
                  <input
                    type="number"
                    className="hw-input"
                    placeholder="e.g. 52"
                    value={newMember.age}
                    onChange={(e) => setNewMember({ ...newMember, age: e.target.value })}
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
                    onChange={(e) => setNewMember({ ...newMember, bloodGroup: e.target.value })}
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
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="hw-form-group">
                <label className="hw-label">Permission Scope</label>
                <select
                  className="hw-select"
                  value={newMember.permissionScope}
                  onChange={(e) => setNewMember({ ...newMember, permissionScope: e.target.value })}
                >
                  <option value="Full Access">Full Access (View & Upload Records, Prescriptions)</option>
                  <option value="Emergency Only">Emergency Only (Blood Group, Allergies, Contacts)</option>
                  <option value="Prescriptions Only">Prescriptions & Reminders Only</option>
                </select>
              </div>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--hw-primary-light)', color: 'var(--hw-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <LockIcon size={22} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--hw-text-main)', marginBottom: '6px' }}>
                Enter Member Authorization OTP
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', marginBottom: '20px' }}>
                An authorization request was sent to <strong>+91 {newMember.phone}</strong>. Enter the 6-digit approval code to link this family member.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                {['4', '9', '1', '7', '2', '8'].map((d, i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    defaultValue={d}
                    style={{
                      width: '42px',
                      height: '46px',
                      textAlign: 'center',
                      fontSize: '18px',
                      fontWeight: 700,
                      borderRadius: '8px',
                      border: '1px solid var(--hw-border)',
                      outline: 'none',
                      backgroundColor: 'var(--hw-bg)'
                    }}
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
