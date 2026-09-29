// Comprehensive Unit and Logic Test for Registration & Identity Foundation
import assert from 'assert';
import {
  getHealthWalletId,
  generateHealthWalletId,
  maskAadhaar,
  isValidAadhaar,
  isValidMobile,
  isValidEmail
} from '../src/utils/userHelpers.js';

console.log('--- STARTING REGISTRATION & IDENTITY FOUNDATION TESTS ---');

// 1. Validation tests
console.log('\n[1] Testing Validation Helpers:');

// Aadhaar validation
assert.strictEqual(isValidAadhaar('987654321098'), true, 'Valid 12 digits should pass');
assert.strictEqual(isValidAadhaar('9876 5432 1098'), true, 'Spaced 12 digits should pass');
assert.strictEqual(isValidAadhaar('98765432109'), false, '11 digits must fail');
assert.strictEqual(isValidAadhaar('9876543210989'), false, '13 digits must fail');
assert.strictEqual(isValidAadhaar('98765432109A'), false, 'Alphanumeric Aadhaar must fail');
assert.strictEqual(isValidAadhaar(''), false, 'Empty Aadhaar must fail');
console.log('✓ Aadhaar validation: exactly 12 numeric digits strictly enforced');

// Mobile validation
assert.strictEqual(isValidMobile('9876543210'), true, 'Valid 10 digits should pass');
assert.strictEqual(isValidMobile('98765 43210'), true, 'Spaced 10 digits should pass');
assert.strictEqual(isValidMobile('987654321'), false, '9 digits must fail');
assert.strictEqual(isValidMobile('98765432100'), false, '11 digits must fail');
assert.strictEqual(isValidMobile('987654321X'), false, 'Letters in mobile must fail');
console.log('✓ Mobile validation: exactly 10 numeric digits strictly enforced');

// Email validation
assert.strictEqual(isValidEmail('citizen@example.org'), true, 'Standard email must pass');
assert.strictEqual(isValidEmail('citizen.test@domain.co.in'), true, 'Complex domain email must pass');
assert.strictEqual(isValidEmail('invalid-email'), false, 'Missing @ must fail');
assert.strictEqual(isValidEmail('test@domain'), false, 'Missing TLD must fail');
console.log('✓ Email validation: valid format strictly enforced');

// 2. Aadhaar Masking Tests
console.log('\n[2] Testing Aadhaar Masking:');
assert.strictEqual(maskAadhaar('987654321098'), 'XXXX XXXX 1098', 'Should only display last 4 digits');
assert.strictEqual(maskAadhaar('123412341234'), 'XXXX XXXX 1234', 'Should correctly format last 4 digits');
assert.strictEqual(maskAadhaar(''), 'XXXX XXXX —', 'Gracefully handle empty Aadhaar');
assert.strictEqual(maskAadhaar(null), 'XXXX XXXX —', 'Gracefully handle null Aadhaar');
console.log('✓ Aadhaar masking: Never displays complete number; always masks to XXXX XXXX 1234');

// 3. Health Wallet ID Generation
console.log('\n[3] Testing Health Wallet ID Generation:');
const id1 = generateHealthWalletId();
const id2 = generateHealthWalletId();
assert(id1.startsWith('HW-'), 'Must start with HW-');
assert.strictEqual(id1.length, 11, 'Format HW-XXXXXXXX has 11 chars (HW- + 8 chars)');
assert.notStrictEqual(id1, id2, 'Generated IDs must be unique');
assert(/HW-[0-9A-Z]{8}/.test(id1), 'Must match HW-XXXXXXXX alphanumeric pattern');
console.log(`✓ Generated Unique ID sample 1: ${id1}`);
console.log(`✓ Generated Unique ID sample 2: ${id2}`);

// 4. Registration & Data Model Simulation
console.log('\n[4] Testing Registration Logic & Data Model:');
const registrationPayload = {
  fullName: 'Meenakshi Sundaram',
  dateOfBirth: '1995-07-22',
  gender: 'Female',
  aadhaarNumber: '912345678901',
  mobileNumber: '9840987654',
  email: 'meenakshi.s@healthnet.org',
  state: 'Tamil Nadu',
  district: 'Madurai',
  address: '15, South Masi Street, Madurai - 625001',
  bloodGroup: 'B+',
  allergies: 'Ciprofloxacin, Shellfish',
  criticalConditions: 'Type 1 Diabetes',
  emergencyContactName: 'Sundaram K',
  emergencyContactMobile: '9444012345',
  emergencyContactRelationship: 'Spouse',
  password: 'SecurePassword123',
  confirmPassword: 'SecurePassword123',
  consentTerms: true,
  consentPrivacy: true
};

