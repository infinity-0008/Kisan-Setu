import jwt from "jsonwebtoken";
import Farmer from "../models/farmer.model.js";
import { HTTP_STATUS, ROLES } from "../constants.js";

const verifyToken = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const farmer = await Farmer.findById(decoded._id).select("-otp -otpExpires");

    if (!farmer) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: "Unauthorized: Invalid token" });
    }

    req.user = farmer;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: "Token expired" });
    }
    return res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json({ message: "Unauthorized: Invalid token" });
  }
};

const optionalVerifyToken = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace("Bearer ", "");

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const farmer = await Farmer.findById(decoded._id).select("-otp -otpExpires");
      if (farmer) {
        req.user = farmer;
        return next();
      }
    }
  } catch (error) {
    // Ignore invalid token and fallback to guest profile for voice/chat queries
  }

  // Fallback guest profile
  req.user = {
    _id: "guest_farmer",
    name: "Ram Kumar",
    state: "Uttar Pradesh",
    district: "Lucknow",
    landHolding: 2.5,
    cropsGrown: ["Gehun", "Sarson"],
    role: "farmer",
  };
  next();
};

const verifyRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: "Unauthorized" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .json({ message: "Forbidden: Insufficient permissions" });
    }
    next();
  };
};

export { verifyToken, optionalVerifyToken, verifyRole };
