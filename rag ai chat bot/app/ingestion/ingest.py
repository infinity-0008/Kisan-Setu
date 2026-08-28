import logging

from app.core.config import get_settings
from app.ingestion.loader import load_documents
from app.ingestion.splitter import split_documents
from app.vectorstore.chroma import get_vectorstore

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger(__name__)


def main() -> None:
    settings = get_settings()
    settings.documents_directory.mkdir(parents=True, exist_ok=True)
    documents = load_documents(settings.documents_directory)
    if not documents:
        logger.warning("No supported documents found in %s", settings.documents_directory)
        return
    chunks = split_documents(documents, settings.chunk_size, settings.chunk_overlap)
    store = get_vectorstore(settings)
    ids = [chunk.metadata["chunk_id"] for chunk in chunks]
    # Chroma's LangChain adapter upserts supplied IDs. Stable IDs therefore keep
    # re-ingestion from adding duplicate chunks.
    store.add_documents(chunks, ids=ids)
    logger.info("Ingested %d chunks from %d document pages", len(chunks), len(documents))


if __name__ == "__main__":
    main()
