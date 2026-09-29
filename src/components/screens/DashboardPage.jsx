import React, { useState } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import { Modal } from '../common/Modal';
import {
  DropletIcon,
  AlertTriangleIcon,
  PillIcon,
  UsersIcon,
  CameraIcon,
  FileTextIcon,
  ArrowRightIcon,
  ClockIcon,
  DownloadIcon,
  PlusIcon,
  HeartHandshakeIcon
} from '../common/Icons';

export const DashboardPage = () => {
  const {
    user,
    healthWalletId,
    medicines = [],
    medicationLogs = {},
    familyMembers,
    organDonation,
    getOrganDonationStatus,
    navigate
  } = useHealthWallet();

  const organStatus = getOrganDonationStatus ? getOrganDonationStatus() : (organDonation?.status || 'Not Registered');

  const [selectedRecord, setSelectedRecord] = useState(null);

  // Reference sample recent reports (matching Panel 2)
  const recentReports = [
    {
      id: 'rep-1',
      title: 'Blood Test - Complete Profile',
      hospital: 'Apollo Hospital',
      date: '12 Mar 2024',
      category: 'Lab Reports',
      iconColor: '#dc2626',
      iconBg: '#fee2e2',
      summary: 'Complete Blood Count (CBC) normal. Hemoglobin: 14.2 g/dL, RBC: 4.8 mil/uL, Platelets: 240,000 /uL.'
    },
    {
      id: 'rep-2',
      title: 'Chest X-Ray',
      hospital: 'Government Hospital',
      date: '02 Jan 2024',
      category: 'Imaging',
      iconColor: '#2563eb',
      iconBg: '#dbeafe',
      summary: 'PA view normal. No focal lung consolidation or pleural effusion noted.'
    },
    {
      id: 'rep-3',
      title: 'Diabetes Checkup',
      hospital: 'Kauvery Hospital',
      date: '18 Nov 2023',
      category: 'Lab Reports',
      iconColor: '#059669',
      iconBg: '#d1fae5',
      summary: 'Fasting Blood Glucose: 92 mg/dL. HbA1c: 5.4% (Optimal non-diabetic range).'
    }
  ];

  const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const activeMeds = medicines.filter(m => (m.status || 'Active') === 'Active');

  const todayDoses = [];
  activeMeds.forEach(m => {
    const scheduledTime = m.frequency === 'Twice Daily' ? '08:00 AM' : (m.frequency === 'Once Daily' ? '08:00 AM' : '08:00 AM');
    const logKey = `${todayStr}-${m.id}-${scheduledTime}`;
    const status = medicationLogs[logKey] || (m.takenToday ? 'Taken' : 'Pending');
    todayDoses.push({
      id: m.id,
      name: m.name,
      dosage: m.dosage,
      scheduledTime,
      status
    });
  });
  const displayMeds = todayDoses.slice(0, 3);

  return (
    <div>
      {/* 1. Header (Panel 2 Reference) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            Good Morning, {user?.fullName ? user.fullName.split(' ')[0] : 'Citizen'}!
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0 }}>
            Your health information is safe and accessible.
          </p>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '20px',
            background: 'var(--hw-primary-light, #eff6ff)',
            border: '1px solid var(--hw-primary-border, #bfdbfe)'
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--hw-primary)' }}>ID:</span>
          <span style={{ fontFamily: 'var(--hw-font-mono, monospace)', fontSize: '13px', fontWeight: 700, color: 'var(--hw-primary)' }}>
            {healthWalletId}
          </span>
        </div>
      </div>

      {/* 2. 4 Stat Overview Cards in a Horizontal Row (Panel 2 Reference) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {/* Blood Group */}
        <div className="hw-stat-card-ref">
          <div className="hw-stat-card-top">
            <span className="hw-stat-label-ref">Blood Group</span>
            <div className="hw-stat-icon-box" style={{ background: '#fee2e2', color: '#dc2626' }}>
              <DropletIcon size={20} />
            </div>
          </div>
          <div className="hw-stat-value-ref" style={{ color: '#dc2626' }}>
            {user.bloodGroup}
          </div>
        </div>

        {/* Allergies */}
        <div className="hw-stat-card-ref">
          <div className="hw-stat-card-top">
            <span className="hw-stat-label-ref">Allergies</span>
            <div className="hw-stat-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
              <AlertTriangleIcon size={20} />
            </div>
          </div>
          <div className="hw-stat-value-ref">
            {user.allergies.length}
          </div>
        </div>

        {/* Current Medicines */}
        <div className="hw-stat-card-ref">
          <div className="hw-stat-card-top">
            <span className="hw-stat-label-ref">Current Medicines</span>
            <div className="hw-stat-icon-box" style={{ background: '#d1fae5', color: '#059669' }}>
              <PillIcon size={20} />
            </div>
          </div>
          <div className="hw-stat-value-ref">
            {medicines.length}
          </div>
        </div>

        {/* Family Members */}
        <div className="hw-stat-card-ref">
          <div className="hw-stat-card-top">
            <span className="hw-stat-label-ref">Family Members</span>
            <div className="hw-stat-icon-box" style={{ background: '#dbeafe', color: '#2563eb' }}>
              <UsersIcon size={20} />
            </div>
          </div>
          <div className="hw-stat-value-ref">
            {familyMembers.length}
          </div>
        </div>
      </div>

      {/* 3. Main Healthcare Information Banner (Panel 2 Reference) */}
      <div className="hw-emergency-banner-ref">
        <div>
          <h2 className="hw-emergency-banner-title">
            Be Prepared. Always.
          </h2>
          <p className="hw-emergency-banner-desc">
            Your health information can save lives in an emergency.
          </p>
          <button
            type="button"
            className="hw-btn hw-btn-danger"
            onClick={() => navigate('emergency')}
          >
            <span>Emergency Assistance</span>
            <ArrowRightIcon size={16} />
          </button>
        </div>

        {/* First-Aid Kit Vector Graphic from Reference */}
        <div style={{ flexShrink: 0 }} aria-hidden="true">
          <svg width="120" height="90" viewBox="0 0 120 90" fill="none">
            {/* Box Body */}
            <rect x="15" y="24" width="90" height="60" rx="10" fill="#2563eb" />
            <rect x="18" y="27" width="84" height="54" rx="8" fill="#3b82f6" />
            {/* Handle */}
            <path d="M44 24 V14 C44 10 48 6 52 6 H68 C72 6 76 10 76 14 V24" stroke="#1d4ed8" strokeWidth="6" strokeLinecap="round" />
            {/* White Cross */}
            <rect x="54" y="40" width="12" height="28" rx="2" fill="#ffffff" />
            <rect x="46" y="48" width="28" height="12" rx="2" fill="#ffffff" />
            {/* Subtle Star Sparkles */}
            <path d="M102 14 L104 8 L110 6 L104 4 L102 -2 L100 4 L94 6 L100 8 Z" fill="#93c5fd" />
            <path d="M10 50 L12 46 L16 44 L12 42 L10 38 L8 42 L4 44 L8 46 Z" fill="#93c5fd" />
          </svg>
        </div>
      </div>

      {/* 4. Split Row: Recent Reports & Timeline / Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Recent Reports List (Panel 2 Reference) */}
        <div className="hw-card">
          <div className="hw-card-header">
            <h3 className="hw-card-title">Recent Reports</h3>
            <button
              type="button"
              className="hw-btn hw-btn-ghost hw-btn-sm"
              style={{ color: 'var(--hw-primary)', fontWeight: 600, padding: '4px 8px' }}
              onClick={() => navigate('records')}
            >
              View All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentReports.map((report) => (
              <div key={report.id} className="hw-record-row-ref">
                <div className="hw-record-row-left">
                  <div className="hw-record-icon-box" style={{ background: report.iconBg, color: report.iconColor }}>
                    <FileTextIcon size={20} />
                  </div>
                  <div>
                    <div className="hw-record-name">{report.title}</div>
                    <div className="hw-record-meta">{report.hospital}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--hw-text-muted)', whiteSpace: 'nowrap' }}>
                    {report.date}
                  </span>
                  <button
                    type="button"
                    className="hw-btn hw-btn-view"
                    onClick={() => setSelectedRecord(report)}
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Health Timeline & Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Quick Actions Card */}
          <div className="hw-card">
            <h3 className="hw-card-title" style={{ marginBottom: '14px' }}>Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <button
                type="button"
                className="hw-btn hw-btn-secondary hw-btn-sm"
                style={{ justifyContent: 'flex-start' }}
                onClick={() => navigate('scan')}
              >
                <CameraIcon size={15} color="var(--hw-primary)" />
                <span>Scan Report</span>
              </button>

              <button
                type="button"
                className="hw-btn hw-btn-secondary hw-btn-sm"
                style={{ justifyContent: 'flex-start' }}
                onClick={() => navigate('records')}
              >
                <PlusIcon size={15} color="var(--hw-primary)" />
                <span>Add Record</span>
              </button>

              <button
                type="button"
                className="hw-btn hw-btn-secondary hw-btn-sm"
                style={{ justifyContent: 'flex-start' }}
                onClick={() => navigate('family')}
              >
                <UsersIcon size={15} color="var(--hw-primary)" />
                <span>Family</span>
              </button>

              <button
                type="button"
                className="hw-btn hw-btn-secondary hw-btn-sm"
                style={{ justifyContent: 'flex-start' }}
                onClick={() => navigate('blood-donation')}
              >
                <DropletIcon size={15} color="var(--hw-danger)" />
                <span>Blood Donors</span>
              </button>
            </div>
          </div>

          {/* Today's Medicines Card (Requirement 11) */}
          <div className="hw-card">
            <div className="hw-card-header" style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PillIcon size={16} />
                </div>
                <h3 className="hw-card-title" style={{ fontSize: '15px', margin: 0 }}>
                  Today's Medicines
                </h3>
              </div>
              <button
                type="button"
                className="hw-btn hw-btn-ghost hw-btn-sm"
                style={{ color: 'var(--hw-primary)', fontWeight: 600, padding: '4px 8px', fontSize: '12px' }}
                onClick={() => navigate('medicines')}
              >
                View All Medicines
              </button>
            </div>

            {displayMeds.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)', textAlign: 'center', padding: '12px 0' }}>
                No active medicines recorded today.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {displayMeds.map((med, idx) => (
                  <div
                    key={`${med.id}-${idx}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '15px' }} role="img" aria-label="Medicine">💊</span>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--hw-text-main)' }}>
                          {med.name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)' }}>
                          {med.dosage} · {med.scheduledTime}
                        </div>
                      </div>
                    </div>

                    <div>
                      {med.status === 'Taken' && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: '#ecfdf5',
                            color: '#047857',
                            border: '1px solid #a7f3d0'
                          }}
                        >
                          ✓ Taken
                        </span>
                      )}
                      {med.status === 'Skipped' && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: '#fffbeb',
                            color: '#d97706',
                            border: '1px solid #fde68a'
                          }}
                        >
                          — Skipped
                        </span>
                      )}
                      {med.status === 'Pending' && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: '#f1f5f9',
                            color: '#64748b',
                            border: '1px solid #cbd5e1'
                          }}
                        >
                          ○ Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Family Health Card (Requirement 13) */}
          <div className="hw-card">
            <div className="hw-card-header" style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UsersIcon size={16} />
                </div>
                <h3 className="hw-card-title" style={{ fontSize: '15px', margin: 0 }}>
                  Family Health
                </h3>
              </div>
              <button
                type="button"
                className="hw-btn hw-btn-ghost hw-btn-sm"
                style={{ color: 'var(--hw-primary)', fontWeight: 600, padding: '4px 8px', fontSize: '12px' }}
                onClick={() => navigate('family')}
              >
                Manage Family
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center', padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)' }}>Family Members</div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--hw-text-main)', marginTop: '2px' }}>
                  {familyMembers.length}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#047857' }}>Linked</div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: '#047857', marginTop: '2px' }}>
                  {familyMembers.filter(m => m.consentStatus === 'granted').length}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#d97706' }}>Pending Consent</div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: '#d97706', marginTop: '2px' }}>
                  {familyMembers.filter(m => m.consentStatus === 'pending').length}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="hw-btn hw-btn-secondary hw-btn-sm"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => navigate('family')}
            >
              Manage Family
            </button>
          </div>

          {/* Organ Donation Card (Requirement 13) */}
          <div className="hw-card">
            <div className="hw-card-header" style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#eff6ff', color: 'var(--hw-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HeartHandshakeIcon size={16} />
                </div>
                <h3 className="hw-card-title" style={{ fontSize: '15px', margin: 0 }}>
                  Organ Donation
                </h3>
              </div>
              <button
                type="button"
                className="hw-btn hw-btn-ghost hw-btn-sm"
                style={{ color: 'var(--hw-primary)', fontWeight: 600, padding: '4px 8px', fontSize: '12px' }}
                onClick={() => navigate('organ-donation')}
              >
                {organStatus === 'Registered' ? 'Manage' : 'Register Intent'}
              </button>
            </div>

            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--hw-text-main)' }}>
                  {organStatus === 'Registered'
                    ? 'Donation intent registered'
                    : organStatus === 'Withdrawn'
                    ? 'Donation intent withdrawn'
                    : 'Donation intent not registered'}
                </span>
                {organStatus === 'Registered' && (
                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '6px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                    ✓ Registered
                  </span>
                )}
                {organStatus === 'Withdrawn' && (
                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '6px', background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }}>
                    Withdrawn
                  </span>
                )}
                {organStatus === 'Not Registered' && (
                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '6px', background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1' }}>
                    Not Registered
                  </span>
                )}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--hw-text-muted)', margin: 0 }}>
                {organStatus === 'Registered'
                  ? 'Voluntary intent recorded in Health Wallet.'
                  : organStatus === 'Withdrawn'
                  ? 'Voluntary intent currently marked as withdrawn.'
                  : 'Record your voluntary organ donation preferences in your Health Wallet.'}
              </p>
            </div>

            <button
              type="button"
              className="hw-btn hw-btn-secondary hw-btn-sm"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => navigate('organ-donation')}
            >
              {organStatus === 'Registered' ? 'Manage' : 'Register Intent'}
            </button>
          </div>

          {/* Health Timeline */}
          <div className="hw-card">
            <div className="hw-card-header" style={{ marginBottom: '12px' }}>
              <h3 className="hw-card-title" style={{ fontSize: '15px' }}>
                <ClockIcon size={16} color="var(--hw-primary)" />
                <span>Health Timeline</span>
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--hw-primary)', marginTop: '4px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--hw-text-main)' }}>Complete Blood Profile</div>
                  <div style={{ color: 'var(--hw-text-muted)' }}>12 Mar 2024 • Apollo Hospital</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--hw-green)', marginTop: '4px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--hw-text-main)' }}>Chest X-Ray Examination</div>
                  <div style={{ color: 'var(--hw-text-muted)' }}>02 Jan 2024 • Government Hospital</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--hw-teal)', marginTop: '4px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--hw-text-main)' }}>Diabetes Checkup</div>
                  <div style={{ color: 'var(--hw-text-muted)' }}>18 Nov 2023 • Kauvery Hospital</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Record View Modal */}
      {selectedRecord && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedRecord(null)}
          title={selectedRecord.title}
          footer={
            <>
              <button
                type="button"
                className="hw-btn hw-btn-secondary"
                onClick={() => setSelectedRecord(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="hw-btn hw-btn-primary"
                onClick={() => alert(`Downloading record: ${selectedRecord.title}.pdf`)}
              >
                <DownloadIcon size={15} />
                <span>Download Report</span>
              </button>
            </>
          }
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--hw-border)', marginBottom: '14px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>Provider</div>
                <strong style={{ fontSize: '14px', color: 'var(--hw-text-main)' }}>{selectedRecord.hospital}</strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)', textTransform: 'uppercase' }}>Date</div>
                <strong style={{ fontSize: '13px', color: 'var(--hw-text-main)' }}>{selectedRecord.date}</strong>
              </div>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--hw-text-body)', lineHeight: '1.6', background: 'var(--hw-bg)', padding: '12px', borderRadius: '8px' }}>
              {selectedRecord.summary}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
