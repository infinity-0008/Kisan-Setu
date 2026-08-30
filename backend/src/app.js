import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/error.middleware.js";
import farmerRoutes from "./routes/farmer.routes.js";
import schemeRoutes from "./routes/scheme.routes.js";
import cropRoutes from "./routes/crop.routes.js";
import videoRoutes from "./routes/video.routes.js";
import voiceRoutes from "./routes/voice.routes.js";
import cscRoutes from "./routes/csc.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

// Allowed origins (hardcoded fallback in case env var is missing)
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  "https://kisan-setu-sigma.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, mobile apps, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight for all routes
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Root route → redirect to Admin Portal
app.get("/", (req, res) => {
  res.redirect(process.env.CORS_ORIGIN + "/admin/login");
});

// Health check
app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Kisan Setu API",
    timestamp: new Date(),
    version: "1.0.0",
  });
});

// API Routes
app.use("/api/v1/farmers", farmerRoutes);
app.use("/api/v1/schemes", schemeRoutes);
app.use("/api/v1/crops", cropRoutes);
app.use("/api/v1/videos", videoRoutes);
app.use("/api/v1/voice", voiceRoutes);
app.use("/api/v1/csc", cscRoutes);
app.use("/api/v1/admin", adminRoutes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
