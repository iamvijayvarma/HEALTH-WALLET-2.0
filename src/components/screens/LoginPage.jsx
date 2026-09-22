import React, { useState } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import {
  ShieldIcon,
  ShieldCheckIcon,
  PhoneIcon,
  LockIcon,
  EyeIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  GlobeIcon
} from '../common/Icons';

export const LoginPage = () => {
  const { navigate, loginUser, addToast, language, setLanguage } = useHealthWallet();

  const [authMode, setAuthMode] = useState('password'); // 'password' | 'otp' | 'aadhaar'
  const [identifier, setIdentifier] = useState('9876543210');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState(['5', '8', '2', '', '', '']);
  const [otpSentPhone, setOtpSentPhone] = useState('+91 98765 43210');

  const handlePasswordLogin = (e) => {
    e.preventDefault();
    loginUser({ identifier });
  };

  const handleTriggerOtp = () => {
    setOtpSentPhone(identifier.length === 10 ? `+91 ${identifier}` : identifier);
    setShowOtpModal(true);
    addToast('One-Time Password (OTP) dispatched to mobile', 'info');
  };

  const handleVerifyOtp = () => {
    setShowOtpModal(false);
    loginUser({ identifier });
  };

  return (
    <div className="hw-auth-wrapper">
      <div className="hw-auth-card">
        {/* Header Branding */}
        <div className="hw-auth-brand-header">
          <div className="hw-auth-logo-center">
            <ShieldIcon size={28} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--hw-primary)', margin: '0 0 4px 0' }}>
            Health Wallet
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0 }}>
            Your Health. Always With You.
          </p>
        </div>

        {/* Tab Selector: Sign In vs Create Account */}
        <div className="hw-tabs" style={{ justifyContent: 'center', marginBottom: '24px' }}>
          <button
            type="button"
            className="hw-tab-btn active"
            style={{ paddingBottom: '8px' }}
          >
            Sign In
          </button>
          <button
            type="button"
            className="hw-tab-btn"
            style={{ paddingBottom: '8px' }}
            onClick={() => navigate('signup')}
          >
            Create Account
          </button>
        </div>

        {/* Auth Mode Toggle */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'var(--hw-bg-subtle)', padding: '4px', borderRadius: '8px' }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '12px',
              fontWeight: authMode === 'password' ? 600 : 500,
              background: authMode === 'password' ? '#ffffff' : 'transparent',
              color: authMode === 'password' ? 'var(--hw-primary)' : 'var(--hw-text-muted)',
              boxShadow: authMode === 'password' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer'
            }}
            onClick={() => setAuthMode('password')}
          >
            Password
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '12px',
              fontWeight: authMode === 'otp' ? 600 : 500,
              background: authMode === 'otp' ? '#ffffff' : 'transparent',
              color: authMode === 'otp' ? 'var(--hw-primary)' : 'var(--hw-text-muted)',
              boxShadow: authMode === 'otp' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer'
            }}
            onClick={() => setAuthMode('otp')}
          >
            Fast OTP
          </button>
        </div>

        {/* Sign In Form */}
        <form onSubmit={handlePasswordLogin}>
          <div className="hw-form-group">
            <label className="hw-label hw-label-required">
              Mobile Number / ABHA ID
            </label>
            <div className="hw-input-prefix">
              <div className="hw-input-prefix-icon">
                <PhoneIcon size={16} />
              </div>
              <input
                type="text"
                className="hw-input"
                placeholder="Enter 10-digit mobile number"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
            <span className="hw-form-hint">E.g., 9876543210 or 91-8402-1928-3841</span>
          </div>

          {authMode === 'password' ? (
            <>
              <div className="hw-form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="hw-label hw-label-required" style={{ margin: 0 }}>
                    Password
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => { e.preventDefault(); addToast('Password reset link sent via SMS', 'info'); }}
                    style={{ fontSize: '12px', color: 'var(--hw-primary)', textDecoration: 'none', fontWeight: 500 }}
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="hw-input-prefix" style={{ marginTop: '6px' }}>
                  <div className="hw-input-prefix-icon">
                    <LockIcon size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="hw-input"
                    placeholder="Enter your secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--hw-text-muted)',
                      cursor: 'pointer'
                    }}
                    aria-label="Toggle password visibility"
                  >
                    <EyeIcon size={16} />
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="hw-checkbox-label">
                  <input type="checkbox" className="hw-checkbox" defaultChecked />
                  <span style={{ fontSize: '13px' }}>Remember this device for 30 days</span>
                </label>
              </div>

              <Button variant="primary" type="submit" fullWidth size="lg">
                Sign In to Health Wallet
              </Button>
            </>
          ) : (
            <div style={{ marginTop: '12px', marginBottom: '20px' }}>
              <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', marginBottom: '16px' }}>
                We will send an encrypted 6-digit verification code to your registered mobile number.
              </p>
              <Button variant="primary" type="button" fullWidth size="lg" onClick={handleTriggerOtp}>
                Send Verification OTP
              </Button>
            </div>
          )}
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', gap: '12px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--hw-border)' }} />
          <span style={{ fontSize: '12px', color: 'var(--hw-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--hw-border)' }} />
        </div>

        {/* Aadhaar / Gov ID Auth Button */}
        <Button
          variant="secondary"
          fullWidth
          icon={ShieldCheckIcon}
          onClick={() => {
            setOtpSentPhone('UIDAI Registered Mobile (Ending in ••82)');
            setShowOtpModal(true);
            addToast('Aadhaar OTP request sent to UIDAI gateway', 'info');
          }}
        >
          Continue with Aadhaar / National ID
        </Button>

        {/* Switch to Signup */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--hw-text-body)' }}>
          Don't have an account?{' '}
          <a
            href="#signup"
            onClick={(e) => { e.preventDefault(); navigate('signup'); }}
            style={{ color: 'var(--hw-primary)', fontWeight: 600, textDecoration: 'none' }}
          >
            Create Citizen Account
          </a>
        </div>

        {/* Footer Language Link */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: 'var(--hw-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <GlobeIcon size={14} />
          <span
            style={{ cursor: 'pointer', color: language === 'en' ? 'var(--hw-primary)' : 'inherit', fontWeight: language === 'en' ? 600 : 400 }}
            onClick={() => setLanguage('en')}
          >
            English
          </span>
          <span>|</span>
          <span
            style={{ cursor: 'pointer', color: language === 'ta' ? 'var(--hw-primary)' : 'inherit', fontWeight: language === 'ta' ? 600 : 400 }}
            onClick={() => setLanguage('ta')}
          >
            தமிழ்
          </span>
          <span>|</span>
          <span
            style={{ cursor: 'pointer', color: language === 'hi' ? 'var(--hw-primary)' : 'inherit', fontWeight: language === 'hi' ? 600 : 400 }}
            onClick={() => setLanguage('hi')}
          >
            हिन्दी
          </span>
        </div>
      </div>

      {/* OTP Modal */}
      <Modal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        title="Verify Authentication OTP"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowOtpModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleVerifyOtp}>
              Verify & Sign In
            </Button>
          </>
        }
      >
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--hw-primary-light)', color: 'var(--hw-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
            <LockIcon size={22} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--hw-text-main)', marginBottom: '6px' }}>
            Enter 6-Digit Code
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', marginBottom: '20px' }}>
            Enter the verification code sent to <strong>{otpSentPhone}</strong>
          </p>

          {/* 6-box OTP input */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
            {['5', '8', '2', '1', '9', '4'].map((digit, i) => (
              <input
                key={i}
                type="text"
                maxLength={1}
                defaultValue={digit}
                style={{
                  width: '44px',
                  height: '48px',
                  textAlign: 'center',
                  fontSize: '20px',
                  fontWeight: 700,
                  borderRadius: '8px',
                  border: '1px solid var(--hw-border)',
                  outline: 'none',
                  backgroundColor: 'var(--hw-bg)'
                }}
              />
            ))}
          </div>

          <p style={{ fontSize: '12px', color: 'var(--hw-text-muted)' }}>
            Didn't receive code?{' '}
            <button
              type="button"
              onClick={() => addToast('New OTP dispatched', 'info')}
              style={{ background: 'none', border: 'none', color: 'var(--hw-primary)', fontWeight: 600, cursor: 'pointer' }}
            >
              Resend in 24s
            </button>
          </p>
        </div>
      </Modal>
    </div>
  );
};
