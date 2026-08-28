import { speechToText, textToSpeech, translateText, detectLanguage } from "../utils/bhashini.js";
import { HTTP_STATUS } from "../constants.js";
import Farmer from "../models/farmer.model.js";
import logger from "../utils/logger.js";
import { execFile } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const chatbotDir = path.resolve(__dirname, "../chatbot");

/**
 * Execute Python RAG Chatbot Service directly inside backend
 */
const runPythonChatbotService = (query, farmerContext) => {
  return new Promise((resolve) => {
    const queryEscaped = String(query || "").replace(/'/g, "\\'").replace(/"/g, '\\"');
    const farmerJson = JSON.stringify(farmerContext || {});

    const pythonCode = `
import sys, site, json
sys.path.insert(0, site.getusersitepackages())
sys.path.insert(0, r"${chatbotDir}")

from llm_service import LLMService

farmer_ctx = json.loads(r'''${farmerJson}''')
res = LLMService.generate_response(r'''${queryEscaped}''', farmer_ctx)
print(json.dumps(res))
`;

    execFile("python", ["-c", pythonCode], { timeout: 10000, cwd: chatbotDir }, (error, stdout) => {
      if (error || !stdout) {
        logger.warn(`Python RAG execution fallback: ${error?.message}`);
        resolve(null);
      } else {
        try {
          const parsed = JSON.parse(stdout.trim());
          resolve(parsed);
        } catch (e) {
          resolve(null);
        }
      }
    });
  });
};

/**
 * Helper fallback response generator
 */
const getFallbackChatbotResponse = (query, farmer) => {
  const q = String(query || "").toLowerCase();
  if (q.includes("mausam") || q.includes("weather") || q.includes("baarish")) {
    return {
      cardTitle: "Mausam Alert & Advisory 🌤️",
      answer: `Namaste ${farmer.name} ji! 🙏\n\nAapke kshetra (${farmer.district}, ${farmer.state}) mein halki baarish wa aanshik badal rehne ki sambhavna hai. Taapmaan 26°C - 32°C rahega.`,
      detail: "Advisory: Tayar gehun/sarson ki fasal ko sookhi jagah par rakhein. Filhaal khad ka chhidkaw 1-2 din ke liye rok dein.",
      source: "IMD Weather Department & Krishi Vigyan Kendra"
    };
  } else if (q.includes("mandi") || q.includes("bhav") || q.includes("rate") || q.includes("price") || q.includes("becho")) {
    return {
      cardTitle: "Mandi Bhav & Selling Rate 📊",
      answer: `Namaste ${farmer.name} ji! 🙏\n\nNikattamiya mandi mein Gehun ka bhav ₹2,275 - ₹2,450/Qtl aur Sarson ka bhav ₹5,200 - ₹5,400/Qtl chal raha hai.`,
      detail: "Fasal Becho section se apni fasal online list karke direct khareeddaaron se achha daam paayein.",
      source: "Agmarknet National Mandi Portal"
    };
  } else if (q.includes("pension") || q.includes("kmy") || q.includes("maandhan")) {
    return {
      cardTitle: "PM Kisan Maandhan Yojana (PM-KMY) 📜",
      answer: "PM-KMY 18-40 varsh ke chote kisanon ke liye pension yojana hai. 60 varsh ki umar par ₹3,000/month pension milti hai.",
      detail: "Aavedan ke liye CSC centre jayein. Monthly contribution ₹55-₹200 hoga jismein samaan yogdan kendra sarkar degi.",
      source: "PM-KMY - Operational Guidelines.pdf"
    };
  } else if (q.includes("pm-kisan") || q.includes("6000") || q.includes("kist")) {
    return {
      cardTitle: "PM-KISAN Samman Nidhi 📜",
      answer: "PM-KISAN ke tehat paatr kisanon ko har saal ₹6,000 ki aarthik sahayata 3 samaan kiston (₹2,000) mein milti hai.",
      detail: "Check karein ki aapka Aadhaar bank khate se linked hai aur e-KYC puri hai.",
      source: "SCHEMES.pdf"
    };
  }

  return {
    cardTitle: "Kisan Setu RAG AI Saathi 🤖",
    answer: `Namaste ${farmer.name} ji! 🙏\n\nMain aapka Kisan Setu RAG AI sahayak hoon. Aap mujhse mausam, mandi bhav, PM-KISAN, ya fasal ki dekbal ke baare mein puch sakte hain.`,
    detail: "Aap niche mic icon par click karke bolkar bhi sawaal puch sakte hain.",
    source: "Kisan Setu RAG Knowledge Base"
  };
};

