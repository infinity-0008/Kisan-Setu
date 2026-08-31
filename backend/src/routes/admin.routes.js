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

// checkk ???
router.post("/login", adminLogin);

// admin token ??
router.use(verifyToken, verifyRole("admin"));

// dashboard here 
router.get("/stats", getDashboardStats);
router.get("/health", systemHealth);

// for farmers details 
router.get("/farmers", listFarmers);
router.post("/farmers", createFarmer);
router.get("/farmers/:id", getFarmerDetail);
router.patch("/farmers/:id/verify", verifyFarmerById);
router.delete("/farmers/:id", deleteFarmer);

// schemes
router.get("/schemes", listSchemes);
router.post("/schemes", createScheme);
router.put("/schemes/:id", updateScheme);
router.delete("/schemes/:id", deleteScheme);


router.get("/listings", listListings);

export default router;
