import React, { useState } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import {
  SearchIcon,
  BellIcon,
  MenuIcon,
  ChevronDownIcon,
  UserIcon,
  QrCodeIcon
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
    logoutUser
  } = useHealthWallet();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

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
          <MenuIcon size={20} />
        </button>

        <div className="hw-header-search">
          <div className="hw-input-prefix-icon">
            <SearchIcon size={15} color="#94a3b8" />
          </div>
          <input
            type="search"
            className="hw-input"
            placeholder="Search records, reports, doctors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Right: Language, Notifications Bell, User Profile (Matching Reference UI Panel 2) */}
      <div className="hw-header-right">
        {/* Language Switcher: English | தமிழ் */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b' }}>
          <button
            type="button"
            className="hw-lang-selector-header"
            style={{ fontWeight: language === 'en' ? 700 : 400, color: language === 'en' ? 'var(--hw-primary)' : 'inherit' }}
            onClick={() => setLanguage('en')}
          >
            English
          </button>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <button
            type="button"
            className="hw-lang-selector-header"
            style={{ fontWeight: language === 'ta' ? 700 : 400, color: language === 'ta' ? 'var(--hw-primary)' : 'inherit' }}
            onClick={() => setLanguage('ta')}
          >
            தமிழ்
          </button>
        </div>

        {/* Notifications Bell */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="hw-header-bell-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <BellIcon size={16} />
            {unreadCount > 0 && <span className="hw-badge-dot" />}
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '44px',
                right: 0,
                width: '300px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--hw-border)',
                borderRadius: 'var(--hw-radius-lg)',
                boxShadow: 'var(--hw-shadow-xl)',
                padding: '16px',
                zIndex: 1000
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <strong style={{ fontSize: '13px', color: 'var(--hw-text-main)' }}>Notifications</strong>
                <span style={{ fontSize: '11px', color: 'var(--hw-text-muted)' }}>{unreadCount} unread</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
                {notifications.map(n => (
                  <div
                    key={n.id}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      backgroundColor: n.read ? 'transparent' : '#f8fafc',
                      border: '1px solid var(--hw-border)',
                      fontSize: '12px'
                    }}
                  >
                    <div style={{ fontWeight: 600, color: 'var(--hw-text-main)' }}>{n.title}</div>
                    <div style={{ color: 'var(--hw-text-muted)', fontSize: '11px', marginTop: '2px' }}>{n.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar + Name + Dropdown (Panel 2 Reference) */}
        <div style={{ position: 'relative' }}>
          <div
            className="hw-user-pill-ref"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            role="button"
            tabIndex={0}
          >
            <div className="hw-avatar-ref">
              {/* Stylized avatar initials or photo */}
              <span>{user.fullName.charAt(0)}</span>
            </div>
            <span className="hw-user-name-ref">{user.fullName.split(' ')[0]}</span>
            <ChevronDownIcon size={14} color="#64748b" />
          </div>

          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                top: '44px',
                right: 0,
                width: '200px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--hw-border)',
                borderRadius: 'var(--hw-radius-md)',
                boxShadow: 'var(--hw-shadow-lg)',
                padding: '6px',
                zIndex: 1000
              }}
            >
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
                <UserIcon size={14} />
                <span>My Profile</span>
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
                <QrCodeIcon size={14} />
                <span>Offline Wallet</span>
              </button>

              <div style={{ borderTop: '1px solid var(--hw-border)', margin: '4px 0' }} />

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
