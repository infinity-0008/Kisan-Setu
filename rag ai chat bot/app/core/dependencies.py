from functools import lru_cache

from app.core.config import get_settings
from app.services.chat_service import ChatService
from app.services.llm_service import LLMService
from app.services.memory_service import MemoryService
from app.services.rag_service import RagService
from app.vectorstore.retriever import ChromaRetriever


@lru_cache
def get_chat_service() -> ChatService:
    settings = get_settings()
    return ChatService(
        memory=MemoryService(settings.sqlite_database_path, settings.memory_window),
        rag=RagService(ChromaRetriever(settings)),
        llm=LLMService(settings),
    )
