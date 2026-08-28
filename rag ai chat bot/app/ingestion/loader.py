from pathlib import Path

from langchain_core.documents import Document
from langchain_community.document_loaders import PyPDFLoader, TextLoader


SUPPORTED_SUFFIXES = {".pdf", ".txt", ".md", ".markdown", ".docx"}


def load_documents(directory: Path) -> list[Document]:
    documents: list[Document] = []
    for path in directory.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in SUPPORTED_SUFFIXES:
            continue
        try:
            if path.suffix.lower() == ".pdf":
                loaded = PyPDFLoader(str(path)).load()
            elif path.suffix.lower() == ".docx":
                from langchain_community.document_loaders import Docx2txtLoader
                loaded = Docx2txtLoader(str(path)).load()
            else:
                loaded = TextLoader(str(path), autodetect_encoding=True).load()
        except Exception as exc:
            raise RuntimeError(f"Could not load {path.name}: {exc}") from exc
        for document in loaded:
            document.page_content = "\n".join(line.strip() for line in document.page_content.splitlines() if line.strip())
            document.metadata.update({"source": str(path), "document_name": path.name, "language": "unknown"})
        documents.extend(item for item in loaded if item.page_content)
    return documents
