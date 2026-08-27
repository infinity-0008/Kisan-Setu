import { Router } from "express";
import {
  getAllVideos,
  getRecommendedVideos,
  getVideoById,
  addVideo,
  updateVideo,
  deleteVideo,
} from "../controllers/video.controller.js";
import { verifyToken, verifyRole } from "../middlewares/auth.middleware.js";
import { ROLES } from "../constants.js";

const router = Router();

// All routes require authentication
router.use(verifyToken);

// Public authenticated routes
router.get("/", getAllVideos);
router.get("/recommended", getRecommendedVideos);
router.get("/:id", getVideoById);

// Admin-only routes
router.post("/", verifyRole(ROLES.ADMIN), addVideo);
router.patch("/:id", verifyRole(ROLES.ADMIN), updateVideo);
router.delete("/:id", verifyRole(ROLES.ADMIN), deleteVideo);

export default router;
