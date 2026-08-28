import { Router } from "express";
import {
  adminLogin,
  getDashboardStats,
  listFarmers,
  getFarmerDetail,
  createFarmer,
  verifyFarmerById,
  deleteFarmer,
  createScheme,
  updateScheme,
  deleteScheme,
  listSchemes,
  listListings,
  systemHealth,
} from "../controllers/admin.controller.js";
import { verifyToken, verifyRole } from "../middlewares/auth.middleware.js";

const router = Router();

// Public
router.post("/login", adminLogin);

// Protected — admin only
router.use(verifyToken, verifyRole("admin"));

// Dashboard
router.get("/stats", getDashboardStats);
router.get("/health", systemHealth);

// Farmers CRUD
router.get("/farmers", listFarmers);
router.post("/farmers", createFarmer);
router.get("/farmers/:id", getFarmerDetail);
router.patch("/farmers/:id/verify", verifyFarmerById);
router.delete("/farmers/:id", deleteFarmer);

// Schemes CRUD
router.get("/schemes", listSchemes);
router.post("/schemes", createScheme);
router.put("/schemes/:id", updateScheme);
router.delete("/schemes/:id", deleteScheme);

// Listings
router.get("/listings", listListings);

export default router;
