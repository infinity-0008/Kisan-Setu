import { speechToText, textToSpeech, translateText, detectLanguage } from "../utils/bhashini.js";
import { runPipeline } from "../utils/langgraph.js";
import { HTTP_STATUS } from "../constants.js";
import Farmer from "../models/farmer.model.js";
import logger from "../utils/logger.js";

/**
 * @desc    Process voice query (ASR → LangGraph → TTS)
 * @route   POST /api/v1/voice/query
 * @access  Private
 */
export const processVoiceQuery = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Audio file is required",
      });
    }

    const farmer = await Farmer.findById(req.user._id);
    const audioBuffer = req.file.buffer;

    // Step 1: Speech-to-Text
    const asrResult = await speechToText(audioBuffer, "hi");
    logger.info(`Voice transcribed: ${asrResult.text}`);

    // Step 2: Detect language
    const langResult = detectLanguage(asrResult.text);

    // Step 3: Translate to English if Hindi
    let processedText = asrResult.text;
    if (langResult.language === "hi") {
      const translation = await translateText(asrResult.text, "hi", "en");
      processedText = translation.translatedText;
    }

    // Step 4: Run LangGraph pipeline
    const pipelineResult = await runPipeline(farmer, processedText);

    // Step 5: Translate response back to Hindi
    let responseText = pipelineResult.response.text;
    if (langResult.language === "hi") {
      const translation = await translateText(responseText, "en", "hi");
      responseText = translation.translatedText;
    }

    // Step 6: Text-to-Speech for Hindi response
    const ttsResult = await textToSpeech(responseText, "hi");

    return res.status(HTTP_STATUS.OK).json({
      transcription: asrResult.text,
      processedQuery: processedText,
      intent: pipelineResult.intent,
      response: {
        text: responseText,
        audioUrl: null,
        sources: pipelineResult.response.sources,
        confidence: pipelineResult.response.confidence,
      },
      needsEscalation: pipelineResult.needsEscalation,
    });
  } catch (error) {
    logger.error(`Voice query error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to process voice query",
    });
  }
};

/**
 * @desc    Process text query (LangGraph only)
 * @route   POST /api/v1/voice/text-query
 * @access  Private
 */
export const processTextQuery = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Query text is required",
      });
    }

    const farmer = await Farmer.findById(req.user._id);

    // Run LangGraph pipeline
    const pipelineResult = await runPipeline(farmer, query);

    return res.status(HTTP_STATUS.OK).json({
      query,
      intent: pipelineResult.intent,
      response: pipelineResult.response,
      schemes: pipelineResult.schemes,
      eligibility: pipelineResult.eligibility,
      needsEscalation: pipelineResult.needsEscalation,
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
 * @access  Private
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
 * @access  Private
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
