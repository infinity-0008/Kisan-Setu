import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./db/index.db.js";
import { PORT } from "./constants.js";
import logger from "./utils/logger.js";

const startServer = async () => {
  await connectDB();

  const port = process.env.PORT || PORT || 5000;
  app.listen(port, "0.0.0.0", () => {
    logger.info(`Kisan Setu API running on port ${port}`);
    logger.info(`Health check: http://localhost:${port}/api/v1/health`);
  });
};

startServer();
