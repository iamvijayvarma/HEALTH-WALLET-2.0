import React from 'react';
import { AlertTriangleIcon, CheckCircleIcon, RefreshIcon, UploadIcon } from '../common/Icons';

/**
 * Renders document validation in-progress, success, and rejection states.
 */
export const ValidationStatus = ({
  isValidating,
  validationResult,
  documentPreview,
  onRetake,
  onUploadAnother
}) => {
  // 1. In-Progress Validation State
  if (isValidating) {
    return (
      <div
        className="hw-card"
        style={{
          maxWidth: '640px',
          margin: '0 auto 28px',
          textAlign: 'center',
          padding: '44px 24px',
          backgroundColor: '#ffffff'
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: '3.5px solid var(--hw-primary-light, #eef5fc)',
            borderTopColor: 'var(--hw-primary, #1e56a0)',
            animation: 'hwSpin 0.9s infinite linear',
            margin: '0 auto 18px auto'
          }}
        />
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 6px 0' }}>
          Validating Medical Document...
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: '0 auto 16px auto', maxWidth: '420px' }}>
          Analyzing document layout, clinical parameters, and laboratory structure...
        </p>

        {documentPreview && documentPreview !== 'pdf_document' && (
          <div
            style={{
              width: '120px',
              height: '80px',
              margin: '0 auto',
              borderRadius: '6px',
              overflow: 'hidden',
              border: '1px solid var(--hw-border)',
              boxShadow: 'var(--hw-shadow-xs)'
            }}
          >
            <img src={documentPreview} alt="Validating document" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
      </div>
    );
  }

  // 2. Rejection State (Invalid Document)
  if (validationResult && !validationResult.isMedicalReport) {
    return (
      <div
        className="hw-card"
        style={{
          maxWidth: '640px',
          margin: '0 auto 28px',
          textAlign: 'center',
          padding: '40px 24px',
          backgroundColor: '#ffffff',
          border: '1.5px solid var(--hw-danger-border, #fecaca)'
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--hw-danger-light, #fef2f2)',
            color: 'var(--hw-danger, #dc2626)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}
        >
          <AlertTriangleIcon size={28} />
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--hw-danger, #dc2626)', margin: '0 0 8px 0' }}>
          ✕ Invalid Medical Document
        </h3>

        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--hw-text-main)', margin: '0 0 8px 0' }}>
          This doesn't appear to be a valid medical report.
        </p>

        <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: '0 auto 20px auto', maxWidth: '480px', lineHeight: '1.5' }}>
          {validationResult.reason || 'Please scan or upload a medical report or laboratory report.'}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="hw-btn hw-btn-secondary hw-btn-md"
            onClick={onRetake}
            style={{ gap: '8px' }}
          >
            <RefreshIcon size={16} />
            <span>Retake</span>
          </button>
          <button
            type="button"
            className="hw-btn hw-btn-primary hw-btn-md"
            onClick={onUploadAnother}
            style={{ gap: '8px' }}
          >
            <UploadIcon size={16} />
            <span>Upload Another</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Valid Medical Document Detected Banner
  if (validationResult && validationResult.isMedicalReport) {
    const confidencePct = Math.round((validationResult.confidence || 0.94) * 100);
    return (
      <div
        style={{
          maxWidth: '640px',
          margin: '0 auto 20px',
          backgroundColor: 'var(--hw-teal-light, #f0fdfa)',
          border: '1.5px solid var(--hw-teal-border, #99f6e4)',
          borderRadius: '10px',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircleIcon size={22} color="var(--hw-teal, #0d9488)" />
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--hw-teal, #0d9488)' }}>
              ✓ Medical Report Detected
            </div>
            <div style={{ fontSize: '12px', color: 'var(--hw-text-body)', marginTop: '2px' }}>
              <strong>Document Type:</strong> {validationResult.documentType || 'Laboratory Report'}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '11px', color: 'var(--hw-text-muted)', display: 'block', textTransform: 'uppercase' }}>
            Confidence
          </span>
          <span className="hw-badge hw-badge-teal" style={{ fontWeight: 700, fontSize: '13px' }}>
            {confidencePct}%
          </span>
        </div>
      </div>
    );
  }

  return null;
};
