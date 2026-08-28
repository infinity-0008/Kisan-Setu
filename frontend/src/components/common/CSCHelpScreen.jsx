import { useNavigate } from "react-router-dom";
import { Phone, MapPin, ExternalLink, FileCheck } from "lucide-react";
import Header from "./Header";

export default function CSCHelpScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-12">
      <Header title="CSC सहायता केंद्र" showBack={true} showClose={true} />

      <main className="max-w-4xl w-full mx-auto px-4 md:px-8 pt-6 flex-1 space-y-4">
        {/* Banner */}
        <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#006837] shadow-xs">
              <MapPin size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#006837] tracking-tight">
                सामान्य सेवा केंद्र (CSC)
              </h2>
              <p className="text-xs font-semibold text-gray-600 mt-0.5">
                अपने निकटतम CSC केंद्र पर सहायता प्राप्त करें या कॉल करें
              </p>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
            <h3 className="text-sm font-extrabold text-gray-900 mb-2 flex items-center gap-2">
              <Phone size={18} className="text-[#006837]" />
              टोल-फ्री हेल्पलाइन
            </h3>
            <p className="text-xs text-gray-500 mb-3 font-medium">
              किसी भी सहायता हेतु 24x7 कॉल करें:
            </p>
            <a
              href="tel:18001801551"
              className="inline-flex items-center gap-2 text-[#006837] font-black text-lg bg-green-50 px-4 py-2 rounded-xl border border-green-200"
            >
              1800-180-1551
            </a>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
            <h3 className="text-sm font-extrabold text-gray-900 mb-2 flex items-center gap-2">
              <ExternalLink size={18} className="text-[#006837]" />
              ऑनलाइन आधिकारिक पोर्टल
            </h3>
            <p className="text-xs text-gray-500 mb-3 font-medium">
              आधिकारिक वेबसाइट पर केंद्र खोजें:
            </p>
            <a
              href="https://csc.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#006837] font-extrabold text-base underline hover:text-[#004d28]"
            >
              csc.gov.in
            </a>
          </div>
        </div>

        {/* Required Documents Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
          <h3 className="text-sm font-extrabold text-gray-900 mb-3 flex items-center gap-2">
            <FileCheck size={18} className="text-[#006837]" />
            आवश्यक दस्तावेज (Documents to Carry)
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm font-semibold text-gray-700">
            <li className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
              <span className="w-2 h-2 rounded-full bg-[#006837]" />
              आधार कार्ड (Aadhaar Card)
            </li>
            <li className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
              <span className="w-2 h-2 rounded-full bg-[#006837]" />
              भूमि खसरा/खतौनी कागजात
            </li>
            <li className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
              <span className="w-2 h-2 rounded-full bg-[#006837]" />
              बैंक पासबुक (Bank Passbook)
            </li>
            <li className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
              <span className="w-2 h-2 rounded-full bg-[#006837]" />
              रजिस्टर्ड मोबाइल नंबर
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}

