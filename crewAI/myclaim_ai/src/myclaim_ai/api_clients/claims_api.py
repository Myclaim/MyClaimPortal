import requests

class ClaimsAPIClient:
    """
    Client for MyClaim Backend Claims API endpoints.
    """
    def __init__(self, base_url: str = "http://localhost:5005/api"):
        self.base_url = base_url

    def get_summary(self) -> dict:
        """
        GET /api/claims/summary
        """
        try:
            response = requests.get(f"{self.base_url}/claims/summary", timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"[API Client Error] claims.get_summary failed: {e}")
            return {"pending_claims": 0, "completed_claims": 0, "rejected_claims": 0}

    def get_pending(self) -> list:
        """
        GET /api/claims/pending
        """
        try:
            response = requests.get(f"{self.base_url}/claims/pending", timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"[API Client Error] claims.get_pending failed: {e}")
            return []
