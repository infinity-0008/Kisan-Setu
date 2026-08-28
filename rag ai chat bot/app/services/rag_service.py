import re
from dataclasses import dataclass

from app.vectorstore.retriever import ChromaRetriever, RetrievedChunk


@dataclass(frozen=True)
class RagResult:
    chunks: list[RetrievedChunk]
    context: str
    sources: str


class RagService:
    def __init__(self, retriever: ChromaRetriever) -> None:
        self.retriever = retriever

    def retrieve(self, query: str) -> RagResult:
        chunks = self.retriever.retrieve(query)
        if not chunks:
            return RagResult(chunks=[], context="", sources="Knowledge base: no relevant document found")
        entries, source_names = [], []
        for index, chunk in enumerate(chunks, start=1):
            metadata = chunk.document.metadata
            name = metadata.get("document_name") or metadata.get("source") or "Agricultural knowledge document"
            source_names.append(str(name))
            entries.append(f"[Source {index}: {name}]\n{chunk.document.page_content}")
        unique_sources = list(dict.fromkeys(source_names))[:3]
        return RagResult(chunks=chunks, context="\n\n".join(entries), sources="; ".join(unique_sources))