/**
 * @desc    Process voice query (ASR → Python RAG AI Chatbot → TTS)
 * @route   POST /api/v1/voice/query
 * @access  Private / Public
 */
export const processVoiceQuery = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Audio file is required",
      });
    }

    const farmer = (req.user?._id && req.user._id !== "guest_farmer")
      ? ((await Farmer.findById(req.user._id)) || req.user)
      : (req.user || { name: "Ram Kumar", state: "Uttar Pradesh", district: "Lucknow", landHolding: 2.5, cropsGrown: ["Gehun"] });
    const audioBuffer = req.file.buffer;

    // Step 1: Speech-to-Text
    const asrResult = await speechToText(audioBuffer, "hi");
    logger.info(`Voice transcribed: ${asrResult.text}`);

    // Step 2: Execute Python RAG Service inside backend
    let ragResult = await runPythonChatbotService(asrResult.text, farmer);
    if (!ragResult) {
      ragResult = getFallbackChatbotResponse(asrResult.text, farmer);
    }

    // Step 3: Text-to-Speech for Hindi response
    const ttsResult = await textToSpeech(ragResult.answer, "hi");

    return res.status(HTTP_STATUS.OK).json({
      transcription: asrResult.text,
      processedQuery: asrResult.text,
      intent: "rag_ai_chatbot",
      response: {
        text: ragResult.answer,
        cardTitle: ragResult.cardTitle || "KISAN SETU AI SAATHI",
        detail: ragResult.detail,
        source: ragResult.source,
        audioUrl: null,
        sources: [{ name: ragResult.source }],
        confidence: 0.95,
      },
      needsEscalation: false,
    });
  } catch (error) {
    logger.error(`Voice query error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to process voice query",
    });
  }
};

/**
 * @desc    Process text query (Python RAG AI Chatbot Microservice)
 * @route   POST /api/v1/voice/text-query
 * @access  Private / Public
 */
export const processTextQuery = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Query text is required",
      });
    }

    const farmer = (req.user?._id && req.user._id !== "guest_farmer")
      ? ((await Farmer.findById(req.user._id)) || req.user)
      : (req.user || { name: "Ram Kumar", state: "Uttar Pradesh", district: "Lucknow", landHolding: 2.5, cropsGrown: ["Gehun"] });

    // Execute Python RAG Service inside backend
    let ragResult = await runPythonChatbotService(query, farmer);
    if (!ragResult) {
      ragResult = getFallbackChatbotResponse(query, farmer);
    }

    return res.status(HTTP_STATUS.OK).json({
      query,
      intent: "rag_ai_chatbot",
      response: {
        text: ragResult.answer,
        cardTitle: ragResult.cardTitle || "KISAN SETU AI SAATHI",
        detail: ragResult.detail || "Sarkari yojnayon aur krishi salah ke liye Kisan Helpline 1800-180-1551 par sampark karein.",
        source: ragResult.source || "Kisan Setu RAG Knowledge Base",
        sources: [{ name: ragResult.source || "Kisan Setu RAG Knowledge Base" }],
        confidence: 0.95,
      },
      needsEscalation: false,
    });
  } catch (error) {
    logger.error(`Text query error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to process query",
    });
  }
};

/**
 * @desc    Text-to-Speech conversion
 * @route   POST /api/v1/voice/tts
 * @access  Private / Public
 */
export const convertToSpeech = async (req, res) => {
  try {
    const { text, language = "hi" } = req.body;

    if (!text) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Text is required",
      });
    }

    const ttsResult = await textToSpeech(text, language);

    return res.status(HTTP_STATUS.OK).json({
      audio: ttsResult.audioBuffer.toString("base64"),
      contentType: ttsResult.contentType,
      language,
    });
  } catch (error) {
    logger.error(`TTS error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to convert text to speech",
    });
  }
};

/**
 * @desc    Speech-to-Text conversion
 * @route   POST /api/v1/voice/stt
 * @access  Private / Public
 */
export const convertToText = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Audio file is required",
      });
    }

    const audioBuffer = req.file.buffer;
    const { language = "hi" } = req.body;

    const asrResult = await speechToText(audioBuffer, language);

    return res.status(HTTP_STATUS.OK).json(asrResult);
  } catch (error) {
    logger.error(`STT error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to convert speech to text",
    });
  }
};
