import sys
import site
sys.path.insert(0, site.getusersitepackages())

import json
import os
from pathlib import Path
from dataclasses import dataclass

from config import config

@dataclass
class RagChunk:
    content: str
    source: str
    score: int = 1

class RagEngine:
    def __init__(self):
        self.documents = []
        self._load_documents()

    def _load_documents(self):
        """Load from pre-extracted cache file or extract from PDFs"""
        if config.CACHE_FILE.exists():
            try:
                with open(config.CACHE_FILE, "r", encoding="utf-8") as f:
                    self.documents = json.load(f)
                    return
            except Exception as e:
                print(f"Error loading document cache: {e}")

        # Fallback to direct PDF parsing
        try:
            from pypdf import PdfReader
            if not config.DOCUMENTS_DIR.exists():
                return

            for pdf_path in config.DOCUMENTS_DIR.glob("*.pdf"):
                try:
                    reader = PdfReader(str(pdf_path))
                    doc_text = ""
                    for page in reader.pages:
                        text = page.extract_text()
                        if text:
                            doc_text += text + "\n"
                    if doc_text.strip():
                        self.documents.append({
                            "source": pdf_path.name,
                            "content": doc_text
                        })
                except Exception as e:
                    print(f"Error loading PDF {pdf_path.name}: {e}")
        except ImportError:
            print("pypdf not installed, skipping PDF reading")

    def search_documents(self, query: str) -> list[RagChunk]:
        """Search document content with scoring and keyword matching"""
        q_tokens = [w for w in query.lower().split() if len(w) >= 3]
        if not q_tokens:
            return []

        results = []
        for doc in self.documents:
            content = doc.get("content", "")
            source = doc.get("source", "PDF Document")
            
            paragraphs = content.split("\n\n")
            for p in paragraphs:
                p_clean = p.strip()
                if len(p_clean) < 40:
                    continue
                p_lower = p_clean.lower()
                matches = sum(1 for w in q_tokens if w in p_lower)
                if matches > 0:
                    results.append(RagChunk(content=p_clean[:600], source=source, score=matches))

        results.sort(key=lambda x: x.score, reverse=True)
        return results[:config.TOP_K]

rag_engine = RagEngine()
