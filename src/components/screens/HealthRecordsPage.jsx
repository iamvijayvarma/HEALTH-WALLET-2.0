import React, { useState } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import { Modal } from '../common/Modal';
import {
  FileTextIcon,
  PlusIcon,
  DownloadIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  CameraIcon
} from '../common/Icons';

export const HealthRecordsPage = () => {
  const {
    healthRecords,
    medicalReports = [],
    deleteMedicalReport,
    addHealthRecord,
    deleteHealthRecord,
    addToast,
    navigate
  } = useHealthWallet();

  // Filter Pills: 'Medical Reports' is active by default so newly saved reports appear immediately
  const [activeFilter, setActiveFilter] = useState('Medical Reports');
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Exact reference items from Panel 4 for general records
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

  // Combine records for General Records list view
  const userAddedRecords = healthRecords.filter(r => !referenceRecords.some(ref => ref.id === r.id));
  const allGeneralRecords = [...userAddedRecords, ...referenceRecords];

  const filterOptions = ['Medical Reports', 'All Records', 'Lab Reports', 'Prescriptions', 'Imaging', 'Consultations'];

  const filteredGeneralRecords = allGeneralRecords.filter(r =>
    activeFilter === 'All Records' || r.category === activeFilter
  );

  // New General Record Form State
  const [newRec, setNewRec] = useState({
    title: '',
    category: 'Lab Reports',
    hospital: '',
    summary: ''
  });

  const handleCreateGeneralRecord = (e) => {
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

  const handleConfirmDeleteReport = () => {
    if (!reportToDelete) return;
    deleteMedicalReport(reportToDelete.id);
    setReportToDelete(null);
  };

  return (
    <div>
      {/* 1. Header with Scan & Add Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 4px 0' }}>
            Health Records
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0 }}>
            All your medical reports and clinical documents in one place.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="hw-btn hw-btn-teal"
            onClick={() => navigate('scan')}
            style={{ gap: '6px' }}
          >
            <CameraIcon size={16} />
            <span>Scan Medical Report</span>
          </button>
          <button
            type="button"
            className="hw-btn hw-btn-secondary"
            onClick={() => setShowAddModal(true)}
            style={{ gap: '6px' }}
          >
            <PlusIcon size={16} />
            <span>Add Record</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Pills */}
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

      {/* ================================================================= */}
      {/* 3. MEDICAL REPORTS SECTION (Cards / Grid Layout)                  */}
      {/* ================================================================= */}
      {activeFilter === 'Medical Reports' && (
        <div>
          <div style={{ marginBottom: '18px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 4px 0' }}>
              Medical Reports
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0 }}>
              Digitized and verified medical and laboratory diagnostic reports.
            </p>
          </div>

          {/* Empty State */}
          {medicalReports.length === 0 ? (
            <div className="hw-empty-reports-card">
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'var(--hw-primary-light, #eef5fc)',
                  color: 'var(--hw-primary, #1e56a0)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}
              >
                <FileTextIcon size={32} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 6px 0' }}>
                No medical reports yet
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: '0 auto 22px auto', maxWidth: '420px', lineHeight: '1.5' }}>
                Scan your first medical report to build your digital health history.
              </p>
              <button
                type="button"
                className="hw-btn hw-btn-primary hw-btn-md"
                onClick={() => navigate('scan')}
                style={{ padding: '10px 24px', gap: '8px' }}
              >
                <CameraIcon size={18} />
                <span>Scan Medical Report</span>
              </button>
            </div>
          ) : (
            /* Responsive Grid / Cards */
            <div className="hw-medical-reports-grid">
              {medicalReports.map((report) => {
                const testCount = report.extractedTests?.length || report.tests?.length || 0;
                const testSnippet = (report.extractedTests || report.tests || [])
                  .slice(0, 3)
                  .map(t => `${t.value} ${t.unit || ''} ${t.name}`.trim())
                  .join(' • ');

                return (
                  <div key={report.id} className="hw-medical-report-card">
                    <div>
                      {/* Top Row: Report Type & User Verified Badge */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--hw-text-main)', margin: 0, lineHeight: '1.3' }}>
                          {report.reportType || report.title || 'Medical Laboratory Report'}
                        </h3>
                        <span
                          className="hw-badge hw-badge-teal"
                          style={{
                            fontSize: '11px',
                            padding: '3px 8px',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <CheckCircleIcon size={12} color="var(--hw-teal, #0d9488)" />
                          <span>{report.verificationStatus || 'User Verified'}</span>
                        </span>
                      </div>

                      {/* Hospital/Lab and Date */}
                      <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)', marginBottom: '14px', lineHeight: '1.4' }}>
                        <div style={{ fontWeight: 600, color: 'var(--hw-text-main)' }}>
                          {report.laboratory || report.hospital || 'Diagnostic Laboratory'}
                        </div>
                        <div style={{ color: 'var(--hw-text-muted)' }}>
                          {report.reportDate || report.date}
                        </div>
                      </div>

                      {/* Number of extracted tests */}
                      <div
                        style={{
                          background: 'var(--hw-bg)',
                          border: '1px solid var(--hw-border)',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          marginBottom: '16px'
                        }}
                      >
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--hw-primary)', marginBottom: '2px' }}>
                          {testCount} {testCount === 1 ? 'Extracted Test' : 'Extracted Tests'}
                        </div>
                        {testSnippet ? (
                          <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {testSnippet}
                          </div>
                        ) : (
                          <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)' }}>
                            Structured clinical parameters recorded
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions: [ View Report ] [ Delete ] */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid var(--hw-border)', gap: '8px' }}>
                      <button
                        type="button"
                        className="hw-btn hw-btn-primary hw-btn-sm"
                        onClick={() => setSelectedReport(report)}
                        style={{ padding: '6px 16px', fontSize: '12px' }}
                      >
                        View Report
                      </button>

                      <button
                        type="button"
                        className="hw-btn hw-btn-ghost hw-btn-sm"
                        onClick={() => setReportToDelete(report)}
                        style={{ color: 'var(--hw-danger)', padding: '6px 12px', fontSize: '12px' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* 4. GENERAL RECORDS LIST (For All Records, Lab, Prescriptions, etc.)*/}
      {/* ================================================================= */}
      {activeFilter !== 'Medical Reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredGeneralRecords.map((record) => (
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="hw-record-name">{record.title}</span>
                    {(record.verificationStatus === 'User Verified' || record.verificationStatus === 'User verified' || record.isUserVerified) && (
                      <span className="hw-badge hw-badge-teal" style={{ fontSize: '11px', padding: '2px 8px' }}>
                        ✓ User Verified
                      </span>
                    )}
                  </div>
                  <div className="hw-record-meta" style={{ marginTop: '2px' }}>
                    <span>{record.hospital || record.laboratory}</span>
                    {record.extractedTests && record.extractedTests.length > 0 && (
                      <span style={{ color: 'var(--hw-primary)', marginLeft: '6px', fontWeight: 500 }}>
                        • {record.extractedTests.length} tests recorded
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '13px', color: 'var(--hw-text-muted)', whiteSpace: 'nowrap' }}>
                  {record.date}
                </span>

                <button
                  type="button"
                  className="hw-btn hw-btn-view"
                  onClick={() => setSelectedReport(record)}
                >
                  View Report
                </button>

                <button
                  type="button"
                  className="hw-btn hw-btn-ghost hw-btn-icon-only"
                  style={{ color: '#94a3b8' }}
                  onClick={() => {
                    deleteHealthRecord(record.id);
                    addToast('Record archived', 'info');
                  }}
                  title="Delete record"
                  aria-label="Delete record"
                >
                  <span style={{ fontSize: '18px', lineHeight: 1 }}>⋮</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================================================================= */}
      {/* 5. VIEW REPORT DETAIL MODAL                                       */}
      {/* ================================================================= */}
      {selectedReport && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedReport(null)}
          title={selectedReport.reportType || selectedReport.title || 'Medical Report Details'}
          footer={
            <>
              <button
                type="button"
                className="hw-btn hw-btn-secondary"
                onClick={() => setSelectedReport(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="hw-btn hw-btn-primary"
                onClick={() => alert(`Downloading ${selectedReport.reportType || selectedReport.title}.pdf`)}
              >
                <DownloadIcon size={15} />
                <span>Download Report</span>
              </button>
            </>
          }
        >
          <div>
            {/* User Verified Status Banner */}
            <div
              style={{
                backgroundColor: 'var(--hw-teal-light, #f0fdfa)',
                border: '1px solid var(--hw-teal-border, #99f6e4)',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircleIcon size={16} color="var(--hw-teal, #0d9488)" />
                <span style={{ color: 'var(--hw-teal, #0d9488)', fontWeight: 700, fontSize: '13px' }}>
                  {selectedReport.verificationStatus || 'User Verified'}
                </span>
                <span style={{ color: 'var(--hw-text-muted)', fontSize: '12px' }}>
                  • Confirmed & saved by citizen
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--hw-text-muted)' }}>
                Saved: {selectedReport.createdAt ? new Date(selectedReport.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : (selectedReport.date || 'Today')}
              </span>
            </div>

            {/* Report Information Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px',
                paddingBottom: '14px',
                borderBottom: '1px solid var(--hw-border)',
                marginBottom: '16px'
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>Patient Name</div>
                <strong style={{ fontSize: '13px', color: 'var(--hw-text-main)' }}>{selectedReport.patientName || 'Vijay Rajan'}</strong>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>Report Type</div>
                <strong style={{ fontSize: '13px', color: 'var(--hw-text-main)' }}>{selectedReport.reportType || selectedReport.title}</strong>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>Report Date</div>
                <strong style={{ fontSize: '13px', color: 'var(--hw-text-main)' }}>{selectedReport.reportDate || selectedReport.date}</strong>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>Hospital / Laboratory</div>
                <strong style={{ fontSize: '13px', color: 'var(--hw-text-main)' }}>{selectedReport.laboratory || selectedReport.hospital}</strong>
              </div>
              {selectedReport.doctor && (
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>Consultant / Doctor</div>
                  <strong style={{ fontSize: '13px', color: 'var(--hw-text-main)' }}>{selectedReport.doctor}</strong>
                </div>
              )}
            </div>

            {/* Original Document Preview */}
            {selectedReport.originalDocument && (
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--hw-text-main)', marginBottom: '6px' }}>
                  Original Document
                </div>
                <div
                  style={{
                    backgroundColor: 'var(--hw-bg)',
                    borderRadius: '8px',
                    border: '1px solid var(--hw-border)',
                    padding: '8px',
                    textAlign: 'center',
                    maxHeight: '260px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {selectedReport.originalDocument !== 'pdf_document' ? (
                    <img
                      src={selectedReport.originalDocument}
                      alt="Original Medical Report"
                      style={{ maxHeight: '240px', maxWidth: '100%', objectFit: 'contain', borderRadius: '4px' }}
                    />
                  ) : (
                    <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <FileTextIcon size={32} color="var(--hw-primary)" />
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--hw-text-main)' }}>
                          Original Attached PDF Document
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)' }}>
                          Clinical diagnostic file preserved in wallet
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Extracted Test Values Table */}
            {(selectedReport.extractedTests || selectedReport.tests) && (selectedReport.extractedTests || selectedReport.tests).length > 0 ? (
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--hw-text-main)', marginBottom: '8px' }}>
                  Extracted Test Values ({ (selectedReport.extractedTests || selectedReport.tests).length } Parameters)
                </div>
                <div style={{ overflowX: 'auto', border: '1px solid var(--hw-border)', borderRadius: '8px' }}>
                  <table className="hw-table" style={{ fontSize: '12px', width: '100%', margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Test</th>
                        <th>Result</th>
                        <th>Unit</th>
                        <th>Reference Range</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedReport.extractedTests || selectedReport.tests).map((t, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600, color: 'var(--hw-text-main)' }}>{t.name}</td>
                          <td style={{ fontWeight: 700, color: 'var(--hw-primary)' }}>{t.value}</td>
                          <td style={{ color: 'var(--hw-text-muted)' }}>{t.unit || '—'}</td>
                          <td style={{ color: 'var(--hw-text-muted)', fontSize: '11px' }}>{t.referenceRange || 'Standard reference range'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: 'var(--hw-text-body)', lineHeight: '1.6', background: 'var(--hw-bg)', padding: '12px', borderRadius: '8px' }}>
                {selectedReport.summary || 'Clinical laboratory report with verified findings.'}
              </div>
            )}

            <div style={{ marginTop: '16px', fontSize: '11px', color: 'var(--hw-text-muted)', textAlign: 'right' }}>
              Designed with privacy-conscious healthcare architecture.
            </div>
          </div>
        </Modal>
      )}

      {/* ================================================================= */}
      {/* 6. DELETE CONFIRMATION MODAL                                      */}
      {/* ================================================================= */}
      {reportToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setReportToDelete(null)}
          title="Delete Medical Report"
          footer={
            <>
              <button
                type="button"
                className="hw-btn hw-btn-secondary"
                onClick={() => setReportToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="hw-btn hw-btn-danger"
                onClick={handleConfirmDeleteReport}
                style={{ backgroundColor: 'var(--hw-danger, #dc2626)', color: '#ffffff' }}
              >
                Delete Report
              </button>
            </>
          }
        >
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: 'var(--hw-danger-light, #fef2f2)',
                color: 'var(--hw-danger, #dc2626)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px'
              }}
            >
              <AlertTriangleIcon size={26} />
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 8px 0' }}>
              Delete this medical report?
            </h3>

            <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0, lineHeight: '1.5', maxWidth: '380px' }}>
              Are you sure you want to delete "{reportToDelete.reportType || reportToDelete.title}"? This action cannot be undone.
            </p>
          </div>
        </Modal>
      )}

      {/* ================================================================= */}
      {/* 7. ADD GENERAL RECORD MODAL                                       */}
      {/* ================================================================= */}
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
                onClick={handleCreateGeneralRecord}
              >
                Save Record
              </button>
            </>
          }
        >
          <form onSubmit={handleCreateGeneralRecord}>
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
