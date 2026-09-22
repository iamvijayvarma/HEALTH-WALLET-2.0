import React, { useState } from 'react';
import { HealthWalletProvider, useHealthWallet } from './context/HealthWalletContext';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/Toast';
import { LandingPage } from './components/screens/LandingPage';
import { LoginPage } from './components/screens/LoginPage';
import { SignupPage } from './components/screens/SignupPage';
import { DashboardPage } from './components/screens/DashboardPage';
import { HealthRecordsPage } from './components/screens/HealthRecordsPage';
import { ScanReportPage } from './components/screens/ScanReportPage';
import { MedicinesPage } from './components/screens/MedicinesPage';
import { FamilyHealthPage } from './components/screens/FamilyHealthPage';
import { BloodDonationPage } from './components/screens/BloodDonationPage';
import { OrganDonationPage } from './components/screens/OrganDonationPage';
import { EmergencyPage } from './components/screens/EmergencyPage';
import { OfflineWalletPage } from './components/screens/OfflineWalletPage';
import { SettingsPage } from './components/screens/SettingsPage';
import {
  ActivityIcon,
  FileTextIcon,
  CameraIcon,
  AlertTriangleIcon,
  UserIcon
} from './components/common/Icons';
import './styles/app.css';

const MainAppContent = () => {
  const { currentRoute, navigate, toasts, removeToast } = useHealthWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Standalone public pages (no internal application shell)
  if (currentRoute === 'landing') {
    return (
      <>
        <LandingPage />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  if (currentRoute === 'login') {
    return (
      <>
        <LoginPage />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  if (currentRoute === 'signup') {
    return (
      <>
        <SignupPage />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  // Active Internal Healthcare Shell
  return (
    <div className="hw-app-layout">
      {/* Persistent Left Sidebar */}
      <Sidebar
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="hw-main-wrapper">
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="hw-content">
          {currentRoute === 'dashboard' && <DashboardPage />}
          {currentRoute === 'records' && <HealthRecordsPage />}
          {currentRoute === 'scan' && <ScanReportPage />}
          {currentRoute === 'medicines' && <MedicinesPage />}
          {currentRoute === 'family' && <FamilyHealthPage />}
          {currentRoute === 'blood-donation' && <BloodDonationPage />}
          {currentRoute === 'organ-donation' && <OrganDonationPage />}
          {currentRoute === 'emergency' && <EmergencyPage />}
          {currentRoute === 'offline' && <OfflineWalletPage />}
          {currentRoute === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="hw-mobile-nav" aria-label="Mobile Bottom Navigation">
        <button
          type="button"
          className={`hw-mobile-nav-btn ${currentRoute === 'dashboard' ? 'active' : ''}`}
          onClick={() => navigate('dashboard')}
        >
          <ActivityIcon size={18} />
          <span>Home</span>
        </button>

        <button
          type="button"
          className={`hw-mobile-nav-btn ${currentRoute === 'records' ? 'active' : ''}`}
          onClick={() => navigate('records')}
        >
          <FileTextIcon size={18} />
          <span>Records</span>
        </button>

        <button
          type="button"
          className={`hw-mobile-nav-btn ${currentRoute === 'scan' ? 'active' : ''}`}
          onClick={() => navigate('scan')}
        >
          <CameraIcon size={18} />
          <span>Scan</span>
        </button>

        <button
          type="button"
          className={`hw-mobile-nav-btn hw-mobile-nav-emergency ${currentRoute === 'emergency' ? 'active' : ''}`}
          onClick={() => navigate('emergency')}
        >
          <AlertTriangleIcon size={18} />
          <span>Emergency</span>
        </button>

        <button
          type="button"
          className={`hw-mobile-nav-btn ${currentRoute === 'settings' ? 'active' : ''}`}
          onClick={() => navigate('settings')}
        >
          <UserIcon size={18} />
          <span>Profile</span>
        </button>
      </nav>

      {/* Real-time Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export default function App() {
  return (
    <HealthWalletProvider>
      <MainAppContent />
    </HealthWalletProvider>
  );
}
