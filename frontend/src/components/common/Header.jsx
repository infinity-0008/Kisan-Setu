import { NavLink, useNavigate } from "react-router-dom";
import { Landmark, Shield, User, PhoneCall, ExternalLink, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const navigate = useNavigate();
  const { farmer, logout, token } = useAuth();

  const farmerName = farmer?.name || "राजेश कुमार";
  const kisanId = farmer?.kisanId ? (farmer.kisanId.startsWith("KID-") ? farmer.kisanId : `KID-${farmer.kisanId}`) : "KID-9876543210";

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-xs">
      {/* Top Tricolor Strip */}
      <div className="h-1 w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]"></div>
        <div className="h-full w-1/3 bg-white"></div>
        <div className="h-full w-1/3 bg-[#138808]"></div>
      </div>

      {/* Government Announcement Sub-bar */}
      <div className="bg-[#004D28] text-emerald-100 px-6 py-1.5 flex items-center justify-between text-xs font-medium">
        <div className="flex items-center gap-3">
          <span className="bg-amber-400 text-gray-950 font-extrabold text-[10px] px-1.5 py-0.5 rounded">
            GOI PORTAL
          </span>
          <span>डिजिटल कृषि एवं योजना सहायता पोर्टल • कृषि एवं किसान कल्याण मंत्रालय, भारत सरकार</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold">
            <PhoneCall size={13} />
            <span>टोल-फ्री हेल्पलाइन: 1800-180-1551</span>
          </div>
          
          <button
            onClick={() => navigate("/admin/login")}
            className="flex items-center gap-1 text-[#00ED64] hover:underline font-bold font-mono"
          >
            <span>Admin Console</span>
            <ExternalLink size={12} />
          </button>
        </div>
      </div>

      {/* Main Desktop Navbar */}
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Brand & Logo */}
        <div onClick={() => navigate("/")} className="flex items-center gap-3 cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-[#006837] text-white flex items-center justify-center shadow-sm">
            <Landmark size={22} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-[#006837] tracking-tight">किसान सेतु</h1>
              <span className="text-[10px] font-extrabold bg-emerald-100 text-[#006837] border border-emerald-300 px-2 py-0.5 rounded-full">
                AgriStack Ver. 2.4
              </span>
            </div>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">
              National Farmers Assistance & Mandi Price Portal
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        {token && (
          <nav className="flex items-center gap-1 bg-gray-100/80 p-1.5 rounded-xl border border-gray-200">
            <NavLink
              to="/home"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-xs font-extrabold transition-all ${
                  isActive
                    ? "bg-[#006837] text-white shadow-xs"
                    : "text-gray-700 hover:text-[#006837] hover:bg-white"
                }`
              }
            >
              मुख्य पृष्ठ (Home)
            </NavLink>

            <NavLink
              to="/schemes"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-xs font-extrabold transition-all ${
                  isActive
                    ? "bg-[#006837] text-white shadow-xs"
                    : "text-gray-700 hover:text-[#006837] hover:bg-white"
                }`
              }
            >
              सरकारी योजनाएँ (Schemes)
            </NavLink>

            <NavLink
              to="/crops"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-xs font-extrabold transition-all ${
                  isActive
                    ? "bg-[#006837] text-white shadow-xs"
                    : "text-gray-700 hover:text-[#006837] hover:bg-white"
                }`
              }
            >
              फसल बेचें (Sell Crops)
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-xs font-extrabold transition-all ${
                  isActive
                    ? "bg-[#006837] text-white shadow-xs"
                    : "text-gray-700 hover:text-[#006837] hover:bg-white"
                }`
              }
            >
              मेरी प्रोफ़ाइल (Profile)
            </NavLink>
          </nav>
        )}

        {/* User Account / Login Status Pill */}
        {token ? (
          <div className="flex items-center gap-3">
            <div
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl cursor-pointer hover:border-[#006837] transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-[#006837] text-white flex items-center justify-center text-xs font-bold">
                <User size={14} />
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-gray-900 leading-tight">{farmerName}</p>
                <p className="text-[10px] text-[#006837] font-mono font-bold">{kisanId}</p>
              </div>
            </div>

            <button
              onClick={() => { logout(); navigate("/"); }}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              title="लॉगआउट (Sign Out)"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2.5 bg-[#006837] hover:bg-[#004D28] text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors"
          >
            किसान लॉगिन (Farmer Login)
          </button>
        )}
      </div>
    </header>
  );
}
