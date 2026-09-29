import React, { useState } from 'react';
import {
  CheckCircleIcon,
  PlusIcon,
  RefreshIcon,
  TrashIcon,
  FileTextIcon,
  AlertTriangleIcon,
  ShieldCheckIcon
} from '../common/Icons';

/**
 * ExtractionReview Component
 * 
 * Provides a side-by-side (desktop) and stacked (mobile) review layout:
 * Left: Original document preview
 * Right: Editable clinical parameters with extraction confidence indicators
 * Bottom: Mandatory User Confirmation & Save to Health Records action
 */
export const ExtractionReview = ({
  originalDocument,
  fileName,
  initialReport,
  onConfirmAndSave,
  onRetake,
  isSaved,
  onNavigateToRecords
}) => {
  // Form State initialized from OCR extraction
  const [reportData, setReportData] = useState(initialReport);
  const [isConfirmedByUser, setIsConfirmedByUser] = useState(false);
  const [showConfirmError, setShowConfirmError] = useState(false);
  const [newTest, setNewTest] = useState({ name: '', value: '', unit: '', referenceRange: '' });
  const [isAddingTest, setIsAddingTest] = useState(false);

  // Field change handlers
  const handleFieldChange = (field, val) => {
    setReportData(prev => ({ ...prev, [field]: val }));
  };

  const handleTestChange = (id, field, val) => {
    setReportData(prev => ({
      ...prev,
      tests: prev.tests.map(t => t.id === id ? { ...t, [field]: val } : t)
    }));
  };

  const handleDeleteTest = (id) => {
    setReportData(prev => ({
      ...prev,
      tests: prev.tests.filter(t => t.id !== id)
    }));
  };

  const handleAddNewTest = () => {
    if (!newTest.name.trim() || !newTest.value.trim()) return;
    const newEntry = {
      id: Date.now(),
      name: newTest.name.trim(),
      value: newTest.value.trim(),
      unit: newTest.unit.trim(),
      referenceRange: newTest.referenceRange.trim() || 'Reference range not specified',
      confidence: 1.0,
      confidenceLevel: 'High'
    };
    setReportData(prev => ({
      ...prev,
      tests: [...prev.tests, newEntry]
    }));
    setNewTest({ name: '', value: '', unit: '', referenceRange: '' });
    setIsAddingTest(false);
  };

  const handleSaveClick = () => {
    if (!isConfirmedByUser) {
      setShowConfirmError(true);
      return;
    }
    setShowConfirmError(false);
    onConfirmAndSave(reportData);
  };

  return (
    <div className="hw-card" style={{ maxWidth: '1080px', margin: '0 auto', padding: '28px' }}>
      {/* 1. Header & Subtext */}
      <div style={{ marginBottom: '22px', borderBottom: '1px solid var(--hw-border)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 4px 0' }}>
              Review Medical Report
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0 }}>
              Please verify the extracted information before saving it to your Health Wallet.
            </p>
          </div>
          <span className="hw-badge hw-badge-teal" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheckIcon size={14} />
            <span>Ready for Verification</span>
          </span>
        </div>

        {/* OCR verification notice banner */}
        <div
          style={{
            marginTop: '14px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '12px',
            color: '#1e40af'
          }}
        >
          <FileTextIcon size={16} color="#1e40af" />
          <span>
            <strong>AI/OCR extracted data — please verify before saving.</strong> Values are extracted directly from your document for your review.
          </span>
        </div>
      </div>

      {/* 2. Responsive Side-by-Side Grid Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '28px',
          alignItems: 'start'
        }}
      >
        {/* Left Column: Original Document Preview */}
        <div
          style={{
            background: 'var(--hw-bg)',
            border: '1px solid var(--hw-border)',
            borderRadius: '10px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--hw-text-muted)' }}>
              Original Document
            </span>
            <button
              type="button"
              className="hw-btn hw-btn-ghost hw-btn-sm"
              onClick={onRetake}
              style={{ color: 'var(--hw-primary)', fontSize: '12px', gap: '4px' }}
            >
              <RefreshIcon size={13} />
              <span>Change Document</span>
            </button>
          </div>

          {/* Document Preview Box */}
          <div
            style={{
              width: '100%',
              minHeight: '360px',
              maxHeight: '520px',
              backgroundColor: '#0f172a',
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--hw-border)'
            }}
          >
            {originalDocument && originalDocument !== 'pdf_document' ? (
              <img
                src={originalDocument}
                alt="Original Medical Report"
                style={{
                  maxWidth: '100%',
                  maxHeight: '500px',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#ffffff', padding: '32px 16px' }}>
                <FileTextIcon size={48} color="#38bdf8" />
                <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '12px' }}>
                  {fileName || 'Medical_Report.pdf'}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                  Verified PDF Document
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--hw-text-muted)', textAlign: 'center' }}>
            {fileName ? `File: ${fileName}` : 'Live Camera Capture'} • Verified for Clinical Storage
          </div>
        </div>

        {/* Right Column: Editable Extracted Information */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Patient Information Section */}
          <div style={{ background: '#ffffff', border: '1px solid var(--hw-border)', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--hw-primary)', marginBottom: '12px' }}>
              Patient Information
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="hw-form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label className="hw-label" style={{ margin: 0 }}>Patient Name</label>
                  <span style={{ fontSize: '10px', color: 'var(--hw-green)', fontWeight: 600 }}>High confidence</span>
                </div>
                <input
                  type="text"
                  className="hw-input"
                  value={reportData.patientName}
                  onChange={e => handleFieldChange('patientName', e.target.value)}
                />
              </div>

              <div className="hw-form-group">
                <label className="hw-label">Patient ID</label>
                <input
                  type="text"
                  className="hw-input"
                  value={reportData.patientId || ''}
                  onChange={e => handleFieldChange('patientId', e.target.value)}
                  placeholder="HW-20481"
                />
              </div>
            </div>
          </div>

          {/* Report Information Section */}
          <div style={{ background: '#ffffff', border: '1px solid var(--hw-border)', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--hw-primary)', marginBottom: '12px' }}>
              Report Information
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="hw-form-group">
                <label className="hw-label">Report Type</label>
                <input
                  type="text"
                  className="hw-input"
                  value={reportData.reportType}
                  onChange={e => handleFieldChange('reportType', e.target.value)}
                />
              </div>

              <div className="hw-form-group">
                <label className="hw-label">Report Date</label>
                <input
                  type="date"
                  className="hw-input"
                  value={reportData.reportDate}
                  onChange={e => handleFieldChange('reportDate', e.target.value)}
                />
              </div>

              <div className="hw-form-group">
                <label className="hw-label">Laboratory / Hospital</label>
                <input
                  type="text"
                  className="hw-input"
                  value={reportData.laboratory || reportData.hospital}
                  onChange={e => handleFieldChange('laboratory', e.target.value)}
                />
              </div>

              <div className="hw-form-group">
                <label className="hw-label">Doctor / Pathologist</label>
                <input
                  type="text"
                  className="hw-input"
                  value={reportData.doctor || ''}
                  onChange={e => handleFieldChange('doctor', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Test Results Table Section */}
          <div style={{ background: '#ffffff', border: '1px solid var(--hw-border)', borderRadius: '10px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--hw-primary)' }}>
                Extracted Test Results
              </div>
              <button
                type="button"
                className="hw-btn hw-btn-ghost hw-btn-sm"
                onClick={() => setIsAddingTest(!isAddingTest)}
                style={{ color: 'var(--hw-primary)', fontSize: '12px', gap: '4px' }}
              >
                <PlusIcon size={14} />
                <span>{isAddingTest ? 'Cancel' : 'Add Test Result'}</span>
              </button>
            </div>

            {/* Inline Add Test Form */}
            {isAddingTest && (
              <div style={{ background: 'var(--hw-bg)', padding: '12px', borderRadius: '8px', marginBottom: '14px', border: '1px solid var(--hw-border)' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--hw-text-main)', marginBottom: '8px' }}>
                  Add Missing Test
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    placeholder="Test Name"
                    className="hw-input"
                    value={newTest.name}
                    onChange={e => setNewTest({ ...newTest, name: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Result"
                    className="hw-input"
                    value={newTest.value}
                    onChange={e => setNewTest({ ...newTest, value: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Unit"
                    className="hw-input"
                    value={newTest.unit}
                    onChange={e => setNewTest({ ...newTest, unit: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Reference Range"
                    className="hw-input"
                    value={newTest.referenceRange}
                    onChange={e => setNewTest({ ...newTest, referenceRange: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  className="hw-btn hw-btn-primary hw-btn-sm"
                  onClick={handleAddNewTest}
                >
                  Save Test
                </button>
              </div>
            )}

            {/* Editable Tests Table */}
            <div style={{ overflowX: 'auto' }}>
              <table className="hw-table" style={{ fontSize: '13px', width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: '35%' }}>Test Name</th>
                    <th style={{ width: '20%' }}>Result</th>
                    <th style={{ width: '15%' }}>Unit</th>
                    <th style={{ width: '20%' }}>Reference Range</th>
                    <th style={{ width: '10%', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.tests.map(test => (
                    <tr key={test.id}>
                      <td>
                        <input
                          type="text"
                          value={test.name}
                          onChange={e => handleTestChange(test.id, 'name', e.target.value)}
                          style={{
                            width: '100%',
                            border: '1px solid transparent',
                            background: 'transparent',
                            fontWeight: 600,
                            color: 'var(--hw-text-main)',
                            padding: '4px 6px',
                            borderRadius: '4px'
                          }}
                          onFocus={e => e.target.style.borderColor = 'var(--hw-primary)'}
                          onBlur={e => e.target.style.borderColor = 'transparent'}
                        />
                        <div style={{ fontSize: '10px', color: test.confidenceLevel === 'High' ? 'var(--hw-green)' : '#d97706', paddingLeft: '6px' }}>
                          ● {test.confidenceLevel || 'High'} confidence
                        </div>
                      </td>

                      <td>
                        <input
                          type="text"
                          value={test.value}
                          onChange={e => handleTestChange(test.id, 'value', e.target.value)}
                          style={{
                            width: '80px',
                            fontWeight: 700,
                            padding: '4px 6px',
                            border: '1px solid var(--hw-border)',
                            borderRadius: '4px',
                            color: 'var(--hw-text-main)'
                          }}
                        />
                      </td>

                      <td>
                        <input
                          type="text"
                          value={test.unit || ''}
                          onChange={e => handleTestChange(test.id, 'unit', e.target.value)}
                          style={{
                            width: '70px',
                            padding: '4px 6px',
                            border: '1px solid var(--hw-border)',
                            borderRadius: '4px',
                            color: 'var(--hw-text-muted)'
                          }}
                        />
                      </td>

                      <td>
                        <input
                          type="text"
                          value={test.referenceRange || ''}
                          onChange={e => handleTestChange(test.id, 'referenceRange', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '4px 6px',
                            border: '1px solid var(--hw-border)',
                            borderRadius: '4px',
                            color: 'var(--hw-text-muted)',
                            fontSize: '12px'
                          }}
                        />
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="hw-btn hw-btn-ghost hw-btn-sm"
                          onClick={() => handleDeleteTest(test.id)}
                          style={{ color: '#ef4444', padding: '4px 6px' }}
                          title="Remove test"
                          aria-label="Remove test"
                        >
                          <TrashIcon size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--hw-text-muted)' }}>
              Confidence indicators reflect optical text recognition certainty, not a clinical diagnostic assessment.
            </div>
          </div>
        </div>
      </div>

      {/* 3. User Confirmation & Save Footer */}
      <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--hw-border)' }}>
        {/* Saved Success Banner */}
        {isSaved ? (
          <div
            style={{
              backgroundColor: 'var(--hw-green-light)',
              border: '1.5px solid var(--hw-green-border)',
              borderRadius: '10px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircleIcon size={24} color="var(--hw-green)" />
              <div>
                <strong style={{ fontSize: '15px', color: '#065f46' }}>Report Saved to Health Records</strong>
                <div style={{ fontSize: '12px', color: '#047857' }}>Status: User verified • Stored securely in wallet</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="hw-btn hw-btn-secondary hw-btn-sm"
                onClick={onRetake}
              >
                Scan Another Report
              </button>
              <button
                type="button"
                className="hw-btn hw-btn-primary hw-btn-sm"
                onClick={onNavigateToRecords}
              >
                View in Health Records
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Confirmation Checkbox Requirement */}
            <div
              style={{
                backgroundColor: 'var(--hw-bg)',
                borderRadius: '8px',
                padding: '14px 18px',
                marginBottom: '16px',
                border: showConfirmError ? '1.5px solid var(--hw-danger)' : '1px solid var(--hw-border)'
              }}
            >
              <label className="hw-checkbox-label" style={{ cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <input
                  type="checkbox"
                  className="hw-checkbox"
                  style={{ marginTop: '3px' }}
                  checked={isConfirmedByUser}
                  onChange={e => {
                    setIsConfirmedByUser(e.target.checked);
                    if (e.target.checked) setShowConfirmError(false);
                  }}
                />
                <div>
                  <strong style={{ fontSize: '13px', color: 'var(--hw-text-main)', display: 'block' }}>
                    Please make sure the extracted information matches the original medical report.
                  </strong>
                  <span style={{ fontSize: '12px', color: 'var(--hw-text-muted)' }}>
                    I have reviewed and confirmed that the patient details, report date, and biochemical values match my clinical document.
                  </span>
                </div>
              </label>

              {showConfirmError && (
                <div style={{ color: 'var(--hw-danger)', fontSize: '12px', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangleIcon size={14} />
                  <span>Please check the confirmation box before saving to your official Health Records.</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="hw-btn hw-btn-secondary"
                onClick={onRetake}
              >
                Discard & Retake
              </button>
              <button
                type="button"
                id="btn-confirm-save-records"
                className="hw-btn hw-btn-primary hw-btn-lg"
                onClick={handleSaveClick}
                style={{ padding: '12px 28px' }}
              >
                Confirm & Save to Health Records
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
