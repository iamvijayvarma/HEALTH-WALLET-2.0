import React, { useState } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  CameraIcon,
  UploadIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  EditIcon,
  RefreshIcon,
  FileTextIcon,
  ShieldCheckIcon,
  ArrowRightIcon
} from '../common/Icons';

export const ScanReportPage = () => {
  const { addHealthRecord, navigate, addToast } = useHealthWallet();

  const [scanMode, setScanMode] = useState('upload'); // 'upload' | 'camera'
  const [scanState, setScanState] = useState('idle'); // 'idle' | 'scanning' | 'review' | 'saved'
  const [selectedSample, setSelectedSample] = useState('cbc');

  // Extracted entities state (Editable by the user)
  const [extractedData, setExtractedData] = useState({
    hospital: 'Apollo Hospitals, Diagnostics Wing',
    doctor: 'Dr. A. Sundaram, MD (Path)',
    reportDate: '22 Sep 2026',
    reportTitle: 'Complete Blood Count (CBC) & Metabolic Screen',
    category: 'Lab Reports',
    tests: [
      { id: 1, name: 'Hemoglobin (Hb)', value: '14.2', unit: 'g/dL', refRange: '13.0 - 17.0', status: 'Normal' },
      { id: 2, name: 'Fasting Blood Glucose', value: '94', unit: 'mg/dL', refRange: '70 - 100', status: 'Optimal' },
      { id: 3, name: 'Total Cholesterol', value: '178', unit: 'mg/dL', refRange: '< 200', status: 'Desirable' },
      { id: 4, name: 'Serum Creatinine', value: '0.9', unit: 'mg/dL', refRange: '0.7 - 1.2', status: 'Normal' },
      { id: 5, name: 'Vitamin D3 (25-OH)', value: '32.4', unit: 'ng/mL', refRange: '30.0 - 100.0', status: 'Sufficient' }
    ]
  });

  const [isEditing, setIsEditing] = useState(false);

  // Trigger OCR scan simulation
  const handleStartScan = () => {
    setScanState('scanning');
    setTimeout(() => {
      setScanState('review');
      addToast('AI OCR complete. Please review and verify extracted values.', 'info');
    }, 2200);
  };

  const handleTestValueChange = (id, newValue) => {
    setExtractedData(prev => ({
      ...prev,
      tests: prev.tests.map(t => t.id === id ? { ...t, value: newValue } : t)
    }));
  };

  const handleConfirmAndSave = () => {
    const summary = extractedData.tests.map(t => `${t.name}: ${t.value} ${t.unit}`).join(', ');
    addHealthRecord({
      title: extractedData.reportTitle,
      category: extractedData.category,
      hospital: extractedData.hospital,
      doctor: extractedData.doctor,
      summary: `Verified AI Extracted Metrics: ${summary}`,
      tags: ['AI-Scanned', 'Verified-By-User']
    });
    setScanState('saved');
  };

  return (
    <div>
      {/* Page Header */}
      <div className="hw-page-header">
        <div className="hw-page-header-text">
          <h1>AI Health Report Scanner</h1>
          <p>Scan or upload paper diagnostic reports. Our clinical OCR extracts metrics for your review.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="hw-badge hw-badge-teal">ABDM Medical Entity Model v3.2</span>
        </div>
      </div>

      {/* Mandatory Clinical Protocol Notice */}
      <div className="hw-alert hw-alert-warning" style={{ alignItems: 'center' }}>
        <AlertTriangleIcon size={20} />
        <span style={{ fontSize: '13px', lineHeight: '1.4' }}>
          <strong>Mandatory Verification Protocol:</strong> AI extraction is an assistive preview tool. You must review and confirm all numbers against the physical report before committing data to your official Health Wallet.
        </span>
      </div>

      {/* Main Scanner Section */}
      <div style={{ display: 'grid', gridTemplateColumns: scanState === 'review' ? '1fr 1.4fr' : '1fr', gap: '24px' }}>
        {/* Left Column: Input / Scanner Area */}
        <div className="hw-card">
          {/* Mode Selector Tabs */}
          <div className="hw-tabs" style={{ marginBottom: '16px' }}>
            <button
              type="button"
              className={`hw-tab-btn ${scanMode === 'upload' ? 'active' : ''}`}
              onClick={() => { setScanMode('upload'); if (scanState !== 'scanning') setScanState('idle'); }}
            >
              <UploadIcon size={16} />
              <span>Upload Document</span>
            </button>
            <button
              type="button"
              className={`hw-tab-btn ${scanMode === 'camera' ? 'active' : ''}`}
              onClick={() => { setScanMode('camera'); if (scanState !== 'scanning') setScanState('idle'); }}
            >
              <CameraIcon size={16} />
              <span>Scan with Camera</span>
            </button>
          </div>

          {/* Camera Viewfinder Simulation */}
          {scanMode === 'camera' && scanState !== 'review' && scanState !== 'saved' && (
            <div>
              <div className="hw-scanner-viewport" style={{ marginBottom: '16px' }}>
                <div className="hw-scanner-guide" />
                {scanState === 'scanning' && <div className="hw-scanner-laser" />}
                <div style={{ textAlign: 'center', zIndex: 2 }}>
                  <CameraIcon size={36} color="rgba(255,255,255,0.7)" />
                  <div style={{ fontSize: '13px', marginTop: '8px', color: '#e2e8f0' }}>
                    {scanState === 'scanning' ? 'Analyzing document structure...' : 'Align medical report within frame'}
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                fullWidth
                size="lg"
                icon={CameraIcon}
                disabled={scanState === 'scanning'}
                onClick={handleStartScan}
              >
                {scanState === 'scanning' ? 'Extracting Medical Text...' : 'Capture & Extract Report'}
              </Button>
            </div>
          )}

          {/* Upload File Mode */}
          {scanMode === 'upload' && scanState !== 'review' && scanState !== 'saved' && (
            <div>
              <div
                style={{
                  border: '2px dashed var(--hw-border-strong)',
                  borderRadius: '12px',
                  padding: '36px 20px',
                  textAlign: 'center',
                  backgroundColor: 'var(--hw-bg)',
                  marginBottom: '20px',
                  cursor: 'pointer'
                }}
                onClick={handleStartScan}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--hw-primary-light)', color: 'var(--hw-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  <UploadIcon size={24} />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--hw-text-main)', margin: '0 0 4px 0' }}>
                  Click to browse or drop medical PDF / scan
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--hw-text-muted)', margin: '0 0 16px 0' }}>
                  Supported formats: PDF, JPG, PNG (Max 15MB)
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  <span className="hw-badge hw-badge-neutral">Lab Reports</span>
                  <span className="hw-badge hw-badge-neutral">Prescriptions</span>
                  <span className="hw-badge hw-badge-neutral">Discharge Summaries</span>
                </div>
              </div>

              {/* Sample Selector for Instant Testing */}
              <div style={{ background: '#ffffff', border: '1px solid var(--hw-border)', borderRadius: '8px', padding: '14px', marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--hw-text-main)', marginBottom: '8px' }}>
                  Or select a standard sample report to simulate:
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={`hw-pill-btn ${selectedSample === 'cbc' ? 'active' : ''}`}
                    onClick={() => setSelectedSample('cbc')}
                  >
                    CBC & Metabolic Profile
                  </button>
                  <button
                    type="button"
                    className={`hw-pill-btn ${selectedSample === 'lipid' ? 'active' : ''}`}
                    onClick={() => setSelectedSample('lipid')}
                  >
                    Lipid Panel & Liver Enzymes
                  </button>
                </div>
              </div>

              <Button
                variant="primary"
                fullWidth
                size="lg"
                icon={scanState === 'scanning' ? RefreshIcon : ArrowRightIcon}
                iconPosition="right"
                disabled={scanState === 'scanning'}
                onClick={handleStartScan}
              >
                {scanState === 'scanning' ? 'Extracting Clinical Entities...' : 'Process Document with AI OCR'}
              </Button>
            </div>
          )}

          {/* Document Preview Thumbnail (Shown during review) */}
          {(scanState === 'review' || scanState === 'saved') && (
            <div>
              <div className="hw-card-header" style={{ marginBottom: '12px' }}>
                <h3 className="hw-card-title" style={{ fontSize: '14px' }}>
                  <FileTextIcon size={16} color="var(--hw-primary)" />
                  <span>Original Document Preview</span>
                </h3>
                <span className="hw-badge hw-badge-neutral">Processed via OCR</span>
              </div>

              {/* Simulated Paper Document */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--hw-border)',
                  borderRadius: '8px',
                  padding: '16px',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)',
                  fontSize: '12px',
                  lineHeight: '1.6',
                  fontFamily: 'var(--hw-font-mono)'
                }}
              >
                <div style={{ textAlign: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '10px' }}>
                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>APOLLO HOSPITALS DIAGNOSTIC REPORT</strong>
                  <div style={{ color: '#64748b', fontSize: '10px' }}>National Accreditation Board for Testing and Calibration (NABL)</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '11px', color: '#475569' }}>
                  <div>Patient: <strong>KAVIN RAJAN (28Y/M)</strong></div>
                  <div>ID: <strong>HW-9021-4819</strong></div>
                </div>

                <div style={{ color: '#64748b', fontSize: '11px', marginBottom: '8px' }}>
                  Date: 22-Sep-2026 | Ref By: Dr. A. Sundaram, MD
                </div>

                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '8px', fontSize: '11px' }}>
                  {extractedData.tests.map(t => (
                    <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                      <span>{t.name}</span>
                      <strong>{t.value} {t.unit}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  icon={RefreshIcon}
                  onClick={() => setScanState('idle')}
                >
                  Scan Another Document
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Extracted Fields & Review Table */}
        {(scanState === 'review' || scanState === 'saved') && (
          <div className="hw-card" style={{ border: '1px solid var(--hw-primary)' }}>
            <div className="hw-card-header">
              <div>
                <h3 className="hw-card-title" style={{ color: 'var(--hw-primary)' }}>
                  <ShieldCheckIcon size={20} color="var(--hw-primary)" />
                  <span>Extracted Medical Information</span>
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--hw-text-muted)', margin: '2px 0 0 0' }}>
                  Step 2 of 3: User Review & Value Confirmation
                </p>
              </div>

              <button
                type="button"
                className="hw-btn hw-btn-ghost hw-btn-sm"
                onClick={() => setIsEditing(!isEditing)}
                style={{ color: 'var(--hw-primary)', fontWeight: 600 }}
              >
                <EditIcon size={14} />
                <span>{isEditing ? 'Done Editing' : 'Edit Values'}</span>
              </button>
            </div>

            {/* Provider Metadata Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px', background: 'var(--hw-bg)', padding: '12px', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>Identified Laboratory</div>
                <strong style={{ fontSize: '12px', color: 'var(--hw-text-main)' }}>{extractedData.hospital}</strong>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>Attending Pathologist</div>
                <strong style={{ fontSize: '12px', color: 'var(--hw-text-main)' }}>{extractedData.doctor}</strong>
              </div>
            </div>

            {/* Extracted Metrics Table */}
            <div className="hw-table-container" style={{ marginBottom: '20px' }}>
              <table className="hw-table">
                <thead>
                  <tr>
                    <th>Test / Marker</th>
                    <th>Extracted Value</th>
                    <th>Unit</th>
                    <th>Reference Range</th>
                    <th>Clinical Status</th>
                  </tr>
                </thead>
                <tbody>
                  {extractedData.tests.map((test) => (
                    <tr key={test.id}>
                      <td style={{ fontWeight: 600, color: 'var(--hw-text-main)' }}>
                        {test.name}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            value={test.value}
                            onChange={(e) => handleTestValueChange(test.id, e.target.value)}
                            style={{
                              width: '70px',
                              padding: '4px 8px',
                              border: '1px solid var(--hw-primary)',
                              borderRadius: '4px',
                              fontSize: '13px',
                              fontWeight: 700
                            }}
                          />
                        ) : (
                          <strong style={{ fontSize: '14px', color: 'var(--hw-primary)' }}>
                            {test.value}
                          </strong>
                        )}
                      </td>
                      <td style={{ color: 'var(--hw-text-muted)', fontSize: '12px' }}>
                        {test.unit}
                      </td>
                      <td style={{ color: 'var(--hw-text-muted)', fontSize: '12px' }}>
                        {test.refRange}
                      </td>
                      <td>
                        <span className="hw-badge hw-badge-green">
                          <CheckCircleIcon size={11} /> {test.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action Bar: Save or Saved */}
            {scanState === 'saved' ? (
              <div style={{ background: 'var(--hw-green-light)', border: '1px solid var(--hw-green)', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--hw-green)', fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>
                  <CheckCircleIcon size={20} />
                  <span>Successfully Saved to Health Records!</span>
                </div>
                <p style={{ fontSize: '12px', color: '#065f46', margin: '0 0 14px 0' }}>
                  This verified diagnostic record is now permanently linked to your citizen wallet.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  <Button variant="secondary" size="sm" onClick={() => navigate('records')}>
                    View in Records
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => setScanState('idle')}>
                    Scan Another Report
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--hw-border)' }}>
                <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)' }}>
                  I confirm these values match my physical laboratory report.
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  icon={CheckCircleIcon}
                  onClick={handleConfirmAndSave}
                >
                  Confirm & Save to Health Records
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
