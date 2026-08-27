import Video from "../models/video.model.js";
import { HTTP_STATUS } from "../constants.js";
import logger from "../utils/logger.js";

/**
 * @desc    Get all videos (filtered by category/crop)
 * @route   GET /api/v1/videos
 * @access  Private
 */
export const getAllVideos = async (req, res) => {
  try {
    const { category, crop, language, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (crop) filter.cropTags = { $in: [crop] };
    if (language) filter.language = language;

    const skip = (page - 1) * limit;
    const videos = await Video.find(filter)
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Video.countDocuments(filter);

    return res.status(HTTP_STATUS.OK).json({
      count: videos.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      videos,
    });
  } catch (error) {
    logger.error(`Get videos error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to fetch videos",
    });
  }
};

/**
 * @desc    Get videos relevant to farmer's profile
 * @route   GET /api/v1/videos/recommended
 * @access  Private
 */
export const getRecommendedVideos = async (req, res) => {
  try {
    const farmerCrops = req.user.cropsGrown || [];

    const videos = await Video.find({
      isActive: true,
      $or: [
        { cropTags: { $in: farmerCrops } },
        { category: "general-farming" },
      ],
    })
      .sort({ isFeatured: -1, views: -1 })
      .limit(10);

    return res.status(HTTP_STATUS.OK).json({
      count: videos.length,
      videos,
    });
  } catch (error) {
    logger.error(`Get recommended videos error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to fetch recommended videos",
    });
  }
};

/**
 * @desc    Get single video by ID
 * @route   GET /api/v1/videos/:id
 * @access  Private
 */
export const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: "Video not found",
      });
    }

    // Increment view count
    video.views += 1;
    await video.save();

    return res.status(HTTP_STATUS.OK).json({ video });
  } catch (error) {
    logger.error(`Get video error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to fetch video",
    });
  }
};

/**
 * @desc    Add new video (admin only)
 * @route   POST /api/v1/videos
 * @access  Private (admin)
 */
export const addVideo = async (req, res) => {
  try {
    const { title, description, embedUrl, category, cropTags, language, sourceChannel } =
      req.body;

    if (!title || !embedUrl || !category) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Title, embed URL, and category are required",
      });
    }

    const video = await Video.create({
      title,
      description,
      embedUrl,
      category,
      cropTags: cropTags || [],
      language: language || "hi",
      sourceChannel: sourceChannel || "DD Kisan",
      uploadedBy: req.user._id,
    });

    return res.status(HTTP_STATUS.CREATED).json({
      message: "Video added successfully",
      video,
    });
  } catch (error) {
    logger.error(`Add video error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to add video",
    });
  }
};

/**
 * @desc    Update video (admin only)
 * @route   PATCH /api/v1/videos/:id
 * @access  Private (admin)
 */
export const updateVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!video) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: "Video not found",
      });
    }

    return res.status(HTTP_STATUS.OK).json({
      message: "Video updated",
      video,
    });
  } catch (error) {
    logger.error(`Update video error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to update video",
    });
  }
};

/**
 * @desc    Delete video (admin only)
 * @route   DELETE /api/v1/videos/:id
 * @access  Private (admin)
 */
export const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);

    if (!video) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: "Video not found",
      });
    }

    return res.status(HTTP_STATUS.OK).json({
      message: "Video deleted",
    });
  } catch (error) {
    logger.error(`Delete video error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to delete video",
    });
  }
};
