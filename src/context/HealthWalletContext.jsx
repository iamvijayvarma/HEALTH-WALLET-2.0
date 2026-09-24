import React, { createContext, useContext, useState, useEffect } from 'react';

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
    fullName: 'Kavin Rajan',
    id: 'HW-9021-4819',
    abhaNumber: '91-8402-1928-3841',
    dob: '1998-03-12',
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '+91 98765 43210',
    email: 'kavin.rajan@gov-health.org',
    address: '42, Pantheon Road, Egmore, Chennai, Tamil Nadu - 600008',
    allergies: ['Penicillin', 'Dust / Pollen Mites'],
    chronicConditions: ['Mild Allergic Bronchial Asthma'],
    emergencyContacts: [
      { id: 'ec-1', name: 'Rajendran R', relationship: 'Father', phone: '+91 98401 23456', priority: 'Primary' },
      { id: 'ec-2', name: 'Dr. Meenakshi S', relationship: 'Family Physician', phone: '+91 94440 98765', priority: 'Medical Consultant' }
    ]
  },

  familyMembers: [
    {
      id: 'fam-self',
      name: 'Kavin (You)',
      relationship: 'Self',
      age: 28,
      bloodGroup: 'O+',
      recordsCount: 6,
      avatarColor: '#0f4c81',
      conditions: ['Mild Asthma']
    },
    {
      id: 'fam-1',
      name: 'Rajendran (Father)',
      relationship: 'Father',
      age: 58,
      bloodGroup: 'B+',
      recordsCount: 8,
      avatarColor: '#1e3a8a',
      conditions: ['Hypertension', 'Type 2 Diabetes']
    },
    {
      id: 'fam-2',
      name: 'Lakshmi (Mother)',
      relationship: 'Mother',
      age: 54,
      bloodGroup: 'O+',
      recordsCount: 10,
      avatarColor: '#0d9488',
      conditions: ['Osteoarthritis']
    },
    {
      id: 'fam-3',
      name: 'Priya (Sister)',
      relationship: 'Sister',
      age: 24,
      bloodGroup: 'A+',
      recordsCount: 4,
      avatarColor: '#7c3aed',
      conditions: ['None reported']
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

  medicines: [
    {
      id: 'med-1',
      name: 'Montelukast Sodium 10mg',
      dosage: '1 Tablet Daily',
      timing: 'Bedtime (Night)',
      category: 'Allergy / Asthma',
      prescribedBy: 'Dr. V. Rajesh',
      startDate: '20 Apr 2026',
      refillRemaining: 14,
      takenToday: true
    },
    {
      id: 'med-2',
      name: 'Asthalin (Salbutamol) 100mcg Inhaler',
      dosage: '2 Puffs SOS',
      timing: 'As Needed',
      category: 'Bronchodilator',
      prescribedBy: 'Dr. V. Rajesh',
      startDate: '15 Jan 2026',
      refillRemaining: 45,
      takenToday: false
    },
    {
      id: 'med-3',
      name: 'Vitamin D3 & Calcium 60,000 IU',
      dosage: '1 Capsule Weekly',
      timing: 'Sunday Morning (Post Breakfast)',
      category: 'Supplement',
      prescribedBy: 'Dr. P. Sivakumar',
      startDate: '01 Mar 2026',
      refillRemaining: 6,
      takenToday: true
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

  organPledge: {
    isRegistered: true,
    pledgeId: 'OD-IN-2026-90412',
    registrationDate: '15 Feb 2026',
    organsSelected: ['Corneas (Eyes)', 'Kidneys', 'Liver', 'Heart', 'Lungs'],
    tissueSelected: ['Skin', 'Bone'],
    nomineeName: 'Rajendran R',
    nomineeRelation: 'Father',
    nomineePhone: '+91 98401 23456',
    consentSigned: true
  },

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
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_STATE,
          ...parsed,
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
      ...record,
      id: 'rec-' + Date.now(),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      verified: true
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
      healthRecords: prev.healthRecords.filter(r => r.id !== id)
    }));
    addToast('Record archived / removed', 'info');
  };

  // Medicines actions
  const toggleMedicineTaken = (id) => {
    setState(prev => ({
      ...prev,
      medicines: prev.medicines.map(m => {
        if (m.id === id) {
          const nextState = !m.takenToday;
          return { ...m, takenToday: nextState };
        }
        return m;
      })
    }));
    addToast('Medicine schedule updated', 'success');
  };

  // Family actions
  const addFamilyMember = (member) => {
    const newMember = {
      ...member,
      id: 'fam-' + Date.now(),
      recordsCount: 0,
      avatarColor: '#0f4c81'
    };
    setState(prev => ({
      ...prev,
      familyMembers: [...prev.familyMembers, newMember]
    }));
    addToast(`Family member ${member.name} linked with verified consent`, 'success');
  };

  // Emergency actions
  const activateEmergency = () => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString();
    setState(prev => ({
      ...prev,
      emergencyState: {
        ...prev.emergencyState,
        isActive: true,
        activatedAt: timestamp,
        auditLogs: [
          {
            timestamp,
            event: 'HIGH PRIORITY: Emergency SOS Activated by User',
            entity: '108 Dispatch Command & Authorized Family'
          },
          ...prev.emergencyState.auditLogs
        ]
      }
    }));
    addToast('EMERGENCY ACTIVATED: Live medical alert dispatched', 'danger');
  };

  const cancelEmergency = () => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setState(prev => ({
      ...prev,
      emergencyState: {
        ...prev.emergencyState,
        isActive: false,
        auditLogs: [
          {
            timestamp,
            event: 'Emergency status deactivated by verified user PIN',
            entity: 'User Authenticated Device'
          },
          ...prev.emergencyState.auditLogs
        ]
      }
    }));
    addToast('Emergency deactivated. Stand down alert sent to contacts.', 'info');
  };

  // Offline toggle
  const toggleOfflineSimulation = () => {
    setState(prev => {
      const next = !prev.isOfflineSimulated;
      return { ...prev, isOfflineSimulated: next };
    });
  };

  // Organ Pledge
  const updateOrganPledge = (pledgeData) => {
    setState(prev => ({
      ...prev,
      organPledge: {
        ...prev.organPledge,
        ...pledgeData,
        isRegistered: true,
        pledgeId: prev.organPledge.pledgeId || ('OD-IN-2026-' + Math.floor(10000 + Math.random() * 90000))
      }
    }));
    addToast('National Organ Donation intention updated successfully', 'success');
  };

  const revokeOrganPledge = () => {
    setState(prev => ({
      ...prev,
      organPledge: {
        ...prev.organPledge,
        isRegistered: false
      }
    }));
    addToast('Organ donation registration revoked', 'info');
  };

  // Update Profile
  const updateUserProfile = (updatedFields) => {
    setState(prev => ({
      ...prev,
      user: { ...prev.user, ...updatedFields }
    }));
    addToast('Profile information saved', 'success');
  };

  // Request blood donor
  const requestBloodDonor = (donorName) => {
    addToast(`Emergency blood request relayed to ${donorName}`, 'success');
  };

  return (
    <HealthWalletContext.Provider
      value={{
        ...state,
        toasts,
        addToast,
        removeToast,
        navigate,
        setLanguage,
        loginUser,
        logoutUser,
        addHealthRecord,
        deleteHealthRecord,
        toggleMedicineTaken,
        addFamilyMember,
        activateEmergency,
        cancelEmergency,
        toggleOfflineSimulation,
        updateOrganPledge,
        revokeOrganPledge,
        updateUserProfile,
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
