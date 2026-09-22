import React from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import {
  ShieldIcon,
  ActivityIcon,
  FileTextIcon,
  CameraIcon,
  PillIcon,
  UsersIcon,
  DropletIcon,
  HeartHandshakeIcon,
  AlertTriangleIcon,
  QrCodeIcon,
  SettingsIcon,
  XIcon
} from './Icons';

export const Sidebar = ({ isOpenMobile, onCloseMobile }) => {
  const { currentRoute, navigate, isOfflineSimulated, lastSynced } = useHealthWallet();

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: ActivityIcon },
    { id: 'records', label: 'Health Records', icon: FileTextIcon, badge: '5' },
    { id: 'scan', label: 'Scan Report', icon: CameraIcon, badge: 'AI' },
    { id: 'medicines', label: 'Medicines', icon: PillIcon, badge: '3' },
    { id: 'family', label: 'Family', icon: UsersIcon, badge: '4' },
    { id: 'blood-donation', label: 'Blood Donation', icon: DropletIcon },
    { id: 'organ-donation', label: 'Organ Donation', icon: HeartHandshakeIcon },
    { id: 'emergency', label: 'Emergency', icon: AlertTriangleIcon, isEmergency: true },
    { id: 'offline', label: 'Offline Wallet', icon: QrCodeIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon }
  ];

  const handleNavClick = (id) => {
    navigate(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className={`hw-sidebar ${isOpenMobile ? 'mobile-open' : ''}`}>
      {/* Brand Header */}
      <div className="hw-sidebar-brand" onClick={() => handleNavClick('dashboard')}>
        <div className="hw-brand-logo-icon">
          <ShieldIcon size={20} color="#ffffff" />
        </div>
        <div className="hw-brand-info">
          <span className="hw-brand-name">Health Wallet</span>
          <span className="hw-brand-tagline">Your Health. Always With You.</span>
        </div>
        {isOpenMobile && (
          <button
            type="button"
            className="hw-btn hw-btn-ghost hw-btn-icon-only"
            style={{ marginLeft: 'auto' }}
            onClick={onCloseMobile}
            aria-label="Close menu"
          >
            <XIcon size={18} />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="hw-sidebar-nav" aria-label="Main Navigation">
        <span className="hw-nav-section-title">Healthcare Services</span>
        {navItems.map((item) => {
          const IconComp = item.icon;
          const isActive = currentRoute === item.id;
          const isEmergency = item.isEmergency;

          return (
            <button
              key={item.id}
              type="button"
              className={`hw-nav-item ${isActive ? 'active' : ''} ${isEmergency ? 'hw-nav-item-emergency' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              <IconComp size={18} />
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className="hw-nav-badge"
                  style={{
                    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'var(--hw-bg-subtle)',
                    color: isActive ? '#ffffff' : 'var(--hw-text-muted)'
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer with Live Sync / Offline status */}
      <div className="hw-sidebar-footer">
        <div className="hw-offline-pill" onClick={() => handleNavClick('offline')} style={{ cursor: 'pointer' }}>
          <span className={`hw-status-dot ${isOfflineSimulated ? 'hw-status-dot-amber' : 'hw-status-dot-green'}`} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <strong style={{ fontSize: '11px', color: 'var(--hw-text-main)' }}>
              {isOfflineSimulated ? 'Offline Mode Active' : 'Online & Synchronized'}
            </strong>
            <span style={{ fontSize: '10px' }}>Synced: {lastSynced.split(',')[1] || lastSynced}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
