import Farmer from "../models/farmer.model.js";
import Scheme from "../models/scheme.model.js";
import CropListing from "../models/cropListing.model.js";
import Video from "../models/video.model.js";
import { HTTP_STATUS } from "../constants.js";
import { generateAccessToken } from "../utils/jwt.js";
import logger from "../utils/logger.js";

/**
 * Admin login with dev key
 * POST /api/v1/admin/login
 */
export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const ADMIN_USER = process.env.ADMIN_USERNAME || "admin";
    const ADMIN_PASS = process.env.ADMIN_PASSWORD || "kisan2026";
    const ADMIN_KEY = process.env.ADMIN_DEV_KEY || "SIH-KISAN-SETU-2026";

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      // Find or create admin farmer record
      let admin = await Farmer.findOne({ role: "admin" });
      if (!admin) {
        admin = await Farmer.create({
          kisanId: "ADMIN001",
          name: "System Admin",
          mobile: "0000000000",
          state: "Delhi",
          district: "New Delhi",
          role: "admin",
          profileVerified: true,
        });
      }
      const token = generateAccessToken({ _id: admin._id });
      admin.sessionToken = token;
      await admin.save({ validateBeforeSave: false });

      logger.info("Admin logged in");
      return res.status(HTTP_STATUS.OK).json({
        message: "Admin login successful",
        token,
        admin: { name: admin.name, role: admin.role },
      });
    }

    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      message: "Invalid admin credentials",
    });
  } catch (error) {
    logger.error(`Admin login error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Login failed",
    });
  }
};

/**
 * Dashboard stats
 * GET /api/v1/admin/stats
 */
export const getDashboardStats = async (req, res) => {
  try {
    const [totalFarmers, verifiedFarmers, totalSchemes, totalListings, totalVideos, recentFarmers] =
      await Promise.all([
        Farmer.countDocuments({ role: "farmer" }),
        Farmer.countDocuments({ role: "farmer", profileVerified: true }),
        Scheme.countDocuments(),
        CropListing.countDocuments(),
        Video.countDocuments(),
        Farmer.find({ role: "farmer" })
          .sort({ createdAt: -1 })
          .limit(5)
          .select("kisanId name state district createdAt profileVerified"),
      ]);

    // Scheme eligibility breakdown
    const [pmKisanCount, pmfbyCount, kccCount] = await Promise.all([
      Farmer.countDocuments({ role: "farmer", "beneficiaryStatus.pmKisan": true }),
      Farmer.countDocuments({ role: "farmer", "beneficiaryStatus.pmfby": true }),
      Farmer.countDocuments({ role: "farmer", "beneficiaryStatus.kcc": true }),
    ]);

    // State-wise distribution
    const stateDistribution = await Farmer.aggregate([
      { $match: { role: "farmer" } },
      { $group: { _id: "$state", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Crop distribution
    const cropDistribution = await Farmer.aggregate([
      { $match: { role: "farmer" } },
      { $unwind: "$cropsGrown" },
      { $group: { _id: "$cropsGrown", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    return res.status(HTTP_STATUS.OK).json({
      stats: {
        totalFarmers,
        verifiedFarmers,
        unverifiedFarmers: totalFarmers - verifiedFarmers,
        totalSchemes,
        totalListings,
        totalVideos,
        schemeEligibility: { pmKisanCount, pmfbyCount, kccCount },
        stateDistribution,
        cropDistribution,
        recentFarmers,
      },
    });
  } catch (error) {
    logger.error(`Dashboard stats error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to fetch stats",
    });
  }
};

/**
 * List all farmers
 * GET /api/v1/admin/farmers
 */
export const listFarmers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, state, verified } = req.query;
    const query = { role: "farmer" };

    if (search) {
      query.$or = [
        { kisanId: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
      ];
    }
    if (state) query.state = state;
    if (verified !== undefined) query.profileVerified = verified === "true";

    const farmers = await Farmer.find(query)
      .select("-otp -otpExpires -sessionToken")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Farmer.countDocuments(query);

    return res.status(HTTP_STATUS.OK).json({
      farmers,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    logger.error(`List farmers error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to fetch farmers",
    });
  }
};

/**
 * Get single farmer detail
 * GET /api/v1/admin/farmers/:id
 */
export const getFarmerDetail = async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id)
      .select("-otp -otpExpires -sessionToken");
    if (!farmer) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Farmer not found" });
    }
    return res.status(HTTP_STATUS.OK).json({ farmer });
  } catch (error) {
    logger.error(`Get farmer detail error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to fetch farmer",
    });
  }
};

