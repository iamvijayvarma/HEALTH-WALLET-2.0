/**
 * Health Wallet 2.0 - Real-Time Document & Medical Report Validator
 * 
 * Analyzes video frames and uploaded images using Computer Vision & Image Heuristics
 * to distinguish genuine paper/digital medical documents (prescriptions, lab test reports)
 * from:
 * 1. Empty or blank images (all white, all black, or uniform flat color)
 * 2. Natural scene / environment photos (rooms, classrooms, people, selfies, furniture, outdoors)
 * 3. Severely underexposed / dark images
 * 4. Textless or blurry surfaces (e.g. blank walls, plain white paper with no text)
 */

export const validateDocumentImage = (source) => {
  return new Promise((resolve) => {
    try {
      let img;

      if (typeof source === 'string') {
        // Data URL or Image URL
        img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const result = analyzeImageElement(img);
          resolve(result);
        };
        img.onerror = () => {
          resolve({
            isValid: false,
            confidence: 0,
            rejectionCode: 'INVALID_IMAGE_FILE',
            title: 'Unreadable Image File',
            message: 'Could not decode image data. Please ensure it is a valid JPG or PNG file.',
            suggestion: 'Try capturing the document again or selecting a valid image file.'
          });
        };
        img.src = source;
      } else if (source instanceof HTMLVideoElement || source instanceof HTMLCanvasElement || source instanceof HTMLImageElement) {
        const result = analyzeImageElement(source);
        resolve(result);
      } else {
        resolve({
          isValid: false,
          confidence: 0,
          rejectionCode: 'UNKNOWN_SOURCE',
          title: 'Invalid Source',
          message: 'Unsupported image source provided for validation.',
          suggestion: 'Provide a valid image or video element.'
        });
      }
    } catch (err) {
      console.error('Document validation error:', err);
      resolve({
        isValid: false,
        confidence: 0,
        rejectionCode: 'ANALYSIS_ERROR',
        title: 'Validation Error',
        message: 'An error occurred while analyzing the document image.',
        suggestion: 'Please try capturing or uploading again.'
      });
    }
  });
};

/**
 * Core Computer Vision & Heuristic Analyzer
 */
