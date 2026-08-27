import logger from "./logger.js";

const BHASHINI_BASE_URL = "https://bhashini.gov.in/api";

/**
 * Bhashini Voice Integration
 * Handles: Speech-to-Text (ASR), Text-to-Speech (TTS), Translation, Language Detection
 */

/**
 * Speech-to-Text (ASR) - Convert Hindi audio to text
 * @param {Buffer} audioBuffer - audio data
 * @param {string} language - "hi" for Hindi
 * @returns {Object} { text, confidence, language }
 */
export const speechToText = async (audioBuffer, language = "hi") => {
  try {
    // For production: use Bhashini ASR API
    // Example API call:
    // const response = await fetch(`${BHASHINI_BASE_URL}/asr`, {
    //   method: "POST",
    //   headers: { "Content-Type": "audio/wav", "Authorization": `Bearer ${process.env.BHASHINI_API_KEY}` },
    //   body: audioBuffer,
    // });

    // For hackathon: simulate response
    logger.info(`ASR called for language: ${language}, audio size: ${audioBuffer?.length || 0} bytes`);

    return {
      text: "[Audio transcription would appear here]",
      confidence: 0.92,
      language,
    };
  } catch (error) {
    logger.error(`Bhashini ASR error: ${error.message}`);
    throw error;
  }
};

/**
 * Text-to-Speech (TTS) - Convert text to Hindi audio
 * @param {string} text - text to speak
 * @param {string} language - "hi" for Hindi
 * @returns {Object} { audioBuffer, contentType, language }
 */
export const textToSpeech = async (text, language = "hi") => {
  try {
    // For production: use Bhashini TTS API
    // const response = await fetch(`${BHASHINI_BASE_URL}/tts`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.BHASHINI_API_KEY}` },
    //   body: JSON.stringify({ text, language }),
    // });

    // For hackathon: simulate response
    logger.info(`TTS called for language: ${language}, text length: ${text?.length || 0}`);

    return {
      audioBuffer: Buffer.from("simulated-audio-data"),
      contentType: "audio/wav",
      language,
    };
  } catch (error) {
    logger.error(`Bhashini TTS error: ${error.message}`);
    throw error;
  }
};

/**
 * Translate text between languages
 * @param {string} text - text to translate
 * @param {string} sourceLang - source language code (e.g., "en")
 * @param {string} targetLang - target language code (e.g., "hi")
 * @returns {Object} { translatedText, confidence }
 */
export const translateText = async (text, sourceLang = "en", targetLang = "hi") => {
  try {
    // For production: use Bhashini Translation API
    // const response = await fetch(`${BHASHINI_BASE_URL}/translation`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.BHASHINI_API_KEY}` },
    //   body: JSON.stringify({ text, sourceLanguage: sourceLang, targetLanguage: targetLang }),
    // });

    // For hackathon: return text as-is (would be translated in production)
    logger.info(`Translation called: ${sourceLang} -> ${targetLang}`);

    return {
      translatedText: text,
      confidence: 0.95,
      sourceLang,
      targetLang,
    };
  } catch (error) {
    logger.error(`Bhashini translation error: ${error.message}`);
    throw error;
  }
};

/**
 * Auto-detect language of input text
 * @param {string} text - input text
 * @returns {Object} { language, confidence }
 */
export const detectLanguage = (text) => {
  // Check for Devanagari script (Hindi)
  const devanagariPattern = /[\u0900-\u097F]/;
  const hasDevanagari = devanagariPattern.test(text);

  // Check for common Hindi words
  const hindiWords = ["है", "में", "को", "से", "के", "लिए", "एक", "योजना", "किसान"];
  const hasHindiWords = hindiWords.some((word) => text.includes(word));

  const isHindi = hasDevanagari || hasHindiWords;

  return {
    language: isHindi ? "hi" : "en",
    confidence: isHindi ? 0.95 : 0.85,
  };
};

/**
 * Process voice query end-to-end
 * @param {Buffer} audioBuffer - audio data
 * @returns {Object} { originalText, detectedLanguage, translatedText }
 */
export const processVoiceQuery = async (audioBuffer) => {
  try {
    // Step 1: Transcribe audio
    const asrResult = await speechToText(audioBuffer);

    // Step 2: Detect language
    const langResult = detectLanguage(asrResult.text);

    // Step 3: Translate if needed (Hindi -> English for processing)
    let processedText = asrResult.text;
    if (langResult.language === "hi") {
      const translation = await translateText(asrResult.text, "hi", "en");
      processedText = translation.translatedText;
    }

    return {
      originalText: asrResult.text,
      detectedLanguage: langResult.language,
      processedText,
      confidence: asrResult.confidence,
    };
  } catch (error) {
    logger.error(`Voice processing error: ${error.message}`);
    throw error;
  }
};
