import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = BASE_DIR.parent.parent
ENV_FILE = BACKEND_DIR / ".env"

# Load backend/.env if present
if ENV_FILE.exists():
    try:
        with open(ENV_FILE, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip().strip("'\"")
                    if k and not os.environ.get(k):
                        os.environ[k] = v
    except Exception:
        pass

class ChatbotConfig:
    APP_NAME: str = "Kisan Setu RAG AI Chatbot"
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY") or ""
    GOOGLE_API_KEY: str = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or ""
    LLM_MODEL: str = "llama-3.3-70b-versatile"
    DOCUMENTS_DIR: Path = BASE_DIR / "data" / "documents"
    CACHE_FILE: Path = BASE_DIR / "data" / "document_cache.json"
    CHROMA_DIR: Path = BASE_DIR / "chroma_db"
    TOP_K: int = 5

config = ChatbotConfig()
