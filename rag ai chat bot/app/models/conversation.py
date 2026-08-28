from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class ConversationMessage:
    user_id: str
    conversation_id: str
    role: str
    message: str
    timestamp: datetime
