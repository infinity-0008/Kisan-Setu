import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import MainLayout from './layouts/MainLayout';
import Splash from './pages/Splash/Splash';
import Login from './pages/Login/Login';
import ProfileCreation from './pages/Onboarding/ProfileCreation';
import Home from './pages/Home/Home';
import Chat from './pages/Chat/Chat';
import SchemesList from './pages/Schemes/SchemesList';
import SchemeDetails from './pages/Schemes/SchemeDetails';
import SellCrop from './pages/Marketplace/SellCrop';
import MandiBhav from './pages/Marketplace/MandiBhav';
import MySales from './pages/Marketplace/MySales';
import Profile from './pages/Profile/Profile';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import { useAuth } from './context/AuthContext';

// Protected Route Guard for Farmers
const FarmerRoute = ({ children }) => {
  const { isFarmerAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isFarmerAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Only Route Guard for Farmer Login/Splash (Redirects to /home if already logged in)
const PublicFarmerRoute = ({ children }) => {
  const { isFarmerAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isFarmerAuthenticated ? <Navigate to="/home" replace /> : children;
};

// Protected Route Guard for Admin
const AdminRoute = ({ children }) => {
  const { isAdminAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAdminAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

// Public Only Route Guard for Admin Login
const PublicAdminRoute = ({ children }) => {
  const { isAdminAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAdminAuthenticated ? <Navigate to="/admin/dashboard" replace /> : children;
};

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Admin Console Routes */}
          <Route path="/admin/login" element={<PublicAdminRoute><AdminLogin /></PublicAdminRoute>} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          {/* Farmer Mobile App Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<PublicFarmerRoute><Splash /></PublicFarmerRoute>} />
            <Route path="/login" element={<PublicFarmerRoute><Login /></PublicFarmerRoute>} />
            <Route path="/onboarding" element={<FarmerRoute><ProfileCreation /></FarmerRoute>} />
            
            {/* Main Farmer App Protected Routes */}
            <Route path="/home" element={<FarmerRoute><Home /></FarmerRoute>} />
            <Route path="/chat" element={<FarmerRoute><Chat /></FarmerRoute>} />
            <Route path="/schemes" element={<FarmerRoute><SchemesList /></FarmerRoute>} />
            <Route path="/schemes/:id" element={<FarmerRoute><SchemeDetails /></FarmerRoute>} />
            <Route path="/sell" element={<FarmerRoute><SellCrop /></FarmerRoute>} />
            <Route path="/mandi-bhav" element={<FarmerRoute><MandiBhav /></FarmerRoute>} />
            <Route path="/sales" element={<FarmerRoute><MySales /></FarmerRoute>} />
            <Route path="/profile" element={<FarmerRoute><Profile /></FarmerRoute>} />
            
            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Analytics />
    </>
  );
}

export default App;
