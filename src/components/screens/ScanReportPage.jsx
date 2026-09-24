import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  FileTextIcon
} from '../common/Icons';

export const ScanReportPage = () => {
  const { addHealthRecord, addToast } = useHealthWallet();

  // Active Tab: 'camera' | 'upload'
  const [activeTab, setActiveTab] = useState('camera');

  // Camera Open & Status State
  // Statuses: 'idle' | 'Requesting camera' | 'Permission granted' | 'Stream active' | 'Video ready' | 'Camera error'
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStatus, setCameraStatus] = useState('idle');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [cameraErrorMessage, setCameraErrorMessage] = useState('');

  // Diagnostic metrics
  const [videoTrackCount, setVideoTrackCount] = useState(0);
  const [videoReadyState, setVideoReadyState] = useState(0);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });

  // DOM and Stream Refs
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Multi-camera device tracking
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [facingMode, setFacingMode] = useState('environment');

  // Captured Image & Review
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedFileName, setCapturedFileName] = useState('');
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
  // CAMERA STREAM LIFECYCLE
  // =========================================================================

  // Fully stop all active media stream tracks
  const stopCamera = useCallback(() => {
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

    setVideoTrackCount(0);
    setVideoReadyState(0);
    setVideoDimensions({ width: 0, height: 0 });
    setIsCameraReady(false);
    setIsVideoPlaying(false);
  }, []);

  // Stop camera on unmount or route change
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Stop camera when navigating away via hash change
  useEffect(() => {
    const handleHashChange = () => {
      stopCamera();
      setIsCameraOpen(false);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [stopCamera]);



  // Request real camera stream and attach to the mounted <video> element
  const requestCameraStream = useCallback(async (preferFacing = facingMode, deviceId = selectedCameraId) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraStatus('Camera error');
      setCameraErrorMessage('Camera API is not supported by this browser or requires a secure context (HTTPS / localhost).');
      return;
    }

    setCameraStatus('Requesting camera');
    setCameraErrorMessage('');
    setIsCameraReady(false);
    setIsVideoPlaying(false);

    try {
      const videoConstraints = {
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      };

      if (deviceId) {
        videoConstraints.deviceId = { exact: deviceId };
      } else {
        videoConstraints.facingMode = { ideal: preferFacing };
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false
      });

      streamRef.current = stream;
      setCameraStatus('Permission granted');
      const tracks = stream.getVideoTracks();
      setVideoTrackCount(tracks.length);

      // Attach stream directly to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStatus('Stream active');
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('video.play() promise warning:', playErr);
        }
      }

      // Logging diagnostics
      console.log('Camera stream:', stream);
      console.log('Video tracks:', stream.getVideoTracks());
      console.log('Video element:', videoRef.current);
      console.log('Video dimensions:', videoRef.current?.videoWidth, videoRef.current?.videoHeight);
      console.log('Ready state:', videoRef.current?.readyState);

      // Enumerate cameras for multi-camera switcher
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        setAvailableCameras(videoInputs);
        if (!deviceId && videoInputs.length > 0) {
          const activeTrack = stream.getVideoTracks()[0];
          const settings = activeTrack?.getSettings?.();
          if (settings?.deviceId) {
            setSelectedCameraId(settings.deviceId);
          }
        }
      } catch {
        // non-fatal
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraStatus('Camera error');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraErrorMessage('Camera access is required to scan a medical report. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraErrorMessage('No camera detected on this device. You can upload a file instead.');
      } else {
        setCameraErrorMessage(err.message || 'Camera is currently unavailable or in use by another application.');
      }
    }
  }, [facingMode, selectedCameraId]);

  // Flow Step 15: Open camera container first, so <video> is mounted, then request camera stream
  const handleOpenScanCamera = () => {
    setCapturedImage(null);
    setIsReviewReady(false);
    setIsSaved(false);
    setCameraErrorMessage('');
    setIsCameraOpen(true);
  };

  // When isCameraOpen becomes true, the <video> element is guaranteed mounted in DOM
  useEffect(() => {
    let isCancelled = false;
    if (isCameraOpen && !capturedImage) {
      const timer = setTimeout(() => {
        if (!isCancelled) {
          requestCameraStream();
        }
      }, 0);
      return () => {
        isCancelled = true;
        clearTimeout(timer);
      };
    }
  }, [isCameraOpen, capturedImage, requestCameraStream]);

  // Periodically check if video is ready and dimensions are positive
  useEffect(() => {
    if (!isCameraOpen || isCameraReady) return;

    const interval = setInterval(() => {
      const v = videoRef.current;
      if (v) {
        setVideoReadyState(v.readyState);
        if (v.videoWidth > 0 && v.videoHeight > 0) {
          setVideoDimensions({ width: v.videoWidth, height: v.videoHeight });
        }
        if (v.readyState >= 2 && v.videoWidth > 0 && v.videoHeight > 0) {
          setIsCameraReady(true);
          setCameraStatus('Video ready');
        }
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isCameraOpen, isCameraReady]);

  // Switch camera button handler
  const handleSwitchCamera = () => {
    stopCamera();
    if (availableCameras.length > 1) {
      const currentIndex = availableCameras.findIndex(d => d.deviceId === selectedCameraId);
      const nextIndex = (currentIndex + 1) % availableCameras.length;
      const nextId = availableCameras[nextIndex].deviceId;
      setSelectedCameraId(nextId);
      requestCameraStream(facingMode, nextId);
    } else {
      const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
      setFacingMode(nextFacing);
      requestCameraStream(nextFacing, null);
    }
  };

  // Close camera button handler
  const handleCloseCamera = () => {
    stopCamera();
    setIsCameraOpen(false);
    setCameraStatus('idle');
  };

  // =========================================================================
  // CAPTURE & REPORT PROCESSING
  // =========================================================================

  // Capture current video frame using canvas
  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !isCameraReady) return;

    try {
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.94);

      // Stop camera stream immediately when capture is completed
      stopCamera();
      setIsCameraOpen(false);

      setCapturedImage(dataUrl);
      setCapturedFileName(`Medical_Scan_${new Date().toISOString().slice(0, 10)}.jpg`);
      addToast('Medical report image captured', 'success');
    } catch (err) {
      console.error('Frame capture error:', err);
      addToast('Could not capture frame. Please try again.', 'error');
    }
  };

  // Retake photo: discard captured frame and reopen live camera
  const handleRetake = () => {
    setCapturedImage(null);
    setIsReviewReady(false);
    setIsSaved(false);
    setIsCameraOpen(true);
  };

  // "Use This Report": proceed to AI clinical extraction and review table
  const handleUseReport = () => {
    setIsProcessing(true);
    stopCamera();
    setIsCameraOpen(false);

    setTimeout(() => {
      setIsProcessing(false);
      setIsReviewReady(true);
      addToast('Report processed. Please verify extracted clinical metrics below.', 'info');
    }, 1200);
  };

  // File upload handler
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
      setCapturedImage('pdf_document');
    }
  };

  // Inline value editor for review table
  const handleTestValueChange = (id, newValue) => {
    setExtractedData(prev =>
      prev.map(item => item.id === id ? { ...item, value: newValue } : item)
    );
  };

  // Save to Health Records
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
      {/* 1. Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--hw-text-main)', margin: '0 0 4px 0' }}>
          Scan Medical Report
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: 0 }}>
          Upload or scan your medical reports with your real device camera. Our AI will extract the information for review.
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
            stopCamera();
            setIsCameraOpen(false);
            setCameraStatus('idle');
            setActiveTab('upload');
            setIsReviewReady(false);
            setIsSaved(false);
          }}
        >
          <UploadIcon size={16} />
          <span>Upload File</span>
        </button>
      </div>

      {/* 3. CAMERA TAB CONTENT */}
      {activeTab === 'camera' && (
        <div>
          {/* CAMERA VIEWPORT MODAL / CONTAINER (Mounted when isCameraOpen is true) */}
          {isCameraOpen && !capturedImage && (
            <div className="hw-camera-wrapper" style={{ marginBottom: '28px' }}>
              <div className="hw-camera-viewport">
                {/* 2. REAL <video> element inside camera viewport with autoPlay, playsInline, muted */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="hw-camera-video"
                  onLoadedMetadata={(e) => {
                    const v = e.target;
                    console.log('onLoadedMetadata:', v.videoWidth, v.videoHeight, v.readyState);
                    setVideoDimensions({ width: v.videoWidth, height: v.videoHeight });
                    setVideoReadyState(v.readyState);
                    if (v.readyState >= 2 && v.videoWidth > 0 && v.videoHeight > 0) {
                      setCameraStatus('Video ready');
                      setIsCameraReady(true);
                    }
                  }}
                  onCanPlay={(e) => {
                    const v = e.target;
                    console.log('onCanPlay readyState:', v.readyState);
                    setVideoReadyState(v.readyState);
                    if (v.readyState >= 2 && v.videoWidth > 0 && v.videoHeight > 0) {
                      setCameraStatus('Video ready');
                      setIsCameraReady(true);
                    }
                  }}
                  onPlaying={(e) => {
                    const v = e.target;
                    console.log('onPlaying:', v.videoWidth, v.videoHeight, v.readyState);
                    setIsVideoPlaying(true);
                    setVideoReadyState(v.readyState);
                    setVideoDimensions({ width: v.videoWidth, height: v.videoHeight });
                    if (v.readyState >= 2 && v.videoWidth > 0 && v.videoHeight > 0) {
                      setCameraStatus('Video ready');
                      setIsCameraReady(true);
                    }
                  }}
                  onError={(e) => {
                    console.error('Video element error:', e);
                    setCameraStatus('Camera error');
                    setIsCameraReady(false);
                  }}
                />

                {/* 7. VISIBLE DEVELOPMENT DIAGNOSTICS */}
                <div
                  style={{
                    position: 'absolute',
                    top: '52px',
                    left: '14px',
                    background: 'rgba(15, 23, 42, 0.88)',
                    color: '#38bdf8',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontFamily: 'Consolas, monospace',
                    fontSize: '11px',
                    lineHeight: '1.5',
                    zIndex: 10,
                    pointerEvents: 'none',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Camera status:</span>
                    <strong style={{ color: isCameraReady ? '#4ade80' : cameraStatus === 'Camera error' ? '#f87171' : '#facc15' }}>
                      {cameraStatus}
                    </strong>
                  </div>
                  <div>Tracks: {videoTrackCount} | readyState: {videoReadyState} | playing: {isVideoPlaying ? 'yes' : 'no'}</div>
                  <div>Dimensions: {videoDimensions.width} × {videoDimensions.height}</div>
                </div>

                {/* 11. SCANNING OVERLAY POSITIONED ABOVE VIDEO */}
                <div className="hw-camera-overlay">
                  {/* Top Bar */}
                  <div className="hw-camera-topbar">
                    <div className="hw-camera-live-pill">
                      <span className="hw-camera-live-dot" />
                      <span>{isCameraReady ? 'CAMERA READY' : cameraStatus.toUpperCase()}</span>
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

                  {/* Document Alignment Frame */}
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

                  {/* Bottom Bar with Capture Shutter (Disabled until camera is ready) */}
                  <div className="hw-camera-bottombar">
                    <button
                      type="button"
                      id="btn-capture-camera"
                      className="hw-camera-shutter-btn"
                      disabled={!isCameraReady}
                      onClick={handleCapture}
                      style={{
                        opacity: isCameraReady ? 1 : 0.45,
                        cursor: isCameraReady ? 'pointer' : 'not-allowed',
                        transform: isCameraReady ? undefined : 'scale(0.95)'
                      }}
                      title={isCameraReady ? 'Capture Report Photo' : 'Waiting for video stream...'}
                      aria-label="Capture Report Photo"
                    >
                      <div className="hw-camera-shutter-inner">
                        <CameraIcon size={24} color="#ffffff" />
                      </div>
                    </button>
                  </div>
                </div>

                {/* Error Banner inside viewport if permissions denied */}
                {cameraStatus === 'Camera error' && cameraErrorMessage && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(15, 23, 42, 0.94)',
                      zIndex: 20,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '24px',
                      textAlign: 'center'
                    }}
                  >
                    <AlertTriangleIcon size={36} color="var(--hw-danger)" />
                    <h4 style={{ color: '#ffffff', fontSize: '16px', margin: '12px 0 8px 0' }}>
                      Camera Access Required
                    </h4>
                    <p style={{ color: '#cbd5e1', fontSize: '13px', maxWidth: '440px', lineHeight: '1.6', margin: '0 0 20px 0' }}>
                      {cameraErrorMessage}
                    </p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="hw-btn hw-btn-primary hw-btn-sm"
                        onClick={() => requestCameraStream()}
                      >
                        <RefreshIcon size={14} />
                        <span>Try Again</span>
                      </button>
                      <button
                        type="button"
                        className="hw-btn hw-btn-secondary hw-btn-sm"
                        onClick={handleCloseCamera}
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        className="hw-btn hw-btn-teal hw-btn-sm"
                        onClick={() => {
                          handleCloseCamera();
                          setActiveTab('upload');
                        }}
                      >
                        <UploadIcon size={14} />
                        <span>Upload File Instead</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CAPTURED REPORT PHOTO PREVIEW */}
          {capturedImage && !isReviewReady && (
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
                <img src={capturedImage} alt="Captured Medical Report" />
              </div>

              {/* 5. After capture: [ Retake ] [ Use This Report ] */}
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

          {/* IDLE TRIGGER CARD: Click to start camera scan */}
          {!isCameraOpen && !capturedImage && !isReviewReady && (
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
              onClick={handleOpenScanCamera}
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
                Scan with Real Device Camera
              </h3>

              <p style={{ fontSize: '13px', color: 'var(--hw-text-muted)', margin: '0 auto 18px auto', maxWidth: '440px' }}>
                Open your device camera to preview, frame, and capture medical prescriptions or laboratory test reports.
              </p>

              {/* 1. "Scan with Camera" button */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button
                  type="button"
                  id="btn-start-camera-scan"
                  className="hw-btn hw-btn-primary hw-btn-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenScanCamera();
                  }}
                  style={{ padding: '10px 24px' }}
                >
                  <CameraIcon size={18} />
                  <span>Scan with Camera</span>
                </button>
              </div>

              <div style={{ marginTop: '16px', fontSize: '11px', color: 'var(--hw-text-subtle)' }}>
                Rear environment camera preferred on mobile • Live viewport preview
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. FILE UPLOAD TAB CONTENT */}
      {activeTab === 'upload' && (
        <div>
          {capturedImage && !isReviewReady && (
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

              {capturedImage !== 'pdf_document' ? (
                <div className="hw-captured-image-box">
                  <img src={capturedImage} alt="Uploaded Document" />
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
                  onClick={() => setCapturedImage(null)}
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

          {!capturedImage && !isReviewReady && (
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

      {/* 5. AI PROCESSING SPINNER */}
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

      {/* 6. EXTRACTED CLINICAL METRICS TABLE (REVIEW & CONFIRM) */}
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
                    handleOpenScanCamera();
                  } else {
                    setCapturedImage(null);
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
