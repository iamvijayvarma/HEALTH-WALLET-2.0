import React, { useState } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import {
  CameraIcon,
  UploadIcon,
  EditIcon,
  CheckCircleIcon,
  RefreshIcon
} from '../common/Icons';

export const ScanReportPage = () => {
  const { addHealthRecord, navigate, addToast } = useHealthWallet();

  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'upload'
  const [scanState, setScanState] = useState('review'); // 'idle' | 'scanning' | 'review' | 'saved'
  const [isEditing, setIsEditing] = useState(false);

  // Exact reference sample values from Panel 3
  const [extractedData, setExtractedData] = useState([
    { id: 1, testName: 'Hemoglobin', value: '13.2', unit: 'g/dL' },
    { id: 2, testName: 'Blood Glucose (Fasting)', value: '96', unit: 'mg/dL' },
    { id: 3, testName: 'Total Cholesterol', value: '180', unit: 'mg/dL' },
    { id: 4, testName: 'Vitamin D', value: '28', unit: 'ng/mL' }
  ]);

  const handleTestValueChange = (id, newValue) => {
    setExtractedData(prev =>
      prev.map(item => item.id === id ? { ...item, value: newValue } : item)
    );
  };

  const handleStartScan = () => {
    setScanState('scanning');
    setTimeout(() => {
      setScanState('review');
      addToast('Medical metrics extracted. Please review before saving.', 'info');
    }, 1800);
  };

  const handleSaveToRecords = () => {
    const summary = extractedData.map(t => `${t.testName}: ${t.value} ${t.unit}`).join(', ');
    addHealthRecord({
      title: 'Scanned Medical Report - Laboratory Profile',
      category: 'Lab Reports',
      hospital: 'Diagnostic Laboratory Center',
      doctor: 'Consultant Pathologist',
      summary: `Verified AI Extracted Values: ${summary}`,
      tags: ['AI-Scanned', 'Verified']
    });
    setScanState('saved');
    addToast('Report saved to Health Records', 'success');
  };

  return (
    <div>
      {/* 1. Header matching Panel 3 */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 4px 0' }}>
          Scan Medical Report
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0 }}>
          Upload or scan your medical reports. Our AI will extract the information for you.
        </p>
      </div>

      {/* 2. Wide Toggle Tabs matching Panel 3 */}
      <div className="hw-wide-toggle-tabs" style={{ maxWidth: '640px' }}>
        <button
          type="button"
          className={`hw-wide-toggle-btn ${activeTab === 'camera' ? 'active' : ''}`}
          onClick={() => setActiveTab('camera')}
        >
          <CameraIcon size={16} />
          <span>Scan with Camera</span>
        </button>
        <button
          type="button"
          className={`hw-wide-toggle-btn ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          <UploadIcon size={16} />
          <span>Upload File</span>
        </button>
      </div>

      {/* 3. Large Clean Camera / Upload Dropzone Card (Panel 3 Reference) */}
      <div
        className="hw-card"
        style={{
          border: '1.5px dashed #cbd5e1',
          borderRadius: '14px',
          textAlign: 'center',
          padding: '44px 20px',
          backgroundColor: '#ffffff',
          marginBottom: '28px',
          cursor: 'pointer'
        }}
        onClick={handleStartScan}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--hw-primary-light)',
            color: 'var(--hw-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px'
          }}
        >
          <CameraIcon size={28} />
        </div>

        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--hw-text-main)', margin: '0 0 4px 0' }}>
          {activeTab === 'camera' ? 'Click to open camera' : 'Click to upload medical document'}
        </h3>

        <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: '0 0 8px 0' }}>
          {activeTab === 'camera' ? 'Take a photo of your medical report' : 'Drag and drop your report files here'}
        </p>

        <span style={{ fontSize: '11px', color: 'var(--hw-text-subtle)' }}>
          Supported formats: JPG, PNG, PDF
        </span>

        {scanState === 'scanning' && (
          <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--hw-primary)', fontWeight: 600 }}>
            Analyzing report layout and extracting values...
          </div>
        )}
      </div>

      {/* 4. Extracted Information Table (Panel 3 Reference) */}
      <div className="hw-card">
        <div className="hw-card-header" style={{ marginBottom: '16px' }}>
          <h3 className="hw-card-title" style={{ fontSize: '16px' }}>
            Extracted Information (Review & Confirm)
          </h3>
          <button
            type="button"
            className="hw-btn hw-btn-ghost hw-btn-sm"
            onClick={() => setIsEditing(!isEditing)}
            style={{ color: 'var(--hw-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <EditIcon size={14} />
            <span>{isEditing ? 'Done' : 'Edit'}</span>
          </button>
        </div>

        {/* Clean Table: Test Name | Value | Unit */}
        <div className="hw-table-container" style={{ border: 'none', marginBottom: '24px' }}>
          <table className="hw-table">
            <thead>
              <tr>
                <th style={{ width: '45%' }}>Test Name</th>
                <th style={{ width: '30%' }}>Value</th>
                <th style={{ width: '25%' }}>Unit</th>
              </tr>
            </thead>
            <tbody>
              {extractedData.map((row) => (
                <tr key={row.id}>
                  <td style={{ fontWeight: 600, color: 'var(--hw-text-main)' }}>
                    {row.testName}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={row.value}
                        onChange={(e) => handleTestValueChange(row.id, e.target.value)}
                        style={{
                          width: '80px',
                          padding: '4px 8px',
                          border: '1px solid var(--hw-primary)',
                          borderRadius: '4px',
                          fontSize: '13px',
                          fontWeight: 700
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--hw-text-main)' }}>
                        {row.value}
                      </span>
                    )}
                  </td>
                  <td style={{ color: 'var(--hw-text-muted)', fontSize: '13px' }}>
                    {row.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Save Action */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          {scanState === 'saved' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--hw-green)', fontWeight: 600, fontSize: '13px' }}>
              <CheckCircleIcon size={16} />
              <span>Saved to Health Records</span>
            </div>
          ) : (
            <button
              type="button"
              className="hw-btn hw-btn-primary hw-btn-lg"
              onClick={handleSaveToRecords}
              style={{ padding: '10px 24px' }}
            >
              Save to Health Records
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
