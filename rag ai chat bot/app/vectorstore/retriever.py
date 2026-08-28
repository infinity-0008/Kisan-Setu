import sys
import site
sys.path.insert(0, site.getusersitepackages())

from dataclasses import dataclass
from langchain_core.documents import Document

from app.core.config import Settings
from app.vectorstore.chroma import get_vectorstore


@dataclass(frozen=True)
class RetrievedChunk:
    document: Document
    score: float


class ChromaRetriever:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def retrieve(self, query: str) -> list[RetrievedChunk]:
        try:
            store = get_vectorstore(self.settings)
            if not store:
                return []
            results = store.similarity_search_with_relevance_scores(query, k=self.settings.top_k)
            return [RetrievedChunk(document=document, score=score) for document, score in results if score >= 0.20]
        except Exception:
            return []
