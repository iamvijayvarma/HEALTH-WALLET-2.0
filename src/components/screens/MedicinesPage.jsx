import React, { useState } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  PillIcon,
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertTriangleIcon,
  RefreshIcon,
  CheckIcon
} from '../common/Icons';

export const MedicinesPage = () => {
  const { medicines, toggleMedicineTaken, addToast } = useHealthWallet();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '',
    timing: 'Morning (Post Breakfast)',
    category: 'Maintenance',
    prescribedBy: '',
    refillRemaining: 30
  });

  const adherenceCount = medicines.filter(m => m.takenToday).length;
  const adherencePercent = Math.round((adherenceCount / medicines.length) * 100);

  const handleAddMedicine = (e) => {
    e.preventDefault();
    if (!newMed.name) return;

    addToast(`Added ${newMed.name} to active prescriptions`, 'success');
    setShowAddModal(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="hw-page-header">
        <div className="hw-page-header-text">
          <h1>Active Medicines & Prescriptions</h1>
          <p>Track your daily medication schedule, verify dosages, and manage refills.</p>
        </div>
        <Button variant="primary" icon={PlusIcon} onClick={() => setShowAddModal(true)}>
          Add Medication
        </Button>
      </div>

      {/* Adherence Overview Banner */}
      <div className="hw-card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #ffffff 0%, var(--hw-teal-light) 100%)', border: '1px solid var(--hw-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--hw-teal)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircleIcon size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 4px 0' }}>
                Daily Adherence: {adherenceCount} of {medicines.length} doses logged today
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0 }}>
                {adherencePercent === 100 ? 'Excellent! All prescribed doses completed for today.' : 'Keep your adherence regular to optimize clinical outcomes.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--hw-teal)' }}>{adherencePercent}%</span>
            <div style={{ width: '100px', height: '8px', borderRadius: '4px', backgroundColor: '#cbd5e1', overflow: 'hidden' }}>
              <div style={{ width: `${adherencePercent}%`, height: '100%', backgroundColor: 'var(--hw-teal)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Medicines List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {medicines.map((med) => {
          const isLowStock = med.refillRemaining <= 14;

          return (
            <div
              key={med.id}
              className="hw-card hw-card-hover"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 22px',
                gap: '16px',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '260px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '10px',
                    backgroundColor: med.takenToday ? 'var(--hw-green-light)' : 'var(--hw-bg-subtle)',
                    color: med.takenToday ? 'var(--hw-green)' : 'var(--hw-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <PillIcon size={22} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--hw-text-main)', margin: 0 }}>
                      {med.name}
                    </h3>
                    <span className="hw-badge hw-badge-neutral">{med.category}</span>
                    {isLowStock && (
                      <span className="hw-badge hw-badge-warning">
                        <AlertTriangleIcon size={11} /> {med.refillRemaining} days left
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--hw-text-muted)' }}>
                    <strong>{med.dosage}</strong> • Timing: <strong>{med.timing}</strong> • Prescribed by {med.prescribedBy}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Button
                  variant={med.takenToday ? 'secondary' : 'primary'}
                  size="sm"
                  icon={med.takenToday ? CheckIcon : ClockIcon}
                  onClick={() => toggleMedicineTaken(med.id)}
                >
                  {med.takenToday ? 'Taken Today' : 'Mark as Taken'}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  icon={RefreshIcon}
                  onClick={() => addToast(`Refill request submitted to local pharmacy for ${med.name}`, 'info')}
                >
                  Request Refill
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Medicine Modal */}
      {showAddModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowAddModal(false)}
          title="Add Prescription Medicine"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAddMedicine}>
                Save Medication
              </Button>
            </>
          }
        >
          <form onSubmit={handleAddMedicine}>
            <div className="hw-form-group">
              <label className="hw-label hw-label-required">Medication / Generic Name</label>
              <input
                type="text"
                className="hw-input"
                placeholder="e.g. Metformin 500mg, Atorvastatin 10mg"
                value={newMed.name}
                onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="hw-form-group">
                <label className="hw-label hw-label-required">Dosage Strength</label>
                <input
                  type="text"
                  className="hw-input"
                  placeholder="e.g. 1 Tablet, 2 Puffs"
                  value={newMed.dosage}
                  onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                  required
                />
              </div>

              <div className="hw-form-group">
                <label className="hw-label hw-label-required">Frequency & Timing</label>
                <select
                  className="hw-select"
                  value={newMed.timing}
                  onChange={(e) => setNewMed({ ...newMed, timing: e.target.value })}
                >
                  <option value="Morning (Post Breakfast)">Morning (Post Breakfast)</option>
                  <option value="Afternoon (Post Lunch)">Afternoon (Post Lunch)</option>
                  <option value="Night (Bedtime)">Night (Bedtime)</option>
                  <option value="SOS (As Needed)">SOS (As Needed)</option>
                </select>
              </div>
            </div>

            <div className="hw-form-group">
              <label className="hw-label">Prescribing Physician</label>
              <input
                type="text"
                className="hw-input"
                placeholder="e.g. Dr. V. Rajesh, MD"
                value={newMed.prescribedBy}
                onChange={(e) => setNewMed({ ...newMed, prescribedBy: e.target.value })}
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
