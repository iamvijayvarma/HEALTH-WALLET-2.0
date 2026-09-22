import React, { useState } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  FileTextIcon,
  SearchIcon,
  PlusIcon,
  DownloadIcon,
  TrashIcon,
  CheckCircleIcon,
  CalendarIcon,
  CameraIcon,
  UploadIcon,
  EyeIcon,
  ShareIcon,
  AlertCircleIcon
} from '../common/Icons';

export const HealthRecordsPage = () => {
  const { healthRecords, addHealthRecord, deleteHealthRecord, navigate } = useHealthWallet();

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  // New Record Form State
  const [newRecord, setNewRecord] = useState({
    title: '',
    category: 'Lab Reports',
    hospital: '',
    doctor: '',
    summary: '',
    tags: ''
  });

  const categories = ['All', 'Lab Reports', 'Prescriptions', 'Imaging', 'Consultations'];

  const filteredRecords = healthRecords.filter((rec) => {
    const matchesCategory = activeCategory === 'All' || rec.category === activeCategory;
    const matchesSearch =
      rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateRecord = (e) => {
    e.preventDefault();
    if (!newRecord.title || !newRecord.hospital) return;

    addHealthRecord({
      title: newRecord.title,
      category: newRecord.category,
      hospital: newRecord.hospital,
      doctor: newRecord.doctor || 'Registered Medical Practitioner',
      summary: newRecord.summary || 'Diagnostic test verified and added to citizen health wallet.',
      tags: newRecord.tags ? newRecord.tags.split(',').map(t => t.trim()) : ['Manual Entry']
    });

    setNewRecord({
      title: '',
      category: 'Lab Reports',
      hospital: '',
      doctor: '',
      summary: '',
      tags: ''
    });
    setShowUploadModal(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="hw-page-header">
        <div className="hw-page-header-text">
          <h1>Health Records</h1>
          <p>All your medical records, diagnostic reports, and prescriptions in one secure place.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="secondary" icon={CameraIcon} onClick={() => navigate('scan')}>
            Scan with AI
          </Button>
          <Button variant="primary" icon={PlusIcon} onClick={() => setShowUploadModal(true)}>
            Add Record
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="hw-card" style={{ padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          {/* Category Filter Pills */}
          <div className="hw-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`hw-pill-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Inline Search */}
          <div style={{ position: 'relative', width: '280px' }}>
            <div className="hw-input-prefix-icon">
              <SearchIcon size={15} />
            </div>
            <input
              type="text"
              className="hw-input"
              placeholder="Filter current view..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ height: '36px', paddingLeft: '34px', fontSize: '13px' }}
            />
          </div>
        </div>
      </div>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <div className="hw-card hw-empty-state">
          <div className="hw-empty-icon">
            <FileTextIcon size={28} />
          </div>
          <h3 className="hw-empty-title">No matching health records found</h3>
          <p className="hw-empty-desc">
            Try adjusting your search criteria or upload a new medical document.
          </p>
          <Button variant="primary" icon={PlusIcon} onClick={() => setShowUploadModal(true)}>
            Upload New Record
          </Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredRecords.map((record) => {
            const isLab = record.category === 'Lab Reports';
            const isImaging = record.category === 'Imaging';
            const isRx = record.category === 'Prescriptions';

            return (
              <div
                key={record.id}
                className="hw-card hw-card-hover"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  gap: '16px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '260px', flex: 1 }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      backgroundColor: isLab ? 'var(--hw-teal-light)' : isImaging ? 'var(--hw-primary-light)' : isRx ? 'var(--hw-warning-light)' : 'var(--hw-bg-subtle)',
                      color: isLab ? 'var(--hw-teal)' : isImaging ? 'var(--hw-primary)' : isRx ? 'var(--hw-warning)' : 'var(--hw-text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <FileTextIcon size={22} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--hw-text-main)', margin: 0 }}>
                        {record.title}
                      </h3>
                      <span className="hw-badge hw-badge-neutral">{record.category}</span>
                      {record.verified && (
                        <span className="hw-badge hw-badge-green" title="Digitally signed with ABDM standard">
                          <CheckCircleIcon size={11} /> Verified
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)' }}>
                      <strong>{record.hospital}</strong> • Attending: {record.doctor}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--hw-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CalendarIcon size={14} />
                    <span>{record.date}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={EyeIcon}
                      onClick={() => setSelectedRecord(record)}
                    >
                      View
                    </Button>
                    <button
                      type="button"
                      className="hw-btn hw-btn-ghost hw-btn-sm hw-btn-icon-only"
                      onClick={() => setRecordToDelete(record)}
                      style={{ color: 'var(--hw-text-muted)' }}
                      title="Archive or delete record"
                      aria-label="Archive record"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Record Details Modal */}
      {selectedRecord && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedRecord(null)}
          title={selectedRecord.title}
          footer={
            <>
              <Button variant="secondary" onClick={() => setSelectedRecord(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                icon={DownloadIcon}
                onClick={() => {
                  alert(`Downloading certified PDF for ${selectedRecord.title}`);
                }}
              >
                Download Signed PDF
              </Button>
            </>
          }
        >
          <div>
            <div style={{ background: 'var(--hw-bg)', padding: '16px', borderRadius: '10px', marginBottom: '20px', border: '1px solid var(--hw-border)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>Healthcare Provider</div>
                  <strong style={{ fontSize: '13px', color: 'var(--hw-text-main)' }}>{selectedRecord.hospital}</strong>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>Attending Clinician</div>
                  <strong style={{ fontSize: '13px', color: 'var(--hw-text-main)' }}>{selectedRecord.doctor}</strong>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>Category & Type</div>
                  <div style={{ fontSize: '13px', color: 'var(--hw-text-main)' }}>{selectedRecord.category}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>Date of Record</div>
                  <div style={{ fontSize: '13px', color: 'var(--hw-text-main)' }}>{selectedRecord.date}</div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--hw-text-main)', marginBottom: '8px' }}>
                Clinical Diagnostic Summary
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--hw-text-body)', lineHeight: '1.6', background: '#ffffff', border: '1px solid var(--hw-border)', padding: '12px', borderRadius: '8px' }}>
                {selectedRecord.summary}
              </p>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--hw-text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                Standard Clinical Tags
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {selectedRecord.tags.map((tag, idx) => (
                  <span key={idx} className="hw-badge hw-badge-neutral">#{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload Record Modal */}
      {showUploadModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowUploadModal(false)}
          title="Add New Health Record"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" icon={UploadIcon} onClick={handleCreateRecord}>
                Save to Health Wallet
              </Button>
            </>
          }
        >
          <form onSubmit={handleCreateRecord}>
            <div className="hw-form-group">
              <label className="hw-label hw-label-required">Record Title</label>
              <input
                type="text"
                className="hw-input"
                placeholder="e.g. Lipid Profile, Ultrasound Abdomen, Dental Prescription"
                value={newRecord.title}
                onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="hw-form-group">
                <label className="hw-label hw-label-required">Record Category</label>
                <select
                  className="hw-select"
                  value={newRecord.category}
                  onChange={(e) => setNewRecord({ ...newRecord, category: e.target.value })}
                >
                  <option value="Lab Reports">Lab Reports</option>
                  <option value="Prescriptions">Prescriptions</option>
                  <option value="Imaging">Imaging (X-Ray / CT / MRI)</option>
                  <option value="Consultations">Consultation Summary</option>
                </select>
              </div>

              <div className="hw-form-group">
                <label className="hw-label hw-label-required">Hospital / Laboratory</label>
                <input
                  type="text"
                  className="hw-input"
                  placeholder="e.g. Apollo Hospital, Greams Rd"
                  value={newRecord.hospital}
                  onChange={(e) => setNewRecord({ ...newRecord, hospital: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="hw-form-group">
              <label className="hw-label">Doctor Name</label>
              <input
                type="text"
                className="hw-input"
                placeholder="e.g. Dr. K. Narayanan, MD"
                value={newRecord.doctor}
                onChange={(e) => setNewRecord({ ...newRecord, doctor: e.target.value })}
              />
            </div>

            <div className="hw-form-group">
              <label className="hw-label">Findings / Clinical Summary</label>
              <textarea
                className="hw-textarea"
                rows={3}
                placeholder="Key results, doctor instructions, or medication dosages..."
                value={newRecord.summary}
                onChange={(e) => setNewRecord({ ...newRecord, summary: e.target.value })}
              />
            </div>

            <div className="hw-form-group">
              <label className="hw-label">Tags (comma separated)</label>
              <input
                type="text"
                className="hw-input"
                placeholder="e.g. Cardiology, Routine, Annual"
                value={newRecord.tags}
                onChange={(e) => setNewRecord({ ...newRecord, tags: e.target.value })}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Delete / Archive Confirmation Modal */}
      {recordToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setRecordToDelete(null)}
          title="Confirm Record Deletion"
          footer={
            <>
              <Button variant="secondary" onClick={() => setRecordToDelete(null)}>
                Keep Record
              </Button>
              <Button
                variant="danger"
                icon={TrashIcon}
                onClick={() => {
                  deleteHealthRecord(recordToDelete.id);
                  setRecordToDelete(null);
                }}
              >
                Archive / Delete
              </Button>
            </>
          }
        >
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--hw-danger)', flexShrink: 0 }}>
              <AlertCircleIcon size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--hw-text-main)', margin: '0 0 6px 0' }}>
                Are you sure you want to remove this record?
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', lineHeight: '1.5', margin: '0 0 10px 0' }}>
                <strong>{recordToDelete.title}</strong> ({recordToDelete.hospital}) will be removed from your active wallet. Under public health governance guidelines, an immutable audit receipt will remain in your access logs.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
