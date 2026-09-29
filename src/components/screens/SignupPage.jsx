import React, { useState } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import { maskAadhaar, isValidAadhaar, isValidMobile, isValidEmail } from '../../utils/userHelpers';
import { Modal } from '../common/Modal';
import {
  ShieldIcon,
  ShieldCheckIcon,
  CheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  CopyIcon,
  EyeIcon,
  DropletIcon,
  UserIcon
} from '../common/Icons';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi (NCT)',
  'Puducherry'
];

export const SignupPage = () => {
  const { navigate, registerNewUser, addToast } = useHealthWallet();

  // Current Step: 1 = Personal, 2 = Health & Emergency, 3 = Security & Consents, 4 = Review & Create
  const [step, setStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    fullName: '',
    dateOfBirth: '',
    gender: 'Male',
    aadhaarNumber: '',
    mobileNumber: '',
    email: '',
    state: 'Tamil Nadu',
    district: '',
    address: '',

    // Step 2: Health & Emergency Information
    bloodGroup: 'O+',
    allergies: '',
    criticalConditions: '',
    emergencyContactName: '',
    emergencyContactMobile: '',
    emergencyContactRelationship: 'Father',

    // Step 3: Account Security & Consents
    password: '',
    confirmPassword: '',
    consentTerms: false,
    consentPrivacy: false
  });

  // UI state for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Inline Validation Errors
  const [errors, setErrors] = useState({});
  const [_touched, setTouched] = useState({});

  // Success Modal State
  const [createdUser, setCreatedUser] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Input change handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;

    // Numerical formatting for Aadhaar & Mobile
    if (name === 'aadhaarNumber') {
      finalValue = value.replace(/\D/g, '').slice(0, 12);
    } else if (name === 'mobileNumber' || name === 'emergencyContactMobile') {
      finalValue = value.replace(/\D/g, '').slice(0, 10);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue
    }));

    // Clear error on change if present
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    validateField(fieldName);
  };

  // Validate a single field
  const validateField = (fieldName) => {
    let err = '';
    const val = formData[fieldName];

    switch (fieldName) {
      case 'fullName':
        if (!val || !val.trim()) err = 'Full legal name is required.';
        break;
      case 'dateOfBirth':
        if (!val) err = 'Date of birth is required.';
        break;
      case 'gender':
        if (!val) err = 'Gender is required.';
        break;
      case 'aadhaarNumber':
        if (!val) {
          err = 'Aadhaar number is required.';
        } else if (!isValidAadhaar(val)) {
          err = 'Aadhaar must contain exactly 12 numeric digits.';
        }
        break;
      case 'mobileNumber':
        if (!val) {
          err = 'Mobile number is required.';
        } else if (!isValidMobile(val)) {
          err = 'Mobile number must contain exactly 10 digits.';
        }
        break;
      case 'email':
        if (!val || !val.trim()) {
          err = 'Email address is required.';
        } else if (!isValidEmail(val)) {
          err = 'Please enter a valid email address.';
        }
        break;
      case 'state':
        if (!val || !val.trim()) err = 'State is required.';
        break;
      case 'district':
        if (!val || !val.trim()) err = 'District is required.';
        break;
      case 'address':
        if (!val || !val.trim()) err = 'Residential address is required.';
        break;
      case 'bloodGroup':
        if (!val) err = 'Blood group is required.';
        break;
      case 'emergencyContactName':
        if (!val || !val.trim()) err = 'Emergency contact name is required.';
        break;
      case 'emergencyContactMobile':
        if (!val) {
          err = 'Emergency contact mobile is required.';
        } else if (!isValidMobile(val)) {
          err = 'Emergency mobile must contain exactly 10 digits.';
        }
        break;
      case 'emergencyContactRelationship':
        if (!val) err = 'Relationship is required.';
        break;
      case 'password':
        if (!val) {
          err = 'Password is required.';
        } else if (val.length < 6) {
          err = 'Password must be at least 6 characters.';
        }
        break;
      case 'confirmPassword':
        if (!val) {
          err = 'Please confirm your password.';
        } else if (val !== formData.password) {
          err = 'Passwords do not match.';
        }
        break;
      case 'consentTerms':
        if (!val) err = 'You must accept the Terms & Conditions.';
        break;
      case 'consentPrivacy':
        if (!val) err = 'You must accept the Privacy & Data Processing Consent.';
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [fieldName]: err }));
    return !err;
  };

  // Validate entire Step before advancing
  const validateStep = (currentStep) => {
    const newErrors = {};
    let isValid = true;

    if (currentStep === 1) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full legal name is required.';
        isValid = false;
      }
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = 'Date of birth is required.';
        isValid = false;
      }
      if (!formData.gender) {
        newErrors.gender = 'Gender is required.';
        isValid = false;
      }
      if (!formData.aadhaarNumber) {
        newErrors.aadhaarNumber = 'Aadhaar number is required.';
        isValid = false;
      } else if (!isValidAadhaar(formData.aadhaarNumber)) {
        newErrors.aadhaarNumber = 'Aadhaar must contain exactly 12 numeric digits.';
        isValid = false;
      }
      if (!formData.mobileNumber) {
        newErrors.mobileNumber = 'Mobile number is required.';
        isValid = false;
      } else if (!isValidMobile(formData.mobileNumber)) {
        newErrors.mobileNumber = 'Mobile number must contain exactly 10 digits.';
        isValid = false;
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email address is required.';
        isValid = false;
      } else if (!isValidEmail(formData.email)) {
        newErrors.email = 'Please enter a valid email address.';
        isValid = false;
      }
      if (!formData.state.trim()) {
        newErrors.state = 'State is required.';
        isValid = false;
      }
      if (!formData.district.trim()) {
        newErrors.district = 'District is required.';
        isValid = false;
      }
      if (!formData.address.trim()) {
        newErrors.address = 'Residential address is required.';
        isValid = false;
      }
    } else if (currentStep === 2) {
      if (!formData.bloodGroup) {
        newErrors.bloodGroup = 'Blood group is required.';
        isValid = false;
      }
      if (!formData.emergencyContactName.trim()) {
        newErrors.emergencyContactName = 'Emergency contact person name is required.';
        isValid = false;
      }
      if (!formData.emergencyContactMobile) {
        newErrors.emergencyContactMobile = 'Emergency contact mobile number is required.';
        isValid = false;
      } else if (!isValidMobile(formData.emergencyContactMobile)) {
        newErrors.emergencyContactMobile = 'Emergency contact mobile must be 10 digits.';
        isValid = false;
      }
      if (!formData.emergencyContactRelationship) {
        newErrors.emergencyContactRelationship = 'Emergency contact relationship is required.';
        isValid = false;
      }
    } else if (currentStep === 3) {
      if (!formData.password) {
        newErrors.password = 'Password is required.';
        isValid = false;
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters.';
        isValid = false;
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirmation password is required.';
        isValid = false;
      } else if (formData.confirmPassword !== formData.password) {
        newErrors.confirmPassword = 'Passwords do not match.';
        isValid = false;
      }
      if (!formData.consentTerms) {
        newErrors.consentTerms = 'You must accept the Terms & Conditions.';
        isValid = false;
      }
      if (!formData.consentPrivacy) {
        newErrors.consentPrivacy = 'You must accept the Privacy & Data Processing Consent.';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      addToast('Please complete all required fields correctly to proceed.', 'error');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Final Form Submission at Step 4
  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      addToast('Some information is incomplete or invalid. Please check previous steps.', 'error');
      return;
    }

    // Register user through context method
    const newUser = registerNewUser(formData);
    setCreatedUser(newUser);
    setShowSuccessModal(true);
  };

  const handleCopyCreatedId = async () => {
    if (!createdUser?.healthWalletId) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(createdUser.healthWalletId);
      }
      setCopiedId(true);
      addToast('Health Wallet ID copied', 'success');
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleEnterDashboard = () => {
    setShowSuccessModal(false);
    navigate('dashboard');
  };

  return (
    <div className="hw-auth-wrapper" style={{ padding: '36px 16px', minHeight: '100vh', background: 'var(--hw-bg, #f8fafc)' }}>
      <div className="hw-auth-card" style={{ maxWidth: '680px', margin: '0 auto', background: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', padding: '32px' }}>
        
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--hw-primary, #1e56a0) 0%, #1e3a8a 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(30, 86, 160, 0.25)'
              }}
            >
              <ShieldIcon size={22} color="#ffffff" />
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--hw-text-main, #0f172a)', margin: 0, letterSpacing: '-0.02em' }}>
                Create Health Wallet
              </h1>
              <p style={{ fontSize: '12px', color: 'var(--hw-text-muted, #64748b)', margin: '2px 0 0 0' }}>
                Unified Citizen Health Identity Registration
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('login')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--hw-primary, #1e56a0)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: '6px'
            }}
          >
            Sign In Instead
          </button>
        </div>

        {/* 4-Step Progress Indicator */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '10px' }}>
            {[
              { num: 1, label: 'Personal' },
              { num: 2, label: 'Health & SOS' },
              { num: 3, label: 'Security' },
              { num: 4, label: 'Review' }
            ].map((s) => (
              <div key={s.num} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    height: '4px',
                    borderRadius: '2px',
                    backgroundColor: s.num <= step ? 'var(--hw-primary, #1e56a0)' : '#e2e8f0',
                    transition: 'all 0.3s ease',
                    marginBottom: '6px'
                  }}
                />
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: s.num === step ? 700 : 500,
                    color: s.num === step ? 'var(--hw-primary, #1e56a0)' : s.num < step ? '#047857' : '#94a3b8'
                  }}
                >
                  Step {s.num}: {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1: Personal Information */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 4px 0' }}>
                Step 1: Personal Information
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0 }}>
                Enter your identity details to establish your Health Wallet profile.
              </p>
            </div>

            {/* Full Name */}
            <div className="hw-form-group" style={{ marginBottom: '16px' }}>
              <label className="hw-label hw-label-required" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Full Legal Name *
              </label>
              <input
                type="text"
                name="fullName"
                className={`hw-input ${errors.fullName ? 'has-error' : ''}`}
                value={formData.fullName}
                onChange={handleChange}
                onBlur={() => handleBlur('fullName')}
                placeholder="e.g. Vijay Rajan"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: errors.fullName ? '1px solid var(--hw-danger)' : '1px solid #cbd5e1' }}
              />
              {errors.fullName && (
                <div style={{ fontSize: '11px', color: 'var(--hw-danger)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircleIcon size={12} />
                  <span>{errors.fullName}</span>
                </div>
              )}
            </div>

            {/* Date of Birth & Gender */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div className="hw-form-group">
                <label className="hw-label hw-label-required" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  className={`hw-input ${errors.dateOfBirth ? 'has-error' : ''}`}
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  onBlur={() => handleBlur('dateOfBirth')}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: errors.dateOfBirth ? '1px solid var(--hw-danger)' : '1px solid #cbd5e1' }}
                />
                {errors.dateOfBirth && (
                  <div style={{ fontSize: '11px', color: 'var(--hw-danger)', marginTop: '4px' }}>
                    {errors.dateOfBirth}
                  </div>
                )}
              </div>

              <div className="hw-form-group">
                <label className="hw-label hw-label-required" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Gender *
                </label>
                <select
                  name="gender"
                  className="hw-select"
                  value={formData.gender}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff' }}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other / Non-Binary</option>
                </select>
              </div>
            </div>

            {/* Aadhaar Number (12 digits, digits only, prototype reference) */}
            <div className="hw-form-group" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="hw-label hw-label-required" style={{ fontSize: '13px', fontWeight: 600, margin: 0 }}>
                  Aadhaar Number *
                </label>
                <span style={{ fontSize: '11px', color: 'var(--hw-text-muted)' }}>
                  12 digits ({formData.aadhaarNumber.length}/12)
                </span>
              </div>
              <input
                type="text"
                name="aadhaarNumber"
                maxLength={12}
                className={`hw-input ${errors.aadhaarNumber ? 'has-error' : ''}`}
                value={formData.aadhaarNumber}
                onChange={handleChange}
                onBlur={() => handleBlur('aadhaarNumber')}
                placeholder="12-digit Aadhaar number"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: errors.aadhaarNumber ? '1px solid var(--hw-danger)' : '1px solid #cbd5e1',
                  letterSpacing: '0.08em',
                  fontFamily: 'var(--hw-font-mono, monospace)'
                }}
              />
              <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', marginTop: '4px' }}>
                Stored as an identity attribute for this prototype. Not an official UIDAI verification.
              </div>
              {errors.aadhaarNumber && (
                <div style={{ fontSize: '11px', color: 'var(--hw-danger)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircleIcon size={12} />
                  <span>{errors.aadhaarNumber}</span>
                </div>
              )}
            </div>

            {/* Mobile & Email */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div className="hw-form-group">
                <label className="hw-label hw-label-required" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Mobile Number *
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '10px', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>+91</span>
                  <input
                    type="tel"
                    name="mobileNumber"
                    maxLength={10}
                    className={`hw-input ${errors.mobileNumber ? 'has-error' : ''}`}
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    onBlur={() => handleBlur('mobileNumber')}
                    placeholder="9876543210"
                    style={{ width: '100%', padding: '10px 12px 10px 42px', borderRadius: '8px', border: errors.mobileNumber ? '1px solid var(--hw-danger)' : '1px solid #cbd5e1' }}
                  />
                </div>
                {errors.mobileNumber && (
                  <div style={{ fontSize: '11px', color: 'var(--hw-danger)', marginTop: '4px' }}>
                    {errors.mobileNumber}
                  </div>
                )}
              </div>

              <div className="hw-form-group">
                <label className="hw-label hw-label-required" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  className={`hw-input ${errors.email ? 'has-error' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  placeholder="name@example.com"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: errors.email ? '1px solid var(--hw-danger)' : '1px solid #cbd5e1' }}
                />
                {errors.email && (
                  <div style={{ fontSize: '11px', color: 'var(--hw-danger)', marginTop: '4px' }}>
                    {errors.email}
                  </div>
                )}
              </div>
            </div>

            {/* State & District */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '14px', marginBottom: '16px' }}>
              <div className="hw-form-group">
                <label className="hw-label hw-label-required" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  State *
                </label>
                <select
                  name="state"
                  className="hw-select"
                  value={formData.state}
                  onChange={handleChange}
                  onBlur={() => handleBlur('state')}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: errors.state ? '1px solid var(--hw-danger)' : '1px solid #cbd5e1', background: '#ffffff' }}
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
                {errors.state && (
                  <div style={{ fontSize: '11px', color: 'var(--hw-danger)', marginTop: '4px' }}>
                    {errors.state}
                  </div>
                )}
              </div>

              <div className="hw-form-group">
                <label className="hw-label hw-label-required" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  District *
                </label>
                <input
                  type="text"
                  name="district"
                  className={`hw-input ${errors.district ? 'has-error' : ''}`}
                  value={formData.district}
                  onChange={handleChange}
                  onBlur={() => handleBlur('district')}
                  placeholder="e.g. Chennai, Coimbatore"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: errors.district ? '1px solid var(--hw-danger)' : '1px solid #cbd5e1' }}
                />
                {errors.district && (
                  <div style={{ fontSize: '11px', color: 'var(--hw-danger)', marginTop: '4px' }}>
                    {errors.district}
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="hw-form-group" style={{ marginBottom: '10px' }}>
              <label className="hw-label hw-label-required" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Residential Address *
              </label>
              <textarea
                name="address"
                rows={2}
                className={`hw-input ${errors.address ? 'has-error' : ''}`}
                value={formData.address}
                onChange={handleChange}
                onBlur={() => handleBlur('address')}
                placeholder="Door/Flat No, Street, Area, Pincode"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: errors.address ? '1px solid var(--hw-danger)' : '1px solid #cbd5e1', resize: 'vertical' }}
              />
              {errors.address && (
                <div style={{ fontSize: '11px', color: 'var(--hw-danger)', marginTop: '4px' }}>
                  {errors.address}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Health & Emergency Information */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 4px 0' }}>
                Step 2: Health & Emergency Information
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0 }}>
                Essential clinical and primary contact data accessible during emergency response.
              </p>
            </div>

            {/* Blood Group */}
            <div className="hw-form-group" style={{ marginBottom: '18px' }}>
              <label className="hw-label hw-label-required" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                Blood Group *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {BLOOD_GROUPS.map((bg) => {
                  const isSelected = formData.bloodGroup === bg;
                  return (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, bloodGroup: bg }))}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid var(--hw-primary, #1e56a0)' : '1px solid #cbd5e1',
                        backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                        color: isSelected ? 'var(--hw-primary, #1e56a0)' : 'var(--hw-text-main)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {bg}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Known Allergies */}
            <div className="hw-form-group" style={{ marginBottom: '16px' }}>
              <label className="hw-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Known Allergies (Medications / Food / Environmental)
              </label>
              <input
                type="text"
                name="allergies"
                className="hw-input"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="e.g. Penicillin, Sulfa drugs, Peanuts (comma separated)"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--hw-text-muted)', marginTop: '4px', display: 'block' }}>
                Leave blank if you have no known allergies.
              </span>
            </div>

            {/* Critical Medical Conditions */}
            <div className="hw-form-group" style={{ marginBottom: '22px' }}>
              <label className="hw-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Critical Medical Conditions
              </label>
              <input
                type="text"
                name="criticalConditions"
                className="hw-input"
                value={formData.criticalConditions}
                onChange={handleChange}
                placeholder="e.g. Asthma, Type 2 Diabetes, Hypertension, Cardiac condition"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--hw-text-muted)', marginTop: '4px', display: 'block' }}>
                Critical conditions are highlighted in emergency situations for first responders.
              </span>
            </div>

            {/* Primary Emergency Contact Header */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--hw-text-main)', marginBottom: '12px' }}>
                Primary Emergency Contact
              </div>

              {/* Emergency Contact Name */}
              <div className="hw-form-group" style={{ marginBottom: '14px' }}>
                <label className="hw-label hw-label-required" style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Contact Person Full Name *
                </label>
                <input
                  type="text"
                  name="emergencyContactName"
                  className={`hw-input ${errors.emergencyContactName ? 'has-error' : ''}`}
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('emergencyContactName')}
                  placeholder="e.g. Rajendran R"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: errors.emergencyContactName ? '1px solid var(--hw-danger)' : '1px solid #cbd5e1' }}
                />
                {errors.emergencyContactName && (
                  <div style={{ fontSize: '11px', color: 'var(--hw-danger)', marginTop: '4px' }}>
                    {errors.emergencyContactName}
                  </div>
                )}
              </div>

              {/* Mobile & Relationship */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
                <div className="hw-form-group">
                  <label className="hw-label hw-label-required" style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    Mobile Number *
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '10px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>+91</span>
                    <input
                      type="tel"
                      name="emergencyContactMobile"
                      maxLength={10}
                      className={`hw-input ${errors.emergencyContactMobile ? 'has-error' : ''}`}
                      value={formData.emergencyContactMobile}
                      onChange={handleChange}
                      onBlur={() => handleBlur('emergencyContactMobile')}
                      placeholder="9840123456"
                      style={{ width: '100%', padding: '9px 12px 9px 40px', borderRadius: '8px', border: errors.emergencyContactMobile ? '1px solid var(--hw-danger)' : '1px solid #cbd5e1' }}
                    />
                  </div>
                  {errors.emergencyContactMobile && (
                    <div style={{ fontSize: '11px', color: 'var(--hw-danger)', marginTop: '4px' }}>
                      {errors.emergencyContactMobile}
                    </div>
                  )}
                </div>

                <div className="hw-form-group">
                  <label className="hw-label hw-label-required" style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    Relationship *
                  </label>
                  <select
                    name="emergencyContactRelationship"
                    className="hw-select"
                    value={formData.emergencyContactRelationship}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff' }}
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Child">Child</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Friend">Friend</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Account Security & Consents */}
        {step === 3 && (
          <div>
            <div style={{ marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 4px 0' }}>
                Step 3: Account Security & Consents
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0 }}>
                Set up your password and confirm mandatory public health data consents.
              </p>
            </div>

            {/* Password */}
            <div className="hw-form-group" style={{ marginBottom: '16px' }}>
              <label className="hw-label hw-label-required" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Account Password *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`hw-input ${errors.password ? 'has-error' : ''}`}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  placeholder="Enter at least 6 characters"
                  style={{ width: '100%', padding: '10px 40px 10px 12px', borderRadius: '8px', border: errors.password ? '1px solid var(--hw-danger)' : '1px solid #cbd5e1' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon size={16} />
                </button>
              </div>
              {errors.password && (
                <div style={{ fontSize: '11px', color: 'var(--hw-danger)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircleIcon size={12} />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="hw-form-group" style={{ marginBottom: '22px' }}>
              <label className="hw-label hw-label-required" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Confirm Password *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className={`hw-input ${errors.confirmPassword ? 'has-error' : ''}`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={() => handleBlur('confirmPassword')}
                  placeholder="Re-enter your password"
                  style={{ width: '100%', padding: '10px 40px 10px 12px', borderRadius: '8px', border: errors.confirmPassword ? '1px solid var(--hw-danger)' : '1px solid #cbd5e1' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon size={16} />
                </button>
              </div>
              {errors.confirmPassword && (
                <div style={{ fontSize: '11px', color: 'var(--hw-danger)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircleIcon size={12} />
                  <span>{errors.confirmPassword}</span>
                </div>
              )}
            </div>

            {/* Mandatory Consents */}
            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #cbd5e1', marginBottom: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--hw-text-muted)', marginBottom: '12px', letterSpacing: '0.04em' }}>
                Mandatory Declarations & Consents
              </div>

              {/* Consent 1: Terms & Conditions */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', marginBottom: '14px', fontSize: '13px', color: 'var(--hw-text-main)', lineHeight: '1.5' }}>
                <input
                  type="checkbox"
                  name="consentTerms"
                  checked={formData.consentTerms}
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--hw-primary)', marginTop: '2px', flexShrink: 0, cursor: 'pointer' }}
                />
                <span>
                  <strong>Terms & Conditions *:</strong> I agree to the Health Wallet Terms of Service, citizen data protection protocols, and user account responsibilities.
                </span>
              </label>
              {errors.consentTerms && (
                <div style={{ fontSize: '11px', color: 'var(--hw-danger)', marginBottom: '10px', marginLeft: '28px' }}>
                  {errors.consentTerms}
                </div>
              )}

              {/* Consent 2: Privacy & Data Processing */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '13px', color: 'var(--hw-text-main)', lineHeight: '1.5' }}>
                <input
                  type="checkbox"
                  name="consentPrivacy"
                  checked={formData.consentPrivacy}
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--hw-primary)', marginTop: '2px', flexShrink: 0, cursor: 'pointer' }}
                />
                <span>
                  <strong>Privacy & Data Processing Consent *:</strong> I consent to the secure collection, local storage, and cryptographic processing of my health, identity, and emergency data within Health Wallet in accordance with data privacy frameworks.
                </span>
              </label>
              {errors.consentPrivacy && (
                <div style={{ fontSize: '11px', color: 'var(--hw-danger)', marginTop: '4px', marginLeft: '28px' }}>
                  {errors.consentPrivacy}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: Review & Create Health Wallet */}
        {step === 4 && (
          <div>
            <div style={{ marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 4px 0' }}>
                Step 4: Review & Create Health Wallet
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0 }}>
                Please review your profile details before establishing your Health Wallet.
              </p>
            </div>

            {/* Review Cards Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              
              {/* Card 1: Personal Identity */}
              <div style={{ padding: '14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: 'var(--hw-primary)' }}>
                    <UserIcon size={16} />
                    <span>Personal Information</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    style={{ background: 'none', border: 'none', color: 'var(--hw-primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Edit
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: 'var(--hw-text-muted)' }}>Full Name:</span>
                    <div style={{ fontWeight: 600, color: 'var(--hw-text-main)', marginTop: '2px' }}>{formData.fullName}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--hw-text-muted)' }}>Date of Birth & Gender:</span>
                    <div style={{ color: 'var(--hw-text-main)', marginTop: '2px' }}>{formData.dateOfBirth} ({formData.gender})</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--hw-text-muted)' }}>Aadhaar Reference:</span>
                    <div style={{ fontFamily: 'var(--hw-font-mono)', fontWeight: 600, color: 'var(--hw-text-main)', marginTop: '2px' }}>
                      {maskAadhaar(formData.aadhaarNumber)}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--hw-text-muted)' }}>Mobile Number:</span>
                    <div style={{ color: 'var(--hw-text-main)', marginTop: '2px' }}>+91 {formData.mobileNumber}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--hw-text-muted)' }}>Email:</span>
                    <div style={{ color: 'var(--hw-text-main)', marginTop: '2px' }}>{formData.email}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--hw-text-muted)' }}>Location:</span>
                    <div style={{ color: 'var(--hw-text-main)', marginTop: '2px' }}>{formData.district}, {formData.state}</div>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: 'var(--hw-text-muted)' }}>Address:</span>
                    <div style={{ color: 'var(--hw-text-main)', marginTop: '2px' }}>{formData.address}</div>
                  </div>
                </div>
              </div>

              {/* Card 2: Health & Emergency Contact */}
              <div style={{ padding: '14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: 'var(--hw-primary)' }}>
                    <DropletIcon size={16} color="var(--hw-danger)" />
                    <span>Health & Emergency Information</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    style={{ background: 'none', border: 'none', color: 'var(--hw-primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Edit
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: 'var(--hw-text-muted)' }}>Blood Group:</span>
                    <div style={{ fontWeight: 700, color: 'var(--hw-danger)', marginTop: '2px' }}>{formData.bloodGroup}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--hw-text-muted)' }}>Emergency Contact:</span>
                    <div style={{ fontWeight: 600, color: 'var(--hw-text-main)', marginTop: '2px' }}>
                      {formData.emergencyContactName} ({formData.emergencyContactRelationship})
                    </div>
                    <div style={{ color: 'var(--hw-text-muted)' }}>+91 {formData.emergencyContactMobile}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--hw-text-muted)' }}>Known Allergies:</span>
                    <div style={{ color: 'var(--hw-text-main)', marginTop: '2px' }}>
                      {formData.allergies ? formData.allergies : 'None recorded'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--hw-text-muted)' }}>Critical Conditions:</span>
                    <div style={{ color: 'var(--hw-text-main)', marginTop: '2px' }}>
                      {formData.criticalConditions ? formData.criticalConditions : 'None recorded'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Security & Consent Confirmation */}
              <div style={{ padding: '14px', borderRadius: '10px', background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#047857', marginBottom: '6px' }}>
                  <ShieldCheckIcon size={16} />
                  <span>Security & Consents Confirmed</span>
                </div>
                <div style={{ fontSize: '12px', color: '#065f46', lineHeight: '1.5' }}>
                  ✓ Terms of Service and Citizen Responsibilities accepted<br />
                  ✓ Public health data privacy and cryptographic processing consent granted
                </div>
              </div>

              {/* Statutory Identity Reference Notice */}
              <div style={{ padding: '12px', borderRadius: '8px', background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: '12px', color: '#1e40af' }}>
                <strong>Identity Reference Notice:</strong> Your identity attributes are securely bound to your new Health Wallet profile. No claim of official government UIDAI Aadhaar authentication is made.
              </div>
            </div>
          </div>
        )}

        {/* Navigation & Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #e2e8f0' }}>
          {step > 1 ? (
            <button
              type="button"
              className="hw-btn hw-btn-secondary"
              onClick={handleBack}
            >
              <ArrowLeftIcon size={16} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              className="hw-btn hw-btn-primary"
              onClick={handleNext}
            >
              <span>Continue</span>
              <ArrowRightIcon size={16} />
            </button>
          ) : (
            <button
              type="button"
              className="hw-btn hw-btn-primary"
              onClick={handleFinalSubmit}
              style={{ padding: '10px 24px', fontWeight: 700 }}
            >
              <ShieldCheckIcon size={18} />
              <span>Create Health Wallet</span>
            </button>
          )}
        </div>
      </div>

      {/* Successful Registration Modal (Requirement 7) */}
      {showSuccessModal && createdUser && (
        <Modal
          isOpen={true}
          onClose={handleEnterDashboard}
          title="Health Wallet Created Successfully"
          maxWidth="500px"
          footer={
            <button
              type="button"
              className="hw-btn hw-btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
              onClick={handleEnterDashboard}
            >
              Enter Health Wallet Dashboard
            </button>
          }
        >
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#ecfdf5',
                color: '#059669',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px'
              }}
            >
              <CheckCircleIcon size={32} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 6px 0' }}>
              Welcome, {createdUser.fullName}!
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: '0 0 20px 0' }}>
              Your unified citizen Health Wallet identity is active and established.
            </p>

            {/* Generated Health Wallet ID Card */}
            <div
              style={{
                background: '#eff6ff',
                border: '1.5px solid #bfdbfe',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--hw-primary)', letterSpacing: '0.05em' }}>
                  Assigned Health Wallet ID
                </span>
                <button
                  type="button"
                  onClick={handleCopyCreatedId}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: copiedId ? '#059669' : 'var(--hw-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {copiedId ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
                  <span>{copiedId ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: 'var(--hw-text-main)',
                  fontFamily: 'var(--hw-font-mono, monospace)',
                  letterSpacing: '0.04em'
                }}
              >
                {createdUser.healthWalletId}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', marginTop: '4px' }}>
                This single ID uniquely identifies your profile, offline wallet, and emergency records.
              </div>
            </div>

            {/* Summary details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', textAlign: 'left', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
              <div>
                <span style={{ color: 'var(--hw-text-muted)' }}>Aadhaar (Masked):</span>
                <div style={{ fontWeight: 600, color: 'var(--hw-text-main)' }}>{maskAadhaar(createdUser.aadhaarNumber)}</div>
              </div>
              <div>
                <span style={{ color: 'var(--hw-text-muted)' }}>Blood Group:</span>
                <div style={{ fontWeight: 700, color: 'var(--hw-danger)' }}>{createdUser.bloodGroup}</div>
              </div>
              <div>
                <span style={{ color: 'var(--hw-text-muted)' }}>Mobile Number:</span>
                <div style={{ color: 'var(--hw-text-main)' }}>{createdUser.phone}</div>
              </div>
              <div>
                <span style={{ color: 'var(--hw-text-muted)' }}>Primary Contact:</span>
                <div style={{ color: 'var(--hw-text-main)' }}>{createdUser.emergencyContact?.name}</div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