/**
 * Update farmer verification status
 * PATCH /api/v1/admin/farmers/:id/verify
 */
export const verifyFarmerById = async (req, res) => {
  try {
    const farmer = await Farmer.findByIdAndUpdate(
      req.params.id,
      { profileVerified: req.body.verified ?? true },
      { new: true }
    );
    if (!farmer) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Farmer not found" });
    }
    return res.status(HTTP_STATUS.OK).json({ message: "Farmer updated", farmer });
  } catch (error) {
    logger.error(`Verify farmer error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to verify farmer",
    });
  }
};

/**
 * Create new farmer record
 * POST /api/v1/admin/farmers
 */
export const createFarmer = async (req, res) => {
  try {
    const { kisanId, name, mobile, state, district, landHolding, cropsGrown } = req.body;
    if (!kisanId || !name || !mobile) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Kisan ID, Name, and Mobile are required" });
    }
    const farmer = await Farmer.create({
      kisanId,
      name,
      mobile,
      state: state || "Uttar Pradesh",
      district: district || "Lucknow",
      landHolding: Number(landHolding) || 2.5,
      cropsGrown: Array.isArray(cropsGrown) ? cropsGrown : (cropsGrown ? cropsGrown.split(',').map(c => c.trim()) : ["wheat"]),
      profileVerified: true,
      role: "farmer",
    });
    logger.info(`Farmer created by Admin: ${kisanId}`);
    return res.status(HTTP_STATUS.CREATED).json({ message: "Farmer created successfully", farmer });
  } catch (error) {
    logger.error(`Create farmer error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Failed to create farmer" });
  }
};

/**
 * Delete farmer
 * DELETE /api/v1/admin/farmers/:id
 */
export const deleteFarmer = async (req, res) => {
  try {
    const farmer = await Farmer.findByIdAndDelete(req.params.id);
    if (!farmer) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Farmer not found" });
    }
    return res.status(HTTP_STATUS.OK).json({ message: "Farmer deleted" });
  } catch (error) {
    logger.error(`Delete farmer error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to delete farmer",
    });
  }
};

/**
 * Create scheme
 * POST /api/v1/admin/schemes
 */
export const createScheme = async (req, res) => {
  try {
    const scheme = await Scheme.create(req.body);
    logger.info(`Scheme created: ${scheme.schemeCode}`);
    return res.status(HTTP_STATUS.CREATED).json({ scheme });
  } catch (error) {
    logger.error(`Create scheme error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to create scheme",
    });
  }
};

/**
 * Update scheme
 * PUT /api/v1/admin/schemes/:id
 */
export const updateScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!scheme) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Scheme not found" });
    }
    return res.status(HTTP_STATUS.OK).json({ message: "Scheme updated", scheme });
  } catch (error) {
    logger.error(`Update scheme error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to update scheme",
    });
  }
};

/**
 * Delete scheme
 * DELETE /api/v1/admin/schemes/:id
 */
export const deleteScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndDelete(req.params.id);
    if (!scheme) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Scheme not found" });
    }
    return res.status(HTTP_STATUS.OK).json({ message: "Scheme deleted" });
  } catch (error) {
    logger.error(`Delete scheme error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to delete scheme",
    });
  }
};

/**
 * List all schemes
 * GET /api/v1/admin/schemes
 */
export const listSchemes = async (req, res) => {
  try {
    const schemes = await Scheme.find().sort({ createdAt: -1 });
    return res.status(HTTP_STATUS.OK).json({ schemes });
  } catch (error) {
    logger.error(`List schemes error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to fetch schemes",
    });
  }
};

/**
 * List all crop listings
 * GET /api/v1/admin/listings
 */
export const listListings = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const listings = await CropListing.find()
      .populate("farmerId", "kisanId name state district")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await CropListing.countDocuments();
    return res.status(HTTP_STATUS.OK).json({ listings, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    logger.error(`List listings error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch listings" });
  }
};

/**
 * System health check
 * GET /api/v1/admin/health
 */
export const systemHealth = async (req, res) => {
  try {
    const dbState = (await import("mongoose")).default.connection.readyState;
    const states = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };
    return res.status(HTTP_STATUS.OK).json({
      status: "ok",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      db: states[dbState] || "unknown",
      nodeVersion: process.version,
      platform: process.platform,
    });
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ status: "error" });
  }
};
