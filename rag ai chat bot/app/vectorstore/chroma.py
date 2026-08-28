import sys
import site
sys.path.insert(0, site.getusersitepackages())

from app.core.config import Settings

try:
    from langchain_chroma import Chroma
except ImportError:
    try:
        from langchain_community.vectorstores import Chroma
    except ImportError:
        Chroma = None

try:
    from langchain_huggingface import HuggingFaceEmbeddings
except ImportError:
    try:
        from langchain_community.embeddings import HuggingFaceEmbeddings
    except ImportError:
        HuggingFaceEmbeddings = None


def get_embeddings(settings: Settings):
    """Create local, quota-free embeddings using Sentence Transformers."""
    if HuggingFaceEmbeddings is None:
        return None
    return HuggingFaceEmbeddings(
        model_name=settings.embedding_model,
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )


def get_vectorstore(settings: Settings):
    if Chroma is None:
        return None
    return Chroma(
        collection_name="kisan_setu_documents_st",
        persist_directory=str(settings.chroma_persist_directory),
        embedding_function=get_embeddings(settings),
    )
