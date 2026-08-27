import { HTTP_STATUS } from "../constants.js";
import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ message: "Validation Error", errors: messages });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res
      .status(HTTP_STATUS.CONFLICT)
      .json({ message: `Duplicate value for field: ${field}` });
  }

  if (err.name === "CastError") {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ message: `Invalid ${err.path}: ${err.value}` });
  }

  return res
    .status(err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR)
    .json({
      message: err.message || "Internal Server Error",
    });
};

export default errorHandler;
