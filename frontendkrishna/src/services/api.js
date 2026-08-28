import axios from "axios";

const api = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to attach Authorization Bearer token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle unauthenticated 401 response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/admin/login")) {
        localStorage.removeItem("token");
        localStorage.removeItem("farmer");
        localStorage.removeItem("admin");
      }
    }
    return Promise.reject(error);
  }
);

// Farmer Auth API (Mobile Number Driven with auto-linked Kisan ID)
export const sendOTP = (mobile, kisanId = null) =>
  api.post("/farmers/send-otp", { mobile, ...(kisanId ? { kisanId } : {}) });

export const verifyOTP = (mobile, otp, kisanId = null) =>
  api.post("/farmers/verify-otp", { mobile, otp, ...(kisanId ? { kisanId } : {}) });

export const getFarmerProfile = () => api.get("/farmers/profile");

export const syncAgriStack = () => api.post("/farmers/sync-agristack");

// AI Saathi / Voice & Text Query API
export const sendTextQuery = (query) =>
  api.post("/voice/text-query", { query });

export const sendVoiceQuery = (formData) =>
  api.post("/voice/query", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Scheme API
export const getAllSchemes = (params) =>
  api.get("/schemes", { params });

export const getSchemeByCode = (schemeCode) =>
  api.get(`/schemes/${schemeCode}`);

export const querySchemes = (query) =>
  api.post("/schemes/query", { query });

export const applyForScheme = (schemeCode) =>
  api.post(`/schemes/${schemeCode}/apply`);

export const getMyApplications = () =>
  api.get("/schemes/my-applications");

// Crop Marketplace API
export const createCropListing = (data) =>
  api.post("/crops/list", data);

export const getCropListings = (params) =>
  api.get("/crops/listings", { params });

export const getMyListings = () =>
  api.get("/crops/my-listings");

export const compareCropPrice = (data) =>
  api.post("/crops/compare-price", data);

export const getMandiPrices = (cropType) =>
  api.get(`/crops/mandi-prices/${cropType}`);

// Admin API
export const adminLogin = (username, password) =>
  api.post("/admin/login", { username, password });

export const getAdminStats = () =>
  api.get("/admin/stats");

export const getSystemHealth = () =>
  api.get("/admin/health");

export const listAdminFarmers = (params) =>
  api.get("/admin/farmers", { params });

export const createAdminFarmer = (data) =>
  api.post("/admin/farmers", data);

export const verifyFarmerById = (id, verified) =>
  api.patch(`/admin/farmers/${id}/verify`, { verified });

export const deleteFarmerById = (id) =>
  api.delete(`/admin/farmers/${id}`);

export const listAdminSchemes = () =>
  api.get("/admin/schemes");

export const createAdminScheme = (data) =>
  api.post("/admin/schemes", data);

export const updateAdminScheme = (id, data) =>
  api.put(`/admin/schemes/${id}`, data);

export const deleteAdminScheme = (id) =>
  api.delete(`/admin/schemes/${id}`);

export const listAdminListings = (params) =>
  api.get("/admin/listings", { params });

export default api;
