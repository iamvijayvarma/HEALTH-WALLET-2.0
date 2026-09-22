import React, { useState } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  QrCodeIcon,
  DownloadIcon,
  RefreshIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  ClockIcon,
  PrinterIcon,
  AlertTriangleIcon,
  PhoneIcon,
  DropletIcon
} from '../common/Icons';

export const OfflineWalletPage = () => {
  const {
    user,
    medicines,
    lastSynced,
    isOfflineSimulated,
    toggleOfflineSimulation,
    addToast
  } = useHealthWallet();

  const [syncing, setSyncing] = useState(false);

  const handleManualSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      addToast('Cryptographic offline cache refreshed with latest records', 'success');
    }, 1500);
  };

  return (
    <div>
      {/* Header */}
      <div className="hw-page-header">
        <div className="hw-page-header-text">
          <h1>Offline Health Wallet</h1>
          <p>Access your critical triage records even in remote areas without internet or cellular connectivity.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant={isOfflineSimulated ? 'teal' : 'secondary'}
            size="sm"
            onClick={toggleOfflineSimulation}
          >
            {isOfflineSimulated ? '● Simulating Offline Mode' : '○ Simulate Network Disconnect'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={RefreshIcon}
            disabled={syncing || isOfflineSimulated}
            onClick={handleManualSync}
          >
            {syncing ? 'Syncing...' : 'Sync Offline Cache'}
          </Button>
        </div>
      </div>

      {/* Offline Status Alert */}
      {isOfflineSimulated && (
        <div className="hw-alert hw-alert-warning" style={{ alignItems: 'center' }}>
          <AlertTriangleIcon size={20} />
          <span style={{ fontSize: '13px' }}>
            <strong>Network Disconnected (Simulated):</strong> You are viewing cached local credentials. Emergency QR scans and basic triage cards remain 100% accessible to hospitals offline.
          </span>
        </div>
      )}

      {/* Main Grid: QR Code & Printable Offline Pass */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '28px', marginBottom: '28px' }}>
        {/* Left: Cryptographic QR Code Card */}
        <div className="hw-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
          <span className="hw-badge hw-badge-teal" style={{ marginBottom: '16px' }}>
            <CheckCircleIcon size={12} /> Encrypted Offline QR
          </span>

          {/* SVG High-Contrast QR Code Representation */}
          <div
            style={{
              padding: '16px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '2px solid var(--hw-primary)',
              boxShadow: 'var(--hw-shadow-md)',
              marginBottom: '16px'
            }}
          >
            <svg width="200" height="200" viewBox="0 0 100 100" style={{ display: 'block' }}>
              {/* Corner Position Detection Squares */}
              <rect x="5" y="5" width="26" height="26" fill="#0f4c81" rx="2" />
              <rect x="9" y="9" width="18" height="18" fill="#ffffff" rx="1" />
              <rect x="13" y="13" width="10" height="10" fill="#0f4c81" rx="1" />

              <rect x="69" y="5" width="26" height="26" fill="#0f4c81" rx="2" />
              <rect x="73" y="9" width="18" height="18" fill="#ffffff" rx="1" />
              <rect x="77" y="13" width="10" height="10" fill="#0f4c81" rx="1" />

              <rect x="5" y="69" width="26" height="26" fill="#0f4c81" rx="2" />
              <rect x="9" y="73" width="18" height="18" fill="#ffffff" rx="1" />
              <rect x="13" y="77" width="10" height="10" fill="#0f4c81" rx="1" />

              {/* Data payload matrix pattern */}
              <rect x="36" y="8" width="6" height="6" fill="#0f4c81" />
              <rect x="46" y="12" width="6" height="6" fill="#0f4c81" />
              <rect x="56" y="6" width="6" height="6" fill="#0f4c81" />

              <rect x="8" y="36" width="6" height="6" fill="#0f4c81" />
              <rect x="18" y="42" width="6" height="6" fill="#0f4c81" />
              <rect x="12" y="54" width="6" height="6" fill="#0f4c81" />

              <rect x="36" y="36" width="28" height="28" fill="#0f4c81" rx="4" />
              {/* Center Heart Emblem inside QR */}
              <circle cx="50" cy="50" r="10" fill="#ffffff" />
              <path d="M50 44c1 .8 4 3 4 5 0 2-1.5 3-3 3-1 0-1.8-.8-2-1-.2.2-1 1-2 1-1.5 0-3-1-3-3 0-2 3-4.2 4-5z" fill="#dc2626" />

              <rect x="70" y="38" width="6" height="6" fill="#0f4c81" />
              <rect x="82" y="44" width="6" height="6" fill="#0f4c81" />
              <rect x="74" y="56" width="6" height="6" fill="#0f4c81" />

              <rect x="38" y="72" width="6" height="6" fill="#0f4c81" />
              <rect x="48" y="80" width="6" height="6" fill="#0f4c81" />
              <rect x="60" y="76" width="6" height="6" fill="#0f4c81" />
              <rect x="76" y="72" width="6" height="6" fill="#0f4c81" />
              <rect x="84" y="82" width="6" height="6" fill="#0f4c81" />
            </svg>
          </div>

          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--hw-text-main)', marginBottom: '4px' }}>
            Health Wallet ID: {user.id}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--hw-text-muted)', maxWidth: '280px', margin: '0 0 16px 0', lineHeight: '1.4' }}>
            Paramedics can scan this QR code on any emergency tablet to read signed medical triage data without network.
          </p>

          <Button
            variant="primary"
            fullWidth
            size="sm"
            icon={DownloadIcon}
            onClick={() => alert(`Saving offline pass image: ${user.id}-offline-pass.png`)}
          >
            Download for Offline Access
          </Button>
        </div>

        {/* Right: Detailed Emergency Offline Card Preview */}
        <div className="hw-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="hw-card-header">
              <h3 className="hw-card-title">
                <ShieldCheckIcon size={18} color="var(--hw-primary)" />
                <span>Emergency Offline Card</span>
              </h3>
              <span className="hw-badge hw-badge-neutral">Verifiable Credential</span>
            </div>

            {/* Pass Metadata Card */}
            <div style={{ background: 'var(--hw-bg)', border: '1px solid var(--hw-border)', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', borderBottom: '1px solid var(--hw-border)', paddingBottom: '10px' }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--hw-text-main)', margin: 0 }}>
                    {user.fullName}
                  </h4>
                  <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)' }}>
                    ABHA: {user.abhaNumber} • DOB: {user.dob} ({user.gender})
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="hw-badge hw-badge-danger" style={{ fontSize: '13px', fontWeight: 800 }}>
                    <DropletIcon size={12} /> {user.bloodGroup}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '12px', marginBottom: '12px' }}>
                <div>
                  <div style={{ color: 'var(--hw-text-muted)', textTransform: 'uppercase', fontSize: '10px', fontWeight: 600 }}>
                    Documented Allergies
                  </div>
                  <strong style={{ color: 'var(--hw-danger)', fontSize: '13px' }}>
                    {user.allergies.join(', ')}
                  </strong>
                </div>

                <div>
                  <div style={{ color: 'var(--hw-text-muted)', textTransform: 'uppercase', fontSize: '10px', fontWeight: 600 }}>
                    Chronic Conditions
                  </div>
                  <strong style={{ color: 'var(--hw-text-main)', fontSize: '13px' }}>
                    {user.chronicConditions.join(', ')}
                  </strong>
                </div>
              </div>

              <div style={{ fontSize: '12px', borderTop: '1px solid var(--hw-border)', paddingTop: '10px' }}>
                <div style={{ color: 'var(--hw-text-muted)', textTransform: 'uppercase', fontSize: '10px', fontWeight: 600, marginBottom: '4px' }}>
                  Primary Emergency Contacts
                </div>
                {user.emergencyContacts.map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--hw-text-body)' }}>
                    <span>{c.name} ({c.relationship}):</span>
                    <strong>{c.phone}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Security Footnote */}
            <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', lineHeight: '1.5', background: '#ffffff', border: '1px solid var(--hw-border)', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px' }}>
              <strong>Cryptographic Integrity:</strong> Signed with ECDSA P-256 government public key. Hospitals verify the signature offline against the national trust registry.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid var(--hw-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--hw-text-muted)' }}>
              <ClockIcon size={14} />
              <span>Last Synchronized: <strong>{lastSynced}</strong></span>
            </div>

            <Button
              variant="secondary"
              size="sm"
              icon={PrinterIcon}
              onClick={() => alert(`Opening print dialogue for ${user.fullName} Emergency Pass`)}
            >
              Print Emergency Wallet Card
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
