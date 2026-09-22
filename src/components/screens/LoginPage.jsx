import React, { useState, useEffect, useRef } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import { HealthcareIllustration } from '../common/HealthcareIllustration';
import { Modal } from '../common/Modal';
import {
  ShieldIcon,
  ShieldCheckIcon,
  EyeIcon,
  LockIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  AlertCircleIcon,
  CheckCircleIcon
} from '../common/Icons';
import '../../styles/login.css';

// Multilingual labels dictionary for English and Tamil
const LOGIN_I18N = {
  en: {
    brandName: 'Health Wallet',
    brandTagline: 'Your Health. Always With You.',
    headlineLine1: 'Secure.',
    headlineLine2: 'Accessible.',
    headlineLine3: 'For a Healthier Tomorrow.',
    supportingText: 'Securely access and manage your health information in one place.',
    trustPill: 'Unified Citizen Record',
    welcomeBack: 'Welcome Back',
    signInSubtitle: 'Sign in to securely access your Health Wallet.',
    mobileLabel: 'Mobile Number',
    mobilePlaceholder: 'Enter 10-digit mobile number',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    showPassword: 'Show',
    hidePassword: 'Hide',
    forgotPassword: 'Forgot Password?',
    signInBtn: 'Sign In',
    signingInBtn: 'Signing In...',
    orDivider: 'OR',
    continueWithOtp: 'Continue with OTP',
    noAccount: "Don't have an account?",
    createAccount: 'Create Account',
    trustNotice: 'Your health information is protected with secure authentication.',
    otpHeader: 'Enter Verification Code',
    otpSubtext: 'We sent a 6-digit verification code to',
    verifyBtn: 'Verify & Sign In',
    verifyingBtn: 'Verifying...',
    resendOtp: 'Resend Code',
    resendIn: 'Resend in',
    backToPassword: 'Back to Password Sign In',
    errorInvalidPhone: 'Please enter a valid 10-digit mobile number.',
    errorEmptyPassword: 'Password is required to sign in.',
    forgotTitle: 'Reset Your Password',
    forgotSubtext: 'Enter your registered mobile number and we will send a password reset code via SMS.',
    sendResetBtn: 'Send Reset Link',
    resetSentSuccess: 'Password reset link dispatched via SMS.'
  },
  ta: {
    brandName: 'ஹெல்த் வாலட்',
    brandTagline: 'உங்கள் நலம். என்றும் உங்களுடன்.',
    headlineLine1: 'பாதுகாப்பானது.',
    headlineLine2: 'எளிதில் அணுகக்கூடியது.',
    headlineLine3: 'ஆரோக்கியமான எதிர்காலத்திற்கு.',
    supportingText: 'உங்கள் சுகாதாரத் தகவல்களை ஒரே இடத்தில் பாதுகாப்பாக அணுகி நிர்வகிக்கவும்.',
    trustPill: 'ஒருங்கிணைந்த குடிமக்கள் பதிவு',
    welcomeBack: 'மீண்டும் வருக',
    signInSubtitle: 'உங்கள் ஹெல்த் வாலட்டைப் பாதுகாப்பாக அணுக உள்நுழைக.',
    mobileLabel: 'கைபேசி எண்',
    mobilePlaceholder: '10 இலக்க கைபேசி எண்ணை உள்ளிடுக',
    passwordLabel: 'கடவுச்சொல்',
    passwordPlaceholder: 'உங்கள் கடவுச்சொல்லை உள்ளிடுக',
    showPassword: 'காட்டு',
    hidePassword: 'மறை',
    forgotPassword: 'கடவுச்சொல் மறந்துவிட்டதா?',
    signInBtn: 'உள்நுழைக',
    signingInBtn: 'உள்நுழைகிறது...',
    orDivider: 'அல்லது',
    continueWithOtp: 'OTP மூலம் தொடர்க',
    noAccount: 'கணக்கு இல்லையா?',
    createAccount: 'கணக்கை உருவாக்குக',
    trustNotice: 'உங்கள் சுகாதாரத் தகவல்கள் பாதுகாப்பான அங்கீகாரத்துடன் பாதுகாக்கப்படுகின்றன.',
    otpHeader: 'சரிபார்ப்புக் குறியீட்டை உள்ளிடவும்',
    otpSubtext: '6 இலக்க சரிபார்ப்புக் குறியீடு அனுப்பப்பட்டது:',
    verifyBtn: 'சரிபார்த்து உள்நுழைக',
    verifyingBtn: 'சரிபார்க்கிறது...',
    resendOtp: 'குறியீட்டை மீண்டும் அனுப்புக',
    resendIn: 'மீண்டும் அனுப்ப:',
    backToPassword: 'கடவுச்சொல் உள்நுழைவிற்குத் திரும்புக',
    errorInvalidPhone: 'சரியான 10 இலக்க கைபேசி எண்ணை உள்ளிடவும்.',
    errorEmptyPassword: 'உள்நுழைய கடவுச்சொல் தேவை.',
    forgotTitle: 'கடவுச்சொல்லை மீட்டமைக்க',
    forgotSubtext: 'உங்கள் பதிவுசெய்த கைபேசி எண்ணை உள்ளிடவும். SMS மூலம் மீட்டமைப்பு இணைப்பு அனுப்பப்படும்.',
    sendResetBtn: 'மீட்டமைப்பு இணைப்பை அனுப்புக',
    resetSentSuccess: 'கடவுச்சொல் மீட்டமைப்பு இணைப்பு SMS மூலம் அனுப்பப்பட்டது.'
  }
};

