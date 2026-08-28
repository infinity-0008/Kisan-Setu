import axios from "axios";

const api = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("farmer");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const sendOTP = (kisanId, mobile) =>
  api.post("/farmers/send-otp", { kisanId, mobile });

export const verifyOTP = (kisanId, otp) =>
  api.post("/farmers/verify-otp", { kisanId, otp });

export const getProfile = () => api.get("/farmers/profile");

// Voice API
export const sendVoiceQuery = (formData) =>
  api.post("/voice/query", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const sendTextQuery = (query) =>
  api.post("/voice/text-query", { query });

// Scheme API
export const querySchemes = (query) =>
  api.post("/schemes/query", { query });

export const getAllSchemes = (params) =>
  api.get("/schemes", { params });

export const applyForScheme = (schemeCode) =>
  api.post(`/schemes/${schemeCode}/apply`);

// Crop API
export const createCropListing = (data) =>
  api.post("/crops/list", data);

export const getMyListings = () => api.get("/crops/my-listings");

export const compareCropPrice = (data) =>
  api.post("/crops/compare-price", data);

export const getMandiPrices = (cropType) =>
  api.get(`/crops/mandi-prices/${cropType}`);

// Video API
export const getRecommendedVideos = () =>
  api.get("/videos/recommended");

export const getAllVideos = (params) =>
  api.get("/videos", { params });

// CSC API
export const escalateQuery = (data) =>
  api.post("/csc/escalate", data);

export const getEscalations = () => api.get("/csc/escalations");

export default api;
