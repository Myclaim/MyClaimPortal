from pydantic import BaseModel, Field

class UserProfile(BaseModel):
    user_id: str = "USR-999"
    name: str = "Demo User"
    role: str = "Claims Manager"
    organization: str = "MyClaim Demo Corp"
    permissions: list[str] = ["read:claims", "write:claims", "read:finance", "send:notifications"]

class UserContextMemory:
    """
    Placeholder for storing and retrieving context about the active user/session.
    """
    def __init__(self):
        self.profile: UserProfile = UserProfile()

    def get_profile(self) -> UserProfile:
        return self.profile

    def update_profile(self, **kwargs):
        data = self.profile.model_dump()
        data.update(kwargs)
        self.profile = UserProfile(**data)
