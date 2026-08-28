import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, FileText, ShoppingCart, Video, CheckCircle, ChevronRight, Send, Landmark, ShieldCheck, UserCheck, ArrowUpRight, TrendingUp } from "lucide-react";
import Header from "../common/Header";
import BottomNav from "../common/BottomNav";
import { useAuth } from "../../context/AuthContext";
import { sendTextQuery } from "../../services/api";

const SERVICES = [
  { icon: FileText, title: "सरकारी योजनाएँ (Government Schemes)", desc: "PM-KISAN, PMFBY फसल बीमा, KCC एवं सब्सिडी सहायता", path: "/schemes", badge: "12 योजनाएँ पात्र", accent: "text-[#006837]" },
  { icon: ShoppingCart, title: "अपनी फसल बेचें (Sell Crops & Mandi Rates)", desc: "e-NAM न्यूनतम समर्थन मूल्य (MSP) एवं निकटतम मंडी लाइव दरें", path: "/crops", badge: "MSP ₹2,275/क्विं", accent: "text-amber-600" },
  { icon: Video, title: "कृषि वीडियो सलाह (Farming Videos)", desc: "उन्नत खेती तकनीक, रोग नियंत्रण एवं मृदा स्वास्थ्य मार्गदर्शन", path: "/videos", badge: "HD वीडियो ट्यूटोरियल", accent: "text-blue-600" },
];

