import { Router } from "express";
import {
  querySchemes,
  getAllSchemes,
  getSchemeByCode,
  applyForScheme,
  getMyApplications,
} from "../controllers/scheme.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyToken);

router.post("/query", querySchemes);
router.get("/", getAllSchemes);
router.get("/my-applications", getMyApplications);
router.get("/:schemeCode", getSchemeByCode);
router.post("/:schemeCode/apply", applyForScheme);

export default router;
