from uuid import uuid4
import logging

from app.models.chat import ChatRequest, ChatResponse
from app.services.llm_service import LLMService
from app.services.memory_service import MemoryService
from app.services.rag_service import RagService


class ChatService:
    def __init__(self, memory: MemoryService, rag: RagService, llm: LLMService) -> None:
        self.memory, self.rag, self.llm = memory, rag, llm

    def chat(self, request: ChatRequest) -> ChatResponse:
        conversation_id = request.conversation_id or str(uuid4())
        history = self.memory.get_recent(request.user_id, conversation_id)
        self.memory.add_message(request.user_id, conversation_id, "user", request.message)
        try:
            rag_result = self.rag.retrieve(request.message)
        except Exception:
            logging.getLogger(__name__).exception("RAG retrieval failed")
            # The user-facing response remains safe if Chroma/embeddings are not configured.
            from app.services.rag_service import RagResult
            rag_result = RagResult([], "", "Knowledge base temporarily unavailable")
        generated = self.llm.generate(request.message, history, rag_result)
        self.memory.add_message(request.user_id, conversation_id, "assistant", generated.answer)
        source = rag_result.sources if rag_result.chunks else "AI Saathi (general agricultural guidance)"
        return ChatResponse(conversation_id=conversation_id, cardTitle=generated.card_title, answer=generated.answer, detail=generated.detail, source=source)
