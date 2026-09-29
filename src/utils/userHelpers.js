/**
 * Utility helper to safely extract or fallback the shared Health Wallet ID.
 * Guarantees that Profile and Offline Wallet always display the exact same ID.
 *
 * @param {object} [user] - The user object from HealthWalletContext
 * @returns {string} The standardized Health Wallet ID (e.g. 'HW-20481')
 */
export const getHealthWalletId = (user) => user?.healthWalletId || user?.id || 'HW-20481';
