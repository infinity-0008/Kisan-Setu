export const DB_NAME = "Abhayyadav";
export const PORT = process.env.PORT || 5000;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

export const OTP_EXPIRY_MINUTES = 10;
export const OTP_LENGTH = 6;
export const JWT_EXPIRY = "7d";

export const ROLES = {
  FARMER: "farmer",
  CSC_OPERATOR: "cscOperator",
  ADMIN: "admin",
};

export const SCHEME_CATEGORIES = [
  "income-support",
  "insurance",
  "credit",
  "subsidy",
  "procurement",
];

export const CROP_TYPES = [
  "wheat",
  "rice",
  "maize",
  "cotton",
  "sugarcane",
  "mustard",
  "soybean",
  "groundnut",
  "pulses",
  "vegetables",
  "fruits",
  "spices",
];

export const VIDEO_CATEGORIES = [
  "pest-management",
  "irrigation",
  "soil-health",
  "fertilizer",
  "general-farming",
  "market-prices",
  "scheme-guidance",
];

export const STATES_OF_INDIA = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh",
  "Chandigarh", "Puducherry", "Andaman and Nicobar Islands",
  "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep",
];
