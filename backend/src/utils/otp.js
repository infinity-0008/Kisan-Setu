import crypto from "crypto";
import { OTP_LENGTH } from "../constants.js";

export const generateOTP = () => {
  const digits = "0123456789";
  let otp = "";
  const randomBytes = crypto.randomBytes(OTP_LENGTH);
  for (let i = 0; i < OTP_LENGTH; i++) {
    otp += digits[randomBytes[i] % 10];
  }
  return otp;
};

export const hashOTP = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

export const verifyOTP = (inputOTP, hashedOTP) => {
  const inputHashed = crypto.createHash("sha256").update(inputOTP).digest("hex");
  return inputHashed === hashedOTP;
};
