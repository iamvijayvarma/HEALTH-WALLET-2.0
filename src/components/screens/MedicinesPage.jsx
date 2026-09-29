import React, { useState } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import { Modal } from '../common/Modal';
import {
  PillIcon,
  PlusIcon,
  ClockIcon,
  TrashIcon,
  ShieldIcon
} from '../common/Icons';

const FREQUENCY_OPTIONS = [
  'Once Daily',
  'Twice Daily',
  'Three Times Daily',
  'Four Times Daily',
  'As Needed'
];

const getFrequencyTimes = (frequency) => {
  switch (frequency) {
    case 'Once Daily':
      return ['08:00 AM'];
    case 'Twice Daily':
      return ['08:00 AM', '08:00 PM'];
    case 'Three Times Daily':
      return ['08:00 AM', '01:00 PM', '08:00 PM'];
    case 'Four Times Daily':
      return ['08:00 AM', '12:00 PM', '04:00 PM', '08:00 PM'];
    case 'As Needed':
      return ['As Needed'];
    default:
      return ['08:00 AM'];
  }
};

const formatDateDisplay = (dateStr) => {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  return dateStr;
};

const toISODate = (dateStr) => {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }
  return '';
};

export const MedicinesPage = () => {
  const {
    medicines = [],
    medicationLogs = {},
    medicationHistory = [],
    addMedicine,
    updateMedicine,
    deleteMedicine,
    setMedicineStatus,
    logMedicationDose
  } = useHealthWallet();

  const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const todayISO = new Date().toISOString().split('T')[0];

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [deletingMedicine, setDeletingMedicine] = useState(null);

  // Filter state for medicines list: 'Active' | 'Completed' | 'Paused' | 'All'
  const [statusFilter, setStatusFilter] = useState('Active');

  // Add / Edit Form State
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'Once Daily',
    startDate: todayISO,
    endDate: '',
    prescribedBy: '',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      dosage: '',
      frequency: 'Once Daily',
      startDate: todayISO,
      endDate: '',
      prescribedBy: '',
      notes: ''
    });
    setFormErrors({});
  };

  // Validation function (Requirement 14)
  const validateForm = (data) => {
    const errors = {};
    if (!data.name || !data.name.trim()) {
      errors.name = 'Medicine name is required.';
    }
    if (!data.dosage || !data.dosage.trim()) {
      errors.dosage = 'Dosage is required (e.g. 500 mg, 1 Tablet).';
    }
    if (!data.frequency) {
      errors.frequency = 'Please select a frequency.';
    }
    if (!data.startDate) {
      errors.startDate = 'Start date is required.';
    }
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (end < start) {
        errors.endDate = 'End date cannot be before start date.';
      }
    }
    return errors;
  };

  // Handle Add Medicine Submit
  const handleAddSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    addMedicine({
      name: formData.name,
      dosage: formData.dosage,
      frequency: formData.frequency,
      startDate: formatDateDisplay(formData.startDate),
      endDate: formData.endDate ? formatDateDisplay(formData.endDate) : '',
      prescribedBy: formData.prescribedBy,
      notes: formData.notes,
      status: 'Active'
    });

    setShowAddModal(false);
    resetForm();
  };

  // Handle Edit Medicine Submit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    updateMedicine(editingMedicine.id, {
      name: formData.name,
      dosage: formData.dosage,
      frequency: formData.frequency,
      startDate: formatDateDisplay(formData.startDate),
      endDate: formData.endDate ? formatDateDisplay(formData.endDate) : '',
      prescribedBy: formData.prescribedBy,
      notes: formData.notes,
      status: formData.status || editingMedicine.status || 'Active'
    });

    setEditingMedicine(null);
    resetForm();
  };

  // Open Edit Modal
  const handleOpenEdit = (med) => {
    setEditingMedicine(med);
    setFormData({
      name: med.name || '',
      dosage: med.dosage || '',
      frequency: med.frequency || 'Once Daily',
      startDate: toISODate(med.startDate) || todayISO,
      endDate: toISODate(med.endDate) || '',
      prescribedBy: med.prescribedBy || '',
      notes: med.notes || '',
      status: med.status || 'Active'
    });
    setFormErrors({});
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (deletingMedicine) {
      deleteMedicine(deletingMedicine.id);
      setDeletingMedicine(null);
    }
  };

  // Active medicines
  const activeMedicines = medicines.filter(m => (m.status || 'Active') === 'Active');

  // Filtered medicines for display
  const displayedMedicines = medicines.filter(m => {
    const status = m.status || 'Active';
    if (statusFilter === 'All') return true;
    return status === statusFilter;
  });

  // Calculate Today's scheduled doses
  const timeOrder = {
    '08:00 AM': 1,
    '12:00 PM': 2,
    '01:00 PM': 3,
    '04:00 PM': 4,
    '08:00 PM': 5,
    'As Needed': 6
  };

  const todaysDoses = [];
  activeMedicines.forEach(med => {
    const times = getFrequencyTimes(med.frequency);
    times.forEach(time => {
      const logKey = `${todayStr}-${med.id}-${time}`;
      const status = medicationLogs[logKey] || 'Pending';
      todaysDoses.push({
        medicineId: med.id,
        name: med.name,
        dosage: med.dosage,
        scheduledTime: time,
        frequency: med.frequency,
        status,
        logKey
      });
    });
  });

  // Sort doses chronologically
  todaysDoses.sort((a, b) => (timeOrder[a.scheduledTime] || 99) - (timeOrder[b.scheduledTime] || 99));

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* 1. Header (Requirement 1) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 4px 0' }}>
            Medicines
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0 }}>
            Manage your current medicines and keep your medication information organized.
          </p>
        </div>

        <button
          type="button"
          className="hw-btn hw-btn-primary"
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          style={{ padding: '8px 20px', gap: '8px' }}
        >
          <PlusIcon size={16} />
          <span>+ Add Medicine</span>
        </button>
      </div>

      {/* 2. Today's Medicines Section (Requirement 5 & 6) */}
      <div className="hw-card" style={{ padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PillIcon size={18} />
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--hw-text-main)', margin: 0 }}>
                Today's Medicines
              </h2>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--hw-text-muted)', margin: '4px 0 0 0' }}>
              Track scheduled doses for {todayStr}. Mark doses as Taken or Skipped as you take them.
            </p>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)', background: '#f8fafc', padding: '6px 12px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
            Doses logged today: <strong>{todaysDoses.filter(d => d.status === 'Taken').length}</strong> of {todaysDoses.length}
          </div>
        </div>

        {/* Empty State if no medication activity */}
        {todaysDoses.length === 0 ? (
          <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--hw-text-muted)', fontSize: '13px' }}>
            <p style={{ margin: '0 0 12px 0' }}>No medication activity recorded today.</p>
            <button
              type="button"
              className="hw-btn hw-btn-secondary hw-btn-sm"
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
            >
              Add Medicine
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {todaysDoses.map((dose, idx) => (
              <div
                key={`${dose.logKey}-${idx}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 18px',
                  borderRadius: '10px',
                  background: '#ffffff',
                  border: '1px solid var(--hw-border)',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                {/* Time & Medicine Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'var(--hw-primary, #1e56a0)',
                      background: 'var(--hw-primary-light, #eef5fc)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      minWidth: '82px',
                      textAlign: 'center'
                    }}
                  >
                    {dose.scheduledTime}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px' }} role="img" aria-label="Pill">💊</span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--hw-text-main)' }}>
                        {dose.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)' }}>
                        {dose.dosage} • {dose.frequency}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Indicator & Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Status Badge */}
                  <div>
                    {dose.status === 'Taken' && (
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: '#ecfdf5',
                          color: '#047857',
                          border: '1px solid #a7f3d0',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        ✓ Taken
                      </span>
                    )}
                    {dose.status === 'Skipped' && (
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: '#fffbeb',
                          color: '#d97706',
                          border: '1px solid #fde68a',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        — Skipped
                      </span>
                    )}
                    {dose.status === 'Pending' && (
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: '#f1f5f9',
                          color: '#64748b',
                          border: '1px solid #cbd5e1',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        ○ Pending
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {dose.status !== 'Taken' ? (
                      <button
                        type="button"
                        className="hw-btn hw-btn-green hw-btn-sm"
                        style={{ padding: '6px 14px' }}
                        onClick={() => logMedicationDose(dose.medicineId, todayStr, dose.scheduledTime, 'Taken')}
                      >
                        Mark Taken
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="hw-btn hw-btn-ghost hw-btn-sm"
                        style={{ padding: '6px 10px', fontSize: '11px', color: 'var(--hw-text-muted)' }}
                        onClick={() => logMedicationDose(dose.medicineId, todayStr, dose.scheduledTime, 'Pending')}
                      >
                        Undo
                      </button>
                    )}

                    {dose.status !== 'Skipped' ? (
                      <button
                        type="button"
                        className="hw-btn hw-btn-secondary hw-btn-sm"
                        style={{ padding: '6px 12px' }}
                        onClick={() => logMedicationDose(dose.medicineId, todayStr, dose.scheduledTime, 'Skipped')}
                      >
                        Skip
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="hw-btn hw-btn-ghost hw-btn-sm"
                        style={{ padding: '6px 10px', fontSize: '11px', color: 'var(--hw-text-muted)' }}
                        onClick={() => logMedicationDose(dose.medicineId, todayStr, dose.scheduledTime, 'Pending')}
                      >
                        Undo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Active Medicines Section (Requirement 4) */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 2px 0' }}>
              Your Medicines ({activeMedicines.length} Active)
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0 }}>
              Complete record of all current and past prescribed medications.
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
            {['Active', 'Completed', 'Paused', 'All'].map(filter => (
              <button
                key={filter}
                type="button"
                className="hw-btn hw-btn-ghost hw-btn-sm"
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: statusFilter === filter ? 600 : 500,
                  background: statusFilter === filter ? '#ffffff' : 'transparent',
                  color: statusFilter === filter ? 'var(--hw-text-main)' : 'var(--hw-text-muted)',
                  boxShadow: statusFilter === filter ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                }}
                onClick={() => setStatusFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Empty State: No active medicines (Requirement 10) */}
        {displayedMedicines.length === 0 ? (
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
              <PillIcon size={26} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--hw-text-main)', margin: '0 0 6px 0' }}>
              {statusFilter === 'Active' ? 'No active medicines' : `No ${statusFilter.toLowerCase()} medicines`}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: '0 0 18px 0', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
              Add your current medicines to keep your health information organized.
            </p>
            <button
              type="button"
              className="hw-btn hw-btn-primary"
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
            >
              + Add Medicine
            </button>
          </div>
        ) : (
          /* Cards Grid (Requirement 4) */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {displayedMedicines.map(med => {
              const status = med.status || 'Active';
              const statusColor =
                status === 'Active' ? { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' } :
                status === 'Completed' ? { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' } :
                { bg: '#fffbeb', text: '#d97706', border: '#fde68a' };

              return (
                <div
                  key={med.id}
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
                    {/* Header: Title + Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: status === 'Active' ? '#d1fae5' : '#f1f5f9',
                            color: status === 'Active' ? '#059669' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <PillIcon size={18} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--hw-text-main)', margin: 0 }}>
                            {med.name}
                          </h3>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--hw-primary, #1e56a0)', marginTop: '2px' }}>
                            {med.dosage}
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: statusColor.bg,
                          color: statusColor.text,
                          border: `1px solid ${statusColor.border}`
                        }}
                      >
                        {status}
                      </span>
                    </div>

                    {/* Metadata details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--hw-text-body)', marginTop: '12px' }}>
                      <div>
                        <strong style={{ color: 'var(--hw-text-main)' }}>Frequency:</strong> {med.frequency}
                      </div>
                      <div>
                        <strong style={{ color: 'var(--hw-text-main)' }}>Started:</strong> {formatDateDisplay(med.startDate)}
                      </div>
                      <div>
                        <strong style={{ color: 'var(--hw-text-main)' }}>Ends:</strong> {med.endDate ? formatDateDisplay(med.endDate) : 'Ongoing'}
                      </div>
                      {med.prescribedBy && (
                        <div>
                          <strong style={{ color: 'var(--hw-text-main)' }}>Prescribed by:</strong> {med.prescribedBy}
                        </div>
                      )}
                      {med.notes && (
                        <div style={{ marginTop: '4px', padding: '8px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', color: 'var(--hw-text-muted)' }}>
                          <em>Note:</em> {med.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions (Requirement 4) */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--hw-border)' }}>
                    <div>
                      {status === 'Active' ? (
                        <button
                          type="button"
                          className="hw-btn hw-btn-ghost hw-btn-sm"
                          style={{ color: '#047857', padding: '4px 8px', fontSize: '11px', fontWeight: 600 }}
                          onClick={() => setMedicineStatus(med.id, 'Completed')}
                        >
                          Mark as Completed
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="hw-btn hw-btn-ghost hw-btn-sm"
                          style={{ color: 'var(--hw-primary)', padding: '4px 8px', fontSize: '11px', fontWeight: 600 }}
                          onClick={() => setMedicineStatus(med.id, 'Active')}
                        >
                          Mark as Active
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="hw-btn hw-btn-secondary hw-btn-sm"
                        style={{ padding: '4px 10px', fontSize: '11px' }}
                        onClick={() => handleOpenEdit(med)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="hw-btn hw-btn-danger hw-btn-sm"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        onClick={() => setDeletingMedicine(med)}
                        title="Delete medicine"
                      >
                        <TrashIcon size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Medicine History Section (Requirement 7) */}
      <div className="hw-card" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClockIcon size={18} style={{ color: 'var(--hw-primary, #1e56a0)' }} />
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--hw-text-main)', margin: 0 }}>
                Medicine History
              </h2>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--hw-text-muted)', margin: '4px 0 0 0' }}>
              Log of recorded medication doses.
            </p>
          </div>
        </div>

        {medicationHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--hw-text-muted)', fontSize: '13px' }}>
            No medication history recorded yet. As doses are marked Taken or Skipped, they will appear here.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--hw-border)', textAlign: 'left', color: 'var(--hw-text-muted)' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Medicine</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Dosage</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Scheduled Time</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {medicationHistory.slice(0, 15).map((hist) => (
                  <tr key={hist.id} style={{ borderBottom: '1px solid var(--hw-border)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--hw-text-main)' }}>
                      {hist.medicineName}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--hw-text-body)' }}>
                      {hist.dosage}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--hw-text-muted)' }}>
                      {hist.date}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--hw-text-muted)' }}>
                      {hist.scheduledTime}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {hist.status === 'Taken' ? (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: '#ecfdf5',
                            color: '#047857',
                            border: '1px solid #a7f3d0'
                          }}
                        >
                          Taken
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: '#fffbeb',
                            color: '#d97706',
                            border: '1px solid #fde68a'
                          }}
                        >
                          Skipped
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Safety & Healthcare Notice (Requirement 15) */}
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
            Medication Safety Notice
          </div>
          <div>
            Medication information is user-entered and should be followed according to the prescription or advice provided by a qualified healthcare professional.
          </div>
          <div style={{ marginTop: '4px', fontSize: '11px', color: '#94a3b8' }}>
            This application is for medication organization and tracking only. It does not provide medical recommendations, automatic dosage alterations, or clinical diagnoses.
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ADD MEDICINE MODAL (Requirement 2 & 14)                                   */}
      {/* ========================================================================= */}
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
                onClick={handleAddSubmit}
              >
                Save Medicine
              </button>
            </>
          }
        >
          <form onSubmit={handleAddSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Medicine Name */}
              <div className="hw-form-group">
                <label className="hw-label hw-label-required">Medicine Name</label>
                <input
                  type="text"
                  className={`hw-input ${formErrors.name ? 'hw-input-error' : ''}`}
                  placeholder="e.g. Metformin"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: null });
                  }}
                />
                {formErrors.name && (
                  <span style={{ fontSize: '11px', color: 'var(--hw-danger)', marginTop: '4px', display: 'block' }}>
                    {formErrors.name}
                  </span>
                )}
              </div>

              {/* Dosage & Frequency */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="hw-form-group">
                  <label className="hw-label hw-label-required">Dosage</label>
                  <input
                    type="text"
                    className={`hw-input ${formErrors.dosage ? 'hw-input-error' : ''}`}
                    placeholder="e.g. 500 mg, 1 Tablet"
                    value={formData.dosage}
                    onChange={(e) => {
                      setFormData({ ...formData, dosage: e.target.value });
                      if (formErrors.dosage) setFormErrors({ ...formErrors, dosage: null });
                    }}
                  />
                  {formErrors.dosage && (
                    <span style={{ fontSize: '11px', color: 'var(--hw-danger)', marginTop: '4px', display: 'block' }}>
                      {formErrors.dosage}
                    </span>
                  )}
                </div>

                <div className="hw-form-group">
                  <label className="hw-label hw-label-required">Frequency</label>
                  <select
                    className="hw-select"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  >
                    {FREQUENCY_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Start Date & End Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="hw-form-group">
                  <label className="hw-label hw-label-required">Start Date</label>
                  <input
                    type="date"
                    className={`hw-input ${formErrors.startDate ? 'hw-input-error' : ''}`}
                    value={formData.startDate}
                    onChange={(e) => {
                      setFormData({ ...formData, startDate: e.target.value });
                      if (formErrors.startDate) setFormErrors({ ...formErrors, startDate: null });
                    }}
                  />
                  {formErrors.startDate && (
                    <span style={{ fontSize: '11px', color: 'var(--hw-danger)', marginTop: '4px', display: 'block' }}>
                      {formErrors.startDate}
                    </span>
                  )}
                </div>

                <div className="hw-form-group">
                  <label className="hw-label">End Date (Optional)</label>
                  <input
                    type="date"
                    className={`hw-input ${formErrors.endDate ? 'hw-input-error' : ''}`}
                    value={formData.endDate}
                    onChange={(e) => {
                      setFormData({ ...formData, endDate: e.target.value });
                      if (formErrors.endDate) setFormErrors({ ...formErrors, endDate: null });
                    }}
                  />
                  {formErrors.endDate && (
                    <span style={{ fontSize: '11px', color: 'var(--hw-danger)', marginTop: '4px', display: 'block' }}>
                      {formErrors.endDate}
                    </span>
                  )}
                </div>
              </div>

              {/* Prescribed By */}
              <div className="hw-form-group">
                <label className="hw-label">Prescribed By</label>
                <input
                  type="text"
                  className="hw-input"
                  placeholder="e.g. Dr. Kumar"
                  value={formData.prescribedBy}
                  onChange={(e) => setFormData({ ...formData, prescribedBy: e.target.value })}
                />
              </div>

              {/* Notes */}
              <div className="hw-form-group">
                <label className="hw-label">Notes (Instructions, with meals, etc.)</label>
                <textarea
                  className="hw-input"
                  style={{ minHeight: '64px', resize: 'vertical' }}
                  placeholder="e.g. Take with morning and evening meals"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', background: '#f8fafc', padding: '8px 10px', borderRadius: '6px' }}>
                Note: Do not enter estimated dosages without healthcare guidance.
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* EDIT MEDICINE MODAL (Requirement 8 & 14)                                  */}
      {/* ========================================================================= */}
      {editingMedicine && (
        <Modal
          isOpen={true}
          onClose={() => setEditingMedicine(null)}
          title={`Edit ${editingMedicine.name}`}
          footer={
            <>
              <button
                type="button"
                className="hw-btn hw-btn-secondary"
                onClick={() => setEditingMedicine(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="hw-btn hw-btn-primary"
                onClick={handleEditSubmit}
              >
                Save Changes
              </button>
            </>
          }
        >
          <form onSubmit={handleEditSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Medicine Name */}
              <div className="hw-form-group">
                <label className="hw-label hw-label-required">Medicine Name</label>
                <input
                  type="text"
                  className={`hw-input ${formErrors.name ? 'hw-input-error' : ''}`}
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: null });
                  }}
                />
                {formErrors.name && (
                  <span style={{ fontSize: '11px', color: 'var(--hw-danger)', marginTop: '4px', display: 'block' }}>
                    {formErrors.name}
                  </span>
                )}
              </div>

              {/* Dosage & Frequency */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="hw-form-group">
                  <label className="hw-label hw-label-required">Dosage</label>
                  <input
                    type="text"
                    className={`hw-input ${formErrors.dosage ? 'hw-input-error' : ''}`}
                    value={formData.dosage}
                    onChange={(e) => {
                      setFormData({ ...formData, dosage: e.target.value });
                      if (formErrors.dosage) setFormErrors({ ...formErrors, dosage: null });
                    }}
                  />
                  {formErrors.dosage && (
                    <span style={{ fontSize: '11px', color: 'var(--hw-danger)', marginTop: '4px', display: 'block' }}>
                      {formErrors.dosage}
                    </span>
                  )}
                </div>

                <div className="hw-form-group">
                  <label className="hw-label hw-label-required">Frequency</label>
                  <select
                    className="hw-select"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  >
                    {FREQUENCY_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Start Date & End Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="hw-form-group">
                  <label className="hw-label hw-label-required">Start Date</label>
                  <input
                    type="date"
                    className={`hw-input ${formErrors.startDate ? 'hw-input-error' : ''}`}
                    value={formData.startDate}
                    onChange={(e) => {
                      setFormData({ ...formData, startDate: e.target.value });
                      if (formErrors.startDate) setFormErrors({ ...formErrors, startDate: null });
                    }}
                  />
                  {formErrors.startDate && (
                    <span style={{ fontSize: '11px', color: 'var(--hw-danger)', marginTop: '4px', display: 'block' }}>
                      {formErrors.startDate}
                    </span>
                  )}
                </div>

                <div className="hw-form-group">
                  <label className="hw-label">End Date</label>
                  <input
                    type="date"
                    className={`hw-input ${formErrors.endDate ? 'hw-input-error' : ''}`}
                    value={formData.endDate}
                    onChange={(e) => {
                      setFormData({ ...formData, endDate: e.target.value });
                      if (formErrors.endDate) setFormErrors({ ...formErrors, endDate: null });
                    }}
                  />
                  {formErrors.endDate && (
                    <span style={{ fontSize: '11px', color: 'var(--hw-danger)', marginTop: '4px', display: 'block' }}>
                      {formErrors.endDate}
                    </span>
                  )}
                </div>
              </div>

              {/* Prescribed By & Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="hw-form-group">
                  <label className="hw-label">Prescribed By</label>
                  <input
                    type="text"
                    className="hw-input"
                    value={formData.prescribedBy}
                    onChange={(e) => setFormData({ ...formData, prescribedBy: e.target.value })}
                  />
                </div>

                <div className="hw-form-group">
                  <label className="hw-label">Status</label>
                  <select
                    className="hw-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Paused">Paused</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="hw-form-group">
                <label className="hw-label">Notes</label>
                <textarea
                  className="hw-input"
                  style={{ minHeight: '64px', resize: 'vertical' }}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL (Requirement 9)                                */}
      {/* ========================================================================= */}
      {deletingMedicine && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingMedicine(null)}
          title="Delete Medicine?"
          footer={
            <>
              <button
                type="button"
                className="hw-btn hw-btn-secondary"
                onClick={() => setDeletingMedicine(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="hw-btn hw-btn-danger"
                onClick={handleConfirmDelete}
              >
                Delete Medicine
              </button>
            </>
          }
        >
          <div>
            <p style={{ fontSize: '14px', color: 'var(--hw-text-main)', margin: '0 0 12px 0' }}>
              Are you sure you want to remove this medicine from your Health Wallet?
            </p>
            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
              <strong>{deletingMedicine.name}</strong> ({deletingMedicine.dosage})
              <div style={{ color: 'var(--hw-text-muted)', fontSize: '12px', marginTop: '2px' }}>
                Frequency: {deletingMedicine.frequency}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
