import { Router } from "express";
import {
  getEscalations,
  getPendingApplications,
  updateApplicationStatus,
  escalateQuery,
  getDashboardStats,
} from "../controllers/csc.controller.js";
import { verifyToken, verifyRole } from "../middlewares/auth.middleware.js";
import { ROLES } from "../constants.js";

const router = Router();

// All routes require authentication
router.use(verifyToken);

// CSC operator routes
router.get("/escalations", verifyRole(ROLES.CSC_OPERATOR, ROLES.ADMIN), getEscalations);
router.get("/applications", verifyRole(ROLES.CSC_OPERATOR, ROLES.ADMIN), getPendingApplications);
router.patch("/applications/:id", verifyRole(ROLES.CSC_OPERATOR, ROLES.ADMIN), updateApplicationStatus);
router.get("/stats", verifyRole(ROLES.CSC_OPERATOR, ROLES.ADMIN), getDashboardStats);

// Any authenticated user can escalate
router.post("/escalate", escalateQuery);

export default router;
