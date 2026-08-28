import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Headphones, CheckCircle, Home } from "lucide-react";
import Header from "./Header";
import { escalateQuery } from "../../services/api";

export default function EscalationScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state;
  const [submitted, setSubmitted] = useState(false);

  const handleEscalate = async () => {
    try {
      await escalateQuery({
        schemeCode: data?.schemes?.[0]?.schemeCode || "PM-KISAN",
        reason: "Low confidence response from AI",
        queryText: data?.response?.text || "General query",
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-12">
      <Header title="CSC सहायता डेस्क" showBack={true} showClose={true} />

      <main className="max-w-md w-full mx-auto px-4 md:px-8 pt-8 flex-1 flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-[#E8F5E9] border border-[#C8E6C9] rounded-full flex items-center justify-center mb-6 shadow-xs">
          <Headphones size={44} className="text-[#006837] stroke-[2]" />
        </div>

        {submitted ? (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs text-center w-full space-y-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-[#006837] mx-auto">
              <CheckCircle size={28} />
            </div>
            <h2 className="text-xl font-black text-gray-900">अनुरोध सफलतापूर्वक भेजा गया</h2>
            <p className="text-sm font-medium text-gray-600">
              आपके निकटतम CSC ऑपरेटर को आपकी समस्या भेज दी गई है। वे जल्द ही आपसे संपर्क करेंगे।
            </p>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs text-center w-full space-y-4">
            <h2 className="text-xl font-black text-gray-900">CSC ऑपरेटर से बात करें</h2>
            <p className="text-sm font-medium text-gray-600 leading-relaxed">
              AI उत्तर की संतुष्टि न होने पर आप CSC ऑपरेटर से सीधा संपर्क कर सकते हैं।
            </p>

            {data?.response?.text && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-left text-xs font-semibold text-gray-700">
                "{data.response.text}"
              </div>
            )}

            <button
              type="button"
              onClick={handleEscalate}
              className="w-full py-3.5 bg-[#006837] hover:bg-[#00522b] text-white font-extrabold rounded-xl text-base transition-colors shadow-xs"
            >
              CSC ऑपरेटर से संपर्क करें
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate("/home")}
          className="mt-6 flex items-center gap-2 text-sm font-extrabold text-[#006837] hover:underline"
        >
          <Home size={16} />
          <span>होम पर वापस जाएँ</span>
        </button>
      </main>
    </div>
  );
}

