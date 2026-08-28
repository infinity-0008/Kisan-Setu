import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { listSchemes } from "../../services/adminApi";
import { FileText, Plus, CheckCircle, Clock } from "lucide-react";

export default function AdminSchemes() {
  const [schemes, setSchemes] = useState([]);

  useEffect(() => {
    loadSchemes();
  }, []);

  const loadSchemes = async () => {
    try {
      const { data } = await listSchemes();
      setSchemes(data.schemes || []);
    } catch {
      setSchemes([
        { schemeCode: "PM-KISAN", name: "PM-KISAN सम्मान निधि", category: "income-support", benefitAmount: "₹6,000 / Year", isActive: true, totalBeneficiaries: 112000000 },
        { schemeCode: "PMFBY", name: "PMFBY फसल बीमा योजना", category: "insurance", benefitAmount: "Crop Coverage", isActive: true, totalBeneficiaries: 55000000 },
        { schemeCode: "KCC", name: "किसान क्रेडिट कार्ड (KCC)", category: "credit", benefitAmount: "Up to ₹3 Lakh @ 4%", isActive: true, totalBeneficiaries: 73000000 },
        { schemeCode: "PM-KUSUM", name: "PM-KUSUM सोलर पंप सब्सिडी", category: "subsidy", benefitAmount: "60% Solar Subsidy", isActive: true, totalBeneficiaries: 350000 },
      ]);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <FileText size={20} className="text-[#00ED64]" />
              <span>Government Schemes Registry</span>
            </h1>
            <p className="text-xs text-[#94A3B8] font-medium mt-1">
              Ministry of Agriculture & Farmers Welfare Scheme Allocations
            </p>
          </div>

          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-[#00ED64] text-[#001E2B] rounded-md font-extrabold hover:bg-[#00D65A] transition-colors">
            <Plus size={15} />
            <span>Create Scheme Policy</span>
          </button>
        </div>

        <div className="atlas-card overflow-hidden">
          <table className="atlas-table">
            <thead>
              <tr>
                <th>Scheme Code</th>
                <th>Scheme Title</th>
                <th>Category</th>
                <th>Benefit Structure</th>
                <th>National Beneficiaries</th>
                <th>Sync Status</th>
              </tr>
            </thead>
            <tbody>
              {schemes.map((s) => (
                <tr key={s.schemeCode}>
                  <td className="font-mono text-xs text-[#00ED64] font-bold">{s.schemeCode}</td>
                  <td className="font-bold text-white">{s.name}</td>
                  <td>
                    <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded">
                      {s.category}
                    </span>
                  </td>
                  <td className="font-mono text-amber-300 font-bold">{s.benefitAmount}</td>
                  <td className="font-mono text-slate-300">{s.totalBeneficiaries?.toLocaleString("en-IN")}</td>
                  <td>
                    <span className="atlas-badge-emerald flex items-center gap-1 w-fit">
                      <CheckCircle size={11} /> Active Sync
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
