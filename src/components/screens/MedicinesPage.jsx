import React, { useState } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import { Modal } from '../common/Modal';
import {
  PillIcon,
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  CheckIcon
} from '../common/Icons';

export const MedicinesPage = () => {
  const { medicines, toggleMedicineTaken, addToast } = useHealthWallet();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '',
    timing: 'Morning',
    refillRemaining: 30
  });

  const adherenceCount = medicines.filter(m => m.takenToday).length;
  const adherencePercent = Math.round((adherenceCount / medicines.length) * 100);

  const handleAddMed = (e) => {
    e.preventDefault();
    if (!newMed.name) return;
    addToast(`Added ${newMed.name}`, 'success');
    setShowAddModal(false);
  };

  return (
    <div>
      {/* 1. Header matching reference style */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 4px 0' }}>
            Medicines
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0 }}>
            Track daily medications, dosage schedules, and refills.
          </p>
        </div>

        <button
          type="button"
          className="hw-btn hw-btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <PlusIcon size={16} />
          <span>Add Medicine</span>
        </button>
      </div>

      {/* 2. Adherence Summary Card */}
      <div className="hw-card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--hw-teal)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Daily Adherence
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 4px 0' }}>
              {adherenceCount} of {medicines.length} doses logged today
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--hw-text-muted)' }}>
              Regular adherence supports optimal health outcomes.
            </span>
          </div>

          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--hw-teal)' }}>
            {adherencePercent}%
          </div>
        </div>
      </div>

      {/* 3. Medicines List matching reference record row treatment */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {medicines.map((med) => (
          <div key={med.id} className="hw-record-row-ref" style={{ padding: '16px 20px' }}>
            <div className="hw-record-row-left">
              <div
                className="hw-record-icon-box"
                style={{
                  background: med.takenToday ? '#d1fae5' : '#f1f5f9',
                  color: med.takenToday ? '#059669' : '#64748b'
                }}
              >
                <PillIcon size={20} />
              </div>

              <div>
                <div className="hw-record-name">{med.name}</div>
                <div className="hw-record-meta">
                  {med.dosage} • <strong>{med.timing}</strong> • {med.refillRemaining} days remaining
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                className={`hw-btn ${med.takenToday ? 'hw-btn-secondary' : 'hw-btn-primary'} hw-btn-sm`}
                onClick={() => toggleMedicineTaken(med.id)}
              >
                {med.takenToday ? (
                  <>
                    <CheckIcon size={14} />
                    <span>Taken</span>
                  </>
                ) : (
                  <span>Mark as Taken</span>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Medicine Modal */}
      {showAddModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowAddModal(false)}
          title="Add Medicine"
          footer={
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
                onClick={handleAddMed}
              >
                Save Medicine
              </button>
            </>
          }
        >
          <form onSubmit={handleAddMed}>
            <div className="hw-form-group">
              <label className="hw-label hw-label-required">Medicine Name</label>
              <input
                type="text"
                className="hw-input"
                placeholder="e.g. Metformin 500mg"
                value={newMed.name}
                onChange={e => setNewMed({ ...newMed, name: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="hw-form-group">
                <label className="hw-label hw-label-required">Dosage</label>
                <input
                  type="text"
                  className="hw-input"
                  placeholder="e.g. 1 Tablet"
                  value={newMed.dosage}
                  onChange={e => setNewMed({ ...newMed, dosage: e.target.value })}
                  required
                />
              </div>

              <div className="hw-form-group">
                <label className="hw-label hw-label-required">Timing</label>
                <select
                  className="hw-select"
                  value={newMed.timing}
                  onChange={e => setNewMed({ ...newMed, timing: e.target.value })}
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Night">Night</option>
                  <option value="As Needed">As Needed</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
