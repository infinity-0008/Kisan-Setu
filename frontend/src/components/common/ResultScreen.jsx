import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, AlertTriangle, Sparkles, Home, ArrowLeft } from "lucide-react";
import Header from "./Header";

export default function ResultScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-12">
      <Header title="AI सलाह व जवाब" showBack={true} showClose={true} />

      <main className="max-w-4xl w-full mx-auto px-4 md:px-8 pt-6 flex-1 space-y-4">
        {/* Main Response Box */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs relative overflow-hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-[#006837] bg-green-50 px-3 py-1.5 rounded-full border border-green-200 w-fit mb-4">
            <Sparkles size={14} />
            <span>Kisan Setu AI उत्तर</span>
          </div>

          <p className="text-base md:text-lg font-medium text-gray-900 leading-relaxed whitespace-pre-line">
            {data?.response?.text || "क्षमा करें, आपके प्रश्न का उत्तर प्राप्त नहीं हो सका। कृपया पुनः प्रयास करें।"}
          </p>

          {data?.response?.sources?.length > 0 && (
            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2">
              <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">प्रमाणित स्रोत:</span>
              <div className="flex flex-wrap gap-1.5">
                {data.response.sources.map((s, i) => (
                  <span key={i} className="text-xs font-bold bg-[#E8F5E9] text-[#006837] border border-[#C8E6C9] px-2.5 py-1 rounded-lg">
                    {s.name || s.schemeCode}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Eligibility Detailed Breakdown */}
        {data?.eligibility && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-extrabold text-gray-900 tracking-tight">
              पात्रता विवरण (Eligibility Breakdown)
            </h3>
            <p className="text-sm font-bold text-[#006837] bg-green-50 px-3 py-2 rounded-xl border border-green-200">
              {data.eligibility.summary}
            </p>

            <div className="space-y-2 pt-2">
              {data.eligibility.checks?.map((check, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50">
                  <span className="text-sm font-semibold text-gray-800">{check.criterion}</span>
                  {check.pass ? (
                    <span className="text-xs font-extrabold text-[#006837] bg-[#E8F5E9] border border-[#C8E6C9] px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <CheckCircle size={12} />
                      पात्र ({check.actual})
                    </span>
                  ) : (
                    <span className="text-xs font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <AlertTriangle size={12} />
                      अपात्र ({check.actual})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Return Button */}
        <div className="pt-4">
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="w-full max-w-md mx-auto flex items-center justify-center gap-2 py-3.5 bg-[#006837] hover:bg-[#00522b] text-white font-extrabold rounded-xl text-base transition-colors shadow-xs"
          >
            <Home size={18} />
            <span>होम पर वापस जाएँ</span>
          </button>
        </div>
      </main>
    </div>
  );
}

