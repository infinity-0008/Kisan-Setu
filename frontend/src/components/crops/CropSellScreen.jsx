import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, MapPin, CheckCircle, Tag, TrendingUp, Building } from "lucide-react";
import Header from "../common/Header";
import BottomNav from "../common/BottomNav";
import { useAuth } from "../../context/AuthContext";

export default function CropSellScreen() {
  const navigate = useNavigate();
  const { farmer } = useAuth();
  const [cropType, setCropType] = useState(farmer?.cropsGrown?.[0] || "गेहूँ");
  const [quantity, setQuantity] = useState(50);
  const [submitted, setSubmitted] = useState(false);

  const mandis = [
    { name: "श्रीगंगानगर मंडी", distance: "15 किमी", price: 2180, isBest: true, transport: "कम परिवहन व्यय", district: "श्रीगंगानगर" },
    { name: "हनुमानगढ़ मंडी", distance: "42 किमी", price: 2210, isBest: false, transport: "सामान्य परिवहन व्यय", district: "हनुमानगढ़" },
    { name: "जयपुर मुख्य मंडी", distance: "85 किमी", price: 2240, isBest: false, transport: "अधिक परिवहन व्यय", district: "जयपुर" },
  ];

  const MSP = 2275;

  const handleSell = () => {
    setSubmitted(true);
    setTimeout(() => {
      alert("आपकी बिक्री रुचि मंडी पोर्टल पर सफलतापूर्वक दर्ज की गई!");
      setSubmitted(false);
    }, 600);
  };

  return (
    <div className="farmer-desktop-wrapper">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        
        {/* Title Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">अपनी फसल बेचें (Crop Sell & Mandi Market)</h1>
            <p className="text-xs text-gray-500 font-medium mt-1">
              e-NAM राष्ट्रीय कृषि बाज़ार न्यूनतम समर्थन मूल्य एवं निकटतम मंडी दरें
            </p>
          </div>

          <div className="bg-amber-100 border border-amber-300 text-amber-900 px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-700" />
            <span>MSP गेहूँ: ₹{MSP.toLocaleString("en-IN")} / क्विंटल</span>
          </div>
        </div>

        {/* 2-Column Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Mandi Rates Table */}
          <div className="lg:col-span-8 space-y-6">
            <div className="goi-card overflow-hidden">
              <div className="goi-card-header flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-900 font-extrabold text-xs">
                  <Building size={16} className="text-[#006837]" />
                  <span>निकटतम e-NAM मंडी भाव दरें (Mandi Price Directory)</span>
                </div>
                <span className="goi-badge-verified text-[10px]">Live e-NAM</span>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-xs font-extrabold text-gray-700 border-b border-gray-200">
                    <th className="p-3">मंडी का नाम</th>
                    <th className="p-3">ज़िला</th>
                    <th className="p-3">दूरी</th>
                    <th className="p-3">परिवहन व्यय</th>
                    <th className="p-3 text-right">वर्तमान दर</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-xs font-semibold">
                  {mandis.map((m, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-gray-900">
                        {m.name}
                        {m.isBest && (
                          <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded">
                            सर्वोत्तम लाभ
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-gray-600">{m.district}</td>
                      <td className="p-3 text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin size={13} className="text-gray-400" />
                          <span>{m.distance}</span>
                        </div>
                      </td>
                      <td className="p-3 text-gray-500">{m.transport}</td>
                      <td className="p-3 text-right font-black text-[#006837] font-mono text-base">
                        ₹{m.price.toLocaleString("en-IN")} <span className="text-xs text-gray-500 font-normal">/क्विं</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Express Selling Form */}
          <div className="lg:col-span-4">
            <div className="goi-card p-6 space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-sm font-extrabold text-gray-900">बिक्री रुचि दर्ज करें (Sell Interest Form)</h3>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">AgriStack मंडी खरीद केंद्र सीधे संपर्क करेगा</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">फसल का चयन करें</label>
                  <select
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    className="w-full p-3 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-[#006837]"
                  >
                    {["गेहूँ", "सरसों", "चावल", "चना"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">अनुमानित मात्रा (क्विंटल में)</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full p-3 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-[#006837]"
                  />
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>अनुमानित कुल मूल्य:</span>
                    <span className="text-[#006837] font-mono font-black text-sm">₹{(quantity * 2180).toLocaleString("en-IN")}</span>
                  </div>
                  <p className="text-[10px] text-emerald-900">न्यूनतम समर्थन मूल्य (MSP) गारंटी लागू</p>
                </div>

                <button
                  onClick={handleSell}
                  disabled={submitted}
                  className="w-full py-3.5 bg-[#006837] hover:bg-[#004D28] text-white font-extrabold rounded-xl text-xs transition-colors shadow-xs"
                >
                  {submitted ? "बिक्री रुचि दर्ज हो रही है..." : "बिक्री रुचि दर्ज करें (Confirm Interest)"}
                </button>
              </div>
            </div>
          </div>

        </div>

      </main>

      <BottomNav />
    </div>
  );
}
