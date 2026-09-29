import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useHealthWallet } from '../../context/HealthWalletContext';
import { validateMedicalDocument } from '../../services/medicalDocumentValidator';
import { performOcr } from '../../services/ocrService';
import { extractMedicalReport } from '../../services/medicalReportExtractor';
import { createMedicalReport } from '../../services/healthRecordService';
import { ValidationStatus } from '../scanner/ValidationStatus';
import { ExtractionStatus } from '../scanner/ExtractionStatus';
import { ExtractionReview } from '../scanner/ExtractionReview';
import {
  CameraIcon,
  UploadIcon,
  RefreshIcon,
  SwitchCameraIcon,
  AlertTriangleIcon
} from '../common/Icons';

export const ScanReportPage = () => {
  const { addMedicalReport, addToast, navigate } = useHealthWallet();

  // Active Input Tab: 'camera' | 'upload'
  const [activeTab, setActiveTab] = useState('camera');

  /**
   * Pipeline Stages:
   * 'INPUT'       → Ready to capture or select file
   * 'VALIDATING'  → Running medical document structure & terminology verification
   * 'VALID'       → Medical report detected (brief confirmation before extraction)
   * 'REJECTED'    → Document rejected (not a medical report)
   * 'EXTRACTING'  → Running OCR and structured clinical parameter extraction
   * 'REVIEW'      → Side-by-side / stacked review with editable parameters
   * 'SAVED'       → User confirmed & saved to Health Records
   */
  const [pipelineStage, setPipelineStage] = useState('INPUT');

  // Camera Open & Hardware State
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
  const autoExtractTimerRef = useRef(null);

  // Multi-camera device tracking
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [facingMode, setFacingMode] = useState('environment');

  // Document Validation and Extraction State
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedFileName, setCapturedFileName] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [extractedReport, setExtractedReport] = useState(null);
  const [extractionErrorMessage, setExtractionErrorMessage] = useState('');
  const [isSaved, setIsSaved] = useState(false);

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
      if (autoExtractTimerRef.current) {
        clearTimeout(autoExtractTimerRef.current);
      }
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

  // Open camera viewport
  const handleOpenScanCamera = () => {
    resetPipeline();
    setIsCameraOpen(true);
  };

  // Mount camera when requested
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

  // Reset complete pipeline to start fresh
  const resetPipeline = () => {
    if (autoExtractTimerRef.current) {
      clearTimeout(autoExtractTimerRef.current);
    }
    setPipelineStage('INPUT');
    setCapturedImage(null);
    setCapturedFileName('');
    setValidationResult(null);
    setExtractedReport(null);
    setExtractionErrorMessage('');
    setIsSaved(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // =========================================================================
  // DOCUMENT VALIDATION & EXTRACTION PIPELINE
  // =========================================================================

  /**
   * Runs medical validation followed by automatic OCR & clinical extraction
   * 
   * Camera / Upload
   *       ↓
   * Medical Report Validation
   *       ↓
   * OCR + AI Extraction
   *       ↓
   * Extraction Review
   */
  const processDocumentPipeline = async (documentInput, fileName) => {
    try {
      setPipelineStage('VALIDATING');
      setValidationResult(null);
      setExtractionErrorMessage('');

      // Step 2: Medical Report Validation layer
      const validation = await validateMedicalDocument(documentInput, { filename: fileName });
      setValidationResult(validation);

      if (!validation.isMedicalReport) {
        // Strict Rejection — Document is NOT a medical report
        setPipelineStage('REJECTED');
        addToast("This doesn't appear to be a valid medical report.", 'warning');
        return;
      }

      // Valid Medical Report detected
      setPipelineStage('VALID');
      addToast('Medical report verified successfully', 'success');

      // Continue automatically to OCR + AI extraction
      autoExtractTimerRef.current = setTimeout(async () => {
        try {
          setPipelineStage('EXTRACTING');

          // Step 3: OCR service layer
          const ocrResult = await performOcr(documentInput, { filename: fileName });

          // Step 4: Medical report structured extraction layer
          const extracted = await extractMedicalReport(ocrResult);

          if (!extracted || !extracted.tests || extracted.tests.length === 0) {
            setPipelineStage('REJECTED');
            setExtractionErrorMessage('Unable to extract reliable information from this report.');
            addToast('Unable to extract reliable information from this report.', 'error');
            return;
          }

          setExtractedReport(extracted);
          setPipelineStage('REVIEW');
        } catch (extractErr) {
          console.error('Extraction error:', extractErr);
          setPipelineStage('REJECTED');
          setExtractionErrorMessage('Unable to extract reliable information from this report.');
          addToast('Extraction failure. Please upload a clear medical report.', 'error');
        }
      }, 850);
    } catch (valErr) {
      console.error('Validation error:', valErr);
      setPipelineStage('REJECTED');
      setValidationResult({
        isMedicalReport: false,
        confidence: 0,
        documentType: 'Unknown',
        reason: 'Error analyzing document. Please capture a clear medical report.'
      });
      addToast('Validation error. Please try again.', 'error');
    }
  };

  // Shutter capture handler from live camera
  const handleCapture = async () => {
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
      const generatedName = `Medical_Scan_${new Date().toISOString().slice(0, 10)}.jpg`;

      // Stop camera stream immediately
      stopCamera();
      setIsCameraOpen(false);

      setCapturedImage(dataUrl);
      setCapturedFileName(generatedName);

      // Trigger Validation & Extraction Pipeline
      await processDocumentPipeline(dataUrl, generatedName);
    } catch (err) {
      console.error('Camera capture error:', err);
      addToast('Failed to capture photo from camera.', 'error');
    }
  };

  // File upload handler supporting JPG, JPEG, PNG, WEBP, and PDF
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (15 MB maximum)
    const MAX_FILE_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      addToast('File too large (maximum allowed size is 15MB). Please upload a smaller file.', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Check supported types
    const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    const isSupported = validMimes.includes(file.type) || /\.(jpe?g|png|webp|pdf)$/i.test(file.name);

    if (!isSupported) {
      addToast('Unsupported file type. Please upload a medical report in JPG, PNG, WEBP, or PDF format.', 'warning');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setCapturedFileName(file.name);

    // Read preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = async (loadEvt) => {
        const dataUrl = loadEvt.target.result;
        setCapturedImage(dataUrl);
        await processDocumentPipeline(file, file.name);
      };
      reader.readAsDataURL(file);
    } else {
      setCapturedImage('pdf_document');
      await processDocumentPipeline(file, file.name);
    }
  };

  // Retake or Discard
  const handleRetake = () => {
    resetPipeline();
    if (activeTab === 'camera') {
      setIsCameraOpen(true);
    }
  };

  // Switch to upload tab from invalid rejection
  const handleUploadAnother = () => {
    resetPipeline();
    stopCamera();
    setIsCameraOpen(false);
    setActiveTab('upload');
  };

  // Step 5: User Confirmation & Save to Health Records
  const handleConfirmAndSave = (confirmedReport) => {
    try {
      const record = createMedicalReport(confirmedReport, capturedImage, {
        sourceMethod: activeTab === 'camera' ? 'Camera Scan' : 'Document Upload'
      });

      addMedicalReport(record);
      setIsSaved(true);
      setPipelineStage('SAVED');

      // Immediately navigate to Health Records as specified in WORKFLOW
      navigate('records');
    } catch (saveErr) {
      console.error('Save to health records error:', saveErr);
      addToast('Failed to save record to wallet. Please try again.', 'error');
    }
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

      {/* 2. Wide Toggle Tabs (Visible when not actively reviewing or validating) */}
      {(pipelineStage === 'INPUT' || pipelineStage === 'REJECTED') && (
        <div className="hw-wide-toggle-tabs" style={{ maxWidth: '640px' }}>
          <button
            type="button"
            id="tab-scan-camera"
            className={`hw-wide-toggle-btn ${activeTab === 'camera' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('camera');
              resetPipeline();
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
              resetPipeline();
            }}
          >
            <UploadIcon size={16} />
            <span>Upload File</span>
          </button>
        </div>
      )}

      {/* ================================================================= */}
      {/* STAGE 1: INPUT — CAMERA CAPTURE                                   */}
      {/* ================================================================= */}
      {activeTab === 'camera' && pipelineStage === 'INPUT' && (
        <div>
          {/* CAMERA VIEWPORT MODAL / CONTAINER (Mounted when isCameraOpen is true) */}
          {isCameraOpen && (
            <div className="hw-camera-wrapper" style={{ marginBottom: '28px' }}>
              <div className="hw-camera-viewport">
                {/* REAL <video> element inside camera viewport */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="hw-camera-video"
                  onLoadedMetadata={(e) => {
                    const v = e.target;
                    setVideoDimensions({ width: v.videoWidth, height: v.videoHeight });
                    setVideoReadyState(v.readyState);
                    if (v.readyState >= 2 && v.videoWidth > 0 && v.videoHeight > 0) {
                      setCameraStatus('Video ready');
                      setIsCameraReady(true);
                    }
                  }}
                  onCanPlay={(e) => {
                    const v = e.target;
                    setVideoReadyState(v.readyState);
                    if (v.readyState >= 2 && v.videoWidth > 0 && v.videoHeight > 0) {
                      setCameraStatus('Video ready');
                      setIsCameraReady(true);
                    }
                  }}
                  onPlaying={(e) => {
                    const v = e.target;
                    setIsVideoPlaying(true);
                    setVideoReadyState(v.readyState);
                    setVideoDimensions({ width: v.videoWidth, height: v.videoHeight });
                    if (v.readyState >= 2 && v.videoWidth > 0 && v.videoHeight > 0) {
                      setCameraStatus('Video ready');
                      setIsCameraReady(true);
                    }
                  }}
                  onError={() => {
                    setCameraStatus('Camera error');
                    setIsCameraReady(false);
                  }}
                />

                {/* Visible Development Diagnostics */}
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

                {/* Scanning Overlay Positioned Above Video */}
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
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Document Alignment Frame with Required Instructions */}
                  <div className="hw-camera-frame">
                    <div className="hw-camera-corner hw-camera-corner-tl" />
                    <div className="hw-camera-corner hw-camera-corner-tr" />
                    <div className="hw-camera-corner hw-camera-corner-bl" />
                    <div className="hw-camera-corner hw-camera-corner-br" />
                    <div className="hw-camera-scan-laser" />
                    <div className="hw-camera-guide-hint" style={{ textAlign: 'center', lineHeight: '1.4' }}>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                        Place the medical report completely inside the frame.
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                        Only medical reports and laboratory reports are accepted.
                      </div>
                    </div>
                  </div>

                  {/* Bottom Bar with Capture Shutter */}
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

          {/* Idle Start Card: Click to start camera scan */}
          {!isCameraOpen && (
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
                Place your medical prescription or laboratory diagnostic report inside the camera frame.
              </p>

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

      {/* ================================================================= */}
      {/* STAGE 1: INPUT — FILE UPLOAD (JPG, PNG, WEBP, PDF)                */}
      {/* ================================================================= */}
      {activeTab === 'upload' && pipelineStage === 'INPUT' && (
        <div>
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
              accept="image/jpeg,image/png,image/webp,application/pdf"
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
              Upload your laboratory report or diagnostic scan (multi-page PDF supported)
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
              Supported formats: JPG, PNG, WEBP, PDF (Max size: 15 MB)
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* STAGE 2: VALIDATING / VALID / REJECTED STATUS                     */}
      {/* ================================================================= */}
      {(pipelineStage === 'VALIDATING' || pipelineStage === 'VALID' || pipelineStage === 'REJECTED') && (
        <ValidationStatus
          isValidating={pipelineStage === 'VALIDATING'}
          validationResult={validationResult}
          documentPreview={capturedImage}
          activeTab={activeTab}
          onRetake={handleRetake}
          onUploadAnother={handleUploadAnother}
        />
      )}

      {/* Extraction failure error banner if extraction layer failed */}
      {pipelineStage === 'REJECTED' && extractionErrorMessage && (
        <div style={{ maxWidth: '640px', margin: '-16px auto 28px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: 'var(--hw-danger)', fontWeight: 600 }}>
            {extractionErrorMessage}
          </p>
        </div>
      )}

      {/* ================================================================= */}
      {/* STAGE 3: OCR + AI EXTRACTION PROGRESS                             */}
      {/* ================================================================= */}
      {pipelineStage === 'EXTRACTING' && (
        <ExtractionStatus message="Extracting Clinical Information..." />
      )}

      {/* ================================================================= */}
      {/* STAGE 4 & 5: REVIEW EXTRACTED INFORMATION & USER CONFIRMATION     */}
      {/* ================================================================= */}
      {(pipelineStage === 'REVIEW' || pipelineStage === 'SAVED') && extractedReport && (
        <ExtractionReview
          originalDocument={capturedImage}
          fileName={capturedFileName}
          initialReport={extractedReport}
          onConfirmAndSave={handleConfirmAndSave}
          onRetake={handleRetake}
          isSaved={isSaved}
          onNavigateToRecords={() => navigate('records')}
        />
      )}
    </div>
  );
};
