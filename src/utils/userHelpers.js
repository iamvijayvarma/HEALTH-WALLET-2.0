/**
 * Utility helper to safely extract or fallback the shared Health Wallet ID.
 * Guarantees that Profile, Dashboard, Offline Wallet, and Emergency always display the exact same ID.
 *
 * @param {object} [user] - The user object from HealthWalletContext
 * @returns {string} The standardized Health Wallet ID (e.g. 'HW-20481' or 'HW-XXXXXXXX')
 */
export const getHealthWalletId = (user) => user?.healthWalletId || user?.id || 'HW-20481';

/**
 * Generates a unique Health Wallet ID in the standard format HW-XXXXXXXX.
 *
 * @returns {string} Unique Health Wallet ID (e.g. 'HW-94810237' or 'HW-7B92A41E')
 */
export const generateHealthWalletId = () => {
  const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomPart = '';
  for (let i = 0; i < 8; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `HW-${randomPart}`;
};

/**
 * Masks an Aadhaar number to only show the last 4 digits.
 * Never displays the complete Aadhaar number.
 * Example: '987654321098' -> 'XXXX XXXX 1098'
 *
 * @param {string|number} aadhaar - 12-digit Aadhaar number
 * @returns {string} Masked representation
 */
export const maskAadhaar = (aadhaar) => {
  if (!aadhaar) return 'XXXX XXXX —';
  const clean = String(aadhaar).replace(/\D/g, '');
  if (clean.length < 4) return 'XXXX XXXX XXXX';
  const last4 = clean.slice(-4);
  return `XXXX XXXX ${last4}`;
};

/**
 * Validates a 12-digit Aadhaar number (digits only).
 *
 * @param {string} aadhaar
 * @returns {boolean}
 */
export const isValidAadhaar = (aadhaar) => {
  if (!aadhaar) return false;
  const clean = String(aadhaar).trim().replace(/\s+/g, '');
  return /^\d{12}$/.test(clean);
};

/**
 * Validates a 10-digit mobile number (digits only).
 *
 * @param {string} mobile
 * @returns {boolean}
 */
export const isValidMobile = (mobile) => {
  if (!mobile) return false;
  const clean = String(mobile).trim().replace(/\D/g, '');
  return /^\d{10}$/.test(clean);
};

/**
 * Validates an email address.
 *
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
};

