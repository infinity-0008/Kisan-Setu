import { Router } from "express";
import {
  createCropListing,
  getCropListings,
  getMyListings,
  compareCropPrice,
  getMandiPrices,
  updateCropListing,
} from "../controllers/crop.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyToken);

router.post("/list", createCropListing);
router.get("/listings", getCropListings);
router.get("/my-listings", getMyListings);
router.post("/compare-price", compareCropPrice);
router.get("/mandi-prices/:cropType", getMandiPrices);
router.patch("/listings/:id", updateCropListing);

export default router;
