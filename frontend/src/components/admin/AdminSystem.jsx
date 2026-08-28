import AdminLayout from "./AdminLayout";
import { Activity, Database, Server, Cpu, ShieldCheck, Terminal } from "lucide-react";

export default function AdminSystem() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Activity size={20} className="text-[#00ED64]" />
              <span>System Infrastructure Telemetry</span>
            </h1>
            <p className="text-xs text-[#94A3B8] font-medium mt-1">
              MongoDB Atlas Health, Node.js API Cluster & JWT Auth Gateway Metrics
            </p>
          </div>
        </div>

        {/* System Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="atlas-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Database size={18} className="text-[#00ED64]" />
                <span>MongoDB Cluster</span>
              </div>
              <span className="atlas-badge-emerald">PRIMARY OK</span>
            </div>
            <div className="space-y-2 font-mono text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-[#1D3B4E]">
                <span>Version</span>
                <span className="text-white">v7.0.5 Community</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1D3B4E]">
                <span>Connections</span>
                <span className="text-[#00ED64]">18 / 500 Active</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Storage Used</span>
                <span className="text-white">124.5 MB</span>
              </div>
            </div>
          </div>

          <div className="atlas-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Server size={18} className="text-sky-400" />
                <span>Express API Server</span>
              </div>
              <span className="atlas-badge-blue">ONLINE</span>
            </div>
            <div className="space-y-2 font-mono text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-[#1D3B4E]">
                <span>Node Runtime</span>
                <span className="text-white">v20.11.0</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1D3B4E]">
                <span>Environment</span>
                <span className="text-sky-400">production</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Port</span>
                <span className="text-white">5000</span>
              </div>
            </div>
          </div>

          <div className="atlas-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Cpu size={18} className="text-amber-400" />
                <span>AgriStack Integration</span>
              </div>
              <span className="atlas-badge-amber">SYNCED</span>
            </div>
            <div className="space-y-2 font-mono text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-[#1D3B4E]">
                <span>OTP Provider</span>
                <span className="text-white">NIC SMS Gateway</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1D3B4E]">
                <span>Aadhaar Auth</span>
                <span className="text-[#00ED64]">UIDAI Verifier OK</span>
              </div>
              <div className="flex justify-between py-1">
                <span>MSP Registry</span>
                <span className="text-white">Updated 2024-25</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Terminal Output Console */}
        <div className="atlas-card p-5 space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-[#1D3B4E] pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Terminal size={16} className="text-[#00ED64]" />
              <span>Live System Log Stream (tail -f)</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-[#00ED64]">
              <ShieldCheck size={12} />
              <span>SSL TLS 1.3 SECURE</span>
            </div>
          </div>

          <div className="bg-[#06141C] border border-[#1D3B4E] rounded-lg p-4 text-xs space-y-1 text-slate-300 overflow-x-auto">
            <p className="text-emerald-400">[INFO] 2026-08-27T21:49:00Z MongoDB Atlas Connection established to cluster-in-01.mongodb.net</p>
            <p className="text-sky-400">[INFO] 2026-08-27T21:49:01Z Express Server initialized on port 5000 (Cors: Enabled)</p>
            <p className="text-[#00ED64]">[AUTH] 2026-08-27T21:49:02Z Verified farmer login request: KID-9876543210 (AgriStack UID verified)</p>
            <p className="text-slate-400">[HTTP] 2026-08-27T21:49:03Z GET /api/farmers/profile 200 OK (14ms)</p>
            <p className="text-slate-400">[HTTP] 2026-08-27T21:49:04Z GET /api/crops/msp 200 OK (9ms)</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
