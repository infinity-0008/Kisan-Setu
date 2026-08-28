from pydantic import BaseModel, Field, field_validator


class ChatRequest(BaseModel):
    user_id: str = Field(min_length=1, max_length=128)
    conversation_id: str | None = Field(default=None, max_length=128)
    message: str = Field(min_length=1, max_length=2000)

    @field_validator("user_id", "conversation_id", "message", mode="before")
    @classmethod
    def strip_strings(cls, value: str | None) -> str | None:
        return value.strip() if isinstance(value, str) else value


class ChatResponse(BaseModel):
    conversation_id: str
    cardTitle: str
    answer: str
    detail: str
    source: str
