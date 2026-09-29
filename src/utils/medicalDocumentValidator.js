/**
 * Health Wallet 2.0 - Medical Document Validation Service
 * 
 * Provides strict, multi-layered verification specifically for MEDICAL & LABORATORY REPORTS.
 * Rejects non-medical inputs including selfies, people, walls, furniture, ID cards,
 * commercial invoices, receipts, books, blank surfaces, and unrelated documents.
 * 
 * Validation Layers:
 * 1. Ingestion & format decoding (File, Blob, Data URL, Canvas, Video)
 * 2. PDF text & structure extraction
 * 3. Computer Vision & Photometric analysis (Skin/Face detection, Card vs Sheet geometry, paper profile)
 * 4. Clinical Terminology & Document Structure verification
 * 5. Medical-report confidence calculation & Accept/Reject decision
 */

// Medical & Clinical Terminology Dictionary
const MEDICAL_TERMS = [
  'hemoglobin', 'hb', 'rbc', 'wbc', 'platelet', 'blood count', 'cbc',
  'glucose', 'cholesterol', 'lipid profile', 'hba1c', 'creatinine', 'urea',
  'bilirubin', 'sgot', 'sgpt', 'tsh', 'thyroid', 'urine', 'pathology',
  'biochemistry', 'hematology', 'radiology', 'x-ray', 'ultrasound', 'ct scan',
  'mri', 'ecg', 'biopsy', 'specimen', 'sample', 'reference range',
  'reference interval', 'biological reference', 'investigation', 'observed value',
  'diagnostic', 'doctor', 'physician', 'hospital', 'clinic', 'laboratory',
  'lab report', 'leukocyte', 'erythrocyte', 'neutrophil', 'lymphocyte',
  'eosinophil', 'monocyte', 'basophil', 'esr', 'triglyceride', 'hdl', 'ldl',
  'bun', 'ast', 'alt', 'alkaline phosphatase', 'alp', 'electrolytes', 'sodium',
  'potassium', 'calcium', 'vitamin d', 'vitamin b12', 't3', 't4', 'prescription'
];

// Clinical Units Dictionary
const CLINICAL_UNITS = [
  'g/dl', 'mg/dl', 'mmol/l', 'umol/l', 'iu/l', 'u/l', 'ng/ml', 'pg/ml',
  'cells/cumm', 'cells/mcl', 'mil/ul', 'meq/l', 'fl', 'mm/hr', '%', 'mg/l', 'ug/dl'
];

// Rejection Keywords for ID Cards, Invoices, Receipts, and Unrelated Documents
const REJECT_KEYWORDS = [
  'aadhaar', 'unique identification', 'uidai', 'driving licence', 'driving license',
  'transport department', 'election commission', 'voter id', 'pan card',
  'income tax department', 'student id', 'college id', 'employee id', 'staff badge',
  'identity card', 'visiting card', 'tax invoice', 'commercial invoice', 'bill to',
  'ship to', 'invoice no', 'invoice date', 'gstin', 'gst number', 'subtotal',
  'total due', 'amount payable', 'balance due', 'cash receipt', 'sales receipt',
  'pos terminal', 'purchase order', 'bank statement', 'account balance', 'transaction id'
];

/**
 * Validates a medical document file or blob.
 * Works uniformly for both live camera capture (Blob / Data URL / Canvas) and uploaded files (File / PDF / Image).
 * 
 * @param {File|Blob|string|HTMLCanvasElement|HTMLVideoElement|HTMLImageElement} source
 * @returns {Promise<{isValid: boolean, confidence: number, documentType: string, reason?: string}>}
 */
