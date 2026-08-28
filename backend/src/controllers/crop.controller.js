import CropListing from "../models/cropListing.model.js";
import { HTTP_STATUS } from "../constants.js";
import { fetchMandiPrices, comparePrices } from "../utils/agmarknet.js";
import logger from "../utils/logger.js";

/**
 * @desc    Create a crop listing (pre-filled from farmer profile)
 * @route   POST /api/v1/crops/list
 * @access  Private (farmer)
 */
export const createCropListing = async (req, res) => {
  try {
    const { cropType, variety, quantity, unit, expectedPrice } = req.body;

    if (!cropType || !quantity) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Crop type and quantity are required",
      });
    }

    // Pre-fill from farmer profile
    const listing = await CropListing.create({
      farmerId: req.user._id,
      cropType: cropType || req.user.cropsGrown?.[0],
      variety,
      quantity,
      unit: unit || "quintal",
      expectedPrice,
      location: {
        state: req.user.state,
        district: req.user.district,
        latitude: req.user.landParcels?.[0]?.geoRef?.coordinates?.[1],
        longitude: req.user.landParcels?.[0]?.geoRef?.coordinates?.[0],
      },
      status: "listed",
    });

    logger.info(`Crop listing created: ${cropType} by ${req.user.kisanId}`);

    return res.status(HTTP_STATUS.CREATED).json({
      message: "Crop listed successfully",
      listing,
    });
  } catch (error) {
    logger.error(`Create crop listing error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to create crop listing",
    });
  }
};

/**
 * @desc    Get all crop listings
 * @route   GET /api/v1/crops/listings
 * @access  Private
 */
export const getCropListings = async (req, res) => {
  try {
    const { cropType, state, status } = req.query;
    const filter = {};

    if (cropType) filter.cropType = cropType;
    if (state) filter["location.state"] = state;
    if (status) filter.status = status;
    else filter.status = "listed";

    const listings = await CropListing.find(filter)
      .populate("farmerId", "name kisanId state district")
      .sort({ createdAt: -1 });

    return res.status(HTTP_STATUS.OK).json({
      count: listings.length,
      listings,
    });
  } catch (error) {
    logger.error(`Get crop listings error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to fetch listings",
    });
  }
};

/**
 * @desc    Get my crop listings
 * @route   GET /api/v1/crops/my-listings
 * @access  Private (farmer)
 */
export const getMyListings = async (req, res) => {
  try {
    const listings = await CropListing.find({ farmerId: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(HTTP_STATUS.OK).json({
      count: listings.length,
      listings,
    });
  } catch (error) {
    logger.error(`Get my listings error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to fetch your listings",
    });
  }
};

/**
 * @desc    Compare crop price with mandi rates + MSP
 * @route   POST /api/v1/crops/compare-price
 * @access  Private
 */
export const compareCropPrice = async (req, res) => {
  try {
    const { cropType, expectedPrice } = req.body;

    if (!cropType || !expectedPrice) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Crop type and expected price are required",
      });
    }

    // Get farmer coordinates for distance calculation
    const farmerLat = req.user.landParcels?.[0]?.geoRef?.coordinates?.[1];
    const farmerLon = req.user.landParcels?.[0]?.geoRef?.coordinates?.[0];

    const mandiPrices = await fetchMandiPrices(cropType, req.user.state, farmerLat, farmerLon);
    const comparison = comparePrices(expectedPrice, mandiPrices, cropType);

    return res.status(HTTP_STATUS.OK).json({
      cropType,
      mandiPrices,
      comparison,
    });
  } catch (error) {
    logger.error(`Compare price error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to compare prices",
    });
  }
};

/**
 * @desc    Get mandi prices for a crop
 * @route   GET /api/v1/crops/mandi-prices/:cropType
 * @access  Private
 */
export const getMandiPrices = async (req, res) => {
  try {
    const { cropType } = req.params;
    const state = req.query.state || req.user.state;

    const farmerLat = req.user.landParcels?.[0]?.geoRef?.coordinates?.[1];
    const farmerLon = req.user.landParcels?.[0]?.geoRef?.coordinates?.[0];

    const prices = await fetchMandiPrices(cropType, state, farmerLat, farmerLon);

    return res.status(HTTP_STATUS.OK).json({
      cropType,
      state,
      prices,
    });
  } catch (error) {
    logger.error(`Get mandi prices error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to fetch mandi prices",
    });
  }
};

/**
 * @desc    Update crop listing status
 * @route   PATCH /api/v1/crops/listings/:id
 * @access  Private (farmer)
 */
export const updateCropListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, soldPrice, soldTo } = req.body;

    const listing = await CropListing.findOne({
      _id: id,
      farmerId: req.user._id,
    });

    if (!listing) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: "Listing not found",
      });
    }

    if (status) listing.status = status;
    if (soldPrice) listing.soldPrice = soldPrice;
    if (soldTo) listing.soldTo = soldTo;
    if (status === "sold") listing.soldAt = new Date();

    await listing.save();

    return res.status(HTTP_STATUS.OK).json({
      message: "Listing updated",
      listing,
    });
  } catch (error) {
    logger.error(`Update listing error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to update listing",
    });
  }
};
