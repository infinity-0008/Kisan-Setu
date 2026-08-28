import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Farmer screens
import LoginScreen from "./components/auth/LoginScreen";
import OTPScreen from "./components/auth/OTPScreen";
import HomeScreen from "./components/home/HomeScreen";
import SchemesScreen from "./components/schemes/SchemesScreen";
import CropSellScreen from "./components/crops/CropSellScreen";
import ProfileScreen from "./components/profile/ProfileScreen";
import ResultScreen from "./components/common/ResultScreen";
import EscalationScreen from "./components/common/EscalationScreen";
import CSCHelpScreen from "./components/common/CSCHelpScreen";

// Admin screens
import AdminLoginScreen from "./components/admin/AdminLoginScreen";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminFarmers from "./components/admin/AdminFarmers";
import AdminSchemes from "./components/admin/AdminSchemes";
import AdminListings from "./components/admin/AdminListings";
import AdminSystem from "./components/admin/AdminSystem";

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/" />;
}

function PublicRoute({ children }) {
  const { token } = useAuth();
  return token ? <Navigate to="/home" /> : children;
}

function AdminProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken");
  return token ? children : <Navigate to="/admin/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Farmer Mobile App Routes */}
        <Route path="/" element={<PublicRoute><LoginScreen /></PublicRoute>} />
        <Route path="/otp" element={<PublicRoute><OTPScreen /></PublicRoute>} />
        <Route path="/home" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
        <Route path="/schemes" element={<ProtectedRoute><SchemesScreen /></ProtectedRoute>} />
        <Route path="/crops" element={<ProtectedRoute><CropSellScreen /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
        <Route path="/result" element={<ProtectedRoute><ResultScreen /></ProtectedRoute>} />
        <Route path="/escalation" element={<ProtectedRoute><EscalationScreen /></ProtectedRoute>} />
        <Route path="/csc-help" element={<ProtectedRoute><CSCHelpScreen /></ProtectedRoute>} />

        {/* Admin Corporate Desktop SaaS Routes (MongoDB Atlas Style) */}
        <Route path="/admin/login" element={<AdminLoginScreen />} />
        <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
        <Route path="/admin/farmers" element={<AdminProtectedRoute><AdminFarmers /></AdminProtectedRoute>} />
        <Route path="/admin/schemes" element={<AdminProtectedRoute><AdminSchemes /></AdminProtectedRoute>} />
        <Route path="/admin/listings" element={<AdminProtectedRoute><AdminListings /></AdminProtectedRoute>} />
        <Route path="/admin/system" element={<AdminProtectedRoute><AdminSystem /></AdminProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
