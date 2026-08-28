from functools import lru_cache
from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=BACKEND_DIR / ".env", extra="ignore")

    app_name: str = "Kisan Setu AI Saathi"
    google_api_key: str | None = None
    llm_model: str = "gemini-2.0-flash"
    embedding_model: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    chroma_persist_directory: Path = BACKEND_DIR / "chroma_db"
    documents_directory: Path = BACKEND_DIR / "data" / "documents"
    sqlite_database_path: Path = BACKEND_DIR / "kisan_setu.db"
    top_k: int = Field(default=5, ge=1, le=10)
    chunk_size: int = Field(default=900, ge=200, le=3000)
    chunk_overlap: int = Field(default=150, ge=0, le=500)
    memory_window: int = Field(default=12, ge=2, le=20)
    frontend_url: str = "http://localhost:5173"
    max_message_length: int = Field(default=2000, ge=100, le=10000)

    @field_validator("frontend_url")
    @classmethod
    def trim_url(cls, value: str) -> str:
        return value.rstrip("/")

    @field_validator("chroma_persist_directory", "documents_directory", "sqlite_database_path", mode="after")
    @classmethod
    def resolve_backend_paths(cls, value: Path) -> Path:
        return value if value.is_absolute() else BACKEND_DIR / value

    @property
    def cors_origins(self) -> list[str]:
        return [item.strip() for item in self.frontend_url.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
