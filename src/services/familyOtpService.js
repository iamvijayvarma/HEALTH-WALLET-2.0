/**
 * Family OTP Service Abstraction
 * 
 * Provides mock OTP generation and verification for development/prototype mode.
 * Easily replaceable with a production telecom SMS / OTP provider (e.g. Twilio, AWS SNS, Karix, etc.).
 */

const DEV_OTP_CODE = '123456';
const otpStorage = new Map();

/**
 * Requests an OTP for a given mobile number.
 * @param {string} mobileNumber 
 * @returns {Promise<{ success: boolean, otp: string, isDevelopment: boolean, message: string }>}
 */
export const requestOtp = async (mobileNumber) => {
  const normalizedNumber = (mobileNumber || '').replace(/\D/g, '');
  const otp = DEV_OTP_CODE;
  otpStorage.set(normalizedNumber, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes validity
  });

  return {
    success: true,
    otp,
    isDevelopment: true,
    message: `Development OTP generated: ${otp}`
  };
};

/**
 * Verifies an OTP for a given mobile number.
 * @param {string} mobileNumber 
 * @param {string} otpCode 
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const verifyOtp = async (mobileNumber, otpCode) => {
  const normalizedNumber = (mobileNumber || '').replace(/\D/g, '');
  const stored = otpStorage.get(normalizedNumber);

  // Accept DEV_OTP_CODE or stored OTP
  if (otpCode === DEV_OTP_CODE || (stored && stored.otp === otpCode)) {
    return {
      success: true,
      message: 'Mobile number verified successfully'
    };
  }

  return {
    success: false,
    message: 'Invalid OTP code. Please enter the development code (123456).'
  };
};
