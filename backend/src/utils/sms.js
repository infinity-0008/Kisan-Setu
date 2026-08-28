import logger from "./logger.js";

/**
 * SMS utility for OTP delivery
 * For hackathon: logs to console instead of actual SMS
 * In production: integrate with Twilio/MSG91
 */

/**
 * Send OTP via SMS
 * @param {string} mobile - 10-digit mobile number
 * @param {string} otp - OTP string
 * @returns {Object} { success, messageId }
 */
export const sendOTP = async (mobile, otp) => {
  try {
    // For hackathon: just log the OTP
    logger.info(`[SMS SIMULATED] OTP ${otp} sent to ${mobile}`);

    // In production: uncomment and configure
    // const client = new twilio(accountSid, authToken);
    // const message = await client.messages.create({
    //   body: `Your Kisan Setu OTP is: ${otp}. Valid for 10 minutes.`,
    //   from: '+1234567890',
    //   to: `+91${mobile}`,
    // });

    return {
      success: true,
      messageId: `simulated-${Date.now()}`,
      mobile,
    };
  } catch (error) {
    logger.error(`SMS send error: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Send generic SMS (for notifications)
 * @param {string} mobile
 * @param {string} message
 * @returns {Object}
 */
export const sendSMS = async (mobile, message) => {
  try {
    logger.info(`[SMS SIMULATED] ${message} sent to ${mobile}`);
    return { success: true };
  } catch (error) {
    logger.error(`SMS send error: ${error.message}`);
    return { success: false, error: error.message };
  }
};
