import { useNavigate } from "react-router-dom";
import { UserCheck, ShieldCheck, MapPin, CheckCircle, FileText, Landmark, User } from "lucide-react";
import Header from "../common/Header";
import BottomNav from "../common/BottomNav";
import { useAuth } from "../../context/AuthContext";

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { farmer } = useAuth();

  const name = farmer?.name || "राजेश कुमार";
  const mobile = farmer?.mobile || "98765 43210";
  const location = `${farmer?.district || "झुंझुनू"}, ${farmer?.state || "राजस्थान"}`;
  const kisanId = farmer?.kisanId ? (farmer.kisanId.startsWith("KID-") ? farmer.kisanId : `KID-${farmer.kisanId}`) : "KID-9876543210";
  const crop = farmer?.cropsGrown?.[0] || "गेहूँ";
  const land = `${farmer?.landHolding || 2.5} हेक्टेयर`;

  return (
    <div className="farmer-desktop-wrapper">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        
        {/* Profile Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">मेरी प्रोफ़ाइल (Citizen Farmer Registry)</h1>
            <p className="text-xs text-gray-500 font-medium mt-1">
              AgriStack नेशनल फार्मर आईडी एवं ई-केवाईसी रिकॉर्ड
            </p>
          </div>

          <div className="goi-badge-verified text-xs flex items-center gap-1.5 px-3 py-1.5">
            <CheckCircle size={14} />
            <span>सत्यापित किसान पहचान पत्र</span>
          </div>
        </div>

        {/* 2-Column Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Identity Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="goi-card border-2 border-[#006837] overflow-hidden p-6 space-y-6">
              <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                <div className="w-16 h-16 rounded-2xl bg-[#006837] text-white flex items-center justify-center font-black text-2xl">
                  <User size={32} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-900">{name}</h2>
                  <p className="text-xs text-[#006837] font-mono font-bold mt-0.5">{kisanId}</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">{location}</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">रजिस्टर्ड मोबाइल:</span>
                  <span className="font-extrabold text-gray-900 font-mono">{mobile}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">मुख्य फसल:</span>
                  <span className="font-extrabold text-gray-900">{crop}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">कुल भूमि क्षेत्रफल:</span>
                  <span className="font-extrabold text-gray-900 font-mono">{land}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500 font-medium">राजस्व खसरा संख्या:</span>
                  <span className="font-extrabold text-[#006837] font-mono">खसरा #142/3</span>
                </div>
              </div>

              <button
                onClick={() => navigate("/csc-help")}
                className="w-full py-3 bg-[#006837] hover:bg-[#004D28] text-white font-extrabold rounded-xl text-xs transition-colors shadow-xs"
              >
                CSC केंद्र पर जानकारी अद्यतन करें (Update Info at CSC)
              </button>
            </div>
          </div>

          {/* Right Column: Verification Ledger & Status */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="goi-card p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <ShieldCheck size={20} className="text-[#006837]" />
                <h3 className="text-sm font-extrabold text-gray-900">AgriStack डिजिटल सत्यापन स्थिति</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-extrabold text-emerald-800 uppercase">आधार ई-केवाईसी (Aadhaar e-KYC)</span>
                  <p className="text-xs font-black text-emerald-950 flex items-center gap-1">
                    <CheckCircle size={14} className="text-[#006837]" /> पूर्णतः सत्यापित
                  </p>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-extrabold text-emerald-800 uppercase">प्रत्यक्ष लाभ अंतरण (DBT Direct Sync)</span>
                  <p className="text-xs font-black text-emerald-950 flex items-center gap-1">
                    <CheckCircle size={14} className="text-[#006837]" /> बैंक खाता लिंक
                  </p>
                </div>
              </div>
            </div>

            <div className="goi-card p-6 space-y-3">
              <h3 className="text-sm font-extrabold text-gray-900 border-b border-gray-100 pb-2">योजना लाभ स्थिति</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-xs">
                  <span className="font-bold text-gray-900">PM-KISAN सम्मान निधि</span>
                  <span className="goi-badge-verified">16 किस्ते प्राप्त</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-xs">
                  <span className="font-bold text-gray-900">PMFBY फसल बीमा पॉलिसी</span>
                  <span className="goi-badge-verified">पॉलिसी सक्रीय</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>

      <BottomNav />
    </div>
  );
}
