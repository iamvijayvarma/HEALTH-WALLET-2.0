/**
 * Health Wallet 2.0 - Medical Document Validation Service
 * 
 * Determines whether an input document (camera capture, uploaded image, or PDF)
 * is a genuine medical report / laboratory report before passing it to the OCR & AI extraction stage.
 * 
 * Rejects non-medical inputs (selfies, people, walls, furniture, ID cards, invoices, receipts, books, blank pages).
 */

import { validateMedicalDocument as baseValidator } from '../utils/medicalDocumentValidator';

/**
 * Validates whether the provided file or image source is a legitimate medical document.
 * 
 * @param {File|Blob|string|HTMLCanvasElement|HTMLVideoElement|HTMLImageElement} source 
 * @returns {Promise<{isMedicalReport: boolean, isValid: boolean, confidence: number, documentType: string, reason?: string}>}
 */
export const validateMedicalDocument = async (source) => {
  const result = await baseValidator(source);
  return {
    isMedicalReport: result.isValid,
    isValid: result.isValid,
    confidence: result.confidence,
    documentType: result.documentType || 'Unknown',
    reason: result.reason
  };
};
