import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFarmerProfile, syncAgriStack } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [farmer, setFarmer] = useState(() => {
    const saved = localStorage.getItem('farmer');
    return saved ? JSON.parse(saved) : null;
  });
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('admin');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && !farmer && !admin) {
      fetchCurrentProfile();
    }
  }, [token]);

  const fetchCurrentProfile = async () => {
    try {
      setLoading(true);
      const res = await getFarmerProfile();
      if (res.data?.farmer) {
        setFarmer(res.data.farmer);
        localStorage.setItem('farmer', JSON.stringify(res.data.farmer));
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const loginFarmer = (newToken, farmerData) => {
    setToken(newToken);
    setFarmer(farmerData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('farmer', JSON.stringify(farmerData));
    localStorage.removeItem('admin');
  };

  const loginAdmin = (newToken, adminData) => {
    setToken(newToken);
    setAdmin(adminData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('admin', JSON.stringify(adminData));
    localStorage.removeItem('farmer');
  };

  const logout = () => {
    setToken('');
    setFarmer(null);
    setAdmin(null);
    localStorage.removeItem('token');
    localStorage.removeItem('farmer');
    localStorage.removeItem('admin');
  };

  const syncProfile = async () => {
    try {
      const res = await syncAgriStack();
      if (res.data?.farmer) {
        setFarmer(res.data.farmer);
        localStorage.setItem('farmer', JSON.stringify(res.data.farmer));
        return res.data.farmer;
      }
    } catch (err) {
      console.error('AgriStack sync error:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        farmer,
        admin,
        loading,
        isFarmerAuthenticated: !!token && !!farmer,
        isAdminAuthenticated: !!token && !!admin,
        loginFarmer,
        loginAdmin,
        logout,
        syncProfile,
        refreshProfile: fetchCurrentProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
