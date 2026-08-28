import { useNavigate } from "react-router-dom";
import { CheckCircle, MapPin, Landmark, ExternalLink, ShieldCheck } from "lucide-react";
import Header from "../common/Header";
import BottomNav from "../common/BottomNav";

const SCHEMES = [
  {
    code: "PM-KISAN",
    title: "PM-KISAN सम्मान निधि योजना",
    desc: "समस्त पात्र किसान परिवारों को ₹6,000 प्रति वर्ष 3 समान किस्तों में प्रत्यक्ष बैंक अंतरण (DBT)।",
    benefit: "₹6,000 / वर्ष (3 किस्तें)",
    status: "पात्र (Eligible)",
    isEligible: true,
    dept: "कृषि एवं किसान कल्याण विभाग",
  },
  {
    code: "PMFBY",
    title: "प्रधानमंत्री फसल बीमा योजना (PMFBY)",
    desc: "प्राकृतिक आपदाओं, कीटों तथा रोगों से फसल क्षति स्थिति में व्यापक बीमा वित्तीय सुरक्षा कवच।",
    benefit: "फसल बीमा सुरक्षा आवरण",
    status: "प्रक्रियाधीन (Under Verification)",
    isEligible: false,
    dept: "भारतीय कृषि बीमा कंपनी",
  },
  {
    code: "KCC",
    title: "किसान क्रेडिट कार्ड योजना (KCC)",
    desc: "कम ब्याज दर (4%) पर रियायती कृषि ऋण एवं कार्यशील पूंजी की सुलभ उपलब्धता।",
    benefit: "₹3 लाख तक ऋण @ 4%",
    status: "पात्र (Eligible)",
    isEligible: true,
    dept: "नाबार्ड / राष्ट्रीयकृत बैंक",
  },
];

export default function SchemesScreen() {
  const navigate = useNavigate();

  return (
    <div className="farmer-desktop-wrapper">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        
        {/* Title Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">सरकारी योजनाएँ (Government Schemes Directory)</h1>
            <p className="text-xs text-gray-500 font-medium mt-1">
              प्रत्यक्ष लाभ अंतरण (DBT) एवं एग्रीस्टैक राष्ट्रीय किसान डेटाबेस एकीकृत योजनाएँ
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-300 text-[#006837] px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2">
            <ShieldCheck size={16} />
            <span>DBT Direct Bank Sync Active</span>
          </div>
        </div>

        {/* Schemes Desktop Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SCHEMES.map((s) => (
            <div key={s.code} className="goi-card flex flex-col justify-between p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-xs font-extrabold text-[#006837] font-mono bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    {s.code}
                  </span>
                  <span className={s.isEligible ? "goi-badge-verified text-xs" : "goi-badge-pending text-xs"}>
                    {s.status}
                  </span>
                </div>

                <h2 className="text-base font-extrabold text-gray-900 leading-snug">{s.title}</h2>
                <p className="text-xs text-gray-600 font-medium leading-relaxed">{s.desc}</p>
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-gray-500 font-medium">वार्षिक लाभ विवरण:</span>
                  <span className="text-sm font-black text-[#006837] font-mono">{s.benefit}</span>
                </div>

                <button
                  onClick={() => navigate("/csc-help")}
                  className="w-full py-2.5 bg-gray-50 border border-gray-300 hover:border-[#006837] hover:bg-emerald-50 text-gray-800 hover:text-[#006837] font-extrabold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <MapPin size={14} />
                  <span>CSC केंद्र पर सहायता लें</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </main>

      <BottomNav />
    </div>
  );
}
