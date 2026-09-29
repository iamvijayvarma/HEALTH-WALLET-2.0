import React from 'react';

/**
 * Renders the loading animation and status during OCR & clinical parameter extraction.
 */
export const ExtractionStatus = ({ message = 'Extracting Clinical Information...' }) => {
  return (
    <div
      className="hw-card"
      style={{
        maxWidth: '640px',
        margin: '0 auto 28px',
        textAlign: 'center',
        padding: '44px 20px',
        backgroundColor: '#ffffff'
      }}
    >
      <div
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          border: '3.5px solid var(--hw-primary-light, #eef5fc)',
          borderTopColor: 'var(--hw-primary, #1e56a0)',
          animation: 'hwSpin 1s infinite linear',
          margin: '0 auto 18px auto'
        }}
      />
      <h4 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--hw-text-main)', marginBottom: '6px' }}>
        {message}
      </h4>
      <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: '0 auto 14px auto', maxWidth: '440px' }}>
        Reading test parameters, numerical clinical values, and biological reference intervals...
      </p>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '11px',
          color: 'var(--hw-text-muted)',
          background: 'var(--hw-bg)',
          padding: '4px 12px',
          borderRadius: '12px'
        }}
      >
        <span>Deterministic text extraction engine active</span>
      </div>
    </div>
  );
};
