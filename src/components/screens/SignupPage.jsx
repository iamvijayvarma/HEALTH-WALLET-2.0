import React, { useState } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import { Button } from '../common/Button';
import {
  ShieldIcon,
  CheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  PhoneIcon,
  UserIcon,
  DropletIcon,
  AlertTriangleIcon,
  ShieldCheckIcon
} from '../common/Icons';

export const SignupPage = () => {
  const { navigate, loginUser, updateUserProfile, addToast } = useHealthWallet();

  const [step, setStep] = useState(1); // 1: Personal, 2: OTP, 3: Health Profile, 4: Emergency Contact, 5: Consent

  const [formData, setFormData] = useState({
    fullName: 'Kavin Rajan',
    dob: '1998-03-12',
    gender: 'Male',
    phone: '9876543210',
    email: 'kavin.rajan@gov-health.org',
    bloodGroup: 'O+',
    allergies: 'Penicillin, Dust Mites',
    conditions: 'Mild Bronchial Asthma',
    emergencyName: 'Rajendran R',
    emergencyPhone: '9840123456',
    emergencyRelation: 'Father',
    consentRecords: true,
    consentEmergency: true
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      // Final submission
      updateUserProfile({
        fullName: formData.fullName,
        dob: formData.dob,
        gender: formData.gender,
        phone: `+91 ${formData.phone}`,
        email: formData.email,
        bloodGroup: formData.bloodGroup,
        allergies: formData.allergies.split(',').map(s => s.trim()),
        chronicConditions: formData.conditions ? [formData.conditions] : []
      });
      loginUser({});
      navigate('dashboard');
    }
  };

  return (
    <div className="hw-auth-wrapper" style={{ padding: '40px 16px' }}>
      <div className="hw-auth-card" style={{ maxWidth: '580px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="hw-auth-logo-center" style={{ width: '40px', height: '40px', margin: 0 }}>
              <ShieldIcon size={20} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--hw-primary)', margin: 0 }}>
                Citizen Health Registration
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--hw-text-muted)', margin: 0 }}>
                Step {step} of 5: {step === 1 ? 'Personal Details' : step === 2 ? 'OTP Verification' : step === 3 ? 'Health Profile' : step === 4 ? 'Emergency Contact' : 'Consent & Protection'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('login')}
            style={{ background: 'none', border: 'none', color: 'var(--hw-primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
          >
            Sign In
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '28px' }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                backgroundColor: s <= step ? 'var(--hw-primary)' : 'var(--hw-border)',
                transition: 'background-color 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* STEP 1: Personal Details */}
        {step === 1 && (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--hw-text-main)', marginBottom: '16px' }}>
              Enter Personal Details
            </h3>

            <div className="hw-form-group">
              <label className="hw-label hw-label-required">Full Legal Name</label>
              <input
                type="text"
                name="fullName"
                className="hw-input"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Kavin Rajan"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="hw-form-group">
                <label className="hw-label hw-label-required">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  className="hw-input"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="hw-form-group">
                <label className="hw-label hw-label-required">Gender</label>
                <select
                  name="gender"
                  className="hw-select"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other / Non-Binary</option>
                </select>
              </div>
            </div>

            <div className="hw-form-group">
              <label className="hw-label hw-label-required">Mobile Number</label>
              <div className="hw-input-prefix">
                <div className="hw-input-prefix-icon">
                  <PhoneIcon size={16} />
                </div>
                <input
                  type="tel"
                  name="phone"
                  className="hw-input"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  required
                />
              </div>
              <span className="hw-form-hint">A verification code will be sent via SMS in the next step.</span>
            </div>

            <div className="hw-form-group">
              <label className="hw-label">Email Address (Optional)</label>
              <input
                type="email"
                name="email"
                className="hw-input"
                value={formData.email}
                onChange={handleChange}
                placeholder="citizen@example.org"
              />
            </div>
          </div>
        )}

        {/* STEP 2: OTP Verification */}
        {step === 2 && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--hw-primary-light)', color: 'var(--hw-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <PhoneIcon size={22} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--hw-text-main)', marginBottom: '6px' }}>
              Verify Mobile Number
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', marginBottom: '24px' }}>
              We sent a 6-digit verification code to <strong>+91 {formData.phone}</strong>
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
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
                Resend Code
              </button>
            </p>
          </div>
        )}

        {/* STEP 3: Basic Health Profile */}
        {step === 3 && (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--hw-text-main)', marginBottom: '8px' }}>
              Basic Health Profile
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--hw-text-muted)', marginBottom: '18px' }}>
              This core information is printed onto your emergency offline pass.
            </p>

            <div className="hw-form-group">
              <label className="hw-label hw-label-required">Blood Group</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {bloodGroups.map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: formData.bloodGroup === bg ? '2px solid var(--hw-primary)' : '1px solid var(--hw-border)',
                      backgroundColor: formData.bloodGroup === bg ? 'var(--hw-primary-light)' : '#ffffff',
                      color: formData.bloodGroup === bg ? 'var(--hw-primary)' : 'var(--hw-text-main)',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    onClick={() => setFormData(p => ({ ...p, bloodGroup: bg }))}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            <div className="hw-form-group">
              <label className="hw-label">Known Allergies (Medications / Food)</label>
              <input
                type="text"
                name="allergies"
                className="hw-input"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="e.g. Penicillin, Sulfa drugs, Peanuts (comma separated)"
              />
              <span className="hw-form-hint">Displayed in red alert to paramedics during trauma triage.</span>
            </div>

            <div className="hw-form-group">
              <label className="hw-label">Existing Chronic Conditions</label>
              <input
                type="text"
                name="conditions"
                className="hw-input"
                value={formData.conditions}
                onChange={handleChange}
                placeholder="e.g. Hypertension, Asthma, Type 2 Diabetes"
              />
            </div>
          </div>
        )}

        {/* STEP 4: Emergency Contact */}
        {step === 4 && (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--hw-text-main)', marginBottom: '8px' }}>
              Emergency Contact Setup
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--hw-text-muted)', marginBottom: '18px' }}>
              Who should be notified immediately if you activate Emergency Mode?
            </p>

            <div className="hw-form-group">
              <label className="hw-label hw-label-required">Contact Person Full Name</label>
              <input
                type="text"
                name="emergencyName"
                className="hw-input"
                value={formData.emergencyName}
                onChange={handleChange}
                placeholder="e.g. Rajendran R"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '14px' }}>
              <div className="hw-form-group">
                <label className="hw-label hw-label-required">Contact Mobile Number</label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  className="hw-input"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                  placeholder="9840123456"
                  required
                />
              </div>

              <div className="hw-form-group">
                <label className="hw-label hw-label-required">Relationship</label>
                <select
                  name="emergencyRelation"
                  className="hw-select"
                  value={formData.emergencyRelation}
                  onChange={handleChange}
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Child">Child</option>
                  <option value="Friend">Friend / Guardian</option>
                </select>
              </div>
            </div>

            <div className="hw-alert hw-alert-info" style={{ marginTop: '12px' }}>
              <ShieldCheckIcon size={16} />
              <span style={{ fontSize: '12px' }}>
                Your emergency contact will receive an automated SMS with your live GPS location only when you trigger Emergency SOS.
              </span>
            </div>
          </div>
        )}

        {/* STEP 5: Consent & Review */}
        {step === 5 && (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--hw-text-main)', marginBottom: '14px' }}>
              Public Health Privacy & Consent
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <label className="hw-checkbox-label" style={{ alignItems: 'flex-start' }}>
                <input
                  type="checkbox"
                  name="consentRecords"
                  checked={formData.consentRecords}
                  onChange={handleChange}
                  className="hw-checkbox"
                  style={{ marginTop: '3px' }}
                />
                <span style={{ fontSize: '13px', lineHeight: '1.5' }}>
                  <strong>Digital Health Record Federation:</strong> I authorize Health Wallet to link and fetch diagnostic lab reports, prescriptions, and hospital discharge summaries with explicit per-transaction OTP consent.
                </span>
              </label>

              <label className="hw-checkbox-label" style={{ alignItems: 'flex-start' }}>
                <input
                  type="checkbox"
                  name="consentEmergency"
                  checked={formData.consentEmergency}
                  onChange={handleChange}
                  className="hw-checkbox"
                  style={{ marginTop: '3px' }}
                />
                <span style={{ fontSize: '13px', lineHeight: '1.5' }}>
                  <strong>Emergency Medical Triage Disclosure:</strong> I consent to make my blood group, documented severe allergies, and primary emergency contacts accessible via cryptographic offline QR pass to licensed emergency paramedics and hospitals.
                </span>
              </label>
            </div>

            <div style={{ background: 'var(--hw-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--hw-border)', fontSize: '12px', color: 'var(--hw-text-muted)' }}>
              <strong>Zero-Sale Guarantee:</strong> In accordance with public health privacy frameworks, citizen health records are never monetized, sold, or shared with third-party advertising or insurance entities.
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--hw-border)' }}>
          {step > 1 ? (
            <Button
              variant="secondary"
              icon={ArrowLeftIcon}
              onClick={() => setStep(step - 1)}
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          <Button
            variant="primary"
            icon={step === 5 ? CheckIcon : ArrowRightIcon}
            iconPosition="right"
            onClick={handleNext}
          >
            {step === 5 ? 'Complete Registration & Enter Wallet' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
};