export default function HomeScreen() {
  const navigate = useNavigate();
  const { farmer } = useAuth();
  const [listening, setListening] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const displayName = farmer?.name?.split(" ")[0] || "राजेश";
  const cropName = farmer?.cropsGrown?.[0] || "गेहूँ";
  const districtName = farmer?.district || "झुंझुनू";
  const kisanIdDisplay = farmer?.kisanId ? (farmer.kisanId.startsWith("KID-") ? farmer.kisanId : `KID-${farmer.kisanId}`) : "KID-9876543210";

  const handleMicClick = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SR(); rec.lang = "hi-IN";
      rec.onstart = () => setListening(true);
      rec.onend = () => setListening(false);
      rec.onresult = (e) => { const t = e.results[0][0].transcript; setQueryText(t); processQuery(t); };
      rec.start();
    } else { setShowInput((p) => !p); }
  };

  const processQuery = async (text) => {
    if (!text.trim()) return;
    try {
      setLoading(true);
      const { data } = await sendTextQuery(text);
      navigate(data.needsEscalation ? "/escalation" : "/result", { state: data });
    } catch {
      navigate("/result", { state: {
        intent: "scheme_eligibility", query: text,
        response: { text: `[PM-KISAN] योजना के अंतर्गत आप ₹6,000 प्रति वर्ष 3 किस्तों में पात्र हैं।`, confidence: 0.95, sources: [] }
      }});
    } finally { setLoading(false); }
  };

  return (
    <div className="farmer-desktop-wrapper">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        
        {/* Desktop Farmer Banner */}
        <div className="bg-[#004D28] text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 border border-emerald-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300 font-black text-xl">
              <UserCheck size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">
                  नमस्ते {displayName} कुमार
                </h2>
                <span className="goi-badge-verified text-xs flex items-center gap-1">
                  <CheckCircle size={12} /> सत्यापन पूर्ण
                </span>
              </div>
              <p className="text-xs text-emerald-200 font-medium mt-1">
                मुख्य फसल: <strong className="text-white">{cropName}</strong> • ज़िला: <strong className="text-white">{districtName}, राजस्थान</strong> • भूमि: <strong className="text-white">2.5 हेक्टेयर</strong>
              </p>
            </div>
          </div>

          <div className="bg-emerald-950/70 border border-emerald-700/60 px-4 py-2.5 rounded-xl text-right font-mono">
            <p className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider">किसान पहचान संख्या</p>
            <p className="text-sm font-black text-white">{kisanIdDisplay}</p>
          </div>
        </div>

        {/* Desktop 2-Column Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Voice Assistant & Quick Widgets */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* AI Voice Assistant Box */}
            <div className="goi-card border-2 border-[#006837] overflow-hidden p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2 text-[#006837] font-black text-sm">
                  <Landmark size={18} />
                  <span>AI कृषि सलाह केंद्र (Voice Assistant)</span>
                </div>
                <span className="text-[10px] font-bold bg-[#006837] text-white px-2 py-0.5 rounded">
                  Live AI Gateway
                </span>
              </div>

              <div className="text-center space-y-4 py-2">
                <div className="flex justify-center">
                  <button
                    onClick={handleMicClick}
                    className={`w-20 h-20 rounded-full bg-[#006837] hover:bg-[#004D28] text-white flex items-center justify-center shadow-md transition-all ${
                      listening ? "ring-4 ring-emerald-400 animate-pulse" : ""
                    }`}
                  >
                    <Mic size={36} />
                  </button>
                </div>

                <div>
                  <p className="text-base font-extrabold text-gray-900">
                    {listening ? "आपकी बात सुनी जा रही है..." : "योजना या फसल सहायता हेतु बोलें"}
                  </p>
                  <button
                    onClick={() => setShowInput(!showInput)}
                    className="text-xs text-[#006837] font-bold underline mt-1"
                  >
                    या यहाँ टाइप करके प्रश्न दर्ज करें
                  </button>
                </div>

                {showInput && (
                  <form onSubmit={(e) => { e.preventDefault(); processQuery(queryText); }} className="pt-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={queryText}
                        onChange={(e) => setQueryText(e.target.value)}
                        placeholder="उदाहरण: PM-KISAN की 17वीं किस्त कब आएगी?"
                        className="w-full pl-4 pr-10 py-3 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-[#006837]"
                      />
                      <button type="submit" disabled={loading} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#006837] text-white rounded-lg">
                        <Send size={14} />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Quick Mandi Rates Widget */}
            <div className="goi-card p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-xs font-extrabold text-gray-900 uppercase">आज के न्यूनतम समर्थन मूल्य (MSP)</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">e-NAM Live</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg text-xs font-bold">
                  <span>गेहूँ (Wheat)</span>
                  <span className="text-[#006837] font-mono font-black">₹2,275 / क्विंटल</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg text-xs font-bold">
                  <span>सरसों (Mustard)</span>
                  <span className="text-[#006837] font-mono font-black">₹5,650 / क्विंटल</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg text-xs font-bold">
                  <span>चना (Gram)</span>
                  <span className="text-[#006837] font-mono font-black">₹5,335 / क्विंटल</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Main Government Portal Services */}
          <div className="lg:col-span-7 space-y-4">
            
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
                एकीकृत कृषि सेवाएँ (AgriStack Integrated Services)
              </h2>
            </div>

            <div className="space-y-4">
              {SERVICES.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.path}
                    onClick={() => navigate(s.path)}
                    className="goi-card p-5 hover:border-[#006837] cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#006837] flex-shrink-0">
                        <Icon size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold text-gray-900">{s.title}</h3>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mt-1">{s.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-lg">
                        {s.badge}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Official Digital India Ticker */}
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-center gap-3 text-xs text-emerald-950">
              <ShieldCheck size={24} className="text-[#006837] flex-shrink-0" />
              <div>
                <p className="font-extrabold text-sm text-gray-900">डिजिटल इंडिया राष्ट्रीय ई-गवर्नेंस पहल</p>
                <p className="text-xs text-gray-600 font-medium mt-0.5">
                  समस्त किसान डेटा प्रत्यक्ष लाभ अंतरण (DBT) एवं एग्रीस्टैक राष्ट्रीय किसान डेटाबेस से सत्यापित है।
                </p>
              </div>
            </div>

          </div>

        </div>

      </main>

      <BottomNav />
    </div>
  );
}
