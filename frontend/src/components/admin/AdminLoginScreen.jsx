import { useState } from "react";
import AdminLayout from "./AdminLayout";
import { Lock, Database, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminLoginScreen() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("kisan2026");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "kisan2026") {
      localStorage.setItem("adminToken", "atlas-session-token-9988");
      localStorage.setItem("adminUser", JSON.stringify({ name: "System Admin", role: "Super Admin" }));
      navigate("/admin");
    } else {
      setError("Invalid administrative credentials");
    }
  };

  return (
    <div className="min-h-screen atlas-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md atlas-card p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#00ED64]/10 border border-[#00ED64]/30 flex items-center justify-center text-[#00ED64] mx-auto">
            <Database size={24} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Kisan Setu Enterprise</h1>
          <p className="text-xs text-[#94A3B8] font-medium">MongoDB Atlas Control Console • Single Sign-On</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-[#94A3B8] uppercase tracking-wider mb-1.5">
              Admin Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-[#091E28] border border-[#1D3B4E] rounded-lg text-sm text-white font-mono outline-none focus:border-[#00ED64]"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#94A3B8] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#091E28] border border-[#1D3B4E] rounded-lg text-sm text-white font-mono outline-none focus:border-[#00ED64]"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-[#00ED64] hover:bg-[#00D65A] text-[#001E2B] font-extrabold rounded-lg text-sm transition-colors shadow-lg shadow-[#00ED64]/20 flex items-center justify-center gap-2"
          >
            <Lock size={16} />
            <span>Authenticate Session</span>
          </button>
        </form>

        <div className="pt-4 border-t border-[#1D3B4E] flex items-center justify-between text-[11px] text-[#64748B]">
          <span className="flex items-center gap-1"><ShieldCheck size={13} className="text-[#00ED64]" /> 256-bit TLS Encrypted</span>
          <span>SIH 2026</span>
        </div>
      </div>
    </div>
  );
}
