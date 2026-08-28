import { Router } from "express";
import multer from "multer";
import {
  processVoiceQuery,
  processTextQuery,
  convertToSpeech,
  convertToText,
} from "../controllers/voice.controller.js";
import { optionalVerifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Configure multer for audio file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["audio/wav", "audio/webm", "audio/mp3", "audio/mpeg", "audio/ogg"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid audio file type"), false);
    }
  },
});

// Voice and Chat routes support optional authentication for seamless fallback
router.use(optionalVerifyToken);

// Voice query (audio in → text response)
router.post("/query", upload.single("audio"), processVoiceQuery);

// Text query (text in → text response)
router.post("/text-query", processTextQuery);

// Text-to-Speech
router.post("/tts", convertToSpeech);

// Speech-to-Text
router.post("/stt", upload.single("audio"), convertToText);

export default router;