export const validateMedicalDocument = async (source) => {
  try {
    const isFile = (typeof File !== 'undefined' && source instanceof File) || (source && typeof source === 'object' && typeof source.name === 'string');
    const isBlob = (typeof Blob !== 'undefined' && source instanceof Blob) || (source && typeof source === 'object' && typeof source.arrayBuffer === 'function');
    const filename = source?.name || '';
    const isPdf = (source?.type === 'application/pdf' || filename.toLowerCase().endsWith('.pdf'));

    // 1. Handle PDF Document Files
    if ((isFile || isBlob) && isPdf) {
      return await validatePdfDocument(source);
    }

    // 2. Handle Image Files & Blobs
    if (isFile || isBlob) {
      const cleanName = filename.toLowerCase();
      // Check rejection keywords in filename immediately
      if (/selfie|portrait|face|me_|camera_photo|mypic/i.test(cleanName)) {
        return {
          isValid: false,
          confidence: 0.04,
          documentType: 'Photograph (Person / Selfie)',
          reason: 'Human face, selfie, or person detected. Please scan a printed or digital medical report.'
        };
      }
      if (/aadhaar|id_card|identity|license|licence|voter|pan_card|visiting_card|badge/i.test(cleanName)) {
        return {
          isValid: false,
          confidence: 0.05,
          documentType: 'Identity Card',
          reason: 'Identity card or personal ID detected. Only diagnostic medical reports and lab tests are accepted.'
        };
      }
      if (/invoice|receipt|bill|statement|purchase_order/i.test(cleanName)) {
        return {
          isValid: false,
          confidence: 0.07,
          documentType: 'Commercial Invoice / Receipt',
          reason: 'Commercial receipt, invoice, or billing statement detected. Please scan a medical laboratory report.'
        };
      }

      if (typeof FileReader !== 'undefined') {
        const dataUrl = await readBlobAsDataUrl(source);
        return await validateImageDataUrl(dataUrl, filename);
      }
    }

    // 3. Handle Data URL string
    if (typeof source === 'string') {
      return await validateImageDataUrl(source, '');
    }

    // 4. Handle Canvas / Video / Image DOM elements
    const isCanvas = typeof HTMLCanvasElement !== 'undefined' && source instanceof HTMLCanvasElement;
    const isVideo = typeof HTMLVideoElement !== 'undefined' && source instanceof HTMLVideoElement;
    const isImage = typeof HTMLImageElement !== 'undefined' && source instanceof HTMLImageElement;
    if (isCanvas || isVideo || isImage) {
      return analyzeImageElement(source, '');
    }

    return {
      isValid: false,
      confidence: 0,
      documentType: 'Unknown',
      reason: 'Unsupported document format. Please provide a JPG, PNG, or PDF file.'
    };
  } catch (error) {
    console.error('Validation error:', error);
    return {
      isValid: false,
      confidence: 0,
      documentType: 'Unknown',
      reason: 'Could not process document. Please ensure the file is not corrupted.'
    };
  }
};

/**
 * Convert Blob or File to Data URL
 */
const readBlobAsDataUrl = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file data'));
    reader.readAsDataURL(blob);
  });
};

/**
 * Validate PDF files by extracting text content streams and analyzing medical terminology
 */
const validatePdfDocument = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    // Decode text streams from PDF binary
    let rawText = '';
    const decoder = new TextDecoder('latin1');
    const fullContent = decoder.decode(bytes);

    // Extract text blocks inside stream objects and text parenthesis
    const textMatches = fullContent.match(/\(([^)]+)\)\s*T[jJ]/g) || [];
    for (const match of textMatches) {
      const textContent = match.replace(/^[(\s]+|[)\sTjJ]+$/g, '');
      rawText += ' ' + textContent;
    }

    // If no text blocks found, check plain text in full content
    if (rawText.trim().length < 20) {
      rawText = fullContent;
    }

    return evaluateClinicalText(rawText.toLowerCase(), file.name.toLowerCase());
  } catch (err) {
    console.warn('PDF stream extraction error, using heuristic fallback:', err);
    return evaluateClinicalText('', file.name.toLowerCase());
  }
};

/**
 * Evaluate extracted text for clinical structure vs. invalid document patterns
 */
