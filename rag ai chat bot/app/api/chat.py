import logging

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_chat_service
from app.models.chat import ChatRequest, ChatResponse
from app.services.chat_service import ChatService

logger = logging.getLogger(__name__)
router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse, status_code=status.HTTP_200_OK)
def chat(request: ChatRequest, service: ChatService = Depends(get_chat_service)) -> ChatResponse:
    try:
        return service.chat(request)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid chat request") from exc
    except Exception as exc:
        logger.exception("Unexpected chat failure")
        raise HTTPException(status_code=503, detail="Chat service is temporarily unavailable") from exc
