import axios from "axios";

const adminApi = axios.create({
  baseURL: "/api/v1/admin",
  headers: { "Content-Type": "application/json" },
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("adminToken");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

export const adminLogin = (username, password) =>
  adminApi.post("/login", { username, password });

export const getDashboardStats = () => adminApi.get("/stats");

// Farmers
export const listFarmers = (params) => adminApi.get("/farmers", { params });
export const getFarmerDetail = (id) => adminApi.get(`/farmers/${id}`);
export const verifyFarmer = (id, verified) =>
  adminApi.patch(`/farmers/${id}/verify`, { verified });
export const deleteFarmer = (id) => adminApi.delete(`/farmers/${id}`);

// Schemes
export const listSchemes = () => adminApi.get("/schemes");
export const createScheme = (data) => adminApi.post("/schemes", data);
export const updateScheme = (id, data) => adminApi.put(`/schemes/${id}`, data);
export const deleteScheme = (id) => adminApi.delete(`/schemes/${id}`);

// Listings
export const listListings = (params) => adminApi.get("/listings", { params });

// Health
export const getSystemHealth = () => adminApi.get("/health");

export default adminApi;
