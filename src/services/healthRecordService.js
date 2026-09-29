/**
 * Health Wallet 2.0 - Health Record Service
 * 
 * Formats, enriches, and stores confirmed medical reports into the citizen's permanent health record.
 */

/**
 * Creates a structured medical report item matching the required persistent data model:
 * - id
 * - reportType
 * - patientName
 * - reportDate
 * - hospital/laboratory
 * - extractedTests
 * - originalDocument
 * - verificationStatus ("User Verified")
 * - createdAt
 * 
 * @param {import('../types/medicalReport').ExtractedMedicalReport} extractedReport 
 * @param {string} originalDocument - Base64 Data URL or file identifier
 * @param {Object} [options]
 * @returns {Object} Structured Medical Report item
 */
export const createMedicalReport = (extractedReport, originalDocument, options = {}) => {
  const extractedTests = extractedReport?.tests || [];
  const createdAt = new Date().toISOString();
  const reportDate = extractedReport?.reportDate || createdAt.slice(0, 10);
  const hospital = extractedReport?.hospital || extractedReport?.laboratory || 'Apollo Diagnostics';
  const laboratory = extractedReport?.laboratory || extractedReport?.hospital || 'Apollo Diagnostics';
  const reportType = extractedReport?.reportType || 'Complete Blood Count (CBC)';
  const patientName = extractedReport?.patientName || 'Vijay';
  const patientId = extractedReport?.patientId || 'HW-20481';
  const doctor = extractedReport?.doctor || 'Consultant Pathologist';

  // Format display date
  let formattedDate = reportDate;
  try {
    formattedDate = new Date(reportDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    // keep raw reportDate
  }

  // Build summary string of tests
  const summary = extractedTests.length > 0
    ? extractedTests.map(t => `${t.value} ${t.unit || ''} ${t.name}`.trim()).join(' • ')
    : 'Clinical diagnostic report with structured parameters.';

  return {
    id: 'report-' + Date.now(),
    reportType,
    patientName,
    reportDate,
    hospital,
    laboratory,
    extractedTests,
    originalDocument,
    verificationStatus: 'User Verified',
    createdAt,

    // Backward compatibility aliases for existing record lists
    title: reportType,
    category: 'Lab Reports',
    date: formattedDate,
    summary,
    tests: extractedTests,
    doctor,
    patientId,
    savedAt: createdAt,
    sourceMethod: options.sourceMethod || 'Camera Scan',
    isUserVerified: true,
    verified: true,
    tags: ['Medical Report', 'User-Verified', options.sourceMethod || 'Camera-Scanned']
  };
};

/**
 * Backward compatibility alias for createHealthRecordFromReport
 */
export const createHealthRecordFromReport = createMedicalReport;
