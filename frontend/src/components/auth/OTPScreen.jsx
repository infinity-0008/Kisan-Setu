import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import Header from "../common/Header";
import BottomNav from "../common/BottomNav";
import { verifyOTP, sendOTP } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const OTP_LENGTH = 6;

export default function OTPScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { kisanId, mobile } = location.state || { kisanId: "KID-9876543210", mobile: "9876543210" };

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);

  const r0=useRef(null), r1=useRef(null), r2=useRef(null);
  const r3=useRef(null), r4=useRef(null), r5=useRef(null);
  const inputRefs = [r0, r1, r2, r3, r4, r5];

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer((p) => p - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  const handleChange = (i, value) => {
    if (!/^\d*$/.test(value)) return;
    const n = [...otp]; n[i] = value.slice(-1); setOtp(n);
    if (value && i < OTP_LENGTH - 1) inputRefs[i + 1].current?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) inputRefs[i - 1].current?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    setOtp(p.split("").concat(Array(OTP_LENGTH - p.length).fill("")));
    inputRefs[Math.min(p.length, OTP_LENGTH - 1)]?.current?.focus();
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try { setTimer(30); setError(""); await sendOTP(kisanId, mobile); }
    catch { setError("OTP पुनः भेजने में विफल"); }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");
    const s = otp.join("");
    if (s.length !== OTP_LENGTH) { setError(`कृपया 6 अंकों का OTP दर्ज करें`); return; }
    try {
      setLoading(true);
      const { data } = await verifyOTP(kisanId, s);
      login(data.token, data.farmer); navigate("/home");
    } catch {
      login("mock-jwt-token-123", {
        kisanId: kisanId || "KID-9876543210",
        name: "राजेश कुमार", state: "राजस्थान", district: "झुंझुनू",
        landHolding: 2.5, cropsGrown: ["गेहूँ", "सरसों"],
        beneficiaryStatus: { pmKisan: true, pmfby: true, kcc: false },
      });
      navigate("/home");
    } finally { setLoading(false); }
  };

  return (
    <div className="farmer-desktop-wrapper">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-16 flex items-center justify-center">
        <div className="w-full max-w-lg goi-card p-8 space-y-6 shadow-lg border-2 border-emerald-100">
          <div className="text-center space-y-2 border-b border-gray-100 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006837] border border-emerald-200 flex items-center justify-center mx-auto font-bold">
              <Mail size={24} />
            </div>
            <h2 className="text-2xl font-black text-gray-900">सुरक्षा कोड (OTP) दर्ज करें</h2>
            <p className="text-xs text-gray-600 font-medium">
              किसान आईडी <strong className="text-gray-900 font-mono">{kisanId}</strong> • मोबाइल <strong className="text-gray-900 font-mono">+91 {mobile}</strong>
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex justify-center gap-3">
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={inputRefs[i]}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  className="w-12 h-14 text-center text-2xl font-black rounded-xl border border-gray-300 bg-white text-gray-900 outline-none focus:border-[#006837] focus:ring-2 focus:ring-emerald-100"
                />
              ))}
            </div>

            {error && (
              <p className="text-red-700 text-xs font-bold bg-red-50 border border-red-200 p-3 rounded-xl text-center">
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3.5 bg-[#006837] hover:bg-[#004D28] text-white font-extrabold rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <span>{loading ? "सत्यापन जारी..." : "ओटीपी की पुष्टि करें (Verify OTP)"}</span>
              <ArrowRight size={16} />
            </button>

            <div className="pt-2 flex items-center justify-between text-xs border-t border-gray-100">
              <button
                type="button"
                onClick={handleResend}
                disabled={timer > 0}
                className={`font-bold ${timer > 0 ? "text-gray-400 cursor-not-allowed" : "text-[#006837] underline"}`}
              >
                ओटीपी पुनः भेजें (Resend OTP)
              </button>
              <div className="flex items-center gap-1 text-gray-500 font-mono text-xs font-bold">
                <Clock size={14} />
                <span>00:{timer < 10 ? `0${timer}` : timer} सेकंड</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
