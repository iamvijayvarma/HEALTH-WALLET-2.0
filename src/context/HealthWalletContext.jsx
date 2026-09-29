import React, { createContext, useContext, useState, useEffect } from 'react';
import { getHealthWalletId, generateHealthWalletId, maskAadhaar } from '../utils/userHelpers';
import { matchCompatibleDonors } from '../utils/bloodCompatibility';

const HealthWalletContext = createContext(null);

const STORAGE_KEY = 'health_wallet_v2_data';

// Default initial state representing a real, credible healthcare profile
const INITIAL_STATE = {
  isAuthenticated: true,
  currentRoute: 'dashboard',
  language: 'en', // 'en' | 'ta' | 'hi' | 'te'
  isOfflineSimulated: false,
  lastSynced: '22 Sep 2026, 10:45 AM',
  searchQuery: '',

  user: {
    fullName: 'Vijay Rajan',
    id: 'HW-20481',
    healthWalletId: 'HW-20481',
    abhaNumber: '91-8402-1928-3841',
    dob: '1998-03-12',
    dateOfBirth: '1998-03-12',
    gender: 'Male',
    aadhaarNumber: '987654321098',
    bloodGroup: 'O+',
    phone: '+91 98765 43210',
    mobileNumber: '9876543210',
    email: 'vijay.rajan@gov-health.org',
    state: 'Tamil Nadu',
    district: 'Chennai',
    address: '42, Pantheon Road, Egmore, Chennai, Tamil Nadu - 600008',
    allergies: ['Penicillin', 'Dust / Pollen Mites'],
    criticalConditions: ['Mild Allergic Bronchial Asthma'],
    chronicConditions: ['Mild Allergic Bronchial Asthma'],
    emergencyContact: {
      name: 'Rajendran R',
      mobile: '9840123456',
      relationship: 'Father'
    },
    emergencyContacts: [
      { id: 'ec-1', name: 'Rajendran R', relationship: 'Father', phone: '+91 98401 23456', priority: 'Primary' },
      { id: 'ec-2', name: 'Dr. Meenakshi S', relationship: 'Family Physician', phone: '+91 94440 98765', priority: 'Medical Consultant' }
    ],
    createdAt: '2026-01-15T08:00:00.000Z'
  },

  familyMembers: [
    {
      id: 'fam-1',
      name: 'Rajendran R',
      relationship: 'Father',
      mobileNumber: '9840123456',
      otpStatus: 'verified',
      consentStatus: 'granted',
      permissions: {
        health_records: true,
        medicines: true,
        emergency: false
      },
      linkedAt: '15 Jan 2026',
      consentUpdatedAt: '15 Jan 2026',
      createdAt: '2026-01-15T09:00:00.000Z',
      avatarColor: '#1e3a8a'
    },
    {
      id: 'fam-2',
      name: 'Lakshmi R',
      relationship: 'Mother',
      mobileNumber: '9840198765',
      otpStatus: 'verified',
      consentStatus: 'pending',
      permissions: {
        health_records: true,
        medicines: false,
        emergency: true
      },
      linkedAt: null,
      consentUpdatedAt: '28 Sep 2026',
      createdAt: '2026-09-28T14:30:00.000Z',
      avatarColor: '#0d9488'
    },
    {
      id: 'fam-3',
      name: 'Priya R',
      relationship: 'Sister',
      mobileNumber: '9840154321',
      otpStatus: 'verified',
      consentStatus: 'granted',
      permissions: {
        health_records: true,
        medicines: true,
        emergency: true
      },
      linkedAt: '10 Feb 2026',
      consentUpdatedAt: '10 Feb 2026',
      createdAt: '2026-02-10T11:15:00.000Z',
      avatarColor: '#7c3aed'
    }
  ],

  familyAuditLogs: [
    {
      id: 'faudit-1',
      timestamp: '15 Jan 2026, 09:30 AM',
      familyMemberId: 'fam-1',
      familyMemberName: 'Rajendran R',
      eventType: 'Consent Granted',
      details: 'Permissions: Health Records, Medicines'
    },
    {
      id: 'faudit-2',
      timestamp: '10 Feb 2026, 11:25 AM',
      familyMemberId: 'fam-3',
      familyMemberName: 'Priya R',
      eventType: 'Consent Granted',
      details: 'Permissions: Health Records, Medicines, Emergency Information'
    },
    {
      id: 'faudit-3',
      timestamp: '28 Sep 2026, 02:40 PM',
      familyMemberId: 'fam-2',
      familyMemberName: 'Lakshmi R',
      eventType: 'Consent Requested',
      details: 'Permissions Requested: Health Records, Emergency Information'
    }
  ],

  healthRecords: [
    {
      id: 'rec-1',
      title: 'Complete Blood Count (CBC) Profile',
      category: 'Lab Reports',
      hospital: 'Apollo Hospitals, Greams Road',
      doctor: 'Dr. A. Sundaram, MD (Path)',
      date: '18 Sep 2026',
      status: 'Normal',
      tags: ['Hematology', 'Routine'],
      summary: 'Hemoglobin: 14.2 g/dL, Total RBC: 4.8 mil/uL, Platelets: 240,000 /uL. All markers within reference limits.',
      verified: true
    },
    {
      id: 'rec-2',
      title: 'Chest Radiograph (PA View)',
      category: 'Imaging',
      hospital: 'Government General Hospital, Chennai',
      doctor: 'Dr. K. Narayanan, DMRD',
      date: '02 Aug 2026',
      status: 'Clear',
      tags: ['Radiology', 'X-Ray'],
      summary: 'Normal bronchovascular markings. No focal consolidation, pneumothorax, or pleural effusion noted.',
      verified: true
    },
    {
      id: 'rec-3',
      title: 'Fasting Blood Sugar & HbA1c Screen',
      category: 'Lab Reports',
      hospital: 'Kauvery Hospital, Alwarpet',
      doctor: 'Dr. Shalini V, MD (Biochem)',
      date: '14 May 2026',
      status: 'Normal',
      tags: ['Diabetic Screen', 'Metabolic'],
      summary: 'Fasting Plasma Glucose: 92 mg/dL. HbA1c: 5.4% (Non-diabetic range).',
      verified: true
    },
    {
      id: 'rec-4',
      title: 'Pulmonology Outpatient Prescription',
      category: 'Prescriptions',
      hospital: 'Apollo Clinic, Anna Nagar',
      doctor: 'Dr. V. Rajesh, MD (Chest Med)',
      date: '20 Apr 2026',
      status: 'Active',
      tags: ['Pulmonology', 'Maintenance'],
      summary: 'Asthalin 100mcg Inhaler SOS, Montelukast 10mg OD bedtime for 30 days during allergic weather shifts.',
      verified: true
    },
    {
      id: 'rec-5',
      title: 'Annual Preventive Cardiology Consultation',
      category: 'Consultations',
      hospital: 'MIOT International',
      doctor: 'Dr. P. Sivakumar, DM (Cardio)',
      date: '10 Jan 2026',
      status: 'Reviewed',
      tags: ['Preventive', 'Cardiology'],
      summary: '12-lead ECG normal sinus rhythm, 72 bpm. Blood Pressure 118/76 mmHg. Recommended regular aerobic exercise.',
      verified: true
    }
  ],

  medicalReports: [],

  medicines: [
    {
      id: 'med-1',
      name: 'Metformin',
      dosage: '500 mg',
      frequency: 'Twice Daily',
      startDate: '28 Sep 2026',
      endDate: '28 Oct 2026',
      prescribedBy: 'Dr. Kumar',
      notes: 'Take with morning and evening meals',
      status: 'Active',
      createdAt: '2026-09-28T08:00:00.000Z',
      takenToday: true
    },
    {
      id: 'med-2',
      name: 'Montelukast Sodium',
      dosage: '10 mg',
      frequency: 'Once Daily',
      startDate: '20 Apr 2026',
      endDate: '20 Oct 2026',
      prescribedBy: 'Dr. V. Rajesh',
      notes: 'Take daily at bedtime for allergic asthma maintenance',
      status: 'Active',
      createdAt: '2026-04-20T10:00:00.000Z',
      takenToday: true
    },
    {
      id: 'med-3',
      name: 'Asthalin (Salbutamol) Inhaler',
      dosage: '100 mcg (2 Puffs)',
      frequency: 'As Needed',
      startDate: '15 Jan 2026',
      endDate: '15 Dec 2026',
      prescribedBy: 'Dr. V. Rajesh',
      notes: 'Take 2 puffs SOS for acute bronchospasm',
      status: 'Active',
      createdAt: '2026-01-15T09:30:00.000Z',
      takenToday: false
    }
  ],

  medicationLogs: {
    '2026-09-30-med-1-08:00 AM': 'Taken',
    '2026-09-30-med-2-08:00 AM': 'Taken'
  },

  medicationHistory: [
    {
      id: 'hist-1',
      medicineId: 'med-1',
      medicineName: 'Metformin',
      dosage: '500 mg',
      date: '29 Sep 2026',
      scheduledTime: '08:00 AM',
      status: 'Taken',
      timestamp: '2026-09-29T08:05:00.000Z'
    },
    {
      id: 'hist-2',
      medicineId: 'med-1',
      medicineName: 'Metformin',
      dosage: '500 mg',
      date: '29 Sep 2026',
      scheduledTime: '08:00 PM',
      status: 'Skipped',
      timestamp: '2026-09-29T20:10:00.000Z'
    },
    {
      id: 'hist-3',
      medicineId: 'med-2',
      medicineName: 'Montelukast Sodium',
      dosage: '10 mg',
      date: '29 Sep 2026',
      scheduledTime: '08:00 PM',
      status: 'Taken',
      timestamp: '2026-09-29T20:30:00.000Z'
    }
  ],

  nearbyBloodDonors: [
    {
      id: 'don-1',
      name: 'Arun Kumar M.',
      bloodGroup: 'O+',
      distance: '1.8 km away',
      lastDonated: '4 months ago',
      verified: true,
      location: 'Egmore, Chennai'
    },
    {
      id: 'don-2',
      name: 'Priya Sharma',
      bloodGroup: 'O+',
      distance: '3.2 km away',
      lastDonated: '6 months ago',
      verified: true,
      location: 'Chetpet, Chennai'
    },
    {
      id: 'don-3',
      name: 'Vignesh Raman',
      bloodGroup: 'O+',
      distance: '4.5 km away',
      lastDonated: '2 months ago',
      verified: true,
      location: 'Nungambakkam, Chennai'
    },
    {
      id: 'don-4',
      name: 'Karthik Subburaj',
      bloodGroup: 'O+',
      distance: '5.1 km away',
      lastDonated: '5 months ago',
      verified: true,
      location: 'Kilpauk, Chennai'
    }
  ],

  bloodDonors: [
    {
      id: 'demo-don-1',
      name: 'Arun Kumar',
      bloodGroup: 'O+',
      location: 'Karur',
      availability: 'Available',
      contactPreference: 'Health Wallet In-App',
      isDemo: true,
      registeredAt: '12 Aug 2026'
    },
    {
      id: 'demo-don-2',
      name: 'Priya S',
      bloodGroup: 'A+',
      location: 'Chennai',
      availability: 'Available',
      contactPreference: 'Phone Call / SMS',
      isDemo: true,
      registeredAt: '25 Jul 2026'
    },
    {
      id: 'demo-don-3',
      name: 'Vignesh R',
      bloodGroup: 'B+',
      location: 'Chennai',
      availability: 'Available',
      contactPreference: 'Health Wallet In-App',
      isDemo: true,
      registeredAt: '03 Sep 2026'
    },
    {
      id: 'demo-don-4',
      name: 'Deepa M',
      bloodGroup: 'O-',
      location: 'Coimbatore',
      availability: 'Available',
      contactPreference: 'Phone Call / SMS',
      isDemo: true,
      registeredAt: '19 Aug 2026'
    },
    {
      id: 'demo-don-5',
      name: 'Karthik Subburaj',
      bloodGroup: 'O+',
      location: 'Karur',
      availability: 'Available',
      contactPreference: 'Health Wallet In-App',
      isDemo: true,
      registeredAt: '29 Jun 2026'
    },
    {
      id: 'demo-don-6',
      name: 'Rajesh K',
      bloodGroup: 'AB+',
      location: 'Madurai',
      availability: 'Available',
      contactPreference: 'Health Wallet In-App',
      isDemo: true,
      registeredAt: '08 May 2026'
    },
    {
      id: 'demo-don-7',
      name: 'Meera N',
      bloodGroup: 'A-',
      location: 'Karur',
      availability: 'Unavailable',
      contactPreference: 'Phone Call / SMS',
      isDemo: true,
      registeredAt: '14 Jul 2026'
    }
  ],

  donorProfile: null,

  bloodRequests: [
    {
      id: 'req-demo-1',
      patientName: 'M. Ramesh',
      bloodGroupRequired: 'O+',
      unitsRequired: 2,
      location: 'Karur',
      urgency: 'Emergency',
      additionalNote: 'Emergency surgical requirement at Apollo Karur Hospital',
      status: 'Donor Requested',
      createdAt: '29 Sep 2026, 04:30 PM',
      requestedDonors: ['Arun Kumar'],
      isDemo: true
    }
  ],

  organDonation: {
    id: 'OD-2026-90412',
    status: 'Registered',
    selectedOrgans: ['Heart', 'Liver', 'Kidneys', 'Eyes / Corneas', 'Lungs'],
    consentConfirmed: true,
    consentTextVersion: 'v1.0',
    registeredAt: '15 Feb 2026, 10:30 AM',
    updatedAt: null,
    withdrawnAt: null
  },

  organDonationAuditLogs: [
    {
      id: 'od-audit-1',
      eventType: 'Donation intent registered',
      timestamp: '15 Feb 2026, 10:30 AM',
      healthWalletId: 'HW-20481',
      selectedOrgans: ['Heart', 'Liver', 'Kidneys', 'Eyes / Corneas', 'Lungs']
    }
  ],

  organPledge: {
    isRegistered: true,
    pledgeId: 'OD-2026-90412',
    registrationDate: '15 Feb 2026',
    organsSelected: ['Eyes / Corneas', 'Kidneys', 'Liver', 'Heart', 'Lungs'],
    tissueSelected: ['Skin', 'Bone'],
    nomineeName: 'Rajendran R',
    nomineeRelation: 'Father',
    nomineePhone: '+91 98401 23456',
    consentSigned: true
  },

  emergencyMode: {
    isActive: false,
    activatedAt: null,
    reason: 'Medical Emergency',
    otherReasonText: '',
    location: null,
    alertPrepared: false,
    alertPreparedAt: null
  },

  emergencyHistory: [
    {
      id: 'em-evt-1',
      eventType: 'Emergency Mode Activated',
      timestamp: '22 Sep 2026, 09:30 AM',
      healthWalletId: 'HW-20481',
      reason: 'Emergency assistance diagnostic test',
      locationAvailability: 'Location Available',
      accessType: 'Citizen Emergency Self-Activation'
    }
  ],

  emergencyState: {
    isActive: false,
    activatedAt: null,
    locationCoordinates: '13.0827° N, 80.2707° E',
    locationAddress: 'Pantheon Road, Egmore, Chennai, Tamil Nadu - 600008 (GPS Accuracy: ±3m)',
    dispatchedServices: ['108 State Ambulance Command', 'Rajendran R (Father)', 'Apollo Hospitals Emergency Room'],
    auditLogs: [
      { timestamp: '22 Sep 2026, 09:30 AM', event: 'Emergency Profile Health Check Verified', entity: 'System Health Engine' }
    ]
  },

  notifications: [
    {
      id: 'notif-1',
      title: 'Health Record Synced',
      message: 'Apollo Hospitals verified and digitally signed your Complete Blood Count report.',
      time: '18 Sep 2026',
      read: false,
      type: 'success'
    },
    {
      id: 'notif-2',
      title: 'Community Blood Drive Notice',
      message: 'Red Cross Blood Camp scheduled at Egmore Community Hall this Saturday.',
      time: '16 Sep 2026',
      read: false,
      type: 'info'
    },
    {
      id: 'notif-3',
      title: 'Medication Refill Reminder',
      message: 'Montelukast Sodium 10mg has 14 days remaining.',
      time: '12 Sep 2026',
      read: true,
      type: 'warning'
    }
  ],

  accessAuditLogs: [
    { id: 'log-1', entity: 'Apollo Hospitals - Dr. Sundaram', action: 'Uploaded CBC Report', timestamp: '18 Sep 2026, 11:20 AM', status: 'Authorized via OTP' },
    { id: 'log-2', entity: 'Government General Hospital', action: 'Accessed Radiology X-Ray Record', timestamp: '02 Aug 2026, 03:15 PM', status: 'Doctor In-Clinic Consent' },
    { id: 'log-3', entity: 'Health Wallet Emergency Engine', action: 'Synchronized Offline Cryptographic Pass', timestamp: '22 Sep 2026, 10:45 AM', status: 'Device Token Sync' }
  ]
};

