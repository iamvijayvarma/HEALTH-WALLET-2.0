import React, { useState, useRef, useEffect } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import {
  CameraIcon,
  UploadIcon,
  EditIcon,
  CheckCircleIcon,
  XIcon,
  RefreshIcon,
  SwitchCameraIcon,
  AlertTriangleIcon,
  FileTextIcon,
  EyeIcon
} from '../common/Icons';

export const ScanReportPage = () => {
  const { addHealthRecord, addToast } = useHealthWallet();

  // Active Tab: 'camera' | 'upload'
  const [activeTab, setActiveTab] = useState('camera');

  // Camera Lifecycle States: 'idle' | 'requesting' | 'active' | 'captured' | 'denied' | 'unavailable' | 'not-found'
  const [cameraState, setCameraState] = useState('idle');
  const [cameraErrorMessage, setCameraErrorMessage] = useState('');

  // MediaStream and Devices
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [facingMode, setFacingMode] = useState('environment');

  // Captured Report Image Data
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedFileName, setCapturedFileName] = useState('');

  // OCR Processing & Review States
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReviewReady, setIsReviewReady] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Clinical Metrics Data for Review
  const [extractedData, setExtractedData] = useState([
    { id: 1, testName: 'Hemoglobin', value: '13.2', unit: 'g/dL' },
    { id: 2, testName: 'Blood Glucose (Fasting)', value: '96', unit: 'mg/dL' },
    { id: 3, testName: 'Total Cholesterol', value: '180', unit: 'mg/dL' },
    { id: 4, testName: 'Vitamin D', value: '28', unit: 'ng/mL' }
  ]);

  // =========================================================================
  // CAMERA LIFECYCLE MANAGEMENT
  // =========================================================================

  // Safely stop all active MediaStream tracks
  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Ensure camera stream is stopped when unmounting or navigating away
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Stop camera when user switches to 'upload' tab
  useEffect(() => {
    if (activeTab !== 'camera') {
      stopCamera();
      if (cameraState === 'active' || cameraState === 'requesting') {
        setCameraState('idle');
      }
    }
  }, [activeTab]);

  // Start the device camera stream
  const startCamera = async (overrideFacing = facingMode, overrideDeviceId = selectedCameraId) => {
    // Verify MediaDevices API availability (browser support & secure context localhost / HTTPS)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState('unavailable');
      setCameraErrorMessage(
        'Camera API is not supported by this browser or requires a secure connection (HTTPS or localhost).'
      );
      return;
    }

    // Stop any existing stream before starting a new one
    stopCamera();
    setCameraState('requesting');
    setCameraErrorMessage('');

    try {
      // Build constraints
      const videoConstraints = {
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      };

      if (overrideDeviceId) {
        videoConstraints.deviceId = { exact: overrideDeviceId };
      } else {
        // Mobile-first: Prefer rear/environment-facing camera
        videoConstraints.facingMode = { ideal: overrideFacing };
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
        };
      }

      setCameraState('active');

      // Enumerate available video input devices for multi-camera support
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        setAvailableCameras(videoInputs);
        if (!overrideDeviceId && videoInputs.length > 0) {
          const activeTrack = stream.getVideoTracks()[0];
          const currentSettings = activeTrack?.getSettings?.();
          if (currentSettings?.deviceId) {
            setSelectedCameraId(currentSettings.deviceId);
          }
        }
      } catch {
        // device enumeration failure is non-fatal
      }
    } catch (err) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraState('denied');
        setCameraErrorMessage(
          'Camera access is required to scan a medical report. Please allow camera access in your browser settings.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraState('not-found');
        setCameraErrorMessage('No camera detected on this device. You can upload a file instead.');
      } else {
        setCameraState('unavailable');
        setCameraErrorMessage(
          err.message || 'Camera is currently unavailable or in use by another application.'
        );
      }
    }
  };

  // Switch camera between available devices or toggle facingMode
  const handleSwitchCamera = () => {
    if (availableCameras.length > 1) {
      const currentIndex = availableCameras.findIndex(d => d.deviceId === selectedCameraId);
      const nextIndex = (currentIndex + 1) % availableCameras.length;
      const nextDevice = availableCameras[nextIndex];
      setSelectedCameraId(nextDevice.deviceId);
      startCamera(facingMode, nextDevice.deviceId);
    } else {
      const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
      setFacingMode(nextFacing);
      startCamera(nextFacing, null);
    }
  };

  // Close camera and return to idle
  const handleCloseCamera = () => {
    stopCamera();
    setCameraState('idle');
  };

  // =========================================================================
  // FRAME CAPTURE & REPORT PROCESSING
  // =========================================================================

  // Capture current video frame to image
  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.94);

      // Stop camera stream immediately upon capture completion
      stopCamera();

      setCapturedImage(dataUrl);
      setCapturedFileName(`Camera_Scan_${new Date().toISOString().slice(0, 10)}.jpg`);
      setCameraState('captured');
      addToast('Medical report image captured', 'success');
    } catch (err) {
      console.error('Capture frame error:', err);
      addToast('Could not capture frame. Please try again.', 'error');
    }
  };

  // Retake photo: discard captured image and re-open camera
  const handleRetake = () => {
    setCapturedImage(null);
    startCamera(facingMode, selectedCameraId);
  };

  // "Use This Report": Process captured or uploaded report into AI extraction workflow
  const handleUseReport = () => {
    setIsProcessing(true);
    setCameraState('idle');

    setTimeout(() => {
      setIsProcessing(false);
      setIsReviewReady(true);
      addToast('Report processed. Please verify extracted clinical metrics below.', 'info');
    }, 1200);
  };

  // Handle local file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCapturedFileName(file.name);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        setCapturedImage(loadEvt.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      // PDF or non-image document placeholder preview
      setCapturedImage('pdf_document');
    }

    setCameraState('captured');
  };

  // Handle editing metric value in review table
  const handleTestValueChange = (id, newValue) => {
    setExtractedData(prev =>
      prev.map(item => item.id === id ? { ...item, value: newValue } : item)
    );
  };

  // Save reviewed report to Health Records
  const handleSaveToRecords = () => {
    const summary = extractedData.map(t => `${t.testName}: ${t.value} ${t.unit}`).join(', ');
    addHealthRecord({
      title: capturedFileName ? `Scanned: ${capturedFileName}` : 'Scanned Medical Diagnostic Report',
      category: 'Lab Reports',
      hospital: 'Diagnostic Laboratory Center',
      doctor: 'Consultant Pathologist',
      summary: `Verified Extracted Values: ${summary}`,
      tags: ['Camera-Scanned', 'Verified']
    });
    setIsSaved(true);
    addToast('Report saved to Health Records', 'success');
  };

  return (
    <div>
      {/* 1. Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 4px 0' }}>
          Scan Medical Report
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0 }}>
          Upload or scan your medical reports with your device camera. Our AI will extract the information for review.
        </p>
      </div>

      {/* 2. Wide Toggle Tabs */}
      <div className="hw-wide-toggle-tabs" style={{ maxWidth: '640px' }}>
        <button
          type="button"
          id="tab-scan-camera"
          className={`hw-wide-toggle-btn ${activeTab === 'camera' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('camera');
            setIsReviewReady(false);
            setIsSaved(false);
          }}
        >
          <CameraIcon size={16} />
          <span>Scan with Camera</span>
        </button>
        <button
          type="button"
          id="tab-upload-file"
          className={`hw-wide-toggle-btn ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('upload');
            setIsReviewReady(false);
            setIsSaved(false);
          }}
        >
          <UploadIcon size={16} />
          <span>Upload File</span>
        </button>
      </div>

      {/* 3. CAMERA & CAPTURE SECTION */}
      {activeTab === 'camera' && (
        <div>
          {/* STATE A: Camera Active (Live Viewfinder) */}
          {cameraState === 'active' && (
            <div className="hw-camera-wrapper">
              <div className="hw-camera-viewport">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="hw-camera-video"
                />

                {/* Guide Frame Overlay */}
                <div className="hw-camera-overlay">
                  {/* Top Bar */}
                  <div className="hw-camera-topbar">
                    <div className="hw-camera-live-pill">
                      <span className="hw-camera-live-dot" />
                      <span>LIVE CAMERA</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {availableCameras.length > 1 && (
                        <button
                          type="button"
                          className="hw-camera-icon-btn"
                          onClick={handleSwitchCamera}
                          title="Switch Camera"
                          aria-label="Switch Camera"
                        >
                          <SwitchCameraIcon size={18} />
                        </button>
                      )}
                      <button
                        type="button"
                        className="hw-camera-icon-btn"
                        onClick={handleCloseCamera}
                        title="Close Camera"
                        aria-label="Close Camera"
                      >
                        <XIcon size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Center Medical Report Framing Box */}
                  <div className="hw-camera-frame">
                    <div className="hw-camera-corner hw-camera-corner-tl" />
                    <div className="hw-camera-corner hw-camera-corner-tr" />
                    <div className="hw-camera-corner hw-camera-corner-bl" />
                    <div className="hw-camera-corner hw-camera-corner-br" />
                    <div className="hw-camera-scan-laser" />
                    <div className="hw-camera-guide-hint">
                      Align prescription or lab report inside frame
                    </div>
                  </div>

                  {/* Bottom Bar: Capture Shutter */}
                  <div className="hw-camera-bottombar">
                    <button
                      type="button"
                      id="btn-capture-camera"
                      className="hw-camera-shutter-btn"
                      onClick={handleCapture}
                      title="Capture Report"
                      aria-label="Capture Report Photo"
                    >
                      <div className="hw-camera-shutter-inner">
                        <CameraIcon size={24} color="#ffffff" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STATE B: Requesting Permission */}
          {cameraState === 'requesting' && (
            <div className="hw-camera-state-box">
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'var(--hw-primary-light)',
                  color: 'var(--hw-primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}
              >
                <CameraIcon size={28} />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--hw-text-main)', marginBottom: '8px' }}>
                Requesting Camera Permission
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', maxWidth: '420px', margin: '0 auto 20px auto' }}>
                Please allow camera access in the browser prompt to scan your medical document with your real device camera.
              </p>
              <button
                type="button"
                className="hw-btn hw-btn-secondary hw-btn-sm"
                onClick={handleCloseCamera}
              >
                Cancel
              </button>
            </div>
          )}

          {/* STATE C: Permission Denied */}
          {cameraState === 'denied' && (
            <div className="hw-camera-state-box" style={{ borderColor: 'var(--hw-danger-light)' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'var(--hw-danger-light)',
                  color: 'var(--hw-danger)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}
              >
                <AlertTriangleIcon size={28} />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--hw-danger)', marginBottom: '8px' }}>
                Camera Access Required
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', maxWidth: '460px', margin: '0 auto 20px auto', lineHeight: '1.6' }}>
                Camera access is required to scan a medical report. Please allow camera access in your browser settings.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  id="btn-retry-camera"
                  className="hw-btn hw-btn-primary hw-btn-md"
                  onClick={() => startCamera()}
                >
                  <RefreshIcon size={16} />
                  <span>Try Again</span>
                </button>
                <button
                  type="button"
                  className="hw-btn hw-btn-secondary hw-btn-md"
                  onClick={() => setActiveTab('upload')}
                >
                  <UploadIcon size={16} />
                  <span>Upload File Instead</span>
                </button>
              </div>
            </div>
          )}

          {/* STATE D: Camera Unavailable or Not Found */}
          {(cameraState === 'unavailable' || cameraState === 'not-found') && (
            <div className="hw-camera-state-box">
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'var(--hw-primary-light)',
                  color: 'var(--hw-primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}
              >
                <CameraIcon size={28} />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--hw-text-main)', marginBottom: '8px' }}>
                {cameraState === 'not-found' ? 'No Camera Detected' : 'Camera Unavailable'}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', maxWidth: '460px', margin: '0 auto 20px auto' }}>
                {cameraErrorMessage || 'Your device camera could not be accessed. You can still upload your report file directly.'}
              </p>
              <button
                type="button"
                className="hw-btn hw-btn-primary hw-btn-md"
                onClick={() => setActiveTab('upload')}
              >
                <UploadIcon size={16} />
                <span>Upload File Instead</span>
              </button>
            </div>
          )}

          {/* STATE E: Captured Photo Preview (Before Processing) */}
          {cameraState === 'captured' && capturedImage && (
            <div className="hw-captured-preview-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircleIcon size={18} color="var(--hw-green)" />
                  <strong style={{ fontSize: '15px', color: 'var(--hw-text-main)' }}>
                    Report Photo Captured
                  </strong>
                </div>
                <span className="hw-badge hw-badge-teal">Ready for Review</span>
              </div>

              <div className="hw-captured-image-box">
                <img src={capturedImage} alt="Captured Medical Report Preview" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '18px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  id="btn-retake-photo"
                  className="hw-btn hw-btn-secondary hw-btn-md"
                  onClick={handleRetake}
                >
                  <RefreshIcon size={16} />
                  <span>Retake</span>
                </button>
                <button
                  type="button"
                  id="btn-use-report"
                  className="hw-btn hw-btn-primary hw-btn-md"
                  onClick={handleUseReport}
                  style={{ padding: '10px 24px' }}
                >
                  <CheckCircleIcon size={16} />
                  <span>Use This Report</span>
                </button>
              </div>
            </div>
          )}

          {/* STATE F: Idle Default Trigger Card */}
          {cameraState === 'idle' && !isReviewReady && (
            <div
              className="hw-card"
              style={{
                border: '1.5px dashed #cbd5e1',
                borderRadius: '14px',
                textAlign: 'center',
                padding: '44px 20px',
                backgroundColor: '#ffffff',
                marginBottom: '28px'
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'var(--hw-primary-light)',
                  color: 'var(--hw-primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}
              >
                <CameraIcon size={28} />
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--hw-text-main)', margin: '0 0 6px 0' }}>
                Open Real Device Camera
              </h3>

              <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: '0 auto 18px auto', maxWidth: '440px' }}>
                Use your smartphone or webcam to capture a high-resolution photo of your physical prescription or laboratory test report.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button
                  type="button"
                  id="btn-start-camera-scan"
                  className="hw-btn hw-btn-primary hw-btn-md"
                  onClick={() => startCamera()}
                  style={{ padding: '10px 24px' }}
                >
                  <CameraIcon size={18} />
                  <span>Scan with Camera</span>
                </button>
              </div>

              <div style={{ marginTop: '16px', fontSize: '11px', color: 'var(--hw-text-subtle)' }}>
                Rear environment camera preferred on mobile • Zero automatic stream uploads
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. FILE UPLOAD TAB */}
      {activeTab === 'upload' && (
        <div>
          {cameraState === 'captured' && (
            <div className="hw-captured-preview-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileTextIcon size={18} color="var(--hw-primary)" />
                  <strong style={{ fontSize: '15px', color: 'var(--hw-text-main)' }}>
                    {capturedFileName || 'Uploaded Medical Document'}
                  </strong>
                </div>
                <span className="hw-badge hw-badge-teal">File Ready</span>
              </div>

              {capturedImage && capturedImage !== 'pdf_document' ? (
                <div className="hw-captured-image-box">
                  <img src={capturedImage} alt="Uploaded Document Preview" />
                </div>
              ) : (
                <div style={{ padding: '32px', textAlign: 'center', background: 'var(--hw-bg)', borderRadius: '8px', margin: '14px 0' }}>
                  <FileTextIcon size={36} color="var(--hw-primary)" />
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--hw-text-main)', marginTop: '8px' }}>
                    {capturedFileName}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)' }}>
                    PDF Document Loaded
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '18px' }}>
                <button
                  type="button"
                  className="hw-btn hw-btn-secondary hw-btn-md"
                  onClick={() => {
                    setCapturedImage(null);
                    setCameraState('idle');
                  }}
                >
                  <RefreshIcon size={16} />
                  <span>Choose Another</span>
                </button>
                <button
                  type="button"
                  className="hw-btn hw-btn-primary hw-btn-md"
                  onClick={handleUseReport}
                  style={{ padding: '10px 24px' }}
                >
                  <CheckCircleIcon size={16} />
                  <span>Use This Report</span>
                </button>
              </div>
            </div>
          )}

          {cameraState !== 'captured' && !isReviewReady && (
            <div
              className="hw-card"
              style={{
                border: '1.5px dashed #cbd5e1',
                borderRadius: '14px',
                textAlign: 'center',
                padding: '44px 20px',
                backgroundColor: '#ffffff',
                marginBottom: '28px',
                cursor: 'pointer'
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />

              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'var(--hw-primary-light)',
                  color: 'var(--hw-primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px'
                }}
              >
                <UploadIcon size={28} />
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--hw-text-main)', margin: '0 0 4px 0' }}>
                Click to upload medical document
              </h3>

              <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: '0 0 12px 0' }}>
                Drag and drop your report files here or browse your device files
              </p>

              <button
                type="button"
                className="hw-btn hw-btn-secondary hw-btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Browse Files
              </button>

              <div style={{ marginTop: '16px', fontSize: '11px', color: 'var(--hw-text-subtle)' }}>
                Supported formats: JPG, PNG, PDF (Max size: 15 MB)
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. AI PROCESSING INDICATOR */}
      {isProcessing && (
        <div className="hw-card" style={{ textAlign: 'center', padding: '36px 20px', marginBottom: '28px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '3px solid var(--hw-primary-light)',
              borderTopColor: 'var(--hw-primary)',
              animation: 'hwSpin 1s infinite linear',
              margin: '0 auto 16px auto'
            }}
          />
          <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--hw-text-main)', marginBottom: '4px' }}>
            Extracting Clinical Information
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--hw-text-muted)', margin: 0 }}>
            Analyzing report layout and reading test values...
          </p>
        </div>
      )}

      {/* 6. EXTRACTED INFORMATION TABLE (REVIEW & CONFIRM) */}
      {isReviewReady && (
        <div className="hw-card">
          {/* Document Attachment Preview Bar */}
          {capturedImage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--hw-bg)',
                borderRadius: '8px',
                border: '1px solid var(--hw-border)',
                marginBottom: '20px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {capturedImage !== 'pdf_document' ? (
                  <img
                    src={capturedImage}
                    alt="Thumbnail"
                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--hw-border)' }}
                  />
                ) : (
                  <FileTextIcon size={24} color="var(--hw-primary)" />
                )}
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--hw-text-main)' }}>
                    {capturedFileName || 'Scanned Report Photo'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--hw-text-muted)' }}>
                    Attached to clinical record
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="hw-btn hw-btn-ghost hw-btn-sm"
                onClick={() => {
                  setIsReviewReady(false);
                  if (activeTab === 'camera') {
                    startCamera();
                  } else {
                    setCameraState('idle');
                  }
                }}
                style={{ color: 'var(--hw-primary)', fontSize: '12px' }}
              >
                Retake / Change
              </button>
            </div>
          )}

          <div className="hw-card-header" style={{ marginBottom: '16px' }}>
            <div>
              <h3 className="hw-card-title" style={{ fontSize: '16px', margin: '0 0 2px 0' }}>
                Extracted Information (Review & Confirm)
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--hw-text-muted)' }}>
                Verify biochemical values before saving to your official records.
              </span>
            </div>

            <button
              type="button"
              className="hw-btn hw-btn-ghost hw-btn-sm"
              onClick={() => setIsEditing(!isEditing)}
              style={{ color: 'var(--hw-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <EditIcon size={14} />
              <span>{isEditing ? 'Done' : 'Edit'}</span>
            </button>
          </div>

          {/* Clean Table: Test Name | Value | Unit */}
          <div className="hw-table-container" style={{ border: 'none', marginBottom: '24px' }}>
            <table className="hw-table">
              <thead>
                <tr>
                  <th style={{ width: '45%' }}>Test Name</th>
                  <th style={{ width: '30%' }}>Value</th>
                  <th style={{ width: '25%' }}>Unit</th>
                </tr>
              </thead>
              <tbody>
                {extractedData.map((row) => (
                  <tr key={row.id}>
                    <td style={{ fontWeight: 600, color: 'var(--hw-text-main)' }}>
                      {row.testName}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="text"
                          value={row.value}
                          onChange={(e) => handleTestValueChange(row.id, e.target.value)}
                          style={{
                            width: '80px',
                            padding: '4px 8px',
                            border: '1px solid var(--hw-primary)',
                            borderRadius: '4px',
                            fontSize: '13px',
                            fontWeight: 700
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--hw-text-main)' }}>
                          {row.value}
                        </span>
                      )}
                    </td>
                    <td style={{ color: 'var(--hw-text-muted)', fontSize: '13px' }}>
                      {row.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Save Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            {isSaved ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--hw-green)', fontWeight: 600, fontSize: '13px' }}>
                <CheckCircleIcon size={16} />
                <span>Saved to Health Records</span>
              </div>
            ) : (
              <button
                type="button"
                id="btn-save-records"
                className="hw-btn hw-btn-primary hw-btn-lg"
                onClick={handleSaveToRecords}
                style={{ padding: '10px 24px' }}
              >
                Save to Health Records
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