export const LoginPage = () => {
  const { navigate, loginUser, addToast, language, setLanguage } = useHealthWallet();

  // Active translations
  const langKey = language === 'ta' ? 'ta' : 'en';
  const t = LOGIN_I18N[langKey];

  // Form State
  const [mobileNumber, setMobileNumber] = useState('9876543210');
  const [password, setPassword] = useState('SecurePass@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['5', '8', '2', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);

  // Status & Validation
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [authErrorBanner, setAuthErrorBanner] = useState('');

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotMobile, setForgotMobile] = useState('');

  const otpRefs = useRef([]);

  // Countdown for OTP resend
  useEffect(() => {
    let timer;
    if (isOtpMode && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOtpMode, resendTimer]);

  // Handle Mobile Number Change (Numeric only, max 10 digits)
  const handleMobileChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(raw);
    if (errors.mobile) {
      setErrors(prev => ({ ...prev, mobile: null }));
    }
    if (authErrorBanner) setAuthErrorBanner('');
  };

  // Handle Password Change
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: null }));
    }
    if (authErrorBanner) setAuthErrorBanner('');
  };

  // Validate Phone Number
  const isValidPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned);
  };

  // Handle Standard Password Sign In
  const handlePasswordSignIn = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!isValidPhone(mobileNumber)) {
      newErrors.mobile = t.errorInvalidPhone;
    }
    if (!password || password.trim().length === 0) {
      newErrors.password = t.errorEmptyPassword;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setAuthErrorBanner('');

    // Simulated network authentication call
    setTimeout(() => {
      setIsLoading(false);
      // Clean auth completion
      loginUser({ mobile: mobileNumber });
    }, 850);
  };

  // Trigger Continue with OTP Mode
  const handleSwitchToOtp = () => {
    if (!isValidPhone(mobileNumber)) {
      setErrors({ mobile: t.errorInvalidPhone });
      return;
    }
    setErrors({});
    setIsOtpMode(true);
    setResendTimer(30);
    addToast(`OTP dispatched to +91 ${mobileNumber}`, 'info');
  };

  // Handle OTP Digit Input
  const handleOtpBoxChange = (index, value) => {
    const char = value.replace(/\D/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = char;
    setOtpDigits(updated);

    // Auto-advance cursor
    if (char && index < 5 && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP Sign In
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const code = otpDigits.join('');
    if (code.length < 6) {
      setAuthErrorBanner('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      loginUser({ mobile: mobileNumber, otpVerified: true });
    }, 850);
  };

  // Resend OTP
  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    setResendTimer(30);
    addToast(`New verification code sent to +91 ${mobileNumber}`, 'info');
  };

  // Handle Forgot Password Submission
  const handleSendResetLink = (e) => {
    e.preventDefault();
    if (!isValidPhone(forgotMobile || mobileNumber)) {
      addToast(t.errorInvalidPhone, 'danger');
      return;
    }
    setShowForgotModal(false);
    addToast(t.resetSentSuccess, 'success');
  };

  return (
    <div className="hw-login-page">
      {/* Top Header Bar: Language Selector */}
      <header className="hw-login-topbar">
        <div className="hw-login-lang-switch">
          <button
            type="button"
            className={`hw-lang-link ${language === 'en' ? 'active' : ''}`}
            onClick={() => setLanguage('en')}
            aria-label="Switch to English"
          >
            English
          </button>
          <span className="hw-lang-divider">|</span>
          <button
            type="button"
            className={`hw-lang-link ${language === 'ta' ? 'active' : ''}`}
            onClick={() => setLanguage('ta')}
            aria-label="Switch to Tamil"
          >
            தமிழ்
          </button>
        </div>
      </header>

      {/* Main Two-Column Container */}
      <main className="hw-login-container">
        {/* =================================================================
            LEFT SIDE: HEALTH WALLET BRANDING & VISUAL SECTION
            ================================================================= */}
        <section className="hw-login-left">
          {/* Brand Lockup */}
          <div className="hw-login-brand-lockup">
            <div className="hw-login-logo-shield">
              <ShieldIcon size={24} color="#ffffff" />
            </div>
            <div className="hw-login-brand-text">
              <span className="hw-login-brand-title">{t.brandName}</span>
              <span className="hw-login-brand-tagline">{t.brandTagline}</span>
            </div>
          </div>

          {/* Bold Visual Headline */}
          <h1 className="hw-login-hero-headline">
            {t.headlineLine1}<br />
            {t.headlineLine2}<br />
            <span>{t.headlineLine3}</span>
          </h1>

          {/* Supporting Text */}
          <p className="hw-login-hero-subtext">
            {t.supportingText}
          </p>

          {/* Healthcare Family & Protection Illustration Card */}
          <div className="hw-login-illustration-card">
            <HealthcareIllustration />
            <div className="hw-login-trust-pill">
              <ShieldCheckIcon size={16} color="var(--hw-primary)" />
              <span>{t.trustPill}</span>
            </div>
          </div>
        </section>

        {/* =================================================================
            RIGHT SIDE: CENTERED AUTHENTICATION CARD
            ================================================================= */}
        <section className="hw-login-right">
          <div className="hw-auth-card-modern">
            {/* Card Header */}
            <div className="hw-auth-card-header">
              <h2 className="hw-auth-card-title">
                {isOtpMode ? t.otpHeader : t.welcomeBack}
              </h2>
              <p className="hw-auth-card-subtitle">
                {isOtpMode
                  ? `${t.otpSubtext} +91 ${mobileNumber}`
                  : t.signInSubtitle}
              </p>
            </div>

            {/* Error Banner */}
            {authErrorBanner && (
              <div className="hw-auth-banner-error" role="alert">
                <AlertCircleIcon size={16} />
                <span>{authErrorBanner}</span>
              </div>
            )}

            {/* ----------------- MODE A: PASSWORD LOGIN ----------------- */}
            {!isOtpMode ? (
              <form onSubmit={handlePasswordSignIn} noValidate>
                {/* Mobile Number Input Group */}
                <div className="hw-form-group">
                  <label htmlFor="login-mobile" className="hw-label hw-label-required">
                    {t.mobileLabel}
                  </label>
                  <div className={`hw-phone-input-group ${errors.mobile ? 'has-error' : ''}`}>
                    <div className="hw-phone-prefix" aria-hidden="true">
                      {/* India Flag SVG */}
                      <svg viewBox="0 0 640 480" className="hw-india-flag" aria-hidden="true">
                        <path fill="#f93" d="M0 0h640v160H0z" />
                        <path fill="#fff" d="M0 160h640v160H0z" />
                        <path fill="#128807" d="M0 320h640v160H0z" />
                        <circle cx="320" cy="240" r="40" fill="#008" />
                        <circle cx="320" cy="240" r="32" fill="#fff" />
                        <circle cx="320" cy="240" r="8" fill="#008" />
                      </svg>
                      <span>+91</span>
                    </div>
                    <input
                      id="login-mobile"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      className="hw-phone-field"
                      placeholder={t.mobilePlaceholder}
                      value={mobileNumber}
                      onChange={handleMobileChange}
                      aria-invalid={errors.mobile ? 'true' : 'false'}
                      aria-describedby={errors.mobile ? 'mobile-error' : undefined}
                      required
                    />
                  </div>
                  {errors.mobile && (
                    <div id="mobile-error" className="hw-auth-field-error">
                      <AlertCircleIcon size={12} />
                      <span>{errors.mobile}</span>
                    </div>
                  )}
                </div>

                {/* Password Input Group */}
                <div className="hw-form-group" style={{ marginBottom: '8px' }}>
                  <label htmlFor="login-password" className="hw-label hw-label-required">
                    {t.passwordLabel}
                  </label>
                  <div className="hw-password-group">
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className={`hw-password-input ${errors.password ? 'has-error' : ''}`}
                      placeholder={t.passwordPlaceholder}
                      value={password}
                      onChange={handlePasswordChange}
                      aria-invalid={errors.password ? 'true' : 'false'}
                      aria-describedby={errors.password ? 'password-error' : undefined}
                      required
                    />
                    <button
                      type="button"
                      className="hw-password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? t.hidePassword : t.showPassword}
                    >
                      <EyeIcon size={18} />
                    </button>
                  </div>
                  {errors.password && (
                    <div id="password-error" className="hw-auth-field-error">
                      <AlertCircleIcon size={12} />
                      <span>{errors.password}</span>
                    </div>
                  )}
                </div>

                {/* Meta Row: Forgot Password Link */}
                <div className="hw-auth-meta-row">
                  <a
                    href="#forgot"
                    className="hw-forgot-link"
                    onClick={(e) => {
                      e.preventDefault();
                      setForgotMobile(mobileNumber);
                      setShowForgotModal(true);
                    }}
                  >
                    {t.forgotPassword}
                  </a>
                </div>

                {/* Primary Action: Sign In */}
                <button
                  type="submit"
                  className="hw-login-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="hw-btn-spinner" />
                      <span>{t.signingInBtn}</span>
                    </>
                  ) : (
                    <span>{t.signInBtn}</span>
                  )}
                </button>

                {/* Divider: OR */}
                <div className="hw-auth-divider">
                  <div className="hw-auth-divider-line" />
                  <span className="hw-auth-divider-text">{t.orDivider}</span>
                  <div className="hw-auth-divider-line" />
                </div>

                {/* Secondary Outlined Action: Continue with OTP */}
                <button
                  type="button"
                  className="hw-otp-alt-btn"
                  onClick={handleSwitchToOtp}
                >
                  {t.continueWithOtp}
                </button>
              </form>
            ) : (
              /* ----------------- MODE B: OTP AUTHENTICATION ----------------- */
              <form onSubmit={handleVerifyOtp}>
                <div style={{ textAlign: 'center' }}>
                  {/* 6 Digit Input Boxes */}
                  <div className="hw-otp-box-grid">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={el => (otpRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className="hw-otp-box"
                        value={digit}
                        onChange={e => handleOtpBoxChange(idx, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(idx, e)}
                        autoFocus={idx === 3}
                        aria-label={`Digit ${idx + 1}`}
                      />
                    ))}
                  </div>

                  {/* Resend OTP Timer & Button */}
                  <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)', marginBottom: '20px' }}>
                    {resendTimer > 0 ? (
                      <span>{t.resendIn} <strong>{resendTimer}s</strong></span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--hw-primary)',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        {t.resendOtp}
                      </button>
                    )}
                  </div>

                  {/* Verify & Sign In Button */}
                  <button
                    type="submit"
                    className="hw-login-submit-btn"
                    disabled={isLoading}
                    style={{ marginBottom: '16px' }}
                  >
                    {isLoading ? (
                      <>
                        <div className="hw-btn-spinner" />
                        <span>{t.verifyingBtn}</span>
                      </>
                    ) : (
                      <span>{t.verifyBtn}</span>
                    )}
                  </button>

                  {/* Back to Password Mode */}
                  <button
                    type="button"
                    onClick={() => { setIsOtpMode(false); setAuthErrorBanner(''); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--hw-text-body)',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <ArrowLeftIcon size={14} />
                    <span>{t.backToPassword}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Footer Navigation: Create Account Link */}
            <div className="hw-auth-footer-prompt">
              <span>{t.noAccount}</span>
              <a
                href="#create-account"
                className="hw-auth-create-link"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('signup');
                }}
              >
                {t.createAccount}
              </a>
            </div>

            {/* Subtle Security Trust Notice */}
            <div className="hw-auth-trust-footer">
              <LockIcon size={14} color="var(--hw-teal)" />
              <span>{t.trustNotice}</span>
            </div>
          </div>
        </section>
      </main>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        title={t.forgotTitle}
        footer={
          <>
            <button
              type="button"
              className="hw-btn hw-btn-secondary"
              onClick={() => setShowForgotModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="hw-btn hw-btn-primary"
              onClick={handleSendResetLink}
            >
              {t.sendResetBtn}
            </button>
          </>
        }
      >
        <div>
          <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', marginBottom: '18px', lineHeight: '1.5' }}>
            {t.forgotSubtext}
          </p>
          <div className="hw-form-group">
            <label className="hw-label hw-label-required">{t.mobileLabel}</label>
            <div className="hw-phone-input-group">
              <div className="hw-phone-prefix">
                <span>+91</span>
              </div>
              <input
                type="tel"
                className="hw-phone-field"
                placeholder={t.mobilePlaceholder}
                value={forgotMobile}
                onChange={(e) => setForgotMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
