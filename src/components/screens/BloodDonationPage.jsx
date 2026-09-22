import React, { useState } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  DropletIcon,
  HeartIcon,
  MapPinIcon,
  SearchIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  ClockIcon,
  PlusIcon,
  ArrowRightIcon
} from '../common/Icons';

export const BloodDonationPage = () => {
  const { nearbyBloodDonors, user, requestBloodDonor, addToast } = useHealthWallet();

  const [selectedBloodGroup, setSelectedBloodGroup] = useState('O+');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showRegisterDonorModal, setShowRegisterDonorModal] = useState(false);
  const [activeTab, setActiveTab] = useState('donors'); // 'donors' | 'my-requests'

  // Requirement Creation State
  const [bloodReq, setBloodReq] = useState({
    bloodGroup: 'O+',
    hospital: 'Government General Hospital, Chennai',
    units: '2',
    urgency: 'Immediate (Critical)',
    patientName: 'Kavin Rajan',
    contactNumber: '+91 98765 43210'
  });

  const [activeRequests, setActiveRequests] = useState([
    {
      id: 'req-1',
      bloodGroup: 'O+',
      units: '2 Units Packed RBC',
      hospital: 'Government General Hospital, Emergency Ward',
      urgency: 'Urgent',
      status: 'Relayed to 4 Donors',
      timestamp: 'Today, 10:15 AM'
    }
  ]);

  const bloodGroups = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const filteredDonors = nearbyBloodDonors.filter(d =>
    selectedBloodGroup === 'All' || d.bloodGroup === selectedBloodGroup
  );

  const handleCreateRequest = (e) => {
    e.preventDefault();
    const newReq = {
      id: 'req-' + Date.now(),
      bloodGroup: bloodReq.bloodGroup,
      units: `${bloodReq.units} Units`,
      hospital: bloodReq.hospital,
      urgency: bloodReq.urgency,
      status: 'Relayed to Matching Donors',
      timestamp: 'Just now'
    };
    setActiveRequests([newReq, ...activeRequests]);
    setShowRequestModal(false);
    addToast('Emergency blood request broadcast to verified nearby donors', 'danger');
  };

  return (
    <div>
      {/* Page Header */}
      <div className="hw-page-header">
        <div className="hw-page-header-text">
          <h1>Blood Donation & Matching</h1>
          <p>Find compatible blood donors in emergencies or register your pledge to save lives.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="danger" icon={DropletIcon} onClick={() => setShowRequestModal(true)}>
            Request Emergency Blood
          </Button>
          <Button variant="teal" icon={HeartIcon} onClick={() => setShowRegisterDonorModal(true)}>
            Register as Donor
          </Button>
        </div>
      </div>

      {/* Dual Action Hero Cards */}
      <div className="hw-grid-2" style={{ marginBottom: '28px' }}>
        <div className="hw-card" style={{ background: 'linear-gradient(135deg, #ffffff 0%, var(--hw-danger-light) 100%)', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--hw-danger)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DropletIcon size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#991b1b', margin: 0 }}>Need Blood?</h3>
              <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0 }}>Broadcast urgent blood requests to nearby verified donors</p>
            </div>
          </div>
          <Button variant="danger" size="sm" onClick={() => setShowRequestModal(true)}>
            Search & Request Donors
          </Button>
        </div>

        <div className="hw-card" style={{ background: 'linear-gradient(135deg, #ffffff 0%, var(--hw-green-light) 100%)', border: '1px solid rgba(5, 150, 105, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--hw-green)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HeartIcon size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#065f46', margin: 0 }}>Want to Donate?</h3>
              <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0 }}>Join the public health voluntary donor network</p>
            </div>
          </div>
          <Button variant="teal" size="sm" onClick={() => setShowRegisterDonorModal(true)}>
            Register as Volunteer
          </Button>
        </div>
      </div>

      {/* Tabs: Nearby Donors vs Active Requests */}
      <div className="hw-tabs">
        <button
          type="button"
          className={`hw-tab-btn ${activeTab === 'donors' ? 'active' : ''}`}
          onClick={() => setActiveTab('donors')}
        >
          <DropletIcon size={16} />
          <span>Nearby Matching Donors ({filteredDonors.length})</span>
        </button>
        <button
          type="button"
          className={`hw-tab-btn ${activeTab === 'my-requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-requests')}
        >
          <ClockIcon size={16} />
          <span>Active Blood Requests ({activeRequests.length})</span>
        </button>
      </div>

      {activeTab === 'donors' ? (
        <div>
          {/* Blood Group Filter Pills */}
          <div className="hw-card" style={{ padding: '14px 18px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--hw-text-main)' }}>Filter by Blood Group:</span>
              <div className="hw-pills">
                {bloodGroups.map(bg => (
                  <button
                    key={bg}
                    type="button"
                    className={`hw-pill-btn ${selectedBloodGroup === bg ? 'active' : ''}`}
                    onClick={() => setSelectedBloodGroup(bg)}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Donors List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredDonors.map(donor => (
              <div
                key={donor.id}
                className="hw-card hw-card-hover"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  gap: '16px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '240px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--hw-danger-light)',
                      color: 'var(--hw-danger)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '18px'
                    }}
                  >
                    {donor.bloodGroup}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--hw-text-main)', margin: 0 }}>
                        {donor.name}
                      </h3>
                      {donor.verified && (
                        <span className="hw-badge hw-badge-teal">
                          <CheckCircleIcon size={11} /> Verified Donor
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--hw-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPinIcon size={13} />
                      <span>{donor.distance} • {donor.location}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--hw-text-muted)' }}>
                    Last Donated: <strong>{donor.lastDonated}</strong>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => requestBloodDonor(donor.name)}
                  >
                    Request Donor
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Active Requests View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {activeRequests.map(req => (
            <div key={req.id} className="hw-card" style={{ borderLeft: '4px solid var(--hw-danger)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="hw-badge hw-badge-danger">{req.bloodGroup}</span>
                    <strong style={{ fontSize: '15px', color: 'var(--hw-text-main)' }}>{req.units} Required</strong>
                    <span className="hw-badge hw-badge-warning">{req.urgency}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--hw-text-muted)' }}>
                    {req.hospital}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="hw-badge hw-badge-teal">{req.status}</span>
                  <div style={{ fontSize: '11px', color: 'var(--hw-text-subtle)', marginTop: '4px' }}>{req.timestamp}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Emergency Request Modal */}
      {showRequestModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowRequestModal(false)}
          title="Create Emergency Blood Requirement"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowRequestModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" icon={DropletIcon} onClick={handleCreateRequest}>
                Broadcast Emergency Request
              </Button>
            </>
          }
        >
          <form onSubmit={handleCreateRequest}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="hw-form-group">
                <label className="hw-label hw-label-required">Blood Group Needed</label>
                <select
                  className="hw-select"
                  value={bloodReq.bloodGroup}
                  onChange={(e) => setBloodReq({ ...bloodReq, bloodGroup: e.target.value })}
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div className="hw-form-group">
                <label className="hw-label hw-label-required">Units Required</label>
                <input
                  type="number"
                  className="hw-input"
                  min="1"
                  max="10"
                  value={bloodReq.units}
                  onChange={(e) => setBloodReq({ ...bloodReq, units: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="hw-form-group">
              <label className="hw-label hw-label-required">Hospital & Department</label>
              <input
                type="text"
                className="hw-input"
                placeholder="e.g. Govt General Hospital, Trauma ICU"
                value={bloodReq.hospital}
                onChange={(e) => setBloodReq({ ...bloodReq, hospital: e.target.value })}
                required
              />
            </div>

            <div className="hw-form-group">
              <label className="hw-label hw-label-required">Urgency Degree</label>
              <select
                className="hw-select"
                value={bloodReq.urgency}
                onChange={(e) => setBloodReq({ ...bloodReq, urgency: e.target.value })}
              >
                <option value="Immediate (Critical - Within 1 hour)">Immediate (Critical - Within 1 hour)</option>
                <option value="Urgent (Within 4-6 hours)">Urgent (Within 4-6 hours)</option>
                <option value="Scheduled (Surgery within 24 hours)">Scheduled (Surgery within 24 hours)</option>
              </select>
            </div>

            <div className="hw-form-group">
              <label className="hw-label hw-label-required">Attending Attendant Phone</label>
              <input
                type="tel"
                className="hw-input"
                value={bloodReq.contactNumber}
                onChange={(e) => setBloodReq({ ...bloodReq, contactNumber: e.target.value })}
                required
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Register as Donor Modal */}
      {showRegisterDonorModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowRegisterDonorModal(false)}
          title="Register as Voluntary Blood Donor"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowRegisterDonorModal(false)}>
                Cancel
              </Button>
              <Button
                variant="teal"
                icon={CheckCircleIcon}
                onClick={() => {
                  setShowRegisterDonorModal(false);
                  addToast('Registered in National Voluntary Blood Donor Registry', 'success');
                }}
              >
                Confirm Donor Registration
              </Button>
            </>
          }
        >
          <div>
            <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', marginBottom: '16px' }}>
              Confirm your voluntary willingness to donate blood during regional emergency shortages.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              <label className="hw-checkbox-label">
                <input type="checkbox" className="hw-checkbox" defaultChecked />
                <span>I am between 18 and 65 years of age and weigh 45kg or above.</span>
              </label>
              <label className="hw-checkbox-label">
                <input type="checkbox" className="hw-checkbox" defaultChecked />
                <span>It has been at least 3 months since my last whole blood donation.</span>
              </label>
              <label className="hw-checkbox-label">
                <input type="checkbox" className="hw-checkbox" defaultChecked />
                <span>I have no active chronic cardiovascular, blood-borne, or renal conditions.</span>
              </label>
            </div>

            <div className="hw-alert hw-alert-info">
              <span style={{ fontSize: '12px' }}>
                Your contact details remain anonymized. You will receive an SMS alert only when an emergency patient within 10 km matches your blood group ({user.bloodGroup}).
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
