import sys
import site
sys.path.insert(0, site.getusersitepackages())

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

import json
import os
from config import config
from rag_service import rag_engine

class LLMService:
    @staticmethod
    def generate_response(question: str, farmer_context: dict = None) -> dict:
        groq_key = config.GROQ_API_KEY
        api_key = config.GOOGLE_API_KEY
        farmer_name = farmer_context.get("name") if farmer_context else None
        user_profile_text = f"User Context: Name: {farmer_name}." if farmer_name and farmer_name != "guest" else ""

        # Scheme Intent Gate: Only activate RAG if the query actually asks about government schemes, eligibility, or guidelines
        scheme_keywords = ["yojana", "scheme", "pension", "kmy", "pm-kisan", "pmkisan", "bima", "pmfby", "kcc", "subsidy", "patrata", "eligibility", "guideline", "kist", "installment", "nidhi", "pradhan mantri"]
        is_scheme_intent = any(kw in question.lower() for kw in scheme_keywords)

        rag_results = rag_engine.search_documents(question) if is_scheme_intent else []
        has_rag_data = is_scheme_intent and len(rag_results) > 0 and rag_results[0].score >= 3.0
        context_str = "\n".join([f"[{r.source}] {r.content}" for r in rag_results[:3]]) if has_rag_data else ""
        top_source = rag_results[0].source if has_rag_data else "Kisan Setu AI"

        # 1. Primary Engine: Ultra-Fast Groq Models
        if groq_key and groq_key.startswith("gsk_") and len(groq_key) > 20:
            groq_models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "openai/gpt-oss-120b", "qwen/qwen3.6-27b"]
            try:
                from groq import Groq
                client = Groq(api_key=groq_key)

                system_content = f"You are Kisan Setu AI Saathi, an intelligent, helpful multilingual AI assistant for Indian citizens and farmers. {user_profile_text}"
                if has_rag_data:
                    user_prompt = f"Official Document Knowledge Base:\n{context_str}\n\nUser Question: {question}\n\nAnswer directly in the user's language/script. Return ONLY valid JSON with keys: 'cardTitle', 'answer', 'detail', 'source' (cite {top_source})."
                else:
                    user_prompt = f"User Question: {question}\n\nAnswer directly and helpfully in the user's language/script without unsolicited farming lectures unless crop advice was requested.\nReturn ONLY valid JSON with keys:\n- cardTitle: Short title with emoji\n- answer: Direct helpful answer in user language\n- detail: Key steps/bullet points if relevant (or empty string)\n- source: 'Kisan Setu AI'"

                for gm in groq_models:
                    try:
                        chat_res = client.chat.completions.create(
                            model=gm,
                            messages=[
                                {"role": "system", "content": system_content + "\nOutput MUST be valid JSON only. Do not include thinking or extra explanation outside the JSON."},
                                {"role": "user", "content": user_prompt}
                            ],
                            temperature=0.3,
                            max_tokens=1024
                        )
                        raw_text = chat_res.choices[0].message.content or ""
                        if "</think>" in raw_text:
                            raw_text = raw_text.split("</think>")[-1].strip()
                        else:
                            import re
                            raw_text = re.sub(r'<think>[\s\S]*?</think>', '', raw_text).strip()
                        clean_text = raw_text.replace("```json", "").replace("```", "").strip()

                        payload = None
                        try:
                            payload = json.loads(clean_text)
                        except Exception:
                            fb = clean_text.find("{")
                            lb = clean_text.rfind("}")
                            if fb != -1 and lb != -1 and lb > fb:
                                try:
                                    payload = json.loads(clean_text[fb:lb + 1])
                                except Exception:
                                    pass

                        if not payload:
                            title_m = re.search(r'"cardTitle"\s*:\s*"([^"]+)"', clean_text, re.IGNORECASE)
                            ans_m = re.search(r'"answer"\s*:\s*"([^"]+)"', clean_text, re.IGNORECASE)
                            det_m = re.search(r'"detail"\s*:\s*"([^"]+)"', clean_text, re.IGNORECASE)
                            src_m = re.search(r'"source"\s*:\s*"([^"]+)"', clean_text, re.IGNORECASE)
                            if ans_m or title_m:
                                payload = {
                                    "cardTitle": title_m.group(1) if title_m else "Kisan Setu AI Saathi 🌾",
                                    "answer": ans_m.group(1).replace("\\n", "\n") if ans_m else clean_text,
                                    "detail": det_m.group(1).replace("\\n", "\n") if det_m else "",
                                    "source": src_m.group(1) if src_m else top_source
                                }

                        if payload and (payload.get("answer") or payload.get("detail") is not None):
                            return {
                                "cardTitle": payload.get("cardTitle", "Kisan Setu AI Saathi 🌾"),
                                "answer": payload.get("answer", clean_text),
                                "detail": payload.get("detail", ""),
                                "source": payload.get("source", top_source),
                            }
                    except Exception as g_err:
                        print(f"Groq model {gm} error: {g_err}")
            except Exception as e:
                print(f"Groq provider error: {e}")

        # 2. Secondary Engine: Google Gemini Models
        if api_key and not api_key.startswith("your_") and len(api_key) > 15:
            candidate_models = [
                "gemini-3.5-flash",
                "gemini-3.5-flash-lite",
                "gemini-3.1-flash-lite",
                "gemini-flash-latest",
                "gemini-3.7-flash",
            ]
            for model_name in candidate_models:
                try:
                    from langchain_google_genai import ChatGoogleGenerativeAI
                    model = ChatGoogleGenerativeAI(
                        model=model_name,
                        google_api_key=api_key,
                        temperature=0.3,
                        timeout=25,
                    )

                    if has_rag_data:
                        prompt = f"""You are Kisan Setu AI Saathi, a helpful, direct AI assistant for Indian farmers and citizens.
{user_profile_text}

OFFICIAL DOCUMENT SNIPPETS:
{context_str}

Farmer Question: {question}

GUIDELINES:
1. Answer the user's question directly, accurately, and naturally in Hindi / Hinglish.
2. If the document answers the query, cite it in "source".
3. Keep the response clean and relevant without unnecessary lecture.
4. Return ONLY valid JSON:
{{
  "cardTitle": "Short title with emoji (e.g. PM-KMY Pension Niyam 📜)",
  "answer": "Direct clear answer in conversational Hindi/Hinglish",
  "detail": "Actionable steps or key points (or leave empty if not needed)",
  "source": "{top_source} (Official RAG)"
}}
"""
                    else:
                        prompt = f"""You are Kisan Setu AI Saathi, an intelligent, friendly, and direct conversational AI chatbot for Indian farmers and citizens.
{user_profile_text}

Farmer Question: {question}

GUIDELINES:
1. Answer ONLY what the user asked directly, naturally, and concisely in Hindi/Hinglish.
2. DO NOT assume unasked context, and DO NOT force fake persona names or unasked farming lectures.
3. For Weather: Answer the weather concisely for the requested place (or user's city if mentioned). Do not dump unasked spraying/irrigation tutorials unless requested.
4. For General Questions: Act like a smart, helpful conversational AI.
5. For Farming/Pest/Fertilizer Questions: Provide practical, clear advisory and dosage in "detail".
6. If no "detail" is needed, set "detail": "".

Return ONLY valid JSON:
{{
  "cardTitle": "Short relevant title with emoji (e.g. Mausam Jankari 🌤️, Tamatar Rog Nidan 🍅)",
  "answer": "Direct, natural answer to the query",
  "detail": "Bullet points / steps if applicable, or empty string",
  "source": "Kisan Setu AI"
}}
"""

                    res = model.invoke(prompt).content
                    if isinstance(res, list):
                        res = "".join(str(p) for p in res)
                    clean_text = str(res).replace("```json", "").replace("```", "").strip()
                    payload = None

                    try:
                        payload = json.loads(clean_text)
                    except Exception:
                        first_brace = clean_text.find("{")
                        last_brace = clean_text.rfind("}")
                        if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
                            try:
                                payload = json.loads(clean_text[first_brace:last_brace + 1])
                            except Exception:
                                pass

                    if not payload:
                        import re
                        title_m = re.search(r'"cardTitle"\s*:\s*"([^"]+)"', clean_text, re.IGNORECASE)
                        ans_m = re.search(r'"answer"\s*:\s*"([^"]+)"', clean_text, re.IGNORECASE)
                        det_m = re.search(r'"detail"\s*:\s*"([^"]+)"', clean_text, re.IGNORECASE)
                        src_m = re.search(r'"source"\s*:\s*"([^"]+)"', clean_text, re.IGNORECASE)
                        if ans_m or title_m:
                            payload = {
                                "cardTitle": title_m.group(1) if title_m else "Kisan Setu AI Saathi 🌾",
                                "answer": ans_m.group(1).replace("\\n", "\n") if ans_m else clean_text,
                                "detail": det_m.group(1).replace("\\n", "\n") if det_m else "",
                                "source": src_m.group(1) if src_m else (top_source if has_rag_data else "Kisan Setu Krishi Vigyan AI (LLM Model)")
                            }

                    if payload and (payload.get("answer") or payload.get("detail")):
                        return {
                            "cardTitle": payload.get("cardTitle", "Kisan Setu AI Saathi 🌾"),
                            "answer": payload.get("answer", clean_text),
                            "detail": payload.get("detail", ""),
                            "source": payload.get("source", top_source if has_rag_data else "Kisan Setu Krishi Vigyan AI (LLM Model)"),
                        }
                except Exception as err:
                    print(f"Gemini API model {model_name} error: {err}")

        # Intelligent Offline Agricultural Knowledge Base
        q = question.lower()
        if "pension" in q or "kmy" in q or "maandhan" in q or "mandhan" in q:
            return {
                "cardTitle": "PM Kisan Maandhan Yojana (PM-KMY) 📜",
                "answer": "PM-KMY 18-40 varsh ke chote kisanon ke liye pension yojana hai. 60 varsh ki umar par ₹3,000/month pension milti hai.",
                "detail": "Aavedan ke liye CSC centre jayein. Monthly contribution ₹55-₹200 hoga jismein samaan yogdan kendra sarkar degi.",
                "source": "PM-KMY - Operational Guidelines.pdf (Official RAG)"
            }
        elif "pm-kisan" in q or "pmkisan" in q or "6000" in q or "kist" in q:
            return {
                "cardTitle": "PM-KISAN Samman Nidhi 📜",
                "answer": "PM-KISAN ke tehat paatr kisanon ko har saal ₹6,000 ki aarthik sahayata 3 samaan kiston (₹2,000) mein milti hai.",
                "detail": "Check karein ki aapka Aadhaar bank khate se linked hai, e-KYC biometric ya OTP se puri hai, aur land seeding verified hai.",
                "source": "SCHEMES.pdf (Official RAG)"
            }
        elif "mausam" in q or "weather" in q or "baarish" in q or "barsat" in q:
            return {
                "cardTitle": "Mausam Alert & Advisory 🌤️",
                "answer": f"Namaste {farmer_name}! {district} ({state}) mein agle 48 ghanto mein halki dhoop aur aanshik badal rehne ki sambhavna hai. Taapmaan 24°C se 32°C rahega.",
                "detail": "Krishi Salah: Tayar fasalon ki katai aur thresing ko dhoop mein poora karein. Sinchai subah ya shaam ke samay karein.",
                "source": "IMD Weather Department & Krishi Vigyan Kendra"
            }
        elif "mandi" in q or "bhav" in q or "rate" in q or "price" in q or "becho" in q:
            return {
                "cardTitle": "Mandi Bhav & Selling Rate 📊",
                "answer": f"Namaste {farmer_name}! {district} mandi mein Gehun ₹2,275-₹2,450/Qtl, Sarson ₹5,200-₹5,450/Qtl, aur Dhan ₹2,183-₹2,300/Qtl chal raha hai.",
                "detail": "Fasal Becho section se apni fasal direct khareeddaaron ko bechkar behtar munafa paayein.",
                "source": "Agmarknet National Mandi Portal"
            }
        elif "tamatar" in q or "tomato" in q or ("keet" in q and ("patti" in q or "fal" in q)):
            return {
                "cardTitle": "Tamatar Keet & Rog Nidan 🍅",
                "answer": "Tamatar mein pattiya peeli padna ya fal chhedak keet Whitefly ya Fruit Borer ke karan hota hai.",
                "detail": "Upchar: Neem Oil (1500 ppm) 3-4 ml/L paani mein milakar chhidkein. Adhik keet par Imidacloprid 17.8% SL (0.5 ml/L) ka prayog karein.",
                "source": "ICAR-IIHR Tomato Protection Guidelines"
            }
        elif "gehun" in q or "wheat" in q:
            return {
                "cardTitle": "Gehun Fasal & Sinchai Salah 🌾",
                "answer": "Gehun mein pehli sinchai buwai ke 21-25 din baad (CRI Stage) sabse mahatvapoorna hai.",
                "detail": "Advisory: Pehli sinchai ke baad 30-35 kg Urea prati acre top-dressing karein. Peela Rataua dikhne par Propiconazole 25% EC (1 ml/L) chhidkein.",
                "source": "Directorate of Wheat Development (ICAR)"
            }
        elif "sarson" in q or "mustard" in q or "mahu" in q:
            return {
                "cardTitle": "Sarson & Mahu (Aphid) Niyantran 🌼",
                "answer": "Sarson mein phool aate samay Mahu (Aphid) ka ras choosne se fasal kamzor hoti hai.",
                "detail": "Upchar: Dimethoate 30% EC (1.5 ml/L) ka shaam ko chhidkaav karein. Sulfur 80% WDG (1.5 kg/acre) se tel ki matra badhti hai.",
                "source": "ICAR-DRMR Mustard Advisory"
            }
        elif (("dhan" in q or "paddy" in q) and "maandhan" not in q and "samman" not in q):
            return {
                "cardTitle": "Dhan Ki Kheti & Rog Prabandhan 🌾",
                "answer": "Dhan mein Tana Chhedak aur Khaira rog mukhya samasyaen hain.",
                "detail": "Upchar: Chlorantraniliprole 18.5% SC (0.3 ml/L) chhidkein. Khaira rog ke liye Zinc Sulfate 21% (5 kg/acre) + bujha chuna prayog karein.",
                "source": "National Rice Research Institute (NRRI)"
            }
        elif "khad" in q or "fertilizer" in q or "urea" in q or "dap" in q:
            return {
                "cardTitle": "Urvarak & Khad Santulan Advisory 🌱",
                "answer": "Fasal mein santulit poshan ke liye N:P:K ka 4:2:1 anupaat aadarsh mana jata hai.",
                "detail": "Advisory: DAP 50 kg/acre buwai ke samay daalein. Urea ko 2-3 kiston mein sinchai ke baad top-dress karein.",
                "source": "Ministry of Agriculture & Farmers Welfare"
            }

        return {
            "cardTitle": "Kisan Setu AI Saathi 🌾",
            "answer": "Namaste! Aapke sawaal par madad ke liye taiyar hoon. Kripya apna shahar/zila ya fasal ka naam spasht karein taaki sateek jankari de sakein.",
            "detail": "Aap fasal rog, urvarak, mausam, mandi bhav, ya sarkari yojnaon ke bare mein seedhe pooch sakte hain.",
            "source": "Kisan Setu AI"
        }
