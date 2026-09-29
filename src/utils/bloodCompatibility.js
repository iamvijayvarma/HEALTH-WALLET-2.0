/**
 * Health Wallet 2.0 - Blood Compatibility Utility
 * 
 * Simplified red blood cell donor compatibility model for development prototype.
 * 
 * Medical Disclaimer:
 * Blood matching shown here is a preliminary donor compatibility aid. 
 * Final blood compatibility and transfusion decisions must be verified by qualified healthcare professionals.
 */

export const BLOOD_COMPATIBILITY_MAP = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal red blood cell donor
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'] // Universal red blood cell recipient
};

/**
 * Checks if a donor blood group is compatible to donate red blood cells to a recipient
 * @param {string} donorGroup 
 * @param {string} recipientGroup 
 * @returns {boolean}
 */
export const canDonateTo = (donorGroup, recipientGroup) => {
  if (!donorGroup || !recipientGroup) return false;
  const normalizedDonor = donorGroup.trim().toUpperCase();
  const normalizedRecipient = recipientGroup.trim().toUpperCase();
  const compatibleRecipients = BLOOD_COMPATIBILITY_MAP[normalizedDonor] || [];
  return compatibleRecipients.includes(normalizedRecipient);
};

/**
 * Returns list of donor blood groups compatible with the recipient
 * @param {string} recipientGroup 
 * @returns {string[]}
 */
export const getCompatibleDonorGroups = (recipientGroup) => {
  if (!recipientGroup) return [];
  const normalizedRecipient = recipientGroup.trim().toUpperCase();
  return Object.keys(BLOOD_COMPATIBILITY_MAP).filter(donor =>
    BLOOD_COMPATIBILITY_MAP[donor].includes(normalizedRecipient)
  );
};

/**
 * Filters and ranks donors based on blood compatibility and location match
 * @param {Array} donors 
 * @param {string} bloodGroupNeeded 
 * @param {string} targetLocation 
 * @returns {Array}
 */
export const matchCompatibleDonors = (donors = [], bloodGroupNeeded = '', targetLocation = '') => {
  if (!bloodGroupNeeded) return [];

  // 1. Filter by compatibility and availability
  const compatible = donors.filter(d => {
    const isAvailable = (d.availability || 'Available').toLowerCase() === 'available';
    return isAvailable && canDonateTo(d.bloodGroup, bloodGroupNeeded);
  });

  // 2. Rank location matches
  const normalizedTarget = (targetLocation || '').trim().toLowerCase();

  return compatible.sort((a, b) => {
    const aLoc = (a.location || '').toLowerCase();
    const bLoc = (b.location || '').toLowerCase();

    const aMatch = normalizedTarget ? aLoc.includes(normalizedTarget) : false;
    const bMatch = normalizedTarget ? bLoc.includes(normalizedTarget) : false;

    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  });
};
