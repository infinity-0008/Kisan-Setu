import { Router } from "express";
import {
  sendOTPHandler,
  verifyOTPHandler,
  getProfile,
  syncAgriStack,
} from "../controllers/farmer.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.post("/send-otp", sendOTPHandler);
router.post("/verify-otp", verifyOTPHandler);

// Protected routes
router.get("/profile", verifyToken, getProfile);
router.post("/sync-agristack", verifyToken, syncAgriStack);

export default router;
