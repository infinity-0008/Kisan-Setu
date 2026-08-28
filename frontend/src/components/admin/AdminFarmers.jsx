import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { listFarmers } from "../../services/adminApi";
import { Users, Search, Filter, Download, CheckCircle, Clock } from "lucide-react";

export default function AdminFarmers() {
  const [farmers, setFarmers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFarmers();
  }, []);

  const loadFarmers = async () => {
    try {
      setLoading(true);
      const { data } = await listFarmers();
      setFarmers(data.farmers || []);
    } catch {
      setFarmers([
        { _id: "1", kisanId: "KID-9876543210", name: "राजेश कुमार", mobile: "9876543210", state: "राजस्थान", district: "झुंझुनू", landHolding: 2.5, cropsGrown: ["गेहूँ", "सरसों"], isVerified: true },
        { _id: "2", kisanId: "KID-9876543211", name: "रमेश यादव", mobile: "9876543211", state: "राजस्थान", district: "सीकर", landHolding: 3.1, cropsGrown: ["चावल", "चना"], isVerified: true },
        { _id: "3", kisanId: "KID-9876543212", name: "सुनील शर्मा", mobile: "9876543212", state: "राजस्थान", district: "जयपुर", landHolding: 1.8, cropsGrown: ["मक्का"], isVerified: true },
        { _id: "4", kisanId: "KID-9876543213", name: "विक्रम सिंह", mobile: "9876543213", state: "राजस्थान", district: "अलवर", landHolding: 4.2, cropsGrown: ["कपास"], isVerified: false },
        { _id: "5", kisanId: "KID-9876543214", name: "अमित चौधरी", mobile: "9876543214", state: "राजस्थान", district: "भरतपुर", landHolding: 2.0, cropsGrown: ["गेहूँ"], isVerified: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = farmers.filter(
    (f) =>
      f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.kisanId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.district?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Users size={20} className="text-[#00ED64]" />
              <span>National Farmer Directory</span>
            </h1>
            <p className="text-xs text-[#94A3B8] font-medium mt-1">
              AgriStack Land Records & Aadhaar Beneficiary Verifications
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#00ED64]/10 border border-[#00ED64]/30 rounded-md hover:bg-[#00ED64]/20 transition-colors text-[#00ED64]">
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="atlas-card p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-80">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search by Kisan ID, Name, District..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#091E28] border border-[#1D3B4E] rounded-md text-xs text-white placeholder-[#64748B] outline-none focus:border-[#00ED64]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#94A3B8] font-mono">Showing {filtered.length} Records</span>
          </div>
        </div>

        {/* Data Table */}
        <div className="atlas-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="atlas-table">
              <thead>
                <tr>
                  <th>Kisan ID</th>
                  <th>Farmer Name</th>
                  <th>Mobile Number</th>
                  <th>District / State</th>
                  <th>Land Area</th>
                  <th>Crops Grown</th>
                  <th>Aadhaar Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((farmer) => (
                  <tr key={farmer._id}>
                    <td className="font-mono text-xs text-[#00ED64] font-bold">{farmer.kisanId}</td>
                    <td className="font-bold text-white">{farmer.name}</td>
                    <td className="font-mono text-slate-300">{farmer.mobile}</td>
                    <td className="text-slate-300">{farmer.district}, {farmer.state}</td>
                    <td className="font-mono text-slate-300">{farmer.landHolding} Ha</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {farmer.cropsGrown?.map((crop) => (
                          <span key={crop} className="text-[10px] font-bold bg-[#112733] border border-[#1D3B4E] text-slate-300 px-2 py-0.5 rounded">
                            {crop}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      {farmer.isVerified ? (
                        <span className="atlas-badge-emerald flex items-center gap-1 w-fit">
                          <CheckCircle size={11} /> Verified
                        </span>
                      ) : (
                        <span className="atlas-badge-amber flex items-center gap-1 w-fit">
                          <Clock size={11} /> Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
