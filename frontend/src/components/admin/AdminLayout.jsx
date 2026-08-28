import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Leaf,
  Activity,
  LogOut,
  Shield,
  ChevronRight,
  Database,
  Search,
  Bell,
  ExternalLink
} from "lucide-react";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Overview", end: true },
  { to: "/admin/farmers", icon: Users, label: "Farmer Directory" },
  { to: "/admin/schemes", icon: FileText, label: "Government Schemes" },
  { to: "/admin/listings", icon: Leaf, label: "Crop Market Listings" },
  { to: "/admin/system", icon: Activity, label: "System Telemetry" },
];

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen atlas-bg flex font-sans">
      {/* MongoDB Atlas Dark Slate Sidebar */}
      <aside className="w-64 atlas-sidebar flex flex-col fixed h-full z-20">
        {/* Brand Header */}
        <div className="p-4 border-b border-[#1D3B4E]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#00ED64]/10 border border-[#00ED64]/30 flex items-center justify-center text-[#00ED64]">
                <Database size={18} strokeWidth={2.5} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-white text-sm tracking-tight">Kisan Setu</span>
                  <span className="text-[9px] font-bold bg-[#00ED64]/20 text-[#00ED64] px-1.5 py-0.2 rounded border border-[#00ED64]/40">
                    ATLAS
                  </span>
                </div>
                <p className="text-[11px] text-[#94A3B8] font-medium">Enterprise Admin Console</p>
              </div>
            </div>
          </div>

          {/* Cluster Status Badge */}
          <div className="mt-3 bg-[#091E28] border border-[#1D3B4E] rounded-md px-2.5 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ED64] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ED64]"></span>
              </span>
              <span className="text-[11px] font-mono font-medium text-[#94A3B8]">Cluster-IN-01</span>
            </div>
            <span className="text-[10px] text-[#00ED64] font-mono font-bold">HEALTHY</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">
            Management Portal
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#00ED64]/10 text-[#00ED64] border border-[#00ED64]/30 shadow-xs"
                    : "text-[#94A3B8] hover:bg-[#112733] hover:text-white"
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon size={16} />
                <span>{item.label}</span>
              </div>
              <ChevronRight size={14} className="opacity-40" />
            </NavLink>
          ))}
        </nav>

        {/* Footer Admin User Card */}
        <div className="p-3 border-t border-[#1D3B4E] bg-[#091E28]/60">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-white">
                {adminUser.name?.[0] || "A"}
              </div>
              <div>
                <p className="text-xs font-bold text-white">{adminUser.name || "Administrator"}</p>
                <p className="text-[10px] text-[#94A3B8] font-mono">admin@kisansetu.gov.in</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-md transition-colors"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 min-h-screen flex flex-col">
        {/* Top Header Bar */}
        <header className="h-14 bg-[#001E2B]/80 backdrop-blur border-b border-[#1D3B4E] flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="relative w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                placeholder="Search farmers, schemes, records..."
                className="w-full pl-9 pr-4 py-1.5 bg-[#091E28] border border-[#1D3B4E] rounded-md text-xs font-medium text-white placeholder-[#64748B] outline-none focus:border-[#00ED64]"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-[#94A3B8] bg-[#091E28] border border-[#1D3B4E] px-3 py-1.5 rounded-md font-mono">
              <span className="w-2 h-2 rounded-full bg-[#00ED64]"></span>
              <span>Region: ap-south-1 (Mumbai)</span>
            </div>

            <button
              onClick={() => window.open("/", "_blank")}
              className="flex items-center gap-1.5 text-xs font-bold text-[#00ED64] bg-[#00ED64]/10 border border-[#00ED64]/30 px-3 py-1.5 rounded-md hover:bg-[#00ED64]/20 transition-colors"
            >
              <span>View Farmer App</span>
              <ExternalLink size={13} />
            </button>

            <button className="text-[#94A3B8] hover:text-white p-1.5 rounded-md hover:bg-[#112733] transition-colors relative">
              <Bell size={16} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#00ED64] rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Dashboard Canvas Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
