import React from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import { Button } from '../common/Button';
import {
  ShieldCheckIcon,
  ShieldIcon,
  ActivityIcon,
  CameraIcon,
  UsersIcon,
  QrCodeIcon,
  AlertTriangleIcon,
  HeartIcon,
  LockIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '../common/Icons';

export const LandingPage = () => {
  const { navigate } = useHealthWallet();

  const features = [
    {
      icon: ActivityIcon,
      title: 'Unified Health Records',
      desc: 'Centralize laboratory reports, prescriptions, radiology scans, and doctor consultations across government and private healthcare providers.'
    },
    {
      icon: CameraIcon,
      title: 'AI Lab Report Scanner',
      desc: 'Smart entity recognition extracts biochemical values and reference ranges with compulsory doctor/patient review before saving.'
    },
    {
      icon: UsersIcon,
      title: 'Family Health Circles',
      desc: 'Manage health records of elderly parents and children with consent-based, role-governed access controls.'
    },
    {
      icon: QrCodeIcon,
      title: 'Offline Emergency Pass',
      desc: 'Instant cryptographic QR verification provides critical blood group and allergy details even without active internet or cellular signal.'
    },
    {
      icon: HeartIcon,
      title: 'Blood & Organ Registry',
      desc: 'Find verified compatible blood donors in emergencies and securely register national organ donation intentions.'
    },
    {
      icon: LockIcon,
      title: 'Institutional Security',
      desc: 'End-to-end encrypted storage strictly governed by national public health standards with complete audit log visibility.'
    }
  ];

  return (
    <div className="hw-landing-container">
      {/* Top Header */}
      <header className="hw-landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('landing')}>
          <div className="hw-brand-logo-icon">
            <ShieldIcon size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--hw-primary)', letterSpacing: '-0.02em' }}>
              Health Wallet
            </div>
            <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)' }}>
              National Digital Health Platform
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button variant="ghost" onClick={() => navigate('login')}>
            Sign In
          </Button>
          <Button variant="primary" onClick={() => navigate('signup')}>
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hw-landing-hero">
        <div>
          <div className="hw-landing-badge">
            <ShieldCheckIcon size={16} />
            <span>Secure Citizen Healthcare Platform</span>
          </div>

          <h1 className="hw-landing-title">
            Your Health. <span>Always With You.</span>
          </h1>

          <p className="hw-landing-lead">
            A secure, unified digital healthcare platform designed for citizens and healthcare providers. Access your lifetime medical records, protect your family, and receive prompt emergency medical care.
          </p>

          <div className="hw-landing-actions">
            <Button variant="primary" size="lg" icon={ArrowRightIcon} iconPosition="right" onClick={() => navigate('signup')}>
              Create Citizen Health Account
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('dashboard')}>
              Explore Live Demo Wallet
            </Button>
          </div>

          <div style={{ marginTop: '28px', display: 'flex', gap: '20px', color: 'var(--hw-text-muted)', fontSize: '13px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircleIcon size={16} color="var(--hw-green)" /> Standardized Formats
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircleIcon size={16} color="var(--hw-green)" /> Encrypted Storage
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircleIcon size={16} color="var(--hw-green)" /> Consent-Based Access
            </span>
          </div>
        </div>

        {/* Hero Preview Card */}
        <div className="hw-landing-hero-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="hw-avatar">K</div>
              <div>
                <strong style={{ fontSize: '14px', color: 'var(--hw-text-main)' }}>Kavin Rajan</strong>
                <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)' }}>HW-9021-4819 • Blood Group O+</div>
              </div>
            </div>
            <span className="hw-badge hw-badge-teal">Verified Citizen</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: '#ffffff', border: '1px solid var(--hw-border)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)' }}>Emergency Blood Group</div>
              <strong style={{ fontSize: '20px', color: 'var(--hw-primary)' }}>O+ Rh Positive</strong>
            </div>
            <div style={{ background: '#ffffff', border: '1px solid var(--hw-border)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)' }}>Active Allergies</div>
              <strong style={{ fontSize: '20px', color: 'var(--hw-danger)' }}>2 Documented</strong>
            </div>
          </div>

          <div style={{ background: 'var(--hw-primary-light)', border: '1px solid rgba(15, 76, 129, 0.2)', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <ShieldIcon size={16} color="var(--hw-primary)" />
              <strong style={{ fontSize: '12px', color: 'var(--hw-primary)' }}>Latest Verified Clinical Record</strong>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--hw-text-main)' }}>Complete Blood Count (CBC) Profile</div>
            <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)' }}>Apollo Hospitals, Chennai • Dr. Sundaram (MD)</div>
          </div>

          <Button variant="danger" fullWidth icon={AlertTriangleIcon} onClick={() => navigate('emergency')}>
            Open Emergency Medical Pass
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ backgroundColor: 'var(--hw-bg)', padding: '64px 24px', borderTop: '1px solid var(--hw-border)', borderBottom: '1px solid var(--hw-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--hw-text-main)', marginBottom: '12px' }}>
              Purpose-Built for Public Health & Patient Dignity
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--hw-text-muted)', maxWidth: '640px', margin: '0 auto' }}>
              Every feature is built around privacy, clinical clarity, and rapid responsiveness during medical crises.
            </p>
          </div>

          <div className="hw-grid-3">
            {features.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div key={idx} className="hw-feature-card">
                  <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'var(--hw-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--hw-primary)', marginBottom: '16px' }}>
                    <IconComp size={22} />
                  </div>
                  <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--hw-text-main)', marginBottom: '8px' }}>
                    {feat.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', lineHeight: '1.6' }}>
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Emergency Focus Section */}
      <section style={{ padding: '64px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ background: '#fff', border: '1px solid var(--hw-border)', borderRadius: '16px', padding: '40px', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '36px', alignItems: 'center' }}>
          <div>
            <span className="hw-badge hw-badge-danger" style={{ marginBottom: '14px' }}>
              Critical Emergency Architecture
            </span>
            <h2 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--hw-text-main)', marginBottom: '14px' }}>
              When Seconds Count, Your Medical Identity Speaks
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--hw-text-muted)', lineHeight: '1.7', marginBottom: '24px' }}>
              In acute trauma or unconscious arrivals at hospital triage, first responders need immediate knowledge of your blood type, cardiac medications, and penicillin allergies. Health Wallet gives authorized responders instant view via your cryptographically signed offline pass.
            </p>
            <Button variant="danger" icon={AlertTriangleIcon} onClick={() => navigate('emergency')}>
              Test Emergency Response Flow
            </Button>
          </div>

          <div style={{ background: 'var(--hw-bg)', borderRadius: '12px', padding: '24px', border: '1px solid var(--hw-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--hw-danger)' }} />
              <strong style={{ fontSize: '13px', color: 'var(--hw-text-main)' }}>First Responder Data Triad</strong>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: 'var(--hw-text-body)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircleIcon size={16} color="var(--hw-teal)" />
                <span><strong>Blood Group:</strong> Rh-typed crossmatch baseline</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircleIcon size={16} color="var(--hw-teal)" />
                <span><strong>Anaphylaxis / Drug Allergies:</strong> High visibility alert</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircleIcon size={16} color="var(--hw-teal)" />
                <span><strong>Authorized Contacts:</strong> Automated SMS dispatch with GPS</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Institutional Footer */}
      <footer style={{ marginTop: 'auto', backgroundColor: '#0f172a', color: '#94a3b8', padding: '48px 24px 32px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginBottom: '40px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontWeight: 700, fontSize: '16px', marginBottom: '12px' }}>
              <ShieldIcon size={18} color="#ffffff" />
              <span>Health Wallet</span>
            </div>
            <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#64748b' }}>
              National public healthcare digital ecosystem. Empowering citizens with unified, verified health credentials.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '13px', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Citizen Services
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <span style={{ cursor: 'pointer' }} onClick={() => navigate('dashboard')}>Citizen Dashboard</span>
              <span style={{ cursor: 'pointer' }} onClick={() => navigate('records')}>Health Records</span>
              <span style={{ cursor: 'pointer' }} onClick={() => navigate('scan')}>AI Report Scanner</span>
              <span style={{ cursor: 'pointer' }} onClick={() => navigate('offline')}>Offline Health Card</span>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '13px', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Emergency Helplines
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <span>National Ambulance: <strong>108 / 112</strong></span>
              <span>Blood Helpline: <strong>1910</strong></span>
              <span>Mental Health Line (KIRAN): <strong>1800-599-0019</strong></span>
              <span>Grievance Redressal: <strong>14477</strong></span>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '13px', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Security & Standards
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <span>Secure Cloud Infrastructure</span>
              <span>Standardized Clinical Data</span>
              <span>Zero Unapproved Data Sharing</span>
              <span>Privacy-First Architecture</span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '24px', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '12px' }}>
          <div>© 2026 Health Wallet Platform. All Rights Reserved. Public Health Initiative.</div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Privacy Policy</span>
            <span>Terms of Use</span>
            <span>Accessibility Declaration</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
