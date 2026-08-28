import { PhoneCall, Landmark, ShieldCheck, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BottomNav() {
  const navigate = useNavigate();

  return (
    <footer className="w-full bg-[#001E2B] text-slate-300 border-t border-slate-800 mt-auto py-10 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Column */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#006837] text-white flex items-center justify-center font-bold">
              <Landmark size={18} />
            </div>
            <span className="text-lg font-black text-white tracking-tight">किसान सेतु</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            कृषि एवं किसान कल्याण मंत्रालय द्वारा संचालित राष्ट्रीय एग्रीस्टैक पोर्टल।
          </p>
          <div className="flex items-center gap-1.5 text-xs text-[#00ED64] font-bold">
            <ShieldCheck size={14} />
            <span>256-bit SSL Direct DBT Verification</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-3">त्वरित लिंक (Quick Links)</h4>
          <ul className="space-y-2 text-xs font-medium text-slate-400">
            <li><button onClick={() => navigate("/home")} className="hover:text-white">मुख्य पृष्ठ (Home Dashboard)</button></li>
            <li><button onClick={() => navigate("/schemes")} className="hover:text-white">PM-KISAN एवं फसल बीमा</button></li>
            <li><button onClick={() => navigate("/crops")} className="hover:text-white">e-NAM मंडी न्यूनतम समर्थन मूल्य</button></li>
            <li><button onClick={() => navigate("/profile")} className="hover:text-white">किसान आईडी एवं भू-अभिलेख रिकॉर्ड</button></li>
          </ul>
        </div>

        {/* Government Portals */}
        <div>
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-3">सरकारी पोर्टल (Official Portals)</h4>
          <ul className="space-y-2 text-xs font-medium text-slate-400">
            <li className="flex items-center gap-1 hover:text-white cursor-pointer">
              <span>National Single Window System</span> <ExternalLink size={11} />
            </li>
            <li className="flex items-center gap-1 hover:text-white cursor-pointer">
              <span>PM-KISAN Samman Nidhi Portal</span> <ExternalLink size={11} />
            </li>
            <li className="flex items-center gap-1 hover:text-white cursor-pointer">
              <span>e-NAM National Agriculture Market</span> <ExternalLink size={11} />
            </li>
            <li className="flex items-center gap-1 hover:text-white cursor-pointer">
              <span>Digital India Land Records (DILRMP)</span> <ExternalLink size={11} />
            </li>
          </ul>
        </div>

        {/* Contact Helpline */}
        <div className="bg-[#091E28] border border-slate-800 rounded-xl p-4 space-y-2">
          <h4 className="text-xs font-extrabold text-white">किसान सहायता टोल-फ्री नंबर</h4>
          <div className="flex items-center gap-2 text-amber-400 text-lg font-black font-mono">
            <PhoneCall size={20} />
            <span>1800-180-1551</span>
          </div>
          <p className="text-[11px] text-slate-400">
            प्रातः 6:00 बजे से रात्रि 10:00 बजे तक (समस्त कार्य दिवस)
          </p>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 font-medium gap-4">
        <span>© 2026 Kisan Setu • Government of India • All Rights Reserved</span>
        <span>SIH 2026 Hackathon Innovation Project</span>
      </div>
    </footer>
  );
}
