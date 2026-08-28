from langchain_core.documents import Document

from app.services.rag_service import RagService
from app.vectorstore.retriever import RetrievedChunk


class RecordingRetriever:
    def __init__(self): self.query = None
    def retrieve(self, query):
        self.query = query
        return [RetrievedChunk(Document(page_content="Wheat yellowing can be caused by nitrogen deficiency.", metadata={"document_name": "verified-wheat-guide.md"}), 0.9)]


def test_retrieved_document_is_in_context_for_llm_prompt():
    retriever = RecordingRetriever()
    result = RagService(retriever).retrieve("Why are wheat leaves yellow?")
    assert retriever.query == "Why are wheat leaves yellow?"
    assert "nitrogen deficiency" in result.context
    assert result.sources == "verified-wheat-guide.md"
