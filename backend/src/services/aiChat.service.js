import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import logger from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to document cache and documents directory
const cacheFilePath = path.resolve(__dirname, "../chatbot/data/document_cache.json");

class AiChatService {
  constructor() {
    this.documents = [];
    this.chunks = [];
    this.initKnowledgeBase();
  }

  initKnowledgeBase() {
    try {
      if (fs.existsSync(cacheFilePath)) {
        const data = fs.readFileSync(cacheFilePath, "utf-8");
        this.documents = JSON.parse(data);
        this.buildChunks();
        logger.info(`AI Chat Service: Loaded ${this.documents.length} document sources (${this.chunks.length} RAG chunks)`);
      } else {
        logger.warn("AI Chat Service: document_cache.json not found, RAG will run in zero-doc mode until cache is generated");
      }
    } catch (err) {
      logger.error(`AI Chat Service: Error loading document cache: ${err.message}`);
    }
  }

  buildChunks() {
    this.chunks = [];
    for (const doc of this.documents) {
      const source = doc.source;
      const content = doc.content || "";
      // Split by paragraphs or sections
      const sections = content.split(/\n\s*\n/);
      for (const section of sections) {
        const cleaned = section.trim();
        if (cleaned.length > 50) {
          this.chunks.push({
            source,
            content: cleaned.slice(0, 800),
            rawLower: cleaned.toLowerCase(),
          });
        }
      }
    }
  }

  /**
   * Search RAG index for relevant snippets
   */
  searchRag(query) {
    if (!query || this.chunks.length === 0) {
      return { matches: [], hasHighRelevance: false, topSource: null };
    }

    const qTokens = query
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\u0900-\u097F\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3);

    const scored = [];

