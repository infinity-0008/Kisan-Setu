import sys
import site
sys.path.insert(0, site.getusersitepackages())

import os
from pathlib import Path
from dataclasses import dataclass

from config import config

@dataclass
class RagChunk:
    content: str
    source: str

class RagEngine:
    def __init__(self):
        self.documents = []
        self._load_pdf_documents()

    def _load_pdf_documents(self):
        """Load and extract text from official PDFs in data/documents"""
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
        """Search PDF content for keywords"""
        q = query.lower()
        results = []

        for doc in self.documents:
            content = doc["content"]
            source = doc["source"]
            
            paragraphs = content.split("\n\n")
            for p in paragraphs:
                if any(w in p.lower() for w in q.split() if len(w) > 3):
                    results.append(RagChunk(content=p.strip()[:400], source=source))
                    if len(results) >= config.TOP_K:
                        break

        return results

rag_engine = RagEngine()