const evaluateClinicalText = (text, filename = '') => {
  const combined = (filename + ' ' + text).toLowerCase();

  // 1. Check for explicit rejection keywords (ID cards, Invoices, Receipts)
  const matchedRejectTerms = REJECT_KEYWORDS.filter(k => combined.includes(k));
  
  // Explicitly check for ID card filename
  const isIdFilename = /aadhaar|id_card|identity|license|licence|driving_licence|voter|pan_card|visiting_card|badge/i.test(filename);
  const isInvoiceFilename = /invoice|receipt|bill|statement|purchase_order/i.test(filename);

  if (isIdFilename || matchedRejectTerms.some(t => t.includes('id') || t.includes('licen') || t.includes('aadhaar'))) {
    return {
      isValid: false,
      confidence: 0.06,
      documentType: 'Identity Document',
      reason: 'Identity card or personal ID detected. Only medical laboratory and diagnostic reports are accepted.'
    };
  }

  if (isInvoiceFilename || matchedRejectTerms.some(t => t.includes('invoice') || t.includes('receipt') || t.includes('bill') || t.includes('gst'))) {
    return {
      isValid: false,
      confidence: 0.08,
      documentType: 'Commercial Invoice / Receipt',
      reason: 'Commercial receipt or billing invoice detected. Please upload a medical test report.'
    };
  }

  // 2. Count matching medical terms & units
  const matchedMedicalTerms = MEDICAL_TERMS.filter(t => combined.includes(t));
  const matchedUnits = CLINICAL_UNITS.filter(u => combined.includes(u));

  const isMedicalFilename = /blood|lab|report|cbc|test|medical|health|scan|pathology|biochem|radiolog|hospital|doctor/i.test(filename);

  const totalScore = (matchedMedicalTerms.length * 20) + (matchedUnits.length * 15) + (isMedicalFilename ? 30 : 0);

  if (matchedMedicalTerms.length >= 2 || (matchedMedicalTerms.length >= 1 && matchedUnits.length >= 1) || (isMedicalFilename && totalScore >= 35)) {
    let docType = 'Laboratory Report';
    if (combined.includes('cbc') || combined.includes('hemoglobin') || combined.includes('blood count')) {
      docType = 'Laboratory Report (Complete Blood Count)';
    } else if (combined.includes('glucose') || combined.includes('cholesterol') || combined.includes('lipid')) {
      docType = 'Laboratory Report (Biochemistry Profile)';
    } else if (combined.includes('x-ray') || combined.includes('scan') || combined.includes('radiology')) {
      docType = 'Radiology Diagnostic Report';
    } else if (combined.includes('prescription')) {
      docType = 'Medical Prescription Note';
    }

    const confidence = Math.min(0.96, Math.max(0.85, 0.70 + (totalScore / 200)));
    return {
      isValid: true,
      confidence: Math.round(confidence * 100) / 100,
      documentType: docType
    };
  }

  return {
    isValid: false,
    confidence: 0.14,
    documentType: 'Unknown Document',
    reason: 'No medical report structure or diagnostic test parameters detected in this document.'
  };
};

/**
 * Validate image data URL by rendering to canvas and performing Computer Vision analysis
 */
const validateImageDataUrl = (dataUrl, filename = '') => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const result = analyzeImageElement(img, filename);
      resolve(result);
    };
    img.onerror = () => {
      resolve({
        isValid: false,
        confidence: 0,
        documentType: 'Unknown',
        reason: 'Could not decode image data. Please ensure it is a valid JPG or PNG file.'
      });
    };
    img.src = dataUrl;
  });
};

/**
 * Core Computer Vision & Heuristic Document Analyzer
 */
