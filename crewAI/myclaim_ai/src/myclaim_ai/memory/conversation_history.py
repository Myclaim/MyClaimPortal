from pydantic import BaseModel, Field
from datetime import datetime

class Message(BaseModel):
    role: str = Field(description="Role of the author: user, agent, system")
    content: str = Field(description="Content of the message")
    timestamp: datetime = Field(default_factory=datetime.now)

class ConversationHistoryMemory:
    """
    Placeholder for database-backed Conversation History.
    Maintains list of messages in-memory for the current run session.
    """
    def __init__(self):
        self.history: list[Message] = []

    def add_message(self, role: str, content: str):
        self.history.append(Message(role=role, content=content))

    def get_all(self) -> list[Message]:
        return self.history

    def clear(self):
        self.history.clear()
