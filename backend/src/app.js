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


// Allowed origins — all Vercel preview + production URLs + localhost
const corsOptions = {
  origin: (origin, callback) => {
    // Allow: no origin (Postman/curl), localhost, any *.vercel.app, or env CORS_ORIGIN
    const isLocalhost = !origin || origin.startsWith("http://localhost");
    const isVercel = origin?.endsWith(".vercel.app");
    const isEnvOrigin = origin === process.env.CORS_ORIGIN;

    if (isLocalhost || isVercel || isEnvOrigin) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};


app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Root route
app.get("/", (req, res) => {
  res.json({ message: "🌾 Kisan Setu API is running", status: "ok", version: "1.0.0" });
});


app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Kisan Setu API",
    timestamp: new Date(),
    version: "1.0.0",
  });
});


app.use("/api/v1/farmers", farmerRoutes);
app.use("/api/v1/schemes", schemeRoutes);
app.use("/api/v1/crops", cropRoutes);
app.use("/api/v1/videos", videoRoutes);
app.use("/api/v1/voice", voiceRoutes);
app.use("/api/v1/csc", cscRoutes);
app.use("/api/v1/admin", adminRoutes);


app.use(errorHandler);// check about it 

export default app;
