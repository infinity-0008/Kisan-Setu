import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./db/index.js";
import { PORT } from "./constants.js";
import logger from "./utils/logger.js";

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    logger.info(`Kisan Setu API running on port ${PORT}`);
    logger.info(`Health check: http://localhost:${PORT}/api/v1/health`);
  });
};

startServer();
