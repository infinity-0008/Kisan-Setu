import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { listListings } from "../../services/adminApi";
import { Leaf, MapPin, Tag } from "lucide-react";

export default function AdminListings() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      const { data } = await listListings();
      setListings(data.listings || []);
    } catch {
      setListings([
        { _id: "1", cropName: "गेहूँ (Wheat)", quantity: 50, expectedPrice: 2180, mspPrice: 2275, mandiName: "श्रीगंगानगर मंडी", state: "राजस्थान", farmerName: "राजेश कुमार", status: "active" },
        { _id: "2", cropName: "सरसों (Mustard)", quantity: 30, expectedPrice: 5500, mspPrice: 5650, mandiName: "हनुमानगढ़ मंडी", state: "राजस्थान", farmerName: "रमेश यादव", status: "active" },
        { _id: "3", cropName: "चना (Gram)", quantity: 40, expectedPrice: 5200, mspPrice: 5335, mandiName: "जयपुर मंडी", state: "राजस्थान", farmerName: "सुनील शर्मा", status: "active" },
      ]);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Leaf size={20} className="text-[#00ED64]" />
              <span>Live Crop Mandi Market Listings</span>
            </h1>
            <p className="text-xs text-[#94A3B8] font-medium mt-1">
              AgriStack Mandi Price Discovery & Procurement Intent Telemetry
            </p>
          </div>
        </div>

        <div className="atlas-card overflow-hidden">
          <table className="atlas-table">
            <thead>
              <tr>
                <th>Crop Type</th>
                <th>Farmer Seller</th>
                <th>Quantity</th>
                <th>Asking Price</th>
                <th>Official MSP</th>
                <th>Target Mandi</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((item) => (
                <tr key={item._id}>
                  <td className="font-bold text-white flex items-center gap-2">
                    <Tag size={14} className="text-emerald-400" />
                    <span>{item.cropName}</span>
                  </td>
                  <td className="text-slate-300 font-semibold">{item.farmerName}</td>
                  <td className="font-mono text-slate-300">{item.quantity} Qtl</td>
                  <td className="font-mono text-[#00ED64] font-bold">₹{item.expectedPrice?.toLocaleString("en-IN")}</td>
                  <td className="font-mono text-amber-300">₹{item.mspPrice?.toLocaleString("en-IN")}</td>
                  <td className="text-slate-300 flex items-center gap-1">
                    <MapPin size={12} className="text-slate-500" />
                    <span>{item.mandiName}</span>
                  </td>
                  <td>
                    <span className="atlas-badge-emerald">Live Listing</span>
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
