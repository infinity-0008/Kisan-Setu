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

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

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

// Error handler (must be last)
app.use(errorHandler);

export default app;
