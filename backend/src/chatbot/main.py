import sys
import site
sys.path.insert(0, site.getusersitepackages())

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any

from llm_service import LLMService

app = FastAPI(
    title="Kisan Setu Python AI Chatbot Microservice",
    description="FastAPI Microservice for Agricultural RAG & LLM Model Intelligence",
    version="2.0.0"
)

# Enable CORS for frontend and backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    user_id: Optional[str] = "guest"
    conversation_id: Optional[str] = "default"
    message: str
    query: Optional[str] = None
    farmer_context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    conversation_id: str
    cardTitle: str
    answer: str
    detail: str
    source: str
    sourceType: str = "LLM_MODEL"
    confidence: float = 0.95

@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(req: ChatRequest):
    query_text = req.message or req.query or ""
    if not query_text.strip():
        raise HTTPException(status_code=400, detail="Query message is required")

    res = LLMService.generate_response(query_text, req.farmer_context)
    source_name = res.get("source", "Kisan Setu Krishi Vigyan AI (LLM Model)")
    source_type = "RAG_DOCUMENT" if "RAG" in source_name or "pdf" in source_name.lower() else "LLM_MODEL"

    return ChatResponse(
        conversation_id=req.conversation_id or "default",
        cardTitle=str(res.get("cardTitle") or "Kisan Setu AI Saathi 🌾"),
        answer=str(res.get("answer") or ""),
        detail=str(res.get("detail") or ""),
        source=source_name,
        sourceType=source_type,
        confidence=0.95
    )

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "Kisan Setu FastAPI Chatbot Microservice",
        "version": "2.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("CHATBOT_PORT", "8000"))
    host = os.getenv("CHATBOT_HOST", "127.0.0.1")
    print(f"Starting Kisan Setu FastAPI Microservice on http://{host}:{port}")
    uvicorn.run("main:app", host=host, port=port, reload=False)
