import React, { useState } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import {
  SearchIcon,
  BellIcon,
  GlobeIcon,
  MenuIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  QrCodeIcon,
  SettingsIcon,
  UserIcon
} from './Icons';

export const Header = ({ onOpenMobileMenu }) => {
  const {
    user,
    language,
    setLanguage,
    searchQuery,
    setSearchQuery,
    notifications,
    navigate,
    logoutUser,
    isOfflineSimulated
  } = useHealthWallet();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' }
  ];

  return (
    <header className="hw-header">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="hw-header-left">
        <button
          type="button"
          className="hw-mobile-menu-btn"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
        >
          <MenuIcon size={22} />
        </button>

        <div className="hw-header-search">
          <div className="hw-input-prefix-icon">
            <SearchIcon size={16} />
          </div>
          <input
            type="search"
            className="hw-input"
            placeholder="Search records, reports, doctors, medicines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Right: Language, Notifications, User Profile */}
      <div className="hw-header-right">
        {/* Language Selector */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="hw-lang-selector"
            onClick={() => setShowLangMenu(!showLangMenu)}
            aria-label="Select language"
          >
            <GlobeIcon size={16} />
            <span>{languages.find(l => l.code === language)?.native || 'English'}</span>
          </button>

          {showLangMenu && (
            <div
              style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                width: '160px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--hw-border)',
                borderRadius: 'var(--hw-radius-md)',
                boxShadow: 'var(--hw-shadow-lg)',
                padding: '6px',
                zIndex: 1000
              }}
            >
              {languages.map(l => (
                <button
                  key={l.code}
                  type="button"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    background: language === l.code ? 'var(--hw-primary-light)' : 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: language === l.code ? 'var(--hw-primary)' : 'var(--hw-text-body)',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onClick={() => {
                    setLanguage(l.code);
                    setShowLangMenu(false);
                  }}
                >
                  <span>{l.native}</span>
                  {language === l.code && <CheckCircleIcon size={14} color="var(--hw-primary)" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Icon Button & Flyout */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="hw-header-icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View notifications"
          >
            <BellIcon size={18} />
            {unreadCount > 0 && <span className="hw-badge-dot" />}
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '48px',
                right: 0,
                width: '320px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--hw-border)',
                borderRadius: 'var(--hw-radius-lg)',
                boxShadow: 'var(--hw-shadow-xl)',
                padding: '16px',
                zIndex: 1000
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <strong style={{ fontSize: '14px', color: 'var(--hw-text-main)' }}>Notifications</strong>
                <span style={{ fontSize: '11px', color: 'var(--hw-text-muted)' }}>{unreadCount} unread</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.map(n => (
                  <div
                    key={n.id}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      backgroundColor: n.read ? 'transparent' : 'var(--hw-bg)',
                      border: '1px solid var(--hw-border)',
                      fontSize: '12px'
                    }}
                  >
                    <div style={{ fontWeight: 600, color: 'var(--hw-text-main)', marginBottom: '3px' }}>
                      {n.title}
                    </div>
                    <div style={{ color: 'var(--hw-text-muted)', lineHeight: '1.4' }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--hw-text-subtle)', marginTop: '6px' }}>
                      {n.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill Menu */}
        <div style={{ position: 'relative' }}>
          <div
            className="hw-user-profile-badge"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            role="button"
            tabIndex={0}
          >
            <div className="hw-avatar">
              {user.fullName.charAt(0)}
            </div>
            <div className="hw-user-meta">
              <span className="hw-user-name">{user.fullName.split(' ')[0]}</span>
              <span className="hw-user-id">{user.bloodGroup} • {user.id}</span>
            </div>
          </div>

          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                top: '48px',
                right: 0,
                width: '220px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--hw-border)',
                borderRadius: 'var(--hw-radius-lg)',
                boxShadow: 'var(--hw-shadow-xl)',
                padding: '8px',
                zIndex: 1000
              }}
            >
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--hw-border)', marginBottom: '6px' }}>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--hw-text-main)' }}>{user.fullName}</div>
                <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)' }}>{user.phone}</div>
              </div>

              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 12px',
                  background: 'none',
                  border: 'none',
                  fontSize: '13px',
                  color: 'var(--hw-text-body)',
                  cursor: 'pointer',
                  borderRadius: '6px'
                }}
                onClick={() => {
                  navigate('settings');
                  setShowProfileMenu(false);
                }}
              >
                <UserIcon size={15} />
                <span>My Profile & Settings</span>
              </button>

              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 12px',
                  background: 'none',
                  border: 'none',
                  fontSize: '13px',
                  color: 'var(--hw-text-body)',
                  cursor: 'pointer',
                  borderRadius: '6px'
                }}
                onClick={() => {
                  navigate('offline');
                  setShowProfileMenu(false);
                }}
              >
                <QrCodeIcon size={15} />
                <span>Offline Health Pass</span>
              </button>

              <div style={{ borderTop: '1px solid var(--hw-border)', margin: '6px 0' }} />

              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 12px',
                  background: 'none',
                  border: 'none',
                  fontSize: '13px',
                  color: 'var(--hw-danger)',
                  cursor: 'pointer',
                  borderRadius: '6px'
                }}
                onClick={() => {
                  setShowProfileMenu(false);
                  logoutUser();
                }}
              >
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
