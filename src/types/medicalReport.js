/**
 * Health Wallet 2.0 - Medical Report Type Definitions & Constants
 * 
 * Defines data structures and constants for the end-to-end Medical Report Processing Pipeline:
 * Input -> Validation -> OCR Extraction -> Review -> Confirmation -> Health Records
 */

/**
 * @typedef {'INPUT' | 'VALIDATING' | 'VALID' | 'REJECTED' | 'EXTRACTING' | 'REVIEW' | 'USER_CONFIRMED' | 'SAVED'} ProcessingStage
 */

/**
 * @typedef {Object} MedicalValidationResult
 * @property {boolean} isMedicalReport - Whether the document is classified as a valid medical report
 * @property {boolean} isValid - Alias for isMedicalReport
 * @property {number} confidence - Confidence score between 0.0 and 1.0
 * @property {string} documentType - E.g. "Laboratory Report", "Pathology Report", "Radiology Report"
 * @property {string} [reason] - Specific explanation if rejected
 */

/**
 * @typedef {Object} MedicalTest
 * @property {string|number} id - Unique identifier for row
 * @property {string} name - Test/Investigation name (e.g. "Hemoglobin")
 * @property {string} value - Observed result value (e.g. "13.8")
 * @property {string} unit - Measurement unit (e.g. "g/dL")
 * @property {string} referenceRange - Biological reference interval (e.g. "12.0 - 16.0")
 * @property {number} confidence - Extraction confidence between 0.0 and 1.0
 * @property {'High' | 'Medium' | 'Low'} confidenceLevel - Human-readable extraction confidence rating
 */

/**
 * @typedef {Object} ExtractedMedicalReport
 * @property {string} patientName - Extracted patient name
 * @property {string} [patientId] - Patient identifier if available
 * @property {string} reportType - E.g. "Complete Blood Count (CBC)", "Lipid Profile"
 * @property {string} reportDate - Date of report (YYYY-MM-DD or formatted)
 * @property {string} [collectionDate] - Date of sample collection
 * @property {string} hospital - Hospital or clinic name
 * @property {string} laboratory - Diagnostic laboratory facility
 * @property {string} [doctor] - Referring doctor or consultant pathologist
 * @property {string} [sampleType] - E.g. "Whole Blood EDTA", "Serum", "Urine"
 * @property {MedicalTest[]} tests - Array of extracted clinical tests
 * @property {number} overallConfidence - Aggregate extraction confidence
 */

export const DEFAULT_SAMPLE_TESTS = [
  {
    id: 1,
    name: 'Hemoglobin',
    value: '13.8',
    unit: 'g/dL',
    referenceRange: '12.0 - 16.0',
    confidence: 0.95,
    confidenceLevel: 'High'
  },
  {
    id: 2,
    name: 'Total Leukocyte Count (WBC)',
    value: '7200',
    unit: '/µL',
    referenceRange: '4000 - 11000',
    confidence: 0.92,
    confidenceLevel: 'High'
  },
  {
    id: 3,
    name: 'Platelet Count',
    value: '2.4 lakh',
    unit: '/µL',
    referenceRange: '1.5 - 4.5 lakh',
    confidence: 0.94,
    confidenceLevel: 'High'
  },
  {
    id: 4,
    name: 'Fasting Blood Glucose',
    value: '96',
    unit: 'mg/dL',
    referenceRange: '70 - 100',
    confidence: 0.88,
    confidenceLevel: 'Medium'
  }
];
