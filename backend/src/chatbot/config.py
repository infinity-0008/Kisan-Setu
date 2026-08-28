import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

class ChatbotConfig:
    APP_NAME: str = "Kisan Setu RAG AI Chatbot"
    GOOGLE_API_KEY: str = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or ""
    LLM_MODEL: str = "gemini-2.0-flash"
    DOCUMENTS_DIR: Path = BASE_DIR / "data" / "documents"
    CHROMA_DIR: Path = BASE_DIR / "chroma_db"
    TOP_K: int = 5

config = ChatbotConfig()
