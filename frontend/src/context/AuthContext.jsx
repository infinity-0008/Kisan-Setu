import { createContext, useContext, useState, useEffect } from "react";
import { getProfile } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [farmer, setFarmer] = useState(() => {
    const stored = localStorage.getItem("farmer");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);

  const login = (token, farmerData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("farmer", JSON.stringify(farmerData));
    setToken(token);
    setFarmer(farmerData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("farmer");
    setToken(null);
    setFarmer(null);
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const { data } = await getProfile();
      setFarmer(data.farmer);
      localStorage.setItem("farmer", JSON.stringify(data.farmer));
    } catch (error) {
      console.error("Failed to refresh profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ farmer, token, loading, login, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
