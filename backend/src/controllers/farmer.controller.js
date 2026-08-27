import Farmer from "../models/farmer.model.js";
import { HTTP_STATUS, OTP_EXPIRY_MINUTES } from "../constants.js";
import { generateOTP, hashOTP, verifyOTP } from "../utils/otp.js";
import { generateAccessToken } from "../utils/jwt.js";
import { sendOTP } from "../utils/sms.js";
import { fetchFarmerProfile, verifyFarmer } from "../utils/agristack.js";
import logger from "../utils/logger.js";

/**
 * @desc    Send OTP to farmer's mobile
 * @route   POST /api/v1/farmers/send-otp
 * @access  Public
 */
export const sendOTPHandler = async (req, res) => {
  try {
    const { kisanId, mobile } = req.body;

    if (!kisanId || !mobile) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Kisan ID and mobile number are required",
      });
    }

    // Verify with AgriStack (or mock)
    const { verified, profile } = await verifyFarmer(kisanId, mobile);

    if (!verified) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Kisan ID and mobile number do not match our records",
      });
    }

    // Find or create farmer
    let farmer = await Farmer.findOne({ kisanId });

    if (!farmer) {
      farmer = await Farmer.create({
        kisanId,
        name: profile.name,
        mobile,
        state: profile.state,
        district: profile.district,
        village: profile.village,
        landHolding: profile.landHolding,
        landParcels: profile.landParcels,
        cropsGrown: profile.cropsGrown,
        beneficiaryStatus: profile.beneficiaryStatus,
        profileVerified: true,
        agriStackLastSynced: new Date(),
      });
    } else {
      // Update profile from AgriStack
      farmer.name = profile.name;
      farmer.landHolding = profile.landHolding;
      farmer.landParcels = profile.landParcels;
      farmer.cropsGrown = profile.cropsGrown;
      farmer.beneficiaryStatus = profile.beneficiaryStatus;
      farmer.agriStackLastSynced = new Date();
      await farmer.save();
    }

    // Generate and store OTP
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);
    const otpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    farmer.otp = hashedOTP;
    farmer.otpExpires = otpExpires;
    await farmer.save({ validateBeforeSave: false });

    // Send OTP via SMS
    await sendOTP(mobile, otp);

    logger.info(`OTP sent to ${mobile} for Kisan ID: ${kisanId}`);

    return res.status(HTTP_STATUS.OK).json({
      message: "OTP sent successfully",
      kisanId,
      expiresIn: OTP_EXPIRY_MINUTES,
    });
  } catch (error) {
    logger.error(`Send OTP error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to send OTP",
    });
  }
};

/**
 * @desc    Verify OTP and login
 * @route   POST /api/v1/farmers/verify-otp
 * @access  Public
 */
export const verifyOTPHandler = async (req, res) => {
  try {
    const { kisanId, otp } = req.body;

    if (!kisanId || !otp) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Kisan ID and OTP are required",
      });
    }

    const farmer = await Farmer.findOne({
      kisanId,
      otpExpires: { $gt: new Date() },
    }).select("+otp +otpExpires");

    if (!farmer) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Invalid or expired OTP",
      });
    }

    if (!verifyOTP(otp, farmer.otp)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Invalid OTP",
      });
    }

    // Clear OTP
    farmer.otp = undefined;
    farmer.otpExpires = undefined;

    // Generate session token
    const token = generateAccessToken({ _id: farmer._id });
    farmer.sessionToken = token;
    await farmer.save({ validateBeforeSave: false });

    logger.info(`Farmer logged in: ${kisanId}`);

    return res.status(HTTP_STATUS.OK).json({
      message: "Login successful",
      token,
      farmer: {
        kisanId: farmer.kisanId,
        name: farmer.name,
        state: farmer.state,
        district: farmer.district,
        landHolding: farmer.landHolding,
        cropsGrown: farmer.cropsGrown,
        beneficiaryStatus: farmer.beneficiaryStatus,
      },
    });
  } catch (error) {
    logger.error(`Verify OTP error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to verify OTP",
    });
  }
};

/**
 * @desc    Get farmer profile
 * @route   GET /api/v1/farmers/profile
 * @access  Private (requires auth)
 */
export const getProfile = async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.user._id)
      .select("-otp -otpExpires -sessionToken");

    return res.status(HTTP_STATUS.OK).json({
      farmer,
    });
  } catch (error) {
    logger.error(`Get profile error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to fetch profile",
    });
  }
};

/**
 * @desc    Sync farmer profile from AgriStack
 * @route   POST /api/v1/farmers/sync-agristack
 * @access  Private
 */
export const syncAgriStack = async (req, res) => {
  try {
    const profile = await fetchFarmerProfile(req.user.kisanId);

    const farmer = await Farmer.findByIdAndUpdate(
      req.user._id,
      {
        name: profile.name,
        landHolding: profile.landHolding,
        landParcels: profile.landParcels,
        cropsGrown: profile.cropsGrown,
        beneficiaryStatus: profile.beneficiaryStatus,
        agriStackLastSynced: new Date(),
      },
      { new: true }
    );

    return res.status(HTTP_STATUS.OK).json({
      message: "Profile synced from AgriStack",
      farmer,
    });
  } catch (error) {
    logger.error(`AgriStack sync error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to sync from AgriStack",
    });
  }
};