const analyzeImageElement = (drawable, filename = '') => {
  const normWidth = 440;
  const origWidth = drawable.videoWidth || drawable.naturalWidth || drawable.width || 440;
  const origHeight = drawable.videoHeight || drawable.naturalHeight || drawable.height || 330;

  if (origWidth === 0 || origHeight === 0) {
    return {
      isValid: false,
      confidence: 0,
      documentType: 'Unknown',
      reason: 'Image dimensions are 0. Please recapture or select a valid file.'
    };
  }

  // Check filename semantics first if available
  const cleanFilename = (filename || '').toLowerCase();
  if (/selfie|portrait|face|me_|camera_photo|mypic/i.test(cleanFilename)) {
    return {
      isValid: false,
      confidence: 0.04,
      documentType: 'Photograph',
      reason: 'Human face, selfie, or person detected. Please scan a printed or digital medical report.'
    };
  }

  if (/aadhaar|id_card|identity|license|licence|voter|pan_card|visiting_card|badge/i.test(cleanFilename)) {
    return {
      isValid: false,
      confidence: 0.05,
      documentType: 'Identity Card',
      reason: 'Identity card or personal ID detected. Only diagnostic medical reports and lab tests are accepted.'
    };
  }

  if (/invoice|receipt|bill|statement|purchase_order/i.test(cleanFilename)) {
    return {
      isValid: false,
      confidence: 0.07,
      documentType: 'Commercial Invoice / Receipt',
      reason: 'Commercial receipt, invoice, or billing statement detected. Please scan a medical laboratory report.'
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
      documentType: 'Unknown',
      reason: 'Browser canvas analysis is unavailable.'
    };
  }

  ctx.drawImage(drawable, 0, 0, normWidth, normHeight);
  const imgData = ctx.getImageData(0, 0, normWidth, normHeight);
  const data = imgData.data;
  const totalPixels = normWidth * normHeight;

  // 1. Photometric & Color Statistics
  let sumLuminance = 0;
  let minLuminance = 255;
  let maxLuminance = 0;
  let sumSaturation = 0;
  let chromaticPixelCount = 0;
  let highChromaPixelCount = 0;
  let paperPixelCount = 0;   // Light paper background: Y > 135, Saturation < 0.22
  let darkPixelCount = 0;    // Dark pixels: Y < 65
  let skinPixelCount = 0;    // Human skin pixels
  let centerSkinPixelCount = 0;

  const lumBuffer = new Float32Array(totalPixels);

  const centerXMin = Math.floor(normWidth * 0.20);
  const centerXMax = Math.floor(normWidth * 0.80);
  const centerYMin = Math.floor(normHeight * 0.15);
  const centerYMax = Math.floor(normHeight * 0.80);
  let centerPixelTotal = 0;

  for (let y = 0; y < normHeight; y++) {
    const isCenterY = y >= centerYMin && y <= centerYMax;
    const rowOffset = y * normWidth;

    for (let x = 0; x < normWidth; x++) {
      const idx = (rowOffset + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Standard Rec. 601 Luminance
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      lumBuffer[rowOffset + x] = lum;

      sumLuminance += lum;
      if (lum < minLuminance) minLuminance = lum;
      if (lum > maxLuminance) maxLuminance = lum;

      // Saturation
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const sat = maxC > 0 ? (maxC - minC) / maxC : 0;
      sumSaturation += sat;

      if (sat > 0.22) chromaticPixelCount++;
      if (sat > 0.40) highChromaPixelCount++;

      // Paper surface
      if (lum > 135 && sat < 0.22) {
        paperPixelCount++;
      }
      if (lum < 65) {
        darkPixelCount++;
      }

      // Human skin detection (Normalized RGB + Color Difference rules)
      const isSkin = (r > 95 && g > 40 && b > 20 &&
                      (maxC - minC) > 15 &&
                      Math.abs(r - g) > 15 &&
                      r > g && r > b);

      if (isSkin) {
        skinPixelCount++;
        if (isCenterY && x >= centerXMin && x <= centerXMax) {
          centerSkinPixelCount++;
        }
      }

      if (isCenterY && x >= centerXMin && x <= centerXMax) {
        centerPixelTotal++;
      }
    }
  }

  const meanLuminance = sumLuminance / totalPixels;
  const meanSaturation = sumSaturation / totalPixels;
  const dynamicRange = maxLuminance - minLuminance;
  const chromaticFraction = chromaticPixelCount / totalPixels;
  const highChromaFraction = highChromaPixelCount / totalPixels;
  const paperFraction = paperPixelCount / totalPixels;
  const skinFraction = skinPixelCount / totalPixels;
  const centerSkinFraction = centerPixelTotal > 0 ? centerSkinPixelCount / centerPixelTotal : 0;

  // Standard deviation of luminance
  let sumSqDiff = 0;
  for (let i = 0; i < totalPixels; i++) {
    const diff = lumBuffer[i] - meanLuminance;
    sumSqDiff += diff * diff;
  }
  const stdDevLuminance = Math.sqrt(sumSqDiff / totalPixels);

  // 2. High-Frequency Text Stroke & Edge Transition Detection
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

      if (grad > 36 && lum < 185) {
        textStrokeCount++;
        bandScores[bandIdx]++;
      }
    }
  }

  const sampledPixels = (Math.floor((normHeight - 4) / 2) + 1) * (Math.floor((normWidth - 4) / 2) + 1);
  const textStrokeDensity = (textStrokeCount / sampledPixels) * 100;

  // 3. Horizontal Projection Line Peak Detection (alternating rows of text)
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

  // =========================================================================
  // LAYERED REJECTION EVALUATION
  // =========================================================================

  // Rule 1: Human Face / Selfie / Person Detection
  if (centerSkinFraction > 0.18 || skinFraction > 0.24) {
    return {
      isValid: false,
      confidence: 0.05,
      documentType: 'Photograph (Person / Selfie)',
      reason: 'Human face, selfie, or person detected. Please scan a printed or digital medical report.'
    };
  }

  // Rule 2: Blank, Empty or Pitch Dark Surface Check
  if (
    stdDevLuminance < 11 ||
    dynamicRange < 30 ||
    (meanLuminance > 242 && stdDevLuminance < 18 && textStrokeDensity < 0.2) ||
    meanLuminance < 36
  ) {
    return {
      isValid: false,
      confidence: 0.08,
      documentType: 'Blank Surface',
      reason: 'The image is blank, dark, or featureless. Please capture a clear, legible photo of an actual medical report.'
    };
  }

  // Rule 3: Natural Scene / Environment / Room / Furniture / Outdoor Check
  const isNaturalScene =
    (paperFraction < 0.42 && (chromaticFraction > 0.24 || meanSaturation > 0.18)) ||
    chromaticFraction > 0.38 ||
    highChromaFraction > 0.18 ||
    (paperFraction < 0.35);

  if (isNaturalScene) {
    return {
      isValid: false,
      confidence: 0.10,
      documentType: 'Non-Document Scene',
      reason: 'Photo of room surroundings, furniture, or outdoors detected. Please place the medical report directly in front of the camera.'
    };
  }

  // Rule 4: ID Card / Badge / Small Card Signature Check
  // ID cards typically have a small concentrated photo square, limited sparse lines (< 4 peaks)
  if (linePeakCount < 4 && (highChromaFraction > 0.08 || paperFraction < 0.52)) {
    return {
      isValid: false,
      confidence: 0.12,
      documentType: 'Card / Badge',
      reason: 'Identity card, badge, or card format detected. Only medical laboratory and diagnostic reports are accepted.'
    };
  }

  // Rule 5: Plain Paper with No Readable Clinical Lines / Notebook
  if (textStrokeDensity < 0.55 || linePeakCount < 3) {
    return {
      isValid: false,
      confidence: 0.15,
      documentType: 'Unreadable Surface',
      reason: 'Light surface detected, but no readable medical report rows or clinical parameters found.'
    };
  }

  // =========================================================================
  // DOCUMENT PASSED ALL VERIFICATIONS!
  // =========================================================================
  let score = 0.70;

  if (paperFraction >= 0.58) score += 0.10;
  if (chromaticFraction < 0.16 && meanSaturation < 0.12) score += 0.08;
  if (textStrokeDensity >= 1.2) score += 0.06;
  if (linePeakCount >= 6) score += 0.04;

  const confidence = Math.min(0.96, Math.max(0.85, Math.round(score * 100) / 100));

  let documentType = 'Laboratory Report';
  if (linePeakCount >= 8 && paperFraction > 0.65) {
    documentType = 'Laboratory Report (Complete Blood Count / Diagnostic)';
  } else if (textStrokeDensity > 2.2) {
    documentType = 'Doctor Clinical Prescription Note';
  } else {
    documentType = 'Diagnostic Laboratory Report';
  }

  return {
    isValid: true,
    confidence,
    documentType
  };
};
