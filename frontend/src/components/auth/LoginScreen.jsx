import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Landmark, Lock, CheckCircle2, Phone, UserCheck, ArrowRight } from "lucide-react";
import Header from "../common/Header";
import BottomNav from "../common/BottomNav";
import { sendOTP } from "../../services/api";

export default function LoginScreen() {
  const navigate = useNavigate();
  const [kisanId, setKisanId] = useState("KID-9876543210");
  const [mobile, setMobile] = useState("9876543210");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!kisanId || !mobile) { setError("कृपया सभी आवश्यक विवरण दर्ज करें"); return; }
    if (mobile.length !== 10) { setError("मोबाइल नंबर 10 अंकों का होना चाहिए"); return; }
    try {
      setLoading(true);
      await sendOTP(kisanId, mobile);
      navigate("/otp", { state: { kisanId, mobile } });
    } catch {
      navigate("/otp", { state: { kisanId, mobile } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="farmer-desktop-wrapper">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Hero Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-[#006837] px-3.5 py-1.5 rounded-full text-xs font-extrabold">
            <Landmark size={14} />
            <span>भारत सरकार • राष्ट्रीय एग्रीस्टैक किसान डेटाबेस</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight tracking-tight">
            डिजिटल कृषि सहायता एवं <span className="text-[#006837]">योजना पोर्टल</span>
          </h1>

          <p className="text-base text-gray-600 font-medium leading-relaxed">
            PM-KISAN सम्मान निधि, प्रधानमंत्री फसल बीमा (PMFBY), न्यूनतम समर्थन मूल्य (MSP) फसल बिक्री एवं प्रत्यक्ष लाभ अंतरण (DBT) सेवाओं हेतु एकीकृत राष्ट्रीय मंच।
          </p>

          {/* Key Portal Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="goi-card p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-[#006837] flex items-center justify-center flex-shrink-0 font-bold">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-gray-900">स्वचालित पात्रता जाँच</h3>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">भू-अभिलेख खसरा रिकॉर्ड से सीधा सत्यापन</p>
              </div>
            </div>

            <div className="goi-card p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-[#006837] flex items-center justify-center flex-shrink-0 font-bold">
                <UserCheck size={20} />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-gray-900">e-NAM मंडी भाव</h3>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">निकटतम मंडी दरों की सीधी तुलना</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-5">
          <div className="goi-card p-8 space-y-6 shadow-lg border-2 border-emerald-100">
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#006837] font-black text-sm">
                  <Lock size={18} />
                  <span>किसान पहचान सत्यापन (Login)</span>
                </div>
                <span className="goi-badge-verified text-[10px]">AgriStack Live</span>
              </div>
              <p className="text-xs text-gray-500 font-semibold mt-1">
                अपना 10 अंकों का किसान आईडी एवं मोबाइल नंबर दर्ज करें
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-1.5">
                  किसान आईडी (Kisan ID) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="KID-9876543210"
                  value={kisanId}
                  onChange={(e) => setKisanId(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-[#006837] focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-1.5">
                  रजिस्टर्ड मोबाइल नंबर <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-[#006837] focus:ring-2 focus:ring-emerald-100"
                />
                <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1 font-medium">
                  <CheckCircle2 size={12} className="text-[#006837]" />
                  UIDAI आधार से पंजीकृत मोबाइल पर 6 अंकों का OTP भेजा जाएगा
                </p>
              </div>

              {error && (
                <p className="text-red-700 text-xs font-bold bg-red-50 border border-red-200 p-3 rounded-xl text-center">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#006837] hover:bg-[#004D28] text-white font-extrabold rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>{loading ? "ओटीपी भेजा जा रहा है..." : "ओटीपी प्राप्त करें (Send OTP)"}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="pt-4 border-t border-gray-100 text-center text-xs text-gray-500 font-medium">
              राष्ट्रीय सूचना विज्ञान केंद्र (NIC) एवं डिजिटल इंडिया पहल
            </div>
          </div>
        </div>

      </main>

      <BottomNav />
    </div>
  );
}
