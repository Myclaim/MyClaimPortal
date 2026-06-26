from .conversation_history import ConversationHistoryMemory
from .user_context import UserContextMemory
from .previous_reports import PreviousReportsMemory

class AgentMemory:
    """
    Unified Memory Structure containing Conversation History, User Context,
    and cache of Previous Reports.
    """
    def __init__(self):
        self.history = ConversationHistoryMemory()
        self.context = UserContextMemory()
        self.reports = PreviousReportsMemory()
