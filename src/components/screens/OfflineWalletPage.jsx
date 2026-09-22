import React, { useState } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import {
  DownloadIcon,
  CheckCircleIcon,
  PrinterIcon
} from '../common/Icons';

export const OfflineWalletPage = () => {
  const { user, isOfflineSimulated, toggleOfflineSimulation, addToast } = useHealthWallet();

  return (
    <div>
      {/* 1. Header matching Panel 8 Reference UI */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 4px 0' }}>
          Offline Health Wallet
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0 }}>
          Access your essential health information even without internet.
        </p>
      </div>

      {/* 2. Large Central Card matching Panel 8 Reference */}
      <div
        className="hw-card"
        style={{
          maxWidth: '560px',
          margin: '0 auto',
          textAlign: 'center',
          padding: '48px 32px 36px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Scannable QR Code Container */}
        <div
          style={{
            padding: '16px',
            background: '#ffffff',
            border: '1.5px solid #0f172a',
            borderRadius: '12px',
            boxShadow: 'var(--hw-shadow-sm)',
            marginBottom: '20px'
          }}
        >
          <svg width="200" height="200" viewBox="0 0 100 100" style={{ display: 'block' }}>
            {/* Position Detection Outer & Inner Squares */}
            <rect x="6" y="6" width="24" height="24" fill="#0f172a" rx="2" />
            <rect x="10" y="10" width="16" height="16" fill="#ffffff" rx="1" />
            <rect x="14" y="14" width="8" height="8" fill="#0f172a" rx="1" />

            <rect x="70" y="6" width="24" height="24" fill="#0f172a" rx="2" />
            <rect x="74" y="10" width="16" height="16" fill="#ffffff" rx="1" />
            <rect x="78" y="14" width="8" height="8" fill="#0f172a" rx="1" />

            <rect x="6" y="70" width="24" height="24" fill="#0f172a" rx="2" />
            <rect x="10" y="74" width="16" height="16" fill="#ffffff" rx="1" />
            <rect x="14" y="78" width="8" height="8" fill="#0f172a" rx="1" />

            {/* Pattern Matrix */}
            <rect x="34" y="8" width="6" height="6" fill="#0f172a" />
            <rect x="44" y="12" width="6" height="6" fill="#0f172a" />
            <rect x="54" y="6" width="6" height="6" fill="#0f172a" />

            <rect x="8" y="34" width="6" height="6" fill="#0f172a" />
            <rect x="18" y="42" width="6" height="6" fill="#0f172a" />
            <rect x="12" y="52" width="6" height="6" fill="#0f172a" />

            <rect x="36" y="36" width="28" height="28" fill="#0f172a" rx="4" />
            {/* Center Cross / Shield */}
            <rect x="47" y="42" width="6" height="16" fill="#ffffff" rx="1" />
            <rect x="42" y="47" width="16" height="6" fill="#ffffff" rx="1" />

            <rect x="70" y="36" width="6" height="6" fill="#0f172a" />
            <rect x="82" y="44" width="6" height="6" fill="#0f172a" />
            <rect x="74" y="54" width="6" height="6" fill="#0f172a" />

            <rect x="38" y="72" width="6" height="6" fill="#0f172a" />
            <rect x="48" y="80" width="6" height="6" fill="#0f172a" />
            <rect x="58" y="74" width="6" height="6" fill="#0f172a" />
            <rect x="74" y="72" width="6" height="6" fill="#0f172a" />
            <rect x="84" y="82" width="6" height="6" fill="#0f172a" />
          </svg>
        </div>

        {/* Health Wallet ID (Panel 8 Reference) */}
        <div style={{ fontSize: '13px', color: 'var(--hw-text-muted)', marginBottom: '2px' }}>
          Health Wallet ID
        </div>
        <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--hw-text-main)', letterSpacing: '0.04em', marginBottom: '24px' }}>
          HW-20481
        </div>

        {/* Big Blue Download Button (Panel 8 Reference) */}
        <button
          type="button"
          className="hw-btn hw-btn-primary hw-btn-lg"
          onClick={() => {
            alert('Downloading offline health pass...');
            addToast('Offline emergency pass saved to device', 'success');
          }}
          style={{ width: '100%', maxWidth: '320px', marginBottom: '20px', gap: '8px' }}
        >
          <DownloadIcon size={16} />
          <span>Download for Offline Access</span>
        </button>

        {/* Footnote Caption (Panel 8 Reference) */}
        <p style={{ fontSize: '12px', color: 'var(--hw-text-muted)', lineHeight: '1.5', margin: 0, maxWidth: '340px' }}>
          Scan this QR code at any hospital to access your basic health information.<br />
          <strong style={{ color: 'var(--hw-text-body)' }}>(Works offline)</strong>
        </p>
      </div>

      {/* Offline Simulation Control Pill */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          type="button"
          className="hw-btn hw-btn-ghost hw-btn-sm"
          onClick={toggleOfflineSimulation}
          style={{ fontSize: '12px', color: 'var(--hw-text-muted)' }}
        >
          {isOfflineSimulated ? '● Simulating Offline Mode (Click to connect)' : '○ Test Offline Mode Simulation'}
        </button>
      </div>
    </div>
  );
};
