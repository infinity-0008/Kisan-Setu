from fastapi.testclient import TestClient

from app.core.dependencies import get_chat_service
from app.models.chat import ChatResponse
from main import app


class FakeChatService:
    def __init__(self) -> None:
        self.requests = []

    def chat(self, request):
        self.requests.append(request)
        return ChatResponse(
            conversation_id=request.conversation_id or "test-conversation",
            cardTitle="KISAN SETU KA SUJHAAV",
            answer="Grounded response",
            detail="Use verified guidance.",
            source="test-agriculture.md",
        )


def client_with(fake):
    app.dependency_overrides[get_chat_service] = lambda: fake
    return TestClient(app)


def test_health():
    response = TestClient(app).get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_chat_matches_frontend_contract():
    fake = FakeChatService()
    response = client_with(fake).post("/chat", json={"user_id": "test-user", "conversation_id": None, "message": "What is the best fertilizer for wheat?"})
    assert response.status_code == 200
    assert set(response.json()) == {"conversation_id", "cardTitle", "answer", "detail", "source"}
    app.dependency_overrides.clear()


def test_conversation_continuity_passes_existing_id():
    fake = FakeChatService()
    client = client_with(fake)
    first = client.post("/chat", json={"user_id": "test-user", "conversation_id": None, "message": "My wheat leaves are turning yellow."}).json()
    client.post("/chat", json={"user_id": "test-user", "conversation_id": first["conversation_id"], "message": "What should I do about it?"})
    assert fake.requests[-1].conversation_id == "test-conversation"
    app.dependency_overrides.clear()
