import Farmer from "../models/farmer.model.js";
import { HTTP_STATUS, OTP_EXPIRY_MINUTES } from "../constants.js";
import { generateOTP, hashOTP, verifyOTP } from "../utils/otp.js";
import { generateAccessToken } from "../utils/jwt.js";
import { sendOTP } from "../utils/sms.js";
import { fetchFarmerProfile, verifyFarmer } from "../utils/agristack.js";
import logger from "../utils/logger.js";

/**
 * @desc    Send OTP to farmer's mobile (Auto-links AgriStack profile by mobile number)
 * @route   POST /api/v1/farmers/send-otp
 * @access  Public
 */
export const sendOTPHandler = async (req, res) => {
  try {
    const { kisanId: inputKisanId, mobile } = req.body;

    if (!mobile) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Mobile number is required",
      });
    }

    // 1. Fetch profile from AgriStack registry by mobile or kisanId
    const profile = await fetchFarmerProfile(inputKisanId || mobile, mobile);

    // 2. Find existing farmer by mobile or kisanId
    let farmer = await Farmer.findOne({ mobile });
    if (!farmer) {
      farmer = await Farmer.findOne({ kisanId: profile.kisanId });
    }

    const finalKisanId = farmer?.kisanId || profile.kisanId;

    if (!farmer) {
      try {
        farmer = await Farmer.create({
          kisanId: finalKisanId,
          name: profile.name,
          mobile,
          state: profile.state,
          district: profile.district,
          village: profile.village,
          landHolding: profile.landHolding,
          landParcels: profile.landParcels || [],
          cropsGrown: profile.cropsGrown || [],
          beneficiaryStatus: profile.beneficiaryStatus,
          profileVerified: true,
          agriStackLastSynced: new Date(),
        });
      } catch (createErr) {
        // If duplicate kisanId error occurred, fallback to find by kisanId or generate unique kisanId
        if (createErr.code === 11000) {
          farmer = await Farmer.findOne({ kisanId: finalKisanId });
          if (!farmer) {
            const fallbackKisanId = `KISAN${mobile.slice(-6)}`;
            farmer = await Farmer.create({
              kisanId: fallbackKisanId,
              name: profile.name,
              mobile,
              state: profile.state,
              district: profile.district,
              village: profile.village,
              landHolding: profile.landHolding,
              landParcels: profile.landParcels || [],
              cropsGrown: profile.cropsGrown || [],
              beneficiaryStatus: profile.beneficiaryStatus,
              profileVerified: true,
              agriStackLastSynced: new Date(),
            });
          }
        } else {
          throw createErr;
        }
      }
    }

    // Update with latest profile details
    farmer.name = profile.name;
    farmer.mobile = mobile;
    farmer.state = profile.state;
    farmer.district = profile.district;
    farmer.village = profile.village;
    farmer.landHolding = profile.landHolding;
    farmer.landParcels = profile.landParcels || farmer.landParcels;
    farmer.cropsGrown = profile.cropsGrown || farmer.cropsGrown;
    farmer.beneficiaryStatus = profile.beneficiaryStatus || farmer.beneficiaryStatus;
    farmer.agriStackLastSynced = new Date();

    // 3. Generate and store OTP
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);
    const otpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    farmer.otp = hashedOTP;
    farmer.otpExpires = otpExpires;
    await farmer.save({ validateBeforeSave: false });

    // Send OTP via SMS
    await sendOTP(mobile, otp);

    logger.info(`OTP sent to ${mobile} for Kisan ID: ${farmer.kisanId} (${farmer.name})`);

    return res.status(HTTP_STATUS.OK).json({
      message: "OTP sent successfully",
      kisanId: farmer.kisanId,
      mobile,
      expiresIn: OTP_EXPIRY_MINUTES,
    });
  } catch (error) {
    logger.error(`Send OTP error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Failed to send OTP",
    });
  }
};

/**
 * @desc    Verify OTP and login (by mobile or kisanId)
 * @route   POST /api/v1/farmers/verify-otp
 * @access  Public
 */
export const verifyOTPHandler = async (req, res) => {
  try {
    const { kisanId, mobile, otp } = req.body;

    if ((!kisanId && !mobile) || !otp) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Mobile number/Kisan ID and OTP are required",
      });
    }

    const farmer = await Farmer.findOne({
      $or: [
        ...(mobile ? [{ mobile }] : []),
        ...(kisanId ? [{ kisanId }] : []),
      ],
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

    logger.info(`Farmer logged in: ${farmer.name} - ${farmer.kisanId} (${farmer.mobile})`);

    return res.status(HTTP_STATUS.OK).json({
      message: "Login successful",
      token,
      farmer: {
        _id: farmer._id,
        kisanId: farmer.kisanId,
        name: farmer.name,
        mobile: farmer.mobile,
        state: farmer.state,
        district: farmer.district,
        village: farmer.village,
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
    const profile = await fetchFarmerProfile(req.user.kisanId, req.user.mobile);

    const farmer = await Farmer.findByIdAndUpdate(
      req.user._id,
      {
        name: profile.name,
        state: profile.state,
        district: profile.district,
        village: profile.village,
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
