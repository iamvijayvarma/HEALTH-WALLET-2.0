import React, { useState } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  DropletIcon,
  AlertTriangleIcon,
  PillIcon,
  UsersIcon,
  CameraIcon,
  FileTextIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  ShieldIcon,
  DownloadIcon,
  EyeIcon,
  PlusIcon
} from '../common/Icons';

export const DashboardPage = () => {
  const {
    user,
    healthRecords,
    medicines,
    familyMembers,
    navigate,
    deleteHealthRecord,
    isOfflineSimulated
  } = useHealthWallet();

  const [selectedRecord, setSelectedRecord] = useState(null);

  return (
    <div>
      {/* Page Welcome Header */}
      <div className="hw-page-header">
        <div className="hw-page-header-text">
          <h1>Good Morning, {user.fullName.split(' ')[0]}!</h1>
          <p>Your health information is verified, safe, and accessible anywhere.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="secondary" icon={CameraIcon} onClick={() => navigate('scan')}>
            Scan Report (AI)
          </Button>
          <Button variant="primary" icon={PlusIcon} onClick={() => navigate('records')}>
            Add Record
          </Button>
        </div>
      </div>

      {/* 4 Health Overview Stat Cards */}
      <div className="hw-grid-4" style={{ marginBottom: '24px' }}>
        {/* Blood Group */}
        <div className="hw-stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('blood-donation')}>
          <div className="hw-stat-icon-wrapper" style={{ backgroundColor: 'var(--hw-danger-light)', color: 'var(--hw-danger)' }}>
            <DropletIcon size={24} />
          </div>
          <div className="hw-stat-info">
            <span className="hw-stat-label">Blood Group</span>
            <span className="hw-stat-value" style={{ color: 'var(--hw-danger)' }}>{user.bloodGroup}</span>
          </div>
        </div>

        {/* Allergies */}
        <div className="hw-stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('settings')}>
          <div className="hw-stat-icon-wrapper" style={{ backgroundColor: 'var(--hw-warning-light)', color: 'var(--hw-warning)' }}>
            <AlertTriangleIcon size={24} />
          </div>
          <div className="hw-stat-info">
            <span className="hw-stat-label">Active Allergies</span>
            <span className="hw-stat-value" style={{ color: 'var(--hw-warning)' }}>{user.allergies.length}</span>
          </div>
        </div>

        {/* Current Medicines */}
        <div className="hw-stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('medicines')}>
          <div className="hw-stat-icon-wrapper" style={{ backgroundColor: 'var(--hw-teal-light)', color: 'var(--hw-teal)' }}>
            <PillIcon size={24} />
          </div>
          <div className="hw-stat-info">
            <span className="hw-stat-label">Current Medicines</span>
            <span className="hw-stat-value" style={{ color: 'var(--hw-teal)' }}>{medicines.length}</span>
          </div>
        </div>

        {/* Family Members */}
        <div className="hw-stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('family')}>
          <div className="hw-stat-icon-wrapper" style={{ backgroundColor: 'var(--hw-primary-light)', color: 'var(--hw-primary)' }}>
            <UsersIcon size={24} />
          </div>
          <div className="hw-stat-info">
            <span className="hw-stat-label">Family Members</span>
            <span className="hw-stat-value" style={{ color: 'var(--hw-primary)' }}>{familyMembers.length}</span>
          </div>
        </div>
      </div>

      {/* Main Emergency Assistance Callout Banner */}
      <div
        className="hw-card"
        style={{
          background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)',
          border: '1px solid rgba(220, 38, 38, 0.2)',
          padding: '24px 28px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '12px',
              backgroundColor: '#fee2e2',
              color: 'var(--hw-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <AlertTriangleIcon size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#991b1b', margin: '0 0 4px 0' }}>
              Be Prepared. Always.
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--hw-text-body)', margin: 0, maxWidth: '580px' }}>
              Your emergency profile can save lives. Keep critical allergies, contacts, and medications updated for instant first-responder triage.
            </p>
          </div>
        </div>

        <Button
          variant="danger"
          size="md"
          icon={ArrowRightIcon}
          iconPosition="right"
          onClick={() => navigate('emergency')}
        >
          Emergency Assistance
        </Button>
      </div>

      {/* Split Row: Recent Reports & Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', marginBottom: '28px' }}>
        {/* Recent Health Records */}
        <div className="hw-card">
          <div className="hw-card-header">
            <h3 className="hw-card-title">
              <FileTextIcon size={18} color="var(--hw-primary)" />
              <span>Recent Health Records</span>
            </h3>
            <button
              type="button"
              className="hw-btn hw-btn-ghost hw-btn-sm"
              style={{ color: 'var(--hw-primary)', fontWeight: 600 }}
              onClick={() => navigate('records')}
            >
              View All ({healthRecords.length})
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {healthRecords.slice(0, 4).map((record) => (
              <div
                key={record.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--hw-border)',
                  backgroundColor: '#ffffff',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      backgroundColor: record.category === 'Lab Reports' ? 'var(--hw-teal-light)' : record.category === 'Imaging' ? 'var(--hw-primary-light)' : 'var(--hw-bg-subtle)',
                      color: record.category === 'Lab Reports' ? 'var(--hw-teal)' : record.category === 'Imaging' ? 'var(--hw-primary)' : 'var(--hw-text-body)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <FileTextIcon size={18} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--hw-text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {record.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)' }}>
                      {record.hospital} • {record.date}
                    </div>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedRecord(record)}
                >
                  View
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Health Timeline */}
        <div className="hw-card">
          <div className="hw-card-header">
            <h3 className="hw-card-title">
              <ClockIcon size={18} color="var(--hw-primary)" />
              <span>Health Timeline</span>
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--hw-text-muted)' }}>Last 6 months</span>
          </div>

          <div style={{ position: 'relative', paddingLeft: '20px' }}>
            {/* Timeline vertical bar */}
            <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', backgroundColor: 'var(--hw-border)' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-20px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--hw-green)', border: '2px solid #ffffff' }} />
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--hw-text-main)' }}>Complete Blood Count (CBC)</div>
                <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)' }}>18 Sep 2026 • Apollo Hospitals</div>
                <p style={{ fontSize: '12px', color: 'var(--hw-text-body)', margin: '4px 0 0 0' }}>All clinical values normal. Hemoglobin 14.2 g/dL.</p>
              </div>

              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-20px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--hw-primary)', border: '2px solid #ffffff' }} />
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--hw-text-main)' }}>Chest X-Ray Examination</div>
                <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)' }}>02 Aug 2026 • Govt. General Hospital</div>
                <p style={{ fontSize: '12px', color: 'var(--hw-text-body)', margin: '4px 0 0 0' }}>Clear lung fields, no focal pathology detected.</p>
              </div>

              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-20px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--hw-teal)', border: '2px solid #ffffff' }} />
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--hw-text-main)' }}>Blood Glucose Screen</div>
                <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)' }}>14 May 2026 • Kauvery Hospital</div>
                <p style={{ fontSize: '12px', color: 'var(--hw-text-body)', margin: '4px 0 0 0' }}>HbA1c 5.4% (Optimal non-diabetic range).</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Action Pills Bar */}
      <div className="hw-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldIcon size={18} color="var(--hw-primary)" />
          <strong style={{ fontSize: '13px', color: 'var(--hw-text-main)' }}>Citizen Health Quick Actions:</strong>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button variant="secondary" size="sm" icon={CameraIcon} onClick={() => navigate('scan')}>
            Scan Lab Report
          </Button>
          <Button variant="secondary" size="sm" icon={PlusIcon} onClick={() => navigate('records')}>
            Add Record
          </Button>
          <Button variant="secondary" size="sm" icon={UsersIcon} onClick={() => navigate('family')}>
            Family Circle
          </Button>
          <Button variant="secondary" size="sm" icon={DropletIcon} onClick={() => navigate('blood-donation')}>
            Find Blood Donors
          </Button>
          <Button variant="danger" size="sm" icon={AlertTriangleIcon} onClick={() => navigate('emergency')}>
            Emergency Pass
          </Button>
        </div>
      </div>

      {/* Record Details Modal */}
      {selectedRecord && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedRecord(null)}
          title={selectedRecord.title}
          footer={
            <>
              <Button variant="secondary" onClick={() => setSelectedRecord(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                icon={DownloadIcon}
                onClick={() => {
                  alert(`Downloading digitally signed report: ${selectedRecord.title}.pdf`);
                }}
              >
                Download Official PDF
              </Button>
            </>
          }
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--hw-border)' }}>
              <div>
                <span className="hw-badge hw-badge-primary" style={{ marginBottom: '6px' }}>{selectedRecord.category}</span>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--hw-text-main)' }}>{selectedRecord.hospital}</div>
                <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)' }}>Attending: {selectedRecord.doctor}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="hw-badge hw-badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircleIcon size={12} /> ABDM Verified
                </span>
                <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)', marginTop: '4px' }}>Date: {selectedRecord.date}</div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--hw-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Clinical Diagnostic Findings
              </h4>
              <div style={{ background: 'var(--hw-bg)', padding: '14px', borderRadius: '8px', border: '1px solid var(--hw-border)', fontSize: '13px', color: 'var(--hw-text-body)', lineHeight: '1.6' }}>
                {selectedRecord.summary}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {selectedRecord.tags.map((tag, i) => (
                <span key={i} className="hw-badge hw-badge-neutral">#{tag}</span>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
