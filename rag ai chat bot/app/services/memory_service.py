import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from app.models.conversation import ConversationMessage


class MemoryService:
    def __init__(self, database_path: Path, window: int) -> None:
        self.database_path = database_path
        self.window = window
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        self._initialize()

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.database_path)
        connection.row_factory = sqlite3.Row
        return connection

    def _initialize(self) -> None:
        with self._connect() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS conversation_messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT NOT NULL,
                    conversation_id TEXT NOT NULL,
                    role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
                    message TEXT NOT NULL,
                    timestamp TEXT NOT NULL
                )
            """)
            conn.execute("""CREATE INDEX IF NOT EXISTS idx_conversation_lookup
                ON conversation_messages(user_id, conversation_id, id)""")

    def add_message(self, user_id: str, conversation_id: str, role: str, message: str) -> None:
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO conversation_messages (user_id, conversation_id, role, message, timestamp) VALUES (?, ?, ?, ?, ?)",
                (user_id, conversation_id, role, message, datetime.now(timezone.utc).isoformat()),
            )

    def get_recent(self, user_id: str, conversation_id: str) -> list[ConversationMessage]:
        with self._connect() as conn:
            rows = conn.execute(
                """SELECT user_id, conversation_id, role, message, timestamp FROM (
                    SELECT * FROM conversation_messages WHERE user_id = ? AND conversation_id = ?
                    ORDER BY id DESC LIMIT ?
                ) ORDER BY id ASC""",
                (user_id, conversation_id, self.window),
            ).fetchall()
        return [ConversationMessage(**{**dict(row), "timestamp": datetime.fromisoformat(row["timestamp"])}) for row in rows]