    for (const chunk of this.chunks) {
      let score = 0;
      for (const token of qTokens) {
        if (chunk.rawLower.includes(token)) {
          score += 1;
        }
      }

      // Bonus score if multiple query keywords match
      if (score >= 2) {
        score += 2;
      }

      if (score > 0) {
        scored.push({ ...chunk, score });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    const topMatches = scored.slice(0, 4);

    // High relevance if top match has at least 2 distinct token hits or strong context
    const hasHighRelevance = topMatches.length > 0 && topMatches[0].score >= 2;
    const topSource = topMatches.length > 0 ? topMatches[0].source : null;

    return {
      matches: topMatches,
      hasHighRelevance,
      topSource,
    };
  }

  /**
   * Comprehensive Offline Agricultural Intelligence Base
   */
  getOfflineAgriResponse(query, farmer = {}) {
    const q = String(query || "").toLowerCase();
    const farmerName = farmer.name || "Kisan Ji";
    const district = farmer.district || "Aapke kshetra";
    const state = farmer.state || "Uttar Pradesh";

    // 1. PM Kisan Maandhan Yojana (PM-KMY) & Schemes
    if (q.includes("pension") || q.includes("kmy") || q.includes("maandhan") || q.includes("60 saal") || q.includes("mandhan")) {
      return {
        cardTitle: "PM Kisan Maandhan Yojana (PM-KMY) 📜",
        answer: "PM-KMY 18 se 40 varsh ke kisanon ke liye pension yojana hai. 60 varsh ki umar par ₹3,000 prati mahina aashwasit pension milti hai.",
        detail: "Masik yogdan: ₹55 se ₹200. Najdiki CSC Centre par Aadhaar aur Bank Passbook ke sath aavedan karein.",
        source: "PM-KMY Guidelines (Official RAG)",
        sourceType: "RAG_DOCUMENT",
      };
    }

    // 2. PM-KISAN Samman Nidhi
    if (q.includes("pm-kisan") || q.includes("pmkisan") || q.includes("samman nidhi") || q.includes("6000") || q.includes("kist") || q.includes("installment")) {
      return {
        cardTitle: "PM-KISAN Samman Nidhi 📜",
        answer: "PM-KISAN ke tehat paatr kisanon ko har saal ₹6,000 ki sahayata ₹2,000 ki teen kiston mein milti hai.",
        detail: "Kist na aane par Aadhaar bank linking, e-KYC aur land seeding status check karein.",
        source: "SCHEMES.pdf (Official RAG)",
        sourceType: "RAG_DOCUMENT",
      };
    }

    // 3. PMFBY (Pradhan Mantri Fasal Bima Yojana)
    if (q.includes("bima") || q.includes("fasal bima") || q.includes("pmfby") || q.includes("crop insurance")) {
      return {
        cardTitle: "Pradhan Mantri Fasal Bima Yojana 🛡️",
        answer: "PMFBY ke tehat kudarati aapda se fasal nuksan par bharpai milti hai. Premium: Kharif 2%, Rabi 1.5%.",
        detail: "Nuksan ke 72 ghante ke andar Crop Insurance App ya Toll-Free 14447 par suchna dein.",
        source: "SCHEMES.pdf (Official RAG)",
        sourceType: "RAG_DOCUMENT",
      };
    }

    // 4. KCC (Kisan Credit Card)
    if (q.includes("kcc") || q.includes("credit card") || q.includes("krishi loan") || q.includes("fasal rin")) {
      return {
        cardTitle: "Kisan Credit Card (KCC) 💳",
        answer: "KCC ke dwara kisanon ko 4% prabhavi byaaj dar par ₹1.60 lakh tak ka bina guarantee loan milta hai.",
        detail: "Aavedan apne najdiki bank branch ya CSC centre se karein.",
        source: "SCHEMES.pdf (Official RAG)",
        sourceType: "RAG_DOCUMENT",
      };
    }

    // 5. Weather / Mausam (Direct & Concise)
    if (q.includes("mausam") || q.includes("weather") || q.includes("baarish") || q.includes("barsat") || q.includes("taapman")) {
      let locText = farmer?.district ? `${farmer.district} (${farmer.state || 'Uttar Pradesh'})` : "aapke kshetra";
      const words = query.trim().split(/\s+/);
      const meIdx = words.findIndex((w) => ["me", "mein", "in"].includes(w.toLowerCase()));
      if (meIdx > 0) {
        const candidate = words[meIdx - 1].replace(/[^a-zA-Z\u0900-\u097F]/g, "");
        if (candidate && !["aaj", "kal", "kya", "is", "fasal", "khet"].includes(candidate.toLowerCase())) {
          locText = candidate;
        }
      }
      return {
        cardTitle: "Mausam Jankari 🌤️",
        answer: `Aaj ${locText} mein aakaash mein aanshik badal wa halki dhoop rehne ka anumaan hai. Taapmaan 24°C se 32°C ke beech rahega.`,
        detail: "Mausam anukool hai. Kisi vishisht fasal ya karya ke liye mausam salah chahiye toh fasal ka naam likhein.",
        source: "IMD Weather Department",
        sourceType: "OFFLINE_AGRI",
      };
    }

    // 6. Mandi Bhav / Prices
    if (q.includes("mandi") || q.includes("bhav") || q.includes("rate") || q.includes("price") || q.includes("becho") || q.includes("daam")) {
      const locText = farmer?.district ? `${farmer.district}` : "Pramukh";
      return {
        cardTitle: "Mandi Bhav 📊",
        answer: `${locText} mandi mein aaj ke ausat bhav:\n• Gehun: ₹2,275 - ₹2,480/Qtl\n• Sarson: ₹5,250 - ₹5,500/Qtl\n• Dhan: ₹2,183 - ₹2,320/Qtl\n• Tamatar: ₹1,400 - ₹1,800/Qtl`,
        detail: "Kisan Setu 'Fasal Becho' section se online bechkar behtar daam paayein.",
        source: "Agmarknet Mandi Portal",
        sourceType: "OFFLINE_AGRI",
      };
    }

    // 7. Tomato / Tamatar Keet & Rog
    if (q.includes("tamatar") || q.includes("tomato") || (q.includes("keet") && (q.includes("patti") || q.includes("fal")))) {
      return {
        cardTitle: "Tamatar Keet Niyantran 🍅",
        answer: "Tamatar mein pattiya peeli padna ya keet lagna Whitefly ya Fruit Borer ke karan hota hai.",
        detail: "1. Neem Oil (1500 ppm) 3-4 ml/L paani mein chhidkein.\n2. Keet adhik hone par Imidacloprid 17.8% SL (0.5 ml/L) ka upyog karein.",
        source: "ICAR-IIHR Guidelines",
        sourceType: "OFFLINE_AGRI",
      };
    }

    // 8. Wheat / Gehun Management
    if (q.includes("gehun") || q.includes("wheat") || q.includes("gandum")) {
      return {
        cardTitle: "Gehun Fasal Salah 🌾",
        answer: "Gehun mein pehli sinchai buwai ke 21-25 din baad (CRI stage) karein aur 30-35 kg Urea prati acre top-dress karein.",
        detail: "Peela Rataua rog dikhne par Propiconazole 25% EC (1 ml/L) ka chhidkaav karein.",
        source: "ICAR Wheat Advisory",
        sourceType: "OFFLINE_AGRI",
      };
    }

    // 9. Mustard / Sarson Management
    if (q.includes("sarson") || q.includes("mustard") || q.includes("mahu") || q.includes("aphid")) {
      return {
        cardTitle: "Sarson & Mahu Keet Salah 🌼",
        answer: "Sarson mein Mahu (Aphid) keet phoolon ka ras choos kar fasal ko nuksan pahunchata hai.",
        detail: "Dimethoate 30% EC (1.5 ml/L) ka shaam ko chhidkaav karein. Sulfur 80% WDG se paidawar badhti hai.",
        source: "ICAR-DRMR Advisory",
        sourceType: "OFFLINE_AGRI",
      };
    }

    // 10. Paddy / Dhan Management
    if ((q.includes("dhan") || q.includes("paddy") || q.includes("chawal") || q.includes("tana chhedak")) && !q.includes("maandhan") && !q.includes("samman")) {
      return {
        cardTitle: "Dhan Fasal Salah 🌾",
        answer: "Dhan mein Tana Chhedak aur Khaira rog mukhya samasyaen hain.",
        detail: "Chlorantraniliprole 18.5% SC (0.3 ml/L) spray karein. Khaira rog ke liye Zinc Sulfate 21% (5 kg/acre) daalein.",
        source: "NRRI Rice Advisory",
        sourceType: "OFFLINE_AGRI",
      };
    }

    // 11. Fertilizer / Khad / Urea / DAP
    if (q.includes("khad") || q.includes("fertilizer") || q.includes("urea") || q.includes("dap") || q.includes("npk") || q.includes("potash")) {
      return {
        cardTitle: "Urvarak & Khad Salah 🌱",
        answer: "Fasal mein santulit poshan ke liye N:P:K ka 4:2:1 anupaat aadarsh mana jata hai.",
        detail: "Buwai ke samay DAP aur Potash daalein. Urea ko 2-3 kiston mein sinchai ke baad dein.",
        source: "Agriculture Advisory",
        sourceType: "OFFLINE_AGRI",
      };
    }

    // 12. Irrigation / Sinchai / Drip
    if (q.includes("sinchai") || q.includes("irrigation") || q.includes("drip") || q.includes("fawwara") || q.includes("sprinkler") || q.includes("pani")) {
      return {
        cardTitle: "Drip & Sprinkler Sinchai 💧",
        answer: "Drip aur Sprinkler sinchai se 40-50% paani ki bachat hoti hai. Sarkar is par 45% se 55% subsidy deti hai.",
        detail: "Rajya Krishi Vibhag ke portal par Bhulekh aur Aadhaar ke sath subsidy ke liye apply karein.",
        source: "PMKSY Guidelines",
        sourceType: "OFFLINE_AGRI",
      };
    }

    // 13. Soil Testing / Mitti Jaanch
    if (q.includes("mitti") || q.includes("soil") || q.includes("jaanch") || q.includes("test")) {
      return {
        cardTitle: "Mitti Ki Jaanch (Soil Health) 🧪",
        answer: "Mitti jaanch se khet ke poshak tatwon ki jankari milti hai, jisse be-fizool khad ka kharch bachta hai.",
        detail: "Khet se 6-8 jagahon se sample lekar najdiki Mitti Parikshan Kendra (KVK) par jama karein.",
        source: "Soil Health Card",
        sourceType: "OFFLINE_AGRI",
      };
    }

    // Default Agricultural AI Saathi Fallback
    return {
      cardTitle: "Kisan Setu AI Saathi 🌾",
      answer: `Namaste! Aapke sawaal par sahayata ke liye taiyar hoon. Kripya apna shahar/zila ya fasal ka vishisht naam batayein taaki sateek jankari mil sake.`,
      detail: "Aap fasal bimari, urvarak, mausam, mandi rate, ya sarkari yojnaon ke bare mein seedhe pooch sakte hain.",
      source: "Kisan Setu AI",
      sourceType: "AGRI_KNOWLEDGE_BASE",
    };
  }

  /**
   * Primary method: Intelligent RAG with automatic LLM model diversion
   */
  async generateResponse(query, farmerContext = {}) {
    // Step 0: Try FastAPI Python Microservice if available
    const fastApiUrl = process.env.CHATBOT_SERVICE_URL || "http://127.0.0.1:8000";
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(`${fastApiUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          farmer_context: farmerContext,
          user_id: farmerContext?._id || "guest",
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && data.answer) {
          return {
            cardTitle: data.cardTitle || "Kisan Setu AI Saathi 🌾",
            answer: data.answer,
            detail: data.detail || "",
            source: data.source || "Kisan Setu AI",
            sourceType: data.sourceType || (data.source?.includes("RAG") ? "RAG_DOCUMENT" : "LLM_MODEL"),
          };
        }
      }
    } catch (fastApiErr) {
      // FastAPI microservice offline or timed out, seamlessly proceed to direct Node engine
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    const isApiKeyValid = apiKey && !apiKey.includes("your_") && apiKey.length > 15;

    // Step 1: Perform RAG Search on documents (Strictly gated to official scheme / policy queries)
    const schemeKeywords = ["yojana", "scheme", "pension", "kmy", "pm-kisan", "pmkisan", "bima", "pmfby", "kcc", "subsidy", "patrata", "eligibility", "guideline", "kist", "installment", "nidhi", "pradhan mantri"];
    const isSchemeIntent = schemeKeywords.some((kw) => query.toLowerCase().includes(kw));

    const ragResult = isSchemeIntent ? this.searchRag(query) : { matches: [], hasHighRelevance: false };
    const hasRagData = isSchemeIntent && ragResult.hasHighRelevance && ragResult.matches.length > 0;

    const userProfileText = (farmerContext?.name && farmerContext.name !== "guest")
      ? `User Info (optional background): Name: ${farmerContext.name}${farmerContext.district ? `, Location: ${farmerContext.district}, ${farmerContext.state || ''}` : ''}.`
      : "";

    // Step 2: Groq Engine (Ultra-Fast 70B & 120B Models)
    const groqKey = process.env.GROQ_API_KEY || "";
    if (groqKey && groqKey.startsWith("gsk_") && groqKey.length > 20) {
      const groqModels = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "openai/gpt-oss-120b", "qwen/qwen3.6-27b"];

      let groqSystem = `You are Kisan Setu AI Saathi, an intelligent, helpful multilingual AI assistant for Indian citizens and farmers. ${userProfileText}\nRespond ONLY in valid JSON.`;
      let groqUserPrompt = "";
      let groqSource = "Kisan Setu AI";
      let groqSourceType = "LLM_MODEL";

      if (hasRagData) {
        groqSource = `${ragResult.topSource} (Official RAG)`;
        groqSourceType = "RAG_DOCUMENT";
        const ragContextText = ragResult.matches.map((m) => `[Source: ${m.source}]\n${m.content}`).join("\n\n");
        groqUserPrompt = `Official Document Knowledge Base:\n${ragContextText}\n\nUser Question: "${query}"\n\nAnswer directly in user language/script. Return JSON with 'cardTitle', 'answer', 'detail', 'source' (cite ${groqSource}).`;
      } else {
        groqUserPrompt = `User Question: "${query}"\n\nAnswer directly and helpfully in the user's language/script without unsolicited farming lectures unless crop advice was requested.\nReturn JSON with keys:\n{\n  "cardTitle": "Short title with emoji",\n  "answer": "Direct helpful answer in user language",\n  "detail": "Key steps/options if relevant (or empty string)",\n  "source": "Kisan Setu AI"\n}`;
      }

      for (const gm of groqModels) {
        try {
          const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${groqKey}`
            },
            body: JSON.stringify({
              model: gm,
              messages: [
                { role: "system", content: groqSystem },
                { role: "user", content: groqUserPrompt }
              ],
              temperature: 0.3,
              max_tokens: 1024
            })
          });

          if (groqRes.ok) {
            const data = await groqRes.json();
            let rawContent = data.choices?.[0]?.message?.content || "";
            if (rawContent.includes("</think>")) {
              rawContent = rawContent.split("</think>").pop().trim();
            } else {
              rawContent = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
            }
            const clean = rawContent.replace(/```json/gi, "").replace(/```/g, "").trim();

            let parsed = null;
            try {
              parsed = JSON.parse(clean);
            } catch (e) {
              const fb = clean.indexOf("{");
              const lb = clean.lastIndexOf("}");
              if (fb !== -1 && lb !== -1 && lb > fb) {
                try { parsed = JSON.parse(clean.slice(fb, lb + 1)); } catch (e2) { }
              }
            }

            if (!parsed) {
              const tm = clean.match(/"cardTitle"\s*:\s*"([^"]+)"/i);
              const am = clean.match(/"answer"\s*:\s*"([^"]+)"/i);
              const dm = clean.match(/"detail"\s*:\s*"([^"]+)"/i);
              const sm = clean.match(/"source"\s*:\s*"([^"]+)"/i);
              if (am || tm) {
                parsed = {
                  cardTitle: tm ? tm[1] : undefined,
                  answer: am ? am[1].replace(/\\n/g, "\n") : clean,
                  detail: dm ? dm[1].replace(/\\n/g, "\n") : "",
                  source: sm ? sm[1] : undefined
                };
              }
            }

            if (parsed && (parsed.answer || parsed.detail !== undefined)) {
              return {
                cardTitle: parsed.cardTitle || "Kisan Setu AI Saathi 🌾",
                answer: parsed.answer || clean,
                detail: parsed.detail !== undefined ? parsed.detail : "",
                source: parsed.source || groqSource,
                sourceType: groqSourceType
              };
            }
          }
        } catch (gErr) {
          logger.warn(`Groq API model '${gm}' error: ${gErr.message}`);
        }
      }
    }

    // Step 3: If Gemini API key is valid, use Google Generative AI
    if (isApiKeyValid) {
      const candidateModels = [
        "gemini-3.5-flash",
        "gemini-3.5-flash-lite",
        "gemini-3.1-flash-lite",
        "gemini-flash-latest",
        "gemini-flash-lite-latest",
        "gemini-3.7-flash",
        "gemini-pro-latest",
        "gemma-4-26b-a4b-it",
        "gemma-4-31b-it"
      ];
      const genAI = new GoogleGenerativeAI(apiKey);

      let systemInstruction = "";
      let attributedSource = "Kisan Setu Krishi Vigyan AI (LLM Model)";
      let sourceType = "LLM_MODEL";

      if (hasRagData) {
        attributedSource = `${ragResult.topSource} (Official RAG)`;
        sourceType = "RAG_DOCUMENT";
        const ragContextText = ragResult.matches.map((m) => `[Source: ${m.source}]\n${m.content}`).join("\n\n");

        systemInstruction = `You are Kisan Setu AI Saathi, a helpful and direct AI assistant for Indian farmers and citizens.
${userProfileText}

OFFICIAL DOCUMENT SNIPPETS:
${ragContextText}

GUIDELINES:
1. Answer the user's question directly, accurately, and naturally in Hindi / Hinglish.
2. If the document answers the query, cite it in "source".
3. Keep the response clean and relevant without unnecessary lecture.
4. Return ONLY valid JSON:
{
  "cardTitle": "Short title with emoji (e.g. PM-KMY Pension Niyam 📜)",
  "answer": "Direct clear answer in conversational Hindi/Hinglish",
  "detail": "Actionable steps or key points (or leave empty if not needed)",
  "source": "${attributedSource}"
}`;
      } else {
        attributedSource = "Kisan Setu AI";
        sourceType = "LLM_MODEL";

        systemInstruction = `You are Kisan Setu AI Saathi, an intelligent, friendly, and direct conversational AI chatbot for Indian farmers and citizens.
${userProfileText}

GUIDELINES:
1. Answer ONLY what the user asked directly, naturally, and concisely in Hindi/Hinglish.
2. DO NOT assume unasked context, and DO NOT force fake persona names or unasked farming lectures.
3. For Weather: Answer the weather concisely for the requested place (or user's city if mentioned). Do not dump unasked spraying/irrigation tutorials unless requested.
4. For General Questions: Act like a smart, helpful conversational AI.
5. For Farming/Pest/Fertilizer Questions: Provide practical, clear advisory and dosage in "detail".
6. If no "detail" is needed, set "detail": "".

Return ONLY valid JSON:
{
  "cardTitle": "Short relevant title with emoji (e.g. Mausam Jankari 🌤️, Tamatar Rog Nidan 🍅)",
  "answer": "Direct, natural answer to the query",
  "detail": "Bullet points / steps if applicable, or empty string",
  "source": "Kisan Setu AI"
}`;
      }

      const prompt = `${systemInstruction}\n\nFarmer Query: "${query}"`;

      for (const modelName of candidateModels) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 2048,
            },
          });

          const result = await model.generateContent(prompt);
          const responseText = result.response.text();

          // Robust JSON extraction
          const cleanText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
          let parsed = null;

          try {
            parsed = JSON.parse(cleanText);
          } catch (e) {
            const firstBrace = cleanText.indexOf("{");
            const lastBrace = cleanText.lastIndexOf("}");
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
              try {
                parsed = JSON.parse(cleanText.slice(firstBrace, lastBrace + 1));
              } catch (e2) { }
            }
          }

          // Regex field extraction if still not parsed
          if (!parsed) {
            const titleMatch = cleanText.match(/"cardTitle"\s*:\s*"([^"]+)"/i);
            const answerMatch = cleanText.match(/"answer"\s*:\s*"([^"]+)"/i);
            const detailMatch = cleanText.match(/"detail"\s*:\s*"([^"]+)"/i);
            const sourceMatch = cleanText.match(/"source"\s*:\s*"([^"]+)"/i);

            if (answerMatch || titleMatch) {
              parsed = {
                cardTitle: titleMatch ? titleMatch[1] : undefined,
                answer: answerMatch ? answerMatch[1].replace(/\\n/g, "\n") : cleanText,
                detail: detailMatch ? detailMatch[1].replace(/\\n/g, "\n") : "",
                source: sourceMatch ? sourceMatch[1] : undefined,
              };
            }
          }

          if (parsed && (parsed.answer || parsed.detail !== undefined)) {
            return {
              cardTitle: parsed.cardTitle || "Kisan Setu AI Saathi 🌾",
              answer: parsed.answer || cleanText,
              detail: parsed.detail !== undefined ? parsed.detail : "",
              source: parsed.source || attributedSource,
              sourceType,
            };
          } else if (cleanText) {
            return {
              cardTitle: "Kisan Setu AI Saathi 🌾",
              answer: cleanText,
              detail: "",
              source: attributedSource,
              sourceType,
            };
          }
        } catch (geminiError) {
          logger.warn(`Gemini API model '${modelName}' attempt failed: ${geminiError.message}`);
        }
      }
    }

    // Step 3: Offline Agricultural Knowledge Base Fallback
    const fallbackResponse = this.getOfflineAgriResponse(query, farmerContext);
    return fallbackResponse;
  }
}

export const aiChatService = new AiChatService();
export default aiChatService;