const analyzeImageElement = (drawable) => {
  const normWidth = 420;
  const origWidth = drawable.videoWidth || drawable.naturalWidth || drawable.width || 420;
  const origHeight = drawable.videoHeight || drawable.naturalHeight || drawable.height || 300;
  
  if (origWidth === 0 || origHeight === 0) {
    return {
      isValid: false,
      confidence: 0,
      rejectionCode: 'ZERO_DIMENSION',
      title: 'Invalid Image Size',
      message: 'Image has 0 width or height.',
      suggestion: 'Please recapture or select a valid image.'
    };
  }

  const normHeight = Math.max(120, Math.round(normWidth * (origHeight / origWidth)));

  const canvas = document.createElement('canvas');
  canvas.width = normWidth;
  canvas.height = normHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    return {
      isValid: false,
      confidence: 0,
      rejectionCode: 'CANVAS_UNAVAILABLE',
      title: 'Analysis Unavailable',
      message: 'Browser canvas context could not be created.',
      suggestion: 'Please try again.'
    };
  }

  ctx.drawImage(drawable, 0, 0, normWidth, normHeight);
  const imgData = ctx.getImageData(0, 0, normWidth, normHeight);
  const data = imgData.data;
  const totalPixels = normWidth * normHeight;

  // 1. Accumulate Luminance & Color Saturation Statistics
  let sumLuminance = 0;
  let minLuminance = 255;
  let maxLuminance = 0;
  let sumSaturation = 0;
  let chromaticPixelCount = 0;
  let highChromaPixelCount = 0;
  let paperPixelCount = 0; // Light background pixels: Y > 140, Saturation < 0.22
  let darkPixelCount = 0;  // Dark pixels: Y < 65

  // Luminance buffer for 2D edge analysis
  const lumBuffer = new Float32Array(totalPixels);

  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    // Standard Rec. 601 Luminance
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    lumBuffer[i] = lum;

    sumLuminance += lum;
    if (lum < minLuminance) minLuminance = lum;
    if (lum > maxLuminance) maxLuminance = lum;

    // HSV Saturation: (Max - Min) / Max
    const maxChannel = Math.max(r, g, b);
    const minChannel = Math.min(r, g, b);
    const sat = maxChannel > 0 ? (maxChannel - minChannel) / maxChannel : 0;
    sumSaturation += sat;

    if (sat > 0.22) chromaticPixelCount++;
    if (sat > 0.40) highChromaPixelCount++;

    if (lum > 135 && sat < 0.22) {
      paperPixelCount++;
    }
    if (lum < 65) {
      darkPixelCount++;
    }
  }

  const meanLuminance = sumLuminance / totalPixels;
  const meanSaturation = sumSaturation / totalPixels;
  const dynamicRange = maxLuminance - minLuminance;
  const chromaticFraction = chromaticPixelCount / totalPixels;
  const highChromaFraction = highChromaPixelCount / totalPixels;
  const paperFraction = paperPixelCount / totalPixels;
  const darkFraction = darkPixelCount / totalPixels;

  // Standard Deviation of Luminance
  let sumSqDiff = 0;
  for (let i = 0; i < totalPixels; i++) {
    const diff = lumBuffer[i] - meanLuminance;
    sumSqDiff += diff * diff;
  }
  const stdDevLuminance = Math.sqrt(sumSqDiff / totalPixels);

  // 2. High-Frequency Text Stroke & Edge Transition Detection
  // We sample 2D gradient magnitude: |dY/dx| + |dY/dy|
  let edgePixelCount = 0;
  let textStrokeCount = 0;
  const numSampledBands = 60;
  const bandScores = new Int32Array(numSampledBands);
  const bandHeight = normHeight / numSampledBands;

  for (let y = 2; y < normHeight - 2; y += 2) {
    const rowOffset = y * normWidth;
    const bandIdx = Math.min(numSampledBands - 1, Math.floor(y / bandHeight));

    for (let x = 2; x < normWidth - 2; x += 2) {
      const idx = rowOffset + x;
      const lum = lumBuffer[idx];

      const dx = Math.abs(lumBuffer[idx + 1] - lumBuffer[idx - 1]);
      const dy = Math.abs(lumBuffer[idx + normWidth] - lumBuffer[idx - normWidth]);
      const grad = dx + dy;

      if (grad > 36) {
        edgePixelCount++;
        // If this edge is in a region contrasting with light paper or ink
        if (lum < 185) {
          textStrokeCount++;
          bandScores[bandIdx]++;
        }
      }
    }
  }

  const sampledPixels = (Math.floor((normHeight - 4) / 2) + 1) * (Math.floor((normWidth - 4) / 2) + 1);
  const _edgeDensity = edgePixelCount / sampledPixels;
  const textStrokeDensity = textStrokeCount / sampledPixels;

  // 3. Horizontal Projection Line Peak Detection
  // Genuine printed/written documents have alternating peaks (lines of text) and valleys (margins)
  let linePeakCount = 0;
  const bandThreshold = Math.max(12, sampledPixels / (numSampledBands * 18));
  for (let b = 1; b < numSampledBands - 1; b++) {
    if (
      bandScores[b] > bandThreshold &&
      bandScores[b] >= bandScores[b - 1] &&
      bandScores[b] >= bandScores[b + 1]
    ) {
      linePeakCount++;
    }
  }

  // Debug metrics
  const metrics = {
    meanLuminance: Math.round(meanLuminance),
    stdDevLuminance: Math.round(stdDevLuminance * 10) / 10,
    dynamicRange: Math.round(dynamicRange),
    meanSaturation: Math.round(meanSaturation * 100) / 100,
    chromaticFraction: Math.round(chromaticFraction * 100),
    highChromaFraction: Math.round(highChromaFraction * 100),
    paperFraction: Math.round(paperFraction * 100),
    darkFraction: Math.round(darkFraction * 100),
    textStrokeDensity: Math.round(textStrokeDensity * 1000) / 10, // in percent
    linePeakCount
  };

  console.log('Document Validator Analysis Metrics:', metrics);

  // =========================================================================
  // REJECTION RULESETS
  // =========================================================================

  // Rule 1: Blank or Empty Image Check
  // An image with very low standard deviation, low dynamic range, or almost uniform color
  if (
    stdDevLuminance < 11 ||
    dynamicRange < 30 ||
    (meanLuminance > 242 && stdDevLuminance < 18 && textStrokeDensity < 0.2) ||
    (meanLuminance < 25 && stdDevLuminance < 16)
  ) {
    return {
      isValid: false,
      confidence: 5,
      rejectionCode: 'EMPTY_IMAGE',
      title: 'Blank or Empty Image Detected',
      message: 'The captured/uploaded image is completely blank or uniform with no medical report text or document layout.',
      suggestion: 'Please capture or upload a clear, legible photo of an actual paper prescription, lab report, or hospital summary.',
      metrics,
      checklist: [
        { label: 'Paper / Document Background', passed: false, note: 'No content found' },
        { label: 'Text & Clinical Lines', passed: false, note: '0 text lines detected' },
        { label: 'Color Diversity', passed: true, note: 'Monochromatic' },
        { label: 'Image Contrast', passed: false, note: `Flat contrast (${metrics.dynamicRange}/255)` }
      ]
    };
  }

  // Rule 2: Pitch Dark / Severe Underexposure Check
  if (meanLuminance < 42 || (darkFraction > 0.82 && textStrokeDensity < 0.6)) {
    return {
      isValid: false,
      confidence: 8,
      rejectionCode: 'TOO_DARK',
      title: 'Image Too Dark to Read',
      message: 'The image is too dark or shadowed. Document text cannot be detected.',
      suggestion: 'Turn on lights or move to a well-illuminated area before capturing your report.',
      metrics,
      checklist: [
        { label: 'Paper / Document Background', passed: false, note: 'Severely underexposed' },
        { label: 'Text & Clinical Lines', passed: false, note: 'Text hidden in shadow' },
        { label: 'Image Contrast', passed: false, note: `Luminance too low (${metrics.meanLuminance}/255)` }
      ]
    };
  }

  // Rule 3: Natural Scene / Environment / Portrait / Classroom Check
  // Natural indoor/outdoor scenes have rich color saturation, skin tones, dark clothing,
  // furniture, ceilings, and low paper surface ratio.
  const isNaturalScene =
    (paperFraction < 0.42 && (chromaticFraction > 0.24 || meanSaturation > 0.18 || darkFraction > 0.32)) ||
    chromaticFraction > 0.38 ||
    highChromaFraction > 0.18 ||
    (paperFraction < 0.35);

  if (isNaturalScene) {
    return {
      isValid: false,
      confidence: Math.max(10, Math.min(38, Math.round(paperFraction * 40))),
      rejectionCode: 'NATURAL_SCENE',
      title: 'Non-Document Image Detected',
      message: 'This appears to be a photo of an indoor room, person, or surroundings rather than a printed or handwritten medical document.',
      suggestion: 'Please hold your medical prescription or laboratory test report directly in front of the camera, filling the document frame.',
      metrics,
      checklist: [
        { label: 'Paper Document Surface', passed: false, note: `${metrics.paperFraction}% paper background (min 45% required)` },
        { label: 'Achromatic Paper Profile', passed: false, note: `${metrics.chromaticFraction}% colorful scene elements detected` },
        { label: 'Horizontal Text Lines', passed: linePeakCount >= 4, note: `${linePeakCount} line transitions found` },
        { label: 'Document Layout Confidence', passed: false, note: 'Room / Portrait scene signature' }
      ]
    };
  }

  // Rule 4: No Readable Text / Blank Paper Surface Check
  // Even if paper-like (e.g. photo of a blank white wall or empty notebook page),
  // a medical report must have printed or written text strokes!
  if (textStrokeDensity < 0.6 || linePeakCount < 3) {
    return {
      isValid: false,
      confidence: Math.max(15, Math.min(45, Math.round(textStrokeDensity * 20))),
      rejectionCode: 'NO_TEXT_LINES',
      title: 'No Readable Document Text Found',
      message: 'A light surface was detected, but no readable document text lines or clinical layout could be extracted.',
      suggestion: 'Ensure the document has clear printed or handwritten text and hold it steady so letters are sharp and in focus.',
      metrics,
      checklist: [
        { label: 'Paper Document Surface', passed: true, note: `${metrics.paperFraction}% light paper surface` },
        { label: 'Readable Text Strokes', passed: false, note: `Text stroke density too low (${metrics.textStrokeDensity}%)` },
        { label: 'Text Line Profile', passed: false, note: `Only ${linePeakCount} text rows detected (min 4 required)` },
        { label: 'Document Layout Confidence', passed: false, note: 'Lacks medical report structure' }
      ]
    };
  }

  // =========================================================================
  // DOCUMENT PASSED ALL CHECKS! Compute Confidence Score (65% to 98%)
  // =========================================================================
  let score = 55;

  // Paper coverage component (up to +15)
  if (paperFraction >= 0.60) score += 15;
  else if (paperFraction >= 0.48) score += 10;
  else score += 5;

  // Achromatic ink/paper component (up to +12)
  if (chromaticFraction < 0.12 && meanSaturation < 0.10) score += 12;
  else if (chromaticFraction < 0.20 && meanSaturation < 0.15) score += 8;
  else score += 4;

  // Text stroke contrast component (up to +10)
  if (textStrokeDensity >= 1.5 && textStrokeDensity <= 16) score += 10;
  else if (textStrokeDensity >= 0.8) score += 6;

  // Line peaks component (up to +8)
  if (linePeakCount >= 8) score += 8;
  else if (linePeakCount >= 5) score += 5;
  else score += 2;

  const finalConfidence = Math.min(98, Math.max(65, Math.round(score)));

  // Determine likely document type heuristic
  let documentType = 'Medical Diagnostic Report';
  if (linePeakCount >= 10 && paperFraction > 0.65) {
    documentType = 'Laboratory Blood Test Report (CBC / Biochemistry)';
  } else if (textStrokeDensity > 2.5) {
    documentType = 'Doctor Clinical Prescription Note';
  } else {
    documentType = 'Diagnostic Lab Test Record';
  }

  return {
    isValid: true,
    confidence: finalConfidence,
    rejectionCode: null,
    title: 'Valid Medical Document Detected',
    documentType,
    message: `Document verified with ${finalConfidence}% confidence. Paper background and text line structure confirmed.`,
    metrics,
    checklist: [
      { label: 'Paper Document Surface', passed: true, note: `${metrics.paperFraction}% paper area verified` },
      { label: 'Legible Text Strokes', passed: true, note: `${metrics.textStrokeDensity}% text ink density` },
      { label: 'Horizontal Text Rows', passed: true, note: `${linePeakCount} structured text lines detected` },
      { label: 'Document Layout Confidence', passed: true, note: `${finalConfidence}% match score` }
    ]
  };
};
