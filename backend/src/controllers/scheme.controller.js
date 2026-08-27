import Scheme from "../models/scheme.model.js";
import SchemeApplication from "../models/schemeApplication.model.js";
import { HTTP_STATUS } from "../constants.js";
import {
  classifyIntent,
  retrieveSchemes,
  checkEligibility,
  generateResponse,
} from "../utils/rag.js";
import logger from "../utils/logger.js";

/**
 * @desc    Query schemes using natural language (RAG)
 * @route   POST /api/v1/schemes/query
 * @access  Private
 */
export const querySchemes = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Query text is required",
      });
    }

    // Step 1: Classify intent
    const intent = classifyIntent(query);
    logger.info(`Intent classified: ${intent}`);

    // Step 2: Retrieve relevant schemes
    const schemes = await retrieveSchemes(req.user, query);

    // Step 3: Check eligibility for each scheme
    const eligibilityResults = schemes.map((scheme) => ({
      scheme,
      eligibility: checkEligibility(req.user, scheme),
    }));

    // Step 4: Generate response
    const response = generateResponse(
      req.user,
      schemes,
      eligibilityResults[0]?.eligibility || { eligible: false, reasons: [] }
    );

    return res.status(HTTP_STATUS.OK).json({
      intent,
      response,
      schemes: eligibilityResults,
    });
  } catch (error) {
    logger.error(`Scheme query error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to process scheme query",
    });
  }
};

/**
 * @desc    Get all available schemes
 * @route   GET /api/v1/schemes
 * @access  Private
 */
export const getAllSchemes = async (req, res) => {
  try {
    const { state, category } = req.query;
    const filter = { isActive: true };

    if (state) filter.state = state;
    if (category) filter.category = category;

    const schemes = await Scheme.find(filter).sort({ createdAt: -1 });

    return res.status(HTTP_STATUS.OK).json({
      count: schemes.length,
      schemes,
    });
  } catch (error) {
    logger.error(`Get schemes error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to fetch schemes",
    });
  }
};

/**
 * @desc    Get single scheme by code
 * @route   GET /api/v1/schemes/:schemeCode
 * @access  Private
 */
export const getSchemeByCode = async (req, res) => {
  try {
    const { schemeCode } = req.params;
    const scheme = await Scheme.findOne({ schemeCode, isActive: true });

    if (!scheme) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: "Scheme not found",
      });
    }

    return res.status(HTTP_STATUS.OK).json({ scheme });
  } catch (error) {
    logger.error(`Get scheme error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to fetch scheme",
    });
  }
};

/**
 * @desc    Apply for a scheme
 * @route   POST /api/v1/schemes/:schemeCode/apply
 * @access  Private
 */
export const applyForScheme = async (req, res) => {
  try {
    const { schemeCode } = req.params;
    const { documentsSubmitted } = req.body;

    const scheme = await Scheme.findOne({ schemeCode, isActive: true });
    if (!scheme) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: "Scheme not found",
      });
    }

    // Check eligibility
    const eligibility = checkEligibility(req.user, scheme);
    if (!eligibility.eligible) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Not eligible for this scheme",
        reasons: eligibility.reasons,
      });
    }

    // Create application
    const application = await SchemeApplication.create({
      farmerId: req.user._id,
      schemeCode,
      schemeName: scheme.name,
      status: "applied",
      documentsSubmitted: documentsSubmitted || [],
      appliedAt: new Date(),
    });

    logger.info(`Scheme application created: ${schemeCode} for ${req.user.kisanId}`);

    return res.status(HTTP_STATUS.CREATED).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    logger.error(`Apply scheme error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to apply for scheme",
    });
  }
};

/**
 * @desc    Get farmer's scheme applications
 * @route   GET /api/v1/schemes/my-applications
 * @access  Private
 */
export const getMyApplications = async (req, res) => {
  try {
    const applications = await SchemeApplication.find({
      farmerId: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(HTTP_STATUS.OK).json({
      count: applications.length,
      applications,
    });
  } catch (error) {
    logger.error(`Get applications error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to fetch applications",
    });
  }
};
