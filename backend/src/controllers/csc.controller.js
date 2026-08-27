import SchemeApplication from "../models/schemeApplication.model.js";
import Farmer from "../models/farmer.model.js";
import CropListing from "../models/cropListing.model.js";
import { HTTP_STATUS } from "../constants.js";
import logger from "../utils/logger.js";

/**
 * @desc    Get all escalated cases (CSC dashboard)
 * @route   GET /api/v1/csc/escalations
 * @access  CSC Operator
 */
export const getEscalations = async (req, res) => {
  try {
    const escalations = await SchemeApplication.find({ status: "escalated" })
      .populate("farmerId", "name kisanId mobile state district")
      .sort({ createdAt: -1 });

    return res.status(HTTP_STATUS.OK).json({
      count: escalations.length,
      escalations,
    });
  } catch (error) {
    logger.error(`Get escalations error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to fetch escalations",
    });
  }
};

/**
 * @desc    Get all pending scheme applications (CSC view)
 * @route   GET /api/v1/csc/applications
 * @access  CSC Operator
 */
export const getPendingApplications = async (req, res) => {
  try {
    const applications = await SchemeApplication.find({
      status: { $in: ["applied", "pending_documents", "escalated"] },
    })
      .populate("farmerId", "name kisanId mobile state district")
      .sort({ createdAt: -1 });

    return res.status(HTTP_STATUS.OK).json({
      count: applications.length,
      applications,
    });
  } catch (error) {
    logger.error(`Get pending applications error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to fetch pending applications",
    });
  }
};

/**
 * @desc    Update scheme application status (CSC action)
 * @route   PATCH /api/v1/csc/applications/:id
 * @access  CSC Operator
 */
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const validStatuses = ["approved", "rejected", "pending_documents"];
    if (!validStatuses.includes(status)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const application = await SchemeApplication.findByIdAndUpdate(
      id,
      {
        status,
        remarks,
        decidedAt: new Date(),
      },
      { new: true }
    ).populate("farmerId", "name kisanId mobile");

    if (!application) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: "Application not found",
      });
    }

    logger.info(`Application ${id} updated to ${status} by CSC operator`);

    return res.status(HTTP_STATUS.OK).json({
      message: "Application updated",
      application,
    });
  } catch (error) {
    logger.error(`Update application error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to update application",
    });
  }
};

/**
 * @desc    Escalate a query to CSC
 * @route   POST /api/v1/csc/escalate
 * @access  Private
 */
export const escalateQuery = async (req, res) => {
  try {
    const { schemeCode, reason, queryText } = req.body;

    const application = await SchemeApplication.create({
      farmerId: req.user._id,
      schemeCode: schemeCode || "GENERAL",
      schemeName: schemeCode || "General Query",
      status: "escalated",
      escaltionReason: reason,
      remarks: queryText,
    });

    logger.info(`Query escalated for farmer ${req.user.kisanId}: ${reason}`);

    return res.status(HTTP_STATUS.CREATED).json({
      message: "Your query has been escalated to a CSC operator. They will contact you soon.",
      applicationId: application._id,
    });
  } catch (error) {
    logger.error(`Escalate query error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to escalate query",
    });
  }
};

/**
 * @desc    Get CSC dashboard stats
 * @route   GET /api/v1/csc/stats
 * @access  CSC Operator
 */
export const getDashboardStats = async (req, res) => {
  try {
    const [totalFarmers, totalApplications, escalations, activeListings] =
      await Promise.all([
        Farmer.countDocuments(),
        SchemeApplication.countDocuments(),
        SchemeApplication.countDocuments({ status: "escalated" }),
        CropListing.countDocuments({ status: "listed" }),
      ]);

    const applicationsByStatus = await SchemeApplication.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    return res.status(HTTP_STATUS.OK).json({
      totalFarmers,
      totalApplications,
      escalations,
      activeListings,
      applicationsByStatus,
    });
  } catch (error) {
    logger.error(`Get stats error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to fetch dashboard stats",
    });
  }
};
