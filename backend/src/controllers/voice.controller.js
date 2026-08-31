import { speechToText, textToSpeech, translateText, detectLanguage } from "../utils/bhashini.js";
import { HTTP_STATUS } from "../constants.js";
import Farmer from "../models/farmer.model.js";
import logger from "../utils/logger.js";
import { execFile } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import aiChatService from "../services/aiChat.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const chatbotDir = path.resolve(__dirname, "../chatbot");

/**
 * Secondary Python RAG Chatbot Service (with UTF-8 encoding fix)
 */
const runPythonChatbotService = (query, farmerContext) => {
  return new Promise((resolve) => {
    const queryEscaped = String(query || "").replace(/'/g, "\\'").replace(/"/g, '\\"');
    const farmerJson = JSON.stringify(farmerContext || {});

    const pythonCode = `
import sys, site, json
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, site.getusersitepackages())
sys.path.insert(0, r"${chatbotDir}")

from llm_service import LLMService

farmer_ctx = json.loads(r'''${farmerJson}''')
res = LLMService.generate_response(r'''${queryEscaped}''', farmer_ctx)
print(json.dumps(res, ensure_ascii=False))
`;

    execFile(
      "python",
      ["-c", pythonCode],
      {
        timeout: 10000,
        cwd: chatbotDir,
        env: { ...process.env, PYTHONIOENCODING: "utf-8" },
      },
      (error, stdout) => {
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
      }
    );
  });
};

/**
 * Process AI query using unified AI Service (RAG + LLM Model + Offline Agri Base)
 */
const getUnifiedAiResponse = async (query, farmer) => {
  try {
    const aiResult = await aiChatService.generateResponse(query, farmer);
    if (aiResult && aiResult.answer) {
      return aiResult;
    }
  } catch (err) {
    logger.warn(`Node AI Service warning: ${err.message}, attempting Python fallback`);
  }

  // Secondary fallback: Python microservice
  const pyResult = await runPythonChatbotService(query, farmer);
  if (pyResult && pyResult.answer) {
    return pyResult;
  }

  // Final fallback: Comprehensive offline agricultural base
  return aiChatService.getOfflineAgriResponse(query, farmer);
};

/**
 * @desc    Process voice query (ASR → AI Chatbot [RAG + LLM] → TTS)
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
      : (req.user?.name ? req.user : null);
    const audioBuffer = req.file.buffer;

    // Step 1: Speech-to-Text
    const asrResult = await speechToText(audioBuffer, "hi");
    logger.info(`Voice transcribed: ${asrResult.text}`);

    // Step 2: Generate Unified AI / RAG / LLM response
    const aiResult = await getUnifiedAiResponse(asrResult.text, farmer);

    // Step 3: Text-to-Speech for Hindi response
    const ttsResult = await textToSpeech(aiResult.answer, "hi");

    return res.status(HTTP_STATUS.OK).json({
      transcription: asrResult.text,
      processedQuery: asrResult.text,
      intent: "rag_ai_chatbot",
      response: {
        text: aiResult.answer,
        cardTitle: aiResult.cardTitle || "KISAN SETU AI SAATHI",
        detail: aiResult.detail || "",
        source: aiResult.source || "Kisan Setu Krishi Vigyan AI",
        sourceType: aiResult.sourceType || "LLM_MODEL",
        audioUrl: null,
        sources: [{ name: aiResult.source || "Kisan Setu Krishi Vigyan AI" }],
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
 * @desc    Process text query (AI Chatbot [RAG + LLM Model])
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
      : (req.user?.name ? req.user : null);

    // Step 1: Generate AI response with RAG or LLM model diversion
    const aiResult = await getUnifiedAiResponse(query, farmer);

    return res.status(HTTP_STATUS.OK).json({
      query,
      intent: "rag_ai_chatbot",
      response: {
        text: aiResult.answer,
        cardTitle: aiResult.cardTitle || "KISAN SETU AI SAATHI",
        detail: aiResult.detail || "Sarkari yojnayon aur krishi salah ke liye Kisan Helpline 1800-180-1551 par sampark karein.",
        source: aiResult.source || "Kisan Setu Krishi Vigyan AI",
        sourceType: aiResult.sourceType || "LLM_MODEL",
        sources: [{ name: aiResult.source || "Kisan Setu Krishi Vigyan AI" }],
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
