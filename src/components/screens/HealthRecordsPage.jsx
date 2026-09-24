import React, { useState } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import { Modal } from '../common/Modal';
import {
  FileTextIcon,
  PlusIcon,
  DownloadIcon
} from '../common/Icons';

export const HealthRecordsPage = () => {
  const { healthRecords, addHealthRecord, deleteHealthRecord, addToast } = useHealthWallet();

  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Exact reference items from Panel 4
  const referenceRecords = [
    {
      id: 'rec-1',
      title: 'Complete Blood Count (CBC)',
      hospital: 'Apollo Hospital',
      date: '12 Mar 2024',
      category: 'Lab Reports',
      iconColor: '#dc2626',
      iconBg: '#fee2e2',
      summary: 'Hemoglobin: 14.2 g/dL, Total RBC: 4.8 mil/uL, Platelets: 240,000 /uL. All markers within normal limits.'
    },
    {
      id: 'rec-2',
      title: 'Chest X-Ray',
      hospital: 'Government Hospital',
      date: '02 Jan 2024',
      category: 'Imaging',
      iconColor: '#2563eb',
      iconBg: '#dbeafe',
      summary: 'Chest Radiograph (PA view). Normal bronchovascular markings. No focal consolidation or effusion.'
    },
    {
      id: 'rec-3',
      title: 'Diabetes Checkup',
      hospital: 'Kauvery Hospital',
      date: '18 Nov 2023',
      category: 'Lab Reports',
      iconColor: '#059669',
      iconBg: '#d1fae5',
      summary: 'Fasting Blood Glucose: 96 mg/dL. HbA1c: 5.4% (Non-diabetic range).'
    },
    {
      id: 'rec-4',
      title: 'Thyroid Profile',
      hospital: 'SRM Hospital',
      date: '05 Aug 2023',
      category: 'Lab Reports',
      iconColor: '#0d9488',
      iconBg: '#ccfbf1',
      summary: 'T3, T4, and TSH levels within physiological baseline. Thyroid functioning normal.'
    },
    {
      id: 'rec-5',
      title: 'ECG Report',
      hospital: 'MIOT Hospital',
      date: '21 Apr 2023',
      category: 'Consultations',
      iconColor: '#7c3aed',
      iconBg: '#ede9fe',
      summary: '12-lead ECG normal sinus rhythm at 72 bpm. Normal PR interval and ST segment.'
    }
  ];

  // Combine reference records with any user-added records
  const allRecords = [...referenceRecords, ...healthRecords.filter(r => !referenceRecords.some(ref => ref.id === r.id))];

  const filterOptions = ['All', 'Lab Reports', 'Prescriptions', 'Imaging', 'Consultations'];

  const filteredRecords = allRecords.filter(r =>
    activeFilter === 'All' || r.category === activeFilter
  );

  // New Record Form State
  const [newRec, setNewRec] = useState({
    title: '',
    category: 'Lab Reports',
    hospital: '',
    summary: ''
  });

  const handleCreateRecord = (e) => {
    e.preventDefault();
    if (!newRec.title || !newRec.hospital) return;

    addHealthRecord({
      title: newRec.title,
      category: newRec.category,
      hospital: newRec.hospital,
      doctor: 'Consultant Specialist',
      summary: newRec.summary || 'Diagnostic record added to citizen wallet.',
      tags: ['Manual Entry']
    });

    setNewRec({ title: '', category: 'Lab Reports', hospital: '', summary: '' });
    setShowAddModal(false);
    addToast('Record added successfully', 'success');
  };

  return (
    <div>
      {/* 1. Header (Panel 4 Reference) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 4px 0' }}>
            Health Records
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0 }}>
            All your medical records in one place.
          </p>
        </div>

        <button
          type="button"
          className="hw-btn hw-btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <PlusIcon size={16} />
          <span>Add Record</span>
        </button>
      </div>

      {/* 2. Filter Pills (Panel 4 Reference) */}
      <div className="hw-pills" style={{ marginBottom: '24px' }}>
        {filterOptions.map((opt) => (
          <button
            key={opt}
            type="button"
            className={`hw-pill-btn ${activeFilter === opt ? 'active' : ''}`}
            onClick={() => setActiveFilter(opt)}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* 3. Records List Rows (Panel 4 Reference) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredRecords.map((record) => (
          <div key={record.id} className="hw-record-row-ref">
            <div className="hw-record-row-left">
              <div
                className="hw-record-icon-box"
                style={{
                  background: record.iconBg || '#dbeafe',
                  color: record.iconColor || 'var(--hw-primary)'
                }}
              >
                <FileTextIcon size={20} />
              </div>
              <div>
                <div className="hw-record-name">{record.title}</div>
                <div className="hw-record-meta">{record.hospital}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <span style={{ fontSize: '13px', color: 'var(--hw-text-muted)', whiteSpace: 'nowrap' }}>
                {record.date}
              </span>

              <button
                type="button"
                className="hw-btn hw-btn-view"
                onClick={() => setSelectedRecord(record)}
              >
                View
              </button>

              {/* Three dots menu */}
              <button
                type="button"
                className="hw-btn hw-btn-ghost hw-btn-icon-only"
                style={{ color: '#94a3b8' }}
                onClick={() => {
                  deleteHealthRecord(record.id);
                  addToast('Record archived', 'info');
                }}
                title="Options"
                aria-label="More options"
              >
                <span style={{ fontSize: '18px', lineHeight: 1 }}>⋮</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Record View Modal */}
      {selectedRecord && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedRecord(null)}
          title={selectedRecord.title}
          footer={
            <>
              <button
                type="button"
                className="hw-btn hw-btn-secondary"
                onClick={() => setSelectedRecord(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="hw-btn hw-btn-primary"
                onClick={() => alert(`Downloading ${selectedRecord.title}.pdf`)}
              >
                <DownloadIcon size={15} />
                <span>Download Report</span>
              </button>
            </>
          }
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--hw-border)', marginBottom: '14px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>Hospital / Lab</div>
                <strong style={{ fontSize: '14px', color: 'var(--hw-text-main)' }}>{selectedRecord.hospital}</strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>Date</div>
                <strong style={{ fontSize: '13px', color: 'var(--hw-text-main)' }}>{selectedRecord.date}</strong>
              </div>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--hw-text-body)', lineHeight: '1.6', background: 'var(--hw-bg)', padding: '12px', borderRadius: '8px' }}>
              {selectedRecord.summary}
            </div>
          </div>
        </Modal>
      )}

      {/* Add Record Modal */}
      {showAddModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowAddModal(false)}
          title="Add Health Record"
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
                onClick={handleCreateRecord}
              >
                Save Record
              </button>
            </>
          }
        >
          <form onSubmit={handleCreateRecord}>
            <div className="hw-form-group">
              <label className="hw-label hw-label-required">Record Title</label>
              <input
                type="text"
                className="hw-input"
                placeholder="e.g. Complete Blood Count, Lipid Profile"
                value={newRec.title}
                onChange={e => setNewRec({ ...newRec, title: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="hw-form-group">
                <label className="hw-label hw-label-required">Category</label>
                <select
                  className="hw-select"
                  value={newRec.category}
                  onChange={e => setNewRec({ ...newRec, category: e.target.value })}
                >
                  <option value="Lab Reports">Lab Reports</option>
                  <option value="Prescriptions">Prescriptions</option>
                  <option value="Imaging">Imaging</option>
                  <option value="Consultations">Consultations</option>
                </select>
              </div>

              <div className="hw-form-group">
                <label className="hw-label hw-label-required">Hospital / Laboratory</label>
                <input
                  type="text"
                  className="hw-input"
                  placeholder="e.g. Apollo Hospital"
                  value={newRec.hospital}
                  onChange={e => setNewRec({ ...newRec, hospital: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="hw-form-group">
              <label className="hw-label">Findings Summary</label>
              <textarea
                className="hw-textarea"
                rows={3}
                placeholder="Key results or doctor notes..."
                value={newRec.summary}
                onChange={e => setNewRec({ ...newRec, summary: e.target.value })}
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