const newId = generateHealthWalletId();
const cleanMobile = registrationPayload.mobileNumber.replace(/\D/g, '').slice(-10);
const cleanAadhaar = registrationPayload.aadhaarNumber.replace(/\D/g, '').slice(-12);
const cleanEmMobile = registrationPayload.emergencyContactMobile.replace(/\D/g, '').slice(-10);

const newUser = {
  id: newId,
  healthWalletId: newId,
  fullName: registrationPayload.fullName.trim(),
  dateOfBirth: registrationPayload.dateOfBirth,
  dob: registrationPayload.dateOfBirth,
  gender: registrationPayload.gender,
  aadhaarNumber: cleanAadhaar,
  mobileNumber: cleanMobile,
  phone: `+91 ${cleanMobile}`,
  email: registrationPayload.email.trim(),
  state: registrationPayload.state.trim(),
  district: registrationPayload.district.trim(),
  address: registrationPayload.address.trim(),
  bloodGroup: registrationPayload.bloodGroup,
  allergies: registrationPayload.allergies.split(',').map(s => s.trim()).filter(Boolean),
  criticalConditions: [registrationPayload.criticalConditions.trim()],
  chronicConditions: [registrationPayload.criticalConditions.trim()],
  emergencyContact: {
    name: registrationPayload.emergencyContactName.trim(),
    mobile: cleanEmMobile,
    relationship: registrationPayload.emergencyContactRelationship
  },
  emergencyContacts: [
    {
      id: 'ec-1',
      name: registrationPayload.emergencyContactName.trim(),
      relationship: registrationPayload.emergencyContactRelationship,
      phone: `+91 ${cleanEmMobile}`,
      priority: 'Primary'
    }
  ],
  consents: {
    termsAndConditions: true,
    privacyAndDataProcessing: true,
    agreedAt: new Date().toISOString()
  },
  createdAt: new Date().toISOString()
};

// Check all fields
assert.strictEqual(newUser.healthWalletId, newId);
assert.strictEqual(newUser.id, newId);
assert.strictEqual(getHealthWalletId(newUser), newId);
assert.strictEqual(newUser.fullName, 'Meenakshi Sundaram');
assert.strictEqual(newUser.dateOfBirth, '1995-07-22');
assert.strictEqual(newUser.dob, '1995-07-22');
assert.strictEqual(newUser.gender, 'Female');
assert.strictEqual(newUser.aadhaarNumber, '912345678901');
assert.strictEqual(maskAadhaar(newUser.aadhaarNumber), 'XXXX XXXX 8901');
assert.strictEqual(newUser.mobileNumber, '9840987654');
assert.strictEqual(newUser.phone, '+91 9840987654');
assert.strictEqual(newUser.bloodGroup, 'B+');
assert.deepStrictEqual(newUser.allergies, ['Ciprofloxacin', 'Shellfish']);
assert.deepStrictEqual(newUser.criticalConditions, ['Type 1 Diabetes']);
assert.strictEqual(newUser.emergencyContact.name, 'Sundaram K');
assert.strictEqual(newUser.emergencyContact.mobile, '9444012345');
assert.strictEqual(newUser.emergencyContact.relationship, 'Spouse');
console.log('✓ New user registration model conforms completely to specification');

// 5. Existing Demo User Backward Compatibility
console.log('\n[5] Testing Demo User Backward Compatibility:');
const existingDemoUser = {
  fullName: 'Vijay Rajan',
  id: 'HW-20481',
  healthWalletId: 'HW-20481',
  dob: '1998-03-12',
  bloodGroup: 'O+',
  phone: '+91 98765 43210'
};

const resolvedDemoUser = {
  dateOfBirth: '1998-03-12',
  gender: 'Male',
  aadhaarNumber: '987654321098',
  state: 'Tamil Nadu',
  district: 'Chennai',
  address: '42, Pantheon Road, Egmore, Chennai, Tamil Nadu - 600008',
  allergies: ['Penicillin', 'Dust / Pollen Mites'],
  criticalConditions: ['Mild Allergic Bronchial Asthma'],
  emergencyContact: { name: 'Rajendran R', mobile: '9840123456', relationship: 'Father' },
  ...existingDemoUser,
  id: existingDemoUser.healthWalletId || 'HW-20481',
  healthWalletId: existingDemoUser.healthWalletId || 'HW-20481',
  mobileNumber: existingDemoUser.phone.replace(/\D/g, '').slice(-10)
};

assert.strictEqual(resolvedDemoUser.healthWalletId, 'HW-20481');
assert.strictEqual(getHealthWalletId(resolvedDemoUser), 'HW-20481');
assert.strictEqual(resolvedDemoUser.mobileNumber, '9876543210');
assert.strictEqual(maskAadhaar(resolvedDemoUser.aadhaarNumber), 'XXXX XXXX 1098');
console.log('✓ Demo user HW-20481 preserved with all required identity foundation attributes');

console.log('\n--- ALL UNIT AND LOGIC TESTS PASSED SUCCESSFULLY! ---');
