import sys
import site
sys.path.insert(0, site.getusersitepackages())

from fastapi import FastAPI
from pydantic import BaseModel
from llm_service import LLMService

app = FastAPI(title="Kisan Setu Python Chatbot Microservice", version="1.0.0")

class ChatRequest(BaseModel):
    user_id: str = "guest"
    conversation_id: str = "default"
    message: str
    farmer_context: dict = None

@app.post("/chat")
def chat_endpoint(req: ChatRequest):
    res = LLMService.generate_response(req.message, req.farmer_context)
    return {
        "conversation_id": req.conversation_id,
        "cardTitle": res["cardTitle"],
        "answer": res["answer"],
        "detail": res["detail"],
        "source": res["source"]
    }

@app.get("/health")
def health():
    return {"status": "ok", "service": "Python Chatbot"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