export const HealthWalletProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    const hashRoute = window.location.hash ? window.location.hash.replace(/^#\/?/, '') : '';
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        let serialized = saved;
        if (serialized.includes('Kavin') || serialized.includes('kavin')) {
          serialized = serialized.replace(/Kavin/g, 'Vijay').replace(/kavin/g, 'vijay');
        }
        if (serialized.includes('HW-9021-4819')) {
          serialized = serialized.replace(/HW-9021-4819/g, 'HW-20481');
        }
        try { localStorage.setItem(STORAGE_KEY, serialized); } catch {}
        const parsed = JSON.parse(serialized);
        const resolvedUser = {
          ...INITIAL_STATE.user,
          ...parsed.user,
          id: parsed.user?.healthWalletId || (parsed.user?.id === 'HW-9021-4819' ? 'HW-20481' : (parsed.user?.id || 'HW-20481')),
          healthWalletId: parsed.user?.healthWalletId || (parsed.user?.id === 'HW-9021-4819' ? 'HW-20481' : (parsed.user?.id || 'HW-20481')),
          dateOfBirth: parsed.user?.dateOfBirth || parsed.user?.dob || INITIAL_STATE.user.dateOfBirth,
          dob: parsed.user?.dob || parsed.user?.dateOfBirth || INITIAL_STATE.user.dob,
          aadhaarNumber: parsed.user?.aadhaarNumber || INITIAL_STATE.user.aadhaarNumber,
          mobileNumber: parsed.user?.mobileNumber || parsed.user?.phone?.replace(/\D/g, '').slice(-10) || INITIAL_STATE.user.mobileNumber,
          phone: parsed.user?.phone || `+91 ${parsed.user?.mobileNumber || INITIAL_STATE.user.mobileNumber}`,
          state: parsed.user?.state || INITIAL_STATE.user.state,
          district: parsed.user?.district || INITIAL_STATE.user.district,
          address: parsed.user?.address || INITIAL_STATE.user.address,
          criticalConditions: parsed.user?.criticalConditions || parsed.user?.chronicConditions || INITIAL_STATE.user.criticalConditions,
          chronicConditions: parsed.user?.chronicConditions || parsed.user?.criticalConditions || INITIAL_STATE.user.chronicConditions,
          emergencyContact: parsed.user?.emergencyContact || {
            name: parsed.user?.emergencyContacts?.[0]?.name || INITIAL_STATE.user.emergencyContact.name,
            mobile: parsed.user?.emergencyContacts?.[0]?.phone?.replace(/\D/g, '').slice(-10) || INITIAL_STATE.user.emergencyContact.mobile,
            relationship: parsed.user?.emergencyContacts?.[0]?.relationship || INITIAL_STATE.user.emergencyContact.relationship
          }
        };
        const loadedReports = parsed.medicalReports || 
          parsed.healthRecords?.filter(r => r.verificationStatus === 'User Verified' || r.verificationStatus === 'User verified' || r.extractedTests?.length > 0) || [];
        const loadedEmergencyMode = parsed.emergencyMode || INITIAL_STATE.emergencyMode;
        const loadedEmergencyHistory = parsed.emergencyHistory || parsed.emergencyEvents || INITIAL_STATE.emergencyHistory;
        const loadedBloodDonors = parsed.bloodDonors || parsed.donors || INITIAL_STATE.bloodDonors;
        const loadedDonorProfile = parsed.donorProfile !== undefined ? parsed.donorProfile : INITIAL_STATE.donorProfile;
        const loadedBloodRequests = parsed.bloodRequests || INITIAL_STATE.bloodRequests;
        const loadedMedicines = (parsed.medicines && parsed.medicines.length > 0)
          ? parsed.medicines.map(m => ({
              status: 'Active',
              frequency: m.frequency || 'Once Daily',
              startDate: m.startDate || '28 Sep 2026',
              endDate: m.endDate || '',
              prescribedBy: m.prescribedBy || 'Physician',
              notes: m.notes || '',
              createdAt: m.createdAt || new Date().toISOString(),
              ...m
            }))
          : INITIAL_STATE.medicines;
        const loadedMedicationLogs = parsed.medicationLogs || INITIAL_STATE.medicationLogs || {};
        const loadedMedicationHistory = parsed.medicationHistory || INITIAL_STATE.medicationHistory || [];

        const loadedFamilyMembers = (parsed.familyMembers && parsed.familyMembers.length > 0)
          ? parsed.familyMembers.map(m => ({
              otpStatus: m.otpStatus || 'verified',
              consentStatus: m.consentStatus || (m.permissions ? 'granted' : 'pending'),
              permissions: m.permissions || { health_records: true, medicines: false, emergency: false },
              mobileNumber: m.mobileNumber || '9840123456',
              linkedAt: m.linkedAt || null,
              consentUpdatedAt: m.consentUpdatedAt || null,
              createdAt: m.createdAt || new Date().toISOString(),
              ...m
            }))
          : INITIAL_STATE.familyMembers;
        const loadedFamilyAuditLogs = parsed.familyAuditLogs || INITIAL_STATE.familyAuditLogs;

        let loadedOrganDonation = parsed.organDonation;
        if (!loadedOrganDonation && parsed.organPledge) {
          loadedOrganDonation = {
            id: parsed.organPledge.pledgeId || 'OD-2026-90412',
            status: parsed.organPledge.isRegistered !== false ? 'Registered' : 'Not Registered',
            selectedOrgans: parsed.organPledge.organsSelected?.map(o => o === 'Corneas (Eyes)' ? 'Eyes / Corneas' : o) || ['Heart', 'Liver', 'Kidneys', 'Eyes / Corneas', 'Lungs'],
            consentConfirmed: true,
            consentTextVersion: 'v1.0',
            registeredAt: parsed.organPledge.registrationDate || '15 Feb 2026, 10:30 AM',
            updatedAt: null,
            withdrawnAt: null
          };
        }
        if (!loadedOrganDonation) {
          loadedOrganDonation = INITIAL_STATE.organDonation;
        }
        const loadedOrganAuditLogs = parsed.organDonationAuditLogs || INITIAL_STATE.organDonationAuditLogs;

        return {
          ...INITIAL_STATE,
          ...parsed,
          medicalReports: loadedReports,
          emergencyMode: loadedEmergencyMode,
          emergencyHistory: loadedEmergencyHistory,
          bloodDonors: loadedBloodDonors,
          donorProfile: loadedDonorProfile,
          bloodRequests: loadedBloodRequests,
          medicines: loadedMedicines,
          medicationLogs: loadedMedicationLogs,
          medicationHistory: loadedMedicationHistory,
          familyMembers: loadedFamilyMembers,
          familyAuditLogs: loadedFamilyAuditLogs,
          organDonation: loadedOrganDonation,
          organDonationAuditLogs: loadedOrganAuditLogs,
          user: resolvedUser,
          currentRoute: hashRoute || parsed.currentRoute || 'login'
        };
      }
    } catch {
      // ignore
    }
    return { ...INITIAL_STATE, currentRoute: hashRoute || 'login' };
  });

  const [toasts, setToasts] = useState([]);

  // Sync hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash && hash !== state.currentRoute) {
        setState(prev => ({ ...prev, currentRoute: hash }));
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [state.currentRoute]);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage quota or private browsing
    }
  }, [state]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Route navigation
  const navigate = (route) => {
    window.location.hash = `#${route}`;
    setState(prev => ({ ...prev, currentRoute: route }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Language change
  const setLanguage = (lang) => {
    setState(prev => ({ ...prev, language: lang }));
    addToast(`Language switched to ${lang.toUpperCase()}`, 'info');
  };

  // User actions
  const loginUser = (credentials = {}) => {
    window.location.hash = '#dashboard';
    setState(prev => ({
      ...prev,
      isAuthenticated: true,
      currentRoute: 'dashboard',
      user: credentials?.phone ? { ...prev.user, phone: credentials.phone } : prev.user
    }));
    addToast('Welcome back to Health Wallet', 'success');
  };

  const logoutUser = () => {
    window.location.hash = '#login';
    setState(prev => ({
      ...prev,
      isAuthenticated: false,
      currentRoute: 'login'
    }));
    addToast('Signed out successfully', 'info');
  };

  // Record actions
  const addHealthRecord = (record) => {
    const newRecord = {
      id: 'rec-' + Date.now(),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      verified: true,
      ...record
    };
    setState(prev => ({
      ...prev,
      healthRecords: [newRecord, ...prev.healthRecords]
    }));
    addToast('Health record successfully saved to wallet', 'success');
  };

  const deleteHealthRecord = (id) => {
    setState(prev => ({
      ...prev,
      healthRecords: prev.healthRecords.filter(r => r.id !== id),
      medicalReports: (prev.medicalReports || []).filter(r => r.id !== id)
    }));
    addToast('Record archived / removed', 'info');
  };

  // Dedicated Medical Reports actions matching required data model
  const addMedicalReport = (report) => {
    const reportItem = {
      id: 'report-' + Date.now(),
      verificationStatus: 'User Verified',
      createdAt: new Date().toISOString(),
      ...report
    };
    setState(prev => ({
      ...prev,
      medicalReports: [reportItem, ...(prev.medicalReports || [])],
      healthRecords: [reportItem, ...prev.healthRecords]
    }));
    addToast('Medical report saved to Health Records', 'success');
    return reportItem;
  };

  const deleteMedicalReport = (id) => {
    setState(prev => ({
      ...prev,
      medicalReports: (prev.medicalReports || []).filter(r => r.id !== id),
      healthRecords: prev.healthRecords.filter(r => r.id !== id)
    }));
    addToast('Medical report deleted successfully', 'info');
  };

  // Medicines actions
  const addMedicine = (medicineData) => {
    const newMed = {
      id: 'med-' + Date.now(),
      name: medicineData.name?.trim(),
      dosage: medicineData.dosage?.trim(),
      frequency: medicineData.frequency || 'Once Daily',
      startDate: medicineData.startDate,
      endDate: medicineData.endDate || '',
      prescribedBy: medicineData.prescribedBy?.trim() || '',
      notes: medicineData.notes?.trim() || '',
      status: medicineData.status || 'Active',
      createdAt: new Date().toISOString(),
      takenToday: false
    };

    setState(prev => ({
      ...prev,
      medicines: [newMed, ...prev.medicines]
    }));

    addToast(`Added ${newMed.name} to medicines`, 'success');
    return newMed;
  };

  const updateMedicine = (medicineId, updatedFields) => {
    setState(prev => ({
      ...prev,
      medicines: prev.medicines.map(m =>
        m.id === medicineId ? { ...m, ...updatedFields } : m
      )
    }));
    addToast('Medicine updated successfully', 'success');
  };

  const deleteMedicine = (medicineId) => {
    setState(prev => ({
      ...prev,
      medicines: prev.medicines.filter(m => m.id !== medicineId)
    }));
    addToast('Medicine removed from Health Wallet', 'info');
  };

  const setMedicineStatus = (medicineId, newStatus) => {
    setState(prev => ({
      ...prev,
      medicines: prev.medicines.map(m =>
        m.id === medicineId ? { ...m, status: newStatus } : m
      )
    }));
    addToast(`Medicine marked as ${newStatus}`, 'info');
  };

  const logMedicationDose = (medicineId, date, scheduledTime, doseStatus) => {
    const key = `${date}-${medicineId}-${scheduledTime}`;

    setState(prev => {
      const med = prev.medicines.find(m => m.id === medicineId);
      const medicineName = med ? med.name : 'Medicine';
      const dosage = med ? med.dosage : '';

      const updatedLogs = {
        ...prev.medicationLogs,
        [key]: doseStatus
      };

      let updatedHistory = [...(prev.medicationHistory || [])];
      const existingIdx = updatedHistory.findIndex(
        h => h.medicineId === medicineId && h.date === date && h.scheduledTime === scheduledTime
      );

      if (doseStatus === 'Pending') {
        if (existingIdx >= 0) {
          updatedHistory.splice(existingIdx, 1);
        }
      } else {
        const historyItem = {
          id: existingIdx >= 0 ? updatedHistory[existingIdx].id : 'hist-' + Date.now(),
          medicineId,
          medicineName,
          dosage,
          date,
          scheduledTime,
          status: doseStatus,
          timestamp: new Date().toISOString()
        };
        if (existingIdx >= 0) {
          updatedHistory[existingIdx] = historyItem;
        } else {
          updatedHistory = [historyItem, ...updatedHistory];
        }
      }

      const updatedMedicines = prev.medicines.map(m => {
        if (m.id === medicineId) {
          return { ...m, takenToday: doseStatus === 'Taken' };
        }
        return m;
      });

      return {
        ...prev,
        medicines: updatedMedicines,
        medicationLogs: updatedLogs,
        medicationHistory: updatedHistory
      };
    });

    if (doseStatus === 'Taken') {
      addToast(`Marked as Taken (${scheduledTime})`, 'success');
    } else if (doseStatus === 'Skipped') {
      addToast(`Marked as Skipped (${scheduledTime})`, 'info');
    } else {
      addToast(`Reset schedule for ${scheduledTime}`, 'info');
    }
  };

  const toggleMedicineTaken = (id) => {
    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    setState(prev => {
      const med = prev.medicines.find(m => m.id === id);
      if (!med) return prev;
      const nextTaken = !med.takenToday;
      const key = `${todayStr}-${id}-08:00 AM`;
      const nextStatus = nextTaken ? 'Taken' : 'Pending';

      return {
        ...prev,
        medicines: prev.medicines.map(m =>
          m.id === id ? { ...m, takenToday: nextTaken } : m
        ),
        medicationLogs: {
          ...prev.medicationLogs,
          [key]: nextStatus
        }
      };
    });
    addToast('Medicine schedule updated', 'success');
  };

  // Family actions
  const addFamilyMember = (memberData) => {
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const newMember = {
      id: 'fam-' + Date.now(),
      name: memberData.name?.trim(),
      mobileNumber: memberData.mobileNumber?.trim(),
      relationship: memberData.relationship || 'Other',
      otpStatus: memberData.otpStatus || 'verified',
      consentStatus: memberData.consentStatus || 'pending',
      permissions: memberData.permissions || {
        health_records: false,
        medicines: false,
        emergency: false
      },
      linkedAt: memberData.linkedAt || null,
      consentUpdatedAt: today,
      createdAt: new Date().toISOString(),
      avatarColor: memberData.avatarColor || '#1e56a0'
    };

    const auditEvent = {
      id: 'faudit-' + Date.now(),
      timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      familyMemberId: newMember.id,
      familyMemberName: newMember.name,
      eventType: 'Family Member Added',
      details: `Mobile: +91 ${newMember.mobileNumber}, Relationship: ${newMember.relationship}`
    };

    setState(prev => ({
      ...prev,
      familyMembers: [...prev.familyMembers, newMember],
      familyAuditLogs: [auditEvent, ...(prev.familyAuditLogs || [])]
    }));

    return newMember;
  };

  const createFamilyConsentRequest = (memberId, requestedPermissions) => {
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedTime = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    setState(prev => {
      const member = prev.familyMembers.find(m => m.id === memberId);
      const permList = Object.entries(requestedPermissions || {})
        .filter(([, val]) => val)
        .map(([k]) => k.replace('_', ' '))
        .join(', ') || 'None';

      const auditEvent = {
        id: 'faudit-' + Date.now(),
        timestamp: formattedTime,
        familyMemberId: memberId,
        familyMemberName: member?.name || 'Family Member',
        eventType: 'Consent Requested',
        details: `Permissions Requested: ${permList}`
      };

      const updatedMembers = prev.familyMembers.map(m =>
        m.id === memberId
          ? {
              ...m,
              consentStatus: 'pending',
              permissions: requestedPermissions,
              consentUpdatedAt: today
            }
          : m
      );

      return {
        ...prev,
        familyMembers: updatedMembers,
        familyAuditLogs: [auditEvent, ...(prev.familyAuditLogs || [])]
      };
    });

    addToast('Consent request created.', 'info');
  };

  const grantFamilyConsent = (memberId) => {
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedTime = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    setState(prev => {
      const member = prev.familyMembers.find(m => m.id === memberId);
      const permList = Object.entries(member?.permissions || {})
        .filter(([, val]) => val)
        .map(([k]) => k.replace('_', ' '))
        .join(', ') || 'Standard';

      const auditEvent = {
        id: 'faudit-' + Date.now(),
        timestamp: formattedTime,
        familyMemberId: memberId,
        familyMemberName: member?.name || 'Family Member',
        eventType: 'Consent Granted',
        details: `Permissions Granted: ${permList} (Development Mode Simulation)`
      };

      const updatedMembers = prev.familyMembers.map(m =>
        m.id === memberId
          ? {
              ...m,
              consentStatus: 'granted',
              linkedAt: today,
              consentUpdatedAt: today
            }
          : m
      );

      return {
        ...prev,
        familyMembers: updatedMembers,
        familyAuditLogs: [auditEvent, ...(prev.familyAuditLogs || [])]
      };
    });

    addToast('Consent granted for family member.', 'success');
  };

  const updateFamilyPermissions = (memberId, newPermissions) => {
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedTime = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    setState(prev => {
      const member = prev.familyMembers.find(m => m.id === memberId);
      const permList = Object.entries(newPermissions || {})
        .filter(([, val]) => val)
        .map(([k]) => k.replace('_', ' '))
        .join(', ') || 'None';

      const auditEvent = {
        id: 'faudit-' + Date.now(),
        timestamp: formattedTime,
        familyMemberId: memberId,
        familyMemberName: member?.name || 'Family Member',
        eventType: 'Permission Updated',
        details: `Active Permissions: ${permList}`
      };

      const updatedMembers = prev.familyMembers.map(m =>
        m.id === memberId
          ? {
              ...m,
              permissions: newPermissions,
              consentUpdatedAt: today
            }
          : m
      );

      return {
        ...prev,
        familyMembers: updatedMembers,
        familyAuditLogs: [auditEvent, ...(prev.familyAuditLogs || [])]
      };
    });

    addToast('Permissions updated successfully.', 'success');
  };

  const revokeFamilyConsent = (memberId) => {
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedTime = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    setState(prev => {
      const member = prev.familyMembers.find(m => m.id === memberId);

      const auditEvent = {
        id: 'faudit-' + Date.now(),
        timestamp: formattedTime,
        familyMemberId: memberId,
        familyMemberName: member?.name || 'Family Member',
        eventType: 'Consent Revoked',
        details: 'Access immediately disabled for all categories.'
      };

      const updatedMembers = prev.familyMembers.map(m =>
        m.id === memberId
          ? {
              ...m,
              consentStatus: 'revoked',
              permissions: {
                health_records: false,
                medicines: false,
                emergency: false
              },
              consentUpdatedAt: today
            }
          : m
      );

      return {
        ...prev,
        familyMembers: updatedMembers,
        familyAuditLogs: [auditEvent, ...(prev.familyAuditLogs || [])]
      };
    });

    addToast('Family health access revoked.', 'info');
  };

  const removeFamilyMember = (memberId) => {
    setState(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.filter(m => m.id !== memberId)
    }));
    addToast('Family member removed.', 'info');
  };

  const hasFamilyPermission = (memberId, permissionKey) => {
    const member = (state.familyMembers || []).find(m => m.id === memberId);
    if (!member) return false;
    if (member.consentStatus !== 'granted') return false;
    return Boolean(member.permissions?.[permissionKey]);
  };

  // Emergency actions
  const activateEmergency = (reason = 'Medical Emergency', locationInfo = null) => {
    const timestamp = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const newEvent = {
      id: 'em-evt-' + Date.now(),
      eventType: 'Emergency Mode Activated',
      timestamp,
      healthWalletId: getHealthWalletId(state.user),
      reason,
      locationAvailability: locationInfo?.status === 'Location Available' ? 'Location Available' : 'Location Unavailable',
      accessType: 'Citizen Emergency Self-Activation'
    };

    setState(prev => ({
      ...prev,
      emergencyMode: {
        isActive: true,
        activatedAt: timestamp,
        reason,
        location: locationInfo,
        alertPrepared: false,
        alertPreparedAt: null
      },
      emergencyState: {
        ...prev.emergencyState,
        isActive: true,
        activatedAt: timestamp,
        auditLogs: [
          { timestamp, event: `Emergency Mode Activated (${reason})`, entity: 'Citizen Authenticated Device' },
          ...(prev.emergencyState?.auditLogs || [])
        ]
      },
      emergencyHistory: [newEvent, ...(prev.emergencyHistory || [])]
    }));
    addToast('Emergency Mode Activated', 'danger');
    return newEvent;
  };

  const prepareEmergencyAlert = (alertDetails = {}) => {
    const timestamp = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const newEvent = {
      id: 'em-evt-' + Date.now(),
      eventType: 'Emergency Alert Prepared',
      timestamp,
      healthWalletId: getHealthWalletId(state.user),
      reason: alertDetails.reason || state.emergencyMode?.reason || 'Medical Emergency',
      locationAvailability: alertDetails.locationAvailability || 'Location Available',
      accessType: 'Emergency Profile Package Prepared'
    };

    setState(prev => ({
      ...prev,
      emergencyMode: {
        ...prev.emergencyMode,
        alertPrepared: true,
        alertPreparedAt: timestamp
      },
      emergencyHistory: [newEvent, ...(prev.emergencyHistory || [])]
    }));
    addToast('Emergency Alert Prepared', 'info');
    return newEvent;
  };

  const cancelEmergency = () => {
    const timestamp = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const newEvent = {
      id: 'em-evt-' + Date.now(),
      eventType: 'Emergency Mode Deactivated',
      timestamp,
      healthWalletId: getHealthWalletId(state.user),
      reason: 'Citizen deactivated emergency mode',
      locationAvailability: 'Not Applicable',
      accessType: 'User Stand-Down Command'
    };

    setState(prev => ({
      ...prev,
      emergencyMode: {
        isActive: false,
        activatedAt: null,
        reason: 'Medical Emergency',
        otherReasonText: '',
        location: null,
        alertPrepared: false,
        alertPreparedAt: null
      },
      emergencyState: {
        ...prev.emergencyState,
        isActive: false,
        auditLogs: [
          { timestamp, event: 'Emergency Mode Deactivated by Citizen', entity: 'User Authenticated Device' },
          ...(prev.emergencyState?.auditLogs || [])
        ]
      },
      emergencyHistory: [newEvent, ...(prev.emergencyHistory || [])]
    }));
    addToast('Emergency Mode Deactivated', 'info');
  };

  const addEmergencyEvent = (eventData) => {
    const event = {
      id: 'em-evt-' + Date.now(),
      timestamp: new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      healthWalletId: getHealthWalletId(state.user),
      ...eventData
    };
    setState(prev => ({
      ...prev,
      emergencyHistory: [event, ...(prev.emergencyHistory || [])]
    }));
    return event;
  };

  const getEmergencyHistory = () => state.emergencyHistory || [];

  // Offline toggle
  const toggleOfflineSimulation = () => {
    setState(prev => {
      const next = !prev.isOfflineSimulated;
      return { ...prev, isOfflineSimulated: next };
    });
  };

  // Organ Donation Intent Methods (Voluntary Intent Management)
  const registerOrganDonationIntent = (selectedOrgans) => {
    if (!selectedOrgans || selectedOrgans.length === 0) {
      addToast('Please select at least one organ or tissue.', 'error');
      return null;
    }
    const nowTimestamp = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    const isReRegister = state.organDonation?.status === 'Withdrawn';
    const eventType = isReRegister ? 'Donation intent re-registered' : 'Donation intent registered';

    const newRecord = {
      id: state.organDonation?.id || ('OD-' + Date.now().toString().slice(-6)),
      status: 'Registered',
      selectedOrgans: [...selectedOrgans],
      consentConfirmed: true,
      consentTextVersion: 'v1.0',
      registeredAt: nowTimestamp,
      updatedAt: null,
      withdrawnAt: null
    };

    const auditEvent = {
      id: 'od-audit-' + Date.now(),
      eventType,
      timestamp: nowTimestamp,
      healthWalletId: getHealthWalletId(state.user),
      selectedOrgans: [...selectedOrgans]
    };

    setState(prev => ({
      ...prev,
      organDonation: newRecord,
      organDonationAuditLogs: [auditEvent, ...(prev.organDonationAuditLogs || [])],
      organPledge: {
        ...(prev.organPledge || {}),
        isRegistered: true,
        organsSelected: [...selectedOrgans]
      }
    }));

    addToast('Donation intent registered successfully.', 'success');
    return newRecord;
  };

  const updateOrganDonationPreferences = (selectedOrgans) => {
    if (!selectedOrgans || selectedOrgans.length === 0) {
      addToast('Please select at least one organ or tissue.', 'error');
      return false;
    }
    const nowTimestamp = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const auditEvent = {
      id: 'od-audit-' + Date.now(),
      eventType: 'Preferences updated',
      timestamp: nowTimestamp,
      healthWalletId: getHealthWalletId(state.user),
      selectedOrgans: [...selectedOrgans]
    };

    setState(prev => ({
      ...prev,
      organDonation: {
        ...(prev.organDonation || {}),
        status: 'Registered',
        selectedOrgans: [...selectedOrgans],
        updatedAt: nowTimestamp
      },
      organDonationAuditLogs: [auditEvent, ...(prev.organDonationAuditLogs || [])],
      organPledge: {
        ...(prev.organPledge || {}),
        organsSelected: [...selectedOrgans]
      }
    }));

    addToast('Organ donation preferences updated.', 'success');
    return true;
  };

  const withdrawOrganDonationIntent = () => {
    const nowTimestamp = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const auditEvent = {
      id: 'od-audit-' + Date.now(),
      eventType: 'Donation intent withdrawn',
      timestamp: nowTimestamp,
      healthWalletId: getHealthWalletId(state.user),
      selectedOrgans: state.organDonation?.selectedOrgans || []
    };

    setState(prev => ({
      ...prev,
      organDonation: {
        ...(prev.organDonation || {}),
        status: 'Withdrawn',
        withdrawnAt: nowTimestamp
      },
      organDonationAuditLogs: [auditEvent, ...(prev.organDonationAuditLogs || [])],
      organPledge: {
        ...(prev.organPledge || {}),
        isRegistered: false
      }
    }));

    addToast('Donation intent withdrawn.', 'info');
  };

  const getOrganDonationStatus = () => {
    return state.organDonation?.status || 'Not Registered';
  };

  // Backward compatibility aliases
  const updateOrganPledge = (pledgeData) => {
    if (pledgeData?.organsSelected) {
      updateOrganDonationPreferences(pledgeData.organsSelected);
    }
  };

  const revokeOrganPledge = () => {
    withdrawOrganDonationIntent();
  };

  // Update Profile
  const updateUserProfile = (updatedFields) => {
    setState(prev => {
      const mergedUser = { ...prev.user, ...updatedFields };
      if (updatedFields.dateOfBirth && !updatedFields.dob) mergedUser.dob = updatedFields.dateOfBirth;
      if (updatedFields.dob && !updatedFields.dateOfBirth) mergedUser.dateOfBirth = updatedFields.dob;
      if (updatedFields.mobileNumber && !updatedFields.phone) mergedUser.phone = `+91 ${updatedFields.mobileNumber}`;
      if (updatedFields.phone && !updatedFields.mobileNumber) mergedUser.mobileNumber = String(updatedFields.phone).replace(/\D/g, '').slice(-10);
      if (updatedFields.criticalConditions && !updatedFields.chronicConditions) mergedUser.chronicConditions = updatedFields.criticalConditions;
      if (updatedFields.chronicConditions && !updatedFields.criticalConditions) mergedUser.criticalConditions = updatedFields.chronicConditions;
      if (updatedFields.emergencyContact) {
        mergedUser.emergencyContacts = [
          {
            id: 'ec-1',
            name: updatedFields.emergencyContact.name,
            relationship: updatedFields.emergencyContact.relationship,
            phone: `+91 ${updatedFields.emergencyContact.mobile}`,
            priority: 'Primary'
          },
          ...(prev.user.emergencyContacts?.slice(1) || [])
        ];
      }
      return {
        ...prev,
        user: mergedUser
      };
    });
    addToast('Profile information saved', 'success');
  };

  // Register New User (First-time onboarding & Identity Foundation)
  const registerNewUser = (registrationData) => {
    const newHealthWalletId = generateHealthWalletId();
    const cleanMobile = registrationData.mobileNumber ? String(registrationData.mobileNumber).replace(/\D/g, '').slice(-10) : '';
    const cleanAadhaar = registrationData.aadhaarNumber ? String(registrationData.aadhaarNumber).replace(/\D/g, '').slice(-12) : '';
    const cleanEmMobile = registrationData.emergencyContactMobile ? String(registrationData.emergencyContactMobile).replace(/\D/g, '').slice(-10) : '';

    const allergiesArray = Array.isArray(registrationData.allergies)
      ? registrationData.allergies
      : registrationData.allergies
      ? String(registrationData.allergies).split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const conditionsArray = Array.isArray(registrationData.criticalConditions)
      ? registrationData.criticalConditions
      : registrationData.criticalConditions
      ? String(registrationData.criticalConditions).split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const newUser = {
      id: newHealthWalletId,
      healthWalletId: newHealthWalletId,
      fullName: registrationData.fullName?.trim() || 'Citizen',
      dateOfBirth: registrationData.dateOfBirth || '',
      dob: registrationData.dateOfBirth || '',
      gender: registrationData.gender || 'Other',
      aadhaarNumber: cleanAadhaar,
      mobileNumber: cleanMobile,
      phone: `+91 ${cleanMobile}`,
      email: registrationData.email?.trim() || '',
      state: registrationData.state?.trim() || '',
      district: registrationData.district?.trim() || '',
      address: registrationData.address?.trim() || '',
      bloodGroup: registrationData.bloodGroup || 'O+',
      allergies: allergiesArray,
      criticalConditions: conditionsArray,
      chronicConditions: conditionsArray,
      emergencyContact: {
        name: registrationData.emergencyContactName?.trim() || '',
        mobile: cleanEmMobile,
        relationship: registrationData.emergencyContactRelationship || 'Guardian'
      },
      emergencyContacts: [
        {
          id: 'ec-1',
          name: registrationData.emergencyContactName?.trim() || '',
          relationship: registrationData.emergencyContactRelationship || 'Guardian',
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

    setState(prev => ({
      ...prev,
      user: newUser,
      isAuthenticated: true,
      currentRoute: 'dashboard'
    }));

    addToast(`Health Wallet created successfully! Welcome, ${newUser.fullName.split(' ')[0]}`, 'success');
    return newUser;
  };

  // Blood Donation Module Methods
  const registerBloodDonor = (donorData) => {
    const profile = {
      id: 'donor-self',
      name: donorData.name || state.user?.fullName || 'Vijay Rajan',
      bloodGroup: donorData.bloodGroup || state.user?.bloodGroup || 'O+',
      location: donorData.location || 'Chennai',
      availability: donorData.availability || 'Available',
      contactPreference: donorData.contactPreference || 'Health Wallet In-App',
      registeredAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      isSelf: true
    };

    setState(prev => {
      const existingDonors = prev.bloodDonors || [];
      const filtered = existingDonors.filter(d => d.id !== 'donor-self');
      return {
        ...prev,
        donorProfile: profile,
        bloodDonors: [profile, ...filtered]
      };
    });

    addToast('Donor profile saved.', 'success');
    return profile;
  };

  const updateDonorAvailability = (newAvailability) => {
    setState(prev => {
      if (!prev.donorProfile) return prev;
      const updatedProfile = {
        ...prev.donorProfile,
        availability: newAvailability
      };
      const updatedDonors = (prev.bloodDonors || []).map(d =>
        d.id === 'donor-self' ? { ...d, availability: newAvailability } : d
      );
      return {
        ...prev,
        donorProfile: updatedProfile,
        bloodDonors: updatedDonors
      };
    });
    addToast(`Donor status updated to ${newAvailability}.`, 'info');
  };

  const createBloodRequest = (requestData) => {
    const newRequest = {
      id: 'req-' + Date.now(),
      patientName: requestData.patientName || 'Patient',
      bloodGroupRequired: requestData.bloodGroupRequired,
      unitsRequired: Number(requestData.unitsRequired) || 1,
      location: requestData.location || '',
      urgency: requestData.urgency || 'Normal',
      additionalNote: requestData.additionalNote || '',
      status: 'Open',
      createdAt: new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      requestedDonors: [],
      isDemo: false
    };

    setState(prev => ({
      ...prev,
      bloodRequests: [newRequest, ...(prev.bloodRequests || [])]
    }));

    addToast('Blood request created.', 'success');
    return newRequest;
  };

  const requestDonor = (requestId, donor) => {
    setState(prev => {
      const updatedRequests = (prev.bloodRequests || []).map(req => {
        if (req.id === requestId) {
          const donorName = donor?.name || 'Compatible Donor';
          const existing = req.requestedDonors || [];
          return {
            ...req,
            status: 'Donor Requested',
            requestedDonors: existing.includes(donorName) ? existing : [...existing, donorName]
          };
        }
        return req;
      });

      return {
        ...prev,
        bloodRequests: updatedRequests
      };
    });

    addToast(`Donor request prepared for ${donor?.name || 'donor'}.`, 'success');
  };

  const cancelBloodRequest = (requestId) => {
    setState(prev => ({
      ...prev,
      bloodRequests: (prev.bloodRequests || []).map(req =>
        req.id === requestId ? { ...req, status: 'Cancelled' } : req
      )
    }));
    addToast('Blood request cancelled.', 'info');
  };

  const findCompatibleDonors = (bloodGroup, location) => {
    const allDonors = state.bloodDonors || [];
    return matchCompatibleDonors(allDonors, bloodGroup, location);
  };

  // Request blood donor (legacy / direct)
  const requestBloodDonor = (donorName) => {
    addToast(`Donor request prepared for ${donorName}`, 'success');
  };

  return (
    <HealthWalletContext.Provider
      value={{
        ...state,
        healthWalletId: getHealthWalletId(state.user),
        getHealthWalletId,
        toasts,
        addToast,
        removeToast,
        navigate,
        setLanguage,
        loginUser,
        logoutUser,
        addHealthRecord,
        deleteHealthRecord,
        medicalReports: state.medicalReports || [],
        addMedicalReport,
        deleteMedicalReport,
        medicines: state.medicines || [],
        medicationLogs: state.medicationLogs || {},
        medicationHistory: state.medicationHistory || [],
        addMedicine,
        updateMedicine,
        deleteMedicine,
        setMedicineStatus,
        logMedicationDose,
        toggleMedicineTaken,
        familyMembers: state.familyMembers || [],
        familyAuditLogs: state.familyAuditLogs || [],
        addFamilyMember,
        createFamilyConsentRequest,
        grantFamilyConsent,
        updateFamilyPermissions,
        revokeFamilyConsent,
        removeFamilyMember,
        hasFamilyPermission,
        emergencyMode: state.emergencyMode || { isActive: false },
        emergencyHistory: state.emergencyHistory || [],
        activateEmergency,
        cancelEmergency,
        prepareEmergencyAlert,
        addEmergencyEvent,
        getEmergencyHistory,
        toggleOfflineSimulation,
        organDonation: state.organDonation || { status: 'Not Registered', selectedOrgans: [] },
        organDonationAuditLogs: state.organDonationAuditLogs || [],
        registerOrganDonationIntent,
        updateOrganDonationPreferences,
        withdrawOrganDonationIntent,
        getOrganDonationStatus,
        updateOrganPledge,
        revokeOrganPledge,
        updateUserProfile,
        registerNewUser,
        generateHealthWalletId,
        maskAadhaar,
        bloodDonors: state.bloodDonors || [],
        donors: state.bloodDonors || [],
        donorProfile: state.donorProfile || null,
        bloodRequests: state.bloodRequests || [],
        registerBloodDonor,
        updateDonorAvailability,
        createBloodRequest,
        requestDonor,
        cancelBloodRequest,
        findCompatibleDonors,
        requestBloodDonor,
        setSearchQuery: (query) => setState(prev => ({ ...prev, searchQuery: query }))
      }}
    >
      {children}
    </HealthWalletContext.Provider>
  );
};

// oxlint-disable-next-line react/only-export-components
export const useHealthWallet = () => {
  const context = useContext(HealthWalletContext);
  if (!context) {
    throw new Error('useHealthWallet must be used within a HealthWalletProvider');
  }
  return context;
};
