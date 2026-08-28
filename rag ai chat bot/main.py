import sys
import site
sys.path.insert(0, site.getusersitepackages())

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.chat import router as chat_router
from app.core.config import get_settings

settings = get_settings()
app = FastAPI(title=settings.app_name, version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(chat_router)


@app.get("/", tags=["system"])
def root() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name}


@app.get("/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok"}
